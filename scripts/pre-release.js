const { execSync } = require('child_process');
console.log(
  execSync(
    [
      'yarn',
      '--no-git-tag-version',
      'version',
      '--new-version',
      process.env.CRAFT_NEW_VERSION,
    ].join(' ')
  ).toString()
);
