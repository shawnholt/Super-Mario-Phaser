# Refactor Notes (Branch Snapshot)

Audience: developers/agents comparing this branch to the original codebase. Purpose: describe what changed, why, and what remains outstanding per AGENTS.md and refactor.md.

## Objective
Make the Mario Phaser project more agent-friendly and deterministic by centralizing constants, modularizing level generation, adding an agent API, and enabling seeded RNG—without breaking gameplay.

## High-Level Changes vs. Origin
- **Constants centralized:** New `javascript/game/constants.js` holds physics/sizing/density values and colors. `game.js`, `player-control.js`, and `entities-control.js` now read from `window.GameConstants`.
- **Seeded RNG:** New `javascript/helpers/rng.js` introduces `randomBetween()` with optional `?seed=` (Mulberry32). Invalid seeds fall back to `Math.random()`.
- **Level generation extracted:** World drawing and platform/structure generation moved from `game.js` into `javascript/game/level-generation.js`; `generateStructure` lives there now.
- **Agent API scaffolded:** New `javascript/helpers/agent-helpers.js` exposes `window.AgentHelpers.getGameState()` and `pressKey()` for unattended testing.
- **Instrumentation:** `game.js` now has section markers and `console.assert` checks in `create`/`update` for critical globals.
- **File cleanup:** Removed obsolete root `javascript/settings.js` and the old `strucutres.js`; corresponding script tags removed from `index.html`.
- **Audio compression:** Legacy WAV effects/music (`win`, `block-bump`, `break-block`, `goomba-stomp`, `pause`) converted to MP3; preload paths updated; original WAVs retained.

## Codebase Overview (current)
- **Entry:** `index.html` loads constants → rng → game.js → animations/blocks/level-generation/settings/fireball/player-control/hud-control/entities-control/helpers.
- **Globals:** Still rely on global variables (player, score, timeLeft, controlKeys, etc.) per AGENTS.md.
- **RNG:** All `randomBetween` calls are seed-aware; remaining randomness should migrate off `Math.random`/`Phaser.Math.Between` if any linger.
- **Settings UI:** `javascript/game/settings.js` (UI) remains unchanged and required.
- **Agent helpers:** Available globally; suitable for refactor.md Phase 2.

## Notable Diffs by Area
- **game.js:** Uses GameConstants for dimensions/physics/timers; calls extracted level-gen helpers; added assertions and section headers.
- **level-generation.js:** Contains world drawing, random coordinate selection, platform/hole generation, and `generateStructure`.
- **entities-control.js / player-control.js / blocks.js:** Updated to use `GameConstants` and `randomBetween`.
- **constants.js:** Defines GameConstants.
- **helpers/rng.js:** Seed parsing with fallback; `randomBetween` global.
- **helpers/agent-helpers.js:** Provides state snapshot and keypress injection helpers.

## Remaining Gaps / Risks (per refactor.md)
- **Timing determinism:** Numerous `setTimeout`/`setInterval` calls remain in game, fireball, entities, hud, blocks, player-control, and window-title helpers; Phase 5 (stabilize game loop) not done.
- **Testing not recorded:** Baseline Smoke was not run in this review; verify after any further change.

## Comparison Summary
Compared to the origin, this branch is more modular (level-gen extracted), constants-driven, and agent-ready (seeded RNG + AgentHelpers). Gameplay should remain intact; full timing determinism is pending.
