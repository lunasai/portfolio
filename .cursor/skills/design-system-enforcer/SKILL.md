---
name: design-system-enforcer
description: Enforces and maintains the Luna Borgo portfolio design system. Use when editing index.html or about.html, adding CSS, choosing colors or fonts, adding interactive elements or animations, or when asked to update the design system documentation.
---

# Design System Enforcer

## Before completing any style change — run this checklist

- [ ] **No raw hex/rgb in `<style>` blocks.** Every color must reference a token via `var(--…)`.
- [ ] **Color choice order:** semantic token first (`--color-primary`), tonal step second (`--color-primary-300`), never an ad-hoc value.
- [ ] **Font assignment:** uppercase text → `var(--font-mono)`, display/heading/italic → `var(--font-serif)` + `font-variation-settings: var(--serif-display)`, everything else → `var(--font-sans)`.
- [ ] **New interactive element** (`<a>`, `<button>`, focusable) → add `:focus-visible` with `outline: 2px solid var(--color-primary); outline-offset: 2px; border-radius: 2px`. Exception: `.contact-btn` uses `var(--color-text)` for the outline.
- [ ] **New entrance animation** (starts at `opacity: 0`) → add override in the `@media (prefers-reduced-motion: reduce)` block setting the element to its final visible state.
- [ ] **Token value changed** → update all 4 theme locations in **both** `index.html` and `about.html`: `:root`, `@media (prefers-color-scheme: light) :root`, `[data-theme="dark"]`, `[data-theme="light"]`.
- [ ] **Fun theme** — dark and light are the primary themes. Unless a change is explicitly labelled "fun only", do **not** update `[data-theme="fun"]` except: if the changed token is `--color-primary`, `--color-accent`, or their tonal scales, also update the inverted mapping in `[data-theme="fun"]` to keep it correct.

## Tonal scale quick reference

Prefer semantic tokens. Use tonal steps only for deliberate shade variation (hover, pressed, tinted surface).

| Need | Dark token | Light token |
|---|---|---|
| Lightest primary tint | `--color-primary-100` | `--color-primary-100` |
| Subtle / hover primary | `--color-primary-300` | `--color-primary-300` |
| Standard primary | `--color-primary` | `--color-primary` |
| Pressed / deep primary | `--color-primary-900` | `--color-primary-900` |
| Lightest accent tint | `--color-accent-100` | `--color-accent-100` |
| Standard accent | `--color-accent` | `--color-accent` |
| Pressed accent | `--color-accent-700` | `--color-accent-700` |

Full tonal values: `Design System.md § 1.1`

## Permitted hardcoded exceptions

- `color: #1d1d1d` on `.contact-btn` — fixed dark text on bright green, no suitable token
- `fill="…"` inside `<svg>` brand decorations (vinyl labels, pixel art)

---

## Maintaining the design system

Update the docs when a **genuinely new pattern** is introduced. Do not update docs for one-off component tweaks.

### When to update `Design System.md`

| Trigger | Section to update |
|---|---|
| New CSS custom property added | § 1.1 (semantic) or § 1.1 tonal scale table |
| New typography role introduced | § 2 — add a new named role block |
| New accessibility rule or constraint | § 3 |
| New class naming convention | § 4 |

### When to update `.cursor/rules/design-system.mdc`

Only update the rule when a **universal styling rule changes** — a new token, a revised font rule, a new opacity floor, or a new accessibility constraint. Component-specific patterns do not belong in the rule.

### Step-by-step: adding a new token

1. Choose the right name: `--color-<role>` for semantic, `--color-<role>-<step>` for tonal.
2. Add the property to all 4 theme locations in `index.html`.
3. Mirror the identical change in `about.html`.
4. Document it in `Design System.md § 1.1` with dark/light values and role description.
5. If it's a universal rule (e.g. a new "never use X for Y" constraint), add it to the rule file.

### Step-by-step: adding a new type role

1. Pick the nearest existing role and verify you can't reuse it.
2. Add the CSS to `index.html` and/or `about.html`.
3. Document the new role in `Design System.md § 2` following the existing table format.

## Full reference

- Token values and tonal scale: `Design System.md`
- Brand voice and visual direction: `Personal Brand.md`
