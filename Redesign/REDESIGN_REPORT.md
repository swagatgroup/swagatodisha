# Redesign Report

Branch `redesign/ui-v2`, ready for review. It hasn't been merged or pushed. Scope: public site plus login/registration. The dashboards are untouched.

## At a glance

| Check | Result |
|---|---|
| Production build | ✅ passes |
| Lint (`npm run lint`) | ✅ no new problems. 375 remain, all pre-existing (baseline was 388); no file has more than before |
| Type-check / tests | none configured for the frontend; backend untouched and not run (it writes to real Cloudinary/DB) |
| API requests per page (before vs after) | ✅ **identical on all 30 route × width combinations** (`api-requests-before.json` vs `api-requests-after.json`) |
| Internal links | ✅ every internal link on every public page resolves to its own route |
| Horizontal overflow at 360 / 390 / 768 / 1024 / 1280 / 1440 / 1920 | ✅ none on any route |
| Tap targets ≥ 44px on touch devices | ✅ all, except the dashboard-shared password-visibility toggle (see Follow-ups) |
| axe (WCAG 2.1 AA) at 390 and 1440 | ✅ no violations, except one heading-order issue inside the shared Terms component |
| New npm dependencies | **none** |

## Where things are

| What | Path |
|---|---|
| Before screenshots (pre-redesign, live data) | `Redesign/_baseline/<route>@1440.png`, `@390.png` |
| After screenshots | `Redesign/_final/<route>@1440.png`, `@390.png` |
| Side-by-side before/after sheets | `Redesign/_compare/<route>@1440.jpg`, `@390.jpg` |
| Image list with AI prompts and Pexels terms | **`Redesign/IMAGE_BRIEF.md`** |
| API request records | `Redesign/api-requests-before.json`, `Redesign/api-requests-after.json` |
| Lighthouse raw scores | `Redesign/lighthouse-before.txt`, `Redesign/lighthouse-after.txt` |
| Design system / audit / progress | `Redesign/DESIGN_SYSTEM.md`, `REDESIGN_AUDIT.md`, `REDESIGN_PROGRESS.md` |
| Re-run tools | `Redesign/_tools/shoot.mjs` (screenshots), `Redesign/_tools/api-requests.mjs` (API record) |

The three screenshot folders are git-ignored, as requested. They exist on this machine only.

## Two constants to correct

Both are in `frontend/src/components/site/siteConfig.js`, each with a TODO comment:

- `COACHING_CENTRE_URL = '/'`: the old link pointed at a page that never existed. Replace it once the Coaching Centre page is live.
- `DESIGNER_CREDIT.url = 'https://www.code-.in'`: **a domain can't end with a hyphen, so this link won't open.** Correct the spelling there (the label is next to it).

## Lighthouse (mobile, local production build)

| Page | Performance | Accessibility | Best practices | SEO | LCP |
|---|---|---|---|---|---|
| `/` | 46 → **63** | 100 → 100 | 100 → 96* | 91 → 92 | 6.7 s → 6.8 s |
| `/about` | 42 → **65** | 88 → **100** | 96 → 96 | 92 → 92 | 7.2 s → 6.3 s |
| `/contact` | 57 → **67** | 93 → **100** | 100 → 100 | 92 → 92 | 7.8 s → 5.6 s |
| `/login-portal` | 59 → **69** | 84 → **100** | 100 → 100 | 91 → 92 | 7.3 s → 5.3 s |

CLS is 0 everywhere, before and after.

\* **Not a regression of the redesign.** The "before" score for `/` measured the old entry screen, which never loaded the homepage. Now the homepage loads directly, and its pre-existing Approvals request to `localhost:5000` (see Follow-ups #3) logs a console error. That request is byte-for-byte the same as before. I didn't change it because it is data-fetching code.

LCP stays high because the whole app, dashboards included, ships as one 2.2 MB JavaScript file. Splitting the dashboard routes out would be the biggest win (Follow-ups #11).

## Entry screen: removed, destinations relocated

- `GatewayLoader` and its state are deleted. `/` opens the homepage directly. The screen had no URL of its own, so no redirect was needed.
- The six destinations now live in the **Institutions** menu: a dropdown on desktop, and an expandable group in the mobile menu.
  - "Swagat Odisha": this is now simply the homepage.
  - RCTI (external, opens in a new tab).
  - Public School Ghantiguda, Sargiguda, Lakhna. These now use relative links to the same pages, instead of hard-coded `https://www.swagatodisha.com/...`, so they also work on preview deployments.
  - Coaching Centre (→ `COACHING_CENTRE_URL`).
- The three school pages are also still linked from the School card's modal, as before.

## What changed, page by page

**Shell (all marketing pages).**
- **Header:** transparent over the black top band and solid black once you scroll. It has the white Swagat logo, the glass pill navigation with the Institutions dropdown, and one "Login / Register" pill.
- **Mobile header:** a full-screen black menu, a centred logo and a Login pill. Register sits inside the menu.
- **Footer:** black, with the giant "Swagat Odisha" watermark.
- **Removed from every page:** the floating "Back to main website" button. About, Gallery, Contact, Send Message, the legal pages and the school pages all get the shared header and footer.
- **Added:** a "Skip to content" link.

**Homepage.**
- **Hero:** a new hero with the copy you supplied, three benefit chips, and two buttons (call, and scroll to courses).
- **Explore Swagat:** this is the old Quick Access section as four black tiles with blurred-gradient panes. The tiles follow the Figma mobile order on phones.
- **Admission posters:** the old banner's admin-uploaded posters now sit below Explore Swagat in a framed carousel. Posters are shown whole and never cropped.
- **Approvals & Recognitions:** a black band, shown only when there's data (there's none today).
- **Our Institutions:** 8 black cards, each with a photo slot, a gradient title and a ＋. The three modal levels are restyled.
- **Our Campuses:** map cards with a dotted backdrop. On phones the campus details sit beside the map, as in the Figma.
- **Why Choose Our Location:** a timeline with pastel badges, plus "Plan Your Visit" alongside it.
- **Get in touch with us:** a grey panel with the form on the left and the copy on the right, plus brand-coloured social tiles.

**Explore Swagat details (data unchanged).**
- **Documents panel:** it appears over the tile on hover as before. It now also opens on tap or Enter, and closes with Esc or a tap outside.
- **Document data:** loading, empty, the auto-scrolling list and blinking links all work as before.
- **Career Roadmap:** the modal is now a stepped timeline. Streams are black cards, paths are timeline nodes, and careers are rows with duration badges. "View N More Options" and the counselling call button are unchanged.

**About.** Black page hero, then:
- Mission/Vision as black cards and Values as outline cards.
- Journey as a centre-line timeline (single line on mobile).
- Leadership as black cards. Initials show when a photo is missing, which is true today for all three.
- Why Choose Us plus Achievements, then a black CTA band, then Our Team (only when there's data).

**Gallery.** Page hero, then:
- Category tabs, which are keyboard accessible.
- A grid of black-framed tiles, and a dark lightbox modal.
- The stats row and the CTA band.

**Contact.** A page hero, then the same contact section as the homepage.

**Send Message.**
- Page hero with the trust badges. Signed-in users also get "Back to Dashboard" there.
- A black Quick Contact card, and the form in a grey panel.

**Terms / Privacy.** A page hero and a readable single column. The Terms component itself isn't modified because the dashboard registration forms share it; it's wrapped by a new `TermsPage`.

**School pages (×3).**
- Photo hero with a location badge and two buttons.
- Features, programs (black cards), facilities, achievements and the contact band, all restyled.
- SEO tags (Helmet, structured data) are unchanged.

**Login portal, Login, Register, Forgot password.**
- A focused layout: a black brand bar with the logo and back-to-home, then content on light grey.
- The portal cards follow the Explore tile style. The Login page now shows which portal you're on ("Student Login", etc.).

**Floating contact button.** Black/glass instead of green, with labelled links. It's still hidden on dashboards, as before.

## Copy changes (old → new)

Marketing copy follows the AIDA rules now in `CLAUDE.md`. Factual and data content (institutions, courses, fees, notifications, roadmap, contact details, legal text) is unchanged.

| Where | Old | New |
|---|---|---|
| Homepage hero, eyebrow | — (banner images only) | Distance education for Odisha |
| Homepage hero, H1 | — | Your degree, start to finish. |
| Homepage hero, subheading | — | Affordable distance courses for students across Odisha, with real support from the day you enrol to the day you complete your course. |
| Homepage hero, chips | — | Affordable fees · Support from admission to completion · Study from anywhere in Odisha |
| Homepage hero, buttons | — | Let's book a call (dials +91 7855959544) · Explore courses (scrolls to Our Institutions) |
| Quick Access heading | Quick Access | Explore Swagat |
| Quick Access subtitle | Hover over cards to see available documents with blinking links | Everything you need, one click away. |
| Quick Access button | View All Resources | *(hidden: it had no action)* |
| Posters section (new) | — | **Admissions & updates** / The latest admission openings and announcements from Swagat, all in one place. *(my copy)* |
| Institutions heading | Our Institution Types | Our Institutions |
| Institutions subtitle | Discover our comprehensive range of educational institutions, each designed to provide specialized learning experiences and prepare students for successful careers. | Diverse pathways to academic excellence. |
| Locations heading | Our Locations | Our Campuses |
| Locations subtitle | Visit us at our state-of-the-art campuses in Sargiguda, Kantabanji, Balangir and Ghantiguda, Sinapali, Nuapada, Odisha | Inspiring spaces across Odisha. *(the addresses remain on each campus card)* |
| Contact heading | Get In Touch | Get in touch with us |
| Contact subtitle | We're here to help and answer any questions you might have. We look forward to hearing from you. | Have a question about a course or admission? Send us a message and our team will guide you, step by step. *(my copy; the old line is now the intro of the `/contact` page hero)* |
| Contact form card heading | Send Us a Message | kept, but visually hidden (the Figma has no heading there) |
| Contact form labels | Full Name *, Email Address *, … | same text, visually hidden (the Figma shows placeholders only); still read by screen readers |
| Footer copyright | © {year} Swagat Group of Institutions. All rights reserved. | © {year} Swagat Odisha. All rights reserved. |
| Footer credit (new) | — | Designed & developed by Code- |
| Header auth | "Login" and "Register" buttons | one pill: Login / Register |
| Institutions dropdown (new) | — | All institutions · Institution websites *(my microcopy)*, then the gateway's own names: RCTI / Swagat Odisha, Public School / Ghantiguda, … |
| Entry screen | Welcome to Swagat Odisha / Choose your destination to continue | *(removed with the screen)* |
| `/contact` page hero (new) | — | Contact Us / We're here to help and answer any questions you might have. We look forward to hearing from you. |
| `/terms-and-conditions` page hero (new) | — | Terms and Conditions |
| Auth pages, top bar (new) | — | Back to Home (same wording as the existing link on Login/Register) |
| Login portal | a second "Track Your Application" heading + "Enter your application ID or phone number to check your admission status instantly." wrapped around the tracker | removed as a duplicate. The tracker's own heading and fuller description stay. |
| About, "Learn More" button | Learn More | Learn More + screen-reader-only " about our institutions" (for link-text accessibility) |
| Skip link (new) | — | Skip to content |
| Carousel controls (new labels) | — | Previous poster / Next poster, Previous / Next (approvals) |

Headings that were split into coloured spans (e.g. "Our <span>Values</span>") keep exactly the same words.

## Behaviour and link changes (please review)

1. **Dead buttons now go somewhere.** These had no action before:
   - "Apply Now" in the About page CTA and in the institution program/course modals → `/register` (the student registration and application flow).
   - About "Learn More" → `/#institutions`.
   - Gallery "Schedule a Visit" and "Contact Us" → `/contact`.
   - "View All Resources" is hidden, as you asked.
2. **Explore tiles** also open their document panel on click, tap or Enter, not only on hover.
3. **Header links to homepage sections** (Institutions, Approvals) work from other pages: they go to `/#section` and the homepage scrolls there.
4. **Modals** now close with Esc, trap and restore keyboard focus, and lock page scroll. Their close and backdrop handlers are the original ones.
5. **Login, "Forgot your password?"**: it now has `type="button"`. Before, it also submitted the login form when clicked.
6. **Register email field:** `autocomplete` changed from `"username email"` (invalid) to `"email"`.
7. **Forgot-password email field:** id `email` → `forgot-email`, to avoid a duplicate id with the Login form under the modal.
8. **Dark mode** only applies on `/dashboard/*`. The saved preference is kept.
9. **Poster carousel:**
   - Posters show whole instead of cropped.
   - Previous/next arrows were added.
   - Autoplay pauses while hovering or focused.
   - Data loading is copied verbatim from the old banner: same endpoint, the same 1000px switch between horizontal and vertical posters, the same 30-second refresh and the same fallback images.
10. **"Registrations Closed" logo** pointed at `/swagat-logo.png`, which doesn't exist. It now uses the brand logo.
11. **GSAP removed from Explore.** The cards no longer vanish when you scroll back up, and the effect that killed every ScrollTrigger on the page is gone.
12. **Dashboard fonts** (Baloo 2 / Lato) now load without blocking the page. They're still the same fonts with `display=swap`.
13. **Display fixes:** Gallery category icons and the career-roadmap stream and path icons used to render as empty `<i>` tags, because icon components were passed in as class names. They now show. Font Awesome icons elsewhere were replaced with the matching Lucide glyphs.

## Kept although the Figma doesn't show it

- Approvals & Recognitions section.
- "Plan Your Visit".
- Campus address, phone and email on desktop.
- The contact form's upload field.
- The logo, tagline and "Get In Touch Directly" in the contact panel.
- The newsletter ("Stay Updated").
- "Career Guidance" in Support.
- The Privacy / Terms / Cookie links.
- The floating contact button.
- All of the About, Gallery, school, legal and auth content.

## Deviations from the Figma, and why

| Figma | Built | Why |
|---|---|---|
| 3D grad-cap placeholder logo | Real Swagat logo (white on black, colour on white) | Your decision |
| NASA/planet imagery | Education and Odisha imagery via `IMAGE_BRIEF.md`; dark gradient placeholders until the files arrive | Your decision |
| Hero: "Unlock limitless learning…" + one CTA | Your AIDA hero copy + chips + two CTAs | Your decision |
| Nav item "Institution" | "Institutions" (with dropdown) | Existing label kept |
| Tile labels "Time Table", "Career Roadmap", "Notification", "Result" | "Time Tables", "Career Roadmaps", "Notifications", "Results" + their descriptions | Existing labels and descriptions kept |
| "Why choose our location?" | "Why Choose Our Location" | Existing heading kept |
| Third "Why" card repeats card 2's text | Real "Safe Environment" text | Figma text was a placeholder |
| Mobile body text 8px | 14px minimum | Approved; readability and WCAG |
| Mobile side gutters 35px | 16px | Brief's 16px gutter; more room for cards |
| Static map images | Live Google Maps embed (as before) with a grey placeholder behind | Keep existing behaviour |
| "Get Direction" | "Get Directions" | Existing label |
| Contact: "Send", placeholder-only fields | "Send Message"; labels kept but visually hidden; upload field kept | Existing label; accessibility; content kept |
| Footer: 3 columns, placeholder agency copyright | 4 columns (Stay Updated added), legal links row, Swagat copyright + Code- credit | Existing content; your decision |
| Muted grey `#808080`, placeholder `#8F8F8F` | `#6B6B6B` / `#767676` | WCAG AA contrast |
| No visible focus style | Blue 2px focus ring | Keyboard accessibility |
| Footer links 29px apart | 44px tall on touch devices; Figma spacing on desktop | Tap-target rule |

## Follow-ups

**Security (outside this re-skin, please read):**
1. **Password reset is an account-takeover risk.** "Forgot password" resets *any* account to a default password that's printed on the page (`SG@99student`, `SG@99agent`, `SG@99staff`). Anyone who knows a user's email can reset it and log in. This needs a backend change: an emailed reset link.
2. The production API returns full stack traces on errors. `/api/website-content` is public and includes a `paymentSettings` object.

**Content / data:**

3. Approvals, About "Our Team" and Gallery fetch from `VITE_API_URL || 'http://localhost:5000'`. Unless `VITE_API_URL` is set on Vercel, those sections can never load on the live site. Fix it by setting that env var, or by switching those three calls to the shared `api` client (a code change; I didn't make it).
4. The two constants above: the Coaching Centre URL and the `code-.in` domain.
5. Footer links that go nowhere today (unchanged): Quick Links `#about`, `#programs`, `#admissions`, `#gallery`; all Programs and Support links `#`; Privacy / Terms / Cookie `#`. Privacy and Terms could point to `/privacy-policy` and `/terms-and-conditions`.
6. **Privacy Policy placeholders:** it shows "[Contact Number]" and "[Institution Address]", and an email on a different domain (`privacy@swagatgroup.edu.in`).
7. **Missing leadership photos:** `/chairman.jpg`, `/chairman_rk.jpg` and `/mnt_003.jpg` aren't in `public/`, so initials show instead.
8. **About claims:** it states "1000+ Students" and "95% student satisfaction rate". These are existing content; please confirm they're accurate (brand rule: never claim what can't be backed).
9. **Images:** add the 13 files from `IMAGE_BRIEF.md`. Until then, the image slots show gradients, and the browser console logs a 404 for each missing file.

**Code health (not changed, to keep the re-skin safe):**

10. **Dashboard-shared components:** `PasswordInput`'s show/hide toggle is 32px wide, below the 44px touch target. The Terms component uses `h5` headings directly under the page `h1`. Fix both when the dashboards are restyled.
11. **Bundle:** one 2.2 MB JavaScript file holds every dashboard, three.js, Spline and recharts. Lazy-loading the dashboard routes would cut public-page load time sharply.
12. **Now-unused code and packages:** `gsap`, `@gsap/react`, `components/Card.jsx`, `Button.jsx`, `ArrowUp.jsx`, `AboutUs.jsx`, `Admissions.jsx`, `ChairmanMessage.jsx`, `Management.jsx`, `Milestone.jsx` and `contexts/DarkModeContext.jsx`. A few unused `iconBg`/`color` data fields still hold old purple hex values.
13. **Service worker:** `public/sw.js` pre-caches `/` and `/index.html`. Make sure it isn't registered in production, or visitors may keep seeing the old homepage.
14. Lint: 375 pre-existing problems remain (none added).

## Commits (`redesign/ui-v2`, oldest first)

1. **Planning and foundations:**
   - docs(redesign): add audit, design system, progress log and screenshot script
   - feat(ui): add design tokens, fonts and global styles
   - feat(ui): add design-system primitives
   - feat(ui): new layout shell, remove entry screen
2. **Homepage:**
   - feat(ui): redesign homepage
   - feat(ui): link institution Apply Now buttons to registration
3. **Other pages:**
   - feat(ui): redesign About page
   - feat(ui): redesign Gallery page
   - feat(ui): redesign Contact and Send Message pages
   - feat(ui): redesign legal pages
   - feat(ui): redesign school pages
   - feat(ui): redesign login, registration and application tracking
   - feat(ui): restyle floating contact button
4. **Quality and report:**
   - fix(ui): quality pass - accessibility, tap targets, token sweep, non-blocking fonts, image slots
   - docs(redesign): final report, image brief, verification records

`CLAUDE.md` (Brand & Copy rules) was updated locally but isn't committed: your global git-ignore excludes it.
