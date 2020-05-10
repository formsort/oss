# @formsort/eslint-config

Shared ESLint configuration for use across all projects

## Usage

1. Make sure that all of the dependencies in this project's `peerDependencies` are installed in your respository.
2. Ensure that your project has a `tsconfig.json` in the root.
3. `npm install --save-dev @formsort/eslint-config`
4. Create a `.eslintrc` in the root with the following content:

```js
module.exports = {
  extends: "@formsort/eslint-config"
};
```

5. For convenience, you may want to add the following scripts to your package.json

```json
{
  "scripts": {
    "format": "eslint -c .eslintrc.js --ext .ts,.tsx src --fix",
    "lint": "eslint -c .eslintrc.js --ext .ts,.tsx src",
  }
}
```
