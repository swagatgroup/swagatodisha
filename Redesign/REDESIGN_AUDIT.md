# Redesign Audit (Phase 1)

Branch: `redesign/ui-v2` · Audit date: 2026-10-22 · Read-only, no app code changed.

## 0. Baseline (Phase 0)

| Item | Result |
|---|---|
| Framework | React 18.2 SPA (no SSR), `react-router-dom` 7.8 (`BrowserRouter`) |
| Build tool | Vite 6.3 (`frontend/vite.config.js`), terser `drop_console` in prod |
| Styling | Tailwind 3.4 (`darkMode: 'class'`) + `src/index.css` globals; heavy inline Tailwind arbitrary values (`bg-[#4A1D7A]`) |
| UI libs | framer-motion 12, gsap 3 (ScrollTrigger), sweetalert2 |
| Icons in use | `@remixicon/react` (main), `react-icons` 5.5 (has `react-icons/lu` = Lucide), `@heroicons/react`, Font Awesome CSS (`fa-solid` classes) |
| Fonts | Google Fonts `@import` of Baloo 2 + Lato in `index.css` |
| Package manager | npm 11.17 (package-lock.json), Node 24.19 |
| Deps installed | yes (`frontend/node_modules`, `backend/node_modules` present) |
| `npm run build` | passes (1m29s). One pre-existing warning: main chunk `index-*.js` is 2.38 MB (590 kB gzip) |
| `npm run lint` (frontend) | fails before any change: **388 problems (351 errors, 37 warnings)**: 306 no-unused-vars, 30 react-hooks/exhaustive-deps, 24 no-undef, 8 no-inner-declarations, 7 react-refresh, others |
| Backend lint | fails before any change: 13,306 problems (12,674 errors, mostly fixable formatting). Not touched by this project |
| Type-check | none configured (plain JS/JSX) |
| Tests | frontend: none. Backend: `test/fileUpload.test.js` only. **Not run**: it exercises uploads against the real Cloudinary/Mongo config in `backend/.env`, and the redesign does not touch backend code |
| Dev server | `npm run dev` starts on 127.0.0.1:3001 and serves the app (API proxy needs local backend on :5000) |
| Baseline screenshots | `Redesign/_baseline/<route>@1440.png` and `@390.png`, 16 routes x 2 widths, all loaded without page errors (`_log.txt`) |

How the baseline was captured: production build served with `vite preview` on `127.0.0.1:3001` (an origin the production backend's CORS allows), so screenshots show **live production data**. The local backend was not started because `backend/.env` points at the live Atlas cluster. Playwright (`playwright-core` + system Chrome) lives in a scratch folder, not in the app's `package.json`.

Live public data at capture time (for "nothing lost" checks):
- `/api/sliders/public`: 5 horizontal + 3 vertical banner images (admissions posters).
- `/api/admin/quick-access/public`: 5 active docs (3 `result`, 2 `timetable`, **0 `notification`**).
- `/api/website-content`: `approvalsRecognitions` = 0, `staffProfiles` = 0, so the Approvals section and About "Our Team" render nothing today.
- `/api/gallery/public`: 0 images.

## 1. Route map

Public marketing routes use no shared layout. Only the homepage and the three school pages render `Header` and `Footer`. About, Gallery, Contact and Send Message use a floating "Back to main website" button (`BackToMainWebsite`) instead.

| Route | Component | Shows | Shell |
|---|---|---|---|
| `/` | `AppContent` in `App.jsx` | **Gateway first** (`GatewayLoader`), then homepage | Header + Footer |
| `/about` | `AboutUsPage.jsx` | Intro, Mission/Vision, values, milestones timeline, leadership, why-choose, achievements, CTA, Our Team (`website-content.staffProfiles`) | BackToMainWebsite |
| `/gallery` | `Gallery.jsx` | Category filter, image grid (`/api/gallery/public`), lightbox, stats, CTA | BackToMainWebsite |
| `/contact` | `ContactPage.jsx` → `ContactUs` | Same contact section as homepage | BackToMainWebsite |
| `/send-message` | `SendMessage.jsx` | Standalone contact form (reCAPTCHA, file upload) → `/api/contact/submit` | BackToMainWebsite |
| `/terms-and-conditions` | `legal/TermsAndConditions.jsx` | Static legal text | none |
| `/privacy-policy` | `legal/PrivacyPolicy.jsx` | Static legal text | none |
| `/SwagatPublicSchool_Ghantiguda`, `_Sargiguda`, `_Lakhna` | `schools/*` → `SchoolPageTemplate.jsx` | Per-school hero, features, programs, facilities, achievements, contact; `Helmet` SEO tags | Header + Footer |
| `/login-portal` | `auth/LoginPortal.jsx` | 3 login cards (Student/Agent/Staff) + "Track Your Application" (`ApplicationStatusSearch` → `/api/students/public/status`) | own |
| `/login/student`, `/login/agent`, `/login/staff` | `auth/Login.jsx` (title prop) | Login form | own |
| `/login` | redirect → `/login-portal` | | |
| `/register` | `auth/Register.jsx` | Registration (`/api/public-settings`, `/api/referral/verify/:code`) | own |
| `/dashboard` | `DashboardRouter` | Redirects by role | |
| `/dashboard/student\|agent\|staff\|admin` | `dashboard/*Dashboard.jsx` (+98 files in dashboard/admin/agents/staff/forms/documents/shared) | Role dashboards (protected) | `DashboardLayout` |
| `*` | redirect → `/` | | |

Global on every route: `FloatingContact` (call / WhatsApp channel / WhatsApp DM floating button).

## 2. Component inventory (public site)

| Component | Used in | Maps to redesign element |
|---|---|---|
| `Header.jsx` | home, school pages | **Header**: logo left, dark glass pill nav centre, "Login / Register" pill right; mobile hamburger, centred logo, "Login" pill |
| `HeroCarousel.jsx` | home | **Remove** (old banner), replaced by the space hero. See §5 for the content question |
| `GatewayLoader.jsx` | home (gate) | **Remove**. See §4 |
| `QuickLinks.jsx` | home | **Explore Swagat**: 4 black tiles with blurred-gradient icon panes + "See all resources" pill |
| `ApprovalsRecognitions.jsx` | home | No equivalent → derive (dark card slider in the new card language). Renders `null` when there's no data (currently true) |
| `InstitutionTypes.jsx` | home | **Our Institutions**: 8 wide black cards (image, title, subtitle, description, `+`) |
| `Location.jsx` | home | **Our Campuses** (2 map cards + Get Direction) + **Why choose our location?** (timeline + badge cards) |
| `ContactUs.jsx` | home, `/contact` | **Get in touch** (grey panel: form left, copy right) + **Connect with us** (brand-colour social tiles) |
| `Footer.jsx` | home, school pages | **Footer**: black, 3 link columns, centred copyright, giant "Swagat Odisha" watermark |
| `FloatingContact.jsx` | all routes | No equivalent → derive (black/glass round buttons) |
| `BackToMainWebsite.jsx` | about, gallery, contact, send-message | No equivalent → replace with the new Header if approved (Q6) |
| `AboutUsPage`, `Gallery`, `SendMessage`, `legal/*`, `schools/SchoolPageTemplate`, `auth/*` | own routes | No Figma frame → derive from the system |
| `shared/DarkModeToggle.jsx` | Header, `DashboardLayout` | Not in Figma (Q5) |
| `AboutUs`, `Admissions`, `ChairmanMessage`, `Management`, `Milestone` | imported in `App.jsx`, **never rendered** | Dead code today; leave alone unless you want them removed in cleanup |
| `Card.jsx`, `Button.jsx`, `ArrowUp.jsx` | **unused anywhere** | Dead code. New primitives will be built fresh |

## 3. Content inventory ("nothing lost" checklist)

### Homepage, top to bottom (current order)
1. **Banner** (`HeroCarousel`): images from `/api/sliders/public?sliderType=horizontal` (>1000px wide) or `vertical` (≤1000px), sorted by `order`, auto-advance every 5 s, dot indicators, refetched every 30 s. Fallback: 3 bundled vertical images (`assets/images/vertical slider*.png`). Fields rendered: `image` only (`title`, `description` and `link` exist in the API but are not shown). **Live content: 5 admissions posters ("Admission Open Session 2026-27", course lists, phone numbers).**
2. **Quick Access** (`QuickLinks`): `/api/admin/quick-access/public`, filtered by `type` (`timetable`, `notification`, `result`) and `isActive`, sorted by `order`. Per doc it renders `title`, `description` (fallback title), PDF/image icon; click opens `file` in a new tab. Desktop hover opens an auto-scrolling overlay list with loading and empty ("No documents available") states. Header text: "Quick Access" / "Hover over cards to see available documents with blinking links". Card copy: Time Tables / "View schedules from different universities"; Career Roadmaps / "Explore career paths and opportunities"; Notifications / "Stay updated with latest news"; Results / "Check academic performance". Button "View All Resources" has **no handler** today.
   - **Notifications** = the `notification` docs in this component (0 live right now, so the empty state shows).
   - **Career roadmap** = modal opened by the Career card: "🎯 Career Roadmap After 10th", root "Career Tree / Choose Your Path After 10th", 4 streams (Science, Commerce, Arts & Humanities, Vocational & Technical) → 3 paths each → 5–10 careers each (`name`, `duration`, `scope`), "View N More Options" / "Show Less", and a "Need Career Guidance?" CTA that dials `CONTACT_INFO.phone`. All data is hard-coded in `QuickLinks.jsx` (`careerOptions`).
   - A PDF viewer modal (`pdfViewer` state) exists, but nothing opens it (dead path). It will be kept as is.
3. **Approvals & Recognitions**: `/api/website-content` → `approvalsRecognitions` (active, sorted). Slider with name, details, PDF download. Hidden when empty. Uses `VITE_API_URL || localhost:5000` instead of the shared `api` instance (pre-existing; not changed).
4. **Institution Types**: 8 hard-coded institutions (`name`, `subtitle`, `description`, `icon`, `programs[]`) → modal ("Available Programs", badges "Has Sub-Categories" / "Visit Website") → sub-modal (programs/courses) → course modal. The School modal links to the 3 public-school pages. The Figma's 8 cards match this data 1:1 (same names, subtitles and descriptions).
5. **Locations** (`Location`): 2 campuses (name, address, phone, email, Google Maps embed iframe, "Get Directions" link to Google Maps directions). Header "Our Locations" + intro sentence. "Why Choose Our Location": Strategic Locations / Modern Infrastructure / Safe Environment, each with its own real description. "Plan Your Visit": By Bus / By Car / By Train with descriptions.
6. **Contact** (`ContactUs`): header "Get In Touch" + sentence; "Let's Start a Conversation" + 2 paragraphs; logo + tagline; "Get In Touch Directly" (tel/mailto); "Connect With Us" (5 socials from `SOCIAL_LINKS`); form "Send Us a Message": Full Name*, Email*, Phone* (10-digit pattern), Subject*, Message*, Upload Documents (multi-file, accepted types and 10 MB note, selected-file list), hidden honeypot, reCAPTCHA v3, submit → `/api/contact/submit` with SweetAlert feedback.
7. **Footer**: Quick Links (About Us, Programs, Admissions, Gallery, Contact: `#` anchors), Our Programs (5, all `#`), Support (Student Portal, Parent Portal, **Career Guidance**, Scholarships, FAQs: all `#`), **Stay Updated** newsletter (web3forms POST + SweetAlert), copyright "© {year} Swagat Group of Institutions. All rights reserved.", Privacy Policy / Terms of Service / Cookie Policy (all `#`).

Present today but **not in the Figma** (to be kept and styled): Approvals section, "Plan Your Visit", campus address/phone/email on desktop, contact logo + tagline, "Get In Touch Directly", form labels and the Upload Documents field, newsletter, "Career Guidance" footer link, legal links bar, dark-mode toggle, FloatingContact, separate Login and Register buttons.

## 4. Entry screen ("gateway") analysis

- **Where:** `frontend/src/components/GatewayLoader.jsx`, gated in `App.jsx` `AppContent` by `const [showGateway, setShowGateway] = useState(true)`.
- **Trigger:** plain component state. No route, no localStorage flag. It shows on **every** mount of `/`, including when users come back from `/about` etc. through "Back to main website".
- **Removal:** delete the state and early return in `AppContent`, then delete the component. No URL belongs to the gateway, so no redirect is needed; `/` simply renders the homepage.

| # | Option | Destination | Status |
|---|---|---|---|
| 1 | Swagat Odisha – Group of Institutions | closes the gateway (homepage) | Becomes the default; nothing to relocate |
| 2 | RCTI – Swagat Odisha | `https://www.rcti.swagatodisha.com` (external) | Linked **only** from the gateway today |
| 3 | Public School – Ghantiguda | `/SwagatPublicSchool_Ghantiguda` | Also in Institutions → School modal |
| 4 | Public School – Sargiguda | `/SwagatPublicSchool_Sargiguda` | Also in Institutions → School modal |
| 5 | Public School – Lakhna | `/SwagatPublicSchool_Lakhna` | Also in Institutions → School modal |
| 6 | Coaching Centre – Bhawanipatna | `https://www.swagatodisha.com/SwagatCoachingCentre_Bhawanipatna` | **Broken:** no such route exists, so the catch-all sends users back to `/` (the gateway) |

Note: options 3–6 use absolute `https://www.swagatodisha.com/...` URLs, so on preview/staging deployments they jump to production.

## 5. Homepage banner analysis

- Component: `frontend/src/components/HeroCarousel.jsx` (rendered in `App.jsx` inside `<section id="home">`).
- Assets used only by it: `src/assets/images/vertical slider.png`, `vertical slider 2.png`, `vertical slider 3.png` (fallback images).
- Styles: inline styles plus Tailwind classes in the component; no separate CSS.
- Data dependency: `/api/sliders/public`, managed by admins in `admin/SliderManagement.jsx` (super-admin dashboard). **Removing the banner removes the only public display of these admin-uploaded posters.** Today they carry real admissions content (sessions, courses, phone numbers). Decision needed (Q2).
- Navigation: `#home` is the anchor id; the new hero will keep `id="home"`.

## 6. Styling debt

- **Hard-coded colours:** about 627 hex literals across public-site components (3,307 across all of `src`). Brand purple `#4A1D7A` is used inline everywhere, often as `bg-clip-text text-transparent` on solid colours.
- **Two token systems that drift:** `:root` CSS vars in `index.css` and `brand.*` colours in `tailwind.config.js` hold the same values twice. A remapped `purple` scale silently changes Tailwind's `purple-*` site-wide (dashboards included).
- **Legacy aliases** kept "so old code doesn't break": `futuristic`, `glow-*` shadows, `font-display`, `font-futuristic`.
- **Inline styles** for layout and animation in Header (6), HeroCarousel (3), QuickLinks (3), plus `transform: none` / `willChange` hacks in Header and HeroCarousel.
- **Three animation systems** on one page: GSAP ScrollTrigger (QuickLinks; its cleanup kills *all* ScrollTriggers), framer-motion everywhere, and CSS keyframes. None respects `prefers-reduced-motion`.
- **Duplicated markup:** QuickLinks document list rendered twice for the marquee loop (about 90 duplicated lines); three nearly identical institution modals; footer columns copy-pasted.
- **Dark mode** is on by default for OS-dark users (inline script in `index.html`), with about 4,000 `dark:` classes in dashboards alone.
- **Shared globals:** `index.css` and `tailwind.config.js` are shared by the public site **and** all dashboards, so any global token or reset change reaches the dashboards (Q1).
- **Fonts** loaded through a render-blocking Google Fonts `@import` inside CSS.
- **Bundle:** single 2.38 MB main chunk (three.js, Spline, GSAP, recharts all in the main graph).

Out-of-scope observations (not fixing, flagging only): the production API returns full stack traces in 500 responses (seen on CORS rejections), and `/api/website-content` is public and includes a `paymentSettings` object. Worth a backend review separately.
