# Atelier 452 — Neon Cabinet components

The kit is authored in CSS, Canvas and inline SVG. No image assets, font downloads, icon package or animation library are needed. Artwork and icon paths are original to this change.

| Role | Token / material | Usage |
|---|---|---|
| Deep navy | `--base: #07101f` | Atmosphere and cabinet recesses |
| Layered blue | `--panel: #111f35`, `--edge: #2c405d` | Panels, workshop and dialogs |
| Lime | `--lime: #d3ff68` | Launch, current circuit and targets |
| Cyan | `--cyan: #69e9ef` | Input, flow and portals |
| Purple | `--purple: #bf9bff` | Splitters and precision tuning |
| Gold | `--gold: #ffcf6a` | Coins, stars and activators |
| Rose | `--red: #ff718b` | Destruction and active danger |

Canvas materials use lighter highlights and darker undersides of these colors. Rendered obstacle/module bodies stay aligned with the original physical bounds; bevels, rails and halos are cosmetic.

## Reusable DOM components

- `.panel`: elevated shell with an edge light and restrained shadow.
- `.primary`, `.secondary`, `.icon-button`: launch/continue, rebuild/replay and 44px toolbar controls. Press feedback never delays an action.
- `.progressbar`, `.condition`, `.counter`: presentation of actual goals and metrics. `missionView()` derives display values but never determines victory.
- `.wallet`, `.upgrade`, `.upgrade-dots`: coin capsule and tuning cards. Inactive prices remain legible and use native disabled semantics.
- `.level`: numbered circuit tile, lock/stars and accessible full name. Full names appear in the header and hover tooltip instead of unreadable micro labels.
- `.result-screen`: medal, sequenced stars, 650ms reward count-up and compact metrics. Defeat uses a calm message and explicit reasons, without punishment or waiting.

Use `icon(name)` from `src/ui.js` for play, pause, sound, help, redo, next, coin, target, balls, accuracy, flow, precision, burst, split, hazard, wrench, check, lock, star and close. SVGs are non-focusable and aria-hidden; the containing button owns its label.

## Reusable Canvas components

`src/render.js` exports `PALETTE`, `plate(ctx, x, y, width, height, radius, top, bottom, edge, depth)` and `ballSprite(color)`. They can be reused without creating an Engine. `plate()` draws the shared bevel/shadow material. `ballSprite()` returns a cacheable 64×64 pearl/glow canvas: create it once per color, not every frame. The game caches its backdrop and two ball sprites.

The renderer owns cosmetic particles, labels, pulses and its animation clock. It does not change ball positions, peg state, scores or simulation randomness. Limits: 180 particles, 14 transient labels, 12 pulses, and at most ten normal visual-event emissions per frame. The physical 220-ball limit is unchanged.

The game feel extension adds `SCENES` and `sceneConstruction(ctx, level)` in `src/scene.js`: twelve semantic accent/material themes, decorative boundary rails and mount grooves derived from the real peg descriptors. Decorations create no collision shapes. Cache only the current level backdrop. Ball sprite draw sizes adapt at 40/100 active balls; physical radii stay untouched. Event accents coalesce by event type and 30px region for 65ms. `AudioSystem` uses a shared quiet gain, per-event cooldowns and at most eight oscillator voices; disabling sound stops pending voices.

`resultView(level, result, actions)` in `src/result-view.js` is a read-only checklist adapter. Reuse `.result-checklist`, `.requirement.complete`, `.requirement.incomplete` and `.result-tip` to explain actual mandatory conditions; never use presentation helpers to decide wins or award money. The missing condition leads the failure dialog, while complete conditions remain inspectable. Diagnostic content belongs inside Help with localhost `?dev=1`, never in the main HUD.

## Motion and responsive behavior

Stars enter with short offsets; rewards count up in 650ms; dialogs enter in 260ms; buttons press by 2px; unlocks and tuning flash briefly. `prefers-reduced-motion` disables CSS transitions/animations, count-up and optional Canvas effects. Ball movement remains essential gameplay.

Desktop uses a cabinet, side workshop and circuit rail. Portrait puts the mission and full-width board first, with a scrollable workshop below the circuit. Short landscape places the mission and workshop beside the board. The sidebar mission sizes to its content so extra conditions cannot be clipped. Internal scrolling is deliberate; the document must not overflow sideways.
