# Incremental Refactor & Test Playbook for AI Agents

This document is for **automated or semi-automated IDE agents** that struggle with large edits. It breaks work into tiny, verifiable phases so changes can be applied in batch and checked in the browser without feedback loops.

## Goals
- Preserve current gameplay while making the code easier to modify in small, safe steps.
- Add **tests you can run from the browser console** (no new frameworks).
- Reduce global coupling gradually; never attempt sweeping refactors in one go.

## Operating Constraints
- Keep Vite hot-reload workflow. Do **not** add build steps or new tooling.
- Respect existing globals and `.call(this)` patterns; only extract code when tests are in place.
- Make one phase at a time, commit, then re-run smoke checks before continuing.

## Baseline Smoke Checklist (run before and after each phase)
1. **Load game:** Open `localhost:5173`, confirm no console errors.
2. **Spawn & idle:** Mario appears, timer and score render.
3. **Move right:** Inject one key press in console and log `player.x` before/after:
    ```js
    console.log('before', player.x);
    const opts = { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, bubbles: true, cancelable: true, view: window };
    window.dispatchEvent(new KeyboardEvent('keydown', opts));
    setTimeout(() => console.log('after', player.x), 250);
    ```
4. **Jump:** Repeat with `Space` (keyCode `32`), confirm `player.body.velocity.y` becomes negative.
5. **Enemy contact:** Walk into first Goomba; Mario should take damage or stomp depending on velocity.
6. **Win/lose transitions:** If time permits, run into a pit (game over) and reach flagpole (win) to ensure scenes still trigger.

Record console outputs; the agent can parse logs to validate each step.

## Phase Plan

### Phase 0 – Baseline Documentation Hooks
- Add brief comments marking section boundaries in `javascript/game.js` (preload, create, update, HUD, level gen). Do not move code.
- Add TODO anchors (e.g., `// TODO: refactor: player-setup`) for future searchability.
- **Test:** Run Baseline Smoke Checklist.

### Phase 1 – Extract Constants Safely
- Introduce a new file `javascript/constants.js` with **only** readonly values (speeds, gravity, timing) copied from current code.
- Replace inline literals in `game.js` and `player-control.js` with imports **one constant at a time** to avoid drift.
- Keep defaults identical; avoid behavioral change.
- **Test:** Baseline + confirm numbers match by logging a sample constant in console (e.g., `console.log(window.gameConstants)`).

### Phase 2 – Isolate Input Mapping
- Create `javascript/input-map.js` exporting key bindings and a helper to register them.
- Update `game.js` to consume the helper while retaining current `this.input.keyboard.addKeys` semantics.
- Ensure global variables for controls remain available for dependents.
- **Test:** Baseline + add console check that `controls` object has expected keys and that injected events still move Mario.

### Phase 3 – HUD/Timer Separation
- Move HUD-related code (score/time text creation and updates) into `javascript/hud.js` with functions `createHud(scene)` and `updateHud(scene)`.
- Replace in `game.js` by calling these helpers inside `create`/`update`. Keep signatures `(scene)` and ensure `.call(this)` context is respected.
- **Test:** Baseline + verify score/time update when collecting a coin and as time decreases (watch console logs if needed).

### Phase 4 – Enemy Logic Encapsulation
- Keep `entities-control.js` but wrap enemy creation/update in exported functions (`spawnGoombas(scene, platforms)` and `updateGoombas(scene)`).
- Replace direct logic in `game.js` with these calls, passing existing globals explicitly. Avoid altering physics settings.
- **Test:** Baseline + confirm Goombas still patrol and collisions behave.

### Phase 5 – Player Lifecycle Separation
- In `player-control.js`, extract state-change helpers (grow, shrink, fire) into named functions; export them for clarity.
- Update internal calls to use the new helpers without changing globals or animations.
- **Test:** Baseline + collect mushroom/flower to confirm state transitions and damage handling.

### Phase 6 – Level Generation Hooks
- Wrap level generation code in `javascript/level-gen.js` with pure-ish functions that accept RNG seeds/options.
- Initially call with the current defaults to keep randomness consistent; later phases can add deterministic seeds for testing.
- **Test:** Baseline + log generated platform counts to console to compare against pre-refactor runs.

### Phase 7 – Deterministic Testing Mode (Optional but Recommended)
- Add a query param toggle (e.g., `?seed=123`) read in `game.js` to seed RNG for repeatable tests using a small PRNG (no new deps).
- When seed is present, log it and ensure level generation uses it; otherwise retain existing randomness.
- **Test:** Run with `localhost:5173/?seed=1` twice and confirm platform layout logs match.

### Phase 8 – Cleanup and Guardrails
- Add lightweight runtime assertions (simple `console.assert`) around critical globals (player, platforms) in `create` and `update`.
- Add a short `README` section describing how to use the Baseline Smoke Checklist and seeded runs.
- **Test:** Baseline; ensure assertions do not trigger under normal play.

## Debugging Tips for Agents
- Favor **search-and-replace for one literal at a time**; verify after each swap.
- When imports fail, check relative paths and confirm Vite reload shows no 404s in the console.
- Use `console.groupCollapsed` blocks to keep automated logs tidy.
- If a change breaks input, first log `this.input.keyboard` and the `controls` object, then trigger injected events to confirm wiring.
- If physics misbehaves after refactors, log `player.body.blocked` and `playerBlocked` flags each frame for a few seconds.

## Batch Execution Strategy
- Apply one phase per commit. After each commit:
  1. Reload the game tab.
  2. Run Baseline Smoke Checklist.
  3. Capture console logs (before/after positions, velocities, collision messages).
- Proceed to the next phase only if all checks pass. If a check fails, revert to previous commit and re-apply with smaller diffs.

Sticking to these steps keeps the refactor safe, observable, and friendly to automated IDE agents.
