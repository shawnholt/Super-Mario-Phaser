# ASSETS & CODEFIELD MAP
Friendly map of the big pieces on screen and where they live in code. Think of this as our shared legend when we “vibe code.”

## Player (Mario)
- Looks: three outfits loaded in `javascript/game.js` → `mario` (small), `mario-grown`, `mario-fire`.
- States: `playerState` 0/1/2 = small/grown/fire (global). Hurt steps you down; death happens at 0.
- Spawn: `createPlayer()` in `javascript/game/player-control.js` drops him on the start floor.
- Movement brain: `updatePlayer(delta)` (same file) handles run, jump, crouch, fire, win/fall, and game-over.
- Inputs: defaults set in `createControls()` (`javascript/game.js`): Jump=Space, Down=S, Left=A, Right=D, Fire=Q, Pause=Esc. Arrow keys also work via Phaser cursors. On mobile, Rex virtual joystick kicks in.
- Movement feel: acceleration smoothing via `SmoothedHorionztalControl` in `javascript/game.js`; speeds/gravity/jump force pulled from `window.GameSettings`.
- Actions to tweak:
  - Jump: only if feet are on the ground; force = `-GameSettings.jumpForce`.
  - Run: lerps toward `GameSettings.playerSpeed`; flips sprite left/right.
  - Crouch: only grown/fire; shrinks hitbox.
  - Fireball: fire state + Fire key; see Fireball section.

## Enemies
- Goombas: spawned in `createGoombas()` (`javascript/game/entities-control.js`); walk with `GameSettings.enemySpeed`. Stomp from above or burn with fireball. Hurt Mario on side hits.
- Koopa/Shell: sprites are preloaded but there’s no behavior yet (future enemy slot).

## Power-Ups, Projectiles, Collectibles
- Mystery blocks (`mistery-block`): animated “?” blocks. Hit from below → coin (most of the time), `super-mushroom`, or `fire-flower` (`javascript/game/blocks.js`).
- Mushroom: walks along the ground; `consumeMushroom()` makes Mario grown.
- Fire Flower: `consumeFireflower()` grants fire state.
- Fireball: `throwFireball()` (`javascript/game/fireball.js`); bounces off ground/walls via `fireballBounce()`, swaps animation based on direction, explodes on impact.
- Coins: floating coin animation; underground “ground-coin” rows from structures. `collectCoin()` adds score.

## Blocks & Terrain
- Ground/platform: `floorbricks` tiles built in `generateLevel()` (`javascript/game.js`); holes are recorded in `worldHolesCoords`.
- Breakable blocks (`block`, `block2`): small Mario just bumps them; grown/fire Mario shatters them into `brick-debris`.
- Mystery blocks: see Power-Ups above; tracked in `misteryBlocksGroup`.
- Immovable/construction blocks: `immovableBlock` columns and `block2` stacks (underground); solid, not breakable.
- Custom block on the start screen opens the Settings menu.
- Prefab structures: `generateStructure()` (`javascript/game/strucutres.js`) assembles patterns of blocks, coins, and question blocks depending on overworld/underground style.

## World Look & Flow
- Sky color rectangle from `drawSky()`. Props (clouds, mountains, bushes, fences) spawn randomly via `spawnClouds/Mountains/Bushes/Fences()` using densities in `window.GameSettings`.
- Start screen: small safe platform, clouds, NPC, gear icon, and the settings “custom block” (`drawStartScreen()`).
- Travel: run right across randomly built platforms and holes. Underground variant uses darker blocks and a teleport tube to the end.
- Finish line: flag mast + flag + castle in overworld; underground uses a tube teleport to that ending stretch. `raiseFlag()` handles the win moment.
- Camera: starts fixed; follows once you move right; stops near the end or after a teleport.

## HUD, Score, Timer
- Built in `createHUD()` (`javascript/game/hud-control.js`): shows `MARIO` score, `HIGH SCORE`, and `TIME`.
- Score helpers: `addToScore()` animates pop-up numbers; coins/power-ups/enemies call this.
- Timer: `updateTimer()` counts down; hurry-up music at 100; time-out triggers `gameOverFunc()`.

## Sounds
- Music: overworld, underground, hurry-up, win, game-over (`initSounds()` in `javascript/game.js`).
- Effects: jump, coin, power-up appear, consume, power-down, stomp, flagpole, fireball, kick, pause, block bump/break, time warning, “here we go.”
- Volume/mute: handled via music/effects groups in `applySettings()` (`javascript/game/settings.js`); slider and toggles in the Settings menu.

## Settings & Controls UI
- Settings menu (`javascript/game/settings.js`): pause-and-veil overlay with music/effects toggles, volume slider, and click-to-rebind controls (uses Rex plugins loaded in `preload()`).
- Pause key exists but the toggle in `createControls()` is commented out; settings are opened by the gear or hitting the start-screen block from below.

## Helper Scripts
- `javascript/helpers/screenshot.js`: takes a canvas screenshot (used on win/lose screens).
- `javascript/helpers/window-title.js`: sets the browser tab title.

## Additional (Open Hooks / Future Play)
- Koopa and shell sprites are ready but unused—space for a new enemy.
- Custom block only lives on the start screen; could appear in-level as a secret.
- Fire Mario crouch + firing uses a guard flag; test hitboxes if we change crouch behavior.
- World uses globals (player, score, etc.); keep that pattern for now to avoid confusion.
