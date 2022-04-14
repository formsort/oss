# @formsort/eslint-config

Shared ESLint configuration for use across all projects

## Usage

1. Install this project and its `peerDependencies` in your respository:

```bash
yarn add --dev @formsort/eslint-config eslint-plugin-prefer-arrow eslint-plugin-jsdoc@24 eslint-plugin-prettier eslint-config-prettier eslint-plugin-import prettier eslint-plugin-react @typescript-eslint/eslint-plugin
```
2. Ensure that your project has a `tsconfig.json` in the root. If you want, use the [formsort common tsconfig](../tsconfig).
3. Create a `.eslintrc.js` in the root with the following content:

```js
module.exports = {
  extends: "@formsort/eslint-config"
};
```

4. For convenience, you may want to add the following scripts to your package.json

```json
{
  "scripts": {
    "format": "eslint --ext .ts,.tsx src --fix",
    "lint": "eslint --ext .ts,.tsx src"
  }
}
```
