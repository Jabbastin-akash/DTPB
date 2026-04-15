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
        this._autoEnterZoneTaskId = null;
        this._autoEnterZoneStartAt = 0;
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
            const isRoamer = obj.roam === true;
            const img = (isRoamer ? this.physics.add.sprite(obj.x, obj.y, obj.key) : this.add.sprite(obj.x, obj.y, obj.key)).setOrigin(0, 0);
            if (obj.width) img.displayWidth = obj.width;
            if (obj.height) img.displayHeight = obj.height;
            if (!isRoamer && obj.anim) img.play(obj.anim);
            
            const h = obj.height || img.height || 32;
            // Sorting based on the very bottom of the image
            img.setDepth(typeof obj.depth === 'number' ? obj.depth : (obj.y + h));
            this.imageItems.push({ img, bottom: obj.y + h });

            // Default bounds if missing
            const b = obj.customBounds || { x: 0, y: 0, w: obj.width || img.width || 32, h: obj.height || img.height || 32 };
            
            if (!isRoamer) {
                // Draw a physics body
                const dummy = this.add.zone(obj.x + b.x + b.w/2, obj.y + b.y + b.h/2, b.w, b.h);
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

            if (isRoamer && img.body) {
                img.body.setAllowGravity(false);
                img.body.setCollideWorldBounds(true);
                const spriteW = img.displayWidth || img.width || 32;
                const spriteH = img.displayHeight || img.height || 32;
                const bodyW = Math.min(16, spriteW);
                const bodyH = Math.min(12, spriteH);
                img.body.setSize(bodyW, bodyH);
                img.body.setOffset(Math.floor((spriteW - bodyW) / 2), Math.floor(spriteH - bodyH));
                this.physics.add.collider(img, this.wallsLayer);
                this.physics.add.collider(img, this.staticObjects);
                this.registerRoamer(img, {
                    minSpeed: obj.roamMinSpeed,
                    maxSpeed: obj.roamMaxSpeed,
                    roamBounds: obj.roamBounds,
                    idleAnim: obj.anim,
                    walkAnim: obj.walkAnim,
                    depthPad: spriteH
                });
            }
        });

        // Set World Bounds
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.normalizeGroundTiles();
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

        this.createShopZone();

        // Ensure keyboard input is enabled after scene transitions
        this.input.keyboard.enabled = true;
        this.input.keyboard.resetKeys();

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

            let roleKey = npcId;
            if (npcId.startsWith('task') && taskId) {
                roleKey = taskId;
            }
            const spriteKey = this.getNpcSpriteKey(roleKey);

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

        this.spawnExtraNPCs();

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
        this.updateAutoEnterZone(time);
        this.updateRoamers(time);
    }

    updateAutoEnterZone(time) {
        if (this.movementEnabled === false) {
            this._autoEnterZoneTaskId = null;
            return;
        }

        const zone = this.getActiveZoneForPlayer();
        if (zone?.mode !== 'scene' || !zone?.autoEnter) {
            this._autoEnterZoneTaskId = null;
            return;
        }

        if (this._autoEnterZoneTaskId !== zone.taskId) {
            this._autoEnterZoneTaskId = zone.taskId;
            this._autoEnterZoneStartAt = time;
            return;
        }

        if (time - this._autoEnterZoneStartAt < 260) return;

        this._autoEnterZoneTaskId = null;
        this.triggerStoryZone(zone);
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
            const autoEnterRaw = props.find(p => p.name === 'autoEnter')?.value;
            const autoEnter = autoEnterRaw === true || autoEnterRaw === 'true' || autoEnterRaw === 1 || autoEnterRaw === '1';

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
                autoEnter,
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

        const inside = Phaser.Geom.Rectangle.Contains(zone.rect, this.player.x, this.player.y);
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

        if (zone.mode === 'scene' && zone.autoEnter) {
            this.zonePromptText.setText(`Entering: ${zone.label}`);
        } else {
            this.zonePromptText.setText(`Press E: ${zone.label}`);
        }
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

    updateMissionGuider() {
        if (!this.guiderArrow || !this.player) return;

        const activeTaskId = this.getActiveTaskId();
        if (!activeTaskId) {
            this.guiderArrow.setVisible(false);
            return;
        }

        const zone = this.storyZonesByTaskId?.[activeTaskId];
        const activeTarget = zone?.center
            ? { x: zone.center.x, y: zone.center.y }
            : (() => {
                const npc = this.npcs?.getChildren?.().find(n => n.taskId === activeTaskId);
                return npc ? { x: npc.x, y: npc.y } : null;
            })();

        if (!activeTarget) {
            this.guiderArrow.setVisible(false);
            return;
        }

        this.guiderArrow.setVisible(true);
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, activeTarget.x, activeTarget.y);
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, activeTarget.x, activeTarget.y);
        this.guiderArrow.setAlpha(dist > 80 ? 1 : 0.2);
        this.guiderArrow.x = this.player.x + Math.cos(angle) * 40;
        this.guiderArrow.y = this.player.y + Math.sin(angle) * 40;
        this.guiderArrow.rotation = angle;
    }

    getNpcSpriteKey(roleKey) {
        const roleMap = this.registry.get('npcRoleSpriteMap') || {};
        const spriteKey = roleMap[roleKey];
        if (spriteKey && this.textures.exists(spriteKey)) return spriteKey;
        return roleKey;
    }

    spawnExtraNPCs() {
        const spriteKeys = this.registry.get('npcSpriteKeys') || [];
        if (!Array.isArray(spriteKeys) || spriteKeys.length === 0) return;

        const roleMap = this.registry.get('npcRoleSpriteMap') || {};
        const used = new Set(Object.values(roleMap || {}));
        const extras = spriteKeys.filter((key) => !used.has(key));
        if (extras.length === 0) return;

        const spawnPoints = this.collectExtraNpcSpawnPoints(extras.length);
        if (spawnPoints.length === 0) return;

        let spawnIndex = 0;
        extras.forEach((spriteKey) => {
            if (spawnIndex >= spawnPoints.length) return;
            const point = spawnPoints[spawnIndex++];
            const npc = new NPC(this, point.x, point.y, spriteKey, `extra_${spawnIndex}`);
            this.npcs.add(npc);
            npc.initialize();
        });
    }

    collectExtraNpcSpawnPoints(targetCount) {
        const points = [];
        if (!this.map) return points;

        const tileW = this.map.tileWidth || 32;
        const tileH = this.map.tileHeight || 32;
        const step = 2;

        for (let ty = 2; ty < this.map.height - 2; ty += step) {
            for (let tx = 2; tx < this.map.width - 2; tx += step) {
                if (this.wallsLayer.getTileAt(tx, ty)) continue;
                if (this.objectsLayer.getTileAt(tx, ty)) continue;

                const wx = tx * tileW + tileW / 2;
                const wy = ty * tileH + tileH / 2;

                if (!this.isSpawnFarFromNpcs(wx, wy, 40)) continue;
                points.push({ x: wx, y: wy });
            }
        }

        Phaser.Utils.Array.Shuffle(points);
        return points.slice(0, Math.max(0, targetCount));
    }

    isSpawnFarFromNpcs(x, y, minDist) {
        const npcs = this.npcs ? this.npcs.getChildren() : [];
        for (const npc of npcs) {
            const dist = Phaser.Math.Distance.Between(x, y, npc.x, npc.y);
            if (dist < minDist) return false;
        }
        return true;
    }

    registerRoamer(sprite, options = {}) {
        sprite.roamMinSpeed = options.minSpeed || 20;
        sprite.roamMaxSpeed = options.maxSpeed || 45;
        sprite.roamBounds = options.roamBounds || null;
        sprite.idleAnim = options.idleAnim || null;
        sprite.walkAnim = options.walkAnim || null;
        sprite.depthPad = options.depthPad || (sprite.displayHeight || sprite.height || 0);
        sprite.nextRoamChange = 0;
        this.roamers.push(sprite);
        if (sprite.idleAnim) sprite.play(sprite.idleAnim);
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
            const bounds = sprite.roamBounds;
            if (bounds) {
                const minX = bounds.x;
                const maxX = bounds.x + bounds.w;
                const minY = bounds.y;
                const maxY = bounds.y + bounds.h;
                if (sprite.x < minX || sprite.x > maxX || sprite.y < minY || sprite.y > maxY) {
                    sprite.x = Phaser.Math.Clamp(sprite.x, minX, maxX);
                    sprite.y = Phaser.Math.Clamp(sprite.y, minY, maxY);
                    this.setRoamerVelocity(sprite);
                }
            }
            const blocked = sprite.body.blocked.left || sprite.body.blocked.right || sprite.body.blocked.up || sprite.body.blocked.down;
            if (time >= sprite.nextRoamChange || blocked) {
                this.setRoamerVelocity(sprite);
            }
            const speed = Math.abs(sprite.body.velocity.x) + Math.abs(sprite.body.velocity.y);
            const desiredAnim = speed > 1 ? sprite.walkAnim : sprite.idleAnim;
            if (desiredAnim && sprite.anims?.currentAnim?.key !== desiredAnim) {
                sprite.play(desiredAnim);
            }
            sprite.setDepth(sprite.y + (sprite.depthPad || 0));
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
        // Intentionally empty: world clutter has been removed by request.
    }

    normalizeGroundTiles() {
        const orangeLikeGround = new Set([TID.SOIL, TID.FLOWER_GROUND]);

        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                const g = this.groundLayer.getTileAt(x, y);
                if (g && orangeLikeGround.has(g.index)) {
                    this.groundLayer.putTileAt(TID.GRASS, x, y);
                }

                const u = this.upgradeLayer.getTileAt(x, y);
                if (u && orangeLikeGround.has(u.index)) {
                    this.upgradeLayer.removeTileAt(x, y);
                }
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
