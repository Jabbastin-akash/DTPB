// ===== BootScene.js =====
// Loads all generated assets and shows loading progress bar

const LIVELY_NPC_SHEETS = {
    medieval: [
        'adventurer_01', 'adventurer_02', 'adventurer_03', 'adventurer_04', 'adventurer_05',
        'barkeep', 'barmaid', 'beggar', 'blacksmith', 'captain', 'dog', 'dwarf', 'elder', 'fairy',
        'farmer_01', 'farmer_02', 'guard', 'gypsy', 'jester', 'king', 'merchant', 'mermaid', 'minstrel',
        'priestess', 'princess', 'shady_guy', 'stranger', 'villager_01', 'villager_02', 'witch'
    ],
    steampunk: [
        'aristocrat_01', 'aristocrat_02', 'bartender', 'engineer_01', 'engineer_02', 'gunslinger',
        'masked_man', 'masked_woman', 'steambot_01', 'steambot_02', 'steambot_03', 'trader'
    ],
    elementals: [
        'crystal_mauler', 'fire_knight', 'ground_monk', 'leaf_ranger', 'metal_bladekeeper',
        'water_priestess', 'wind_hashashin'
    ]
};

const NEW_NPC_SHEETS = [
    { key: 'pink_monster', folder: '1 Pink_Monster', walkFile: 'Pink_Monster_Walk_6.png', walkFrames: 6 },
    { key: 'owlet_monster', folder: '2 Owlet_Monster', walkFile: 'Owlet_Monster_Walk_6.png', walkFrames: 6 },
    { key: 'dude_monster', folder: '3 Dude_Monster', walkFile: 'Dude_Monster_Walk_6.png', walkFrames: 6 }
];

const NPC_ROLE_KEYS = [
    'guide', 'shopkeeper', 'villager1', 'villager2', 'villager3',
    'task1', 'task2', 'task3a', 'task3b', 'task4'
];

const HUMANOID_FRAMES_PER_DIR = 7;
const HUMANOID_DIRS = ['down', 'left', 'right', 'up'];

const getSourceImage = (texture) => texture?.getSourceImage?.();

const addSpriteSheetFromCanvas = (scene, key, canvas, frameWidth, frameHeight) => {
    if (!scene || !canvas) return;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.textures.addSpriteSheet(key, canvas, { frameWidth, frameHeight });
};

const makeHouseCrop = (scene, srcKey, destKey, sx, sy, sw, sh) => {
    const img = getSourceImage(scene?.textures?.get(srcKey));
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

    if (scene.textures.exists(destKey)) scene.textures.remove(destKey);
    scene.textures.addCanvas(destKey, canvas);
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

const findOpaqueBounds = (data, width, height, alphaThreshold, step) => {
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

    return { minX, minY, maxX, maxY };
};

const padOpaqueBounds = (bounds, width, height) => {
    const pad = Math.max(8, Math.floor(Math.min(width, height) * 0.02));
    const minX = Math.max(0, bounds.minX - pad);
    const minY = Math.max(0, bounds.minY - pad);
    const maxX = Math.min(width - 1, bounds.maxX + pad);
    const maxY = Math.min(height - 1, bounds.maxY + pad);
    return { minX, minY, maxX, maxY };
};

const computeAlphaBounds = (img, alphaThreshold = 10, step = 2) => {
    if (!img?.width || !img?.height) return { x: 0, y: 0, w: 0, h: 0 };

    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const cctx = c.getContext('2d');
    cctx.clearRect(0, 0, c.width, c.height);
    cctx.drawImage(img, 0, 0);

    const { data } = cctx.getImageData(0, 0, c.width, c.height);
    const raw = findOpaqueBounds(data, c.width, c.height, alphaThreshold, step);

    if (raw.maxX < raw.minX || raw.maxY < raw.minY) {
        return { x: 0, y: 0, w: c.width, h: c.height };
    }

    const padded = padOpaqueBounds(raw, c.width, c.height);
    return {
        x: padded.minX,
        y: padded.minY,
        w: (padded.maxX - padded.minX + 1),
        h: (padded.maxY - padded.minY + 1)
    };
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

const getStripFrameMap = (frameCount) => {
    if (frameCount >= 7) return [0, 1, 2, 3, 4, 5, 6];
    if (frameCount === 6) return [0, 1, 2, 3, 4, 5, 4];
    if (frameCount === 5) return [0, 1, 2, 3, 4, 3, 2];
    if (frameCount === 4) return [0, 1, 2, 3, 2, 1, 0];
    if (frameCount === 3) return [0, 1, 2, 1, 0, 1, 2];
    if (frameCount === 2) return [0, 1, 0, 1, 0, 1, 0];
    return [0, 0, 0, 0, 0, 0, 0];
};

const buildSheetFromStrip = (srcImg, frameCount, outW = 48, outH = 48) => {
    if (!srcImg || !frameCount) return null;
    const frameW = Math.floor(srcImg.width / frameCount);
    const frameH = srcImg.height;
    if (!frameW || !frameH) return null;

    const canvas = document.createElement('canvas');
    canvas.width = HUMANOID_FRAMES_PER_DIR * outW;
    canvas.height = 4 * outH;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;

    const frameMap = getStripFrameMap(frameCount);

    const drawFrame = (srcIndex, col, row, flipX = false) => {
        const sx = srcIndex * frameW;
        const sw = frameW;
        const sh = frameH;

        const padding = 4;
        const maxW = outW - padding;
        const maxH = outH - padding;
        const scale = Math.min(maxW / sw, maxH / sh);
        const dw = Math.max(1, Math.floor(sw * scale));
        const dh = Math.max(1, Math.floor(sh * scale));
        const dx = col * outW + Math.floor((outW - dw) / 2);
        const dy = row * outH + Math.floor((outH - dh) / 2);

        if (!flipX) {
            ctx.drawImage(srcImg, sx, 0, sw, sh, dx, dy, dw, dh);
            return;
        }

        ctx.save();
        ctx.translate(dx + dw, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(srcImg, sx, 0, sw, sh, 0, 0, dw, dh);
        ctx.restore();
    };

    const drawDir = (rowIndex, flipX) => {
        for (let col = 0; col < HUMANOID_FRAMES_PER_DIR; col++) {
            drawFrame(frameMap[col], col, rowIndex, flipX);
        }
    };

    // down, left (flipped), right, up
    drawDir(0, false);
    drawDir(1, true);
    drawDir(2, false);
    drawDir(3, false);

    return canvas;
};

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

        // Lively NPC sprite sheets (single-row strips)
        const livelyBase = 'assets/Lively_NPCs_v3.0/Lively_NPCs_v3.0/sprite sheets';
        Object.entries(LIVELY_NPC_SHEETS).forEach(([group, names]) => {
            names.forEach((name) => {
                this.load.image(`lively_${group}_${name}`, `${livelyBase}/${group}/${name}.png`);
            });
        });

        // New NPCs (monster walk strips)
        const newNpcBase = 'assets/NewNPCs';
        NEW_NPC_SHEETS.forEach((def) => {
            this.load.image(`newnpc_${def.key}_walk`, `${newNpcBase}/${def.folder}/${def.walkFile}`);
        });

        // Animals (pets)
        this.load.spritesheet('pet_cat_idle_sheet', 'assets/Animals/Cat/Idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('pet_cat_walk_sheet', 'assets/Animals/Cat/Walk.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('pet_dog_idle_sheet', 'assets/Animals/Dog/Idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('pet_dog_walk_sheet', 'assets/Animals/Dog/Walk.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('animal_cat2_idle_sheet', 'assets/Animals/Cat%202/Idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('animal_dog2_idle_sheet', 'assets/Animals/Dog%202/Idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('animal_bird_idle_sheet', 'assets/Animals/Bird/Idle.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('animal_bird2_idle_sheet', 'assets/Animals/Bird%202/Idle.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('animal_rat_idle_sheet', 'assets/Animals/Rat/Idle.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('animal_rat2_idle_sheet', 'assets/Animals/Rat%202/Idle.png', { frameWidth: 32, frameHeight: 32 });

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
        this.load.image('pond', 'assets/Pond.png?v=2');
        this.load.image('home_convo_bg', 'assets/Task_1/Home.png');
        this.load.image('football_ball_img', 'assets/Football/Ball.png');
        this.load.image('football_goalpost_img', 'assets/Football/GoalPost.png');
        this.load.image('football_ground_img', 'assets/Football/football-ground.png');
        this.load.image('pixel_scenery', 'assets/Combinations/FullSpriteSheetsNoPadding/Scenery/Grass&StoneScenery.png');

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

        // Custom path tile
        this.load.image('path_tile', 'assets/Path.png');
    }

    create() {
        this.createTilesetAndMap();
        this.createHouseTextures();
        this.createPlayerSpriteSheets();

        const npcSpriteKeys = this.createNpcSpriteSheets();
        this.registry.set('npcSpriteKeys', npcSpriteKeys);
        this.registry.set('npcRoleSpriteMap', this.buildNpcRoleMap(npcSpriteKeys));

        this.createExclamationTexture();
        this.createHumanoidAnimations(['player_male', 'player_female', ...npcSpriteKeys]);
        this.createPetAnimations();
        this.createExtraAnimations();

        this.scene.start('CharSelectScene');
    }

    createTilesetAndMap() {
        const tilesetSourceImg = getSourceImage(this.textures.get('tileset_src'));
        const grassTextures = [getSourceImage(this.textures.get('grass_tex_8'))].filter(Boolean);
        const pathTexture = getSourceImage(this.textures.get('path_tile'));
        const tilesetResult = generateTilesetImage(tilesetSourceImg, grassTextures, pathTexture);
        this.textures.addCanvas('village-tiles', tilesetResult.canvas);

        const mapData = generateMapJSON();
        this.cache.tilemap.add('map', { format: Phaser.Tilemaps.Formats.TILED_JSON, data: mapData.json });
        this.registry.set('imageObjects', mapData.imageObjects);
    }

    createHouseTextures() {
        makeHouseCrop(this, 'houses_iso', 'house1', 157, 4, 157, 104);
        makeHouseCrop(this, 'houses_iso', 'house2', 326, 4, 113, 103);
        makeHouseCrop(this, 'houses_iso', 'house3', 12, 21, 139, 80);
        makeHouseCrop(this, 'houses_iso', 'house4', 279, 106, 90, 109);
        makeHouseCrop(this, 'houses_iso', 'house5', 319, 215, 127, 112);
    }

    createPlayerSpriteSheets() {
        const playerSheetImg = getSourceImage(this.textures.get('player_sheet'));
        if (playerSheetImg) {
            addSpriteSheetFromCanvas(this, 'player_male', buildSheetFromCharacterBlock(playerSheetImg, 8, 0, 64, 64), 64, 64);
        }

        const valkIdle = getSourceImage(this.textures.get('valk3_idle_0'));
        const valkWalk = Array.from({ length: 6 }, (_, i) => getSourceImage(this.textures.get(`valk3_walk_${i}`))).filter(Boolean);
        const femaleCanvas = buildSheetFromSingleDirFrames(valkIdle, valkWalk, 64, 64);
        const redGirlImg = getSourceImage(this.textures.get('female_red'));

        if (redGirlImg) {
            addSpriteSheetFromCanvas(this, 'player_female', buildSheetFrom3ColBlock(redGirlImg, 32, 32), 32, 32);
            return;
        }

        if (femaleCanvas) {
            addSpriteSheetFromCanvas(this, 'player_female', femaleCanvas, 64, 64);
            return;
        }

        if (playerSheetImg) {
            addSpriteSheetFromCanvas(this, 'player_female', buildSheetFromCharacterBlock(playerSheetImg, 0, 0, 64, 64), 64, 64);
        }
    }

    createNpcSpriteSheets() {
        const livelyNpcKeys = [];
        Object.entries(LIVELY_NPC_SHEETS).forEach(([group, names]) => {
            names.forEach((name) => {
                const key = `lively_${group}_${name}`;
                const srcImg = getSourceImage(this.textures.get(key));
                const canvas = buildSheetFromStrip(srcImg, 4, 48, 48);
                if (!canvas) return;
                addSpriteSheetFromCanvas(this, key, canvas, 48, 48);
                livelyNpcKeys.push(key);
            });
        });

        const newNpcKeys = [];
        NEW_NPC_SHEETS.forEach((def) => {
            const walkKey = `newnpc_${def.key}_walk`;
            const spriteKey = `newnpc_${def.key}`;
            const walkImg = getSourceImage(this.textures.get(walkKey));
            const canvas = buildSheetFromStrip(walkImg, def.walkFrames || 6, 48, 48);
            if (!canvas) return;
            addSpriteSheetFromCanvas(this, spriteKey, canvas, 48, 48);
            newNpcKeys.push(spriteKey);
        });

        return [...livelyNpcKeys, ...newNpcKeys];
    }

    buildNpcRoleMap(npcSpriteKeys) {
        const roleMap = {};
        if (!Array.isArray(npcSpriteKeys) || npcSpriteKeys.length === 0) return roleMap;
        NPC_ROLE_KEYS.forEach((role, idx) => {
            roleMap[role] = npcSpriteKeys[idx % npcSpriteKeys.length];
        });
        return roleMap;
    }

    createExclamationTexture() {
        const exclCanvas = generateExclamationTexture();
        this.textures.addCanvas('exclamation', exclCanvas);
    }

    createHumanoidAnimations(spriteKeys) {
        for (const key of spriteKeys) {
            if (!this.textures.exists(key)) continue;
            for (let d = 0; d < 4; d++) {
                const base = d * HUMANOID_FRAMES_PER_DIR;
                const walkStart = base + 1;
                const walkEnd = base + HUMANOID_FRAMES_PER_DIR - 1;
                const idleFrame = base;
                const walkAnimKey = `${key}_${HUMANOID_DIRS[d]}`;
                const idleAnimKey = `${key}_idle_${HUMANOID_DIRS[d]}`;

                if (!this.anims.exists(walkAnimKey)) {
                    this.anims.create({
                        key: walkAnimKey,
                        frames: this.anims.generateFrameNumbers(key, { start: walkStart, end: walkEnd }),
                        frameRate: 10,
                        repeat: -1
                    });
                }

                if (!this.anims.exists(idleAnimKey)) {
                    this.anims.create({
                        key: idleAnimKey,
                        frames: [{ key, frame: idleFrame }],
                        frameRate: 1
                    });
                }
            }
        }
    }

    createPetAnimations() {
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

        const ensureAnimalIdle = (key, sheetKey, rate) => {
            if (!this.textures.exists(sheetKey)) return;
            if (!this.anims.exists(key)) {
                this.anims.create({ key, frames: this.anims.generateFrameNumbers(sheetKey, { start: 0, end: 3 }), frameRate: rate, repeat: -1 });
            }
        };
        const ensureAnimalWalk = (key, sheetKey, endFrame, rate) => {
            if (!this.textures.exists(sheetKey)) return;
            if (!this.anims.exists(key)) {
                this.anims.create({ key, frames: this.anims.generateFrameNumbers(sheetKey, { start: 0, end: endFrame }), frameRate: rate, repeat: -1 });
            }
        };
        ensureAnimalIdle('animal_cat2_idle', 'animal_cat2_idle_sheet', 5);
        ensureAnimalIdle('animal_dog2_idle', 'animal_dog2_idle_sheet', 5);
        ensureAnimalIdle('animal_bird_idle', 'animal_bird_idle_sheet', 6);
        ensureAnimalIdle('animal_bird2_idle', 'animal_bird2_idle_sheet', 6);
        ensureAnimalIdle('animal_rat_idle', 'animal_rat_idle_sheet', 6);
        ensureAnimalIdle('animal_rat2_idle', 'animal_rat2_idle_sheet', 6);
        ensureAnimalWalk('animal_cat2_walk', 'animal_cat2_walk_sheet', 5, 10);
        ensureAnimalWalk('animal_dog2_walk', 'animal_dog2_walk_sheet', 5, 10);
        ensureAnimalWalk('animal_bird_walk', 'animal_bird_walk_sheet', 5, 10);
        ensureAnimalWalk('animal_bird2_walk', 'animal_bird2_walk_sheet', 5, 10);
        ensureAnimalWalk('animal_rat_walk', 'animal_rat_walk_sheet', 3, 8);
        ensureAnimalWalk('animal_rat2_walk', 'animal_rat2_walk_sheet', 3, 8);
    }

    createExtraAnimations() {
        if (!this.anims.exists('bull_anim')) {
            this.anims.create({ key: 'bull_anim', frames: this.anims.generateFrameNumbers('bull', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
        }

        if (!this.anims.exists('fountain_anim')) {
            this.anims.create({ key: 'fountain_anim', frames: this.anims.generateFrameNumbers('fountain', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
        }
    }
}
