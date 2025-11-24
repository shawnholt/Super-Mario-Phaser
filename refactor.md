# Refactoring Plan V2 (Consolidated) - The Definitive AI Agent Roadmap

## 1. Primary Goal: Enable AI-Driven Development

The central objective of this refactoring is to restructure the codebase so that an AI agent can effectively understand, modify, and test the game without falling into "death spirals" of confusion. This plan balances the need for a stable, predictable environment for the AI with the need to preserve the game's feel and minimize risk for human players.

### AI-First Design Principles
-   **High Cohesion, Low Coupling:** Each file will have a single responsibility to reduce the context an AI needs to perform any given task.
-   **Predictable State:** The game's evolution will be made as deterministic as possible, allowing an AI to reliably test the outcome of its actions.
-   **Stable Agent API:** We will create a formal, stable interface for the AI to "play" the game, decoupling it from the game's internal implementation.

## 2. Analysis of AI Failure Points
The current codebase presents several traps for an AI agent that this plan will eliminate:
-   **The Monolith (`game.js`):** A massive file that forces an AI to load too much unrelated context, leading to incorrect assumptions.
-   **Asynchronous Updates (`setTimeout`):** Unpredictable timing logic that makes it impossible for an AI to reliably correlate its actions with changes in the game state.
-   **Scattered Logic:** Related concepts (like power-ups) are spread across multiple files, forcing the AI to perform inefficient and error-prone searches.
-   **Magic Numbers:** Unnamed constants that hide the semantic meaning of game parameters from the AI.

## 3. The Refactoring Roadmap
This is a phased approach that prioritizes safety and delivers value to the AI agent at each step.

### Phase 0: Instrument & Anchor
**Goal:** Make the existing monolith safer and easier to navigate before changing it.
-   **Action:** In `game.js`, add section comments (`// --- PRELOAD ---`, `// --- UPDATE ---`, etc.) to delineate logical blocks.
-   **Action:** Add `console.assert` statements in `create()` and `update()` to ensure critical globals (`player`, `platformGroup`, etc.) are never null or undefined, failing fast if they are.

### Phase 1: Constants Extraction
**Goal:** Improve code readability for the AI by replacing ambiguous numbers with descriptive constants.
-   **Action:** Create `javascript/game/constants.js`.
-   **Action:** Populate it with all "magic numbers" (gravity, speeds, timings) from the codebase.
-   **Action:** Load `constants.js` in `index.html` (before other game scripts) and replace all hardcoded numbers with the new constants.

### Phase 2: Agent API Scaffolding
**Goal:** Provide the AI with a stable set of tools to interact with the game as early as possible.
-   **Action:** Create `javascript/helpers/agent-helpers.js` and load it in `index.html`.
-   **Action:** In this file, create a global `window.AgentHelpers` object.
-   **Action:** Implement the first version of the API:
    -   `window.AgentHelpers.getGameState()`: Returns a snapshot of key globals, e.g., `{ player: { x, y, state }, timeLeft, score }`.
    -   `window.AgentHelpers.pressKey({ key, code, durationMs = 150 })`: A function that dispatches `keydown` and, after `durationMs`, a `keyup` event using `window.dispatchEvent`.

### Phase 3: Deterministic Level Generation (Opt-in)
**Goal:** Create a reproducible testing environment for the AI with zero risk to the default player experience.
-   **Action:** Add logic to `game.js` to check for a `?seed=...` URL parameter.
-   **Action:** If a seed is present, use it to initialize a simple seeded Pseudo-Random Number Generator (PRNG).
-   **Action:** Pass this seeded PRNG to the level generation functions. All calls to `Math.random()` in level generation must be replaced with calls to the PRNG.
-   **Action:** If no seed is present, the game runs using `Math.random()` exactly as it does now.

### Phase 4: Safe Modularization
**Goal:** Break apart the monolith into logical modules without performing risky deep rewrites.
-   **Action:** Following the original coding patterns, extract logic for HUD, Enemies, Player Lifecycle, and Level Generation into their own files (`hud-control.js`, `entities-control.js`, etc.).
-   **Action:** These new modules will be called from `game.js` using `.call(this)` to preserve the Phaser scene context. The focus is on moving code, not re-architecting it.

### Phase 5: Stabilizing the Game Loop (Carefully)
**Goal:** Achieve full determinism by replacing unstable `setTimeout` calls with a stable, game-loop-driven equivalent.
-   **Action:** Identify all uses of `setTimeout` for game logic (e.g., the HUD timer, fireball updates).
-   **Action:** Replace them with Phaser's built-in timing events (`this.time.addEvent({...})`) or by driving their logic directly from the main `update(time, delta)` loop.
-   **Risk & Mitigation:** The timing and "feel" of the game is critical. After replacing a `setTimeout`, the new implementation must be carefully tested to ensure its cadence and behavior are identical to the old one. The goal is a stable implementation, not a different one.

### Phase 6: Cleanup & Documentation
**Goal:** Finalize the process and make the new features discoverable.
-   **Action:** Update `README.md` to document the `?seed=` parameter and the `window.AgentHelpers` API for testing.
-   **Action:** Remove any temporary code or `//TODO` comments that are no longer relevant.

## 4. Verification Strategy
A robust testing process combines manual checks with the new agent-centric tools. The **`Baseline Smoke Checklist`** (found in the Appendix) is the standard for manual verification after each phase.

An AI agent's preferred testing loop will now be:
1.  Navigate to a URL with a known seed: `localhost:5173/?seed=123`.
2.  Call `window.AgentHelpers.getGameState()` to get the initial state.
3.  Call `window.AgentHelpers.pressKey({...})` to perform an action.
4.  Wait for the action's duration to complete.
5.  Call `window.AgentHelpers.getGameState()` again to get the final state.
6.  Compare the initial and final states to verify the outcome. Because the level layout and game logic are now deterministic, this test will produce the same result every time.

---
## 5. Appendix: Protocols, Checklists, and Invariants

This appendix contains the detailed information required to safely test and verify the refactoring at each phase.

### 5.1. Scope & Invariants (Do Not Break)
-   **Globals that must exist:** `player`, `score`, `timeLeft`, `controlKeys`, `worldHolesCoords`, `platformGroup`, `goombasGroup`, music/effects groups, `playerState`, `playerBlocked`, `playerInvulnerable`, `playerFiring`, `fireInCooldown`, `smoothedControls`.
-   **Context contract:** Many helpers rely on `.call(this)`; preserve that pattern when moving code.
-   **Input surfaces must remain:** `controlKeys` (configurable), `this.cursors` (Phaser defaults), Rex virtual joystick.
-   **DOM hooks:** loading GIF elements, canvas for screenshots.
-   **Physics/timers:** invulnerability blink timers, fireball lifespan, HUD timer recursion, tween-based transitions must have their timing preserved.

### 5.2. Baseline Smoke Checklist (Run after each phase)
1.  Load `localhost:5173`, confirm no console errors.
2.  Spawn & idle: Mario renders; timer and score show.
3.  Move right: run “Move right” microtest (see below); confirm `after x > before x`.
4.  Jump: run “Jump” microtest; confirm velocity becomes negative.
5.  Enemy contact: walk into first Goomba; expect stomp when landing on top, damage on side.
6.  Win/lose transitions (time permitting): fall in a pit for game over; reach flag/tube for win animation.
*Record console outputs for comparison.*

### 5.3. Console Microtests (For Bootstrap Verification)
Use these snippets in the browser console to test basic functionality before the `AgentHelpers` API is built.

-   **Move right:**
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
-   **Jump:**
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

### 5.4. Risk Register (Key areas to watch)
-   **Transitions:** Start screen triggers, teleport tube sequences, and the final flag raise. These involve camera toggles, fades, tweens, and music swaps that are easy to break.
-   **Timers:** The HUD timer recursion (especially the hurry-up music at `timeLeft === 100`), player invulnerability blinks, and fireball lifespan/bounce logic.
-   **Enemy Logic:** Goomba cleanup (`clearGoombas`) can be sensitive to velocity changes.
-   **Scenery:** The sky color cycling logic.

---
## 6. Appendix: Mid-Project Continuation Plan (REVISED & SAFER)

### 6.1 Summary of Prior Work (State as of Nov 2025)
A previous agent has already completed the goals of several phases in a single batch:
-   **Phase 0 (Instrument & Anchor):** ✅ Completed.
-   **Phase 1 (Constants Extraction):** ✅ Completed. `constants.js` exists and replaces the obsolete `settings.js`.
-   **Phase 3 (Deterministic RNG):** ✅ Completed. `rng.js` exists and is used by the level generator.
-   **Phase 4 (Modularization):** ✅ Partially completed. Level generation code was moved to `level-generation.js`.

**Current State:** The code is functional but inconsistent. It uses a mix of the new `window.GameConstants` and the old `window.GameSettings` (via a compatibility shim in `constants.js`).

### 6.2 New Execution Plan (Safer, More Granular)
Your task is to stabilize the codebase and then resume the original refactoring roadmap. Execute these tasks **sequentially**, running the full **`Baseline Smoke Checklist`** after every single action that modifies a file.

**Task 1: Harden RNG**
-   **Goal:** Prevent `NaN` errors from invalid seed parameters.
-   **Action:** Read `javascript/helpers/rng.js`. Modify the seed parsing logic to validate that the seed is a number. If it is not a valid number, fall back to using `Math.random()`.
-   **Verify:** Run the Smoke Checklist.

**Task 2: Finish Codebase Consistency Refactor**
-   **Goal:** Eliminate the `GameSettings` compatibility layer by refactoring all remaining code to use `window.GameConstants`.
-   **Action:** Search the entire `/javascript` directory for any remaining uses of `window.GameSettings`. Known locations include `game.js`, `player-control.js`, and `entities-control.js`.
-   **Action:** For each file, replace every instance of `GameSettings` with the correct path in `window.GameConstants` (e.g., `window.GameSettings.playerSpeed` becomes `window.GameConstants.PlayerSpeed`). **Commit after each file is refactored and verified.**
-   **Verify:** After each file modification, run the Smoke Checklist.

**Task 3: Remove Compatibility Shim**
-   **Goal:** Remove the now-unnecessary backwards-compatibility layer.
-   **Action:** After all `GameSettings` references are confirmed to be gone from the entire project, delete the `window.GameSettings` object from the bottom of `javascript/game/constants.js`.
-   **Verify:** Run the Smoke Checklist.

**Task 4: Consolidate `strucutres.js`**
-   **Goal:** Finish modularizing level generation.
-   **Action:** Move the `generateStructure` function from `javascript/game/strucutres.js` into `javascript/game/level-generation.js`.
-   **Action:** Update `level-generation.js` to call the function locally.
-   **Verify:** Run the Smoke Checklist, ensuring levels still generate with structures.
-   **Action (Conditional):** If the above passes verification, delete the now-obsolete `javascript/game/strucutres.js` file and its `<script>` tag from `index.html`.
-   **Verify:** Run the Smoke Checklist again.

**Task 5: Clean up Obsolete `settings.js`**
-   **Goal:** Remove the original, now-unused constants file.
-   **Action:** The file `javascript/settings.js` (at the root of the `javascript` folder) is obsolete. Delete it.
-   **Action:** Verify the `<script>` tag for `javascript/settings.js` is gone from `index.html`. (Note: Do NOT touch `javascript/game/settings.js`, which controls the UI).
-   **Verify:** Run the Smoke Checklist.

**Task 6: Commit All Cleanup**
-   **Action:** If all the above tasks have passed, commit all staged changes with the message: `"refactor: Complete codebase cleanup and file consolidation"`

**Task 7: Resume Original Roadmap**
-   **Action:** With the cleanup complete, resume the original plan. The next task is **Phase 2: Agent API Scaffolding**.
-   **Action (Modified for Safety):** A previous agent likely created the file `javascript/helpers/agent-helpers.js`. Your first action for this phase is to **verify and complete** it. Ensure it contains `getGameState()` and `pressKey()` functions attached to a global `window.AgentHelpers` object. Extend them if necessary to match the specification in the main body of Phase 2. **Do not overwrite or re-create the file if it exists.**
    **Action:** After verifying or completing the Agent API, proceed with the remaining phases (`Phase 5`, `Phase 6`). Follow all verification and commit rules.

---
## 7. Appendix: Handoff Plan for Next Agent (Nov 2025)

### 7.1. Current Status Summary
A detailed review of the codebase has been completed. The "Mid-Project Continuation Plan" (Appendix 6.2) is mostly finished, but several key tasks from the main roadmap are still outstanding.

-   **`COMPLETE`**:
    -   Phase 0: Instrument & Anchor
    -   Phase 1: Constants Extraction
    -   Phase 2: Agent API Scaffolding (`agent-helpers.js` is implemented)
    -   Phase 3: Deterministic Level Generation (`rng.js` is hardened)
    -   Phase 4: Safe Modularization (Core files extracted)
    -   File cleanup tasks (obsolete `settings.js` and `strucutres.js` removed)

-   **`INCOMPLETE`**:
    -   **Shim Removal:** The `window.GameSettings` compatibility shim remains in `javascript/game/constants.js`.
    -   **Phase 5: Stabilizing the Game Loop:** The codebase still uses many non-deterministic `setTimeout` calls.
    -   **Phase 6: Cleanup & Documentation:** The `README.md` has not been updated with the new features.

### 7.2. Remaining Tasks (Execute in Order)
The next agent must complete the following tasks sequentially.

**Task 1: Remove Compatibility Shim**
-   **Goal:** Finalize codebase consistency.
-   **Action:** Delete the `window.GameSettings` object from the end of `javascript/game/constants.js`.
-   **Verify:** Run the `Baseline Smoke Checklist` (Appendix 5.2) to ensure no regressions.

**Task 2: Stabilize Game Loop (Phase 5)**
-   **Goal:** Achieve full determinism for reliable AI testing by replacing unstable timing events.
-   **Action:** Systematically replace all `setTimeout` calls with Phaser's `this.time.addEvent({...})` or by driving them from the main `update(time, delta)` loop. This is a large, sensitive task. It is recommended to work on one file at a time, followed by verification.
-   **Reference Files:** `game.js`, `fireball.js`, `player-control.js`, `hud-control.js`, `entities-control.js`, `blocks.js`.
-   **Verify:** After each file is refactored, run the `Baseline Smoke Checklist`. The game's timing and "feel" must be preserved.

**Task 3: Finalize Documentation (Phase 6)**
-   **Goal:** Make new testing features discoverable.
-   **Action:** Update `README.md` to document the `?seed=` URL parameter for seeded level generation and the `window.AgentHelpers` API for external control.
-   **Verify:** Manually review the `README.md` to confirm the new documentation is clear and accurate.