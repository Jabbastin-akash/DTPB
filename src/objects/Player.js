// filepath: /Users/user/DTPB/src/objects/Player.js
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

        // Fly mode (Ironman)
        // SPACE is already bound in this.keys for interaction; we keep a dedicated Key object for toggling.
        this.flyKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.isFlying = false;
        this.baseY = null;

        // Debug (temporary): throttle facing logs
        this._lastFacingLogAt = 0;

        // Interact key debounce
        this.lastInteract = 0;
    }

    update() {
        // Toggle fly mode (Ironman only)
        if (this.texture.key === 'ironman' && Phaser.Input.Keyboard.JustDown(this.flyKey)) {
            this.isFlying = !this.isFlying;
        }

        // Don't move if UI is active (movement locked by scene)
        if (this.scene.movementEnabled === false) {
            // Keep hover stable while paused
            if (this.texture.key === 'ironman' && this.isFlying && typeof this.baseY === 'number') {
                this.setY(this.baseY + Math.sin(this.scene.time.now / 200) * 2);
                this.setDepth(100);
            }
            this.anims.play(`${this.spriteKey}_idle_${this.facing}`, true);
            return;
        }

        let isMoving = false;

        // X movement (direction vector)
        let vx = 0;
        if (this.cursors.left.isDown || this.keys.a.isDown) {
            vx = -1;
            this.facing = 'left';
            isMoving = true;
        } else if (this.cursors.right.isDown || this.keys.d.isDown) {
            vx = 1;
            this.facing = 'right';
            isMoving = true;
        }

        // Y movement (direction vector)
        let vy = 0;
        if (this.cursors.up.isDown || this.keys.w.isDown) {
            vy = -1;
            if (!isMoving) this.facing = 'up';
            isMoving = true;
        } else if (this.cursors.down.isDown || this.keys.s.isDown) {
            vy = 1;
            if (!isMoving) this.facing = 'down';
            isMoving = true;
        }

        // Proper normalization (so diagonals are not faster)
        const len = Math.hypot(vx, vy);
        if (len > 0) {
            vx /= len;
            vy /= len;
        }

        // Normalize facing based on dominant axis to reduce jitter
        let direction = this.facing;
        if (Math.abs(vx) > Math.abs(vy)) {
            direction = vx > 0 ? 'right' : (vx < 0 ? 'left' : direction);
        } else if (Math.abs(vy) > 0) {
            direction = vy > 0 ? 'down' : 'up';
        }
        this.facing = direction;

        // Debug: confirm direction mapping while moving
        if (this.texture.key === 'ironman' && isMoving) {
            const now = this.scene.time.now;
            if (now > this._lastFacingLogAt + 250) {
                this._lastFacingLogAt = now;
                console.log('Facing:', this.facing);
            }
        }

        // Update baseY continuously when NOT flying so hover follows movement
        if (!(this.texture.key === 'ironman' && this.isFlying)) {
            this.baseY = this.y;
        }

        // Unify walking/flying movement: ensure we reset drag when not flying
        if (this.texture.key === 'ironman' && this.isFlying) {
            this.body.setAllowGravity(false);
            this.body.setDrag(300, 300);
            this.body.setMaxVelocity(220, 220);

            // Acceleration (smooth start/stop driven by drag)
            this.body.setAcceleration(vx * 600, vy * 600);
        } else {
            this.body.setAllowGravity(true);
            this.body.setMaxVelocity(10000, 10000);
            this.body.setAcceleration(0, 0);
            this.body.setDrag(0, 0);

            const walkSpeed = (this.texture.key === 'ironman') ? 150 : this.speed;
            this.body.setVelocity(vx * walkSpeed, vy * walkSpeed);
        }

        // Fly visuals + hover (Ironman only)
        if (this.texture.key === 'ironman') {
            if (this.isFlying) {
                this.setAngle(vy < 0 ? -5 : (vy > 0 ? 5 : 0));
                this.setTintFill(0x99ccff);

                if (typeof this.baseY !== 'number') {
                    this.baseY = this.y;
                }
                this.setY(this.baseY + Math.sin(this.scene.time.now / 200) * 2);
            } else {
                this.setAngle(0);
                this.baseY = null;
                this.clearTint();
            }
        }

        // Depth: walking uses integer Y-sort, flying is always above
        if (this.texture.key === 'ironman' && this.isFlying) {
            this.setDepth(100);
        } else {
            this.setDepth(Math.floor(this.y));
        }

        // Play anims
        if (isMoving) {
            if (this.texture.key === 'ironman') {
                this.anims.play(`ironman_${this.facing}`, true);
            } else {
                this.anims.play(`${this.spriteKey}_${this.facing}`, true);
            }
        } else {
            if (this.texture.key === 'ironman') {
                this.anims.stop();

                const idleMap = {
                    down: 0,
                    left: 4,
                    right: 8,
                    up: 12
                };
                this.setFrame(idleMap[this.facing] ?? 0);
            } else {
                this.anims.play(`${this.spriteKey}_idle_${this.facing}`, true);
            }
        }

        // Interaction processing
        const time = this.scene.time.now;
        if ((Phaser.Input.Keyboard.JustDown(this.keys.space) || Phaser.Input.Keyboard.JustDown(this.keys.e)) && time > this.lastInteract + 500) {
            this.lastInteract = time;
            this.scene.events.emit('player:interact', this);
        }
    }
}
