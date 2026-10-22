# Redesign Progress Log

Branch: `redesign/ui-v2` (created from `main` @ `0e266e6`). All redesign work stays on this branch; the owner merges to `main` after the final review. Screenshot folder is `Redesign/` (capital R), used in place of `./redesign/`.

## Status

| Phase | State | Notes |
|---|---|---|
| 0 Baseline | done | Build passes; lint has 351 pre-existing errors (don't fix, don't add); backend test not run (hits real Cloudinary/DB); baseline screenshots in `_baseline/` (git-ignored) |
| 1 Audit | done | `REDESIGN_AUDIT.md` |
| 2 Design system | done | `DESIGN_SYSTEM.md` |
| Checkpoint 1 | approved 2026-10-22 | Decisions below |
| 3 Foundations | done | Tokens, self-hosted fonts, `.site` scope, dark mode limited to dashboards |
| 4 Primitives | next | |
| 5–9 | not started | |

## Decisions (Checkpoint 1)

1. **Scope:** public site + login/register pages only. Dashboards are not touched.
2. **Banner posters** (`/api/sliders/public`): kept as a restyled poster carousel **below Explore Swagat**. The old full-width banner goes.
3. **Wording:** use the Figma section headings "Explore Swagat", "Our Campuses", "Get in touch with us". All other content stays exactly as it is. "Let's book a call" dials the main number (`CONTACT_INFO.phone`).
4. **Entry options:** Option A, an Institutions dropdown in the header (desktop) and an expandable group in the mobile menu.
5. **Dark mode:** removed from the public site, kept in the dashboards.
6. **Header/footer:** the new ones go on all public pages (About, Gallery, Contact, Send Message, legal, schools), replacing the floating "Back to main website" button.
7. **Purple brand colour:** may leave the public site.
8. **Logo:** the real `Swagat_Logo.png`, plus a white version for dark surfaces.
9. **Login/Register:** one pill with both links (desktop); "Login" pill + Register in the menu (mobile).
10. (see pending)
11. **"See all resources":** hidden (it never had a handler).
12. **Git:** commit the docs + screenshot script; screenshot folders are git-ignored.
- Mobile text minimum is **14px** (approved).
- Don't fix existing lint errors; don't add new ones.

### Still pending (the checkpoint reply left these as unfilled placeholders)
- **Hero text:** own copy, or the Figma line "Unlock limitless learning / One place, Knowledge"? Needed by Phase 6.
- **Coaching Centre URL:** a real URL, or remove the link for now? Needed by Phase 5.
- **Images:** designer exports in `Redesign/assets/`, or NASA public-domain images? Needed by Phase 6.
- **Copyright:** keep the Swagat text, or keep it and add "Designed by Codeyouridea"? Needed by Phase 5.

## Phase 3 notes (what exists now)

- `frontend/src/styles/site.css`: `@font-face` (Montserrat 400–700 and Inter 400–800 variable woff2, latin + latin-ext, `font-display: swap`, metric-matched Arial fallbacks), all `--sw-*` tokens on `:root` (colour channels, type scale with 768/1024 steps, layout, radius, shadow, motion, z-index), base styles scoped to `.site`, `.sw-container` / `.sw-container-wide` / `.sw-section`, focus ring, selection colour, reduced-motion rules.
- `frontend/tailwind.config.js`: new `sw-*` theme keys only (colours with opacity support, `font-sw-sans/display`, `text-sw-*` type scale, `rounded-sw-*`, `shadow-sw-*`, `max-w-sw-*`, spacing, durations, easing, z-index). Existing dashboard keys are unchanged.
- `frontend/public/fonts/`: font files + OFL licences. Montserrat latin is preloaded in `index.html`.
- `frontend/src/components/site/SiteRoot.jsx`: layout route wrapping every public route in `.site` and `MotionConfig reducedMotion="user"`. Phase 5 grows it into the header/footer shell.
- Dark mode: `DarkModeProvider` now sits inside the Router and applies `html.dark` only on `/dashboard*`. The `index.html` pre-paint script does the same. The saved `darkMode` preference is untouched.
- Icons: Lucide via the existing `react-icons/lu`. No new package.
- Specificity rule for new CSS: `:where(.site) element` beats the legacy element rules in `index.css`, and any Tailwind utility still beats it.

## Follow-ups noticed (not in scope)

- `public/sw.js` pre-caches `/` and `/index.html` and is registered by `utils/performance.js` (imported by the admin PerformanceDashboard). If it ever runs in production, visitors could get a stale homepage after the redesign ships. Check before launch.
- The Google Fonts `@import` for Baloo 2 + Lato in `index.css` stays for the dashboards. It still loads on public pages (render-blocking) until the public pages stop using those fonts. Revisit in Phase 8.

## How to re-capture screenshots

1. `cd frontend && npm run build && npx vite preview --host 127.0.0.1 --port 3001 --strictPort` (port 3001 is allowed by production CORS, so live data loads).
2. `cd Redesign/_tools && npm i --no-save playwright-core@1.48.2 && node shoot.mjs http://127.0.0.1:3001 ../_final` (optional 3rd arg: comma-separated route names). It uses `/usr/bin/google-chrome`, visits every public route at 1440 and 390, scrolls through the page without scrolling back (GSAP animations reverse on scroll-up), and clicks through the gateway for `home`. Once the gateway is removed in Phase 5, `home` no longer needs the click.

## Next

Phase 4: component primitives + dev-only `/_design` preview route.
