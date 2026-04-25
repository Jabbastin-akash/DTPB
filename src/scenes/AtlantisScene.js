// ===== AtlantisScene.js =====
// Underwater Atlantis world - teleported to from the pond in GameScene

class AtlantisScene extends Phaser.Scene {
    constructor() {
        super({ key: 'AtlantisScene' });
    }

    create() {
        // --- Constants ---
        const TILE = 32;
        const COLS = 60;
        const ROWS = 50;
        const W = COLS * TILE;
        const H = ROWS * TILE;

        // --- Tile IDs ---
        const T = {
            DEEP_WATER: 1,
            SHALLOW_WATER: 2,
            SAND_FLOOR: 3,
            STONE_FLOOR: 4,
            RUIN_WALL: 5,
            CORAL_RED: 6,
            CORAL_GREEN: 7,
            SEAWEED: 8,
            PILLAR: 9,
            PORTAL: 10,
            SAND_DARK: 11,
            RUIN_WINDOW: 12,
        };

        // --- Procedural Tileset ---
        const tileCount = 12;
        const tsCols = 4;
        const tsRows = Math.ceil(tileCount / tsCols);
        const tsCanvas = document.createElement('canvas');
        tsCanvas.width = tsCols * TILE;
        tsCanvas.height = tsRows * TILE;
        const ctx = tsCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        function seededRng(s) {
            return function () {
                s |= 0; s = s + 0x6D2B79F5 | 0;
                let t = Math.imul(s ^ s >>> 15, 1 | s);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            };
        }

        function tilePos(id) {
            const col = (id - 1) % tsCols;
            const row = Math.floor((id - 1) / tsCols);
            return { x: col * TILE, y: row * TILE };
        }

        function fill(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
        function px(x, y, color, s = 1) { ctx.fillStyle = color; ctx.fillRect(x, y, s, s); }

        // Draw each tile
        function drawTile(id, fn) {
            const p = tilePos(id);
            fn(p.x, p.y);
        }

        // 1. Deep Water
        drawTile(T.DEEP_WATER, (ox, oy) => {
            fill(ox, oy, 32, 32, '#0a2a4a');
            const rng = seededRng(101);
            for (let i = 0; i < 20; i++) {
                const x = rng() * 32, y = rng() * 32;
                px(ox + x, oy + y, rng() > 0.5 ? '#0d3158' : '#071e38', 2);
            }
            // Wave lines
            for (let y = 4; y < 32; y += 8) {
                for (let x = 0; x < 32; x += 2) {
                    const off = Math.sin(x * 0.4 + y * 0.3) * 1.5;
                    if (off > 0.5) px(ox + x, oy + y + off, '#0f3a66', 2);
                }
            }
        });

        // 2. Shallow Water
        drawTile(T.SHALLOW_WATER, (ox, oy) => {
            fill(ox, oy, 32, 32, '#1a5276');
            const rng = seededRng(202);
            for (let i = 0; i < 15; i++) {
                const x = rng() * 30, y = rng() * 30;
                px(ox + x, oy + y, rng() > 0.5 ? '#1f6b91' : '#154360', 2);
            }
            for (let y = 6; y < 32; y += 10) {
                for (let x = 0; x < 32; x += 3) {
                    const off = Math.sin(x * 0.3 + y * 0.2) * 2;
                    if (off > 0) px(ox + x, oy + y + off, '#2187ab', 1);
                }
            }
        });

        // 3. Sand Floor
        drawTile(T.SAND_FLOOR, (ox, oy) => {
            fill(ox, oy, 32, 32, '#c2a67d');
            const rng = seededRng(303);
            for (let i = 0; i < 20; i++) {
                px(ox + rng() * 30, oy + rng() * 30, rng() > 0.5 ? '#b8986b' : '#d4b896', 2);
            }
        });

        // 4. Stone Floor
        drawTile(T.STONE_FLOOR, (ox, oy) => {
            fill(ox, oy, 32, 32, '#3d5c6e');
            const rng = seededRng(404);
            for (let r = 0; r < 4; r++) {
                const offset = r % 2 === 0 ? 0 : 8;
                for (let c = 0; c < 3; c++) {
                    fill(ox + c * 12 + offset, oy + r * 8, 10, 6, '#4a6d7f');
                    fill(ox + c * 12 + offset, oy + r * 8, 10, 1, '#2d4654');
                }
            }
        });

        // 5. Ruin Wall
        drawTile(T.RUIN_WALL, (ox, oy) => {
            fill(ox, oy, 32, 32, '#2c3e50');
            // Brick pattern
            const rng = seededRng(505);
            for (let r = 0; r < 4; r++) {
                const offset = r % 2 === 0 ? 0 : 8;
                for (let c = 0; c < 3; c++) {
                    fill(ox + c * 12 + offset, oy + r * 8, 10, 7, '#34495e');
                    fill(ox + c * 12 + offset, oy + r * 8, 10, 1, '#1a252f');
                }
            }
            // Moss
            for (let i = 0; i < 6; i++) {
                px(ox + rng() * 28, oy + rng() * 28, '#1a6b4a', 3);
            }
        });

        // 6. Coral Red
        drawTile(T.CORAL_RED, (ox, oy) => {
            fill(ox, oy, 32, 32, '#1a5276');
            // Coral branches
            const rng = seededRng(606);
            fill(ox + 12, oy + 20, 8, 12, '#8b3a3a');
            fill(ox + 8, oy + 14, 6, 10, '#c0392b');
            fill(ox + 18, oy + 12, 6, 12, '#e74c3c');
            fill(ox + 14, oy + 8, 4, 8, '#c0392b');
            fill(ox + 10, oy + 6, 3, 4, '#e74c3c');
            fill(ox + 20, oy + 6, 3, 5, '#c0392b');
            for (let i = 0; i < 4; i++) {
                px(ox + 10 + rng() * 14, oy + 6 + rng() * 12, '#f1948a', 2);
            }
        });

        // 7. Coral Green
        drawTile(T.CORAL_GREEN, (ox, oy) => {
            fill(ox, oy, 32, 32, '#1a5276');
            fill(ox + 10, oy + 18, 12, 14, '#1a6b4a');
            fill(ox + 6, oy + 10, 8, 14, '#27ae60');
            fill(ox + 18, oy + 8, 8, 16, '#2ecc71');
            fill(ox + 12, oy + 4, 6, 10, '#27ae60');
            const rng = seededRng(707);
            for (let i = 0; i < 5; i++) {
                px(ox + 8 + rng() * 16, oy + 4 + rng() * 16, '#82e0aa', 2);
            }
        });

        // 8. Seaweed
        drawTile(T.SEAWEED, (ox, oy) => {
            fill(ox, oy, 32, 32, '#1a5276');
            const rng = seededRng(808);
            for (let s = 0; s < 3; s++) {
                const bx = 6 + s * 10;
                for (let y = 0; y < 28; y += 3) {
                    const sway = Math.sin(y * 0.3 + s) * 3;
                    fill(ox + bx + sway, oy + 32 - y, 3, 4, y < 14 ? '#1e8449' : '#27ae60');
                }
            }
        });

        // 9. Pillar
        drawTile(T.PILLAR, (ox, oy) => {
            fill(ox, oy, 32, 32, '#1a5276');
            // Column
            fill(ox + 10, oy + 4, 12, 24, '#5d6d7e');
            fill(ox + 8, oy + 2, 16, 4, '#7f8c8d');
            fill(ox + 8, oy + 26, 16, 4, '#7f8c8d');
            // Cracks
            fill(ox + 14, oy + 10, 1, 8, '#34495e');
            fill(ox + 18, oy + 14, 1, 6, '#34495e');
            // Moss
            fill(ox + 10, oy + 22, 4, 4, '#1a6b4a');
        });

        // 10. Portal
        drawTile(T.PORTAL, (ox, oy) => {
            fill(ox, oy, 32, 32, '#1a5276');
            // Glowing circle
            ctx.beginPath();
            ctx.arc(ox + 16, oy + 16, 12, 0, Math.PI * 2);
            ctx.fillStyle = '#00e5ff';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ox + 16, oy + 16, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#80f0ff';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ox + 16, oy + 16, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        });

        // 11. Sand Dark
        drawTile(T.SAND_DARK, (ox, oy) => {
            fill(ox, oy, 32, 32, '#a0885a');
            const rng = seededRng(1111);
            for (let i = 0; i < 12; i++) {
                px(ox + rng() * 30, oy + rng() * 30, rng() > 0.5 ? '#8b7347' : '#b89b6e', 2);
            }
        });

        // 12. Ruin Window
        drawTile(T.RUIN_WINDOW, (ox, oy) => {
            fill(ox, oy, 32, 32, '#2c3e50');
            // Brick pattern
            for (let r = 0; r < 4; r++) {
                const offset = r % 2 === 0 ? 0 : 8;
                for (let c = 0; c < 3; c++) {
                    fill(ox + c * 12 + offset, oy + r * 8, 10, 7, '#34495e');
                }
            }
            // Window
            fill(ox + 10, oy + 8, 12, 14, '#0a2a4a');
            fill(ox + 12, oy + 10, 8, 10, '#0d3158');
            // Moss
            fill(ox + 8, oy + 24, 6, 3, '#1a6b4a');
            fill(ox + 20, oy + 26, 5, 3, '#1e8449');
        });

        // --- Add tileset texture ---
        if (this.textures.exists('atlantis_tiles')) this.textures.remove('atlantis_tiles');
        this.textures.addCanvas('atlantis_tiles', tsCanvas);

        // --- Generate Map Data ---
        const ground = new Array(COLS * ROWS).fill(T.DEEP_WATER);
        const objects = new Array(COLS * ROWS).fill(0);

        const set = (x, y, v, layer = 'ground') => {
            if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;
            if (layer === 'ground') ground[y * COLS + x] = v;
            else objects[y * COLS + x] = v;
        };
        const get = (x, y) => (x >= 0 && x < COLS && y >= 0 && y < ROWS) ? ground[y * COLS + x] : 0;

        const hash = (x, y, seed = 1337) => {
            const n = Math.imul(x + 374761393, 668265263) ^ Math.imul(y + 1442695041, 2246822519) ^ seed;
            return ((Math.imul((n ^ n >>> 13) >>> 0, 1274126177) >>> 0) / 4294967296);
        };

        // Fill shallow water ring
        for (let y = 5; y < ROWS - 5; y++)
            for (let x = 5; x < COLS - 5; x++)
                set(x, y, T.SHALLOW_WATER);

        // Fill center with sand
        for (let y = 8; y < ROWS - 8; y++)
            for (let x = 8; x < COLS - 8; x++)
                set(x, y, T.SAND_FLOOR);

        // Main roads (sand dark)
        // Horizontal main road
        for (let x = 8; x < COLS - 8; x++) {
            set(x, 24, T.SAND_DARK); set(x, 25, T.STONE_FLOOR); set(x, 26, T.SAND_DARK);
        }
        // Vertical main road
        for (let y = 8; y < ROWS - 8; y++) {
            set(29, y, T.SAND_DARK); set(30, y, T.STONE_FLOOR); set(31, y, T.SAND_DARK);
        }

        // --- Central Temple (15x10) ---
        const tx = 23, ty = 18;
        for (let dy = 0; dy < 12; dy++)
            for (let dx = 0; dx < 15; dx++)
                set(tx + dx, ty + dy, T.STONE_FLOOR);
        // Walls
        for (let dx = 0; dx < 15; dx++) {
            set(tx + dx, ty, T.RUIN_WALL, 'objects');
            set(tx + dx, ty + 11, T.RUIN_WALL, 'objects');
        }
        for (let dy = 0; dy < 12; dy++) {
            set(tx, ty + dy, T.RUIN_WALL, 'objects');
            set(tx + 14, ty + dy, T.RUIN_WALL, 'objects');
        }
        // Windows
        set(tx + 3, ty, T.RUIN_WINDOW, 'objects');
        set(tx + 7, ty, T.RUIN_WINDOW, 'objects');
        set(tx + 11, ty, T.RUIN_WINDOW, 'objects');
        // Door opening (remove wall)
        set(tx + 7, ty + 11, 0, 'objects');
        // Interior pillars
        set(tx + 3, ty + 3, T.PILLAR, 'objects');
        set(tx + 11, ty + 3, T.PILLAR, 'objects');
        set(tx + 3, ty + 8, T.PILLAR, 'objects');
        set(tx + 11, ty + 8, T.PILLAR, 'objects');

        // --- Ruined buildings ---
        const ruins = [
            { x: 10, y: 10, w: 6, h: 5 },
            { x: 44, y: 10, w: 7, h: 5 },
            { x: 10, y: 34, w: 6, h: 6 },
            { x: 44, y: 34, w: 7, h: 5 },
            { x: 40, y: 18, w: 5, h: 4 },
            { x: 15, y: 20, w: 5, h: 4 },
        ];
        ruins.forEach(r => {
            for (let dy = 0; dy < r.h; dy++)
                for (let dx = 0; dx < r.w; dx++)
                    set(r.x + dx, r.y + dy, T.STONE_FLOOR);
            for (let dx = 0; dx < r.w; dx++) {
                set(r.x + dx, r.y, T.RUIN_WALL, 'objects');
                if (hash(r.x + dx, r.y + r.h - 1) > 0.3) set(r.x + dx, r.y + r.h - 1, T.RUIN_WALL, 'objects');
            }
            for (let dy = 0; dy < r.h; dy++) {
                set(r.x, r.y + dy, T.RUIN_WALL, 'objects');
                if (hash(r.x + r.w - 1, r.y + dy) > 0.25) set(r.x + r.w - 1, r.y + dy, T.RUIN_WALL, 'objects');
            }
            // Add windows
            set(r.x + Math.floor(r.w / 2), r.y, T.RUIN_WINDOW, 'objects');
        });

        // --- Coral Gardens ---
        const coralSpots = [
            { cx: 14, cy: 14, r: 3 }, { cx: 46, cy: 14, r: 3 },
            { cx: 14, cy: 36, r: 3 }, { cx: 46, cy: 36, r: 3 },
            { cx: 30, cy: 40, r: 4 }, { cx: 20, cy: 30, r: 2 },
            { cx: 40, cy: 30, r: 2 },
        ];
        coralSpots.forEach(spot => {
            for (let dy = -spot.r; dy <= spot.r; dy++) {
                for (let dx = -spot.r; dx <= spot.r; dx++) {
                    if (dx * dx + dy * dy > spot.r * spot.r) continue;
                    const x = spot.cx + dx, y = spot.cy + dy;
                    if (get(x, y) !== T.SAND_FLOOR && get(x, y) !== T.SHALLOW_WATER) continue;
                    const h = hash(x, y, 42);
                    if (h > 0.6) set(x, y, T.CORAL_RED, 'objects');
                    else if (h > 0.3) set(x, y, T.CORAL_GREEN, 'objects');
                }
            }
        });

        // --- Seaweed borders ---
        for (let x = 8; x < COLS - 8; x++) {
            if (hash(x, 8, 55) > 0.5) set(x, 8, T.SEAWEED, 'objects');
            if (hash(x, ROWS - 9, 55) > 0.5) set(x, ROWS - 9, T.SEAWEED, 'objects');
        }
        for (let y = 8; y < ROWS - 8; y++) {
            if (hash(8, y, 55) > 0.5) set(8, y, T.SEAWEED, 'objects');
            if (hash(COLS - 9, y, 55) > 0.5) set(COLS - 9, y, T.SEAWEED, 'objects');
        }

        // --- Scattered pillars ---
        const pillarSpots = [
            [18, 25], [42, 25], [25, 15], [35, 15],
            [25, 35], [35, 35], [12, 25], [48, 25],
        ];
        pillarSpots.forEach(([px, py]) => set(px, py, T.PILLAR, 'objects'));

        // --- Return Portal ---
        const portalX = 30, portalY = 9;
        set(portalX, portalY, T.PORTAL, 'objects');

        // --- Build Tiled JSON ---
        const mapJSON = {
            width: COLS, height: ROWS, tilewidth: TILE, tileheight: TILE,
            orientation: 'orthogonal', renderorder: 'right-down',
            tilesets: [{
                firstgid: 1, name: 'atlantis_tiles', tilewidth: TILE, tileheight: TILE,
                tilecount: tileCount, columns: tsCols,
                image: 'atlantis_tiles',
                imagewidth: tsCols * TILE, imageheight: tsRows * TILE,
                margin: 0, spacing: 0
            }],
            layers: [
                { name: 'Ground', type: 'tilelayer', width: COLS, height: ROWS, data: ground, opacity: 1, visible: true, x: 0, y: 0 },
                { name: 'Objects', type: 'tilelayer', width: COLS, height: ROWS, data: objects, opacity: 1, visible: true, x: 0, y: 0 },
            ]
        };

        // Load map
        if (this.cache.tilemap.exists('atlantis_map')) this.cache.tilemap.remove('atlantis_map');
        this.cache.tilemap.add('atlantis_map', { format: Phaser.Tilemaps.Formats.TILED_JSON, data: mapJSON });

        const map = this.make.tilemap({ key: 'atlantis_map' });
        const tileset = map.addTilesetImage('atlantis_tiles', 'atlantis_tiles');

        const groundLayer = map.createLayer('Ground', tileset, 0, 0);
        const objLayer = map.createLayer('Objects', tileset, 0, 0);
        groundLayer.setDepth(0);
        objLayer.setDepth(3);

        // Collide on ruin walls & pillars
        objLayer.setCollisionByExclusion([-1, 0, T.CORAL_RED, T.CORAL_GREEN, T.SEAWEED, T.PORTAL]);

        // --- Player ---
        this.physics.world.setBounds(0, 0, W, H);
        const spawnX = 30 * TILE + 16;
        const spawnY = 32 * TILE + 16;
        const characterScale = gameState?.characterScale ?? 1;
        const worldMul = gameState?.playerWorldScaleMultiplier ?? 1;
        this.player = new Player(this, spawnX, spawnY, { scale: characterScale * worldMul });
        this.physics.add.collider(this.player, objLayer);

        // Camera
        this.cameras.main.setRoundPixels(true);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
        this.cameras.main.setBounds(0, 0, W, H);
        this.cameras.main.setDeadzone(80, 60);

        // --- Underwater Blue Tint ---
        this.cameras.main.setBackgroundColor('#071e38');
        // Add a subtle blue overlay
        this.blueOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x0a3d6b, 0.25);
        this.blueOverlay.setScrollFactor(0);
        this.blueOverlay.setDepth(100);

        // --- Fade In ---
        this.cameras.main.fadeIn(800, 0, 0, 0);

        // --- "ATLANTIS" Title Splash ---
        const title = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, '🌊 ATLANTIS 🌊', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '28px',
            color: '#00e5ff',
            stroke: '#001a33',
            strokeThickness: 8
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setAlpha(0);

        this.tweens.add({
            targets: title, alpha: 1, y: title.y - 30,
            duration: 1000, ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: title, alpha: 0, y: title.y - 40,
                    duration: 1500, delay: 1200, ease: 'Cubic.easeIn',
                    onComplete: () => title.destroy()
                });
            }
        });

        // --- Bubble Particle System ---
        this.bubbles = [];
        this.bubbleTimer = this.time.addEvent({
            delay: 300,
            loop: true,
            callback: () => this.spawnBubble(W, H)
        });

        // --- Portal Zone ---
        this.portalZone = this.add.rectangle(
            portalX * TILE + 16, portalY * TILE + 16, TILE, TILE, 0x00e5ff, 0
        );
        this.physics.add.existing(this.portalZone, true);

        // Portal glow animation
        this.portalGlow = this.add.circle(portalX * TILE + 16, portalY * TILE + 16, 18, 0x00e5ff, 0.4);
        this.portalGlow.setDepth(2);
        this.tweens.add({
            targets: this.portalGlow,
            scaleX: 1.5, scaleY: 1.5, alpha: 0.1,
            duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // Portal label
        this.portalLabel = this.add.text(portalX * TILE + 16, portalY * TILE - 12, '↑ Return', {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#80f0ff',
            stroke: '#001a33', strokeThickness: 3
        }).setOrigin(0.5).setDepth(110);
        this.tweens.add({ targets: this.portalLabel, y: this.portalLabel.y - 4, duration: 800, yoyo: true, repeat: -1 });

        this.portalTriggered = false;
        this.physics.add.overlap(this.player, this.portalZone, () => {
            if (this.portalTriggered) return;
            this.portalTriggered = true;
            this.player.body.setVelocity(0, 0);
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
                this.scene.start('UIScene');
            });
        });

        // Keyboard
        this.input.keyboard.enabled = true;
        this.input.keyboard.resetKeys();

        // Cleanup on shutdown
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this.bubbleTimer) this.bubbleTimer.destroy();
        });
    }

    spawnBubble(W, H) {
        const x = Phaser.Math.Between(0, W);
        const y = Phaser.Math.Between(100, H);
        const size = Phaser.Math.Between(2, 6);
        const bubble = this.add.circle(x, y, size, 0xaaddff, Phaser.Math.FloatBetween(0.2, 0.6));
        bubble.setDepth(50);
        this.tweens.add({
            targets: bubble,
            y: y - Phaser.Math.Between(150, 400),
            x: x + Phaser.Math.Between(-30, 30),
            alpha: 0,
            duration: Phaser.Math.Between(2000, 5000),
            ease: 'Sine.easeOut',
            onComplete: () => bubble.destroy()
        });
    }

    update() {
        if (this.player) this.player.update();
    }
}
