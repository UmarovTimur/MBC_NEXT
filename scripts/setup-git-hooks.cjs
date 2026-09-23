// Points git at the tracked hooks in .githooks (pre-commit runs tests + typecheck).
// Runs from postinstall: a no-op in CI or outside a git checkout, and never fails install.
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

if (process.env.CI || !fs.existsSync(path.join(process.cwd(), '.git'))) {
  process.exit(0)
}

try {
  execSync('git config core.hooksPath .githooks', { stdio: 'ignore' })
} catch {
  // Hooks are a convenience; a missing git binary must not break yarn install.
}
