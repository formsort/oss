const { execSync } = require('child_process');
execSync(
  [
    'yarn',
    '--no-git-tag-version',
    'version',
    '--new-version',
    process.env.CRAFT_NEW_VERSION,
  ].join(' '),
  { stdio: 'inherit' }
);
