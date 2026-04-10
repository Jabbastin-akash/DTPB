// ===== Player.js =====
// Main character logic with WASD + arrow controls and collision

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        const textureKey = gameState.playerGender === 'female' ? 'player_female' : 'player_male';
        super(scene, x, y, textureKey);

        this.scene = scene;
        this.spriteKey = textureKey;
        
        // Add to scene and physics
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        // Adjust 32x32 sprite hitbox to just cover the legs for isometric feel
        this.body.setSize(16, 12);
        this.body.setOffset(8, 20);
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

        this.speed = 120;
        this.facing = 'down';
        
        // Interact key debounce
        this.lastInteract = 0;
    }

    update() {
        // Stop moving by default
        this.body.setVelocity(0);

        // Don't move if UI is active (input disabled by scene)
        if (!this.scene.input.keyboard.enabled) {
            this.anims.play(`${this.spriteKey}_idle_${this.facing}`, true);
            return;
        }

        let isMoving = false;

        // X movement
        if (this.cursors.left.isDown || this.keys.a.isDown) {
            this.body.setVelocityX(-this.speed);
            this.facing = 'left';
            isMoving = true;
        } else if (this.cursors.right.isDown || this.keys.d.isDown) {
            this.body.setVelocityX(this.speed);
            this.facing = 'right';
            isMoving = true;
        }

        // Y movement
        if (this.cursors.up.isDown || this.keys.w.isDown) {
            this.body.setVelocityY(-this.speed);
            if (!isMoving) this.facing = 'up'; // Prefer Y face if pure Y
            isMoving = true;
        } else if (this.cursors.down.isDown || this.keys.s.isDown) {
            this.body.setVelocityY(this.speed);
            if (!isMoving) this.facing = 'down';
            isMoving = true;
        }

        // Normalize speed for diagonals
        this.body.velocity.normalize().scale(this.speed);

        // Play anims
        if (isMoving) {
            this.anims.play(`${this.spriteKey}_${this.facing}`, true);
        } else {
            this.anims.play(`${this.spriteKey}_idle_${this.facing}`, true);
        }

        // Interaction processing
        const time = this.scene.time.now;
        if ((Phaser.Input.Keyboard.JustDown(this.keys.space) || Phaser.Input.Keyboard.JustDown(this.keys.e)) && time > this.lastInteract + 500) {
            this.lastInteract = time;
            this.scene.events.emit('player:interact', this);
        }

        // Depth sort based on Y
        this.setDepth(this.y + this.height);
    }
}
