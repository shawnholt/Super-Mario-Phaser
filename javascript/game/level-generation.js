function generateRandomCoordinate(entitie = false, ground = true) {
    // 1. Calculate the range where the object can spawn
    const startPos = entitie ? screenWidth * 1.5 : screenWidth;
    const endPos = entitie ? worldWidth - screenWidth * 3 : worldWidth;

    // 2. Pick a random X coordinate within that range
    let coordinate = randomBetween(startPos, endPos);

    // 3. If the object doesn't need ground (like a cloud), return the coordinate immediately
    if (!ground) return coordinate;

    // 4. If it needs ground, check if the coordinate falls inside a hole
    for (let hole of worldHolesCoords) {
        // If the coordinate is inside a hole (with some buffer space)
        if (coordinate >= hole.start - platformPiecesWidth * 1.5 && coordinate <= hole.end) {
            // Recursively try again to find a safe spot
            return generateRandomCoordinate.call(this, entitie, ground);
        }
    }

    // 5. Return the safe coordinate
    return coordinate;
}

function drawWorld() {
    // Drawing scenery props

    //> Drawing the Sky
    drawSky.call(this);

    let propsY = screenHeight - platformHeight;

    if (isLevelOverworld) {
        spawnClouds.call(this);
        spawnMountains.call(this, propsY);
        spawnBushes.call(this, propsY);
        spawnFences.call(this, propsY);
    }

    //> Final flag and Castle
    spawnFinalFlag.call(this, propsY);
    spawnCastle.call(this, propsY);
}

function drawSky() {
    let sky = this.add.rectangle(screenWidth, 0, worldWidth, screenHeight, isLevelOverworld ? skyColors[currentSkyColorIndex] : 0x000000).setOrigin(0);
    sky.depth = -1;
    if (isLevelOverworld) {
        skyBackgrounds.push(sky);
    }
}

function cycleSkyColor() {
    console.log('Cycling sky color. Current index:', currentSkyColorIndex);
    currentSkyColorIndex = (currentSkyColorIndex + 1) % skyColors.length;
    let newColor = skyColors[currentSkyColorIndex];
    console.log('New color:', newColor.toString(16));
    console.log('Sky backgrounds to update:', skyBackgrounds.length);

    skyBackgrounds.forEach(sky => {
        sky.setFillStyle(newColor);
    });
}

function spawnClouds() {
    const density = window.GameConstants.Densities.Cloud;
    const minClouds = Math.trunc(worldWidth / density.min);
    const maxClouds = Math.trunc(worldWidth / density.max);

    for (let i = 0; i < randomBetween(minClouds, maxClouds); i++) {
        let cloudX = generateRandomCoordinate(false, false);
        let cloudY = randomBetween(screenHeight / 80, screenHeight / 2.2);
        if (randomBetween(0, 10) < 5) {
            this.add.image(cloudX, cloudY, 'cloud1').setOrigin(0).setScale(screenHeight / 1725);
        } else {
            this.add.image(cloudX, cloudY, 'cloud2').setOrigin(0).setScale(screenHeight / 1725);
        }
    }
}

function spawnMountains(propsY) {
    const density = window.GameConstants.Densities.Mountain;
    const minMountains = Math.trunc(worldWidth / density.min);
    const maxMountains = Math.trunc(worldWidth / density.max);

    for (let i = 0; i < randomBetween(minMountains, maxMountains); i++) {
        let mountainX = generateRandomCoordinate();

        if (randomBetween(0, 10) < 5) {
            this.add.image(mountainX, propsY, 'mountain1').setOrigin(0, 1).setScale(screenHeight / 517);
        } else {
            this.add.image(mountainX, propsY, 'mountain2').setOrigin(0, 1).setScale(screenHeight / 517);
        }
    }
}

function spawnBushes(propsY) {
    const density = window.GameConstants.Densities.Bush;
    const minBushes = Math.trunc(worldWidth / density.min);
    const maxBushes = Math.trunc(worldWidth / density.max);

    for (let i = 0; i < randomBetween(minBushes, maxBushes); i++) {
        let bushX = generateRandomCoordinate();

        if (randomBetween(0, 10) < 5) {
            this.add.image(bushX, propsY, 'bush1').setOrigin(0, 1).setScale(screenHeight / 609);
        } else {
            this.add.image(bushX, propsY, 'bush2').setOrigin(0, 1).setScale(screenHeight / 609);
        }
    }
}

function spawnFences(propsY) {
    const density = window.GameConstants.Densities.Fence;
    const minFences = Math.trunc(worldWidth / density.min);
    const maxFences = Math.trunc(worldWidth / density.max);

    for (let i = 0; i < randomBetween(minFences, maxFences); i++) {
        let fenceX = generateRandomCoordinate();

        this.add.tileSprite(fenceX, propsY, randomBetween(100, 250), 35, 'fence').setOrigin(0, 1).setScale(screenHeight / 863);
    }
}

function spawnFinalFlag(propsY) {
    this.finalFlagMast = this.add.tileSprite(worldWidth - (worldWidth / 30), propsY, 16, 167, 'flag-mast').setOrigin(0, 1).setScale(screenHeight / 400);
    this.physics.add.existing(this.finalFlagMast);
    this.finalFlagMast.immovable = true;
    this.finalFlagMast.allowGravity = false;
    this.finalFlagMast.body.setSize(3, 167);
    this.physics.add.overlap(player, this.finalFlagMast, null, raiseFlag, this);
    this.physics.add.collider(this.platformGroup.getChildren(), this.finalFlagMast);

    this.finalFlag = this.add.image(worldWidth - (worldWidth / 30), propsY * 0.93, 'final-flag').setOrigin(0.5, 1);
    this.finalFlag.setScale(screenHeight / 400);
}

function spawnCastle(propsY) {
    this.add.image(worldWidth - (worldWidth / 75), propsY, 'castle').setOrigin(0.5, 1).setScale(screenHeight / 300);
}

function generateLevel() {
    //> Creating the platform

    // pieceStart will be the next platform piece start pos. This value will be modified after each execution
    let pieceStart = screenWidth;
    // This will tell us if last generated piece of platform was empty, to avoid generating another empty piece next to it.
    let lastWasHole = 0;
    // Structures will generate every 2/3 platform pieces
    let lastWasStructure = 0;

    this.platformGroup = this.add.group();
    this.fallProtectionGroup = this.add.group();
    this.blocksGroup = this.add.group();
    this.constructionBlocksGroup = this.add.group();
    this.misteryBlocksGroup = this.add.group();
    this.immovableBlocksGroup = this.add.group();
    this.groundCoinsGroup = this.add.group();

    if (!isLevelOverworld) {
        //this.blocksGroup.add(this.add.tileSprite(worldWidth - screenWidth, screenHeight - (platformHeight * 4.5), screenWidth * 2.9, 16, 'block').setScale(screenHeight / 345).setOrigin(1, 0));
        this.blocksGroup.add(this.add.tileSprite(screenWidth, screenHeight - platformHeight / 1.2, 16, screenHeight - platformHeight, 'block2').setScale(screenHeight / 345).setOrigin(0, 1));
        this.undergroundRoof = this.add.tileSprite(screenWidth * 1.2, screenHeight / 13, worldWidth / 2.68, 16, 'block2').setScale(screenHeight / 345).setOrigin(0);
        this.blocksGroup.add(this.undergroundRoof);
    }

    // Loop through the number of platform pieces to generate the level
    for (let platformIndex = 0; platformIndex <= platformPieces; platformIndex++) {
        // Holes will have a 10% chance of spawning
        let number = randomBetween(0, 100);

        // Check if its not a hole, this means is not that 20%, is not in the spawn safe area and is not close to the end castle.
        if (pieceStart >= (lastWasHole > 0 || lastWasStructure > 0 || worldWidth - platformPiecesWidth * 4) || number <= 0 || pieceStart <= screenWidth * 2 || pieceStart >= worldWidth - screenWidth * 2) {
            lastWasHole--;

            //> Create platform
            let newPlatformPiece = this.add.tileSprite(pieceStart, screenHeight, platformPiecesWidth, platformHeight, 'floorbricks').setScale(2).setOrigin(0, 0.5);
            this.physics.add.existing(newPlatformPiece);
            newPlatformPiece.body.immovable = true;
            newPlatformPiece.body.allowGravity = false;
            newPlatformPiece.isPlatform = true;
            newPlatformPiece.depth = 2;
            this.platformGroup.add(newPlatformPiece);
            // Apply player collision with platform
            this.physics.add.collider(player, newPlatformPiece);

            //> Creating world structures

            // If it's a valid spot for a structure (not near start/end, not after a hole/structure)
            if (!(pieceStart >= (worldWidth - screenWidth * (isLevelOverworld ? 1 : 1.5))) && pieceStart > (screenWidth + platformPiecesWidth * 2) && lastWasHole < 1 && lastWasStructure < 1) {
                lastWasStructure = generateStructure.call(this, pieceStart);
            }
            else {
                lastWasStructure--;
            }
        } else {
            // Save every hole start and end for later use
            worldHolesCoords.push({
                start: pieceStart,
                end: pieceStart + platformPiecesWidth * 2
            });

            lastWasHole = 2;
            this.fallProtectionGroup.add(this.add.rectangle(pieceStart + platformPiecesWidth * 2, screenHeight - platformHeight, 5, 5).setOrigin(0, 1));
            this.fallProtectionGroup.add(this.add.rectangle(pieceStart, screenHeight - platformHeight, 5, 5).setOrigin(1, 1));
        }
        pieceStart += platformPiecesWidth * 2;
    }

    this.startScreenTrigger = this.add.tileSprite(screenWidth, screenHeight - platformHeight, 32, 28, 'horizontal-tube').setScale(screenHeight / 345).setOrigin(1, 1);
    this.startScreenTrigger.depth = 4;
    this.physics.add.existing(this.startScreenTrigger);
    this.startScreenTrigger.body.allowGravity = false;
    this.startScreenTrigger.body.immovable = true;
    this.physics.add.collider(player, this.startScreenTrigger, startLevel, null, this);

    let invisibleWall2 = this.add.rectangle(screenWidth, screenHeight - platformHeight, 1, screenHeight).setOrigin(0.5, 1);
    this.physics.add.existing(invisibleWall2);
    invisibleWall2.body.allowGravity = false;
    invisibleWall2.body.immovable = true;
    this.physics.add.collider(player, invisibleWall2);
    this.fallProtectionGroup.add(invisibleWall2);

    if (!isLevelOverworld) {
        this.verticalTube = this.add.tileSprite(worldWidth - screenWidth, screenHeight - platformHeight, 32, screenHeight, 'vertical-extralarge-tube').setScale(screenHeight / 345).setOrigin(1, 1);
        this.verticalTube.depth = 2;
        this.physics.add.existing(this.verticalTube);
        this.verticalTube.body.allowGravity = false;
        this.verticalTube.body.immovable = true;
        this.physics.add.collider(player, this.verticalTube);

        this.finalTrigger = this.add.tileSprite(worldWidth - screenWidth * 1.03, screenHeight - platformHeight, 40, 31, 'horizontal-final-tube').setScale(screenHeight / 345).setOrigin(1, 1);
        this.finalTrigger.depth = 2;
        this.physics.add.existing(this.finalTrigger);
        this.finalTrigger.body.allowGravity = false;
        this.finalTrigger.body.immovable = true;
        this.physics.add.collider(player, this.finalTrigger, teleportToLevelEnd, null, this);

        let invisibleWall1 = this.add.rectangle(worldWidth - screenWidth, screenHeight - platformHeight, 1, screenHeight).setOrigin(0.5, 1);
        this.physics.add.existing(invisibleWall1);
        invisibleWall1.body.allowGravity = false;
        invisibleWall1.body.immovable = true;
        this.physics.add.collider(player, invisibleWall1);
        this.fallProtectionGroup.add(invisibleWall1);
    }

    let fallProtections = this.fallProtectionGroup.getChildren();
    for (let i = 0; i < fallProtections.length; i++) {
        this.physics.add.existing(fallProtections[i]);
        fallProtections[i].body.allowGravity = false;
        fallProtections[i].body.immovable = true;
    }

    // Stablish properties for every generated structure
    let misteryBlocks = this.misteryBlocksGroup.getChildren();
    for (let i = 0; i < misteryBlocks.length; i++) {
        this.physics.add.existing(misteryBlocks[i]);
        misteryBlocks[i].body.allowGravity = false;
        misteryBlocks[i].body.immovable = true;
        misteryBlocks[i].depth = 2;
        misteryBlocks[i].anims.play('mistery-block-default', true);
        this.physics.add.collider(player, misteryBlocks[i], revealHiddenBlock, null, this);
    }

    // Apply player collision with blocks
    let blocks = this.blocksGroup.getChildren();
    for (let i = 0; i < blocks.length; i++) {
        this.physics.add.existing(blocks[i]);
        blocks[i].body.allowGravity = false;
        blocks[i].body.immovable = true;
        blocks[i].depth = 2;
        this.physics.add.collider(player, blocks[i], destroyBlock, null, this);
    }

    // Apply player collision with immovable blocks
    let constructionBlocks = this.constructionBlocksGroup.getChildren();
    for (let i = 0; i < constructionBlocks.length; i++) {
        this.physics.add.existing(constructionBlocks[i]);
        constructionBlocks[i].isImmovable = true;
        constructionBlocks[i].body.allowGravity = false;
        constructionBlocks[i].body.immovable = true;
        constructionBlocks[i].depth = 2;
        this.physics.add.collider(player, constructionBlocks[i], destroyBlock, null, this);
    }

    // Apply player collision with immovable blocks
    let immovableBlocks = this.immovableBlocksGroup.getChildren();
    for (let i = 0; i < immovableBlocks.length; i++) {
        this.physics.add.existing(immovableBlocks[i]);
        immovableBlocks[i].body.allowGravity = false;
        immovableBlocks[i].body.immovable = true;
        immovableBlocks[i].depth = 2;
        this.physics.add.collider(player, immovableBlocks[i]);
    }

    let groundCoins = this.groundCoinsGroup.getChildren();
    for (let i = 0; i < groundCoins.length; i++) {
        this.physics.add.existing(groundCoins[i]);
        groundCoins[i].anims.play('ground-coin-default', true);
        groundCoins[i].body.allowGravity = false;
        groundCoins[i].body.immovable = true;
        groundCoins[i].depth = 2;
        this.physics.add.overlap(player, groundCoins[i], collectCoin, null, this);
    }
}
