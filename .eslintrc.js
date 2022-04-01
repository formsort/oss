module.exports = {
  extends: '@formsort/eslint-config',
  parserOptions: {
    project: ['./tsconfig.json', 'packages/**/tsconfig.json'],
    sourceType: 'module',
  },
  ignorePatterns: ['packages/**/lib/**/*', 'packages/**/dist/**/*'],
};
