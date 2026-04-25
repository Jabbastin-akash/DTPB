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
        this._thrustEmitter = null;

        // Debug (temporary): throttle facing logs
        this._lastFacingLogAt = 0;

        // Interact key debounce
        this.lastInteract = 0;
    }

    // ---- Thruster flame ----
    _ensureFlameTexture() {
        if (this.scene.textures.exists('ironman_thrust')) return;
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        // Blue outer glow
        g.fillGradientStyle(0x0044ff, 0x0044ff, 0x00ccff, 0x00ccff, 1);
        g.fillCircle(8, 8, 8);
        // Bright cyan mid ring
        g.fillStyle(0x00eeff, 0.85);
        g.fillCircle(8, 8, 5);
        // White-hot core
        g.fillStyle(0xffffff, 1);
        g.fillCircle(8, 8, 3);
        g.generateTexture('ironman_thrust', 16, 16);
        g.destroy();
    }

    _startThrust() {
        this._ensureFlameTexture();
        if (this._thrustEmitter) return;
        // Use physics body bottom for exact feet position
        const feetX = this.body.x + this.body.width / 2;
        const feetY = this.body.y + this.body.height;
        this._thrustEmitter = this.scene.add.particles(feetX, feetY, 'ironman_thrust', {
            speed: { min: 30, max: 80 },
            angle: { min: 75, max: 105 },   // mostly downward, slight spread
            scale: { start: 1.2, end: 0 },
            alpha: { start: 1, end: 0 },
            tint: [0xffffff, 0x00eeff, 0x0088ff, 0x0044ff],
            lifespan: 320,
            frequency: 20,
            quantity: 4,
            gravityY: 30,
            blendMode: 'ADD'
        });
        this._thrustEmitter.setDepth(99);
    }

    _stopThrust() {
        if (!this._thrustEmitter) return;
        this._thrustEmitter.stop();
        this.scene.time.delayedCall(300, () => {
            if (this._thrustEmitter) {
                this._thrustEmitter.destroy();
                this._thrustEmitter = null;
            }
        });
    }

    update() {
        // Toggle fly mode (Ironman only)
        if (this.texture.key === 'ironman' && Phaser.Input.Keyboard.JustDown(this.flyKey)) {
            this.isFlying = !this.isFlying;
            if (this.isFlying) {
                this._startThrust();
            } else {
                this._stopThrust();
            }
        }

        // Don't move if UI is active (movement locked by scene)
        if (this.scene.movementEnabled === false) {
            // Keep hover stable while paused
            if (this.texture.key === 'ironman' && this.isFlying) {
                const bobAmount = Math.round(Math.sin(this.scene.time.now / 200) * 2);
                this.displayOriginY = (this.frame?.realHeight ?? this.height ?? 32) * this.originY + bobAmount;
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



        // Movement system: Clean separation between ground and flying
        if (this.texture.key === 'ironman' && this.isFlying) {
            // FLYING SYSTEM (Ironman only): Acceleration-based for smooth glide
            this.body.setAllowGravity(false);
            this.body.setAcceleration(vx * 800, vy * 800);
            this.body.setDrag(400, 400);
            this.body.setMaxVelocity(220, 220);
        } else {
            // GROUND SYSTEM: Pure velocity for instant, responsive movement
            this.body.setAllowGravity(true);
            this.body.setAcceleration(0, 0);
            this.body.setDrag(0, 0);

            const speed = 150;
            this.body.setVelocity(vx * speed, vy * speed);


        }

        // Fly visuals + hover (Ironman only)
        if (this.texture.key === 'ironman') {
            if (this.isFlying) {
                // Remove angle rotation to prevent pixel art blurring
                this.setAngle(0);

                // Subtle bob effect only — no float offset so camera stays aligned
                const bobAmount = Math.round(Math.sin(this.scene.time.now / 200) * 2);
                this.displayOriginY = (this.frame?.realHeight ?? this.height ?? 32) * this.originY + bobAmount;
            } else {
                this.setAngle(0);
                this.clearTint();
                this.displayOriginY = (this.frame?.realHeight ?? this.height ?? 32) * this.originY;
            }
        }

        // Depth: walking uses integer Y-sort, flying is always above
        if (this.texture.key === 'ironman' && this.isFlying) {
            this.setDepth(100);
        } else {
            this.setDepth(Math.floor(this.y));
        }

        // Play anims (prevent spam by checking current anim)
        const shouldAnimateWalk = isMoving && !(this.texture.key === 'ironman' && this.isFlying);

        if (shouldAnimateWalk) {
            const nextAnim = this.texture.key === 'ironman' ? `ironman_${this.facing}` : `${this.spriteKey}_${this.facing}`;
            if (this.anims.currentAnim?.key !== nextAnim) {
                this.anims.play(nextAnim, true);
            }
        } else {
            if (this.texture.key === 'ironman') {
                this.anims.stop();

                // When flying: use neutral "legs straight together" frame for each direction
                const flyingFrameMap = {
                    down:  1,   // frame 1: legs together, facing down
                    right: 5,   // frame 5: legs together, facing right (row1)
                    left:  9,   // frame 9: legs together, facing left (row2)
                    up:    12   // frame 12: legs together, facing up
                };
                const idleMap = this.isFlying ? flyingFrameMap : {
                    down: 0,
                    left: 8,
                    right: 4,
                    up: 12
                };
                this.setFrame(idleMap[this.facing] ?? 0);
            } else {
                const idleAnim = `${this.spriteKey}_idle_${this.facing}`;
                if (this.anims.currentAnim?.key !== idleAnim) {
                    this.anims.play(idleAnim, true);
                }
            }
        }

        // Track thruster to feet (use physics body bottom — always at character's feet)
        if (this._thrustEmitter) {
            const feetX = this.body.x + this.body.width / 2;
            const feetY = this.body.y + this.body.height;
            this._thrustEmitter.setPosition(feetX, feetY);
        }

        // Interaction processing
        const time = this.scene.time.now;
        if ((Phaser.Input.Keyboard.JustDown(this.keys.space) || Phaser.Input.Keyboard.JustDown(this.keys.e)) && time > this.lastInteract + 500) {
            this.lastInteract = time;
            this.scene.events.emit('player:interact', this);
        }
    }
}
