// ===== BootScene.js =====
// Loads all generated assets and shows loading progress bar

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Loading bar
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.add.rectangle(w / 2, h / 2, w, h, 0x1a1a2e);
        this.add.text(w / 2, h / 2 - 60, '🌍 Design Thinking World', {
            fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#f6c90e'
        }).setOrigin(0.5);
        this.add.text(w / 2, h / 2, 'Loading...', {
            fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#eaeaea'
        }).setOrigin(0.5);

        this.add.rectangle(w / 2, h / 2 + 40, 300, 20, 0x333355);
        const bar = this.add.rectangle(w / 2 - 148, h / 2 + 40, 0, 16, 0x06d6a0).setOrigin(0, 0.5);

        this.load.on('progress', (value) => {
            bar.width = 296 * value;
        });

        // Source sheets provided in /assets (filenames may differ from in-game keys)
        // Note: the tileset image is optional; if it fails to load, the game falls back to a procedural tileset.
        this.load.image('tileset_src', 'assets/Tiles main/1 Tiles/FieldsTileset.png');
        this.load.image('houses_iso', 'assets/Hope.png');
        this.load.image('things_sheet', 'assets/things.png');

        // Player character sheet (used to build player sprite sheets)
        this.load.image('player_sheet', 'assets/character.png');

        // Female character (Valkyrie_3) — use a small subset of frames and build a compact spritesheet at runtime
        // (The source frames are large; we crop to content + downscale into 64x64 frames to match the game.)
        const valkBase = 'assets/Female_Character/Valkyrie_3/PNG/PNG Sequences';
        this.load.image('valk3_idle_0', `${valkBase}/Idle/0_Valkyrie_Idle_000.png`);
        for (let i = 0; i < 6; i++) {
            const idx = String(i).padStart(3, '0');
            this.load.image(`valk3_walk_${i}`, `${valkBase}/Walking/0_Valkyrie_Walking_${idx}.png`);
        }

        // New Custom Player Female Sheet
        this.load.image('female_red', 'assets/Dora.png');

        // NPC sprite strips (converted at runtime into 4-direction sprite sheets)
        for (let i = 1; i <= 4; i++) {
            const base = `assets/NPC's/${i}`;
            this.load.image(`npc${i}_d_idle`, `${base}/D_Idle.png`);
            this.load.image(`npc${i}_d_walk`, `${base}/D_Walk.png`);
            this.load.image(`npc${i}_u_idle`, `${base}/U_Idle.png`);
            this.load.image(`npc${i}_u_walk`, `${base}/U_Walk.png`);
            this.load.image(`npc${i}_s_idle`, `${base}/S_Idle.png`);
            this.load.image(`npc${i}_s_walk`, `${base}/S_Walk.png`);
        }

        // Animals (pets)
        this.load.spritesheet('pet_cat_idle_sheet', 'assets/Animals/Cat/Idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('pet_cat_walk_sheet', 'assets/Animals/Cat/Walk.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('pet_dog_idle_sheet', 'assets/Animals/Dog/Idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('pet_dog_walk_sheet', 'assets/Animals/Dog/Walk.png', { frameWidth: 48, frameHeight: 48 });

        // Load Craftpix Assets (used for shop + decor)
        // These are located under /assets/Tiles main in the current project layout.
        this.load.image('shop_tent', 'assets/Tiles main/2 Objects/6 Tent/2.png');
        this.load.image('decor_cart', 'assets/Tiles main/2 Objects/3 Decor/2.png');
        this.load.image('decor_barrel', 'assets/Tiles main/2 Objects/3 Decor/8.png');
        this.load.image('decor_stone', 'assets/Tiles main/2 Objects/2 Stone/1.png');
        this.load.image('decor_box', 'assets/Tiles main/2 Objects/4 Box/1.png');

        // New Assets
        this.load.spritesheet('bull', 'assets/bull.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('fountain', 'assets/Fountain.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('football_ball_img', 'assets/Football/Ball.png');
        this.load.image('football_goalpost_img', 'assets/Football/GoalPost.png');
        this.load.image('pixel_scenery', 'assets/Combinations/FullSpriteSheetsNoPadding/Scenery/Grass&StoneScenery.png');

        // Task 1 Home Conversation scene background
        this.load.image('home_convo_bg', 'assets/Task_1/Home.png');

        // Additional world textures referenced by newer scenes/zones
        this.load.image('pond', 'assets/Pond.png');
        this.load.image('path_tile', 'assets/Path.png');
        this.load.image('football_ground_img', 'assets/Football/football-ground.png');

        // Tree packs (replace old tile-based trees)
        for (let i = 1; i <= 6; i++) {
            this.load.image(`tree_apple_${i}`, `assets/Trees/PixelAppleTrees/sprite${i}.png`);
        }
        for (let i = 1; i <= 4; i++) {
            this.load.image(`tree_orange_${i}`, `assets/Trees/PixelOrangeTrees/sprite${i}.png`);
        }
        const otherTrees = [
            ['tree_other_1', 'assets/Trees/OtherTrees/free_bundle_3_trees/birch_0.png'],
            ['tree_other_2', 'assets/Trees/OtherTrees/free_bundle_3_trees/birch_1.png'],
            ['tree_other_3', 'assets/Trees/OtherTrees/free_bundle_3_trees/burned_30.png'],
            ['tree_other_4', 'assets/Trees/OtherTrees/free_bundle_3_trees/burned_36.png'],
            ['tree_other_5', 'assets/Trees/OtherTrees/free_bundle_3_trees/conifers_15.png'],
            ['tree_other_6', 'assets/Trees/OtherTrees/free_bundle_3_trees/conifers_4.png'],
            ['tree_other_7', 'assets/Trees/OtherTrees/free_bundle_3_trees/conifers_5.png'],
            ['tree_other_8', 'assets/Trees/OtherTrees/free_bundle_3_trees/sequoia_cedar_1.png'],
        ];
        otherTrees.forEach(([key, path]) => this.load.image(key, path));

        // Grass textures
        this.load.image('grass_tex_8', 'assets/Grass/ground_grass_gen_08.png');
    }

    create() {
        // --- Generate tileset (from provided tileset source image when available) ---
        const tilesetSourceImg = this.textures.get('tileset_src')?.getSourceImage?.();
        const grassTextures = [this.textures.get('grass_tex_8')?.getSourceImage?.()].filter(Boolean);
        const tilesetResult = generateTilesetImage(tilesetSourceImg, grassTextures);
        this.textures.addCanvas('village-tiles', tilesetResult.canvas);

        // --- Generate map JSON ---
        const mapData = generateMapJSON();
        this.cache.tilemap.add('map', { format: Phaser.Tilemaps.Formats.TILED_JSON, data: mapData.json });
        // Store image objects data globally or in registry so we can fetch them in GameScene
        this.registry.set('imageObjects', mapData.imageObjects);

        // --- Create required house textures from the Isometric assets ---
        const makeHouseCrop = (srcKey, destKey, sx, sy, sw, sh) => {
            const img = this.textures.get(srcKey)?.getSourceImage?.();
            if (!img) return;
            const canvas = document.createElement('canvas');
            canvas.width = sw;
            canvas.height = sh;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, sw, sh);
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

            // Remove magenta guide-outline pixels from this spritesheet for cleaner rendering.
            const imgData = ctx.getImageData(0, 0, sw, sh);
            const d = imgData.data;
            for (let i = 0; i < d.length; i += 4) {
                const r = d[i];
                const g = d[i + 1];
                const b = d[i + 2];
                if (r > 180 && b > 170 && g < 140) {
                    d[i + 3] = 0;
                }
            }
            ctx.putImageData(imgData, 0, 0);

            if (this.textures.exists(destKey)) this.textures.remove(destKey);
            this.textures.addCanvas(destKey, canvas);
        };

        // Using precise cutouts from assets/Hope.png spritesheet
        makeHouseCrop('houses_iso', 'house1', 157, 4, 157, 104); // Town hall style
        makeHouseCrop('houses_iso', 'house2', 326, 4, 113, 103); // Colorful row house
        makeHouseCrop('houses_iso', 'house3', 12, 21, 139, 80); // Street-front row building
        makeHouseCrop('houses_iso', 'house4', 279, 106, 90, 109); // Tavern-style building
        makeHouseCrop('houses_iso', 'house5', 319, 215, 127, 112); // Wooden house

        // --- Build humanoid sprite sheets from provided assets ---
        // We standardize humanoids to: 4 rows (down/left/right/up) × 7 columns
        // Column 0 = idle frame, columns 1-6 = walk frames.
        const HUMANOID_FRAMES_PER_DIR = 7;

        const addSpriteSheetFromCanvas = (key, canvas, frameWidth, frameHeight) => {
            if (this.textures.exists(key)) this.textures.remove(key);
            this.textures.addSpriteSheet(key, canvas, { frameWidth, frameHeight });
        };

        const buildSheetFromCharacterBlock = (srcImg, rowStart, colStart, frameW, frameH) => {
            const canvas = document.createElement('canvas');
            canvas.width = HUMANOID_FRAMES_PER_DIR * frameW;
            canvas.height = 4 * frameH;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Re-map standard character template rows (Up, Left, Down, Right) 
            // to our expected directions (Down, Left, Right, Up)
            const rowMap = [2, 1, 3, 0];

            for (let dir = 0; dir < 4; dir++) {
                for (let col = 0; col < HUMANOID_FRAMES_PER_DIR; col++) {
                    const sourceRow = rowMap[dir];
                    const sx = (colStart + col) * frameW;
                    const sy = (rowStart + sourceRow) * frameH;
                    const dx = col * frameW;
                    const dy = dir * frameH;
                    ctx.drawImage(srcImg, sx, sy, frameW, frameH, dx, dy, frameW, frameH);
                }
            }
            return canvas;
        };

        const buildSheetFromNpcPack = (setNum, frameW = 48, frameH = 48) => {
            const getImg = (k) => this.textures.get(k)?.getSourceImage?.();

            const dIdle = getImg(`npc${setNum}_d_idle`);
            const dWalk = getImg(`npc${setNum}_d_walk`);
            const uIdle = getImg(`npc${setNum}_u_idle`);
            const uWalk = getImg(`npc${setNum}_u_walk`);
            const sIdle = getImg(`npc${setNum}_s_idle`);
            const sWalk = getImg(`npc${setNum}_s_walk`);

            if (!dIdle || !dWalk || !uIdle || !uWalk || !sIdle || !sWalk) return null;

            const canvas = document.createElement('canvas');
            canvas.width = HUMANOID_FRAMES_PER_DIR * frameW;
            canvas.height = 4 * frameH;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const drawFrame = (img, sx, sy, dx, dy, flipX = false) => {
                if (!flipX) {
                    ctx.drawImage(img, sx, sy, frameW, frameH, dx, dy, frameW, frameH);
                    return;
                }
                ctx.save();
                ctx.translate(dx + frameW, dy);
                ctx.scale(-1, 1);
                ctx.drawImage(img, sx, sy, frameW, frameH, 0, 0, frameW, frameH);
                ctx.restore();
            };

            const drawDir = (rowIndex, idleImg, walkImg, flipX) => {
                // Column 0: idle frame (use first frame)
                drawFrame(idleImg, 0, 0, 0, rowIndex * frameH, flipX);
                // Columns 1-6: walk frames 0-5
                for (let i = 0; i < 6; i++) {
                    drawFrame(walkImg, i * frameW, 0, (i + 1) * frameW, rowIndex * frameH, flipX);
                }
            };

            // down, left (flipped side), right (side), up
            drawDir(0, dIdle, dWalk, false);
            drawDir(1, sIdle, sWalk, true);
            drawDir(2, sIdle, sWalk, false);
            drawDir(3, uIdle, uWalk, false);

            return canvas;
        };

        // Player sheets from character.png (64x64 grid)
        const playerSheetImg = this.textures.get('player_sheet')?.getSourceImage?.();
        if (playerSheetImg) {
            // The previous "female" option was actually a male character in the sheet.
            // Use it as the main male character.
            addSpriteSheetFromCanvas('player_male', buildSheetFromCharacterBlock(playerSheetImg, 8, 0, 64, 64), 64, 64);
        }

        // Build player_female from Valkyrie_3 frames (single-direction art; we mirror for left)
        const getImg = (k) => this.textures.get(k)?.getSourceImage?.();
        const valkIdle = getImg('valk3_idle_0');
        const valkWalk = Array.from({ length: 6 }, (_, i) => getImg(`valk3_walk_${i}`)).filter(Boolean);

        const scanAlphaBounds = (data, width, height, alphaThreshold, step) => {
            let minX = width;
            let minY = height;
            let maxX = -1;
            let maxY = -1;

            for (let y = 0; y < height; y += step) {
                for (let x = 0; x < width; x += step) {
                    const a = data[(y * width + x) * 4 + 3];
                    if (a <= alphaThreshold) continue;
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }

            const hasPixels = !(maxX < minX || maxY < minY);
            return { minX, minY, maxX, maxY, hasPixels };
        };

        const padBounds = (bounds, width, height) => {
            if (!bounds.hasPixels) return { x: 0, y: 0, w: width, h: height };
            const pad = Math.max(8, Math.floor(Math.min(width, height) * 0.02));
            const minX = Math.max(0, bounds.minX - pad);
            const minY = Math.max(0, bounds.minY - pad);
            const maxX = Math.min(width - 1, bounds.maxX + pad);
            const maxY = Math.min(height - 1, bounds.maxY + pad);
            return { x: minX, y: minY, w: (maxX - minX + 1), h: (maxY - minY + 1) };
        };

        const computeAlphaBounds = (img, alphaThreshold = 10, step = 2) => {
            if (!img?.width || !img?.height) return { x: 0, y: 0, w: 0, h: 0 };
            const c = document.createElement('canvas');
            c.width = img.width;
            c.height = img.height;

            const cctx = c.getContext('2d');
            if (!cctx) return { x: 0, y: 0, w: c.width, h: c.height };
            cctx.clearRect(0, 0, c.width, c.height);
            cctx.drawImage(img, 0, 0);

            const imageData = cctx.getImageData(0, 0, c.width, c.height);
            const rawBounds = scanAlphaBounds(imageData.data, c.width, c.height, alphaThreshold, step);
            return padBounds(rawBounds, c.width, c.height);
        };

        const buildSheetFromSingleDirFrames = (idleImg, walkImgs, outW = 64, outH = 64) => {
            if (!idleImg || !walkImgs || walkImgs.length < 6) return null;

            // Use bounds from the first walking frame for consistent cropping across frames.
            const bounds = computeAlphaBounds(walkImgs[0]);
            const canvas = document.createElement('canvas');
            canvas.width = HUMANOID_FRAMES_PER_DIR * outW;
            canvas.height = 4 * outH;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = true;

            const drawFrame = (img, col, row, flipX = false) => {
                const cellX = col * outW;
                const cellY = row * outH;

                const sx = bounds.x;
                const sy = bounds.y;
                const sw = Math.max(1, bounds.w);
                const sh = Math.max(1, bounds.h);

                const padding = 4;
                const maxW = outW - padding;
                const maxH = outH - padding;
                const scale = Math.min(maxW / sw, maxH / sh);
                const dw = Math.max(1, Math.floor(sw * scale));
                const dh = Math.max(1, Math.floor(sh * scale));
                const dx = cellX + Math.floor((outW - dw) / 2);
                const dy = cellY + Math.floor((outH - dh) / 2);

                if (!flipX) {
                    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
                    return;
                }

                ctx.save();
                ctx.translate(dx + dw, dy);
                ctx.scale(-1, 1);
                ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
                ctx.restore();
            };

            const drawDir = (rowIndex, flipX) => {
                drawFrame(idleImg, 0, rowIndex, flipX);
                for (let i = 0; i < 6; i++) {
                    drawFrame(walkImgs[i], i + 1, rowIndex, flipX);
                }
            };

            // down, left (mirrored), right, up
            drawDir(0, false);
            drawDir(1, true);
            drawDir(2, false);
            drawDir(3, false);

            return canvas;
        };

        const buildSheetFrom3ColBlock = (srcImg, frameW = 32, frameH = 32) => {
            const canvas = document.createElement('canvas');
            canvas.width = HUMANOID_FRAMES_PER_DIR * frameW;
            canvas.height = 4 * frameH;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Sequence of columns from a 3-col input to map to a 7-col uniform walk cycle
            // Input cols: 0(left foot), 1(idle), 2(right foot)
            const colMap = [1, 2, 1, 0, 1, 2, 1];

            // Standard RPG maker rows: 0=Down, 1=Left, 2=Right, 3=Up
            for (let dir = 0; dir < 4; dir++) {
                for (let col = 0; col < HUMANOID_FRAMES_PER_DIR; col++) {
                    const sx = colMap[col] * frameW;
                    const sy = dir * frameH;
                    const dx = col * frameW;
                    const dy = dir * frameH;
                    ctx.drawImage(srcImg, sx, sy, frameW, frameH, dx, dy, frameW, frameH);
                }
            }
            return canvas;
        };

        const redGirlImg = this.textures.get('female_red')?.getSourceImage?.();
        const femaleCanvas = buildSheetFromSingleDirFrames(valkIdle, valkWalk, 64, 64);

        if (redGirlImg) {
            addSpriteSheetFromCanvas('player_female', buildSheetFrom3ColBlock(redGirlImg, 32, 32), 32, 32);
        } else if (femaleCanvas) {
            addSpriteSheetFromCanvas('player_female', femaleCanvas, 64, 64);
        } else if (playerSheetImg) {
            // Fallback: use the first block from character.png if Valkyrie assets are missing
            addSpriteSheetFromCanvas('player_female', buildSheetFromCharacterBlock(playerSheetImg, 0, 0, 64, 64), 64, 64);
        }

        // NPC keys used by the game (mapped onto the 4 provided NPC sets)
        const npcKeyToSet = {
            guide: 1,
            shopkeeper: 2,
            villager1: 3,
            villager2: 4,
            villager3: 3,
            task1: 1,
            task2: 2,
            task3a: 3,
            task3b: 4,
            task4: 1,
        };

        const buildNpcSheets = () => {
            Object.entries(npcKeyToSet).forEach(([key, setNum]) => {
                const canvas = buildSheetFromNpcPack(setNum, 48, 48);
                if (!canvas) return;
                addSpriteSheetFromCanvas(key, canvas, 48, 48);
            });
        };

        buildNpcSheets();

        // Generate exclamation mark
        const exclCanvas = generateExclamationTexture();
        this.textures.addCanvas('exclamation', exclCanvas);

        const createHumanoidAnimations = () => {
            const spriteKeys = ['player_male', 'player_female', ...Object.keys(npcKeyToSet)];
            const dirs = ['down', 'left', 'right', 'up'];

            for (const key of spriteKeys) {
                if (!this.textures.exists(key)) continue;
                for (let d = 0; d < 4; d++) {
                    const base = d * HUMANOID_FRAMES_PER_DIR;
                    const walkStart = base + 1;
                    const walkEnd = base + HUMANOID_FRAMES_PER_DIR - 1;
                    const idleFrame = base;

                    if (!this.anims.exists(`${key}_${dirs[d]}`)) {
                        this.anims.create({
                            key: `${key}_${dirs[d]}`,
                            frames: this.anims.generateFrameNumbers(key, { start: walkStart, end: walkEnd }),
                            frameRate: 10,
                            repeat: -1
                        });
                    }

                    if (!this.anims.exists(`${key}_idle_${dirs[d]}`)) {
                        this.anims.create({
                            key: `${key}_idle_${dirs[d]}`,
                            frames: [{ key, frame: idleFrame }],
                            frameRate: 1
                        });
                    }
                }
            }
        };

        const createPetAnimations = () => {
            if (!this.anims.exists('pet_cat_idle')) {
                this.anims.create({ key: 'pet_cat_idle', frames: this.anims.generateFrameNumbers('pet_cat_idle_sheet', { start: 0, end: 3 }), frameRate: 5, repeat: -1 });
            }
            if (!this.anims.exists('pet_cat_walk')) {
                this.anims.create({ key: 'pet_cat_walk', frames: this.anims.generateFrameNumbers('pet_cat_walk_sheet', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
            }
            if (!this.anims.exists('pet_dog_idle')) {
                this.anims.create({ key: 'pet_dog_idle', frames: this.anims.generateFrameNumbers('pet_dog_idle_sheet', { start: 0, end: 3 }), frameRate: 5, repeat: -1 });
            }
            if (!this.anims.exists('pet_dog_walk')) {
                this.anims.create({ key: 'pet_dog_walk', frames: this.anims.generateFrameNumbers('pet_dog_walk_sheet', { start: 0, end: 5 }), frameRate: 10, repeat: -1 });
            }
        };

        const createExtraAnimations = () => {
            if (!this.anims.exists('bull_anim')) {
                this.anims.create({ key: 'bull_anim', frames: this.anims.generateFrameNumbers('bull', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
            }
            if (!this.anims.exists('fountain_anim')) {
                this.anims.create({ key: 'fountain_anim', frames: this.anims.generateFrameNumbers('fountain', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
            }
        };

        createHumanoidAnimations();
        createPetAnimations();
        createExtraAnimations();

        this.scene.start('CharSelectScene');
    }
}
