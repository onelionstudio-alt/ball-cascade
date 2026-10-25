# Playtest report — 2026-10-25

## Actual browser campaign

Real Chromium in the Codex in-app browser. Played through visible controls: native Canvas drag/tap and the game's accessible numeric module controls. No direct state changes, synthetic unlocks or test-only victory calls. Normal-speed First Light established a saved clear; the browser tab was then reopened with the earned save, and levels 2–12 were played at local QA ×8. All twelve finished without purchases or failed attempts in the recorded campaign. Usually one burst was used; Chaos Factory used two.

| Level | Result | Attempts | Simulated seconds | Efficiency | Coins |
|---|---|---:|---:|---:|---:|
| 1. First Light | won | 1 | 21.1 | 94% | 160 |
| 2. Moving Walls | won | 1 | 60.6 | 90% | 195 |
| 3. Danger Zone | won | 1 | 46.3 | 100% | 230 |
| 4. Split Decision | won | 1 | 59.4 | 100% | 265 |
| 5. Wind Tunnel | won | 1 | 58.9 | 100% | 300 |
| 6. The Crusher | won | 1 | 73.9 | 78% | 315 |
| 7. Portal Lab | won | 1 | 51.9 | 95% | 370 |
| 8. Gravity Shift | won | 1 | 80.4 | 98% | 405 |
| 9. Chain Reaction | won | 1 | 55.3 | 100% | 440 |
| 10. The Maze | won | 1 | 72.9 | 99% | 475 |
| 11. Chaos Factory | won | 1 | 81.8 | 100% | 510 |
| 12. Cascade Master | won | 1 | 94.4 | 100% | 545 |

[Raw local report](browser-campaign.json) contains the earned completion flags, best results, layouts, aims and final physical result. [Completion screenshot](screenshots/campaign-complete.jpg) shows Cascade Master and Challenge Replay unlocked. This is an agent playthrough with known routes, not independent novice validation.

## Other executed checks

- 51 Node tests pass on the final source: campaign, goals, physics, population limits, score ownership, finite bursts, economy, duplicate rewards, replay, abort/retry, imports/UI wiring, saves/migration and adapter failure fallback.
- Original 0.2 baseline suite: 26 checks passed during audit; the baseline history is preserved for comparison.
- Final strategy and robustness scripts pass. Strong 12/12, weak 0/12, medium 6/12; both Maze routes pass; maximum-upgrade campaign passes. See the balance report.
- Responsive Chromium views: 1280×720 desktop, 390×844 portrait (Chain Reaction), 844×390 landscape (Maze). Narrow-screen drag returned the module to its intended position; both mobile-view missions then won. Canvas DOM geometry retained 16:9, without document horizontal overflow in the measured landscape view.
- Real-browser touch fixture tests/browser-input.html: five visible PASS results for scaled touch PointerEvent drag, secondary-finger rejection, pointer cancellation, emitter tap and touch-action:none. Events are software dispatched and untrusted; this is not hardware touchscreen certification. The fixture uses production input/Engine code, with no completion overrides.
- After campaign reload, all twelve completions, 4,210 coins and sound setting persisted. Three actual shop purchases reduced coins to 3,985 and each track advanced to one. Pause held the attempt budget at 3/72 across the observation interval; Resume continued emissions.
- Browser touch-fixture console had no captured warnings/errors. The full campaign visibly completed without a blocking error. A complete campaign console-log capture was not retained, so zero console errors across the entire run is not certified.

## Remaining acceptance and limitations

Firefox was installed, but native browser control stopped because URL-policy enforcement is unsupported for that Windows browser. No Firefox pass is claimed. Do not retry through a policy bypass. Actual Android/iOS touch behavior, Safari, tablet controls, safe areas, audible mix quality, low-end performance and novice comprehension require manual review.

A deliberate bad Danger Zone attempt was started after the campaign to exercise failure/retry; the browser-control interruption occurred before its final result was captured. Unit and strategy tests verify failure/retry, but this additional browser scenario is not claimed complete. Likewise, hidden-tab pausing is implemented and baseline-tested, but a final 0.3 browser before/after hidden-tab measurement is outstanding.

The first-60-second novice target, 15–25-minute first session, retention and willingness to replay are unverified by independent users. Please test First Light without instructions, play the late factory routes, compare a replay layout, and report confusing moments and reasons to continue. Use Help → Local test report; sharing is manual.

## Release boundary

This is a reviewable external-playtest candidate. No vendor SDK, ads or monetization is active; no platform acceptance is claimed. Test the ZIP through a local HTTP/static server, including loading from a subdirectory. Do not deploy this candidate to the existing public main/Pages site until owner review and explicit publication confirmation.
