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