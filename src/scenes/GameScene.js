// ===== GameScene.js =====
// Main world scene: handles map loading, player, NPCs, camera, collisions

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // --- Map & Layers ---
        this.map = this.make.tilemap({ key: 'map' });
        const map = this.map;
        const tileset = this.map.addTilesetImage('village-tiles', 'village-tiles');

        this.groundLayer = this.map.createLayer('Ground', tileset, 0, 0);
        this.wallsLayer = this.map.createLayer('Walls', tileset, 0, 0);
        this.upgradeLayer = this.map.createLayer('Upgrade', tileset, 0, 0);
        this.objectsLayer = this.map.createLayer('Objects', tileset, 0, 0);
        // Deprecated: this.buildingsLayer = this.map.createLayer('Buildings', tileset, 0, 0);

        this.wallsLayer.setCollisionByExclusion([-1, 0]);
        this.objectsLayer.setCollisionByExclusion([-1, 0]);
        // this.buildingsLayer.setCollisionByExclusion([-1, 0]);

        this.groundLayer.setDepth(0);
        this.wallsLayer.setDepth(1);
        this.upgradeLayer.setDepth(2);
        this.objectsLayer.setDepth(3);
        // this.buildingsLayer.setDepth(y) - Now handled by dynamic objects sorting.

        // --- Create Static Image Objects ---
        this.staticObjects = this.physics.add.staticGroup();
        const imageObjectsData = this.registry.get('imageObjects') || [];
        this.imageItems = [];

        imageObjectsData.forEach(obj => {
            const img = this.add.image(obj.x, obj.y, obj.key).setOrigin(0, 0);
            if (obj.width) img.displayWidth = obj.width;
            if (obj.height) img.displayHeight = obj.height;
            
            const h = obj.height || img.height || 32;
            // Sorting based on the very bottom of the image
            img.setDepth(obj.y + h);
            this.imageItems.push({ img, bottom: obj.y + h });

            // Default bounds if missing
            const b = obj.customBounds || { x: 0, y: 0, w: obj.width || img.width || 32, h: obj.height || img.height || 32 };
            
            // Draw a physics body
            const dummy = this.add.zone(obj.x + b.x + b.w/2, obj.y + b.y + b.h/2, b.w, b.h);
            this.physics.add.existing(dummy, true); // static body
            this.staticObjects.add(dummy);

            // Add floaty animation to certain decors
            if (obj.key === 'decor_cart') {
                this.tweens.add({
                    targets: img,
                    y: obj.y - 2,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });

        // Set World Bounds
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.createShopZone();

        this.applyPathEdges();

        // Collision
        this.wallsLayer.setCollisionByExclusion([-1, 0, TID.GATE]); // Gate is passable
        
        // Ensure some wall tile variants overlap into bounds
        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;

        // --- Player Setup ---
        // Find spawn point from object layer
        const spawnPoint = map.findObject('Spawn', obj => obj.name === 'spawn');
        this.player = new Player(this, spawnPoint ? spawnPoint.x + 16 : 400, spawnPoint ? spawnPoint.y + 16 : 600);
        this.physics.add.collider(this.player, this.wallsLayer);

        // Camera setup
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // --- NPC Setup ---
        this.npcs = this.physics.add.group({ classType: NPC, runChildUpdate: true });
        
        const npcObjects = map.getObjectLayer('NPCs').objects;
        npcObjects.forEach(obj => {
            const props = obj.properties || [];
            const npcId = props.find(p => p.name === 'npcId')?.value || obj.name;
            const taskId = props.find(p => p.name === 'taskId')?.value || null;
            
            const spriteKey = npcId.startsWith('villager') ? npcId : 
                               npcId.startsWith('task') ? taskId : npcId;

            // Adjust Tiled coordinate (bottom-left origin) to center origin
            const x = obj.x + (obj.width / 2);
            const y = obj.y + (obj.height / 2);

            const npc = new NPC(this, x, y, spriteKey, npcId, { taskId });
            this.npcs.add(npc);
            npc.initialize(); // Call initialize to set up pulse rings and listeners

            // Assign patrols for tasks
            if (taskId && TASKS[taskId]) {
                npc.setPatrol(TASKS[taskId].npcPatrol);
            } else if (npcId === 'guide') {
                // Guide walks to greet player once spawned, then stays
                npc.patrolPath = [{ x: 12, y: 17 }];
                npc.targetNode = npc.patrolPath[0];
            } else if (npcId.startsWith('villager')) {
                // High-quality random movement within a 3-tile radius
                npc.setRandomPatrol(Math.floor(x/32), Math.floor(y/32), 3);
            }
        });

        // Add interaction collision bounds
        this.physics.add.overlap(this.player, this.npcs, (player, npc) => {
            // Overlapping enables the marker, but Space/E handles the actual interaction.
        });

        this.events.on('player:interact', () => {
             // Find closest NPC
             let closest = null;
             let minDist = 48; // Max interaction distance

             this.npcs.getChildren().forEach(npc => {
                 const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
                 if (dist < minDist && npc.canInteract()) {
                     minDist = dist;
                     closest = npc;
                 }
             });

             if (closest) {
                 closest.interact(this.player);
                 this.input.keyboard.enabled = false; // Disable game movement while panel open
             }
        });

        // Re-enable input after panel close
        EventBus.on('panel:close', () => {
            this.input.keyboard.enabled = true;
        });

        // Apply any pre-purchased upgrades
        EventBus.on('upgrade:purchased', this.applyUpgrade, this);
        EventBus.on('task:completed', this.onTaskComplete, this);
        EventBus.on('points:added', this.onPointsAdded, this);

        // If tasks pre-completed (e.g., loaded save state), apply markers
        gameState.tasksComplete.forEach(tId => this.markTaskHouse({ taskId: tId }));
        gameState.upgradesPurchased.forEach(uId => this.applyUpgrade(uId));

        // Spawn user NPC if task3a is complete
        if (gameState.isTaskComplete('task3a')) {
            this.spawnUserNPC();
        }
    }

    update(time, delta) {
        if (this.player) this.player.update();
    }

    onTaskComplete({ taskId }) {
        this.markTaskHouse({ taskId });

        // Spawn the user-created NPC after task 3a is completed
        if (taskId === 'task3a') {
            this.spawnUserNPC();
        }
    }

    onPointsAdded({ amount, sourcePosition }) {
        if (!sourcePosition || typeof sourcePosition.x !== 'number' || typeof sourcePosition.y !== 'number') return;

        const text = this.add.text(sourcePosition.x, sourcePosition.y - 28, `+${amount} ⭐`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        });
        text.setOrigin(0.5, 0.5).setDepth(20);

        this.tweens.add({
            targets: text,
            y: text.y - 48,
            alpha: 0,
            scale: 1.1,
            duration: 900,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    spawnUserNPC() {
        if (!gameState.userProfile || !gameState.userProfile.name) return;

        // Use the drawing as a texture if it exists
        const spriteKey = gameState.userProfile.drawingData ? 'user_drawing' : 'villager1';
        if (gameState.userProfile.drawingData && !this.textures.exists('user_drawing')) {
            const img = new Image();
            img.src = gameState.userProfile.drawingData;
            img.onload = () => {
                this.textures.addImage('user_drawing', img);
                this.createUserNPC(spriteKey);
            };
        } else {
            this.createUserNPC(spriteKey);
        }
    }

    createUserNPC(spriteKey) {
        const spawnX = 10 * 32;
        const spawnY = 10 * 32;
        const userNpc = new NPC(this, spawnX, spawnY, spriteKey, 'user_npc');
        userNpc.setRandomPatrol(10, 10, 4);
        this.npcs.add(userNpc);
        userNpc.showSpeechBubble(`Hi, I'm ${gameState.userProfile.name}!`);
    }

    createShopZone() {
        for (let y = 15; y <= 19; y++) {
            for (let x = 19; x <= 23; x++) {
                this.groundLayer.putTileAt(TID.COBBLESTONE, x, y);
            }
        }
    }

    applyPathEdges() {
        const isPath = (tile) => tile && (tile.index === TID.PATH || tile.index === TID.PATH2);
        const isGrass = (tile) => tile && (tile.index === TID.GRASS || tile.index === TID.GRASS2 || tile.index === TID.FLOWER_GROUND);

        this.groundLayer.forEachTile(tile => {
            if (!isPath(tile)) return;

            const neighbors = {
                top: this.groundLayer.getTileAt(tile.x, tile.y - 1),
                bottom: this.groundLayer.getTileAt(tile.x, tile.y + 1),
                left: this.groundLayer.getTileAt(tile.x - 1, tile.y),
                right: this.groundLayer.getTileAt(tile.x + 1, tile.y)
            };

            if (isGrass(neighbors.top)) this.objectsLayer.putTileAt(TID.PATH_EDGE_T, tile.x, tile.y);
            if (isGrass(neighbors.bottom)) this.objectsLayer.putTileAt(TID.PATH_EDGE_B, tile.x, tile.y);
            if (isGrass(neighbors.left)) this.objectsLayer.putTileAt(TID.PATH_EDGE_L, tile.x, tile.y);
            if (isGrass(neighbors.right)) this.objectsLayer.putTileAt(TID.PATH_EDGE_R, tile.x, tile.y);
        });
    }

    applyUpgrade(upgradeId) {
        const upgrade = UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) return;

        // --- 1. Swap Tiles ---
        // This is the primary mechanism for visual upgrades.
        upgrade.tiles.forEach(swap => {
            const tile = this.upgradeLayer.putTileAt(swap.toTile, swap.x, swap.y);
            // If it's the fountain, we need to trigger the animation
            if (upgrade.id === 'fountain' && tile) {
                tile.play('fountain_anim');
            }
        });

        // --- 2. Spawn a new NPC ---
        // The 'bench' upgrade adds a new character to the world.
        if (upgrade.spawnNpc) {
            const npcId = 'npc_bench';
            // Ensure we don't spawn duplicates on scene reload
            if (!this.npcs.getChildren().some(npc => npc.id === npcId)) {
                const newNpc = new NPC({
                    scene: this,
                    x: 17 * 32, // Position near the new bench
                    y: 15 * 32,
                    texture: 'char5', // A unique texture for this NPC
                    id: npcId,
                    name: 'Bookworm',
                    task: null // This NPC doesn't have a task
                });
                this.npcs.add(newNpc);
            }
        }

        // --- 3. Spawn a Pet ---
        // The 'pet' upgrade adds a cat to the world.
        if (upgrade.spawnPet) {
            const petId = 'pet_cat';
             // Ensure we don't spawn duplicates on scene reload
            if (!this.children.list.some(child => child.name === petId)) {
                const pet = this.add.sprite(13 * 32, 11 * 32, 'pet_cat_spritesheet');
                pet.setName(petId);
                pet.play('pet_idle'); // Assuming an idle animation exists
            }
        }
    }

    markTaskHouse({ taskId }) {
        const task = TASKS[taskId];
        if (!task || !task.housePos) return;
        // Swap roof/facade front to show checkmark flag using the objects layer
        this.objectsLayer.putTileAt(TID.CHECKMARK, task.housePos.x + 1, task.housePos.y + 1);

        if (gameState.allTasksComplete) {
            this.triggerCelebration();
        }
    }

    triggerCelebration() {
        // Confetti emitter
        const emitter = this.add.particles(400, 300, 'village-tiles', {
            frame: [0, 8, 10, 15], // Random tile slices as confetti
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.2, end: 0 },
            blendMode: 'ADD',
            lifespan: 2000,
            gravityY: 100,
            quantity: 5
        });

        this.time.delayedCall(3000, () => {
            emitter.stop();
            this.scene.start('CompleteScene');
            this.scene.stop('UIScene');
        });
    }
}
