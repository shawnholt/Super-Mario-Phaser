# AGENTS.md

## 1. PROJECT CONTEXT & GOALS
- **Users:** A former developer (30-year gap) and his 12-year-old son.
- **Goal:** "Edutainment." We want to learn by modding. Fun and visual results > Perfect architecture.
- **Tone:** Be a teacher. Explain *why* a change works. Keep jargon low.
- **Project Type:** Super Mario Clone using Phaser 3.

## 2. TECHNICAL ARCHITECTURE (The "Mental Model")
The project is a procedural platformer. It does NOT use standard Tiled maps; it generates levels via code. For a friendly map of the moving parts, see `ASSETS.md`. For the player-eye view, see `Gameplay.md`.

### **Key Files**
- **`javascript/game.js`**: The "Monolith." Contains the `preload`, `create`, `update` loop and Level Generation logic.
- **`javascript/game/player-control.js`**: Mario's physics, movement, and animations.
- **`javascript/game/entities-control.js`**: Enemy (Goomba) logic.
- **`index.html`**: Entry point.

### **Data Structure**
- **State:** Relies heavily on **Global Variables** (`player`, `score`). *Do not refactor these away yet—they are easy for us to understand.*
- **Context:** Uses old-school `.call(this)` to share scope. *Respect this pattern so code doesn't break.*

## 3. RULES FOR AI AGENTS
1.  **Visual First:** When we ask for an idea, prioritize things we can see immediately (e.g., "Make Mario Blue," "Make jumps higher").
2.  **One Step at a Time:** Do not refactor the whole app. If we ask to change the jump height, *only* change the jump height.
3.  **Modernization Policy:**
    - The code currently uses `var`. You may switch new code to `const/let`.
    - Do NOT introduce TypeScript or build steps that require complex config.
4.  **Debugging:**
    - We run on `localhost:5173`.
    - If suggesting a fix, assume we are editing the raw `.js` files, not a compile target.

## 4. KNOWN GAME MECHANICS
- **Movement:** Arrow keys/WASD. Running is the default speed; no separate sprint key yet. See `Gameplay.md` for the kid-friendly rundown.
- **Generation:** Levels are random. If we want to change block placement, we must look in `game.js`.
- **Mario States:** Small, Grown (Mushroom), Fire (Flower).

## 5. PROJECT DOCUMENTATION
- **Gameplay (player-eye):** `Gameplay.md` — what the game does, controls, and how to explain it to newcomers.
- **Assets & Code Map:** `ASSETS.md` — where key objects, sprites, and functions live so we can mod quickly.
- **Feature Backlog:** `ROADMAP.md` — planned work, grouped by difficulty (Quick Wins, Medium Quests, Boss Level). Check before adding major features.
- **Game Design Document:** See `game_design.md` for the core mechanics and structure.
## 6. TESTING & AUTOMATION PROTOCOLS
**CRITICAL: DO NOT OPEN NEW BROWSER TABS.**
1.  **Hot Reload Only:** This project uses Vite. Saving a file automatically updates the running browser. NEVER run "Start Debugging" or open a new Chrome instance to test a change.
2.  **Background Testing:** Assume the browser window is **hidden or in the background**.
    * **FORBIDDEN:** Do not use `Input.dispatchKeyEvent` or `Input.dispatchMouseEvent` (CDP). These fail in background tabs.
    * **REQUIRED:** Use `Runtime.evaluate` to inject JavaScript events directly:
        ```javascript
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowRight', key: 'ArrowRight' }));
        ```
3.  **Verification:** When testing movement, log the `player.x` coordinate before and after the injected event to prove success.
4.  **Robust Event Injection:** When injecting events, use comprehensive event properties to ensure Phaser detects them.
    *   **Required Properties:** `bubbles: true`, `cancelable: true`, `view: window`, `keyCode` (legacy support).
    *   **Target:** Dispatch to `window` (and optionally `document` if `window` fails).
    *   **Example:**
        ```javascript
        const eventOptions = {
            key: 'ArrowRight',
            code: 'ArrowRight',
            keyCode: 39,
            bubbles: true,
            cancelable: true,
            view: window
        };
        window.dispatchEvent(new KeyboardEvent('keydown', eventOptions));
        ```
