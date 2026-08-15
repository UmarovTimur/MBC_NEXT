#!/usr/bin/env node
// Headless browser driver for the MBC admin (Payload CMS) app.
//
// Usage:
//   node driver.mjs [url] [outfile.png]
//   node driver.mjs http://localhost:8001/admin ./admin.png
//
// It launches the system Google Chrome via Playwright's `channel: 'chrome'`,
// navigates to the URL, waits for the page to settle, writes a full-page
// screenshot, and prints a JSON report (HTTP status, <title>, console errors,
// and a text preview) so an agent can tell whether the app actually rendered.
//
// Playwright itself is loaded from the Debian system package at
// /usr/share/nodejs/playwright (override with PLAYWRIGHT_PATH). We do NOT rely
// on a project-local `playwright` dependency — there isn't one.

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/usr/share/nodejs/playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:8001/admin';
const out = process.argv[3] || path.join(here, 'admin.png');

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const consoleErrors = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => consoleErrors.push(String(e)));

let status = 'n/a';
try {
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  status = resp ? resp.status() : 'no-response';
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  // Payload/Next render client-side; the first hit also triggers on-demand
  // compilation. Wait until the body actually has text before shooting.
  await page
    .waitForFunction(() => document.body && document.body.innerText.trim().length > 0, { timeout: 45000 })
    .catch(() => {});
  await page.waitForTimeout(1500);
} catch (e) {
  console.error('navigation error:', e.message);
}

await page.screenshot({ path: out, fullPage: true });
const title = await page.title().catch(() => '');
const bodyPreview = (await page.locator('body').innerText().catch(() => ''))
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, 300);

console.log(JSON.stringify({ url, status, title, out, consoleErrors: consoleErrors.slice(0, 5), bodyPreview }, null, 2));

// Playwright 1.38 + Chrome 149 throws an assertion during teardown; the
// screenshot is already written by now, so swallow it and exit clean.
process.on('uncaughtException', () => process.exit(0));
try { await browser.close(); } catch { /* ignore teardown assertion */ }
process.exit(0);
