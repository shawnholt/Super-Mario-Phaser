# Gameplay Guide (Player-Eye View)
This is what the game feels like to play, written for our crew (kids and adults) so we can point, tweak, and celebrate wins.

## Goal
Run to the right, avoid holes, bop enemies, grab coins and power-ups, and reach the flag (or end tube underground) before the timer hits zero.

## Controls (defaults)
- Move: A/D or Arrow Left/Right.
- Jump: Space (only works if your feet are on the ground).
- Crouch: S or Arrow Down (grown/fire Mario only).
- Fireball: Q (only when you have the fire flower).
- Pause/Settings: Gear icon or hit the gear block on the start screen. Esc is wired but the toggle is commented out for now.
- Mobile: On-screen joystick appears automatically.

## Mario’s States
- Small: 1 hit = lose.
- Grown (mushroom): taller, can crouch, breaks blocks by headbutting.
- Fire (flower): everything from grown + throws fireballs.

## Power-Ups and Items
- Mystery blocks (?): usually give a coin, sometimes a mushroom, sometimes a fire flower.
- Coins: add score; underground has rows of “ground coins.”
- Mushroom: makes you grown.
- Fire Flower: gives fire state so you can shoot.
- Fireball: bouncy projectile; knocks out Goombas.

## Enemies
- Goombas: walk back and forth. Stomp from above to squish them; touching their sides hurts.
- Koopas: art exists but they don’t spawn yet—future enemy slot.

## Level & World
- Procedural platforms: random mix of ground and holes; underground variant uses darker blocks and has a teleport tube near the end.
- Props: clouds, bushes, mountains, fences for vibe; sky color depends on overworld/underground.
- Start screen: safe platform, NPC and gear icon; hit the gear block from below to open Settings.
- Finish: overworld flag + castle, or underground tube that moves you to the flag stretch.
- Camera: follows once you leave the start area; stops near the end.

## Scoring & Timer
- Score shows as “MARIO”; High Score saves in your browser.
- Timer counts down; at 100 seconds the music speeds up. Timer reaching 0 triggers game over.

## Losing & Winning
- Lose if you fall in a hole, run out of time, or take a hit while small.
- Win by reaching the flag; Mario auto-runs through the ending animation.

## Where to Tinker First
- Easy: change sky color, player speed, or jump force (see `javascript/settings.js`).
- Medium: add more mystery blocks or coins to structures, tweak Goomba speed.
- Future: add Koopas/shells, enable a true pause key, or build a level editor.
