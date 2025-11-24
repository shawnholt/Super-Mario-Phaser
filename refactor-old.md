# Incremental Refactor & Test Playbook for AI Agents

Audience: AI/IDE agents and humans pairing with them. Tone: teacherly, low jargon. Visual-first changes are welcome, but every step must keep current gameplay intact.

## 1) Purpose & Goals
- Keep the game playable while making code easier to tweak in tiny, verifiable steps.
- Favor observable results (movement, sky color, HUD) over deep architecture sweeps.
- Add lightweight checks that can run from the browser console—no new build steps or frameworks.
- Reduce risk gradually; globals stay for now.

## 2) Scope & Invariants (do not break)
- Globals that must exist: `player`, `score`, `timeLeft`, `controlKeys`, `worldHolesCoords`, `platformGroup`, `goombasGroup`, music/effects groups, `playerState`, `playerBlocked`, `playerInvulnerable`, `playerFiring`, `fireInCooldown`, `smoothedControls`.
- Context contract: many helpers rely on `.call(this)`; preserve that pattern when moving code.
- Input surfaces must remain: `controlKeys` (configurable), `this.cursors` (Phaser defaults), Rex virtual joystick.
- DOM hooks: loading GIF elements, canvas for screenshots.
- Physics/timers: invulnerability blink timers, fireball lifespan, HUD timer recursion, tween-based transitions.

## 3) Safety Rails for Agents
- Work one micro-change at a time; reload tab after each save (Vite hot reload only).
- Before you start: run the Baseline Smoke (below) and log outputs.
- Abort/revert triggers: camera stops following, `timeLeft` stops ticking, inputs unresponsive, music overlaps, sky color stops cycling, fireballs never expire, Goombas freeze or vanish too fast.
- Keep log prefixes like `SMOKE:` or `CHECK:` for automated parsing.

## 4) Hot Reload & Testing Recipe (per AGENTS)
- Never open new browser tabs. Use the existing Vite tab.
- Inject events via `window.dispatchEvent(new KeyboardEvent(...))`; required props: `key`, `code`, `keyCode`, `bubbles: true`, `cancelable: true`, `view: window`. Target `window` (and `document` if needed).
- Log before/after values (e.g., `player.x`, `player.body.velocity.y`) to prove behavior.
- Pair keydown/keyup in tests; allow ~200–300ms before reading the after value.

## 5) Console Microtests (copy/paste friendly)
- Move right:
  ```js
  console.groupCollapsed('SMOKE: move-right');
  console.log('before x', player.x);
  const o = {key:'ArrowRight', code:'ArrowRight', keyCode:39, bubbles:true, cancelable:true, view:window};
  window.dispatchEvent(new KeyboardEvent('keydown', o));
  setTimeout(() => {
    window.dispatchEvent(new KeyboardEvent('keyup', o));
    console.log('after x', player.x);
    console.groupEnd();
  }, 250);
  ```
- Jump:
  ```js
  console.groupCollapsed('SMOKE: jump');
  console.log('before vy', player.body.velocity.y);
  const j = {key:' ', code:'Space', keyCode:32, bubbles:true, cancelable:true, view:window};
  window.dispatchEvent(new KeyboardEvent('keydown', j));
  setTimeout(() => {
    console.log('after vy', player.body.velocity.y);
    window.dispatchEvent(new KeyboardEvent('keyup', j));
    console.groupEnd();
  }, 200);
  ```
- Fireball (requires fire state):
  ```js
  console.groupCollapsed('SMOKE: fireball');
  const f = {key:'q', code:'KeyQ', keyCode:81, bubbles:true, cancelable:true, view:window};
  console.log('goombas', (this && this.goombasGroup) ? this.goombasGroup.getChildren().length : 'n/a');
  window.dispatchEvent(new KeyboardEvent('keydown', f));
  setTimeout(() => window.dispatchEvent(new KeyboardEvent('keyup', f)), 150);
  setTimeout(() => console.log('fireball test done (should despawn by 3s)'), 3200);
  console.groupEnd();
  ```
- Seed logging (once seed mode exists): `console.log('seed', window.__levelSeed, 'holes', worldHolesCoords.length);`
- Screenshot (if helper is present): `getScreenshot();`

## 6) Baseline Smoke Checklist (run before/after each phase)
1. Load `localhost:5173`, confirm no console errors.
2. Spawn & idle: Mario renders; timer and score show.
3. Move right: run “Move right” microtest; confirm `after x > before x`.
4. Jump: run “Jump” microtest; confirm velocity becomes negative.
5. Enemy contact: walk into first Goomba; expect stomp when landing on top, damage on side.
6. Win/lose transitions (time permitting): fall in a pit for game over; reach flag/tube for win animation.
Record console outputs for comparison.

## 7) Risk Register (watch these when refactoring)
- Start screen triggers: gear block opens settings; initial camera bounds differ from level bounds.
- Teleport tube (underground) and flag raise sequence: camera follow toggles, fades, tweens, music swaps.
- HUD timer recursion and hurry-up music at `timeLeft === 100`.
- Invulnerability blink timers (`applyPlayerInvulnerability`), fireball lifespan and bounce logic.
- Goomba cleanup (`clearGoombas`) removing idle/frozen enemies—easy to break with velocity changes.
- Sky color cycling via `C` key/gear block; uses `skyBackgrounds` array.

## 8) Module Map (for quick search)
- Monolith: `javascript/game.js` (preload/create/update, level gen, camera, audio, sky, start/win/lose).
- Player: `javascript/game/player-control.js` (movement, crouch/firing, state loss).
- Enemies: `javascript/game/entities-control.js` (Goomba spawn/collision/cleanup).
- Blocks & power-ups: `javascript/game/blocks.js`.
- Projectiles: `javascript/game/fireball.js`.
- HUD & screens: `javascript/game/hud-control.js`.
- Animations: `javascript/game/animations.js`.
- Level patterns: `javascript/game/strucutres.js`.
- Settings UI & GameSettings: `javascript/game/settings.js` and `javascript/settings.js` (keep globals intact).

## 9) Phase Plan (Pareto-friendly)
- **Phase 0 — Instrument & Anchor**
  - Add brief section comments in `game.js` (preload, create, update, level gen, HUD/audio hooks).
  - Add `// TODO: refactor: ...` anchors for future search.
  - Add `console.assert` for critical globals in `create`/`update` (player, controls, groups).
  - Test: Baseline Smoke.
- **Phase 1 — Constants Extraction**
  - Create `javascript/constants.js` with readonly values (speeds, gravity, timings) copied from current code.
  - Swap literals one-at-a-time in `game.js` and `player-control.js`; log `window.gameConstants` in console to verify.
  - Test: Baseline + console check.
- **Phase 2 — Input Map Isolation**
  - Add `javascript/input-map.js` exporting key bindings and a helper returning `controlKeys` while keeping globals and Rex/cursors intact.
  - Update `game.js` to use helper but preserve `controlKeys` shape and existing joystick/cursor paths.
  - Test: Baseline + Move/Jump microtests.
- **Phase 3 — HUD/Timer Module**
  - Extract HUD into `javascript/hud.js` (`createHud(scene)`, `updateHud(scene)`, `addToScore(scene, num, origin)`), respecting `.call(this)` usage.
  - Wire `create`/`update` to the helpers.
  - Test: Baseline + coin pickup updates score; timer counts down.
- **Phase 4 — Enemy Encapsulation**
  - Wrap Goomba creation/update/cleanup in helper functions and call from `game.js`.
  - Keep velocities, collisions, and cleanup behavior identical.
  - Test: Baseline + stomp vs side-hit.
- **Phase 5 — Player Lifecycle Helpers**
  - In `player-control.js`, extract grow/shrink/fire helpers; reuse internally without changing hitboxes/animations.
  - Test: Baseline + mushroom/flower pickup and damage.
- **Phase 6 — Level Generation Wrapper**
  - Move level generation to `javascript/level-gen.js` with current RNG; pass needed globals explicitly.
  - Optionally log platform count/hole coords for comparison.
  - Test: Baseline + layout log check.
- **Phase 7 — Deterministic Seed Toggle (optional but recommended)**
  - Add `?seed=` query param support in `game.js` and use a tiny PRNG for level gen when present.
  - Log seed and generated platform/hole counts.
  - Test: Run `/?seed=1` twice; logs should match.
- **Phase 8 — Cleanup & Docs**
  - Keep assertions/log groups; remove dead anchors used.
  - Add README note on Baseline Smoke and seed mode.
  - Test: Baseline.

## 10) Debugging Tips
- When inputs fail: log `controlKeys`, `this.cursors`, joystick state; re-run Move/Jump microtests.
- When physics feels off: log `player.body.blocked`, `playerBlocked`, `player.body.velocity`.
- For audio overlap: log which music tracks are playing; ensure only one loop is active.
- Keep `console.groupCollapsed` around noisy logs to reduce clutter.

## 11) Batch Execution Strategy
1. Apply one phase per commit.
2. After each save: reload tab (hot reload) and run Baseline Smoke + relevant microtests.
3. Capture console logs (before/after positions, velocities, collision messages).
4. Proceed only if all checks pass; if not, revert the phase and re-apply with smaller diffs.

## 12) Rollback & Recovery
- If a phase fails a smoke test, undo just that phase (git checkout of touched files) and retry with smaller, single-literal swaps.
- Keep a running log of console outputs per phase to spot drift early.
- If camera or timer stops, first restore assertions and anchor comments to locate the regression, then re-run tests.
