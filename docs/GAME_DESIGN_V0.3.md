# Cascade Challenge design

## Loop and decision making

Observe an unlimited **unscored** preview, reposition the machine, launch a finite attempt, inspect the result and rebuild. Only completed goals unlock the next level. Merely waiting, collecting points or buying upgrades cannot unlock a challenge. Every mission requires a module adjustment; First Light additionally requires emitter aiming and boosted deliveries. Layout changes are permitted during an attempt. Burst is a deliberate wider launch, not free extra budget. It can improve supply to two pockets or reduce accuracy.

The original peg reflection, gravity, glowing balls, five pockets, emitter and multi/split/kick modules remain. New obstacles extend that simulation; no external engine or server was introduced. Dark/mint/lime visuals remain, with purple splits, red teeth/crosses for hazards, cyan portal rings and yellow activator diamonds. Shapes and labels supplement color. The 960×540 world is proportionally scaled in both mobile orientations.

## Rules

Targets count **original emitted balls**, not inflated splitter descendants. An original may count once in each target pocket; efficiency counts it once if any descendant reaches any target. An original is lost only if all descendants are destroyed. The HUD also shows the number of physical balls destroyed, and the result names the cause. Thus a split branch may be destroyed without losing its original. Level points use the highest-valued landing of each original; multipliers cap at ×8. Points are a result comparison, not spendable coins.

Each mission has a finite budget and at most three bursts. Automatic flow continues until that budget is spent. An attempt resolves when all originals and descendants finish. Each ball has an 18-second lifetime; a stalled ball is explicitly destroyed rather than teleported to a paid pocket. An attempt safety limit of 150 seconds fails rather than awarding a win. Pausing, hidden pages and dialogs stop simulation. Aborted attempts are recorded as failed without taking coins or upgrades.

Physics runs at 120 Hz with bounded velocity, 220 live balls, 180 particles and 20 transient labels. Contacts with moving walls use obstacle-relative velocity. A module affects a ball only once. Portals have predictable downward exits, a cooldown and a three-hop cap. Reactor descendants stop at depth three, share original ownership and cannot produce endless income. Rendering effects do not determine collisions or rewards.

## Progress and economy

First clears pay `100 + 35 × zero-based level index`. Each newly earned star adds 20 coins once. Identical repeats and failed attempts pay zero. No income accrues in preview or offline. All three upgrade tracks stop at six; prices grow linearly. Flow shortens the interval, precision narrows automatic scatter, burst reserve widens burst capacity while spending the same finite budget. Buying is allowed between attempts only. All missions can be completed without purchases, so spending choices cannot create a currency soft lock.

Stars require a win: three at ≥85% target efficiency and ≤8% loss; two at ≥70% and ≤20%; otherwise one. Completing all twelve unlocks Challenge Replay. There are no server leaderboards, ads, real currency or purchases.

## Saves and compatibility

`ball-cascade-v3` stores progress, bounded upgrades, best results, positions, aims, sound, tutorial state and the latest 40 attempt summaries. It does not persist balls, velocities or particles. Invalid numeric values and impossible gaps in sequential completion are sanitized. Invalid JSON is backed up under `ball-cascade-v3-corrupt-backup`. Storage exceptions leave the session playable and show a notice.

The 0.2 key `ball-cascade-v1` is never overwritten. Its raw contents are copied once to `ball-cascade-v02-backup`. Legacy cash becomes floor(cash/100), capped at 300. Rate/value/bounce become flow/precision/burst at one new level per four legacy levels, capped at two. New mission progress starts at First Light because former money-based board openings do not establish mastery of new goals. Old layouts remain in the backup rather than being applied to different obstacles. Help explains that reset affects 0.3 only and retains the old backup. This migration is intentional bounded compensation, not an exact economic continuation.

## Architecture and assets

`game.js` wires UI, fixed-step timing, visibility, dialogs and local reporting. `src/engine.js` owns attempts/progression; math/physics/obstacles own deterministic simulation; levels/goals describe challenges and victory; economy/save enforce bounded growth and persistence; render/input/audio isolate presentation and controls. PlatformAdapter handles intent, initialization timeout, failure fallback and deduplicated lifecycle events; it loads no vendor code. Sound uses rate-limited Web Audio oscillators. All shapes, trails and effects are Canvas/CSS; no image, font, audio downloads or third-party assets are needed.

## Future portal integration

Official requirements reviewed on 2026-10-25: [Poki requirements](https://developers.poki.com/guide/requirements-quality) call for responsive 16:9 presentation, device support, safe storage and bundled assets. [CrazyGames technical requirements](https://docs.crazygames.com/requirements/technical/) support portrait/landscape with relative asset paths and distinguish basic/full SDK integration. The present branch keeps a 16:9 board, responsive surrounding UI and no external requests. These design provisions are not platform acceptance. SDK callbacks, iframe sizes, tablet controls, metadata/thumbnails, platform previews and submission review must be checked in a dedicated integration before claiming readiness. Do not add advertisements to this 0.3 candidate.
