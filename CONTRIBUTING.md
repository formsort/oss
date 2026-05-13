# Contributing guidelines

## Internal packages of note

[`constants`](/packages/constants)

Constants used across Formsort projects.

[`tsconfig`](/packages/tsconfig)

Shared tsconfig for use across all projects.

## Editing packages

This repo uses [pnpm](https://pnpm.io/) for package management. The pinned version is declared in the `packageManager` field of the root `package.json`; enable [Corepack](https://nodejs.org/api/corepack.html) (or install pnpm directly) to use it.

First, install all the dependencies:

```shell
pnpm install --frozen-lockfile
```

This will install all the dependencies of the sub packages, and also creates symlinks between references within this repository.

Now, you can edit across packages. Commit your changes when you are happy.

## Adding packages

Create a folder in `/packages` and initialize a project there (`pnpm init`).

To allow the project to be public on npm registry, specify the following in the `package.json`:

```json
"publishConfig": {
  "access": "public"
}
```
