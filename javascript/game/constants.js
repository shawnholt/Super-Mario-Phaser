console.log('✅ DEBUG: constants.js loaded successfully');

const _screenHeight = window.innerHeight * 1.1;
const _screenWidth = window.innerWidth;
const _jumpForce = _screenHeight / 1.15;

window.GameConstants = {
    // Physics & Movement
    JumpForce: _jumpForce,
    Gravity: _jumpForce * 2,
    PlayerSpeed: _screenWidth / 4.5,
    EnemySpeed: _screenWidth / 19,

    // World Dimensions
    ScreenHeight: _screenHeight,
    ScreenWidth: _screenWidth,
    WorldWidth: _screenWidth * 11,
    PlatformHeight: _screenHeight / 5,
    StartOffset: _screenWidth / 2.5,
    PlatformPieces: 100,

    // Game Rules
    TimeLimit: 300,
    InvulnerabilityDuration: 4000,
    StartLevelDelay: 1100,
    FadeDuration: 500,
    LevelEndDelay: 500,

    // Scores
    Scores: {
        Flag: 2000,
        PowerUp: 1000,
        Coin: 200,
        BreakBlock: 50 // Assuming default
    },

    // Colors
    Colors: {
        DefaultBackground: 0x8585FF,
        LoadingBox: 0x222222,
        LoadingBar: 0xffffff,
        SkyColors: [
            0x8585FF, // Default Blue
            0xFF8C00, // Sunset Orange
            0x000000, // Night Black
            0x663399, // Alien Purple
            0x00BFFF, // Deep Sky Blue
            0xFF69B4  // Hot Pink
        ]
    },

    // World Generation Densities
    Densities: {
        Cloud: { min: 760, max: 380 },
        Mountain: { min: 6400, max: 3800 },
        Bush: { min: 960, max: 760 },
        Fence: { min: 4000, max: 2000 }
    },

    // UI
    Fonts: {
        PixelNums: 'pixel_nums',
        CarrierCommand: 'carrier_command'
    }
};


