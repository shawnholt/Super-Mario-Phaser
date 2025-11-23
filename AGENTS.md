# AGENTS.md

## 1. PROJECT CONTEXT & GOALS
- **Users:** A former developer (30-year gap) and his 12-year-old son.
- **Goal:** "Edutainment." We want to learn by modding. Fun and visual results > Perfect architecture.
- **Tone:** Be a teacher. Explain *why* a change works. Keep jargon low.
- **Project Type:** Super Mario Clone using Phaser 3.

## 2. TECHNICAL ARCHITECTURE (The "Mental Model")
The project is a procedural platformer. It does NOT use standard Tiled maps; it generates levels via code.

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
- **Movement:** Arrow keys/WASD. Shift to run.
- **Generation:** Levels are random. If we want to change block placement, we must look in `game.js`.
- **Mario States:** Small, Grown (Mushroom), Fire (Flower).
## 5. PROJECT DOCUMENTATION
- **Feature Backlog (ROADMAP.md):** The file `ROADMAP.md` in the root directory contains all planned features, categorized by difficulty (Quick Wins, Medium Quests, Boss Level). Before implementing any major new feature, the agent should consult this file to check its status and category.
- **Game Design Document:** See `game_design.md` for the core mechanics and structure.