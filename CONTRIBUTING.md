# Contributing guidelines

## Internal packages of note

[`constants`](/packages/constants)

Constants used across Formsort projects.

[`eslint-config`](/packages/eslint-config)

Shared ESLint configuration for use across all projects.

[`tsconfig`](/packages/tsconfig)

Shared tsconfig for use across all projects.

## Editing packages

First, install all the dependencies (using [Volta](https://volta.sh/) is highly recommended):

```shell
yarn install --frozen-lockfile
```

This will install all the dependencies of the sub packages, and also creates symlinks between references within this repository.

Now, you can edit across packages. Commit your changes when you are happy.

## Adding packages

Create a folder in `/packages` and initialize a project there (`yarn init`).

To allow the project to be public on npm registry, specify the following in the `package.json`:

```json
"publishConfig": {
  "access": "public"
}
```
