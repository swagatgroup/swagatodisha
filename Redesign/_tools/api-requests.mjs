// Records which API requests each public route makes (read-only browsing).
// Usage: node api-requests.mjs <baseUrl> <out.json>
// Blocks every non-GET API request so nothing can be written while recording.
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const [base, out] = process.argv.slice(2);
const routes = [
  '/', '/about', '/gallery', '/contact', '/send-message', '/terms-and-conditions', '/privacy-policy',
  '/SwagatPublicSchool_Ghantiguda', '/SwagatPublicSchool_Sargiguda', '/SwagatPublicSchool_Lakhna',
  '/login-portal', '/login/student', '/login/agent', '/login/staff', '/register',
];
const widths = [1440, 390];

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const result = {};
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.route('**/api/**', route => (route.request().method() === 'GET' ? route.continue() : route.abort()));
  for (const path of routes) {
    const page = await ctx.newPage();
    const seen = [];
    page.on('request', r => {
      const u = new URL(r.url());
      if (u.pathname.startsWith('/api/')) seen.push(`${r.method()} ${u.host}${u.pathname}${u.search}`);
    });
    await page.goto(base + path, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(2500);
    // Pre-redesign builds show the entry screen on "/": enter the main site
    const gate = page.locator('h2', { hasText: 'Swagat Odisha' }).first();
    if (path === '/' && await gate.isVisible().catch(() => false) && await page.getByText('Choose your destination').isVisible().catch(() => false)) {
      await gate.click();
      await page.waitForTimeout(2500);
    }
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); }
    });
    await page.waitForTimeout(3000);
    result[`${path} @${w}`] = [...new Set(seen)].sort();
    await page.close();
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
