module.exports = {
  root: true,
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
  },
  ignorePatterns: ['packages/**/lib/**/*', 'packages/**/dist/**/*'],
  overrides: [
    {
      files: ['packages/**/*.ts', 'packages/**/*.tsx'],
      env: {
        browser: true,
      },
      extends: '@formsort/eslint-config',
      parserOptions: {
        project: ['**/tsconfig.json'],
        sourceType: 'module',
      },
    },
  ],
};
