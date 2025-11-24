window.AgentHelpers = {
    /**
     * Returns a snapshot of the current game state.
     */
    getGameState: function () {
        // Ensure critical globals exist
        if (typeof window.player === 'undefined' || !window.player) {
            return { error: 'Player not initialized' };
        }

        return {
            player: {
                x: window.player.x,
                y: window.player.y,
                velocityX: window.player.body ? window.player.body.velocity.x : 0,
                velocityY: window.player.body ? window.player.body.velocity.y : 0,
                state: window.playerState, // 0: small, 1: grown, 2: fire
                isGrounded: window.player.body ? window.player.body.blocked.down : false,
                isBlocked: {
                    left: window.player.body ? window.player.body.blocked.left : false,
                    right: window.player.body ? window.player.body.blocked.right : false,
                    up: window.player.body ? window.player.body.blocked.up : false,
                    down: window.player.body ? window.player.body.blocked.down : false
                }
            },
            world: {
                timeLeft: window.timeLeft,
                score: window.score,
                levelStarted: window.levelStarted,
                gameOver: window.gameOver,
                gameWon: window.gameWinned, // Note: variable name is gameWinned in game.js
                cameraX: window.game.scene.scenes[0].cameras.main.scrollX,
                holes: window.worldHolesCoords
            }
        };
    },

    /**
     * Simulates a key press for a specified duration.
     * @param {Object} options - { key, code, durationMs }
     */
    pressKey: function (scene, { key, code, durationMs = 150 }) {
        const keyCode = this._getKeyCode(code);
        const eventOptions = {
            key: key,
            code: code,
            keyCode: keyCode,
            bubbles: true,
            cancelable: true,
            view: window
        };

        // Dispatch keydown
        window.dispatchEvent(new KeyboardEvent('keydown', eventOptions));

        // Schedule keyup
        if (scene && scene.time) {
            scene.time.addEvent({
                delay: durationMs,
                callback: () => {
                    window.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
                }
            });
        } else {
            console.warn('AgentHelpers.pressKey: Scene not provided, falling back to setTimeout');
            setTimeout(() => {
                window.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
            }, durationMs);
        }
    },

    /**
     * Helper to map code to keyCode (legacy support for Phaser)
     */
    _getKeyCode: function (code) {
        const map = {
            'ArrowLeft': 37,
            'ArrowUp': 38,
            'ArrowRight': 39,
            'ArrowDown': 40,
            'Space': 32,
            'Enter': 13,
            'Escape': 27,
            'KeyA': 65,
            'KeyD': 68,
            'KeyS': 83,
            'KeyW': 87,
            'KeyQ': 81, // Fire
            'KeyC': 67  // Color cycle
        };
        return map[code] || 0;
    }
};

console.log('✅ AgentHelpers API loaded');
