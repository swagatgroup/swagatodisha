// Usage: node shoot.mjs <baseUrl> <outDir>
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const [base, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });

const only = process.argv[4] ? process.argv[4].split(',') : null;
const routes = [
  ['gateway', '/'],
  ['home', '/', 'enter'],
  ['about', '/about'],
  ['gallery', '/gallery'],
  ['contact', '/contact'],
  ['send-message', '/send-message'],
  ['terms', '/terms-and-conditions'],
  ['privacy', '/privacy-policy'],
  ['school-ghantiguda', '/SwagatPublicSchool_Ghantiguda'],
  ['school-sargiguda', '/SwagatPublicSchool_Sargiguda'],
  ['school-lakhna', '/SwagatPublicSchool_Lakhna'],
  ['login-portal', '/login-portal'],
  ['login-student', '/login/student'],
  ['login-agent', '/login/agent'],
  ['login-staff', '/login/staff'],
  ['register', '/register'],
];
const widths = [[1440, 900], [390, 844]];

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true });
const log = [];
for (const [w, h] of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: 'light' });
  for (const [name, path, action] of routes) {
    if (only && !only.includes(name)) continue;
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
    try {
      await page.goto(base + path, { waitUntil: 'load', timeout: 45000 });
      await page.waitForTimeout(2500);
      if (action === 'enter') {
        await page.locator('h2', { hasText: 'Swagat Odisha' }).first().click();
        await page.waitForTimeout(3000);
      }
      // scroll through to trigger lazy content / scroll animations
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 200)); }
      });
      await page.waitForTimeout(4000);
      if (name === 'gateway') {
        const sh = await page.evaluate(() => document.querySelector('.fixed.inset-0')?.scrollHeight || 0);
        if (sh > h) await page.setViewportSize({ width: w, height: sh });
      }
      await page.screenshot({ path: `${out}/${name}@${w}.png`, fullPage: true });
      log.push(`${name}@${w}: ok final=${new URL(page.url()).pathname}${errors.length ? ' errors=' + errors.join(' | ') : ''}`);
    } catch (e) {
      log.push(`${name}@${w}: FAIL ${String(e.message).split('\n')[0]}`);
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
fs.appendFileSync(`${out}/_log.txt`, log.join('\n') + '\n');
console.log(log.join('\n'));
