# Changelog

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
