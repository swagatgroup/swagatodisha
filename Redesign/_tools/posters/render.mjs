// Builds the admission posters from real type, in the site's navy theme, at the slider upload sizes.
// Edit the copy in POSTERS below, then run from the repo root:
//   PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core node Redesign/_tools/posters/render.mjs [outDir] [slug,slug]
// With no outDir it writes the built-in homepage posters: <slug>-horizontal.webp (1920x820) and <slug>-vertical.webp (1200x1680).
// With an outDir it writes numbered PNGs in Desktop and Mobile folders, ready for Super Admin -> Sliders.
import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const frontend = join(resolve(dirname(fileURLToPath(import.meta.url)), '../../..'), 'frontend');
const require = createRequire(join(frontend, 'package.json'));
const sharp = require('sharp');
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const lu = require('react-icons/lu');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');

const outRoot = process.argv[2] ? resolve(process.argv[2]) : null;
const builtInDir = join(frontend, 'src/assets/images/posters');
const only = process.argv[3] ? process.argv[3].split(',') : null;
const file = (p) => pathToFileURL(join(frontend, p)).href;

const PHONE = '+91 78559 59544';
const icon = (name, size = 24) => renderToStaticMarkup(createElement(lu[name], { size, 'aria-hidden': true }));
const nb = (text) => text.replace(/ – /g, ' –⁠ ');
const badge = (text, tone = 'peach') => `<span class="badge ${tone}">${text}</span>`;
const head = (right = '') => `<header class="head"><img class="logo" src="${file('public/images/brand/swagat-logo-white.webp')}" alt="">${right}</header>`;
const title = (html) => `<h1><span class="bar"></span>${html}</h1>`;
const checks = (items) => `<ul class="checks">${items.map((t) => `<li><i>${icon('LuCheck', 18)}</i><span>${t}</span></li>`).join('')}</ul>`;
const chips = (items, cls = '') => `<div class="chips ${cls}">${items.map((c) => `<span class="chip">${c}</span>`).join('')}</div>`;
const call = (number, label = 'Call', name = 'LuPhone') => `<div class="call"><i>${icon(name, 22)}</i><span>${label ? `<small>${label}</small> ` : ''}<b>${number}</b></span></div>`;
const fine = (text, cls = '') => `<p class="fine ${cls}">${text}</p>`;
const addr = (text) => `<p class="fine addr">${icon('LuMapPin', 22)}<span>${nb(text)}</span></p>`;
const rows = (items) => `<ul class="rows">${items.map(([c, n]) => `<li><b>${c}</b><span>${n}</span></li>`).join('')}</ul>`;
const lines = (...parts) => parts.filter(Boolean).join('');

const nw = (text) => `<span class="nw">${text}</span>`;
const KISAN = `${nw('PM-KISAN')} or ${nw('CM-KISAN')}`;

const freeAd = ({ courses, extra }) => ({
    head: head(badge('All Regular Courses')),
    h: `<div class="body free"><div class="lead">${title(`Study Free,<br>+ ${extra} Free`)}<p class="elig">For SC, ST, OBC / General with ${KISAN}</p></div>
        <div class="detail">${chips(courses)}<div class="offer"><b>+ ${extra} Absolutely Free</b><span>Distance mode, university certificate</span></div></div></div>`,
    v: `<div class="body"><div class="lead">${title(`Study Free,<br>+ ${extra} Free`)}</div>
        ${chips(courses)}
        <div class="offer"><b>+ ${extra} Absolutely Free</b><span>With any one course. Distance mode, university certificate.</span></div>
        <h2>Who is eligible?</h2>${checks(['SC and ST students', `OBC / General students with ${KISAN}`])}</div>`,
    footH: `${call(PHONE)}${fine('Free for eligible students. Eligibility and document verification apply.')}`,
    foot: `${call(PHONE)}${fine('Eligibility and document verification apply.')}`,
});

const POSTERS = {
    'osbme-fee-12000': {
        head: head(badge('April Session 2027')),
        h: `<div class="body wide-lead"><div class="lead">${title('OSBME<br>Admission Open')}${fine('Odisha State Board of Madrasa Education')}${addr('At – Ghantiguda, PO – Chalna, PS – Sinapali, Dist – Nuapada')}</div>
            <div class="detail"><div class="fee"><small>10th &amp; +2 Course Fee</small><b>₹12,000/- <em>Only</em></b><span>No Hidden Charges</span></div>${checks(['Distance Mode', 'Flexible Learning'])}</div></div>`,
        v: `<div class="body"><div class="lead">${title('OSBME<br>Admission Open')}${fine('Odisha State Board of Madrasa Education')}</div>
            <div class="fee"><small>10th &amp; +2 Course Fee</small><b>₹12,000/- <em>Only</em></b><span>No Hidden Charges</span></div>
            ${checks(['Equivalence with NIOS, CHSE, CBSE &amp; HSC', 'Distance Mode, Flexible Learning'])}${addr('At – Ghantiguda, PO – Chalna, PS – Sinapali, Dist – Nuapada')}</div>`,
        foot: `${call('9403891555')}${call('7855959544', 'WhatsApp', 'LuMessageCircle')}`,
    },
    'university-courses': {
        head: head(badge('Admission Open')),
        h: `<div class="body uni-lead"><div class="lead">${title('Your University<br>Degree')}<p class="uni"><small>From</small> Maharaja Sriram Chandra Bhanja Deo University</p></div>
            <div class="detail">${checks(['BBA', 'BCA', 'Hotel Management', 'Tourism Management'])}</div></div>`,
        v: `<div class="body"><div class="lead">${title('Your University<br>Degree')}</div>
            <p class="uni"><small>From</small> Maharaja Sriram Chandra Bhanja Deo University</p>
            <section class="card"><h2>Courses</h2>${checks(['BBA', 'BCA', 'Hotel Management', 'Tourism Management'])}</section></div>`,
        foot: `${call(PHONE)}<p class="site">www.swagatodisha.com</p>`,
    },
    'free-regular-ug': freeAd({ courses: ['BSc Computer Science', 'BSc ITM', 'BSW', 'BLib'], extra: 'DCA' }),
    'free-regular-pg': freeAd({ courses: ['MFC', 'PMIR', 'MSW', 'MA in Yoga'], extra: 'PGDCA' }),
    'boards-2027-28': {
        head: head(badge('Session 2027–2028')),
        h: `<div class="body"><div class="lead">${title('Admissions<br>Open')}<p class="elig">10th &amp; +2 (Arts, Science, Commerce)</p></div>
            <div class="detail">${chips(['NIOS', 'BOSSE', 'OSBME'])}${checks(['Transfer of Credit (TOC)', 'Flexible Learning &amp; Study', 'Direct Examination Support'])}</div></div>`,
        v: `<div class="body"><div class="lead">${title('Admissions<br>Open')}<p class="elig">10th &amp; +2 (Arts, Science, Commerce)</p></div>
            ${chips(['NIOS', 'BOSSE', 'OSBME'])}<section class="card"><h2>Key Highlights</h2>${checks(['Transfer of Credit (TOC)', 'Flexible Learning &amp; Study', 'Direct Examination Support'])}</section></div>`,
        foot: `${call(PHONE, 'Admissions')}${fine('<b>Institutes:</b> Sargiguda | Bangomunda | Kantabanji | Titilagarh')}`,
    },
    'other-courses': {
        head: head(badge('Limited Seats • Apply Now!')),
        headV: head(badge('Limited Seats')),
        h: `<div class="body wide-detail"><div class="lead">${title('Other<br>Courses')}<p class="elig">SC / ST / OBC State Scholarship Available</p></div>
            <div class="detail">${chips(['BBA', 'BCA', 'BSW', 'BHM', 'BTM', 'B.Sc Computer Science', 'B.Sc ITM', 'B.Lib', 'MFC', 'PMIR', 'MSW', 'PGDCA'], 'tight')}${addr('At – Ghantiguda, PO – Chalna, PS – Sinapali, Dist – Nuapada')}</div></div>`,
        v: `<div class="body"><div class="lead">${title('Other Courses')}</div>${chips(['BBA', 'BCA', 'BSW', 'BHM', 'BTM', 'B.Sc Computer Science', 'B.Sc ITM', 'B.Lib', 'MFC', 'PMIR', 'MSW', 'PGDCA'], 'tight')}
            <p class="elig strong">SC / ST / OBC State Scholarship Available</p>
            ${checks(['1–2 Failed Subjects Accepted', 'Fast Course Completion'])}${addr('At – Ghantiguda, PO – Chalna, PS – Sinapali, Dist – Nuapada')}</div>`,
        foot: `${call('9403891555')}${call('7855959544', 'WhatsApp', 'LuMessageCircle')}`,
    },
    'degrees-2026-27': {
        head: head(badge('Session 2026–27')),
        photoV: true,
        headV: head(),
        h: `<div class="body wide-detail"><div class="lead">${title('Admission<br>Open')}${fine('Main Campus: Sargiguda<br>City Office: Bangomunda')}</div><div class="detail">${chips(['BBA', 'BCA', 'BSW', 'BHM', 'BTM'], 'tight')}${checks(['Career Oriented Courses', 'Experienced Faculty', 'Placement Assistance'])}</div></div>`,
        v: `<div class="body"><div class="lead narrow">${title('Admission<br>Open')}<div class="tagged">${badge('Session 2026–27')}${badge('Limited Seats', 'lavender')}</div></div>${chips(['BBA', 'BCA', 'BSW', 'BHM', 'BTM'], 'tight')}
            ${checks(['Career Oriented Courses', 'Experienced Faculty', 'Placement Assistance'])}
            ${addr('Main Campus: At – Sargiguda, PO – Sargul, PS – Kantabanji, Dist – Balangir')}${addr('City Office: At/PO – Bangomunda, Dist – Balangir')}</div>`,
        footH: `${call(PHONE)}${badge('Limited Seats Available', 'lavender')}`,
        foot: `${call(PHONE)}`,
    },
    'courses': {
        head: head(badge('Admission Open')),
        h: `<div class="body wide-detail"><div class="lead">${title('Build Your<br>Future')}<p class="elig">Courses Offered</p></div>
            <div class="detail">${rows([['BBA', 'Business Administration'], ['BCA', 'Computer Applications'], ['BHM', 'Hotel Management'], ['BTM', 'Tourism Management'], ['MFC', 'Finance &amp; Control']])}</div></div>`,
        v: `<div class="body"><div class="lead">${title('Build your<br>future with us!')}</div>
            <section class="card"><h2>Courses Offered</h2>${rows([['BBA', 'Bachelor of Business Administration'], ['BCA', 'Bachelor of Computer Applications'], ['BHM', 'Bachelor of Hotel Management'], ['BTM', 'Bachelor of Tourism Management'], ['MFC', 'Master of Finance &amp; Control']])}</section></div>`,
        footH: `${call(PHONE)}<p class="site">www.swagatodisha.com</p>`,
        foot: `${call(PHONE)}`,
    },
    'bangomunda': {
        photo: true,
        head: head(),
        h: `<div class="body one"><div class="lead">${title('Shaping<br>Your Future')}</div>${chips(['BBA', 'BSW', 'B.Sc. Computer Science'], 'tight')}</div>`,
        v: `<div class="body"><div class="lead narrow">${title('Shaping<br>Your Future')}</div>
            <section class="card"><h2>Courses</h2>${rows([['BBA', 'Bachelor of Business Administration'], ['BSW', 'Bachelor of Social Work'], ['B.Sc.', 'Computer Science']])}</section>
            ${addr('At/PO – Bangomunda, PIN – 767040, Dist – Balangir, Odisha')}</div>`,
        footH: `${call(PHONE)}${addr('At/PO – Bangomunda, PIN – 767040, Dist – Balangir')}`,
        foot: `${call(PHONE)}`,
    },
    'osbme-2026-27': {
        head: head(badge('Academic Session 2026–27')),
        headV: head(badge('Session 2026–27')),
        h: `<div class="body"><div class="lead">${title('Admissions<br>Open')}${fine('Affiliated to: Odisha State Board of Madrasa Education (OSBME)')}</div>
            <div class="detail">${checks(['10th (Secondary)', '+2 Arts, Commerce, Science', 'Distance Mode Available', 'Study from Home'])}</div></div>`,
        v: `<div class="body"><div class="lead">${title('Admissions<br>Open')}${fine('Affiliated to: Odisha State Board of Madrasa Education (OSBME)')}</div>
            ${checks(['10th (Secondary)', '+2 Arts, Commerce, Science', 'Equivalence with NIOS, CHSE, CBSE &amp; HSC', 'Distance Mode, Study from Home'])}
            ${addr('At – Sargiguda, PO – Sargul, PS – Kantabanji, Dist – Balangir, PIN – 767039')}</div>`,
        foot: `${call(PHONE)}`,
    },
};

const css = `
@font-face{font-family:Montserrat;src:url('${file('public/fonts/montserrat-latin.woff2')}') format('woff2');font-weight:400 700}
@font-face{font-family:Inter;src:url('${file('public/fonts/inter-latin.woff2')}') format('woff2');font-weight:400 800}
@font-face{font-family:Inter;src:url('${file('public/fonts/inter-latin-ext.woff2')}') format('woff2');font-weight:400 800;unicode-range:U+0100-02AF,U+20A0-20CF}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#0E1A3D}
ul{list-style:none}
.poster{position:relative;isolation:isolate;overflow:hidden;width:var(--w);height:var(--h);padding:var(--py) var(--px);display:flex;flex-direction:column;gap:var(--gap);background:#0E1A3D;color:#fff;font:500 var(--body)/1.25 Montserrat,sans-serif}
.poster::before{content:'';position:absolute;inset:0;z-index:-1;background-image:radial-gradient(55% 70% at 0% 0%,rgb(0 77 152/.5) 0%,transparent 70%),radial-gradient(45% 60% at 100% 100%,rgb(165 0 68/.32) 0%,transparent 70%),linear-gradient(rgb(255 255 255/.04) 1px,transparent 1px),linear-gradient(90deg,rgb(255 255 255/.04) 1px,transparent 1px);background-size:auto,auto,40px 40px,40px 40px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent),linear-gradient(transparent,#000 12%,#000 88%,transparent);-webkit-mask-composite:source-in;mask-composite:intersect}
.photo{position:absolute;z-index:-2;background:url('${file('src/assets/images/redesign/hero-desktop.webp')}') right top/cover no-repeat}
.head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex:none}
.logo{height:var(--logo);display:block}
.bar{display:block;width:56px;height:5px;border-radius:9px;margin-bottom:8px;background:linear-gradient(90deg,#3B82D6 0 50%,#D6175F 50% 100%)}
h1{font:700 var(--h1)/1.02 Montserrat,sans-serif;letter-spacing:-.025em;white-space:nowrap}
h2{font:700 var(--h2)/1.15 Inter,sans-serif;letter-spacing:-.01em}
.badge{display:inline-flex;align-items:center;border-radius:99px;padding:6px 16px;font:700 var(--body)/1.2 Inter,sans-serif;white-space:nowrap}
.badge.peach{background:#FFE7C3;color:#0E1A3D}.badge.lavender{background:#D9DFFF;color:#0E1A3D}
.body{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:var(--gap)}
.lead{display:flex;flex-direction:column;gap:8px;min-width:0}
.detail{display:flex;flex-direction:column;gap:var(--gap);min-width:0}
.tagged{display:flex;flex-wrap:wrap;gap:8px}
.nw{white-space:nowrap}
.foot:has(.call + .call){justify-content:flex-start}
.fine{font-size:var(--fine);line-height:1.25;color:#C9D3E8}
.fine b{color:#fff;font-weight:600}
.addr{display:flex;gap:8px;align-items:flex-start}
.addr svg{flex:none;margin-top:1px;color:#fff}
.elig{color:#C9D3E8;font-weight:600}.elig.strong{color:#FFE7C3}
.checks{display:flex;flex-direction:column;gap:var(--li)}
.checks li{display:flex;gap:10px;align-items:flex-start;font-weight:600}
.checks i{flex:none;display:grid;place-items:center;width:28px;height:28px;margin-top:1px;border-radius:99px;background:#004D98;box-shadow:inset 0 0 0 1px rgb(255 255 255/.25)}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{border-radius:99px;padding:6px 16px;font:700 var(--body)/1.2 Inter,sans-serif;background:#004D98;box-shadow:inset 0 0 0 1px rgb(255 255 255/.22);white-space:nowrap}
.chips.tight{gap:6px}.chips.tight .chip{padding:5px 13px}
.card{display:flex;flex-direction:column;gap:10px;padding:var(--card);border-radius:16px;background-color:rgb(14 26 61/.72);background-image:radial-gradient(90% 80% at 100% 0%,rgb(0 77 152/.4) 0%,transparent 65%);box-shadow:inset 0 0 0 1.5px rgb(255 255 255/.14)}
.rows{display:flex;flex-direction:column;gap:var(--li)}
.rows li{display:grid;grid-template-columns:var(--code) 1fr;gap:10px;align-items:baseline}
.rows b{font:800 var(--body)/1.2 Inter,sans-serif;color:#FFE7C3}
.rows span{color:#fff;font-weight:500}
.fee{display:flex;flex-direction:column;align-items:flex-start;padding:10px 18px;border-radius:16px;background:#FFE7C3;color:#0E1A3D}
.fee small{font:700 var(--body)/1.2 Inter,sans-serif}
.fee b{font:800 var(--fee)/1.1 Inter,sans-serif;letter-spacing:-.02em}
.fee em{font:700 var(--body)/1 Inter,sans-serif;font-style:normal;letter-spacing:0}
.fee span{font:700 var(--body)/1.2 Inter,sans-serif;color:#A50044}
.offer{display:flex;flex-direction:column;gap:2px;padding:10px 16px;border-radius:16px;background:#FFE7C3;color:#0E1A3D}
.offer b{font:800 var(--h2)/1.15 Inter,sans-serif;letter-spacing:-.01em}
.offer span{font-weight:600;line-height:1.2}
.uni{padding:10px 16px;border-radius:16px;background:#D9DFFF;color:#0E1A3D;font:700 var(--body)/1.2 Inter,sans-serif}
.uni small{display:block;font:600 var(--fine)/1.2 Montserrat,sans-serif}
.foot{flex:none;display:flex;align-items:center;justify-content:space-between;gap:18px}
.foot .fine{flex:1 1 0;min-width:0;text-align:right}
.foot .addr{text-align:left}
.call{flex:none;display:inline-flex;align-items:center;gap:10px;padding:5px 18px 5px 6px;border-radius:99px;background:rgb(255 255 255/.16);box-shadow:inset 0 0 0 1px rgb(255 255 255/.45)}
.call i{display:grid;place-items:center;width:40px;height:40px;border-radius:99px;background:#004D98}
.call small{font:600 var(--body)/1.1 Montserrat,sans-serif;color:#C9D3E8}
.call b{font:800 var(--body)/1.1 Inter,sans-serif;letter-spacing:-.01em;white-space:nowrap}
.site{font:700 var(--body)/1.2 Inter,sans-serif;white-space:nowrap}

.h{--w:960px;--h:410px;--px:48px;--py:32px;--gap:12px;--body:25px;--fine:20px;--h1:60px;--h2:25px;--li:6px;--card:12px;--logo:52px;--fee:44px;--code:80px}
.h .body{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}
.h .body.wide-lead{grid-template-columns:510px 1fr}
.h .body.free{grid-template-columns:450px 1fr}
.h .body.wide-detail{grid-template-columns:330px 1fr}
.h .body.uni-lead{grid-template-columns:480px 1fr}
.h .uni{padding:6px 14px}
.h .uni small{display:inline;font:inherit}
.h .body.one{display:flex;flex-direction:column;gap:10px;max-width:530px}
.h .photo{inset:0 0 0 auto;width:440px;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 40%,#000 94%,transparent),linear-gradient(transparent,#000 10%,#000 90%,transparent);-webkit-mask-composite:source-in;mask-composite:intersect}
.h .foot.onphoto{position:relative}

.v{--w:600px;--h:840px;--px:36px;--py:36px;--gap:16px;--body:28px;--fine:24px;--h1:60px;--h2:30px;--li:9px;--card:16px;--logo:58px;--fee:62px;--code:96px}
.v .photo{inset:0 0 auto 0;height:390px;background-size:auto 100%;-webkit-mask-image:linear-gradient(transparent,#000 8%,#000 60%,transparent),linear-gradient(90deg,#000 92%,transparent);-webkit-mask-composite:source-in;mask-composite:intersect}
.v .foot{margin-top:auto}
.v .foot{flex-wrap:wrap;gap:8px 14px}
.v .foot .fine{text-align:left;flex:1 1 100%}
.v .site{flex:1 1 100%}
.v .badge{font-size:28px;padding:5px 12px}
`;

const browser = await chromium.launch({ channel: 'chrome' });
const tmp = mkdtempSync(join(tmpdir(), 'posters-'));
const FORMATS = [
    { key: 'h', dir: 'Desktop-Horizontal-1920x820', suffix: 'horizontal', width: 960, height: 410, minBody: 25, minFine: 20 },
    { key: 'v', dir: 'Mobile-Vertical-1200x1680', suffix: 'vertical', width: 600, height: 840, minBody: 28, minFine: 24 },
];
let failures = 0;

for (const [index, [slug, poster]] of Object.entries(POSTERS).entries()) {
    if (only && !only.includes(slug)) continue;
    for (const f of FORMATS) {
        const number = String(index + 1).padStart(2, '0');
        mkdirSync(outRoot ? join(outRoot, f.dir) : builtInDir, { recursive: true });
        const page = await browser.newPage({ viewport: { width: f.width, height: f.height }, deviceScaleFactor: 2 });
        const html = join(tmp, `${slug}-${f.key}.html`);
        const foot = (f.key === 'h' && poster.footH) || poster.foot;
        const posterHead = (f.key === 'v' && poster.headV) || poster.head;
        const showPhoto = poster.photo || (f.key === 'v' && poster.photoV);
        writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>${css}</style><main class="poster ${f.key} ${slug}">${showPhoto ? '<div class="photo"></div>' : ''}${posterHead}${poster[f.key]}<footer class="foot">${foot}</footer></main>`);
        await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);

        const problems = await page.evaluate(({ minBody, minFine }) => {
            const out = [];
            const poster = document.querySelector('.poster');
            const box = poster.getBoundingClientRect();
            const style = getComputedStyle(poster);
            const pad = parseFloat(style.paddingTop) - 1;
            const foot = document.querySelector('.foot').getBoundingClientRect();
            for (const el of poster.querySelectorAll('*')) {
                if (el.closest('svg') || el.classList.contains('photo')) continue;
                const r = el.getBoundingClientRect();
                if (r.bottom > box.bottom - pad || r.right > box.right - pad || r.left < box.left + pad - 1 || r.top < box.top + pad - 1) out.push(`outside: ${el.tagName}.${el.className} "${el.textContent.slice(0, 30)}"`);
                if (el.closest('.body') && r.bottom > foot.top - 2) out.push(`hits footer by ${(r.bottom - foot.top).toFixed(0)}px: ${el.tagName}.${el.className} "${el.textContent.slice(0, 30)}"`);
                if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== 'inline') out.push(`clipped: ${el.tagName}.${el.className}`);
                const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
                if (hasText) {
                    const size = parseFloat(getComputedStyle(el).fontSize);
                    const min = el.closest('.fine') || el.closest('.uni small') ? minFine : minBody;
                    if (size < min) out.push(`small ${size}px: "${el.textContent.slice(0, 30)}"`);
                }
            }
            return out;
        }, { minBody: f.minBody, minFine: f.minFine });
        if (problems.length) { failures += 1; console.log(`FAIL ${slug}-${f.suffix}\n  ${[...new Set(problems)].slice(0, 6).join('\n  ')}`); }

        const png = await page.screenshot({ type: 'png' });
        if (outRoot) writeFileSync(join(outRoot, f.dir, `${number}-${slug}-${f.suffix}.png`), png);
        else await sharp(png).webp({ quality: 84, effort: 6, smartSubsample: true }).toFile(join(builtInDir, `${slug}-${f.suffix}.webp`));
        await page.close();
    }
}

await browser.close();
rmSync(tmp, { recursive: true, force: true });
console.log(failures ? `${failures} poster(s) have layout problems` : 'All posters passed the layout checks');
