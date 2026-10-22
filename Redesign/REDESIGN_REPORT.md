# Redesign Report

Branch `redesign/ui-v2`, ready for review. It hasn't been merged or pushed. Scope: public site plus login/registration, plus the password-reset security fix (backend). Dashboard screens are untouched; they now load on demand.

## At a glance

| Check | Result |
|---|---|
| Production build | ✅ passes |
| Lint (`npm run lint`) | ✅ no new problems. 374 remain, all pre-existing (baseline was 388); no file has more than before. Changed backend files also have fewer problems than before |
| Type-check / tests | none configured for the frontend. The new password-reset flow passed 10/10 end-to-end checks against an in-memory database with email stubbed (details below). The existing backend upload test was not run (it writes to real Cloudinary/DB) |
| API requests per page (before vs after) | ✅ **24 of 30 identical; the other 6 are the intended fix**: Approvals (home), About and Gallery call the same endpoint and query, now on the real backend instead of `localhost:5000` |
| Console errors, page errors, failed requests | ✅ **zero on every public page** at 390 and 1440 (18 URLs including the reset page and footer deep links) |
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

The three screenshot folders are git-ignored, since they're generated and large. They exist on this machine only. The Figma source files (`Redesign/Desktop.png`, `Redesign/Mobile.png`, renamed from `Moblie.png`) are committed so the design reference lives with the code; the `Redesign/` folder isn't part of the deployed site.

## Constants to check

Both are in `frontend/src/components/site/siteConfig.js`:

- `COACHING_CENTRE_URL = null`: while it's `null`, the Coaching Centre is **hidden** from the Institutions menu, so nobody lands on a link that goes nowhere. Set it to the page path (or an `https://` address) and it reappears automatically.
- `DESIGNER_CREDIT`: "Designed & developed by Code Hyphen" → `https://www.codehyphen.in/`.

## Before you deploy

1. **Deploy the backend first** (Render), then the frontend (Vercel). The new reset-password page needs the updated backend route.
2. On Render, check that **`FRONTEND_URL`** is your live address (e.g. `https://www.swagatodisha.com`). The reset email builds its link from it.
3. Check that the **Resend** keys (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`) work in production, since reset links are sent by email. If sending fails, users still see the same "check your email" message (so accounts can't be probed), and the server logs the error.

## Fixed after review

1. **Password reset (security).** The old flow reset any account to a printed default password. Now:
   - "Forgot password" emails a **single-use link that expires in 30 minutes**. Only a SHA-256 hash of the token is stored.
   - The answer is the same whether or not the email has an account, so emails can't be probed.
   - Requests are limited to 3 per hour per visitor. Proxy trust is already set, so this counts real visitor IPs.
   - It works for students and agents (`User`) and for staff and super admins (`Admin`).
   - A new page at `/reset-password/:token` sets the new password: at least 8 characters, with a letter and a number. It clears any login lockout and invalidates older sessions.
   - The default passwords no longer appear anywhere in the UI.
   - **Verified** with the real route code against an in-memory database, with email stubbed so nothing was sent or written to live data. All 10 checks passed: unknown email, student, staff, rate limit, malformed link, weak password, valid reset, reuse blocked, expired link blocked, and only the hash stored.
2. **Approvals, About "Our Team" and Gallery** now use the shared API client, so they load from the real backend on the live site instead of `localhost:5000`.
3. **Footer links all go somewhere:**
   - Quick Links: About Us → `/about`, Programs → institutions section, Admissions → `/register`, Gallery → `/gallery`, Contact → `/contact`.
   - Each program link opens that institution's programs (`/?institution=…`).
   - Support: Student Portal → student login, Parent Portal → portal page with application tracking, Career Guidance → opens the Career Roadmap (`/?explore=career`).
   - Legal: Privacy Policy and Terms of Service → their pages.
   - **Removed:** "Scholarships", "FAQs" and "Cookie Policy", because no such pages exist. Add them back when there's content.
4. **Privacy Policy contact block:** the "[Contact Number]" and "[Institution Address]" placeholders, and the unused-domain email (`privacy@swagatgroup.edu.in`), are replaced with the site's official phone, address and email (`contact@swagatodisha.com`).
5. **Leadership photos restored** on About. Two were already in the project; `mnt_003.jpg` was recovered from git history. They're now bundled, so they can't go missing again.
6. **No 404s for missing photos:** image slots only request files that exist. Photos now go in `frontend/src/assets/images/redesign/` and get fingerprinted names, so they're cache-safe.
7. **Performance:**
   - The four dashboards load on demand. The main JavaScript bundle went from 2.2 MB to 388 kB (108 kB gzipped).
   - The fallback admission posters are now right-sized WebP: 7.6 MB → 0.5 MB, with text still crisp.
   - Homepage page weight went from 8.9 MB to 1.7 MB.

## Lighthouse (mobile, local production build)

| Page | Performance | Accessibility | Best practices | SEO | LCP |
|---|---|---|---|---|---|
| `/` | 46 → **59–63** | 100 → 100 | 100 → **100** | 91 → 92 | 6.7 s → 6.8–7.2 s |
| `/about` | 42 → **65** | 88 → **100** | 96 → 96 | 92 → 92 | 7.2 s → 6.3 s |
| `/contact` | 57 → **67** | 93 → **100** | 100 → 100 | 92 → 92 | 7.8 s → 5.6 s |
| `/login-portal` | 59 → **69** | 84 → **100** | 100 → 100 | 91 → 92 | 7.3 s → 5.3 s |

CLS is 0 everywhere, before and after.

Homepage page weight: **8.9 MB → 1.7 MB.** The score varies ±4 between runs.

LCP stays around 7 s in Lighthouse's simulated slow-4G test because this is a fully client-rendered app: nothing paints until the JavaScript runs. Lazy-loading the dashboards and shrinking images removed most of the weight. The next real step is pre-rendering the public pages (see Follow-ups).

## Entry screen: removed, destinations relocated

- `GatewayLoader` and its state are deleted. `/` opens the homepage directly. The screen had no URL of its own, so no redirect was needed.
- The six destinations now live in the **Institutions** menu: a dropdown on desktop, and an expandable group in the mobile menu.
  - "Swagat Odisha": this is now simply the homepage.
  - RCTI (external, opens in a new tab).
  - Public School Ghantiguda, Sargiguda, Lakhna. These now use relative links to the same pages, instead of hard-coded `https://www.swagatodisha.com/...`, so they also work on preview deployments.
  - Coaching Centre: hidden until `COACHING_CENTRE_URL` is set (see above).
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
| Footer credit (new) | — | Designed & developed by Code Hyphen |
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
| Forgot password, intro | Enter your email address and we'll reset your password to the default value. | Enter the email you registered with and we'll send you a secure link to choose a new password. |
| Forgot password, button | Reset Password | Send reset link |
| Forgot password, result | Password Reset Initiated / Your password has been reset to the default value… + admin contact box + "Important Note" listing the default passwords | Check your email / (server message: "If an account exists for this email, we've sent a link… expires in 30 minutes.") / Didn't get it? Check your spam folder, or call us on +91 7855959544. |
| Reset password page (new) | — | Choose a new password / Use at least 8 characters, with a letter and a number. / Reset password → Password updated / Go to Login |
| Footer Support | Student Portal, Parent Portal, Career Guidance, Scholarships, FAQs | Student Portal, Parent Portal, Career Guidance (Scholarships and FAQs removed: no pages exist) |
| Footer legal row | Privacy Policy, Terms of Service, Cookie Policy | Privacy Policy, Terms of Service (Cookie Policy removed: no page exists) |
| Privacy Policy contact | Email: privacy@swagatgroup.edu.in / Phone: [Contact Number] / Address: [Institution Address] | Email: contact@swagatodisha.com / Phone: +91 7855959544 / Address: Sargiguda, PO - Sargul, PS - Kantabanji, Balangir, Odisha, Pin-767039 |

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
- The Privacy and Terms links (now pointing at their pages).
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
| Footer: 3 columns, placeholder agency copyright | 4 columns (Stay Updated added), legal links row, Swagat copyright + Code Hyphen credit | Existing content; your decision |
| Muted grey `#808080`, placeholder `#8F8F8F` | `#6B6B6B` / `#767676` | WCAG AA contrast |
| No visible focus style | Blue 2px focus ring | Keyboard accessibility |
| Footer links 29px apart | 44px tall on touch devices; Figma spacing on desktop | Tap-target rule |

## Follow-ups

**Security (backend, not changed):**
1. The production API returns full stack traces on errors. `/api/website-content` is public and includes a `paymentSettings` object. Both are worth a backend review.

**Content:**

2. **About claims:** it states "1000+ Students" and "95% student satisfaction rate". These are existing content; please confirm they're accurate (brand rule: never claim what can't be backed).
3. **Images:** add the 13 files from `IMAGE_BRIEF.md`. Until then, the slots show gradients, with no errors.
4. **Footer:** add Scholarships / FAQs / Cookie Policy back once those pages exist.

**Code health:**

5. **Performance:** pre-render the public pages (e.g. a static pre-render step for `/`, `/about`, `/gallery`, `/contact`, the school pages). This is the remaining big LCP win; it's an architecture change, so I didn't do it here.
6. **Dashboard-shared components (dashboards were out of scope):** `PasswordInput`'s show/hide toggle is 32px (below the 44px touch target), and the Terms component uses `h5` headings under the page `h1`. The admin `StudentManagement` screen still uses the `VITE_API_URL || localhost:5000` pattern.
7. **Now-unused code and packages:** `gsap`, `@gsap/react`, `components/Card.jsx`, `Button.jsx`, `ArrowUp.jsx`, `AboutUs.jsx`, `Admissions.jsx`, `ChairmanMessage.jsx`, `Management.jsx`, `Milestone.jsx` and `contexts/DarkModeContext.jsx`. A few unused `iconBg`/`color` data fields still hold old purple hex values.
8. **Service worker:** `public/sw.js` pre-caches `/` and `/index.html`. Make sure it isn't registered in production, or visitors may keep seeing the old homepage.
9. **Lint:** 374 pre-existing problems remain (none added).

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
5. **Fixes after review:**
   - fix(ui): footer credit links to Code Hyphen
   - fix(auth): replace default-password reset with emailed single-use reset links
   - fix(ui): reset-password page, live API for public content, image manifest, leadership photos
   - fix(ui): real footer links, privacy contacts, hide unlinked coaching centre, lazy-load dashboards
   - docs(redesign): update API request record
   - perf(ui): serve fallback posters as sized WebP (7.6 MB to 0.5 MB)
   - docs(redesign): report update after review fixes

`CLAUDE.md` (Brand & Copy rules) was updated locally but isn't committed: your global git-ignore excludes it.
