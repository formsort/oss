const { execSync } = require('child_process');

console.log(
  execSync(
    [
      'yarn',
      '--no-git-tag-version',
      'version',
      '--preminor',
      '--preid=dev',
    ].join(' ')
  ).toString()
);

console.log(
  execSync(
    [
      'git diff --quiet',
      '||',
      'git commit -anm',
      '\'meta: Bump new development version\\n\\n#skip-changelog\'',
      '&&',
      'git pull --rebase',
      '&&',
      'git push',
    ].join(' ')
  ).toString()
);
