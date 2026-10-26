# Ball Cascade — Neon Arcade / game feel polish

Version `0.3.3-feel.2` builds on the Neon Cabinet redesign (PR #2, `61d07a3`) and game feel polish (PR #3, `ba9042b`). It improves the twelve scene identities, ball readability, bounded effects/sound and explanations of unmet goals. Physics, goals, budgets, upgrade prices, economy, input and save schema remain unchanged from that redesign. The owner authorized merging and public publication on 2026-10-26.

Public game: [Ball Cascade](https://onelionstudio-alt.github.io/ball-cascade/).

See [game feel Before/After, video and verification](docs/GAME_FEEL_POLISH_REPORT.md), the [earlier visual redesign](docs/VISUAL_REDESIGN_REPORT.md) and the [Atelier 452 visual components](docs/VISUAL_COMPONENTS.md).

A static Canvas physics puzzle: observe the preview, move the emitter and modules, then solve twelve finite challenges. Includes moving walls, traps, split routes, wind, crushers, portals, gravity shifts and bounded chain reactions. First clears unlock levels; coins buy permanent tuning. Complete the campaign to unlock Challenge Replay and improve three-star results.

## Run and test

Node.js 22+ is sufficient; no packages, engine download or installation step is required.

```sh
node tools/serve.js --port 8014
# open http://127.0.0.1:8014/
node --test tests/*.test.js
node tools/campaign.js
node tools/strategies.js
node tools/robustness.js
node tools/build.js
```

Equivalent npm scripts: `npm test`, `npm run balance`, `npm run build`, `npm run serve`. If npm is unavailable, use the Node commands above. Serve through HTTP; ES modules do not support opening index.html directly with file://.

The build exports `artifacts/site/` with index.html at its root. Upload the complete directory, including styles.css and src/, to a static host. Uploading only the original two files will no longer work. All runtime paths are relative, including when hosted beneath `/ball-cascade/`. Runtime has no external requests or third-party dependencies. Repository reports and test fixtures are excluded from the export.

## Controls and saves

Drag a module; drag the ↔ arrow left or right to aim. Clicking/tapping elsewhere at the top still works. Launch Cascade begins a finite attempt. Burst spends part of the same budget, with three uses and an eight-second cooldown. Failed attempts are free. Numeric module controls and arrow keys provide keyboard access; Shift moves faster, Space launches, Escape pauses. Help contains tutorial skip, layout restore, local report and a separate reset confirmation.

Saves are local to the browser/device. Progress, best results, upgrades, layouts, sound and tutorial status persist. Unfinished physics restarts after reload. Version 0.2 data is retained and backed up before bounded compensation; details are in the design document. Reports stay local until the player explicitly copies and shares them.

`?qaSpeed=8` accelerates fixed-step simulation on localhost only and changes no game rules. Public hosts ignore it. Diagnostics are confined to Help on localhost with `?dev=1`. The new browser campaign checks use ×8; the recorded gameplay uses normal speed. Neither is a novice timing study.

## Publication and acceptance

Developed in `feature/game-feel-polish`, stacked on `feature/visual-overhaul`, with screenshots, video and checks retained in both reports. Their review-only statements describe the state before the owner's publication authorization. GitHub Pages publishes the repository root from main. The prior public version remains available in Git at `4a2cac1`. Baseline tag `v0.2.0` preserves published **0.2.2**, commit `2a801b3`; the tag annotation states this explicitly.

This is an external playtest candidate, not a certified Poki or CrazyGames release. There are no ads, purchases or vendor SDK scripts. A fault-tolerant platform adapter is provided for later integration. Actual phones, Firefox, novice onboarding and retention remain manual acceptance items.

- [Design and architecture](docs/GAME_DESIGN_V0.3.md)
- [Balance and strategy evidence](docs/BALANCE_REPORT.md)
- [Browser playtest and remaining acceptance](docs/PLAYTEST_REPORT.md)
- [Changes](CHANGELOG.md)

The repository contained no license grant at the baseline. No new third-party code or asset license is introduced by this change.
