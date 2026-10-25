# Balance report — 0.3 candidate

Generated from actual Engine attempts by tools/report.js. All simulations use the same 120 Hz physics, emissions, cooldowns, goals, original-ball accounting and rewards as the browser. They call legal aim/move/start/burst/buy methods; they do not set completion flags, ball outcomes or money. Strategy comparisons first earn a complete no-purchase campaign, then copy that earned profile for replay comparisons. Isolated contact tests deliberately place balls at collision surfaces; these are unit fixtures, not campaign evidence.

| Level | Strong run seconds | Target efficiency | Clear reward | Weak / medium / strong | Nearby wins |
|---|---:|---:|---:|---|---:|
| 1. First Light | 15.5 | 89% | 160 | lost / lost / won | 9/9 |
| 2. Moving Walls | 50.5 | 90% | 195 | lost / won / won | 9/9 |
| 3. Danger Zone | 31.9 | 100% | 230 | lost / won / won | 9/9 |
| 4. Split Decision | 46.0 | 100% | 265 | lost / lost / won | 9/9 |
| 5. Wind Tunnel | 40.9 | 93% | 300 | lost / won / won | 9/9 |
| 6. The Crusher | 52.5 | 65% | 295 | lost / lost / won | 9/9 |
| 7. Portal Lab | 30.9 | 81% | 350 | lost / won / won | 9/9 |
| 8. Gravity Shift | 56.4 | 97% | 405 | lost / lost / won | 9/9 |
| 9. Chain Reaction | 34.2 | 100% | 440 | lost / won / won | 9/9 |
| 10. The Maze | 49.7 | 95% | 475 | lost / won / won | 9/9 |
| 11. Chaos Factory | 62.6 | 100% | 510 | lost / lost / won | 6/9 |
| 12. Cascade Master | 68.9 | 99% | 545 | lost / lost / won | 9/9 |

The strong campaign purchases precision, flow and burst opportunistically up to level three using only earned money. Every level won on its first configured attempt. Exact positions, target counts, loss rates, income, balances and reasons are in [campaign-strong.json](campaign-strong.json). Unpurchased comparisons and failure reasons are in [strategy-comparison.json](strategy-comparison.json). All weak routes lose, medium clears six missions, strong clears twelve. At First Light and Chain Reaction, landing efficiency alone is insufficient: the weak route fails the boosted/activator goal.

- **1. First Light:** Deliver 12 balls to the center, with at least 8 boosted. Modules: multi. Drag ×2 under the stream. Then aim slightly right.
- **2. Moving Walls:** Deliver 28 balls to the lit pockets. Modules: multi, kick. The side pockets are targets. Lead the moving walls.
- **3. Danger Zone:** Deliver 27 balls to the lit pocket. At least 60% target efficiency. Modules: multi, kick. Red teeth destroy balls. The left lane is safe.
- **4. Split Decision:** Deliver 14 balls to EACH lit pocket. Modules: split, multi, multi. Split early, then support both branches.
- **5. Wind Tunnel:** Deliver 45 balls to the lit pocket. At least 65% target efficiency. Modules: multi, kick. Wind pushes right. Start left of your target.
- **6. The Crusher:** Deliver 30 balls to the lit pocket. Lose no more than 35%. Modules: multi, kick. Route beside the press, then kick toward the center.
- **7. Portal Lab:** Send 24 balls through the portal into the far-right pocket. Modules: multi, kick. Aim at the blue entry. The exit always points down.
- **8. Gravity Shift:** Deliver 20 balls to EACH lit pocket. Modules: split, multi, multi. A warning precedes each shift. Split into two lanes.
- **9. Chain Reaction:** Complete 8 three-hit reactions and deliver 18 balls to lit pockets. Modules: multi, kick. Hit the left activator to start a bounded three-hit chain.
- **10. The Maze:** Deliver 46 balls to the lit pockets. At least 90% target efficiency. Lose no more than 30%. Modules: multi, kick. There is a broad route on each side of the middle wall.
- **11. Chaos Factory:** Deliver 21 balls to EACH lit pocket. Lose no more than 30%. Modules: split, multi, multi. Split above the red zone. Watch the moving barriers.
- **12. Cascade Master:** Deliver 24 balls to EACH lit pocket. At least 60% target efficiency. Lose no more than 25%. Modules: split, multi, multi, kick. Split above the crusher and keep both target lanes supplied.

## What changed after simulation

Initial wind was too weak: an unplanned center flow outperformed compensation. Force was raised to 300 and the goal now requires 45 target originals and 65% efficiency. Maze's center wall could accidentally funnel 75% into safe targets; its target efficiency requirement is now 90%. Crusher's early route collided too often; a side route plus late kicker provides a reproducible alternative. Both Maze corridors are verified. The final configurations are not pixel-perfect: the 3×3 neighborhood moves emitter/modules by ±15 horizontally and modules by ±12 vertically. Eleven missions pass 9/9 routes; Chaos Factory passes 6/9. This is a route tolerance check, not a user success-rate forecast. All twelve also pass with maximum upgrades bought from earned campaign money.

## Economy bounds

Maximum first-clear income is 3,510 coins; all 36 stars add at most 720, so a fresh campaign can earn at most **4,230** coins. All six levels of all three tracks cost **3,900** total. Legacy migration can add at most 300 coins plus capped converted upgrades. No per-ball cash, compounding payouts, repeat-clear farming, offline production or paid retries exist. Rewards are guarded by phase, completion and best-star state. A no-purchase campaign passes all twelve, so currency is not a progression requirement. Upgrades can alter timing and widen bursts; faster does not necessarily mean a cleaner route.

## Duration and difficulty limits

The optimized purchasing policy takes 9.00 minutes of simulated attempt time; the browser no-purchase campaign takes 12.62 minutes, excluding planning and interaction pauses. Browser levels 2–12 used ×8 QA speed; these are simulation durations, not measured wall-clock novice sessions. Planning, experimenting and retries may bring a first play toward the requested 15–25 minutes, but that remains **unverified**. No extra waiting was added to force the target.

Difficulty introduces one obstacle family at a time, then combines them. Medium routes fail at split/gravity combinations and the final factory/master levels. Portal Lab can feel easier than Crusher because it introduces a readable special rule. Numerical ordering does not prove perceived difficulty increases monotonically. Owners should assess the late split routes and burst timing with first-time testers.
