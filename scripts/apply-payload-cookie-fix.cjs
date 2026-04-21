const fs = require('fs')
const path = require('path')

const targetFile = path.join(
  process.cwd(),
  'node_modules',
  'payload',
  'dist',
  'auth',
  'extractJWT.js',
)

const oldBlock = `        // No Origin with csrf configured — fall back to Sec-Fetch-Site
        const secFetchSite = headers.get('Sec-Fetch-Site');
        // Allow same-origin, same-site, and direct navigations (none)
        if (secFetchSite === 'same-origin' || secFetchSite === 'same-site' || secFetchSite === 'none') {
            return cookieToken;
        }
        // Reject cross-site requests and missing header (non-browser clients)
        return null;`

const newBlock = `        // No Origin with csrf configured — fall back to Sec-Fetch-Site.
        // Some same-origin requests in production arrive without this header,
        // so accept the cookie and let session validation do the final auth check.
        const secFetchSite = headers.get('Sec-Fetch-Site');
        if (!secFetchSite) {
            return cookieToken;
        }
        // Allow same-origin, same-site, and direct navigations (none)
        if (secFetchSite === 'same-origin' || secFetchSite === 'same-site' || secFetchSite === 'none') {
            return cookieToken;
        }
        // Reject explicit cross-site requests.
        return null;`

if (!fs.existsSync(targetFile)) {
  process.exit(0)
}

const current = fs.readFileSync(targetFile, 'utf8')

if (current.includes(newBlock)) {
  console.log('[postinstall] payload cookie fix already applied')
  process.exit(0)
}

if (!current.includes(oldBlock)) {
  console.warn(
    '[postinstall] payload cookie fix skipped: target block not found',
  )
  process.exit(0)
}

fs.writeFileSync(targetFile, current.replace(oldBlock, newBlock))
console.log('[postinstall] applied payload cookie fix')
