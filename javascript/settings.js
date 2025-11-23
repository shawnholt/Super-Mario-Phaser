console.log('✅ DEBUG: settings.js loaded successfully');

const _screenHeight = window.innerHeight * 1.1;
const _screenWidth = window.innerWidth;
const _jumpForce = _screenHeight / 1.15;

window.GameSettings = {
    jumpForce: _jumpForce,
    gravity: _jumpForce * 2,
    playerSpeed: _screenWidth / 4.5,
    enemySpeed: _screenWidth / 19,

    // World Generation Settings
    cloudDensity: { min: 760, max: 380 }, // Higher divisor = fewer clouds
    mountainDensity: { min: 6400, max: 3800 },
    bushDensity: { min: 960, max: 760 },
    fenceDensity: { min: 4000, max: 2000 }
};

console.log('DEBUG: Gravity loaded:', window.GameSettings.gravity);
console.log('DEBUG: Player Speed loaded:', window.GameSettings.playerSpeed);
console.log('DEBUG: Enemy Speed loaded:', window.GameSettings.enemySpeed);
