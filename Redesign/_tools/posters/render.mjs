// Builds the homepage admission posters from real type, in the site's navy theme.
// Edit the copy in POSTERS below, then run from the repo root:
//   PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core node Redesign/_tools/posters/render.mjs [outDir] [slug,slug]
// Uses Montserrat, Inter, the white logo and the graduate photo from the site, and frontend's sharp,
// react and react-icons. Writes <slug>-landscape.webp (1600x1200) and <slug>-portrait.webp (1080x1350).
import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const frontend = join(root, 'frontend');
const require = createRequire(join(frontend, 'package.json'));
const sharp = require('sharp');
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const lu = require('react-icons/lu');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

const outDir = resolve(process.argv[2] || join(frontend, 'src/assets/images/posters'));
const only = process.argv[3] ? process.argv[3].split(',') : null;
const file = (p) => pathToFileURL(join(frontend, p)).href;

const PHONE = '+91 78559 59544';
const SARGIGUDA = 'At – Sargiguda, PO – Sargul, PS – Kantabanji, Dist – Balangir, PIN – 767039';
const GHANTIGUDA = 'At – Ghantiguda, PO – Chalna, PS – Sinapali, Dist – Nuapada';

// Keeps address parts such as "PS – Sinapali" on one line
const nb = (text) => text.replace(/ – /g, '\u00a0–\u2060\u00a0');
const icon = (name, size = 16) => renderToStaticMarkup(createElement(lu[name], { size, 'aria-hidden': true }));
const badge = (text, tone = 'dark', cls = '') => `<span class="badge ${tone} ${cls}">${text}</span>`;
const checks = (items) => `<ul class="checks">${items.map((t) => `<li><i>${icon('LuCheck', 12)}</i><span>${t}</span></li>`).join('')}</ul>`;
const card = (title, body, cls = '') => `<section class="card ${cls}">${title ? `<h3>${title}</h3>` : ''}${body}</section>`;
const pane = (kind, inner) => `<span class="pane ${kind}">${inner}</span>`;
const top = (right = '') => `<header class="top"><img class="logo" src="${file('public/images/brand/swagat-logo-white.webp')}" alt="">${right}</header>`;
const title = (html, sub = '') => `<div class="title"><span class="bar"></span><h1>${html}</h1>${sub ? `<div class="subs">${sub}</div>` : ''}</div>`;
const address = (text, label = 'Address') => `<p class="addr">${icon('LuMapPin', 15)}<span><b>${label}:</b> ${nb(text)}</span></p>`;
const call = (number, label = 'Call', iconName = 'LuPhone') => `<div class="call"><i>${icon(iconName, 18)}</i><span><small>${label}</small><b>${number}</b></span></div>`;
const courseRow = (code, name, kind, iconName) => `<li class="course">${pane(kind, icon(iconName, 24))}<span><b>${code}</b><small>${name}</small></span></li>`;

const POSTERS = {
    'boards-2027-28': (f) => `
        ${top(badge('Session 2027–2028', 'peach'))}
        ${title('Admissions Open', badge('10th &amp; +2 (Secondary &amp; Senior Secondary)', 'lavender'))}
        <div class="row boards">
            ${card('Recognized Boards Offered', `<div class="chips">${['NIOS', 'BOSSE', 'OSBME'].map((b) => `<span class="chip">${b}</span>`).join('')}</div><p class="note">10th / +2 (Arts, Science, Commerce)</p>`)}
            ${card('Key Highlights', checks(['Transfer of Credit (TOC)', 'Flexible Learning &amp; Study', 'Direct Examination Support']))}
        </div>
        <h2 class="label">Streams &amp; Subjects (+2 Level)</h2>
        <div class="streams">
            ${[['Science', 'Physics, Chemistry, Maths, Biology', 'sw-career', 'LuFlaskConical'], ['Commerce', 'Accountancy, Business Studies, Economics', 'sw-result', 'LuCalculator'], ['Arts / Humanities', 'History, Political Science, Economics', 'sw-notice', 'LuLandmark']]
                .map(([n, s, k, i]) => card('', `${pane(k, icon(i, f === 'l' ? 22 : 20))}<div><h3>${n}</h3><p>${s}</p></div>`, 'stream')).join('')}
        </div>
        <footer class="foot">
            <p class="addr">${icon('LuMapPin', 15)}<span><b>Institutes:</b> Sargiguda | Bangomunda | Kantabanji | Titilagarh</span></p>
            ${call(PHONE, 'For Admissions, Call')}
        </footer>`,

    'osbme-april-2027': (f) => `
        ${top(badge('Recognized • Trusted • Successful', 'dark'))}
        <div class="row hero-fee">
            ${title('OSBME<br>Admission Open', `${badge('April Session 2027', 'peach')}<p class="fine">(Odisha State Board of Madrasa Education)</p>`)}
            <div class="fee"><small>Fees Complete</small><b>₹7,000/-</b><span>Only</span><em>No Hidden Charges</em></div>
        </div>
        <div class="row">
            ${card('Secondary (10th)', '<p>Equivalence with NIOS / CHSE / CBSE &amp; HSC</p>', 'tight')}
            ${card('Senior Secondary (12th)', '<p>Equivalence with NIOS / CHSE / CBSE &amp; HSC</p>', 'tight')}
        </div>
        <h2 class="label">Our Key Features</h2>
        <ul class="features">
            ${[['Distance Mode Education', 'Study from Home at Your Own Pace', 'LuLaptop', 'sw-result'], ['Flexible Learning', 'For Regular, Working &amp; Dropout Students', 'LuClock', 'sw-career'], ['Transfer of Credit (TOC)', 'Carry Forward Your Previous Education', 'LuFolderInput', 'sw-notice'], ['Equivalence', 'Equivalence with NIOS, CHSE, CBSE &amp; HSC', 'LuUsers', 'sw-result'], ['Higher Studies', 'Useful for Higher Education &amp; Career', 'LuGraduationCap', 'sw-career'], ['Government Recognized', 'Government of Odisha Recognized Board', 'LuLandmark', 'sw-notice']]
                .map(([t, d, i, k]) => `<li>${pane(k, icon(i, 15))}<span><b>${t}</b><small>${d}</small></span></li>`).join('')}
        </ul>
        <footer class="foot wrap">
            ${call('9403891555', 'Call Now')}
            ${call('7855959544', 'WhatsApp', 'LuMessageCircle')}
            ${address(GHANTIGUDA)}
        </footer>
        <p class="strip">Quality Education <i></i> Brighter Future <i></i> Flexible Time <i></i> Recognized &amp; Trusted</p>`,

    'other-courses': () => `
        ${top(badge('Limited Seats • Apply Now!', 'peach'))}
        ${title('Other Courses')}
        <div class="chips big">${['BBA', 'BCA', 'BSW', 'BHM', 'BTM', 'B.Sc Computer Science', 'B.Sc ITM', 'B.Lib', 'MFC', 'PMIR', 'MSW', 'PGDCA'].map((c) => `<span class="chip">${c}</span>`).join('')}</div>
        <div class="row">
            ${card('Special Support for Dropout &amp; Regular Students', checks(['1–2 Failed Subjects Accepted', 'Previously Passed Subjects Carried Forward', 'No Need to Study All Subjects Again', 'Fast Course Completion']), 'grow')}
            <section class="card scholar">${pane('sw-career', icon('LuAward', 26))}<small>SC / ST / OBC</small><b>State Scholarship Available</b></section>
        </div>
        <footer class="foot wrap">
            ${call('9403891555', 'Call Now')}
            ${call('7855959544', 'WhatsApp', 'LuMessageCircle')}
            ${address(GHANTIGUDA)}
        </footer>`,

    'degrees-2026-27': () => `
        <div class="photo"></div>
        ${top()}
        <div class="narrow">
            ${title('Admission<br>Open', badge('Session 2026–27', 'peach'))}
            <div class="chips big">${['BBA', 'BCA', 'BSW', 'BHM', 'BTM'].map((c) => `<span class="chip">${c}</span>`).join('')}</div>
            ${checks(['Career Oriented Courses', 'Experienced Faculty', 'Placement Assistance'])}
        </div>
        <div class="row push">
            ${card('Main Campus', `<p>${nb('At – Sargiguda, PO – Sargul, PS – Kantabanji, Dist – Balangir, Odisha')}</p>`, 'tight solid')}
            ${card('City Office', `<p>${nb('At/PO – Bangomunda, Dist – Balangir, Odisha')}</p>`, 'tight solid')}
        </div>
        <footer class="foot">
            ${badge('Limited Seats Available', 'lavender')}
            ${call(PHONE)}
        </footer>`,

    'courses': (f) => `
        ${top(badge('Admission Open', 'peach'))}
        ${title('Build your future<br>with us!')}
        <h2 class="label">Courses Offered</h2>
        <ul class="tiles">
            ${[['BBA', 'Bachelor of Business Administration', 'sw-result', 'LuBriefcase'], ['BCA', 'Bachelor of Computer Applications', 'sw-career', 'LuMonitor'], ['BHM', 'Bachelor of Hotel Management', 'sw-notice', 'LuConciergeBell'], ['BTM', 'Bachelor of Tourism Management', 'sw-career', 'LuPlane'], ['MFC', 'Master of Finance &amp; Control', 'sw-result', 'LuChartLine']]
                .map(([c, n, k, i]) => `<li>${pane(k, icon(i, f === 'l' ? 30 : 22))}<b>${c}</b><small>${n}</small></li>`).join('')}
        </ul>
        <footer class="foot">
            <p class="site">www.swagatodisha.com</p>
            ${call(PHONE)}
        </footer>`,

    'bangomunda': () => `
        <div class="photo"></div>
        ${top()}
        <div class="narrow">
            ${title('Shaping<br>Your Future')}
            <ul class="courses">
                ${courseRow('BBA', 'Bachelor of Business Administration', 'sw-result', 'LuBriefcase')}
                ${courseRow('BSW', 'Bachelor of Social Work', 'sw-notice', 'LuUsers')}
                ${courseRow('B.Sc.', 'Computer Science', 'sw-career', 'LuMonitor')}
            </ul>
        </div>
        <footer class="foot push wrap">
            ${address('At/PO – Bangomunda, PIN – 767040, Dist – Balangir, Odisha')}
            ${call(PHONE)}
        </footer>`,

    'osbme-2026-27': () => `
        ${top(badge('Academic Session 2026–27', 'peach'))}
        ${title('Admissions Open', '<p class="fine">Affiliated to: Odisha State Board of Madrasa Education (OSBME)</p>')}
        <div class="row split grow">
            ${card('Courses Offered', checks(['10th (Secondary)', '+2 Arts', '+2 Commerce', '+2 Science']))}
            ${card('Why Choose Us?', checks(['Equivalence with NIOS, CHSE, CBSE &amp; HSC', 'Distance Mode Education Available', 'Study from Home Facility', 'Flexible Learning for Working &amp; Dropout Students', 'Special Academic Support for Dropout &amp; Regular Students']))}
        </div>
        <footer class="foot wrap">
            ${address(SARGIGUDA)}
            ${call(PHONE)}
        </footer>`,
};

const css = `
@font-face{font-family:Montserrat;src:url('${file('public/fonts/montserrat-latin.woff2')}') format('woff2');font-weight:400 700}
@font-face{font-family:Inter;src:url('${file('public/fonts/inter-latin.woff2')}') format('woff2');font-weight:400 800}
@font-face{font-family:Inter;src:url('${file('public/fonts/inter-latin-ext.woff2')}') format('woff2');font-weight:400 800;unicode-range:U+0100-02AF,U+20A0-20CF}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#0E1A3D}
ul{list-style:none}
.poster{position:relative;isolation:isolate;overflow:hidden;width:var(--w);height:var(--h);padding:var(--pad);display:flex;flex-direction:column;gap:var(--gap);background:#0E1A3D;color:#fff;font:500 var(--body)/1.32 Montserrat,sans-serif}
.poster::before{content:'';position:absolute;inset:0;z-index:-1;background-image:
  radial-gradient(55% 70% at 0% 0%,rgb(0 77 152/.55) 0%,transparent 70%),
  radial-gradient(45% 60% at 100% 100%,rgb(165 0 68/.34) 0%,transparent 70%),
  linear-gradient(rgb(255 255 255/.045) 1px,transparent 1px),
  linear-gradient(90deg,rgb(255 255 255/.045) 1px,transparent 1px);
  background-size:auto,auto,40px 40px,40px 40px}
.photo{position:absolute;inset:0;z-index:-2;background:url('${file('src/assets/images/redesign/hero-desktop.webp')}') right top/cover no-repeat}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.logo{height:var(--logo);display:block}
.bar{display:block;width:44px;height:4px;border-radius:9px;margin-bottom:9px;background:linear-gradient(90deg,#3B82D6 0 50%,#D6175F 50% 100%)}
h1{font:700 var(--h1)/1.04 Montserrat,sans-serif;letter-spacing:-.02em}
.subs{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}
.fine{font-size:calc(var(--body) - .5px);color:#C9D3E8}
.label{font:700 var(--h3)/1.2 Inter,sans-serif;letter-spacing:-.01em;margin-bottom:calc(var(--gap) * -.45)}
.badge{display:inline-flex;align-items:center;border-radius:99px;padding:6px 13px;font-weight:600;font-size:calc(var(--body) - .5px);line-height:1.2;white-space:nowrap}
.badge.dark{background:rgb(255 255 255/.1);box-shadow:inset 0 0 0 1px rgb(255 255 255/.22)}
.badge.peach{background:#FFE7C3;color:#0E1A3D}.badge.lavender{background:#D9DFFF;color:#0E1A3D}.badge.blue{background:#D0E9FB;color:#0E1A3D}
.row{display:grid;grid-template-columns:1fr 1fr;gap:var(--gap)}
.row.split{grid-template-columns:1fr 1.55fr}
.row.grow,.grow{flex:1 1 auto;min-height:0}
.push{margin-top:auto}
.card{border-radius:14px;padding:var(--card);background-color:rgb(14 26 61/.72);background-image:radial-gradient(90% 80% at 100% 0%,rgb(0 77 152/.4) 0%,transparent 65%);box-shadow:inset 0 0 0 1.5px rgb(255 255 255/.14)}
.card.solid{background-color:rgb(14 26 61/.9)}
.card h3{font:700 var(--h3)/1.2 Inter,sans-serif;letter-spacing:-.01em;margin-bottom:7px;color:#fff}
.card.tight h3{margin-bottom:3px}
.card p{color:#C9D3E8}
.checks{display:flex;flex-direction:column;gap:var(--li)}
.checks li{display:flex;gap:8px;align-items:flex-start}
.checks i{flex:none;display:grid;place-items:center;width:18px;height:18px;margin-top:1px;border-radius:99px;background:rgb(0 77 152);box-shadow:inset 0 0 0 1px rgb(255 255 255/.25)}
.chips{display:flex;flex-wrap:wrap;gap:7px}
.chip{border-radius:99px;padding:6px 14px;font:700 var(--body)/1.2 Inter,sans-serif;background:rgb(0 77 152/.95);box-shadow:inset 0 0 0 1px rgb(255 255 255/.2)}
.chips.big .chip{font-size:var(--chip);padding:8px 17px}
.note{margin-top:8px}
.pane{flex:none;display:grid;place-items:center;border-radius:10px;width:var(--pane);height:var(--pane);color:rgb(255 255 255/.95);background-color:#787A88}
.sw-result{background-image:radial-gradient(60% 55% at 70% 15%,#F0EAD6 0%,transparent 70%),radial-gradient(70% 60% at 70% 95%,#E5E7EB 0%,transparent 70%)}
.sw-career{background-image:radial-gradient(60% 55% at 60% 15%,#BEC6F5 0%,transparent 70%),radial-gradient(70% 60% at 55% 95%,#EEAA78 0%,transparent 70%),radial-gradient(80% 80% at 10% 40%,#5C466E 0%,transparent 75%)}
.sw-notice{background-image:radial-gradient(60% 55% at 70% 15%,#F3BAC4 0%,transparent 70%),radial-gradient(70% 60% at 30% 95%,#E27868 0%,transparent 70%),radial-gradient(80% 80% at 10% 40%,#5C466E 0%,transparent 75%)}
.streams{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--gap)}
.stream{display:flex;flex-direction:column;gap:8px;padding:var(--card)}
.stream h3{margin-bottom:2px}
.stream p{font-size:calc(var(--body) - .5px)}
.foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:12px}
.foot.push{margin-top:auto}
.foot.wrap{flex-wrap:wrap}
.addr{display:flex;gap:7px;align-items:flex-start;flex:1 1 0;min-width:0;color:#C9D3E8}
.addr svg{flex:none;margin-top:2px;color:#fff}.addr b{color:#fff;font-weight:600}
.call{flex:none;display:inline-flex;align-items:center;gap:10px;padding:7px 18px 7px 8px;border-radius:99px;background:rgb(255 255 255/.16);box-shadow:inset 0 0 0 1px rgb(255 255 255/.45)}
.call i{display:grid;place-items:center;width:36px;height:36px;border-radius:99px;background:rgb(0 77 152)}
.call small{display:block;font-size:11px;line-height:1.15;color:#C9D3E8}
.call b{display:block;font:700 var(--phone)/1.15 Inter,sans-serif;letter-spacing:-.01em;white-space:nowrap}
.site{font:700 var(--h3)/1.2 Inter,sans-serif}
.hero-fee{grid-template-columns:1fr auto;align-items:center}
.fee{display:flex;flex-direction:column;align-items:center;text-align:center;padding:10px 20px;border-radius:14px;background:#FFE7C3;color:#0E1A3D}
.fee small{font-weight:600;font-size:12px}
.fee b{font:800 var(--fee)/1.05 Inter,sans-serif;letter-spacing:-.02em}
.fee span{font-weight:700;font-size:13px}
.fee em{font-style:normal;font-weight:700;font-size:11px;margin-top:4px;padding:2px 9px;border-radius:99px;background:rgb(14 26 61);color:#fff;white-space:nowrap}
.features{display:grid;gap:7px 10px;grid-template-columns:repeat(var(--fcols),1fr)}
.features li{display:flex;gap:8px;align-items:flex-start}
.features .pane{width:30px;height:30px;border-radius:8px}
.features b{display:block;font:700 calc(var(--body) - .5px)/1.2 Inter,sans-serif}
.features small{display:block;font-size:calc(var(--body) - 2px);line-height:1.25;color:#C9D3E8;margin-top:1px}
.strip{display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:calc(var(--body) - 2.5px);font-weight:600;color:#C9D3E8;padding-top:7px;border-top:1px solid rgb(255 255 255/.14);white-space:nowrap}
.strip i{width:4px;height:4px;border-radius:9px;background:#D6175F}
.scholar{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:5px}
.scholar small{font-weight:700;font-size:var(--h3);color:#FFE7C3}
.scholar b{font:700 calc(var(--h3) + 3px)/1.15 Inter,sans-serif;letter-spacing:-.01em}
.tiles{display:grid;gap:var(--gap);grid-template-columns:repeat(var(--tcols),1fr);flex:1 1 auto;min-height:0}
.tiles li{display:flex;flex-direction:column;gap:3px;padding:10px;border-radius:14px;background-color:rgb(14 26 61/.72);background-image:radial-gradient(90% 80% at 100% 0%,rgb(0 77 152/.4) 0%,transparent 65%);box-shadow:inset 0 0 0 1.5px rgb(255 255 255/.14)}
.tiles .pane{width:100%;height:auto;flex:1 1 0;min-height:34px;margin-bottom:5px}
.tiles b{font:700 var(--tile)/1.1 Inter,sans-serif;letter-spacing:-.01em}
.tiles small{font-size:calc(var(--body) - 1px);line-height:1.25;color:#C9D3E8}
.courses{display:flex;flex-direction:column;gap:9px;margin-top:var(--gap)}
.course{display:flex;align-items:center;gap:12px;padding:9px 16px 9px 9px;border-radius:14px;background:rgb(14 26 61/.86);box-shadow:inset 0 0 0 1.5px rgb(255 255 255/.14)}
.course b{display:block;font:700 var(--tile)/1.1 Inter,sans-serif;letter-spacing:-.01em}
.course small{display:block;color:#C9D3E8;font-size:var(--body)}
.narrow{display:flex;flex-direction:column;gap:var(--gap);max-width:var(--narrow)}
.narrow .checks{margin-top:2px}

.landscape{--w:800px;--h:600px;--pad:30px;--gap:13px;--body:14px;--h1:50px;--h3:17px;--li:7px;--card:14px;--logo:50px;--chip:17px;--pane:44px;--phone:20px;--fee:38px;--fcols:3;--tcols:5;--tile:21px;--narrow:430px}
.landscape .streams .stream{flex-direction:row;align-items:flex-start;gap:10px}
.landscape .tiles .pane{min-height:90px}
.landscape .tiles small{min-height:3.75em}
.portrait.bangomunda .photo{background-size:auto 34%}
.portrait.bangomunda .photo::after{display:none}
.portrait{--w:540px;--h:675px;--pad:26px;--gap:12px;--body:13.5px;--h1:44px;--h3:16px;--li:6px;--card:13px;--logo:44px;--chip:15px;--pane:42px;--phone:19px;--fee:32px;--fcols:2;--tcols:2;--tile:20px;--narrow:100%}
.portrait .row.split{grid-template-columns:1fr}
.portrait .row.boards{grid-template-columns:1fr 1.15fr}
.portrait .streams{grid-template-columns:1fr}
.portrait .streams .stream{flex-direction:row;align-items:center;padding:8px 12px;gap:10px}
.portrait .streams .pane{width:34px;height:34px}
.portrait .tiles{grid-template-columns:1fr;gap:7px;flex:0 0 auto}
.portrait .tiles li{display:grid;grid-template-columns:40px 64px 1fr;gap:10px;align-items:center;padding:7px 12px 7px 7px}
.portrait .tiles .pane{width:40px;height:40px;min-height:0;margin:0;flex:none}
.portrait .photo{background-size:auto 60%;background-position:right top}
.portrait .photo::after{content:'';position:absolute;inset:50% 0 0;background:linear-gradient(transparent,#0E1A3D 22%)}
.portrait .foot{gap:10px}
.portrait.osbme-april-2027{--h1:33px;--gap:9px;--card:10px;--body:13px;--pad:22px;--logo:40px}
.portrait.osbme-april-2027 .subs{margin-top:6px}
.portrait.osbme-april-2027 .features{gap:5px 10px}
.portrait.osbme-april-2027 .card.tight p{font-size:12px}
.portrait.osbme-april-2027 .call{padding-block:4px}
.portrait.osbme-april-2027 .call i{width:30px;height:30px}
.portrait.osbme-april-2027 .strip{padding-top:5px;font-size:10.5px}
.portrait .foot.wrap .addr{flex:1 1 100%;order:3}
.portrait .foot.wrap .call{flex:1 1 0;padding-right:10px}
`;

const browser = await chromium.launch({ channel: 'chrome' });
const tmp = mkdtempSync(join(tmpdir(), 'posters-'));
mkdirSync(outDir, { recursive: true });
let failures = 0;

for (const [slug, build] of Object.entries(POSTERS)) {
    if (only && !only.includes(slug)) continue;
    for (const [format, f, width, height] of [['landscape', 'l', 800, 600], ['portrait', 'p', 540, 675]]) {
        const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
        const html = join(tmp, `${slug}-${format}.html`);
        writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>${css}</style><main class="poster ${format} ${slug}">${build(f)}</main>`);
        await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);

        // Every element has to sit inside the poster, and no text may overflow its box
        const problems = await page.evaluate(() => {
            const poster = document.querySelector('.poster');
            const box = poster.getBoundingClientRect();
            const out = [];
            for (const el of poster.querySelectorAll('*')) {
                if (el.classList.contains('photo') || el.closest('svg')) continue;
                const r = el.getBoundingClientRect();
                if (r.bottom > box.bottom - 6 || r.right > box.right - 6 || r.left < box.left + 6 || r.top < box.top + 6) out.push(`outside: ${el.tagName}.${el.className} ${el.textContent.slice(0, 30)}`);
                if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== 'inline') out.push(`clipped: ${el.tagName}.${el.className}`);
            }
            return out;
        });
        if (problems.length) { failures += 1; console.log(`FAIL ${slug}-${format}\n  ${problems.slice(0, 6).join('\n  ')}`); }

        const png = await page.screenshot({ type: 'png' });
        const target = join(outDir, `${slug}-${format}.webp`);
        const info = await sharp(png).webp({ quality: 84, effort: 6, smartSubsample: true }).toFile(target);
        console.log(`${slug}-${format}.webp ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)}KB`);
        await page.close();
    }
}

await browser.close();
rmSync(tmp, { recursive: true, force: true });
if (failures) { console.log(`${failures} poster(s) have layout problems`); process.exitCode = 1; }
