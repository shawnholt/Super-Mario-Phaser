const loadingGif = document.querySelectorAll('.loading-gif');

const mobileDevice = isMobileDevice();

const screenWidth = window.GameConstants.ScreenWidth;
const screenHeight = window.GameConstants.ScreenHeight;

const velocityX = window.GameConstants.PlayerSpeed;
const velocityY = window.GameConstants.JumpForce;

const levelGravity = window.GameConstants.Gravity;

var config = {
    type: Phaser.AUTO,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: window.GameConstants.Colors.DefaultBackground,
    parent: 'game',
    preserveDrawingBuffer: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: levelGravity },
            debug: false
        }
    },
    scene: {
        key: 'level-1',
        preload: preload,
        create: create,
        update: update
    },
    version: '0.7.3'
};

const worldWidth = window.GameConstants.WorldWidth;
const platformHeight = window.GameConstants.PlatformHeight;

const startOffset = window.GameConstants.StartOffset;

// Hole with is calculated dividing the world width in x holes of the same size.
const platformPieces = window.GameConstants.PlatformPieces;
const platformPiecesWidth = (worldWidth - screenWidth) / platformPieces;

var isLevelOverworld;

// Create empty holes array, every hole will have their object with the hole start and end
var worldHolesCoords = [];

var emptyBlocksList = [];

var player;
var playerController;
var playerState = 0;
var playerInvulnerable = false;
var playerBlocked = false;
var playerFiring = false;
var fireInCooldown = false;
var furthestPlayerPos = 0;

var flagRaised = false;

var controlKeys = {
    JUMP: null,
    DOWN: null,
    LEFT: null,
    RIGHT: null,
    FIRE: null,
    PAUSE: null,
    C: null
};

var score = 0;
var timeLeft = window.GameConstants.TimeLimit;

var levelStarted = false;
var reachedLevelEnd = false;

var smoothedControls;
var gameOver = false;
var gameWinned = false;

var skyColors = window.GameConstants.Colors.SkyColors;
var currentSkyColorIndex = 0;
var skyBackgrounds = [];

var game = new Phaser.Game(config);

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Source: https://github.com/photonstorm/phaser3-examples/blob/master/public/src/tilemap/collision/matter%20destroy%20tile%20bodies.js#L35

var SmoothedHorionztalControl = new Phaser.Class({

    initialize:

        function SmoothedHorionztalControl(speed) {
            this.msSpeed = speed;
            this.value = 0;
        },

    moveLeft: function (delta) {
        if (this.value > 0) { this.reset(); }
        this.value -= this.msSpeed * 3.5;
        if (this.value < -1) { this.value = -1; }
        playerController.time.rightDown += delta;
    },

    moveRight: function (delta) {
        if (this.value < 0) { this.reset(); }
        this.value += this.msSpeed * 3.5;
        if (this.value > 1) { this.value = 1; }
        playerController.time.leftDown += delta;
    },

    reset: function () {
        this.value = 0;
    }
});

// --- PRELOAD ---
function preload() {

    var progressBox = this.add.graphics();
    var progressBar = this.add.graphics();
    progressBox.fillStyle(0x222222, 1);
    progressBox.fillRoundedRect(screenWidth / 2.48, screenHeight / 2 * 1.05, screenWidth / 5.3, screenHeight / 20.7, 10);

    var width = this.cameras.main.width;
    var height = this.cameras.main.height;

    var percentText = this.make.text({
        x: width / 2,
        y: height / 2 * 1.25,
        text: '0%',
        style: {
            font: screenWidth / 96 + 'px pixel_nums',
            fill: '#ffffff'
        }
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', function (value) {
        percentText.setText(value * 99 >= 99 ? 'Generating world...' : 'Loading... ' + parseInt(value * 99) + '%');
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRoundedRect(screenWidth / 2.45, screenHeight / 2 * 1.07, screenWidth / 5.6 * value, screenHeight / 34.5, 5);
    });

    this.load.on('complete', function () {
        progressBar.destroy();
        progressBox.destroy();
        percentText.destroy();
        loadingGif.forEach(gif => { gif.style.display = 'none'; });
    });

    // Load Fonts
    this.load.bitmapFont('carrier_command', 'assets/fonts/carrier_command.png', 'assets/fonts/carrier_command.xml');

    // Load plugins
    this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);
    this.load.plugin('rexcheckboxplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcheckboxplugin.min.js', true);
    this.load.plugin('rexsliderplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexsliderplugin.min.js', true);
    this.load.plugin('rexkawaseblurpipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexkawaseblurpipelineplugin.min.js', true);

    isLevelOverworld = randomBetween(0, 100) <= 84;

    let levelStyle = isLevelOverworld ? 'overworld' : 'underground';

    // Load entities sprites
    this.load.spritesheet('mario', 'assets/entities/mario.png', { frameWidth: 18, frameHeight: 16 });
    this.load.spritesheet('mario-grown', 'assets/entities/mario-grown.png', { frameWidth: 18, frameHeight: 32 });
    this.load.spritesheet('mario-fire', 'assets/entities/mario-fire.png', { frameWidth: 18, frameHeight: 32 });
    this.load.spritesheet('goomba', 'assets/entities/' + levelStyle + '/goomba.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('koopa', 'assets/entities/koopa.png', { frameWidth: 16, frameHeight: 24 });
    this.load.spritesheet('shell', 'assets/entities/shell.png', { frameWidth: 16, frameHeight: 15 });

    // Load objects sprites
    this.load.spritesheet('fireball', 'assets/entities/fireball.png', { frameWidth: 8, frameHeight: 8 });
    this.load.spritesheet('fireball-explosion', 'assets/entities/fireball-explosion.png', { frameWidth: 16, frameHeight: 16 });

    // Load props
    this.load.image('cloud1', 'assets/scenery/overworld/cloud1.png');
    this.load.image('cloud2', 'assets/scenery/overworld/cloud2.png');
    this.load.image('mountain1', 'assets/scenery/overworld/mountain1.png');
    this.load.image('mountain2', 'assets/scenery/overworld/mountain2.png');
    this.load.image('fence', 'assets/scenery/overworld/fence.png');
    this.load.image('bush1', 'assets/scenery/overworld/bush1.png');
    this.load.image('bush2', 'assets/scenery/overworld/bush2.png');
    this.load.image('castle', 'assets/scenery/castle.png');
    this.load.image('flag-mast', 'assets/scenery/flag-mast.png');
    this.load.image('final-flag', 'assets/scenery/final-flag.png');
    this.load.image('sign', 'assets/scenery/sign.png');

    // Load tubes
    this.load.image('horizontal-tube', 'assets/scenery/horizontal-tube.png');
    this.load.image('horizontal-final-tube', 'assets/scenery/horizontal-final-tube.png');
    this.load.image('vertical-extralarge-tube', 'assets/scenery/vertical-large-tube.png');
    this.load.image('vertical-small-tube', 'assets/scenery/vertical-small-tube.png');
    this.load.image('vertical-medium-tube', 'assets/scenery/vertical-medium-tube.png');
    this.load.image('vertical-large-tube', 'assets/scenery/vertical-large-tube.png');


    // Load HUD images
    this.load.image('gear', 'assets/hud/gear.png');
    this.load.image('settings-bubble', 'assets/hud/settings-bubble.png');

    this.load.spritesheet('npc', 'assets/hud/npc.png', { frameWidth: 16, frameHeight: 24 });

    // Load platform bricks and structures
    this.load.image('floorbricks', 'assets/scenery/' + levelStyle + '/floorbricks.png');
    this.load.image('start-floorbricks', 'assets/scenery/overworld/floorbricks.png');
    this.load.image('block', 'assets/blocks/' + levelStyle + '/block.png');
    this.load.image('block2', 'assets/blocks/underground/block2.png');
    this.load.image('emptyBlock', 'assets/blocks/' + levelStyle + '/emptyBlock.png');
    this.load.image('immovableBlock', 'assets/blocks/' + levelStyle + '/immovableBlock.png');
    this.load.spritesheet('brick-debris', 'assets/blocks/' + levelStyle + '/brick-debris.png', { frameWidth: 8, frameHeight: 8 });
    this.load.spritesheet('mistery-block', 'assets/blocks/' + levelStyle + '/misteryBlock.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('custom-block', 'assets/blocks/overworld/customBlock.png', { frameWidth: 16, frameHeight: 16 });

    // Load collectibles
    this.load.spritesheet('coin', 'assets/collectibles/coin.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('ground-coin', 'assets/collectibles/underground/ground-coin.png', { frameWidth: 10, frameHeight: 14 });
    this.load.spritesheet('fire-flower', 'assets/collectibles/' + levelStyle + '/fire-flower.png', { frameWidth: 16, frameHeight: 16 });
    this.load.image('live-mushroom', 'assets/collectibles/live-mushroom.png');
    this.load.image('super-mushroom', 'assets/collectibles/super-mushroom.png');


    // Load sounds and music
    this.load.audio('music', 'assets/sound/music/overworld/theme.mp3');
    this.load.audio('underground-music', 'assets/sound/music/underground/theme.mp3');
    this.load.audio('hurry-up-music', 'assets/sound/music/' + levelStyle + '/hurry-up-theme.mp3');
    this.load.audio('gameoversong', 'assets/sound/music/gameover.mp3');
    this.load.audio('win', 'assets/sound/music/win.wav');
    this.load.audio('jumpsound', 'assets/sound/effects/jump.mp3');
    this.load.audio('coin', 'assets/sound/effects/coin.mp3');
    this.load.audio('powerup-appears', 'assets/sound/effects/powerup-appears.mp3');
    this.load.audio('consume-powerup', 'assets/sound/effects/consume-powerup.mp3');
    this.load.audio('powerdown', 'assets/sound/effects/powerdown.mp3');
    this.load.audio('goomba-stomp', 'assets/sound/effects/goomba-stomp.wav');
    this.load.audio('flagpole', 'assets/sound/effects/flagpole.mp3');
    this.load.audio('fireball', 'assets/sound/effects/fireball.mp3');
    this.load.audio('kick', 'assets/sound/effects/kick.mp3');
    this.load.audio('time-warning', 'assets/sound/effects/time-warning.mp3');
    this.load.audio('here-we-go', randomBetween(0, 100) < 98 ? 'assets/sound/effects/here-we-go.mp3' : 'assets/sound/effects/cursed-here-we-go.mp3');
    this.load.audio('pauseSound', 'assets/sound/effects/pause.wav');
    this.load.audio('block-bump', 'assets/sound/effects/block-bump.wav');
    this.load.audio('break-block', 'assets/sound/effects/break-block.wav');
}

function initSounds() {
    this.musicGroup = this.add.group();
    this.effectsGroup = this.add.group();

    this.musicTheme = this.sound.add('music', { volume: 0.15 });
    this.musicTheme.play({ loop: -1 });
    this.musicGroup.add(this.musicTheme);

    this.undergroundMusicTheme = this.sound.add('underground-music', { volume: 0.15 });
    this.musicGroup.add(this.undergroundMusicTheme);

    this.hurryMusicTheme = this.sound.add('hurry-up-music', { volume: 0.15 });
    this.musicGroup.add(this.hurryMusicTheme);

    this.gameOverSong = this.sound.add('gameoversong', { volume: 0.3 });
    this.musicGroup.add(this.gameOverSong);

    this.winSound = this.sound.add('win', { volume: 0.3 });
    this.musicGroup.add(this.winSound);

    this.jumpSound = this.sound.add('jumpsound', { volume: 0.10 });
    this.effectsGroup.add(this.jumpSound);

    this.coinSound = this.sound.add('coin', { volume: 0.2 });
    this.effectsGroup.add(this.coinSound);

    this.powerUpAppearsSound = this.sound.add('powerup-appears', { volume: 0.2 });
    this.effectsGroup.add(this.powerUpAppearsSound);

    this.consumePowerUpSound = this.sound.add('consume-powerup', { volume: 0.2 });
    this.effectsGroup.add(this.consumePowerUpSound);

    this.powerDownSound = this.sound.add('powerdown', { volume: 0.3 });
    this.effectsGroup.add(this.powerDownSound);

    this.goombaStompSound = this.sound.add('goomba-stomp', { volume: 1 });
    this.effectsGroup.add(this.goombaStompSound);

    this.flagPoleSound = this.sound.add('flagpole', { volume: 0.3 });
    this.effectsGroup.add(this.flagPoleSound);

    this.fireballSound = this.sound.add('fireball', { volume: 0.3 });
    this.effectsGroup.add(this.fireballSound);

    this.kickSound = this.sound.add('kick', { volume: 0.3 });
    this.effectsGroup.add(this.kickSound);

    this.timeWarningSound = this.sound.add('time-warning', { volume: 0.2 });
    this.effectsGroup.add(this.timeWarningSound);

    this.hereWeGoSound = this.sound.add('here-we-go', { volume: 0.17 });
    this.effectsGroup.add(this.hereWeGoSound);

    this.pauseSound = this.sound.add('pauseSound', { volume: 0.17 });
    this.effectsGroup.add(this.pauseSound);

    this.blockBumpSound = this.sound.add('block-bump', { volume: 0.3 });
    this.effectsGroup.add(this.blockBumpSound);

    this.breakBlockSound = this.sound.add('break-block', { volume: 0.5 });
    this.effectsGroup.add(this.breakBlockSound);
}

// --- CREATE ---
function create() {
    playerController = {
        time: {
            leftDown: 0,
            rightDown: 0
        },
        direction: {
            positive: true
        },
        speed: {
            run: velocityX,
        }
    };

    skyBackgrounds = []; // Reset sky backgrounds array

    this.physics.world.setBounds(0, 0, worldWidth, screenHeight);

    // Create camera
    this.cameras.main.setBounds(0, 0, worldWidth, screenHeight);
    this.cameras.main.isFollowing = false;
    //this.cameras.main.followOffset.set(startOffset / 6, 0);

    initSounds.call(this);

    createAnimations.call(this);
    createPlayer.call(this);
    generateLevel.call(this);
    drawWorld.call(this);
    drawStartScreen.call(this);
    createGoombas.call(this);
    createControls.call(this);
    applySettings.call(this);

    smoothedControls = new SmoothedHorionztalControl(0.001);

    console.assert(player, 'Player not initialized');
    console.assert(this.platformGroup, 'Platform group not initialized');
}

function createControls() {
    console.log('DEBUG: createControls started');

    this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
        x: screenWidth * 0.118,
        y: screenHeight / 1.68,
        radius: mobileDevice ? 100 : 0,
        base: this.add.circle(0, 0, mobileDevice ? 75 : 0, 0x0000000, 0.05),
        thumb: this.add.circle(0, 0, mobileDevice ? 25 : 0, 0xcccccc, 0.2),
        // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
        // forceMin: 16,
        // enable: true
    });

    // Set control keys

    const keyNames = ['JUMP', 'DOWN', 'LEFT', 'RIGHT', 'FIRE', 'PAUSE', 'C'];
    const defaultCodes = [
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.S,
        Phaser.Input.Keyboard.KeyCodes.A,
        Phaser.Input.Keyboard.KeyCodes.D,
        Phaser.Input.Keyboard.KeyCodes.Q,
        Phaser.Input.Keyboard.KeyCodes.ESC,
        Phaser.Input.Keyboard.KeyCodes.C
    ];

    keyNames.forEach((keyName, i) => {
        const keyCode = localStorage.getItem(keyName) ? Number(localStorage.getItem(keyName)) : defaultCodes[i];
        controlKeys[keyName] = this.input.keyboard.addKey(keyCode);
    });

    // Attach listener to the C key we just created in controlKeys
    if (controlKeys.C) {
        controlKeys.C.on('down', () => {
            console.log('C key pressed (via controlKeys.C)');
            cycleSkyColor();
        });
    } else {
        console.error('DEBUG: controlKeys.C is undefined!');
    }

    /*
    controlKeys.PAUSE.on('down', function () {
        if (!this.settingsMenuOpen)
            showSettings.call(this);
        else
            hideSettings.call(this);
    });*/
}



function startLevel(player, trigger) {

    if (!player.body.blocked.right && !trigger.body.blocked.left)
        return;

    this.powerDownSound.play();

    this.physics.world.setBounds(screenWidth, 0, worldWidth, screenHeight);

    applyPlayerInvulnerability.call(this, 4000);

    playerBlocked = true;

    player.setVelocityX(5);
    player.anims.play('run', true).flipX = false;

    this.cameras.main.fadeOut(900, 0, 0, 0);

    this.hereWeGoSound.play();

    setTimeout(() => {
        if (!isLevelOverworld) {
            player.y = screenHeight / 5;
            this.musicTheme.stop();
            this.undergroundMusicTheme.play({ loop: -1 });
        }

        player.x = screenWidth * 1.1;
        this.cameras.main.pan(screenWidth * 1.5, 0, 0);
        playerBlocked = false;
        this.cameras.main.fadeIn(500, 0, 0, 0);
        createHUD.call(this);
        updateTimer.call(this);
        this.startScreenTrigger.destroy();
        levelStarted = true;
        if (this.settingsMenuOpen) hideSettings.call(this);
    }, 1100);
}


function teleportToLevelEnd(player, trigger) {

    if (!player.body.blocked.right && !trigger.body.blocked.left)
        return;

    playerBlocked = true;

    this.cameras.main.stopFollow();

    this.powerDownSound.play();

    this.tweens.add({
        targets: player,
        duration: 75,
        alpha: 0
    });

    this.cameras.main.fadeOut(450, 0, 0, 0);

    player.anims.play(playerState > 0 ? playerState == 1 ? 'grown-mario-run' : 'fire-mario-run' : 'run', true).flipX = false;

    this.undergroundRoof.destroy();

    setTimeout(() => {
        this.physics.world.setBounds(worldWidth - screenWidth, 0, worldWidth, screenHeight);
        this.tpTube = this.add.tileSprite(worldWidth - screenWidth / 1.089, screenHeight - platformHeight, 32, 32, 'vertical-medium-tube').setScale(screenHeight / 345).setOrigin(1);
        this.tpTube.depth = 4;
        this.physics.add.existing(this.tpTube);
        this.tpTube.body.allowGravity = false;
        this.tpTube.body.immovable = true;
        this.physics.add.collider(player, this.tpTube);
        let endSky = this.add.rectangle(worldWidth - screenWidth, 0, worldWidth, screenHeight, skyColors[currentSkyColorIndex]).setOrigin(0);
        endSky.depth = -1;
        skyBackgrounds.push(endSky);
        this.add.tileSprite(worldWidth - screenWidth, screenHeight, screenWidth, platformHeight, 'start-floorbricks').setScale(2).setOrigin(0, 0.5).depth = 2;
    }, 500);

    setTimeout(() => {
        player.alpha = 1;
        player.x = worldWidth - screenWidth / 1.08;
        this.cameras.main.pan(worldWidth - screenWidth / 2, 0, 0);
        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.powerDownSound.play();
        this.finalTrigger.destroy();
        this.tweens.add({
            targets: player,
            duration: 500,
            y: this.tpTube.getBounds().y
        });
        setTimeout(() => {
            playerBlocked = false;
        }, 500);
    }, 1100);
}

function drawStartScreen() {

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;

    // Draw sky
    let startSky = this.add.rectangle(0, 0, screenWidth, screenHeight, skyColors[currentSkyColorIndex]).setOrigin(0);
    startSky.depth = -1;
    skyBackgrounds.push(startSky);

    let platform = this.add.tileSprite(0, screenHeight, screenWidth / 2, platformHeight, 'start-floorbricks').setScale(2).setOrigin(0, 0.5);
    this.physics.add.existing(platform);
    platform.body.immovable = true;
    platform.body.allowGravity = false;
    // Apply player collision with platform
    this.physics.add.collider(player, platform);

    /*
    this.add.text(screenWidth / 2, screenHeight - (screenHeight* 0.9), 
    "Known bugs: \n. Mobile controls are (at least) not nice",
    { fontFamily: 'pixel_nums', fontSize: (screenWidth / 115), align: 'left'}).setLineSpacing(screenHeight / 34.5);
    */

    this.add.image(screenWidth / 50, screenHeight / 3, 'cloud1').setScale(screenHeight / 1725);
    this.add.image(screenWidth / 1.25, screenHeight / 2, 'cloud1').setScale(screenHeight / 1725);
    this.add.image(screenWidth / 1.05, screenHeight / 6.5, 'cloud2').setScale(screenHeight / 1725);
    this.add.image(screenWidth / 3, screenHeight / 3.5, 'cloud2').setScale(screenHeight / 1725);
    this.add.image(screenWidth / 2.65, screenHeight / 2.8, 'cloud2').setScale(screenHeight / 1725);

    this.add.image(screenWidth / 50, screenHeight / 3, 'cloud1').setScale(screenHeight / 1725);

    this.add.image(screenWidth / 25, screenHeight / 10, 'sign').setOrigin(0).setScale(screenHeight / 350);

    let propsY = screenHeight - platformHeight;

    this.add.image(screenWidth / 50, propsY, 'mountain2').setOrigin(0, 1).setScale(screenHeight / 517);
    this.add.image(screenWidth / 300, propsY, 'mountain1').setOrigin(0, 1).setScale(screenHeight / 517);

    this.add.image(screenWidth / 4, propsY, 'bush1').setOrigin(0, 1).setScale(screenHeight / 609);
    this.add.image(screenWidth / 1.55, propsY, 'bush2').setOrigin(0, 1).setScale(screenHeight / 609);
    this.add.image(screenWidth / 1.5, propsY, 'bush2').setOrigin(0, 1).setScale(screenHeight / 609);


    this.add.tileSprite(screenWidth / 15, propsY, 350, 35, 'fence').setOrigin(0, 1).setScale(screenHeight / 863);

    this.customBlock = this.add.sprite(screenCenterX, screenHeight - (platformHeight * 1.9), 'custom-block').setScale(screenHeight / 345);
    this.customBlock.anims.play('custom-block-default')
    this.physics.add.collider(player, this.customBlock, function () {
        if (player.body.blocked.up) showSettings.call(this);
    }, null, this);
    this.physics.add.existing(this.customBlock);
    this.customBlock.body.allowGravity = false;
    this.customBlock.body.immovable = true;

    this.add.image(screenCenterX, screenHeight - (platformHeight * 1.9), 'gear').setScale(screenHeight / 13000).setInteractive().on('pointerdown', () => showSettings.call(this));

    this.add.image(screenCenterX * 1.12, screenHeight - (platformHeight * 1.5), 'settings-bubble').setScale(screenHeight / 620);

    this.add.sprite(screenCenterX * 1.07, screenHeight - platformHeight, 'npc').setOrigin(0.5, 1).setScale(screenHeight / 365).anims.play('npc-default', true);
}

function raiseFlag() {
    if (flagRaised) {
        return false;
    }

    this.cameras.main.stopFollow();

    this.timeLeftText.stopped = true;

    this.musicTheme.stop();
    this.undergroundMusicTheme.stop();
    this.hurryMusicTheme.stop();
    this.flagPoleSound.play();

    this.tweens.add({
        targets: this.finalFlag,
        duration: 1000,
        y: screenHeight / 2.2
    });

    setTimeout(() => {
        this.winSound.play();
    }, 1000);

    flagRaised = true;
    playerBlocked = true;

    addToScore.call(this, 2000, player);

    return false;
}

function consumeMushroom(player, mushroom) {
    if (gameOver || gameWinned) return;

    this.consumePowerUpSound.play();
    addToScore.call(this, 1000, mushroom);
    mushroom.destroy();

    if (playerState > 0)
        return;

    playerBlocked = true;
    this.anims.pauseAll();
    this.physics.pause();
    player.setTint(0xfefefe).anims.play('grown-mario-idle');
    let i = 0;
    let interval = setInterval(() => {
        i++;
        player.anims.play(i % 2 === 0 ? 'grown-mario-idle' : 'idle');
        if (i > 5) {
            clearInterval(interval);
            player.clearTint();
        }
    }, 100);

    setTimeout(() => {
        this.physics.resume();
        this.anims.resumeAll();
        playerBlocked = false;
        playerState = 1;
        updateTimer.call(this);
    }, 1000);
    //player.body.setSize(16, 32).setOffset(1,0);
}

function consumeFireflower(player, fireFlower) {
    if (gameOver || gameWinned) return;

    this.consumePowerUpSound.play();
    addToScore.call(this, 1000, fireFlower);
    fireFlower.destroy();

    if (playerState > 1)
        return;

    let anim = playerState > 0 ? 'grown-mario-idle' : 'idle';

    playerBlocked = true;
    this.anims.pauseAll();
    this.physics.pause();

    player.setTint(0xfefefe).anims.play('fire-mario-idle');
    let i = 0;
    let interval = setInterval(() => {
        i++;
        player.anims.play(i % 2 === 0 ? 'fire-mario-idle' : anim);
        if (i > 5) {
            clearInterval(interval);
            player.clearTint();
        }
    }, 100);

    setTimeout(() => {
        this.physics.resume();
        this.anims.resumeAll();
        playerBlocked = false;
        playerState = 2;
        updateTimer.call(this);
    }, 1000);
    //player.body.setSize(16, 32).setOffset(1,0);
}

function collectCoin(player, coin) {
    this.coinSound.play();
    addToScore.call(this, 200);
    coin.destroy();
}

// --- UPDATE ---
function update(delta) {
    console.assert(player, 'Player missing in update');
    console.assert(this.platformGroup, 'Platform group missing in update');
    if (gameOver || gameWinned) return;

    updatePlayer.call(this, delta);

    const playerVelocityX = player.body.velocity.x;
    const camera = this.cameras.main;

    if (playerVelocityX > 0 && levelStarted && !reachedLevelEnd && !camera.isFollowing &&
        player.x >= screenWidth * 1.5 && player.x >= (camera.worldView.x + camera.width / 2)) {
        camera.startFollow(player, true, 0.1, 0.05);
        camera.isFollowing = true;
    }

    if (playerVelocityX < 0 && furthestPlayerPos < player.x && levelStarted && !reachedLevelEnd && camera.isFollowing) {
        furthestPlayerPos = player.x;
        const worldBounds = this.physics.world.setBounds(camera.worldView.x, 0, worldWidth, screenHeight);
        camera.setBounds(camera.worldView.x, 0, worldWidth, screenHeight);
        camera.stopFollow();
        camera.isFollowing = false;
    }

    if (!reachedLevelEnd && !isLevelOverworld && camera.isFollowing && player.x >= worldWidth - screenWidth * 1.5) {
        reachedLevelEnd = true;
        camera.stopFollow();
    }
}
