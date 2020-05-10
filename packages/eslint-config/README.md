# @formsort/eslint-config

Shared ESLint configuration for use across all projects

## Usage

1. Make sure that all of the dependencies in this project's `peerDependencies` are installed in your respository.
2. Ensure that your project has a `tsconfig.json` in the root.
3. `npm install --save-dev @formsort/eslint-config`
4. Create a `.eslintrc` in the root with the following content:

```
module.exports = {
  extends: "@formsort/eslint-config"
};
```