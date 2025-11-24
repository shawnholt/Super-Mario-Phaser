
function throwFireball() {
    this.fireballSound.play();
    player.anims.play('fire-mario-throw');
    playerFiring = true;
    fireInCooldown = true;
    this.time.delayedCall(100, () => {
        playerFiring = false;
    });

    this.time.delayedCall(350, () => {
        fireInCooldown = false;
    });

    let fireball = this.physics.add.sprite(player.getBounds().x + (player.width * 1.15), player.getBounds().y + (player.height / 1.25), 'fireball').setScale(screenHeight / 345);
    fireball.allowGravity = true;
    fireball.dead = false;
    if (playerController.direction.positive) {
        fireball.setVelocityX(velocityX * 1.3);
        fireball.isVelocityPositive = true;
        fireball.anims.play('fireball-right-down');
    } else {
        fireball.setVelocityX(-velocityX * 1.3);
        fireball.isVelocityPositive = false;
        fireball.anims.play('fireball-left-down');
    }
    updateFireballAnimation.call(this, fireball);
    this.physics.add.collider(fireball, this.blocksGroup.getChildren(), fireballBounce, null, this);
    this.physics.add.collider(fireball, this.misteryBlocksGroup.getChildren(), fireballBounce, null, this);
    this.physics.add.collider(fireball, this.platformGroup.getChildren(), fireballBounce, null, this);
    this.physics.add.overlap(fireball, this.goombasGroup.getChildren(), fireballCollides, null, this);
    this.physics.add.collider(fireball, this.immovableBlocksGroup.getChildren(), fireballBounce, null, this);
    this.physics.add.collider(fireball, this.constructionBlocksGroup.getChildren(), fireballBounce, null, this);

    this.time.delayedCall(3000, () => {
        fireball.dead = true;
        this.tweens.add({
            targets: fireball,
            duration: 100,
            alpha: { from: 1, to: 0 },
        });
        this.time.delayedCall(100, () => {
            fireball.destroy();
        });
    });
}

function fireballCollides(fireball, entitie) {
    if (fireball.exploded || fireball.dead)
        return;

    fireball.exploded = true;
    fireball.dead = true;
    fireball.body.moves = false;

    explodeFireball.call(this, fireball);

    this.kickSound.play();

    entitie.anims.play('goomba-idle', true).flipY = true;
    entitie.dead = true;
    this.goombasGroup.remove(entitie);
    entitie.setVelocityX(0);
    entitie.setVelocityY(-velocityY * 0.4);
    this.time.delayedCall(400, () => {
        this.tweens.add({
            targets: entitie,
            duration: 750,
            y: screenHeight * 1.1
        });
    });

    addToScore.call(this, 100, entitie);
    this.time.delayedCall(1250, () => {
        entitie.destroy();
    });
}

function explodeFireball(fireball) {
    fireball.anims.play('fireball-explosion-1', true);

    this.time.delayedCall(50, () => {
        if (fireball && fireball.scene) {
            fireball.anims.play('fireball-explosion-2', true);
        }
    });

    this.time.delayedCall(85, () => {
        if (fireball && fireball.scene) {
            fireball.anims.play('fireball-explosion-3', true);
        }
    });

    this.time.delayedCall(130, () => {
        if (fireball && fireball.scene) {
            fireball.destroy();
        }
    });
}

function updateFireballAnimation(fireball) {

    if (fireball.exploded || fireball.dead)
        return;

    if (fireball.body.velocity.y > 0) {
        if (fireball.isVelocityPositive) {
            fireball.anims.play('fireball-right-up');
        } else {
            fireball.anims.play('fireball-left-up');
        }
    } else {
        if (fireball.isVelocityPositive) {
            fireball.anims.play('fireball-right-down');
        } else {
            fireball.anims.play('fireball-left-down');
        }
    }

    this.time.delayedCall(250, () => {
        updateFireballAnimation.call(this, fireball);
    });
}

function fireballBounce(fireball, collider) {

    if (collider.isPlatform && (fireball.body.blocked.left || fireball.body.blocked.right) || !collider.isPlatform && (fireball.body.blocked.left || fireball.body.blocked.right)) {
        fireball.exploded = true;
        fireball.dead = true;
        fireball.body.moves = false;

        this.blockBumpSound.play();
        explodeFireball.call(this, fireball);
        return;
    }

    if (fireball.body.blocked.down)
        fireball.setVelocityY(-levelGravity / 3.45);

    if (fireball.body.blocked.up)
        fireball.setVelocityY(levelGravity / 3.45);

    if (fireball.body.blocked.left) {
        fireball.isVelocityPositive = false;
        fireball.setVelocityX(velocityX * 1.3);
    }

    if (fireball.body.blocked.right) {
        fireball.isVelocityPositive = true;
        fireball.setVelocityX(-velocityX * 1.3);
    }
}
