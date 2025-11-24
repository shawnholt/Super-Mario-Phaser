
# Project Roadmap & Quest Log

## Quick Wins (10–20 mins)
Small, visual, or sound tweaks to warm up.
- [ ] [Risk-L] Visual: Change the sky color or tint to set a new vibe.
- [ ] [Risk-L] Audio: Swap the jump sound effect for something funnier.
- [ ] [Risk-L] HUD: Adjust score/time text size or position so it reads clearly on smaller screens.
- [ ] [Risk-L] Controls hint: Add a tiny “A/D or Arrows to move, Space to jump” note on the start screen.

## Medium Quests (about 1 hour)
Takes a bit of logic but still bite-sized.
- [ ] [Risk-H] Mechanics: Add a Double Jump (tap Space twice for a second, smaller lift; still feels fair).
- [ ] [Risk-M] Physics: When a coin pops from a mystery block, give it gravity and a short arc before it lands (bonus points for catching it mid-air).
- [ ] [Risk-M] Enemies: Make Goombas speed up after a timer or when the player reaches mid-level.
- [ ] [Risk-M] Enemies: Add Koopas (the shell guys) so they take damage and can be stomped/bumped like Goombas.

## Boss Level Projects (multi-session)
Big changes that need planning.
- [ ] [Risk-H] Avatar swap: Press `C` to swap Mario for another character sprite set.
- [ ] [Risk-H] Level editor: Place blocks by hand instead of purely random generation.
- [ ] [Risk-M] Mobile polish: Add on-screen jump/fire buttons alongside the joystick.
- [ ] [Risk-H] Checkpoints & autosave: Drop a checkpoint flag/marker so deaths restart you there; auto-save on reach.
- [ ] [Risk-H] Backtracking: Allow moving left to previous screen segments (camera/world bounds updates without breaking spawning).

## The Icebox (ideas for later)
- [Risk-M] Multiplayer run-and-race mode.
- [Risk-M] Power-up that makes Mario invisible (sneak past enemies?).

## AI Suggestions (inspired by common browser Mario clones; not yet reviewed against external codebases)
- [ ] [Risk-H] Moving platforms and elevators: timed motion requires careful collision/group updates.
- [ ] [Risk-H] Invincibility star: temporary player buff + music swap + enemy wipe on touch.
- [ ] [Risk-M] Combo stomp scoring: increasing points for chaining stomps without landing.
- [ ] [Risk-M] Timed P-switch style blocks: coins temporarily turn into solid blocks (or vice versa).
- [ ] [Risk-H] Wall jump: allows bounce off walls; high chance of movement bugs with existing globals.
