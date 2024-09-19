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
  ignorePatterns: ['packages/**/lib/**/*', 'packages/**/dist/**/*', 'packages/**/umd/**/*'],
  overrides: [
    {
      files: ['packages/**/*.ts', 'packages/**/*.tsx'],
      env: {
        browser: true,
      },
      extends: '@formsort/eslint-config',
      rules: {
        'react/no-unknown-property': ['error', { ignore: ['css'] }],
        'react/react-in-jsx-scope': 'off', // not necessary since React 18
      },
      parserOptions: {
        project: ['**/tsconfig.json'],
        sourceType: 'module',
      },
    },
  ],
};
