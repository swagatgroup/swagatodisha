# Design System (Phase 2), extracted from the Figma exports

Sources: `Redesign/Desktop.png` (1440 x 6909) and `Redesign/Mobile.png` (402 x 3492). Colours were sampled pixel by pixel. Type sizes were fitted by rendering Montserrat and Inter at candidate sizes and matching the measured ink width of real strings in the screenshots, so they are usually accurate to ±1px.

**Character in one line:** monochrome, high-contrast "space" aesthetic. Pure black hero, cards and footer on a white page; dark glass pills; soft blurred-gradient tiles; planet photography as the only real colour; pastel badges as the only UI colour.

## 1. Colour

| Token | Hex | Where seen |
|---|---|---|
| `--c-black` | `#000000` | Cards, footer, Send button, headings text |
| `--c-ink` | `#010101` | Hero background (photo edge) |
| `--c-white` | `#FFFFFF` | Page background, text on dark |
| `--c-glass` | `#3A3A3A` (fill) / `#494949` (top rim) | Nav pill, Login pill, Get Direction pill |
| `--c-surface-muted` | `#F8F8F8` | Contact panel |
| `--c-surface-pill` | `#F9F9F9` | "See all resources" pill |
| `--c-border-dark` | `#333333` → `#474747` | Explore tile rim (1–2px, lighter at top) |
| `--c-border-light` | `#E5E5E5` | Why-choose card outline |
| `--c-dot` | `#EAEAEA` | Dotted map decoration |
| `--c-watermark` | `#131516` | Footer "Swagat Odisha" watermark |
| `--c-badge-blue` | `#D0E9FB` | Badge "Strategic Locations" |
| `--c-badge-lavender` | `#D9DFFF` | Badge "Modern Infrastructure" |
| `--c-badge-peach` | `#FFE7C3` | Badge "Safe Environment" |
| `--c-placeholder` | `#8F8F8F` | Input placeholders |

**Neutral scale** (derived from the samples, 0 = white): `0 #FFFFFF · 25 #F9F9F9 · 50 #F8F8F8 · 100 #EAEAEA · 200 #DFDFDF · 300 #BFBFBF · 400 #9F9F9F · 500 #808080 · 600 #606060 · 700 #404040 · 750 #3A3A3A · 800 #202020 · 850 #131516 · 900 #000000`.

**Text colours.** On light: primary `#000000`, secondary `#404040`, muted `#808080` (implemented as `#6B6B6B`, and placeholders `#8F8F8F` as `#767676`, so both pass WCAG AA 4.5:1 on white). On dark: primary `#FFFFFF`, secondary `#BFBFBF`, muted `#8A8A8A`. Card titles on dark use a **left-to-right gradient fill** `#8A8A8A → #FFFFFF` (Institutions titles and subtitles, Explore tile labels).

**State colours.** None appear in the Figma. Derived to fit the pastel badge language (text on pastel, all ≥ 4.5:1):
success `#1E7A46` on `#D7F5E3` · warning `#8A5A00` on `#FFE7C3` · error `#B42318` on `#FDE2E1` · info `#0B5CAD` on `#D0E9FB`.

**Brand colour.** The redesign uses **no** purple, gold or teal. The current Royal Indigo `#4A1D7A` palette disappears from the public site (Open question Q7).

## 2. Typography

| Family | Role | Match confidence |
|---|---|---|
| **Montserrat** (400/500/600/700) | Everything: nav, headings, body, buttons, footer | High (letterforms, `g`, `W`, `?` match) |
| **Inter** (400 and 700/800) | "Why choose our location?" display, footer watermark, Explore tile labels | High for display/watermark; medium for tile labels (alternative: Geist) |

Desktop scale (1440 frame), measured:

| Style | Family / weight | Size / line-height | Tracking | Example |
|---|---|---|---|---|
| Display XL | Inter 800 | 180px / 1 | -0.02em | footer watermark (clipped by page bottom) |
| Display | Montserrat 700 | 64px / 1.3 | 0 | Hero "Unlock limitless learning" |
| Display alt | Inter 700 | 60px / 1.05 | -0.01em | "Why choose our location?" |
| H2 (section) | Montserrat 700 | 32px / 1.2 | 0 | Explore Swagat, Our Institutions, Our Campuses, Get in touch, footer column titles |
| Section subtitle | Montserrat 400 | 24px / 1.3 | 0 | "Everything you need, one click away." |
| H3 (card title) | Montserrat 500–600 | 24px / 1.2 | -0.01em | Institution name, campus name, "Connect with us" |
| Body L | Montserrat 400 | 24px / 1.1 | 0 | Why-choose card body, footer links |
| Body | Montserrat 400 | 16px / 1.5 | 0 | Institution description, contact copy |
| Label / button | Montserrat 500–600 | 20px / 1 | 0 | Nav items, Login, Let's book a call, Get Direction, See all resources |
| Small label | Montserrat 600 | 16px / 1 | 0 | Badges, "Let's Start a Conversation", Send |
| Tile label | Inter 400 | 22px / 1.4 | -0.02em | "Time Table", "Notification" (gradient fill) |
| Caption | Montserrat 400 | 16px | 0 | Copyright |

Mobile scale (402 frame), measured: hero 24px, section H2 24px ("Explore Swagat" is 16px in the frame, which looks like an inconsistency; I'll normalise it to 24px), card title ~12–14px, body **8px**, campus address 12px.
**Deviation (approved):** 8px body text is unreadable and fails WCAG, so every text style has a **14px minimum** on mobile. Layout proportions stay the same. Implemented values live in `frontend/src/styles/site.css` (`--sw-fs-*`).

## 3. Spacing and layout

- **Base unit 8px.** Scale: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 80 · 104.
- **Content container: 992px** (x 224–1216 at 1440). Contact panel bleeds to 1044px. Header is full-bleed with a 16–20px edge inset.
- **Section rhythm:** heading block → 64–96px → content; about 64px between sections. Section heads are centred (H2 plus subtitle stacked with no gap); the exception is "Why choose…", which is left-aligned and oversized.
- **Grids (desktop):** Explore 4 x 200px tiles with 64px gaps (centred). Institutions single column of 992px cards with 48px gaps. Campuses 2 x 442px cards with a 108px gap. Contact 2 columns inside the panel (form 368px | copy about 430px). Footer 3 columns in a centred group.
- **Grids (mobile, 402 frame):** 35px side gutters (I'll use 16–24px per the brief's 16px minimum and to give the cards more room). Explore 2 x 2. Institutions single column with the image moved to the **right** at 50px. Campuses stack: map card left, address/phone/email right. Contact form full width, copy column hidden in the frame (it will be kept, below the form).

## 4. Shape and depth

| Token | Value | Use |
|---|---|---|
| `--r-sm` | 8px | Inner image panes, inputs, Send button, badges' container cards |
| `--r-md` | 10px | Institution / campus / explore cards |
| `--r-pill` | 9999px | Nav, Login, CTA pills, badges |
| `--border-hairline` | 1px | Why-choose cards (`#E5E5E5`), glass rims |
| `--shadow-input` | `0 4px 4px rgba(0,0,0,.25)` | Inputs (hard, short, downward) |
| `--shadow-card-offset` | `4px 4px 6px rgba(0,0,0,.25)` | Why-choose cards (offset right and down) |
| `--shadow-soft` | `0 4px 16px rgba(0,0,0,.10)` | "See all resources" pill, social tiles |
| Glass (dark) | fill `#3A3A3A` @ ~90% + 1px top-lit rim `rgba(255,255,255,.12)` + `backdrop-filter: blur(12px)` | Nav, Login, Get Direction |
| Glass (on photo) | `rgba(255,255,255,.18)` + 1px `rgba(255,255,255,.45)` + blur(8px) | Hero "Let's book a call" |
| Blurred-gradient pane | 2–3 radial gradients (pastel: cream/lilac/pink/peach/steel) + blur, rendered in CSS | Explore tile panes (no image assets needed) |

## 5. Iconography

- Style: **outline, 1.5px stroke** (tile icons: calendar-days, compass, bell-ring, file-minus) with **heavier 2.5–3px** strokes for directional and action glyphs (arrow-up-right, plus, menu). Phone in the hero CTA is **filled**.
- Library match: **Lucide** (glyph shapes match: `calendar-days`, `compass`, `bell-ring`, `file-minus`, `arrow-up-right`, `send`, `map-pin`, `map`, `phone`, `mail`, `plus`, `menu`).
- **No new dependency needed:** `react-icons@5.5` (already installed) ships Lucide as `react-icons/lu`.
- Sizes: 16 (inline), 20 (buttons), 28–32 (arrows, plus), 40 (tile icons).
- Social icons are **full-colour brand marks** on 54px rounded tiles (Facebook blue, X black, Instagram gradient, YouTube red-on-white, LinkedIn blue). They can be built from the existing Remix `*Fill` icons with brand-colour backgrounds, so there's no new dependency there either.

## 6. Imagery and decoration

- **Hero:** full-bleed photo of Earth from orbit (black space, starfield specks), the planet's limb arcing from the lower left. Headline is centred over it. An inline **pill-shaped image** (a Mars texture, 90 x 44) sits inside the second headline line.
- **Institution cards:** one planet/space photo per card (Earth, Neptune, Jupiter, Mars, Milky Way, ringed planet, Uranus, Jupiter), 200 x 200, radius 8.
- **Campuses:** static, desaturated Google-Maps-style image with a dark tint. Campus name is overlaid top-left.
- **Dotted map:** abstract shapes made of `#EAEAEA` dots (~16px, 24px pitch) behind the campus cards.
- **Decorative cursors:** outline "pointer hand" glyphs beside the "Why choose" heading and the last card (playful, implies interactivity).
- **Logo:** the frames show a 3D "grad cap on book" emoji-style icon, not the Swagat logo (Q8).
- **Odisha-specific motifs:** none. The theme is space/universal. "Inspiring spaces across Odisha" is the only regional cue.

## 7. Components seen

| Component | Spec |
|---|---|
| **Header (desktop)** | Transparent over the hero. Logo 48px at left. Centred glass pill (h 52, px 20, item gap ~13px, Montserrat 500 20px white). Right glass pill "Login / Register" (h 52). |
| **Header (mobile)** | Hamburger (3 thick bars) left, logo centre, glass "Login" pill right. Menu panel not drawn (derive: full-height black sheet, items as large white Montserrat links). |
| **Hero** | 1024px tall desktop, about 437px tall mobile. Headline 2 lines centred. Glass CTA pill "Let's book a call" + filled phone icon near the bottom. |
| **Section header** | Centred H2 32px bold + 24px regular subtitle, no gap. |
| **Explore tile** | 200 x 260 black, r10, 1–2px graded rim, inner blurred-gradient pane 168², icon 40px white/85%, label bottom-left (gradient Inter), ↗ arrow bottom-right. |
| **Pill button (light)** | "See all resources": `#F9F9F9`, soft shadow, Montserrat 600 20px black, trailing `send` icon. |
| **Pill button (dark glass)** | Login, Get Direction: `#3A3A3A` glass, white Montserrat 500 20px, optional trailing icon. |
| **Institution card** | 992 x 232 black r10. Image 200² r8 left (inset 16). Title (gradient) / subtitle (gradient, light) / 32px gap / body 16px white. `+` 32px bottom-right. |
| **Campus card** | 442 x 494 black r10. Map pane 410 x 388 r8 with overlaid name (white 600 24px). Glass "Get Direction" pill centred below. |
| **Timeline list** | 3px black vertical rule; 36px horizontal ticks to each card. White card r8, hairline border, offset shadow. Pastel badge pill top-left. Body 24px. |
| **Badge / tag** | Pill, padding 4px 8px, Montserrat 600 16px black on pastel (blue / lavender / peach). |
| **Input / textarea** | White, r8, no border, `--shadow-input`, placeholder `#8F8F8F` Montserrat 16px, h 32 (textarea 64). |
| **Primary button (form)** | Full-width black r8, white Montserrat 700 16px, h 32. |
| **Panel** | `#F8F8F8` r8, padding 24. |
| **Social tile** | 54px r10 brand colour, soft shadow, 16px gap. |
| **Footer** | Black. 3 columns (heading 32px bold, links 24px regular, line-height 1.2). Centred 16px copyright. Giant Inter watermark `#131516` clipped at the bottom edge. |

## 8. Layout patterns

Single-column narrative, centred 992px measure, generous white space, **alternating light page with heavy black objects** (cards are black slabs on white). Density is low: one idea per section. Asymmetry appears only in "Why choose" (left-aligned display heading plus timeline). The right half there is empty in the frame, which is a natural home for "Plan Your Visit".

## 9. Motion (implied; keep subtle)

- Pills: background lighten on hover (glass `#3A3A3A` → `#4A4A4A`), 150ms.
- Explore tiles: lift 4px plus gradient pane slow drift; ↗ arrow nudges up-right 2px.
- Institution `+`: rotate 90° on hover/open.
- Section entrance: 12px fade-up, 400ms, once (replaces the current GSAP "reverse on scroll up").
- All motion behind `@media (prefers-reduced-motion: no-preference)`.

## 10. Breakpoints

| Name | Range | Behaviour |
|---|---|---|
| mobile | < 768px | Mobile frame: hamburger header, 2-col Explore, institution image right, stacked campuses |
| tablet | 768–1023px | Desktop compositions at reduced scale: 2-col Explore, institution image left at 160px, 2 campuses side by side; hamburger header |
| desktop | ≥ 1024px | Desktop frame; pill nav appears; 992px container from 1056px up |

Type steps between frames: display 64 → 40 (tablet) → 28 (mobile), H2 32 → 28 → 24, subtitle 24 → 20 → 16.

## 11. Open questions (design-level)

1. Full-resolution assets: hero Earth, the Mars pill, 8 planet images, map images. The screenshots are 1x with text burnt in. Can the designer export them, or should I use public-domain NASA imagery that matches?
2. The logo shown is a placeholder 3D icon. Use the real `Swagat_Logo.png` (needs a white/inverted variant for the black header)?
3. Explore tile order differs between frames (desktop: Time Table, Career Roadmap, Notification, Result; mobile: Notification, Result, Time Table, Career Roadmap). Match each frame, or one order everywhere?
4. Mobile menu, hover/focus states, empty/loading/error states, modals and every non-home page are undrawn. I'll derive them from the rules above.
5. Dark mode is not drawn (see Q5 in the checkpoint).
