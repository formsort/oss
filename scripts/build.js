const { execSync } = require('child_process');

execSync('pnpm --filter "!./packages/*/examples/**" --recursive run build', {
  stdio: 'inherit',
});
