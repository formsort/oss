---
name: dependency-bump
description: Use when asked to update a dependency, fix Dependabot alerts, or clean up open Dependabot PRs in this pnpm monorepo. Groups the alerts and PRs by package, bumps one package across the workspace in one PR, checks release notes, recent issues and our own usage for breaking changes, and closes the Dependabot PRs it replaces.
---

# Dependency bump

This repo is one pnpm workspace with one `pnpm-lock.yaml` (`packages/*` and `packages/*/examples/*`).
Dependabot opens a new PR for each release of a package, so one package can have three open PRs
(`webpack-dev-server` 5.2.4, 5.2.5, 5.2.6). Replace them with one PR per package. A patch or minor
version can still break us, so research the change before you touch the lock.

## 1. Inventory

Group the open alerts and Dependabot PRs by package:

```bash
gh api 'repos/formsort/oss/dependabot/alerts?state=open&per_page=100' --paginate \
  -q '.[] | [.dependency.package.name, .dependency.relationship, .dependency.scope,
             .security_advisory.severity, .security_vulnerability.first_patched_version.identifier] | @tsv'
gh pr list --author app/dependabot --state open --limit 100 --json number,title,headRefName
```

Then find every copy of the package and who pulls it in:

```bash
pnpm why -r <pkg>                         # every workspace and the chain to the package
rg -n "^  '?<pkg>@" pnpm-lock.yaml        # every locked version (scoped names are quoted)
```

Note for each workspace if the package is direct or transitive, and `dependencies` or
`devDependencies`. Note also if that workspace is published (`packages/<name>`, released with craft) or
an example (`packages/*/examples/*`, not published and not built by CI).

When the user asks for many packages, do one package at a time, low-risk ones first (dev-only tools,
patch versions). Research for several packages can run in parallel subagents; lock edits and PRs
can't, because they all touch `pnpm-lock.yaml`.

## 2. Pick the version

Take the lowest version that fixes every open alert for the package. Take a newer one only if it
fixes a regression in that version (check its advisories and release notes), or if it is the newest
open Dependabot PR and has no known problems. Stay on the current major unless the user asks.

## 3. Breaking-change research

Do this before you edit anything. Read from the current locked version to the target:

- **Release notes and changelog:** removed or renamed APIs, changed defaults, dropped Node versions
  (we run Node from `engines.node` in the root `package.json`), ESM-only releases, behaviour changes
  listed as "fixes".
- **Issues opened since the target was released:** `gh search issues --repo <owner>/<repo>
--created '>=<release date>' --sort created` and the issues the release notes link. Look for
  regressions, deprecated releases and a quick follow-up patch.
- **New requirements:** `npm view <pkg>@<version> dependencies peerDependencies engines`. A new
  dependency, a higher peer range, or a higher `engines.node` can move other packages in the lock or
  break the install.
- **Our usage:** `rg` for the package's imports and the APIs the notes mention, in `src/` and in the
  build config (`tsconfig*.json`, `vite.config.*`, `webpack.config.*`, `jest.config.*`).

Write a short risk note: what changed, what of it we use, open regressions. If a breaking change hits
our code, or a regression is still open, stop and report to the user before you change anything.

## 4. Edit the lock

Change only the package and the requirements it needs. A full `pnpm update` or a deleted lock moves
dozens of unrelated packages and hides the real change.

- **Direct dependency:** `pnpm --filter <workspace> up <pkg>@^<version>` for each workspace that
  lists it. Keep the range style the manifest already uses. `pnpm why -r` from step 1 lists the
  workspaces.
- **Transitive dependency, fix inside the parent's range:** `pnpm up -r --depth Infinity <pkg>`. This
  edits only the lock and takes the newest version the parent's range allows; pnpm silently ignores
  an exact `<pkg>@<version>` for a transitive dependency. If the newest in range is too far, pin it
  with a scoped override instead.
- **Transitive dependency, fix outside the parent's range:** first try a parent version that allows
  the fix. If none exists, add an override in the root `package.json` under `pnpm.overrides`, scoped
  as tightly as you can: `"<pkg>@<vulnerable range>": "<version>"` or `"<parent>><pkg>": "<version>"`.
  Then run `pnpm install`. Say in the PR why the override is needed and when it can go. Don't widen
  the existing blunt overrides (`tslib`, `json5`, `@babel/core`, `esbuild`) without a reason.
- After any edit, `git diff --stat pnpm-lock.yaml` and read the diff: only the package, its new
  requirements, and the `importers` specifiers you changed should move.

Compare the new version and `integrity` in the lock with the Dependabot PR for the same version when
one exists (`gh pr diff <n>`). Its diff can also move other packages, so compare only the package's
own entries.

### Published packages

A lock change does not reach people who install our packages from npm; they resolve ranges
themselves. If the package is in `dependencies` (not `devDependencies`) of a published package and
the alert affects them, the range in that `package.json` must exclude the bad version, and the
package needs a release (`release/<pkg>/<version>` branch, craft). Raise the range in the bump PR and
tell the user a release is needed; don't start the release yourself. Dev-only and example
dependencies need only the lock.

## 5. Verify

- `pnpm install --frozen-lockfile --prod=false` must pass, as in `.github/actions/setup-node`.
- `pnpm why -r <pkg>` shows only the new version (or explains every old copy that stays).
- Run what CI runs, in its order:

  ```bash
  pnpm --filter @formsort/constants run build
  pnpm --filter @formsort/embed-messaging-manager run build
  pnpm --filter @formsort/web-embed-api run build
  pnpm build && pnpm lint && pnpm test && pnpm -r run pack
  ```

- CI does not build the examples (`scripts/build.js` skips them and their `test` is `echo pass`). If
  the package is used by an example, run `pnpm --filter <example> run build` for each one, and run
  `check:types` where the example has it.
- For a formatter or linter (`oxfmt`, `oxlint`), run the old and the new version and report how many
  more files it would change. Don't reformat code in the bump PR.
- If a check fails, run it on `master` too. A failure that is also on `master` is not yours; name it
  in the PR.

## 6. Open the PR

- Branch from the latest `master`: `deps/<pkg>-<version>`. Title in Dependabot's style:
  `build(deps): bump <pkg> to <version>`, or `build(deps-dev): ...` when it is dev-only everywhere.
- Labels: `dependencies`, `javascript`.
- Body: the alerts it closes and the Dependabot PRs it replaces; what changed (every `package.json`,
  every other package that moved in the lock and why, any override); the risk note from step 3; the
  checks from step 5; and what was not verified (for example, an example that was built but not run
  in a browser). Say if a published package needs a release.

## 7. Close the Dependabot PRs it replaces

Closing PRs is an outward action. Show the list and ask the user first, unless they already asked
you to close them. Close only PRs for the same package at a version this PR reaches or passes:

```bash
gh pr close <n> --delete-branch --comment "Replaced by #<new PR>, which bumps <pkg> to <version>."
```

The alerts close by themselves when the PR merges to `master`. Dependabot reopens a PR if the lock
still has the old version; if one comes back, a copy was missed (check `pnpm why -r <pkg>`).

## Checklist

- [ ] All alerts and Dependabot PRs for the package found; `pnpm why -r` checked
- [ ] Release notes, recent issues, new requirements and our usage checked; risk note written
- [ ] Only the package and its needed requirements moved in the lock; overrides explained
- [ ] Frozen install, CI steps and affected example builds pass; failures compared with `master`
- [ ] Published packages that need a range change and a release named in the PR
- [ ] PR has labels, evidence and what was not verified
- [ ] Replaced Dependabot PRs closed after the user agreed
