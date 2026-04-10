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

        const bg = this.add.rectangle(w / 2, h / 2, w, h, 0x1a1a2e);
        const title = this.add.text(w / 2, h / 2 - 60, '🌍 Design Thinking World', {
            fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#f6c90e'
        }).setOrigin(0.5);
        const loadingText = this.add.text(w / 2, h / 2, 'Loading...', {
            fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#eaeaea'
        }).setOrigin(0.5);

        const barBg = this.add.rectangle(w / 2, h / 2 + 40, 300, 20, 0x333355);
        const bar = this.add.rectangle(w / 2 - 148, h / 2 + 40, 0, 16, 0x06d6a0).setOrigin(0, 0.5);

        this.load.on('progress', (value) => {
            bar.width = 296 * value;
        });

        // Load Craftpix Assets
        this.load.image('house1', 'src/assets/craftpix-net-504452-free-village-pixel-tileset-for-top-down-defense/2 Objects/7 House/1.png');
        this.load.image('house2', 'src/assets/craftpix-net-504452-free-village-pixel-tileset-for-top-down-defense/2 Objects/7 House/2.png');
        this.load.image('house3', 'src/assets/craftpix-net-504452-free-village-pixel-tileset-for-top-down-defense/2 Objects/7 House/3.png');
        this.load.image('house4', 'src/assets/craftpix-net-504452-free-village-pixel-tileset-for-top-down-defense/2 Objects/7 House/4.png');
        this.load.image('shop_tent', 'src/assets/craftpix-net-504452-free-village-pixel-tileset-for-top-down-defense/2 Objects/6 Tent/2.png');
        this.load.image('decor_cart', 'src/assets/craftpix-net-504452-free-village-pixel-tileset-for-top-down-defense/2 Objects/3 Decor/2.png');
        this.load.image('decor_barrel', 'src/assets/craftpix-net-504452-free-village-pixel-tileset-for-top-down-defense/2 Objects/3 Decor/8.png');
        this.load.image('decor_stone', 'src/assets/craftpix-net-504452-free-village-pixel-tileset-for-top-down-defense/2 Objects/2 Stone/1.png');
        this.load.image('decor_box', 'src/assets/craftpix-net-504452-free-village-pixel-tileset-for-top-down-defense/2 Objects/4 Box/1.png');

        // New Assets
        this.load.spritesheet('bull', 'src/assets/bull.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('hotdogs', 'src/assets/hotdogs.png', { frameWidth: 50, frameHeight: 45 });
        this.load.spritesheet('hugedogs', 'src/assets/hugedogs.png', { frameWidth: 22, frameHeight: 18 });
        this.load.image('pixel_scenery', 'src/assets/Nateonus8x8PixelPack/FullSpriteSheetsNoPadding/Scenery/Grass&StoneScenery.png');

        // Generate tileset
        const tilesetResult = generateTilesetImage();
        this.textures.addCanvas('village-tiles', tilesetResult.canvas);

        // Generate map JSON
        const mapData = generateMapJSON();
        this.cache.tilemap.add('map', { format: Phaser.Tilemaps.Formats.TILED_JSON, data: mapData.json });
        // Store image objects data globally or in registry so we can fetch them in GameScene
        this.registry.set('imageObjects', mapData.imageObjects);

        // Generate sprite sheets
        const sprites = generateAllSprites();
        for (const [key, canvas] of Object.entries(sprites)) {
            this.textures.addSpriteSheet(key, canvas, {
                frameWidth: SPRITE_W,
                frameHeight: SPRITE_H
            });
        }

        // Generate exclamation mark
        const exclCanvas = generateExclamationTexture();
        this.textures.addCanvas('exclamation', exclCanvas);

        // Generate pet sheets
        const catSheet = generatePetSheet('cat');
        this.textures.addSpriteSheet('pet_cat', catSheet, { frameWidth: SPRITE_W, frameHeight: SPRITE_H });
        const dogSheet = generatePetSheet('dog');
        this.textures.addSpriteSheet('pet_dog', dogSheet, { frameWidth: SPRITE_W, frameHeight: SPRITE_H });
    }

    create() {
        // Create walk animations for all sprite sheets
        const spriteKeys = Object.keys(NPC_SPRITES);
        const dirs = ['down', 'left', 'right', 'up'];

        for (const key of spriteKeys) {
            for (let d = 0; d < 4; d++) {
                const startFrame = d * 3;
                this.anims.create({
                    key: `${key}_${dirs[d]}`,
                    frames: this.anims.generateFrameNumbers(key, { start: startFrame, end: startFrame + 2 }),
                    frameRate: 8,
                    repeat: -1
                });
                this.anims.create({
                    key: `${key}_idle_${dirs[d]}`,
                    frames: [{ key: key, frame: startFrame }],
                    frameRate: 1
                });
            }
        }

        // Pet animations
        this.anims.create({ key: 'pet_cat_walk', frames: this.anims.generateFrameNumbers('pet_cat', { start: 0, end: 2 }), frameRate: 6, repeat: -1 });
        this.anims.create({ key: 'pet_dog_walk', frames: this.anims.generateFrameNumbers('pet_dog', { start: 0, end: 2 }), frameRate: 6, repeat: -1 });

        // Extra animations
        this.anims.create({ key: 'bull_anim', frames: this.anims.generateFrameNumbers('bull', { start: 0, end: 3 }), frameRate: 4, repeat: -1 });
        this.anims.create({ key: 'hotdogs_anim', frames: this.anims.generateFrameNumbers('hotdogs', { start: 0, end: 4 }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'hugedogs_anim', frames: this.anims.generateFrameNumbers('hugedogs', { start: 0, end: 2 }), frameRate: 6, repeat: -1 });

        this.scene.start('CharSelectScene');
    }
}
