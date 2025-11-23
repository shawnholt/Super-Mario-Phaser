Implementation Plan - Centralize Magic Numbers
Goal Description
The goal is to move "Magic Numbers" (physics values, spawn rates, timers) from 
game.js
 and 
player-control.js
 into a single, easy-to-edit file called javascript/config.js. This will allow the user and their son to tweak game mechanics easily.

User Review Required
IMPORTANT

New File: javascript/config.js will be created. Global Scope: We will use a global const GameConfig object. This matches the existing architecture but requires config.js to be loaded before other scripts in 
index.html
.

Proposed Changes
Configuration
[NEW] 
config.js
Create a new file to hold all constants.
Structure:
const GameConfig = {
    Physics: {
        gravity: 0, // Will be calculated based on screen height
        jumpForce: 0,
        runSpeed: 0
    },
    Level: {
        timeLimit: 300,
        platformPieces: 100
    },
    // Add other categories as needed
};
Entry Point
[MODIFY] 
index.html
Add <script src="./javascript/config.js"></script> before <script src="./javascript/game.js"></script>.
Game Logic
[MODIFY] 
game.js
Remove hardcoded constants (e.g., velocityX, velocityY, timeLeft).
Initialize GameConfig values that depend on window.innerHeight (dynamic calculation).
Replace usages with GameConfig.Physics.runSpeed, GameConfig.Level.timeLimit, etc.
[MODIFY] 
player-control.js
Replace hardcoded velocity and jump values with GameConfig.Physics....
Verification Plan
Automated Tests
None (No test framework exists).
Manual Verification
Load the Game: Open the game in the browser.
Check Console: Ensure no "GameConfig is not defined" errors.
Gameplay Check:
Run and Jump: Does Mario move at the same speed? Does he jump the same height?
Timer: Does the timer start at 300?
"The Kid Test" (Tweak Verification):
Modify javascript/config.js: Change jumpForce to a huge number.
Reload: Verify Mario jumps super high.
Revert changes after test.