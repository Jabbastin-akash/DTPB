// ===== Player.js =====
// Main character logic with WASD + arrow controls and collision

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, options = {}) {
        const selectedKey = options.textureKey || gameState?.playerTextureKey;
        const textureKey = selectedKey || (gameState.playerGender === 'female' ? 'player_female' : 'player_male');
        super(scene, x, y, textureKey);

        this.scene = scene;
        this.spriteKey = textureKey;
        
        // Add to scene and physics
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        // Pull defaults from centralized config (if present)
        const cfg = (typeof getCharacterConfig === 'function') ? getCharacterConfig(this.spriteKey) : null;

        // Global visual scale for player (default: gameState.characterScale)
        const characterScale = gameState?.characterScale ?? 1;
        const baseScale = (typeof options.scale === 'number') ? options.scale : characterScale;
        const scaleToUse = baseScale * (cfg?.scaleMultiplier ?? 1);
        if (scaleToUse !== 1) {
            this.setScale(scaleToUse);
        }

        // Adjust hitbox to just cover the legs for top-down feel.
        // Allow per-sprite tuning because imported sheets can have different padding.
        const hitbox = options.hitbox || cfg?.hitbox || (this.spriteKey === 'player_male'
            ? { w: 18, h: 14, offsetYFromBottom: 1 }
            : { w: 16, h: 12, offsetYFromBottom: 1 });

        const bodyW = hitbox.w;
        const bodyH = hitbox.h;
        // Use unscaled frame size for offsets so scaling doesn't skew the body placement.
        const frameW = (this.frame?.realWidth ?? this.width ?? 32);
        const frameH = (this.frame?.realHeight ?? this.height ?? 32);

        this.body.setSize(bodyW, bodyH);
        this.body.setOffset(
            Math.floor((frameW - bodyW) / 2),
            Math.floor(frameH - bodyH - (hitbox.offsetYFromBottom ?? 0))
        );
        this.body.setCollideWorldBounds(true);

        // Movement keys
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.keys = this.scene.input.keyboard.addKeys({
            w: Phaser.Input.Keyboard.KeyCodes.W,
            a: Phaser.Input.Keyboard.KeyCodes.A,
            s: Phaser.Input.Keyboard.KeyCodes.S,
            d: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            e: Phaser.Input.Keyboard.KeyCodes.E
        });
        this.speed = options.speed ?? (cfg?.speed ?? 220);
        this.facing = 'down';
        
        // Interact key debounce
        this.lastInteract = 0;
    }

    update() {
        // Stop moving by default
        this.body.setVelocity(0);

        // Don't move if UI is active (movement locked by scene)
        if (this.scene.movementEnabled === false) {
            this.anims.play(`${this.spriteKey}_idle_${this.facing}`, true);
            return;
        }

        let isMoving = false;

        // X movement
        let vx = 0;
        if (this.cursors.left.isDown || this.keys.a.isDown) {
            vx = -this.speed;
            this.facing = 'left';
            isMoving = true;
        } else if (this.cursors.right.isDown || this.keys.d.isDown) {
            vx = this.speed;
            this.facing = 'right';
            isMoving = true;
        }

        // Y movement
        let vy = 0;
        if (this.cursors.up.isDown || this.keys.w.isDown) {
            vy = -this.speed;
            if (!isMoving) this.facing = 'up'; // Prefer Y face if pure Y
            isMoving = true;
        } else if (this.cursors.down.isDown || this.keys.s.isDown) {
            vy = this.speed;
            if (!isMoving) this.facing = 'down';
            isMoving = true;
        }

        // Normalize speed for diagonals
        if (vx !== 0 && vy !== 0) {
            vx *= 0.7071;
            vy *= 0.7071;
        }
        this.body.setVelocity(vx, vy);

        // Play anims
        if (isMoving) {
            if (this.texture.key === 'ironman') {
                this.anims.play('ironman_walk', true);
            } else {
                this.anims.play(`_`, true);
            }
        } else {
            if (this.texture.key === 'ironman') {
                this.anims.stop();
                this.setFrame(5);
            } else {
                this.anims.play(`_idle_`, true);
            }
        }

        // Interaction processing
        const time = this.scene.time.now;
        if ((Phaser.Input.Keyboard.JustDown(this.keys.space) || Phaser.Input.Keyboard.JustDown(this.keys.e)) && time > this.lastInteract + 500) {
            this.lastInteract = time;
            this.scene.events.emit('player:interact', this);
        }

        // Depth sort based on Y
        this.setDepth(this.y + (this.displayHeight || this.height));
    }
}
