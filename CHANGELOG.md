# Changelog

## 0.3.2-visual.1 — Neon Cabinet review candidate

- Redesign the cabinet, mission hierarchy, workshop, circuit navigation and result screens with original Canvas/SVG/CSS artwork.
- Preserve physics, twelve missions, goals, economy, prices, budgets, fixed-step timing and save schema. Canonical campaign output is unchanged.
- Include real Before/After Chrome screenshots, both twelve-level UI campaigns, 60 responsive checks, trusted-touch/save checks and a bounded 220-ball rendering benchmark.
- Fix smooth pointer-gesture intent recognition in a separate commit after trusted-touch testing found the old tutorial issue.
- Review only; no main/Pages deployment. See docs/VISUAL_REDESIGN_REPORT.md.

## 0.3.1 — discoverable emitter controls

- Drag the arrow left or right with mouse or touch; preserve the grab offset, pointer capture, bounds, saved aim and keyboard controls. Clicking/tapping the top strip still works.
- Show a horizontal rail, direction chevrons, a visible Drag to aim caption and a permanent instruction above the board. First Light now explicitly asks the player to drag the arrow.
- Version the changed entry/input/render assets to prevent old browser caches from hiding the update.
- All 58 Node checks pass, including seven new emitter input checks and overlapping mobile touch targets. The browser touch fixture now exercises emitter dragging/cancellation as well as module dragging. A new real-browser run is unavailable in the current tool session; the prior 0.3 campaign results remain historical evidence.

## 0.3.0 — Cascade Challenge, playtest candidate

- Extend the existing fixed-step Canvas cascade and multi/split/kick modules into twelve sequential physical challenges.
- Add moving walls, red traps, timed crushers, animated wind, paired portals, deterministic horizontal gravity shifts and bounded three-hit reactions.
- Replace unlimited income/wealth gates with finite ball budgets, explicit target goals, failure reasons and free retries.
- Separate level points from bounded first-clear/star rewards; add three capped tuning tracks, stars and Challenge Replay.
- Add short interactive onboarding, readable objective HUD, mobile layout, keyboard/numeric controls, limited effects and synthesized sound.
- Split physics, levels, goals, economy, saves, input, rendering, audio and future platform adapter into modules.
- Preserve and back up 0.2 saves; validate damaged saves and remain playable when storage fails.
- Add earned campaign simulations, strategy/robustness reports, browser touch fixture, 51 automated checks and static runtime export.

Known acceptance limits: no real phone certification or Firefox run; first-time player clarity and 15–25-minute engagement require external testing. No platform SDK certification, ads or live-site deployment in this candidate.

## Published baseline — 0.2.2

Commit `2a801b38d6cb79f16aae3a9df6bd3b8444bb0590`: six boards adapted to a 960×540 landscape field with saved-layout migration. Preserved under the requested annotated baseline tag `v0.2.0` (annotation identifies the actual 0.2.2 version).
