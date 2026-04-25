// ===== BootScene.js =====
// Loads all generated assets and shows loading progress bar

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const ASSET_V = '20260417';

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


        // Houses (replace old assets/Hope.png crops)
        for (let i = 1; i <= 9; i++) {
            this.load.image(`house${i}_src`, `assets/Houses/house${i}.png?v=${ASSET_V}`);
        }
        for (let i = 10; i <= 29; i++) {
            this.load.image(`house${i}`, `assets/Houses/house${i}.png?v=${ASSET_V}`);
        }
        for (let i = 1; i <= 4; i++) {
            this.load.image(`fence${i}`, `assets/Houses/fence${i}.png?v=${ASSET_V}`);
        }

        // River & Bridge
        this.load.image('river_img', `assets/Bridge Path/river.png?v=${ASSET_V}`);
        this.load.image('bridge_img', `assets/Bridge Path/bridge.png?v=${ASSET_V}`);

        // Flowers
        this.load.image('flowers_sheet', 'assets/Flowers.png');

        // Player character sheet (used to build player sprite sheets)
        this.load.image('player_sheet', 'assets/character.png');


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

        // Extra animals referenced by generated map imageObjects
        this.load.spritesheet('animal_bird_idle_sheet', 'assets/Animals/Bird/Idle.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('animal_bird_walk_sheet', 'assets/Animals/Bird/Walk.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('animal_bird2_idle_sheet', 'assets/Animals/Bird 2/Idle.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('animal_bird2_walk_sheet', 'assets/Animals/Bird 2/Walk.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('animal_rat_idle_sheet', 'assets/Animals/Rat/Idle.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('animal_rat_walk_sheet', 'assets/Animals/Rat/Walk.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('animal_rat2_idle_sheet', 'assets/Animals/Rat 2/Idle.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('animal_rat2_walk_sheet', 'assets/Animals/Rat 2/Walk.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('animal_cat2_idle_sheet', 'assets/Animals/Cat 2/Idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('animal_cat2_walk_sheet', 'assets/Animals/Cat 2/Walk.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('animal_dog2_idle_sheet', 'assets/Animals/Dog 2/Idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('animal_dog2_walk_sheet', 'assets/Animals/Dog 2/Walk.png', { frameWidth: 48, frameHeight: 48 });

        // Load Craftpix Assets (used for shop + decor)
        // These are located under /assets/Tiles main in the current project layout.
        this.load.image('shop_tent', 'assets/Tiles main/2 Objects/6 Tent/2.png');
        this.load.image('decor_cart', 'assets/Tiles main/2 Objects/3 Decor/2.png');
        this.load.image('decor_barrel', 'assets/Tiles main/2 Objects/3 Decor/8.png');
        this.load.image('decor_stone', 'assets/Tiles main/2 Objects/2 Stone/1.png');
        this.load.image('decor_box', 'assets/Tiles main/2 Objects/4 Box/1.png');

        // New Assets
        // Cow spritesheet source (we slice frames at runtime because this sheet includes labels/margins)
        this.load.image('cow_sheet_src', `assets/cow_sprite.png?v=${ASSET_V}`);
        this.load.spritesheet('fountain', 'assets/Fountain.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('football_ball_img', 'assets/Football/Ball.png');
        this.load.image('football_goalpost_img', 'assets/Football/GoalPost.png');
        this.load.image('pixel_scenery', 'assets/Combinations/FullSpriteSheetsNoPadding/Scenery/Grass&StoneScenery.png');

        // Task 1 Home Conversation scene background
        this.load.image('home_convo_bg', `assets/Task_1/Home.png?v=${ASSET_V}`);

        // School assets
        this.load.image('school_src', `assets/School/School.png?v=${ASSET_V}`);
        this.load.image('class_src', `assets/School/Class.png?v=${ASSET_V}`);

        // Additional world textures referenced by newer scenes/zones
        // Pond is a static image (no animation)
        this.load.image('pond', `assets/Pond.png?v=${ASSET_V}`);
        this.load.image('park_location_img', `assets/Park/Park.png?v=${ASSET_V}_park5`);
        this.load.image('path_tile', 'assets/Path.png');
        this.load.image('football_ground_img', `assets/Football/football-ground.png?v=${ASSET_V}`);

        // Trees (replace old PixelAppleTrees/PixelOrangeTrees/OtherTrees)
        for (let i = 1; i <= 12; i++) {
            this.load.image(`tree${i}_src`, `assets/Trees/Tree${i}.png?v=${ASSET_V}`);
        }

        // Grass textures
        this.load.image('grass_tex_8', 'assets/Grass/ground_grass_gen_08.png');

        // Ironman character (4x4 sheet, 64x64 frames)
        // Ironman character (4x4 sheet)
        // sprite-sheet-4x4-transparent.png is 2048x2048 => 512x512 per frame
        // sprite-sheet-4x4-removebg-preview.png is 500x500 => 125x125 per frame
        // Use the transparent sheet by default for clean indexing + consistent frame sizing.
        this.load.spritesheet(
            'ironman',
            "assets/NPC's/ironman.png/sprite-sheet-4x4-transparent.png",
            { frameWidth: 512, frameHeight: 512 }
        );

        // Add error handler for preload failures
        this.load.on('loaderror', (file) => {
            console.error(`⚠️ Failed to load: ${file.key} from ${file.url}`);
        });
    }

    create() {
        console.log('🔧 BootScene.create() starting...');
        
        // Debug: Check NPC texture availability
        console.log('📦 Checking NPC textures at create():');
        for (let i = 1; i <= 4; i++) {
            const d_idle_exists = this.textures.exists(`npc${i}_d_idle`);
            const d_walk_exists = this.textures.exists(`npc${i}_d_walk`);
            console.log(`  NPC${i}: d_idle=${d_idle_exists}, d_walk=${d_walk_exists}`);
        }
        
        // Clear caches
        if (this.cache.tilemap.exists('map')) this.cache.tilemap.remove('map');
        if (this.textures.exists('village-tiles')) this.textures.remove('village-tiles');
        // --- Generate tileset (from provided tileset source image when available) ---
        const tilesetSourceImg = this.textures.get('tileset_src')?.getSourceImage?.();
        const grassTextures = [this.textures.get('grass_tex_8')?.getSourceImage?.()].filter(Boolean);
        const pathSrc = this.textures.get('path_tile')?.getSourceImage?.();

        // Normalize Path.png (key out near-black background, crop to content, scale to tile size)
        let croppedPathTexture = null;
        if (pathSrc && pathSrc.width > 0) {
            const pc = document.createElement('canvas');
            pc.width = pathSrc.width;
            pc.height = pathSrc.height;
            const pctx = pc.getContext('2d', { willReadFrequently: true });
            pctx.drawImage(pathSrc, 0, 0);

            const imageData = pctx.getImageData(0, 0, pc.width, pc.height);
            const pdata = imageData.data;
            const blackThreshold = 12;

            let minX = pc.width, maxX = -1, minY = pc.height, maxY = -1;
            for (let y = 0; y < pc.height; y++) {
                for (let x = 0; x < pc.width; x++) {
                    const idx = (y * pc.width + x) * 4;
                    const r = pdata[idx];
                    const g = pdata[idx + 1];
                    const b = pdata[idx + 2];
                    const a = pdata[idx + 3];

                    if (a > 20 && r <= blackThreshold && g <= blackThreshold && b <= blackThreshold) {
                        pdata[idx + 3] = 0;
                        continue;
                    }

                    if (pdata[idx + 3] > 20) {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            pctx.putImageData(imageData, 0, 0);

            let sourceCanvas = pc;
            if (maxX >= minX && maxY >= minY) {
                const cw = maxX - minX + 1;
                const ch = maxY - minY + 1;
                
                // Inset the crop by 20% on all sides to completely remove the jagged dark border
                // of the original Path.png asset, leaving only the seamless dirt texture.
                const insetX = Math.floor(cw * 0.20);
                const insetY = Math.floor(ch * 0.20);
                
                const finalX = minX + insetX;
                const finalY = minY + insetY;
                const finalW = Math.max(1, cw - (insetX * 2));
                const finalH = Math.max(1, ch - (insetY * 2));

                const cropped = document.createElement('canvas');
                cropped.width = finalW;
                cropped.height = finalH;
                const cctx = cropped.getContext('2d');
                cctx.drawImage(pc, finalX, finalY, finalW, finalH, 0, 0, finalW, finalH);
                sourceCanvas = cropped;
            }

            const tile = document.createElement('canvas');
            tile.width = 32;
            tile.height = 32;
            const tctx = tile.getContext('2d');
            tctx.imageSmoothingEnabled = false;
            tctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, 32, 32);

            croppedPathTexture = tile;
            if (this.textures.exists('path_tile')) this.textures.remove('path_tile');
            this.textures.addCanvas('path_tile', tile);
        }

        const tilesetResult = generateTilesetImage(tilesetSourceImg, grassTextures, croppedPathTexture);
        this.textures.addCanvas('village-tiles', tilesetResult.canvas);

        // Store extrusion metadata so GameScene can configure the tileset correctly
        this.registry.set('tilesetMeta', {
            margin: tilesetResult.margin || 0,
            spacing: tilesetResult.spacing || 0
        });

        // --- Generate map JSON ---
        const mapData = generateMapJSON(tilesetResult.margin, tilesetResult.spacing);
        this.cache.tilemap.add('map', { format: Phaser.Tilemaps.Formats.TILED_JSON, data: mapData.json });
        // Store image objects data globally or in registry so we can fetch them in GameScene
        this.registry.set('imageObjects', mapData.imageObjects);

        const getAlphaBounds = (data, w, h, alphaThreshold = 1) => {
            let minX = w;
            let minY = h;
            let maxX = -1;
            let maxY = -1;

            for (let i = 3; i < data.length; i += 4) {
                if (data[i] < alphaThreshold) continue;
                const px = (i - 3) / 4;
                const x = px % w;
                const y = Math.floor(px / w);
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }

            if (maxX < 0) return null;
            return {
                minX,
                minY,
                trimW: maxX - minX + 1,
                trimH: maxY - minY + 1
            };
        };

        const createContainedCanvas = (srcCanvas, bounds, outW, outH) => {
            const outCanvas = document.createElement('canvas');
            outCanvas.width = outW;
            outCanvas.height = outH;
            const outCtx = outCanvas.getContext('2d');
            outCtx.imageSmoothingEnabled = false;
            outCtx.clearRect(0, 0, outW, outH);

            const scale = Math.min(outW / bounds.trimW, outH / bounds.trimH);
            const drawW = Math.max(1, Math.round(bounds.trimW * scale));
            const drawH = Math.max(1, Math.round(bounds.trimH * scale));
            const dx = Math.floor((outW - drawW) / 2);
            const dy = Math.floor((outH - drawH) / 2);

            outCtx.drawImage(
                srcCanvas,
                bounds.minX,
                bounds.minY,
                bounds.trimW,
                bounds.trimH,
                dx,
                dy,
                drawW,
                drawH
            );

            return outCanvas;
        };

        const publishCanvasTexture = (destKey, canvas) => {
            if (this.textures.exists(destKey)) this.textures.remove(destKey);
            this.textures.addCanvas(destKey, canvas);
        };

        // --- Auto-Extract Flowers from Flowers.png ---
        const fSheet = this.textures.get('flowers_sheet')?.getSourceImage();
        if (fSheet && fSheet.width > 0) {
            const fCanvas = document.createElement('canvas');
            fCanvas.width = fSheet.width;
            fCanvas.height = fSheet.height;
            const fCtx = fCanvas.getContext('2d', { willReadFrequently: true });
            fCtx.drawImage(fSheet, 0, 0);
            const fData = fCtx.getImageData(0,0,fCanvas.width,fCanvas.height).data;
            
            // Simple grid-based heuristic extractor
            let flowerCount = 0;
            const size = 48; // Max size of a flower patch
            for (let y = 0; y < fCanvas.height; y += size/2) {
                for (let x = 0; x < fCanvas.width; x += size/2) {
                    let colored = 0, black = 0, alpha = 0;
                    for (let dy = 0; dy < size; dy++) {
                        for (let dx = 0; dx < size; dx++) {
                            if (y+dy >= fCanvas.height || x+dx >= fCanvas.width) continue;
                            const idx = ((y+dy)*fCanvas.width + (x+dx))*4;
                            if (fData[idx+3] > 20) {
                                alpha++;
                                if (fData[idx] < 40 && fData[idx+1] < 40 && fData[idx+2] < 40) black++;
                                else colored++;
                            }
                        }
                    }
                    // Is it mostly colored pixels (not black text) and has some substance?
                    if (alpha > 40 && colored > alpha * 0.7) {
                        flowerCount++;
                        const out = document.createElement('canvas');
                        out.width = size; out.height = size;
                        out.getContext('2d').drawImage(fCanvas, x, y, size, size, 0, 0, size, size);
                        publishCanvasTexture(`flower_ext_${flowerCount}`, out);
                        // Skip ahead to avoid overlapping extracts
                        x += size/2; 
                    }
                }
            }
            this.registry.set('flowerCount', flowerCount);
        }

        // Trim+contain a source image into a fixed output size (preserves aspect ratio).
        const makeTrimmedContainedTexture = (srcKey, destKey, outW, outH, alphaThreshold = 1) => {
            const srcImg = this.textures.get(srcKey)?.getSourceImage?.();
            if (!srcImg) return;

            const srcCanvas = document.createElement('canvas');
            srcCanvas.width = srcImg.width;
            srcCanvas.height = srcImg.height;
            const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
            srcCtx.imageSmoothingEnabled = false;
            srcCtx.clearRect(0, 0, srcCanvas.width, srcCanvas.height);
            srcCtx.drawImage(srcImg, 0, 0);

            const { data } = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
            const bounds = getAlphaBounds(data, srcCanvas.width, srcCanvas.height, alphaThreshold);
            if (!bounds) return;

            publishCanvasTexture(destKey, createContainedCanvas(srcCanvas, bounds, outW, outH));
        };

        // Ironman directional animations (4x4 spritesheet: 16 frames total)
        // Row 0: Down (frames 0-3)
        // Row 1: Left (frames 4-7)
        // Row 2: Right (frames 8-11)
        // Row 3: Up (frames 12-15)
        
        if (!this.anims.exists('ironman_down')) {
            this.anims.create({
                key: 'ironman_down',
                frames: this.anims.generateFrameNumbers('ironman', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.anims.exists('ironman_left')) {
            this.anims.create({
                key: 'ironman_left',
                frames: this.anims.generateFrameNumbers('ironman', { start: 4, end: 7 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.anims.exists('ironman_right')) {
            this.anims.create({
                key: 'ironman_right',
                frames: this.anims.generateFrameNumbers('ironman', { start: 8, end: 11 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.anims.exists('ironman_up')) {
            this.anims.create({
                key: 'ironman_up',
                frames: this.anims.generateFrameNumbers('ironman', { start: 12, end: 15 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Ironman idle animations (first frame of each direction)
        if (!this.anims.exists('ironman_idle_down')) {
            this.anims.create({
                key: 'ironman_idle_down',
                frames: [{ key: 'ironman', frame: 0 }],
                frameRate: 1
            });
        }

        if (!this.anims.exists('ironman_idle_left')) {
            this.anims.create({
                key: 'ironman_idle_left',
                frames: [{ key: 'ironman', frame: 4 }],
                frameRate: 1
            });
        }

        if (!this.anims.exists('ironman_idle_right')) {
            this.anims.create({
                key: 'ironman_idle_right',
                frames: [{ key: 'ironman', frame: 8 }],
                frameRate: 1
            });
        }

        if (!this.anims.exists('ironman_idle_up')) {
            this.anims.create({
                key: 'ironman_idle_up',
                frames: [{ key: 'ironman', frame: 12 }],
                frameRate: 1
            });
        }

        // Build the in-game house textures from the new PNGs while keeping the same
        // output dimensions as the previous map layout/collision geometry.
        makeTrimmedContainedTexture('house1_src', 'house1', 157, 104);
        makeTrimmedContainedTexture('house2_src', 'house2', 113, 103);
        makeTrimmedContainedTexture('house3_src', 'house3', 139, 80);
        makeTrimmedContainedTexture('house4_src', 'house4', 90, 109);
        makeTrimmedContainedTexture('house5_src', 'house5', 127, 112);

        // Extra houses for decorative duplicates / future use
        makeTrimmedContainedTexture('house6_src', 'house6', 139, 80);
        makeTrimmedContainedTexture('house7_src', 'house7', 90, 109);
        makeTrimmedContainedTexture('house8_src', 'house8', 113, 103);
        makeTrimmedContainedTexture('house9_src', 'house9', 157, 104);

        // Build the in-game tree textures from Tree1..Tree12.
        // Use a consistent output size so map placement + collision bounds remain stable.
        const TREE_OUT_W = 128;
        const TREE_OUT_H = 128;
        makeTrimmedContainedTexture('tree1_src', 'tree_apple_1', TREE_OUT_W, TREE_OUT_H);
        makeTrimmedContainedTexture('tree2_src', 'tree_apple_2', TREE_OUT_W, TREE_OUT_H);
        makeTrimmedContainedTexture('tree3_src', 'tree_apple_3', TREE_OUT_W, TREE_OUT_H);
        makeTrimmedContainedTexture('tree4_src', 'tree_apple_4', TREE_OUT_W, TREE_OUT_H);
        makeTrimmedContainedTexture('tree5_src', 'tree_apple_5', TREE_OUT_W, TREE_OUT_H);
        makeTrimmedContainedTexture('tree6_src', 'tree_apple_6', TREE_OUT_W, TREE_OUT_H);

        makeTrimmedContainedTexture('tree7_src', 'tree_orange_1', TREE_OUT_W, TREE_OUT_H);
        makeTrimmedContainedTexture('tree8_src', 'tree_orange_2', TREE_OUT_W, TREE_OUT_H);
        makeTrimmedContainedTexture('tree9_src', 'tree_orange_3', TREE_OUT_W, TREE_OUT_H);
        makeTrimmedContainedTexture('tree10_src', 'tree_orange_4', TREE_OUT_W, TREE_OUT_H);

        makeTrimmedContainedTexture('tree11_src', 'tree_other_1', TREE_OUT_W, TREE_OUT_H);
        makeTrimmedContainedTexture('tree12_src', 'tree_other_2', TREE_OUT_W, TREE_OUT_H);

        // Match the previous 'house5' placement size (127x112) so the School acts as that location.
        makeTrimmedContainedTexture('school_src', 'school_building', 127, 112);

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
            const getImg = (k) => {
                try {
                    const tex = this.textures.get(k);
                    if (!tex) {
                        console.warn(`  ❌ Texture not found: ${k}`);
                        return null;
                    }
                    const img = tex.getSourceImage?.();
                    if (!img) {
                        console.warn(`  ❌ No source image for texture: ${k}`);
                        return null;
                    }
                    console.log(`  ✓ Loaded ${k}: ${img.width}x${img.height}`);
                    return img;
                } catch (e) {
                    console.error(`  💥 Error getting image ${k}:`, e.message);
                    return null;
                }
            };

            console.log(`Building NPC sheet for set ${setNum}...`);
            const dIdle = getImg(`npc${setNum}_d_idle`);
            const dWalk = getImg(`npc${setNum}_d_walk`);
            const uIdle = getImg(`npc${setNum}_u_idle`);
            const uWalk = getImg(`npc${setNum}_u_walk`);
            const sIdle = getImg(`npc${setNum}_s_idle`);
            const sWalk = getImg(`npc${setNum}_s_walk`);

            if (!dIdle || !dWalk || !uIdle || !uWalk || !sIdle || !sWalk) {
                console.warn(`⚠️ Missing NPC assets for set ${setNum}:`, {
                    dIdle: !!dIdle,
                    dWalk: !!dWalk,
                    uIdle: !!uIdle,
                    uWalk: !!uWalk,
                    sIdle: !!sIdle,
                    sWalk: !!sWalk
                });
                return null;
            }

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

        // Build player_female from Dora.png or fallback to player_male
        // (Valkyrie assets don't exist, so we skip them)
        const getImg = (k) => this.textures.get(k)?.getSourceImage?.();
        const valkIdle = null;
        const valkWalk = [];

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
            villager4: 4,  // Added for compatibility with expanded NPC lists
            task1: 1,
            task2: 2,
            task3: 3,
            task3a: 3,
            task3b: 4,
            task4: 1,
        };

        const createPlaceholderSheet = (color = '#ff00ff', w = 48, h = 48) => {
            const canvas = document.createElement('canvas');
            canvas.width = HUMANOID_FRAMES_PER_DIR * w;
            canvas.height = 4 * h;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', canvas.width / 2, canvas.height / 2);
            return canvas;
        };

        const buildNpcSheets = () => {
            console.log('🎨 Building NPC sheets...');
            Object.entries(npcKeyToSet).forEach(([key, setNum]) => {
                const canvas = buildSheetFromNpcPack(setNum, 48, 48);
                if (!canvas) {
                    console.warn(`⚠️ NPC sheet creation failed for ${key} (set ${setNum}), using placeholder`);
                    const placeholderCanvas = createPlaceholderSheet('#8800ff');
                    addSpriteSheetFromCanvas(key, placeholderCanvas, 48, 48);
                    console.log(`  📍 Placeholder created for ${key}`);
                    return;
                }
                addSpriteSheetFromCanvas(key, canvas, 48, 48);
                console.log(`✅ NPC sheet created: ${key}`);
            });
            console.log('🎨 NPC sheet building complete');
        };

        buildNpcSheets();

        // Debug: Check which NPC textures were successfully created
        console.log('🔍 NPC Texture Status AFTER buildNpcSheets:');
        Object.keys(npcKeyToSet).forEach(npcKey => {
            const exists = this.textures.exists(npcKey);
            console.log(`  ${npcKey}: ${exists ? '✅' : '❌'}`);
        });

        // Generate exclamation mark
        const exclCanvas = generateExclamationTexture();
        this.textures.addCanvas('exclamation', exclCanvas);

        const createHumanoidAnimations = () => {
            const spriteKeys = ['player_male', 'player_female', ...Object.keys(npcKeyToSet)];
            const dirs = ['down', 'left', 'right', 'up'];

            console.log('📺 Creating humanoid animations for:', spriteKeys.join(', '));

            for (const key of spriteKeys) {
                const texExists = this.textures.exists(key);
                if (!texExists) {
                    console.warn(`  ❌ Texture doesn't exist: ${key}, but creating dummy animations anyway`);
                    // Create dummy animations using a fallback texture if available
                    const fallbackKey = this.textures.exists('player_male') ? 'player_male' : null;
                    if (!fallbackKey) {
                        console.error(`  💥 No fallback texture available for ${key}`);
                        continue;
                    }
                    // Use fallback texture for animation frames
                    for (let d = 0; d < 4; d++) {
                        const base = d * HUMANOID_FRAMES_PER_DIR;
                        const walkStart = base + 1;
                        const walkEnd = base + HUMANOID_FRAMES_PER_DIR - 1;
                        const idleFrame = base;

                        if (!this.anims.exists(`${key}_${dirs[d]}`)) {
                            this.anims.create({
                                key: `${key}_${dirs[d]}`,
                                frames: this.anims.generateFrameNumbers(fallbackKey, { start: walkStart, end: walkEnd }),
                                frameRate: 10,
                                repeat: -1
                            });
                        }

                        if (!this.anims.exists(`${key}_idle_${dirs[d]}`)) {
                            this.anims.create({
                                key: `${key}_idle_${dirs[d]}`,
                                frames: [{ key: fallbackKey, frame: idleFrame }],
                                frameRate: 1
                            });
                        }
                    }
                    console.log(`  📍 Created fallback animations for ${key} using ${fallbackKey}`);
                    continue;
                }
                console.log(`  ✓ Creating animations for ${key}`);
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

        const ensureAnim = (key, sheetKey, start, end, frameRate) => {
            if (this.anims.exists(key)) return;
            this.anims.create({
                key,
                frames: this.anims.generateFrameNumbers(sheetKey, { start, end }),
                frameRate,
                repeat: -1
            });
        };

        const createPetAnimations = () => {
            ensureAnim('pet_cat_idle', 'pet_cat_idle_sheet', 0, 3, 5);
            ensureAnim('pet_cat_walk', 'pet_cat_walk_sheet', 0, 5, 10);
            ensureAnim('pet_dog_idle', 'pet_dog_idle_sheet', 0, 3, 5);
            ensureAnim('pet_dog_walk', 'pet_dog_walk_sheet', 0, 5, 10);

            ensureAnim('animal_bird_idle', 'animal_bird_idle_sheet', 0, 3, 6);
            ensureAnim('animal_bird_walk', 'animal_bird_walk_sheet', 0, 5, 10);
            ensureAnim('animal_bird2_idle', 'animal_bird2_idle_sheet', 0, 3, 6);
            ensureAnim('animal_bird2_walk', 'animal_bird2_walk_sheet', 0, 5, 10);

            ensureAnim('animal_rat_idle', 'animal_rat_idle_sheet', 0, 3, 6);
            ensureAnim('animal_rat_walk', 'animal_rat_walk_sheet', 0, 3, 10);
            ensureAnim('animal_rat2_idle', 'animal_rat2_idle_sheet', 0, 3, 6);
            ensureAnim('animal_rat2_walk', 'animal_rat2_walk_sheet', 0, 3, 10);

            ensureAnim('animal_cat2_idle', 'animal_cat2_idle_sheet', 0, 3, 6);
            ensureAnim('animal_cat2_walk', 'animal_cat2_walk_sheet', 0, 5, 10);
            ensureAnim('animal_dog2_idle', 'animal_dog2_idle_sheet', 0, 3, 6);
            ensureAnim('animal_dog2_walk', 'animal_dog2_walk_sheet', 0, 5, 10);
        };

        const createExtraAnimations = () => {
            // Cow: build idle/walk animations from the labeled sheet.
            // Output textures: cow_idle_0..3 and cow_walk_0..3
            const buildCowFromSheet = () => {
                if (this.textures.exists('cow_idle_0') && this.anims.exists('cow_walk')) return;
                if (!this.textures.exists('cow_sheet_src')) return;

                const img = this.textures.get('cow_sheet_src')?.getSourceImage?.();
                if (!img?.width || !img?.height) return;

                const srcW = img.width;
                const srcH = img.height;

                const srcCanvas = document.createElement('canvas');
                srcCanvas.width = srcW;
                srcCanvas.height = srcH;
                const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
                srcCtx.imageSmoothingEnabled = false;
                srcCtx.clearRect(0, 0, srcW, srcH);
                srcCtx.drawImage(img, 0, 0);

                const { data } = srcCtx.getImageData(0, 0, srcW, srcH);
                const bgR = data[0];
                const bgG = data[1];
                const bgB = data[2];
                const bgA = data[3];

                const isForeground = (x, y) => {
                    const i = (y * srcW + x) * 4;
                    const a = data[i + 3];
                    if (a < 10) return false;

                    // If the sheet has an opaque background, treat (near) background color as empty.
                    if (bgA > 0) {
                        const dr = Math.abs(data[i] - bgR);
                        const dg = Math.abs(data[i + 1] - bgG);
                        const db = Math.abs(data[i + 2] - bgB);
                        if (dr + dg + db < 10) return false;
                    }

                    return true;
                };

                const findSegments = (counts, threshold, minLen) => {
                    const segs = [];
                    let start = -1;
                    for (let i = 0; i < counts.length; i++) {
                        const on = counts[i] >= threshold;
                        if (on && start < 0) start = i;
                        if ((!on || i === counts.length - 1) && start >= 0) {
                            const end = on && i === counts.length - 1 ? i : i - 1;
                            if (end - start + 1 >= minLen) segs.push({ start, end });
                            start = -1;
                        }
                    }
                    return segs;
                };

                // Heuristic: find where the actual sprite columns start (skip label area on the left).
                const xCountsAll = new Array(srcW).fill(0);
                for (let y = 0; y < srcH; y++) {
                    for (let x = 0; x < srcW; x++) {
                        if (isForeground(x, y)) xCountsAll[x]++;
                    }
                }
                const maxXC = Math.max(...xCountsAll);
                let spriteStartX = 0;
                for (let x = 0; x < srcW; x++) {
                    if (xCountsAll[x] >= maxXC * 0.35) {
                        spriteStartX = Math.max(0, x - 2);
                        break;
                    }
                }

                // Column segments (4 columns of cows)
                const xCounts = new Array(srcW - spriteStartX).fill(0);
                for (let y = 0; y < srcH; y++) {
                    for (let x = spriteStartX; x < srcW; x++) {
                        if (isForeground(x, y)) xCounts[x - spriteStartX]++;
                    }
                }
                const maxX = Math.max(...xCounts);
                const colSegs = findSegments(xCounts, maxX * 0.22, 10)
                    .map(s => ({ start: s.start + spriteStartX, end: s.end + spriteStartX }))
                    .sort((a, b) => a.start - b.start)
                    .slice(0, 4);

                // Row segments (6 action rows)
                const yCounts = new Array(srcH).fill(0);
                for (let y = 0; y < srcH; y++) {
                    let c = 0;
                    for (let x = spriteStartX; x < srcW; x++) {
                        if (isForeground(x, y)) c++;
                    }
                    yCounts[y] = c;
                }
                const maxY = Math.max(...yCounts);
                const rowSegs = findSegments(yCounts, maxY * 0.25, 10)
                    .sort((a, b) => a.start - b.start)
                    .slice(0, 6);

                if (colSegs.length < 4 || rowSegs.length < 2) return;

                const OUT_W = 128;
                const OUT_H = 128;
                const pad = 2;

                const extractFrame = (rowIndex, colIndex, outKey) => {
                    if (this.textures.exists(outKey)) return true;

                    const ry = rowSegs[rowIndex];
                    const cx = colSegs[colIndex];
                    let minX = srcW;
                    let minY = srcH;
                    let maxX = -1;
                    let maxY = -1;

                    for (let y = ry.start; y <= ry.end; y++) {
                        for (let x = cx.start; x <= cx.end; x++) {
                            if (!isForeground(x, y)) continue;
                            if (x < minX) minX = x;
                            if (y < minY) minY = y;
                            if (x > maxX) maxX = x;
                            if (y > maxY) maxY = y;
                        }
                    }

                    if (maxX < 0 || maxY < 0) return false;

                    minX = Math.max(0, minX - pad);
                    minY = Math.max(0, minY - pad);
                    maxX = Math.min(srcW - 1, maxX + pad);
                    maxY = Math.min(srcH - 1, maxY + pad);

                    const bw = maxX - minX + 1;
                    const bh = maxY - minY + 1;

                    const frameCanvas = document.createElement('canvas');
                    frameCanvas.width = OUT_W;
                    frameCanvas.height = OUT_H;
                    const fctx = frameCanvas.getContext('2d');
                    fctx.imageSmoothingEnabled = false;
                    fctx.clearRect(0, 0, OUT_W, OUT_H);

                    const dx = Math.floor((OUT_W - bw) / 2);
                    const dy = Math.max(0, OUT_H - bh);
                    fctx.drawImage(img, minX, minY, bw, bh, dx, dy, bw, bh);

                    this.textures.addCanvas(outKey, frameCanvas);
                    return true;
                };

                const idleKeys = [];
                const walkKeys = [];
                for (let i = 0; i < 4; i++) {
                    const idleKey = `cow_idle_${i}`;
                    const walkKey = `cow_walk_${i}`;
                    if (extractFrame(0, i, idleKey)) idleKeys.push(idleKey);
                    if (extractFrame(1, i, walkKey)) walkKeys.push(walkKey);
                }

                if (!this.anims.exists('cow_idle') && idleKeys.length > 0) {
                    this.anims.create({
                        key: 'cow_idle',
                        frames: idleKeys.map(k => ({ key: k })),
                        frameRate: 6,
                        repeat: -1
                    });
                }
                if (!this.anims.exists('cow_walk') && walkKeys.length > 0) {
                    this.anims.create({
                        key: 'cow_walk',
                        frames: walkKeys.map(k => ({ key: k })),
                        frameRate: 8,
                        repeat: -1
                    });
                }
            };

            buildCowFromSheet();
            if (this.textures.exists('fountain') && !this.anims.exists('fountain_anim')) {
                this.anims.create({ key: 'fountain_anim', frames: this.anims.generateFrameNumbers('fountain', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
            }
        };

        createHumanoidAnimations();
        createPetAnimations();
        createExtraAnimations();

        // Debug: Verify ALL humanoid animations exist
        console.log('✅ Ironman animations created:');
        console.log('  ironman_down:', this.anims.exists('ironman_down'));
        console.log('  ironman_left:', this.anims.exists('ironman_left'));
        console.log('  ironman_right:', this.anims.exists('ironman_right'));
        console.log('  ironman_up:', this.anims.exists('ironman_up'));
        
        console.log('✅ Player animations created:');
        console.log('  player_male_down:', this.anims.exists('player_male_down'));
        console.log('  player_female_down:', this.anims.exists('player_female_down'));
        
        console.log('✅ NPC animations created:');
        ['guide', 'shopkeeper', 'villager1', 'villager2', 'villager3', 'task1', 'task2', 'task3a', 'task3b', 'task4'].forEach(npc => {
            console.log(`  ${npc}_down:`, this.anims.exists(`${npc}_down`));
            console.log(`  ${npc}_idle_down:`, this.anims.exists(`${npc}_idle_down`));
        });

        this.scene.start('CharSelectScene');
    }
}
