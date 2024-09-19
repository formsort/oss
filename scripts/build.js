const { execSync } = require('child_process');

const workspaces = JSON.parse(
  execSync('yarn workspaces info --json').toString()
);

const workspaceNames = Object.keys(workspaces);

for (const workspaceName of workspaceNames) {
  // don't build example workspaces
  if (!workspaceName.includes('example-')) {
    // run build for this workspace
    execSync(`yarn workspace ${workspaceName} build`, { stdio: 'inherit' });
  }
}
