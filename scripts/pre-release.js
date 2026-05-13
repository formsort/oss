const { execSync } = require('child_process');
execSync(
  [
    'npm',
    'version',
    '--no-git-tag-version',
    process.env.CRAFT_NEW_VERSION,
  ].join(' '),
  { stdio: 'inherit' }
);
