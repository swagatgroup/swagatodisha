# Image Brief

Every photo slot in the redesign is already wired to a file in `frontend/public/images/redesign/`. Until a file exists, the slot shows a dark gradient placeholder. Drop a file in with the exact name below and it appears on the next deploy, with no code changes.

**13 files in total.** The desktop hero is the only image that loads eagerly; everything else below the fold is lazy-loaded.

## Rules for every file

- **Format:** WebP (`.webp`), quality 75–80. Keep each file under the size listed.
- **Exact pixel size** as listed (these are 2x the displayed size, for sharp screens). Crop to the stated aspect ratio before exporting.
- **No text, logos, watermarks or UI** in the image. Headlines are drawn by the page on top.
- **People:** AI-generated or stock models only. Don't use photos of real students or staff unless you have their written consent.
- **One look for the whole set.** Paste this colour grade at the end of every prompt:

> **Colour grade (shared):** dark and moody, near-monochrome (desaturated to about 10–15% colour), deep rich blacks, low-key lighting, soft warm highlights only on the subject, gentle film grain, high contrast, cinematic, shot on a 35mm lens, no text, no logos.

How to convert to WebP: export PNG/JPG from the generator, then use squoosh.app (free, in the browser): WebP, quality 78, resize to the exact size.

---

## 1. Homepage hero (desktop)

| | |
|---|---|
| **Filename** | `hero-desktop.webp` |
| **Used in** | Homepage hero, full-bleed behind "Your degree, start to finish." (screens 768px and wider) |
| **Size / ratio** | 2880 × 2048 px · 1.41 : 1 · max 450 KB |
| **Composition** | Keep the centre third calm and dark: the headline, badges and buttons sit there. Subject towards the edges or lower third. |

**Prompt:**
Konark Sun Temple in Odisha at dusk, the great carved stone chariot wheel in the lower right foreground, the temple silhouette fading into a deep dark sky, faint last light on the stone edges, wide establishing shot with a large calm dark area in the centre for text, quiet and majestic. *(+ shared colour grade)*

**Pexels search:** `konark sun temple dusk` · alternative `ancient temple night silhouette`

## 2. Homepage hero (mobile)

| | |
|---|---|
| **Filename** | `hero-mobile.webp` |
| **Used in** | Homepage hero on phones (below 768px) |
| **Size / ratio** | 780 × 1400 px · 9 : 16 (portrait) · max 200 KB |
| **Composition** | Portrait crop of the same scene. Subject in the bottom third; top two-thirds dark for the text. |

**Prompt:**
Vertical portrait shot of the Konark Sun Temple chariot wheel at dusk, the wheel filling the lower third, dark open sky above, faint warm edge light on the carved stone, quiet and majestic. *(+ shared colour grade)*

**Pexels search:** `konark wheel` · alternative `stone wheel temple vertical`

## 3. Headline pill image

| | |
|---|---|
| **Filename** | `hero-pill.webp` |
| **Used in** | The small rounded image inside the hero headline, after "Your degree," |
| **Size / ratio** | 360 × 180 px · 2 : 1 · max 30 KB |
| **Composition** | Simple, readable at tiny size: one object, centred. |

**Prompt:**
Close-up of a black graduation cap with a tassel resting on a stack of books, warm soft rim light, simple dark background, horizontal crop. *(+ shared colour grade)*

**Pexels search:** `graduation cap books` · alternative `mortarboard close up`

---

## 4–11. Institution cards (8 images)

| | |
|---|---|
| **Used in** | Homepage "Our Institutions" cards (image left on desktop at 192 px, right on mobile at 64 px) |
| **Size / ratio** | 400 × 400 px · 1 : 1 · max 60 KB each |
| **Composition** | One clear subject, centred, readable when small. |

| # | Filename | Prompt (+ shared colour grade) | Pexels search |
|---|---|---|---|
| 4 | `institution-school.webp` | Young school children in uniform seen from behind, walking into a simple classroom in rural Odisha, soft window light, school bags on their backs. | `indian school children classroom` |
| 5 | `institution-higher-secondary.webp` | A teenage student writing in a notebook at a wooden desk at night, a single desk lamp, open textbooks, focused and calm. | `student studying night lamp` |
| 6 | `institution-degree-college.webp` | A graduate in a black gown and cap holding a rolled certificate, photographed from the shoulders down, warm rim light, dark background. | `graduation gown certificate` |
| 7 | `institution-management-school.webp` | Top-down view of a laptop, notebook with handwritten charts, pen and a cup of tea on a dark wooden desk at night. | `laptop notebook desk night` |
| 8 | `institution-paramedical.webp` | A stethoscope resting on open medical textbooks, soft light from the side, clean and calm. | `stethoscope books` |
| 9 | `institution-engineering.webp` | Close-up of an engineering student's hands with a drafting compass over technical drawings and a small circuit board, desk lamp light. | `engineering drawing compass` |
| 10 | `institution-teacher-education.webp` | A teacher's hand writing on a chalkboard in a simple Odisha classroom, chalk dust in the light, seen from behind the desks. | `teacher chalkboard classroom india` |
| 11 | `institution-computer-academy.webp` | Hands typing on a laptop keyboard in a dark room, the screen glow lighting the fingers, lines of code softly blurred. | `typing laptop dark` |

---

## 12. School page hero (desktop)

| | |
|---|---|
| **Filename** | `school-hero-desktop.webp` |
| **Used in** | Top of the three Swagat Public School pages (Ghantiguda, Sargiguda, Lakhna), screens 768px and wider |
| **Size / ratio** | 2880 × 1600 px · 1.8 : 1 · max 400 KB |
| **Composition** | Centre kept dark and calm for the school name and buttons. |

**Prompt:**
Children with school bags walking along a village road towards a small school building in rural Odisha at golden hour, seen from behind, long soft shadows, paddy fields at the edges, wide shot with a calm dark centre. *(+ shared colour grade)*

**Pexels search:** `village school children india` · alternative `rural school road sunset`

## 13. School page hero (mobile)

| | |
|---|---|
| **Filename** | `school-hero-mobile.webp` |
| **Used in** | Same, on phones (below 768px) |
| **Size / ratio** | 780 × 1200 px · 13 : 20 (portrait) · max 180 KB |

**Prompt:**
Vertical shot of two children with school bags walking down a village road in rural Odisha at golden hour, seen from behind, the road leading towards a small school, dark sky in the upper half. *(+ shared colour grade)*

**Pexels search:** `children walking to school india vertical`

---

## Checklist when dropping files in

1. Save each file with the exact filename into `frontend/public/images/redesign/`.
2. Check the pixel size and that it's under the size limit.
3. Run the site and look at the homepage, one school page, and the homepage on a phone-sized window.
4. Commit the images and deploy.

If one image looks brighter or more colourful than the rest, run it through the same desaturation before exporting so the set stays consistent.
