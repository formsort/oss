# [Formsort](https://formsort.com) Open Source Monorepo

## Packages

[`constants`](/packages/constants)

Constants that are used across Formsort products and repos.

[`custom-question-api`](/packages/custom-question-api)

Helpers for implementing custom questions in Formsort.

[`eslint-config`](/packages/eslint-config)

ESLint config used by all projects in this repo and other Formsort repos.

[`react-embed`](/packages/react-embed)

React component to load formsort flows.

[`tsconfig`](/package/tsconfig)

TypeScript configuration used by all projects in this repo and other Formsort repos.

[`web-embed-api`](/packages/web-embed-api)

Embed flows within other webpages, allowing communication between the embed and the parent page.

## Publishing

This repo is published using [Craft](https://github.com/getsentry/craft) via GitHub Actions.

To release a new version of a package, follow these steps:

1. Decide on the version of the package you are going to release, following semver (`MAJOR.MINOR.PATCH`):
   - Bump `PATCH` version if you are only fixing minor bugs w/o new features or breaking changes
   - Bump `MINOR` version if you are adding new features
   - Bump `MAJOR` version if you have _any_ backwards incompatible changes
1. Add `#skip-changelog` to PR bodies you want to omit from the automated changelogs
1. Create some [milestones](https://github.com/formsort/oss/milestones) and associate relevant PRs with them
   to group PRs under higher-level initiatives. The milestone title and description will end up in the automated
   changelogs along with a list of PR numbers (but not the commit logs).
   See [a Craft release](https://github.com/getsentry/craft/releases/tag/0.25.0) itself for an example.
1. Trigger the release through [GitHub Actions](https://github.com/formsort/oss/actions/workflows/release.yml):
   - Run `gh workflow run release.yml -f package=<package> -f version=<version>`
     if you have [`gh`](https://cli.github.com/) installed
   - Or visit the [actions page]((https://github.com/formsort/oss/actions/workflows/release.yml)),
     click on the `Run workflow` button on the top right corner, fill in the values and _ship this sucker_.
1. Triggering this action will send an approval request to the [Security guild](https://github.com/orgs/formsort/teams/security-guild)
1. Once the publish request is approved, Craft will run its magic, creating a release branch with automated changelogs
1. After the build passes on the release branch it will publish to `npm` and [GitHub releases](https://github.com/formsort/oss/releases)

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for an overview of how to contribute to these packages.