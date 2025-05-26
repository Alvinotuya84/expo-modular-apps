

const path = require('path');
const { execSync } = require('child_process');

// Check if we're in a monorepo root
const rootDir = process.cwd();
const packageJsonPath = path.join(rootDir, 'package.json');

try {
  const packageJson = require(packageJsonPath);
  if (!packageJson.workspaces) {
    console.error('❌ This command must be run from the monorepo root directory');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ No package.json found. Make sure you\'re in the monorepo root');
  process.exit(1);
}

// Load the CLI
require('../src/index.js');