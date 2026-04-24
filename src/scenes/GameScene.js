// ===== GameScene.js =====
// Main world scene: handles map loading, player, NPCs, camera, collisions

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        this.movementEnabled = true;
        this.roamers = [];
        this._celebrationRunning = false;
        // --- Map & Layers ---
        this.map = this.make.tilemap({ key: 'map' });
        const map = this.map;
        const tileset = this.map.addTilesetImage('village-tiles', 'village-tiles');

        this.groundLayer = this.map.createLayer('Ground', tileset, 0, 0);
        this.wallsLayer = this.map.createLayer('Walls', tileset, 0, 0);
        this.upgradeLayer = this.map.createLayer('Upgrade', tileset, 0, 0);
        this.objectsLayer = this.map.createLayer('Objects', tileset, 0, 0);

        this.wallsLayer.setCollisionByExclusion([-1, 0]);
        this.objectsLayer.setCollisionByExclusion([-1, 0]);

        this.groundLayer.setDepth(0);
        this.wallsLayer.setDepth(1);
        this.upgradeLayer.setDepth(2);
        this.objectsLayer.setDepth(3);

        // --- Create Static Image Objects ---
        this.staticObjects = this.physics.add.staticGroup();
        const imageObjectsData = this.registry.get('imageObjects') || [];
        this.imageItems = [];

        const houseScale = gameState?.houseScale ?? 1;

        imageObjectsData.forEach(obj => {
            const img = this.add.sprite(obj.x, obj.y, obj.key).setOrigin(0, 0);

            const isHouse = typeof obj.key === 'string' && obj.key.startsWith('house');
            const scaleFactor = (isHouse && houseScale !== 1) ? houseScale : 1;

            const baseW = obj.width || img.width || 32;
            const baseH = obj.height || img.height || 32;
            const drawW = Math.max(1, Math.round(baseW * scaleFactor));
            const drawH = Math.max(1, Math.round(baseH * scaleFactor));

            img.displayWidth = drawW;
            img.displayHeight = drawH;
            if (obj.anim) img.play(obj.anim);
            
            // Large background art can provide explicit depth to stay behind actors.
            const imageDepth = (typeof obj.depth === 'number') ? obj.depth : (obj.y + drawH);
            img.setDepth(imageDepth);
            this.imageItems.push({ img, bottom: imageDepth });

            if (obj.collidable !== false) {
                // Default bounds if missing (bounds are relative to the sprite's top-left)
                const rawBounds = obj.customBounds || { x: 0, y: 0, w: baseW, h: baseH };
                const b = (scaleFactor === 1)
                    ? rawBounds
                    : {
                        x: Math.round(rawBounds.x * scaleFactor),
                        y: Math.round(rawBounds.y * scaleFactor),
                        w: Math.max(1, Math.round(rawBounds.w * scaleFactor)),
                        h: Math.max(1, Math.round(rawBounds.h * scaleFactor))
                    };

                // Draw a physics body
                const dummy = this.add.zone(obj.x + b.x + b.w / 2, obj.y + b.y + b.h / 2, b.w, b.h);
                this.physics.add.existing(dummy, true); // static body
                this.staticObjects.add(dummy);
            }

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

        this.applyPathEdges();

        // Collision
        this.wallsLayer.setCollisionByExclusion([-1, 0, TID.GATE]); // Gate is passable
        
        // Ensure some wall tile variants overlap into bounds
        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;

        // --- Player Setup ---
        // Find spawn point from object layer
        const spawnPoint = map.findObject('Spawn', obj => obj.name === 'spawn');
        const characterScale = gameState?.characterScale ?? 1;
        const worldMul = gameState?.playerWorldScaleMultiplier ?? 1;
        const playerWorldScale = characterScale * worldMul;
        this.player = new Player(
            this,
            spawnPoint ? spawnPoint.x + 16 : 400,
            spawnPoint ? spawnPoint.y + 16 : 600,
            { scale: playerWorldScale }
        );
        this.physics.add.collider(this.player, this.wallsLayer);
        this.physics.add.collider(this.player, this.objectsLayer);
        this.physics.add.collider(this.player, this.staticObjects);

        this.createShopZone();

        // Ensure keyboard input is enabled after scene transitions
        this.input.keyboard.enabled = true;
        this.input.keyboard.resetKeys();

        // Debug shortcut: press C to open the Classroom scene
        this._onDebugOpenClassroom = (e) => {
            if (e?.stopPropagation) e.stopPropagation();
            this.movementEnabled = false;
            this.input.keyboard.resetKeys();
            this.scene.stop('UIScene');
            this.scene.start('ClassroomScene');
        };
        this.input.keyboard.on('keydown-C', this._onDebugOpenClassroom);

        // Debug shortcut: press M to open the Maze scene
        this._onDebugOpenMaze = (e) => {
            if (e?.stopPropagation) e.stopPropagation();
            this.movementEnabled = false;
            this.input.keyboard.resetKeys();
            this.scene.stop("UIScene");
            this.scene.start("MazeScene");
        };
        this.input.keyboard.on("keydown-M", this._onDebugOpenMaze);


        // Camera setup with smooth lerp and deadzone
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // Deadzone for natural feel (player can move before camera moves)
        this.cameras.main.setDeadzone(100, 80);

        // --- NPC Setup ---
        this.npcs = this.physics.add.group({ classType: NPC, runChildUpdate: true });
        
        const npcObjects = map.getObjectLayer('NPCs')?.objects ?? [];
        npcObjects.forEach(obj => {
            const props = obj.properties || [];
            const npcId = props.find(p => p.name === 'npcId')?.value || obj.name;
            const taskId = props.find(p => p.name === 'taskId')?.value || null;
            
            let spriteKey = npcId;
            if (npcId.startsWith('villager')) {
                spriteKey = npcId;
            } else if (npcId.startsWith('task')) {
                spriteKey = taskId;
            }

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

        // --- Story Zones (locations) ---
        this.createStoryZones();

        this.events.on('player:interact', () => {
             // Zones take priority over NPCs (so the story flow is location-driven)
             const activeZone = this.getActiveZoneForPlayer();
             if (activeZone) {
                 this.triggerStoryZone(activeZone);
                 return;
             }

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
                 const openedPanel = closest.interact(this.player);
                 if (openedPanel) {
                     this.movementEnabled = false; // Disable game movement while panel open
                     this.input.keyboard.resetKeys();
                 }
             }
        });

        // Re-enable input after panel close
        this._onPanelClose = () => {
            this.movementEnabled = true;
            this.input.keyboard.resetKeys();
        };
        EventBus.on('panel:close', this._onPanelClose);

        // Apply any pre-purchased upgrades
        EventBus.on('upgrade:purchased', this.applyUpgrade, this);
        EventBus.on('task:completed', this.onTaskComplete, this);
        EventBus.on('points:added', this.onPointsAdded, this);

        // Prevent EventBus listener buildup when scene restarts (e.g., football/maze scenes)
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this._onPanelClose) EventBus.off('panel:close', this._onPanelClose);
            EventBus.off('upgrade:purchased', this.applyUpgrade, this);
            EventBus.off('task:completed', this.onTaskComplete, this);
            EventBus.off('points:added', this.onPointsAdded, this);
            if (this._onDebugOpenClassroom && this.input?.keyboard) {
                this.input.keyboard.off('keydown-C', this._onDebugOpenClassroom);
                this.input.keyboard.off('keydown-M', this._onDebugOpenMaze);
            }
        });

        // If tasks pre-completed (e.g., loaded save state), apply markers
        gameState.tasksComplete.forEach(tId => this.markTaskHouse({ taskId: tId }));
        gameState.upgradesPurchased.forEach(uId => this.applyUpgrade(uId));

        // Guider Arrow setup
        this.createMissionGuider();

        // Spawn user NPC if task3a is complete
        if (gameState.isTaskComplete('task3a')) {
            this.spawnUserNPC();
        }
    }

    createMissionGuider() {
        this.guiderArrow = this.add.graphics();
        this.guiderArrow.setDepth(100);
        this.guiderArrow.fillStyle(0xFFD700, 0.8);
        this.guiderArrow.lineStyle(2, 0x000000, 1);
        
        // Draw pointing right
        this.guiderArrow.beginPath();
        this.guiderArrow.moveTo(15, 0);
        this.guiderArrow.lineTo(-10, -10);
        this.guiderArrow.lineTo(-4, 0);
        this.guiderArrow.lineTo(-10, 10);
        this.guiderArrow.closePath();
        this.guiderArrow.fillPath();
        this.guiderArrow.strokePath();

        this.tweens.add({
            targets: this.guiderArrow,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    update(time, delta) {
        if (this.player) this.player.update();
        this.updateMissionGuider();
        this.updateZonePrompt();
        this.updateRoamers(time);
    }

    getActiveTaskId() {
        if (typeof TASK_ORDER === 'undefined' || !Array.isArray(TASK_ORDER)) return null;
        for (const taskId of TASK_ORDER) {
            if (!gameState.isTaskComplete(taskId) && gameState.isTaskUnlocked(taskId)) return taskId;
        }
        return null;
    }

    createStoryZones() {
        this.storyZones = [];
        this.storyZonesByTaskId = {};

        const layer = this.map.getObjectLayer('Zones');
        if (!layer || !Array.isArray(layer.objects)) return;

        layer.objects.forEach(obj => {
            const props = obj.properties || [];
            const taskId = props.find(p => p.name === 'taskId')?.value || null;
            if (!taskId) return;

            const label = props.find(p => p.name === 'label')?.value || obj.name || taskId;
            const mode = props.find(p => p.name === 'mode')?.value || 'panel'; // 'panel' | 'scene'
            const sceneKey = props.find(p => p.name === 'sceneKey')?.value || null;

            const rect = new Phaser.Geom.Rectangle(
                obj.x,
                obj.y,
                typeof obj.width === 'number' && obj.width > 0 ? obj.width : 32,
                typeof obj.height === 'number' && obj.height > 0 ? obj.height : 32
            );

            const zone = {
                taskId,
                label,
                mode,
                sceneKey,
                rect,
                center: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
            };

            this.storyZones.push(zone);
            this.storyZonesByTaskId[taskId] = zone;
        });

        // On-screen prompt for the active zone
        this.zonePromptText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 34, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0.5);
        this.zonePromptText.setScrollFactor(0).setDepth(110).setVisible(false);
    }

    getActiveZoneForPlayer() {
        if (!this.player || !this.storyZonesByTaskId) return null;
        const activeTaskId = this.getActiveTaskId();
        if (!activeTaskId) return null;
        const zone = this.storyZonesByTaskId[activeTaskId];
        if (!zone) return null;

        // Use physics-body bottom-center (feet) for zone checks.
        // This is more reliable than sprite x/y when the character sprite is scaled
        // or when body offsets are used for top-down hitboxes.
        const probeX = this.player.body?.center?.x ?? this.player.x;
        const probeY = this.player.body?.bottom ?? this.player.y;
        const inside = Phaser.Geom.Rectangle.Contains(zone.rect, probeX, probeY);
        if (!inside) return null;
        return zone;
    }

    updateZonePrompt() {
        if (!this.zonePromptText || !this.player) return;
        if (this.movementEnabled === false) {
            this.zonePromptText.setVisible(false);
            return;
        }

        const zone = this.getActiveZoneForPlayer();
        if (!zone) {
            this.zonePromptText.setVisible(false);
            return;
        }

        this.zonePromptText.setText(`Press E: ${zone.label}`);
        this.zonePromptText.setVisible(true);
    }

    triggerStoryZone(zone) {
        const taskId = zone.taskId;
        if (!taskId || !TASKS[taskId]) return;
        if (!gameState.isTaskUnlocked(taskId) || gameState.isTaskComplete(taskId)) return;

        // Scene-based tasks
        if (zone.mode === 'scene') {
            const key = zone.sceneKey;
            if (!key) return;
            this.movementEnabled = false;
            this.input.keyboard.resetKeys();
            this.scene.stop('UIScene');
            this.scene.start(key);
            return;
        }

        // Popup-based tasks (TaskPanel)
        EventBus.emit('npc:interact', {
            npcId: 'zone',
            taskId,
            name: TASKS[taskId].npcName,
            greeting: TASKS[taskId].greeting,
            npc: null
        });

        this.movementEnabled = false;
        this.input.keyboard.resetKeys();
    }

    getMissionTarget() {
        const activeTaskId = this.getActiveTaskId();
        if (!activeTaskId) return null;

        const zoneCenter = this.storyZonesByTaskId?.[activeTaskId]?.center;
        if (zoneCenter) return { x: zoneCenter.x, y: zoneCenter.y };

        const npc = this.npcs?.getChildren?.().find(n => n.taskId === activeTaskId);
        if (npc) return { x: npc.x, y: npc.y };

        return null;
    }

    updateMissionGuider() {
        if (!this.guiderArrow || !this.player) return;

        const target = this.getMissionTarget();
        if (!target) {
            this.guiderArrow.setVisible(false); // No active task (game complete)
            return;
        }

        this.guiderArrow.setVisible(true);
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
        this.guiderArrow.setAlpha(dist > 80 ? 1 : 0.2);

        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
        this.guiderArrow.x = this.player.x + Math.cos(angle) * 40;
        this.guiderArrow.y = this.player.y + Math.sin(angle) * 40;
        this.guiderArrow.rotation = angle;
    }

    registerRoamer(sprite, options = {}) {
        sprite.roamMinSpeed = options.minSpeed || 20;
        sprite.roamMaxSpeed = options.maxSpeed || 45;
        sprite.nextRoamChange = 0;
        this.roamers.push(sprite);
        this.setRoamerVelocity(sprite);
    }

    setRoamerVelocity(sprite) {
        if (!sprite.body) return;
        const speed = Phaser.Math.Between(sprite.roamMinSpeed, sprite.roamMaxSpeed);
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        sprite.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        sprite.nextRoamChange = this.time.now + Phaser.Math.Between(900, 2200);
        sprite.flipX = sprite.body.velocity.x < 0;
    }

    updateRoamers(time) {
        if (!this.roamers || this.roamers.length === 0) return;
        this.roamers.forEach(sprite => {
            if (!sprite.active || !sprite.body) return;
            const blocked = sprite.body.blocked.left || sprite.body.blocked.right || sprite.body.blocked.up || sprite.body.blocked.down;
            if (time >= sprite.nextRoamChange || blocked) {
                this.setRoamerVelocity(sprite);
            }
            sprite.setDepth(sprite.y);
        });
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
        if (!gameState.userProfile?.name) return;

        // Use the drawing as a texture if it exists
        const spriteKey = gameState.userProfile.drawingData ? 'user_drawing' : 'villager1';
        if (gameState.userProfile.drawingData && !this.textures.exists('user_drawing')) {
            const img = new Image();
            img.src = gameState.userProfile.drawingData;
            img.onload = () => {
                const baseSize = (typeof SPRITE_W === 'number' && typeof SPRITE_H === 'number') ? SPRITE_W : 32;
                const canvas = document.createElement('canvas');
                canvas.width = baseSize;
                canvas.height = baseSize;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = false;

                const scale = Math.min(baseSize / img.width, baseSize / img.height);
                const drawW = Math.max(1, Math.floor(img.width * scale));
                const drawH = Math.max(1, Math.floor(img.height * scale));
                const dx = Math.floor((baseSize - drawW) / 2);
                const dy = Math.floor((baseSize - drawH) / 2);

                ctx.clearRect(0, 0, baseSize, baseSize);
                ctx.drawImage(img, dx, dy, drawW, drawH);

                this.textures.addCanvas('user_drawing', canvas);
                this.ensureUserDrawingAnims();
                this.createUserNPC(spriteKey);
            };
        } else {
            this.createUserNPC(spriteKey);
        }
    }

    ensureUserDrawingAnims() {
        const key = 'user_drawing';
        const dirs = ['down', 'left', 'right', 'up'];
        dirs.forEach(dir => {
            const idleKey = `${key}_idle_${dir}`;
            const walkKey = `${key}_${dir}`;
            if (!this.anims.exists(idleKey)) {
                this.anims.create({ key: idleKey, frames: [{ key }], frameRate: 1, repeat: -1 });
            }
            if (!this.anims.exists(walkKey)) {
                this.anims.create({ key: walkKey, frames: [{ key }], frameRate: 1, repeat: -1 });
            }
        });
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
        // Place new explicit assets to enhance the map
        const extraSprites = [];
        if (this.textures.exists('bull') && this.anims.exists('bull_anim')) {
            extraSprites.push({ key: 'bull', x: 5 * 32, y: 12 * 32, scale: 0.8, anim: 'bull_anim', minSpeed: 18, maxSpeed: 38 });
        }

        extraSprites.forEach(obj => {
            const sprite = this.physics.add.sprite(obj.x, obj.y, obj.key).setOrigin(0.5, 1);
            sprite.setScale(obj.scale);
            sprite.setDepth(obj.y);
            sprite.body.setImmovable(true);
            sprite.body.setCollideWorldBounds(true);

            // Adjust bounds relative to scaled size
            const bodyWidth = sprite.displayWidth * 0.6;
            const bodyHeight = sprite.displayHeight * 0.4;
            const offX = (sprite.displayWidth - bodyWidth) / 2;
            const offY = sprite.displayHeight - bodyHeight;

            sprite.body.setSize(bodyWidth, bodyHeight);
            sprite.body.setOffset(offX, offY);

            this.physics.add.collider(this.player, sprite);
            this.physics.add.collider(sprite, this.wallsLayer);
            this.physics.add.collider(sprite, this.objectsLayer);
            sprite.play(obj.anim);

            this.registerRoamer(sprite, { minSpeed: obj.minSpeed, maxSpeed: obj.maxSpeed });
        });

        // Add the pixel scenery image statically, far from spawn
        const pixelScenery = this.add.image(10 * 32, 2 * 32, 'pixel_scenery').setOrigin(0.5, 1).setScale(4);
        pixelScenery.setDepth(2 * 32);
        this.physics.add.existing(pixelScenery, true);
        pixelScenery.body.setSize(pixelScenery.width * 0.8, pixelScenery.height * 0.4);
        pixelScenery.body.setOffset((pixelScenery.width * 0.2) / 2, pixelScenery.height * 0.6);
        this.physics.add.collider(this.player, pixelScenery);
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
                const pet = this.add.sprite(13 * 32, 11 * 32, 'pet_cat_idle_sheet');
                pet.setName(petId);
                pet.setOrigin(0.5, 1);
                pet.setDepth(pet.y);
                pet.play('pet_cat_idle');
            }
        }
    }

    markTaskHouse({ taskId }) {
        const task = TASKS[taskId];

        if (task?.housePos) {
            // Swap roof/facade front to show checkmark flag using the objects layer
            this.objectsLayer.putTileAt(TID.CHECKMARK, task.housePos.x + 1, task.housePos.y + 1);
        }

        if (gameState.allTasksComplete) this.triggerCelebration();
    }

    triggerCelebration() {
        if (this._celebrationRunning) return;
        this._celebrationRunning = true;

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
