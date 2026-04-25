// ===== NPC.js =====
// Base interactive character with patrol AI and speech bubble logic

class NPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, spriteKey, id, properties = {}) {
        super(scene, x, y, spriteKey);

        this.scene = scene;
        this.npcId = id;
        
        // Fallback if texture/animation doesn't exist
        this.spriteKey = scene.anims.exists(`${spriteKey}_down`) ? spriteKey : 'player_male';
        this.taskId = properties.taskId || null;
        
        // Setup sprite
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        // Set a smaller, consistent scale for NPCs
        this.setScale(0.8);

        this.body.setImmovable(true);
        // Collision body sized to fit the scaled character
        const bodyW = 24;
        const bodyH = 24;
        this.body.setSize(bodyW, bodyH);
        this.body.setOffset((this.width - bodyW) / 2, this.height - bodyH);

        // Interaction marker (!)
        this.markerOffsetY = Math.round((this.displayHeight || this.height || 32) / 2) + 16;
        this.marker = this.scene.add.sprite(x, y - this.markerOffsetY, 'exclamation').setDepth(10);
        this.marker.setVisible(false);

        // Bobbing animation stored on a small state object to avoid tween target issues
        this.markerBob = { offset: 0 };
        this.markerTween = null;

        // Setup AI
        this.patrolPath = [];
        this.currentPatrolIndex = 0;
        this.patrolWaitTime = 0;
        this.targetNode = null;
        this.speed = 100;
        this.facing = 'down';

        this.isInteracting = false;

        // Active task indicator
        this.pulseRing = null;
        this.pulseTween = null;
        this.pulseState = null;

        // Track missing animations so we only warn once per key
        this._missingAnimWarned = new Set();
    }

    setPatrol(pathNodes) {
        if (!pathNodes || pathNodes.length === 0) return;
        this.patrolPath = pathNodes;
        this.targetNode = this.patrolPath[0];
        this.isRandomPatrol = false;
    }

    setRandomPatrol(startX, startY, radius = 3) {
        this.isRandomPatrol = true;
        this.patrolOrigin = { x: startX, y: startY };
        this.patrolRadius = radius;
        this.randomizeTarget();
    }

    randomizeTarget() {
        const rx = this.patrolOrigin.x + Math.floor(Math.random() * (this.patrolRadius * 2 + 1)) - this.patrolRadius;
        const ry = this.patrolOrigin.y + Math.floor(Math.random() * (this.patrolRadius * 2 + 1)) - this.patrolRadius;
        this.targetNode = { x: rx, y: ry };
        this.patrolPath = [this.targetNode]; // pass the > 0 check
    }

    _playAnimSafe(animKey, loop = true) {
        if (this.anims && this.anims.exists(animKey)) {
            this.anims.play(animKey, loop);
            return true;
        }
        if (this._missingAnimWarned && !this._missingAnimWarned.has(animKey)) {
            this._missingAnimWarned.add(animKey);
            console.warn('Missing:', animKey);
        }
        if (this.anims) this.anims.stop();
        return false;
    }


    update(time, delta) {
        // Keep marker above head always
        if (this.marker) {
            const bob = this.markerBob ? this.markerBob.offset : 0;
            this.marker.x = this.x;
            this.marker.y = this.y - (this.markerOffsetY || 32) + bob;
        }

        if (this.pulseRing) {
            this.pulseRing.x = this.x;
            this.pulseRing.y = this.y + 4;
        }

        if (this.isInteracting) {
            this.body.setVelocity(0);
            this._playAnimSafe(`${this.spriteKey}_idle_${this.facing}`, true);
            return;
        }

        // Patrol logic
        if (this.patrolPath.length > 0 && time > this.patrolWaitTime) {
            this.moveToTarget();
        } else {
            this.body.setVelocity(0);
            this._playAnimSafe(`${this.spriteKey}_idle_${this.facing}`, true);
        }

        // Proximity check with player
        const player = this.scene.player;
        if (player) {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
            if (dist < 48 && this.showsMarker()) {
                this.marker.setVisible(true);
            } else {
                this.marker.setVisible(false);
            }
        }
        
        // Depth sort based on Y
        this.setDepth(this.y + (this.displayHeight || this.height));
    }

    moveToTarget() {
        if (!this.targetNode) return;

        const tx = this.targetNode.x * 32 + 16;
        const ty = this.targetNode.y * 32 + 16;
        const dx = tx - this.x;
        const dy = ty - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // If random patrol hits a wall, re-roll immediately
        if (this.isRandomPatrol && !this.body.blocked.none) {
            this.body.setVelocity(0);
            this.randomizeTarget();
            this.patrolWaitTime = this.scene.time.now + 1000;
            return;
        }

        if (dist < 2) {
            // Reached node
            this.x = tx;
            this.y = ty;
            this.body.setVelocity(0);
            
            if (this.isRandomPatrol) {
                this.randomizeTarget();
                this.patrolWaitTime = this.scene.time.now + 700 + Math.random() * 1200;
            } else {
                this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPath.length;
                this.targetNode = this.patrolPath[this.currentPatrolIndex];
                this.patrolWaitTime = this.scene.time.now + 900; // shorter pause for snappier patrols
            }
            this._playAnimSafe(`${this.spriteKey}_idle_${this.facing}`, true);
        } else {
            // Move toward node
            if (Math.abs(dx) > Math.abs(dy)) {
                this.body.setVelocityX(dx > 0 ? this.speed : -this.speed);
                this.body.setVelocityY(0);
                this.facing = dx > 0 ? 'right' : 'left';
            } else {
                this.body.setVelocityX(0);
                this.body.setVelocityY(dy > 0 ? this.speed : -this.speed);
                this.facing = dy > 0 ? 'down' : 'up';
            }



            this._playAnimSafe(`${this.spriteKey}_${this.facing}`, true);
        }
    }

    canInteract() {
        // Now all NPCs can be interacted with to say something!
        return true;
    }

    showsMarker() {
        if (this.npcId === 'guide' || this.npcId === 'shopkeeper') return true;
        
        // Show marker only if the task is currently active
        // This explicitly guides the player to the right mission
        if (this.taskId && gameState.isTaskUnlocked(this.taskId) && !gameState.isTaskComplete(this.taskId)) {
            return true;
        }
        
        return false;
    }

    getDialogue() {
        if (this.npcId === 'guide') {
            return "Welcome to Design Thinking World! Explore and learn how to solve problems.";
        }
        
        if (!this.taskId) {
            // Random design thinking quotes for villagers
            const quotes = [
                "Design thinking is all about empathy!",
                "Don't forget to test your ideas with real users.",
                "Prototyping helps you fail fast and succeed sooner.",
                "Every great solution starts with a well-defined problem.",
                "It's not about being right, it's about learning what works."
            ];
            return quotes[Math.floor(Math.random() * quotes.length)];
        }

        const task = TASKS[this.taskId];
        if (gameState.isTaskComplete(this.taskId)) {
            return task.dialogue.complete;
        } else if (gameState.isTaskUnlocked(this.taskId)) {
            return task.dialogue.intro;
        } else {
            return task.dialogue.locked;
        }
    }

    interact(player) {
        // Face player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            this.facing = dx > 0 ? 'right' : 'left';
        } else {
            this.facing = dy > 0 ? 'down' : 'up';
        }
        this._playAnimSafe(`${this.spriteKey}_idle_${this.facing}`, true);
        
        this.isInteracting = true;
        this.marker.setVisible(false);

        // Define panel conditions
        const isTaskPanel = this.taskId && gameState.isTaskUnlocked(this.taskId) && !gameState.isTaskComplete(this.taskId);
        
        if (isTaskPanel) {
            // Tell UI scene to open panel
            EventBus.emit('npc:interact', {
                npcId: this.npcId,
                taskId: this.taskId,
                name: TASKS[this.taskId].npcName,
                greeting: this.getDialogue(),
                npc: this
            });
            // Listen for panel close to resume patrol
            EventBus.once('panel:close', () => {
                this.isInteracting = false;
            });
            return true; // Panel opened
        } else if (this.npcId === 'shopkeeper') {
             EventBus.emit('npc:interact', {
                npcId: this.npcId,
                npc: this
            });
            // Listen for panel close to resume patrol
            EventBus.once('panel:close', () => {
                this.isInteracting = false;
            });
            return true; // Panel opened
        } else if (this.isCustomNpc || !this.taskId) {
            // Pick a dialogue line
            const lines = this.customDialogue || [this.getDialogue()];
            this.dialogueIndex = this.dialogueIndex || 0;
            const text = lines[this.dialogueIndex];
            this.dialogueIndex = (this.dialogueIndex + 1) % lines.length;

            EventBus.emit('npc:interact', {
                isDialogue: true,
                name: this.npcName || 'Villager',
                portraitKey: this.spriteKey,
                greeting: text,
                npc: this
            });
            EventBus.once('panel:close', () => {
                this.isInteracting = false;
            });
            return true;
        } else {
            // Fallback for some reason
            this.showSpeechBubble(this.getDialogue());
            return false; // No panel opened
        }
    }

    showSpeechBubble(text) {
        this.scene.movementEnabled = false;
        // A simple bubble for non-panel interactions
        const bubble = this.scene.add.container(this.x, this.y - 40);
        const bg = this.scene.add.graphics();
        const content = this.scene.add.text(0, 0, text, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#000000',
            wordWrap: { width: 180 }
        }).setOrigin(0.5);

        const bounds = content.getBounds();
        bg.fillStyle(0xffffff, 0.9);
        bg.fillRoundedRect(bounds.x - 10, bounds.y - 5, bounds.width + 20, bounds.height + 10, 10);
        
        bubble.add([bg, content].filter(Boolean));
        bubble.setDepth(20);

        this.scene.time.delayedCall(3000, () => {
            if (bubble) bubble.destroy();
            this.isInteracting = false;
            // Re-enable player movement after bubble disappears
            this.scene.movementEnabled = true;
            if (this.scene.input.keyboard) {
                this.scene.input.keyboard.resetKeys();
            }
        });
    }

    // Called from GameScene after NPCs are created
    initialize() {
        if (!this.taskId) return;
    }

    drawPulseRing() {
        if (!this.pulseRing || !this.pulseState) return;

        const t = this.pulseState.t;
        const radius = 18 + 6 * t;
        const alpha = 0.55 - 0.35 * t;

        this.pulseRing.clear();
        this.pulseRing.lineStyle(2, 0xFFD700, alpha);
        this.pulseRing.strokeCircle(0, 0, radius);
    }

    updatePulseRing() {
        if (!this.taskId || !this.pulseRing) return;

        const isActive = gameState.isTaskUnlocked(this.taskId) && !gameState.isTaskComplete(this.taskId);

        if (!isActive) {
            this.pulseRing.setVisible(false);
            this.pulseRing.clear();

            if (this.pulseTween) {
                this.pulseTween.stop();
                this.pulseTween = null;
            }
            this.pulseState = null;

        // Track missing animations so we only warn once per key
        this._missingAnimWarned = new Set();
            return;
        }

        this.pulseRing.setVisible(true);

        if (!this.pulseTween) {
            this.pulseState = { t: 0 };
            this.pulseTween = this.scene.tweens.add({
                targets: this.pulseState,
                t: 1,
                duration: 900,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                onUpdate: () => this.drawPulseRing()
            });
        }

        this.drawPulseRing();
    }

    destroy(fromScene) {
        EventBus.off('task:completed', this.updatePulseRing, this);

        if (this.pulseTween) {
            this.pulseTween.stop();
            this.pulseTween = null;
        }
        this.pulseState = null;

        // Track missing animations so we only warn once per key
        this._missingAnimWarned = new Set();

        if (this.markerTween) {
            this.markerTween.stop();
            this.markerTween = null;
        }
        this.markerBob = null;

        if (this.pulseRing) {
            this.pulseRing.destroy();
            this.pulseRing = null;
        }
        if (this.marker) {
            this.marker.destroy();
            this.marker = null;
        }

        super.destroy(fromScene);
    }
}
