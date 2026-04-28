## Pong rebuild kit (based on `pong.html`)

This folder is a compact “knowledge package” for rebuilding the Pong game found in `pong.html` without needing to reread the implementation.

- **Source of truth**: `pong.html`
- **Renderer**: `<canvas id="pong-canvas">` with 2D context
- **Loop**: `requestAnimationFrame(loop)` → `update()` then `draw()`
- **Layout**: full-page grid with a sidebar + `.game-area` container (canvas is 100% sized)

### What this Pong includes

- **Player (left paddle)**: mouse/trackpad (preferred), touch drag, or keyboard arrows fallback
- **AI (right paddle)**: tracks the ball center with a max speed per level
- **3 speed levels**: affects ball serve speed, AI speed, speed cap, and serve delay
- **Serve state**: ball resets to center and launches after a delay with slight random angle
- **Physics**: wall bounces, paddle collisions with “english” based on hit position, speed growth on paddle hits, capped max speed
- **Scoring**: if ball exits left → right scores; if ball exits right → left scores
- **Pause**: Space or P toggles pause overlay
- **Audio**: separate SFX for wall, paddle hits (L/R), scoring, and serve launch
- **Theming**: colors are read from CSS tokens (`--color-*`) each frame

### Quick controls

- **Pause**: `Space` / `P`
- **Level down / up**: `Z` / `X`
- **Move**: mouse (inside game area), touch drag, or `ArrowUp` / `ArrowDown`

### Rebuild docs

- `SPEC.md`: the full behavior spec (states, constants, rules)
- `PHYSICS.md`: collision + velocity math details
- `RENDERING.md`: canvas draw order + styles
- `ASSETS.md`: fonts + audio files used by this implementation
- `CHECKLIST.md`: step-by-step implementation checklist

