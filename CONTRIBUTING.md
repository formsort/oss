# Contributing guidelines

## Internal packages of note

[`constants`](/packages/constants)

Constants used across Formsort projects.

[`eslint-config`](/packages/eslint-config)

Shared ESLint configuration for use across all projects.

[`tsconfig`](/packages/tsconfig)

Shared tsconfig for use across all projects.

# Editing packages

First, bootstrap Lerna. In the root, run:

```
npm install
npm run bootstrap
```

This will install all the dependencies of the sub packages, and also creates symlinks between references within this repository.

Now, you can edit across packages. Commit your changes when you are happy.

To publish, run:

```
lerna publish
```

This will guide you through choosing a new version of each of the changed packages, and update dependency versions within the package.jsons and publish to npm when done.

# Adding packages

Create a folder in `/packages` and initialize an npm project there (`npm init`).

To allow the project to be public on NPM, specify the following in the `package.json`:

```
"publishConfig": {
  "access": "public"
}
```
