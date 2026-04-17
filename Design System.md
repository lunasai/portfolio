---
created: 2026-04-15
updated: 2026-04-16
references: "[[Personal Brand.md]]"
scope: portfolio site (index.html · about.html)
status: v2
---

# Luna Borgo — Portfolio Design System

CSS-level implementation reference. Read before touching any CSS in `index.html` or `about.html`. For brand voice and visual direction, see `Personal Brand.md`.

---

## 1. Color Tokens

All colors are CSS custom properties. **Never write a raw hex or `rgb()` value in a `<style>` block.** Every color must reference a token.

**Dark and light are the two primary themes.** All design decisions, token values, and new features are defined for dark and light first, and those changes apply to the fun theme automatically unless a change is explicitly called out as fun-only.

Dark and light are declared in four locations that must stay in sync:
`:root` · `@media (prefers-color-scheme: light) :root` · `[data-theme="dark"]` · `[data-theme="light"]`

**Fun is a supplemental theme** (`data-theme="fun"`) that layers on top of the primary themes. It follows the dark palette for surfaces and gets its own overrides only where the fun aesthetic specifically requires them (inverted brand colours, Nintendoid 1 font, no italics). See § 1.4 for its specific overrides and § 1.4 maintenance rule for how to keep it in sync.

### Semantic tokens

Reach for these first, every time.

| Token | Dark | Light | Role |
|---|---|---|---|
| `--color-bg` | `#0e0b09` | `#f6f4ff` | Page background |
| `--color-text` | `#faf3e3` | `#120f2a` | Primary text, icons |
| `--color-surface` | `#161210` | `#ebe7ff` | Card / elevated surface |
| `--color-primary` | `#9b8fff` | `#4e42d0` | Headings, links, active states, focus rings |
| `--color-accent` | `#82e785` | `#1e9248` | CTA buttons only — nowhere else |
| `--color-muted` | `#5c5048` | `#6e67a8` | Toggle thumb, secondary borders |
| `--color-border` | `#1d1a16` | `#cdc8f0` | Dividers, card borders |

**Contrast (WCAG AA minimum 4.5:1):**
- `--color-text` / `--color-bg` (dark): ~18.5:1 AAA ✓
- `--color-primary` / `--color-bg` (dark): ~7.4:1 AAA ✓
- `--color-primary` / `--color-bg` (light): ~6.6:1 AA ✓
- `--color-accent` / `--color-bg` (light): ~5.2:1 AA ✓
- `#1d1d1d` / `--color-accent` (button label): ~10.8:1 AAA ✓

> ⚠️ Light-mode primary is `#4e42d0`. It was deliberately darkened from `#6b5fe8` for contrast compliance. Do not revert it.

### Tonal scale

Use tonal steps when a deliberate shade variation is needed (hover lift, tinted surface, pressed state). Not for general styling — semantic tokens cover that.

**Primary (purple)**

| Token | Dark | Light | Role |
|---|---|---|---|
| `--color-primary-100` | `#e8e5ff` | `#e8e5ff` | Tinted surface highlight |
| `--color-primary-300` | `#c4bcff` | `#9b8fff` | Hover / subtle emphasis |
| `--color-primary-500` | `#9b8fff` | `#6b5fe8` | Matches `--color-primary` (dark) |
| `--color-primary-700` | `#6b5fe8` | `#4e42d0` | Matches `--color-primary` (light) |
| `--color-primary-900` | `#3d31b0` | `#2f2597` | Deep pressed state |

**Accent (green)**

| Token | Dark | Light | Role |
|---|---|---|---|
| `--color-accent-100` | `#d4f5d5` | `#d4f5d5` | Tinted badge / tag surface |
| `--color-accent-300` | `#82e785` | `#4fcf57` | Matches `--color-accent` (dark); hover |
| `--color-accent-500` | `#52c758` | `#1e9248` | Matches `--color-accent` (light) |
| `--color-accent-700` | `#3aaa40` | `#156832` | Deep pressed |
| `--color-accent-900` | `#1e6b22` | `#0d4116` | Max saturation, rare |

### Hardcoded exceptions

| Value | Where | Why |
|---|---|---|
| `color: #1d1d1d` | `.contact-btn` | Fixed dark text on bright green — no suitable token |
| `fill="…"` attributes | `<svg>` brand decorations | Inline SVG attribute syntax; tokens don't apply here |

### Grain tokens

| Token | Dark | Light |
|---|---|---|
| `--grain-opacity` | `0.22` | `0.05` |
| `--grain-blend` | `overlay` | `multiply` |

### CRT / VHS texture tokens

Two additional fixed overlay layers sit below the grain (`z-index` 897–898) and produce a soft CRT scanline and VHS tracking-band effect. Both are `pointer-events: none`, `aria-hidden="true"`, and transition with theme switches.

| Token | Dark | Light | Role |
|---|---|---|---|
| `--scanline-opacity` | `0.06` | `0.03` | Opacity of the 1 px scanline layer (`.crt-scanlines`); adapts to theme via `--color-text` for line color |
| `--crt-tracking-opacity` | `0.035` | `0.012` | Opacity of the slow-drifting VHS tracking band (`.crt-tracking`); uses `--color-primary` for tint |
| `--crt-interference-opacity` | `0.045` | `0.015` | Opacity of the mouse-following interference band (`.crt-mouse-interference`); uses `--color-primary` |

**Motion:** `.crt-tracking` runs a 90 s `crt-tracking-drift` keyframe (top → bottom, `translateY`). It is suppressed under `prefers-reduced-motion: reduce` alongside `.grain`. `.crt-scanlines` is static — no animation.

**Mouse interference:** `.crt-mouse-interference` is a wider (18 vh) primary-tinted gradient band whose vertical position tracks the cursor Y via the `--mouse-tracking-y` CSS custom property. A `requestAnimationFrame` loop lerps toward the real cursor position (factor `0.04`) for a sluggish, magnetic-field feel. When `.crt-tracking` and `.crt-mouse-interference` overlap, their combined opacity creates a brighter "signal disruption" zone. Under `prefers-reduced-motion: reduce`, the lerp factor becomes `1` (instant snap — no autonomous drift, but the element still tracks the cursor directly).

**Fun theme:** inherits dark values from `:root` — no override needed.

### 1.4 Fun theme

`data-theme="fun"` is a third opt-in theme toggled by the `=^,^=` button in the sidebar footer. It is never applied automatically based on OS preference.

**Surfaces:** background, text, surface, muted, border, and grain tokens match the dark theme.

**Inverted brand roles:** semantic `--color-primary` / `--color-accent` and their tonal scales swap versus dark — the green family is primary (headings, links, focus) and the purple family is accent (CTAs). Values mirror the dark theme’s former accent and primary scales respectively.

**Typography overrides:**

| Token | Fun value | Why |
|---|---|---|
| `--font-serif` | `'Nintendoid 1', monospace` | Pixel/retro game font replaces Fraunces |
| `--serif-display` | `normal` | Resets `font-variation-settings` — Nintendoid 1 is not a variable font |

**Display headlines:** `.hero-statement` (home) and `.bio-headline` (about) use a **32px** cap and **no italic** on `em` in fun mode; weight `400` for the pixel face.

**Other serif roles in fun mode:** `.work-project`, `.cv-role`, and `.pull-quote p` use **`font-style: normal`** (and `400` weight where applicable) so Nintendoid never inherits Fraunces’ italic styling.

Font file: `assets/fonts/nintendoid-1.otf` (registered via `@font-face`).

**Maintenance rule — fun follows dark/light automatically except where noted:**
- **General token changes** (new semantic colour, sizing, spacing, new component) → apply to dark and light only. The fun theme inherits dark's surfaces and does not need a separate update unless the change touches a token that fun overrides (primary, accent, or their tonal scales).
- **Colour token changes to dark primary or accent** → also update `[data-theme="fun"]` to preserve the inverted mapping.
- **Fun-specific changes** → always explicitly labelled "fun only" in the commit / PR. Update only `[data-theme="fun"]` and the fun-scoped CSS rules.

---

## 2. Typography

### Fonts

| Token | Value | Use when |
|---|---|---|
| `--font-sans` | `'Work Sans', system-ui, sans-serif` | Body copy, UI labels (not uppercase), meta |
| `--font-serif` | `'Fraunces', Georgia, serif` | Headings, display lines, italic decorative text |
| `--font-mono` | `'DM Mono', 'Courier New', monospace` | `text-transform: uppercase` — always |
| `--serif-display` | `'SOFT' 0, 'WONK' 1` | `font-variation-settings` whenever using `--font-serif` in display contexts |

**The one font rule:** Is the text uppercase? → `--font-mono`. Is it a heading or italic display? → `--font-serif` + `font-variation-settings: var(--serif-display)`. Everything else → `--font-sans`.

All mono/uppercase text uses **`letter-spacing: 0`** — no tracking.

### Type scale

New text elements must match one of these roles. Do not introduce new sizes.

| Role | Classes | Font | Size | Weight | Key properties |
|---|---|---|---|---|---|
| Display Headline | `.hero-statement`, `.bio-headline` | `--font-serif` | `54px` / `48px` | `300` | `line-height: 1.1`, `letter-spacing: −0.72px`, italic `em` in `--color-primary` |
| Pull Quote | `.pull-quote p` | `--font-serif` | `20px` | `300` | `line-height: 1.4`, `font-style: italic` |
| Project / Role Title | `.work-project`, `.cv-role` | `--font-serif` | `16px` | `300` | `font-style: italic`; `.work-project` color = `--color-primary` |
| Body Copy | `.hero-sub`, `.bio-body p` | `--font-sans` | `16px` | `400` | `line-height: 1.55–1.6`, `letter-spacing: −0.3px`, `opacity: 1.0 / 0.78` |
| Secondary Meta | `.cv-company` | `--font-sans` | `13px` | `400` | `letter-spacing: −0.5px`, `opacity: 0.65` |
| UI Label | `.section-label`, `.shelf-label`, `.wordmark`, `.nav a`, `.work-client`, `.work-year`, `.cv-year` | `--font-mono` | `12px` | `500` | `letter-spacing: 2px`, `uppercase`, `opacity: 0.65 → 1.0` on active |
| Micro Label | `.sidebar-meta`, `.toggle-label`, `.footer-copy`, `.contact-btn`, `.linkedin-btn`, `.pull-quote-attr` | `--font-mono` | `11px` | `500` | `letter-spacing: 1.5–2px`, `uppercase`, `opacity: 0.65` (labels) / `1.0` (buttons) |
| Decorative Image Label | `.image-label` | `--font-mono` | `10px` | `500` | `letter-spacing: 1.2px`, `uppercase`; color = `--color-text` at `opacity: 0.45` rest → `0.9` active |

### Opacity floors

| Text role | Minimum |
|---|---|
| Body paragraphs | `0.78` |
| UI labels, muted, footer | `0.65` |
| Decorative image labels (dark overlay only) | `0.45` |
| **Absolute floor for all text-bearing elements** | **0.45** |

### Size floors

- All UI text: `11px` minimum
- Decorative image labels on dark overlay: `10px` — only this exception

---

## 3. Interaction & Motion

### Focus styles

Every `<a>`, `<button>`, and focusable element requires a `:focus-visible` ring:

```css
.element:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;   /* 3–4px for block rows, 2px for inline */
  border-radius: 2px;
}
```

Exception: `.contact-btn` uses `var(--color-text)` — the accent green background needs a higher-contrast ring.

### Reduced motion

Every entrance animation (`opacity: 0` → visible) must have an override in the `@media (prefers-reduced-motion: reduce)` block:

```css
@media (prefers-reduced-motion: reduce) {
  .element {
    opacity: 1;       /* or the final resting opacity */
    transform: none;
    animation: none;
  }
}
```

The `grain-drift` animation must remain suppressed in that block. Long transitions collapse to `0.01ms`.

---

## 4. Naming

### CSS

| Use | Correct | Wrong |
|---|---|---|
| Colors | `var(--color-primary)` | `#9b8fff` |
| Fonts | `var(--font-mono)` | `'DM Mono'` |
| Backgrounds | `var(--color-bg)` | `#0e0b09` |
| Exception (fixed contrast) | `color: #1d1d1d` on `.contact-btn` | Any other raw hex in `<style>` |
| SVG brand art | `fill="#9b8fff"` in `<svg>` is fine | Hex anywhere in `<style>` blocks |

### Classes

- **Layout:** `.sidebar` · `.main` · `.images` · `.right-col`
- **Components:** `.work-item` · `.image-card` · `.record-card` · `.book-card` · `.photo-card`
- **State:** `.is-active` — JS-toggled only, never a theme variant
- **Theme:** `[data-theme="dark"]` / `[data-theme="light"]` on `<html>` only

### Semantic HTML

- Nav: `<nav aria-label="Primary">`
- Work items: `<a>` elements
- Decorative image wrappers: `role="presentation"`, `aria-hidden="true"` on layers
- Theme toggle: `role="switch"`, `aria-label` updated via JS

---

## 5. Layout grid

Both pages share the same three-column fluid grid.

```css
.layout {
  display: grid;
  grid-template-columns: 0.25fr 1fr 0.5fr;
  height: 100vh;
}
```

| Column | Fraction | Role |
|---|---|---|
| 1 — Sidebar | `0.25fr` | Navigation, logo, CTAs, theme toggle |
| 2 — Main | `1fr` | Primary content |
| 3 — Right | `0.5fr` | Secondary content (gallery on home, shelves on about) |

### Responsive behaviour

| Breakpoint | Columns | Right column |
|---|---|---|
| ≥ 1300px | `0.25fr 1fr 0.5fr` | Visible |
| ≤ 1299px (tablet) | `0.25fr 1fr` | Hidden (`display: none`) |
| ≤ 767px (mobile) | `display: flex; flex-direction: column` | Hidden; sidebar becomes sticky header + footer |

**Do not introduce fixed-pixel column widths.** The `0.25fr / 1fr / 0.5fr` ratio ensures the layout scales with the viewport on all screen sizes.

---

## 6. Brand mapping

| Personal Brand.md direction | Implementation |
|---|---|
| "Anchor in deep warm tones" | `--color-bg: #0e0b09` — warm near-black, not neutral |
| "Grain over flat" | Film grain SVG at `--grain-opacity: 0.22` (dark) / `0.05` (light) |
| "Editorial serif + technical sans" | Fraunces (`--font-serif`) + Work Sans (`--font-sans`) |
| "One bold accent as punctuation" | `--color-accent` — CTAs only |
| "Dither / pixel art as nostalgia" | SVG dither filter on image cards; 8-bit crescent moon |
| "Restraint in hierarchy" | Three type levels only: heading / UI label / body |

---

*v2.1 — 2026-04-15 · Companion: `Personal Brand.md` · `index.html` · `about.html`*
