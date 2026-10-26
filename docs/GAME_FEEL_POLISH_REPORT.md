# Ball Cascade — Game Feel & Visual Polish

## Review boundary

Version **0.3.3-feel.1**, branch **feature/game-feel-polish**. This is an incremental extension of the existing Neon Cabinet redesign at **61d07a3135ae8ac67ea6753bf9e9bcd479329d5a**, in [PR #2](https://github.com/onelionstudio-alt/ball-cascade/pull/2). The new PR is stacked on feature/visual-overhaul so its diff shows only this polish. Both require owner review; neither is merged. Main and the public Pages site remain on published 0.3.1, 4a2cac1.

Engine, physics, goals, all twelve level descriptors, economy, saves, math, obstacle simulation, input and platform adapter are byte-equivalent to the visual redesign baseline. Canonical campaign output is also unchanged. No new physical obstacles, RNG calls in gameplay, radius/speed/rate changes, ball quantities, prices, rewards, unlocks or win rules are introduced. Artwork uses original CSS/Canvas/SVG; no runtime assets, libraries or vendor SDKs are downloaded.

## What changed and why

- **Balls lead the scene:** pearl centers, larger visual silhouettes, mint/lime material distinction and short speed-dependent light trails. Physical circles are unchanged. At more than 40/100 active balls, artwork scales down to reduce overlap; two cached glow sprites avoid per-ball shadow filters.
- **A physical cabinet:** socketed metal pegs, shallow grooves connecting their actual mounts, boundary rails/rivets, recessed pocket mouths and stronger target illumination. These are drawing commands only. Active target routes receive faint light; pocket events merge into a short local response instead of adding an object per delivery.
- **Meaningful feedback:** quiet peg sparks, booster/module perimeter pulses, split sparks, red destruction fragments, portal entry/exit rings, chain highlights and target-pocket accents. Grabbed modules gain a small visual lift, without moving their collision body or delaying input. Existing smooth button/dialog/unlock/reward animation is retained.
- **A quieter HUD:** remove CASCADE CHAMBER, THE CIRCUIT, duplicate micro-labels and the LOCAL QA badge. Important counters and conditions gain contrast/size. Extra control explanations move to Help. Diagnostics appear only inside Help on localhost with ?dev=1; public hosts ignore QA speed.
- **Coherent sound:** distinct short synthesized peg, target-pocket, booster, split, hazard, portal, chain, placement and result accents. A shared low master gain, per-event cooldowns and a maximum of eight oscillator voices prevent a wall of sound. Muting stops pending voices. No microphone or system audio is used.

### Twelve readable identities

| Level | Cosmetic emphasis aligned with existing mechanics |
|---|---|
| First Light | Clean pale-mint light, minimal construction, clear central delivery lane |
| Moving Walls | Cool blue material and dotted tracks showing existing moving-wall travel |
| Danger Zone | Rose warning atmosphere, edge chevrons and red striped hazard teeth |
| Split Decision | Violet palette and two faint branching route lights |
| Wind Tunnel | Cyan intake vents and directional moving airflow arrows |
| The Crusher | Warm metal, warning edging and existing active/warning/inactive press states |
| Portal Lab | Violet chamber, layered resonance rings at the real entry and exit |
| Gravity Shift | Blue field with the existing direction/countdown display clearly separated |
| Chain Reaction | Gold activators and circuit traces following their actual relationships |
| The Maze | Teal inset grooves around actual walls; no fake peg paths |
| Chaos Factory | Warm industrial surface, travel tracks, warning edging and combined existing effects |
| Cascade Master | Restrained gold rails/corner marks framing the combined final challenge |

![All twelve real browser scenes](feel/after/themes-contact-sheet.png)

## Failure explanation

The browser deliberately moved the booster away, aimed the nozzle and delivered **all 36 originals with 100% target efficiency and zero loss**, but **0/8 boosted deliveries**. It genuinely failed under the unchanged rules. The new dialog leads with **Challenge incomplete** and the missing boosted count, then shows the completed delivery/action requirements and the useful tip to put ×2 in the stream. Large overall-success metric cards are hidden on failure. Try Again remains immediate and free.

The checklist includes every actual mandatory condition: total deliveries, each required pocket, boosted deliveries, portal deliveries, completed reactions, hit-rate/loss thresholds, module movement and first-level aiming. Win determination stays in the original goals module. Per-level tests compare checklist outcomes against those original rules, including tolerance boundaries and forced incomplete attempts. Optional metrics are not mislabeled as compulsory goals. On victory, all conditions can be expanded for review.

![Missing additional goal on phone](feel/after/12-mobile-incomplete.png)

## Before / After evidence

These are actual headless **Google Chrome** screenshots captured through Playwright, not mockups. Before is the first visual redesign (61d07a3), not the older public prototype. Both campaigns start fresh and complete all twelve levels using visible controls, including deliberately unsuccessful attempts. No victories, balances or completion flags are injected. Local ×8 QA acceleration changes elapsed simulation speed only; action timing can vary a few deliveries, so later captures are equivalent situations rather than identical frames. Active scenes are paused to inspect effects.

| Required state | Before | After |
|---|---|---|
| First Light — before launch | ![Before First Light — before launch](feel/before/01-first-light-before.png) | ![After First Light — before launch](feel/after/01-first-light-before.png) |
| First Light — live cascade, paused for inspection | ![Before First Light — live cascade, paused for inspection](feel/before/02-first-light-playing.png) | ![After First Light — live cascade, paused for inspection](feel/after/02-first-light-playing.png) |
| Danger Zone — actual hazard losses | ![Before Danger Zone — actual hazard losses](feel/before/03-danger-zone.png) | ![After Danger Zone — actual hazard losses](feel/after/03-danger-zone.png) |
| Portal Lab — delivered through the portal | ![Before Portal Lab — delivered through the portal](feel/before/04-portal-lab.png) | ![After Portal Lab — delivered through the portal](feel/after/04-portal-lab.png) |
| Chaos Factory — split, wind, moving walls, hazard and boosters | ![Before Chaos Factory — split, wind, moving walls, hazard and boosters](feel/before/05-chaos-factory.png) | ![After Chaos Factory — split, wind, moving walls, hazard and boosters](feel/after/05-chaos-factory.png) |
| Victory | ![Before Victory](feel/before/06-victory.png) | ![After Victory](feel/after/06-victory.png) |
| 36 delivered, but no boosted balls | ![Before 36 delivered, but no boosted balls](feel/before/07-incomplete-boost.png) | ![After 36 delivered, but no boosted balls](feel/after/07-incomplete-boost.png) |
| Phone, 390 × 844 | ![Before Phone, 390 × 844](feel/before/08-iphone.png) | ![After Phone, 390 × 844](feel/after/08-iphone.png) |

The following pair uses **the exact same unmodified profile earned by a real browser campaign**, for comparable layout, aim, money and upgrades. These isolated comparison contexts are not campaign completion evidence. Profile SHA-256: c53bfc8b8cf96fa9378c197ddbca9cd57ac617e16d8450edb991808556131a04.

| Matched profile | Before | After |
|---|---|---|
| Desktop | ![Before desktop](feel/before/paired-desktop.png) | ![After desktop](feel/after/paired-desktop.png) |
| Phone | ![Before phone](feel/before/paired-mobile.png) | ![After phone](feel/after/paired-mobile.png) |

Additional captures: [workshop](feel/after/09-workshop.png), [Android 360×800](feel/after/08-android.png), [compact iPhone-like 375×667](feel/after/07-compact-iphone.png), [tablet 768×1024](feel/after/08-tablet.png), [short landscape 844×390](feel/after/08-landscape.png), [touch interaction](feel/after/08-trusted-touch.png), [mobile victory](feel/after/10-mobile-victory.png), [compact failure and accessible retry](feel/after/12-compact-incomplete.png).

Visual inspection covered all eight required states, the twelve-scene contact sheet, paired desktop/phone and mobile results. Main goals, conditions and controls remain readable; the board stays ahead of the workshop. No overlapping DOM panels or horizontal document overflow were found. The fixed 16:9 world means tiny world-space marks remain small on narrow phones; important goals and conditions are repeated in readable DOM UI. Decorative rails and routes remain subdued. Module placements intentionally overlapping a physical object can still overlap visually, as the original rules permit placement there.

## Actual gameplay video

[Play/download Chaos Factory WebM](feel/after/gameplay.webm) — approximately 10.5 seconds, normal simulation speed, 960×540, nominal 30 fps, VP8/Opus, 1.58 MiB. This is Canvas capture of real live play with a test-only tap of the game's own Web Audio master. A previously earned, unmodified campaign save selects the unlocked level. No state is advanced or awarded artificially.

The saved WebM was loaded into Chrome again: distinct frames at 2s/7s were decoded, dimensions matched, and its recorded audio had a nonzero sample peak (0.01262). This confirms actual moving video and non-silent game audio; it is not a subjective listening study. [Recording metadata](feel/after/video.json), [playback verification](feel/after/video-verification.json), [decoded frame](feel/after/video-frame-7.png).

## Functional checks

**80 Node tests pass**, including all existing campaign/physics/economy/save/input checks, fourteen new result-presentation cases and two audio bound/mute checks. Ten protected modules and deterministic campaign JSON are unchanged in Git.

| Mission | Before browser | After browser | After active simulation time | After target efficiency |
|---|---|---|---:|---:|
| 1. First Light | Won | Won | 15.5 s | 89% |
| 2. Moving Walls | Won | Won | 51.3 s | 83% |
| 3. Danger Zone | Won | Won | 35.1 s | 100% |
| 4. Split Decision | Won | Won | 49.6 s | 100% |
| 5. Wind Tunnel | Won | Won | 47.7 s | 100% |
| 6. The Crusher | Won | Won | 62.7 s | 71% |
| 7. Portal Lab | Won | Won | 40.7 s | 86% |
| 8. Gravity Shift | Won | Won | 69.2 s | 98% |
| 9. Chain Reaction | Won | Won | 44.1 s | 100% |
| 10. The Maze | Won | Won | 61.7 s | 97% |
| 11. Chaos Factory | Won | Won | 76.2 s | 100% |
| 12. Cascade Master | Won | Won | 83.2 s | 100% |

- Both twelve-level real-browser campaigns won every mission. Weak routes and retry behavior are also covered by the Node campaign tests.
- Trusted CDP touch moved the actual booster/nozzle; First Light won. Pause froze the real emission counter. A real Flow purchase cost 75 coins (160 → 85); reload retained money, upgrade, completion, aim and layout.
- **60 responsive cases**: all twelve missions × iPhone-like 390×844, Android 360×800, compact 375×667, tablet 768×1024 and landscape 844×390. Checks reject horizontal overflow, clipped mission conditions, invisible Canvas and primary/pause touch targets smaller than 44px. The extra-goal failure was also reproduced on mobile and its retry remained reachable at 375×667.
- Reduced motion yielded zero optional particles and CSS transition duration 0s; essential ball motion remains playable. Muting clears pending sound voices.
- After campaign console/page errors: 0. Interaction page errors: 0. External runtime requests: 0.

The exported runtime was also loaded under a subdirectory, with all twelve level entries, working mute toggle, hidden developer labels and zero page/import errors. [Export smoke check](feel/after/export-check.json).

Raw results: [before campaign](feel/before/results.json), [after campaign](feel/after/results.json), [touch/save/motion/render checks](feel/after/interaction-checks.json), [60-case matrix](feel/after/layout-matrix.json), [matched state](feel/comparison-state.json).

## Performance and limits

A separate synthetic component benchmark uses the **same unchanged Engine snapshot with 220 fast balls and five stored trail points each**, 20 warm-up and 120 measured render calls for each version. It measures CPU Canvas command submission in headless Chrome on this computer, not presented FPS or a physical-phone GPU budget.

| Draw call | Previous redesign | Polish |
|---|---:|---:|
| Mean | 1.29 ms | 4.73 ms |
| p95 | 7.30 ms | 9.30 ms |

The renderer left the Engine snapshot unchanged (true). Increased detail has a cost; no FPS improvement is claimed. Caches retain only one level backdrop and two pearl sprites. Hard limits: 220 physical balls unchanged, 180 cosmetic particles, 14 labels, 12 pulses, ten normal effect emissions per frame, regional/type coalescing over 65ms, at most eight sound voices with per-event/global cooldowns. Dense-event fixture: 90 particles and 1 labels, within bounds. Reduced motion omits optional spark/trail/pulse animation.

## Remaining acceptance items

No critical functional or layout fault remained in the tested Chrome configurations. Physical iOS/Safari, low-end Android FPS/thermal behavior, Firefox, color-vision accessibility and subjective sound/art preferences still require human/device testing. The procedural art deliberately stays restrained rather than adding scenery that looks like new collision geometry. No claims of improved retention, revenue or platform certification are made. Poki/CrazyGames SDK/ads are outside this visual/audio task and remain unintegrated as before.

## Reproduce / preview

Use Node 22+, Playwright and installed Chrome in the development environment. Set PLAYWRIGHT_MODULE and CHROME_PATH if not discoverable. No testing libraries are included in the exported game.

~~~sh
node tools/prepare-visual-baseline.cjs 61d07a3135ae8ac67ea6753bf9e9bcd479329d5a
node tools/serve.js --port 8020
# Another terminal:
node --test tests/*.test.js
node tools/campaign.js
node tools/feel-qa.cjs before http://127.0.0.1:8020/.qa/before-site/
node tools/feel-qa.cjs after http://127.0.0.1:8020/
node tools/feel-checks.cjs
node tools/feel-pairs.cjs
node tools/feel-video.cjs
node tools/feel-gallery.cjs
node tools/feel-report.cjs
node tools/build.js
node tools/feel-export-check.cjs
~~~

Local review build: **http://127.0.0.1:8020/** on the owner's computer. Export: artifacts/site; archive: artifacts/ball-cascade-game-feel-polish.zip. Upload the entire runtime directory (including src/ and styles.css), not just the original two files. Reports, baseline copies, screenshots, video and tests are excluded from the runtime export. No public preview deployment was created, because the owner's public version must remain untouched until approval.
