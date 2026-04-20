// ===== CharSelectScene.js =====
// Character selection screen shown before gameplay

class CharSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharSelectScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.add.rectangle(w / 2, h / 2, w, h, 0x1a1a2e);
        this.add.text(w / 2, 100, 'Choose Your Character', {
            fontFamily: 'sans-serif', fontSize: '32px', color: '#f6c90e', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Male Card
        const maleCard = this.createCard(w / 2 - 150, 300, 'player_male', 'Male', '#3498db');
        maleCard.on('pointerdown', () => this.selectCharacter('male'));

        // Female Card
        const femaleCard = this.createCard(w / 2 + 150, 300, 'player_female', 'Female', '#e91e8c');
        femaleCard.on('pointerdown', () => this.selectCharacter('female'));
    }

    createCard(x, y, spriteKey, label, color) {
        const container = this.add.container(x, y);

        // Background
        const bg = this.add.rectangle(0, 0, 200, 260, 0x333333).setInteractive();
        const border = this.add.rectangle(0, 0, 204, 264, Phaser.Display.Color.HexStringToColor(color).color).setDepth(-1);

        // Sprite preview (scaled up)
        const preview = this.add.sprite(0, -30, spriteKey, 0);
        // Fit preview into the card regardless of sprite frame size/padding.
        const characterScale = gameState?.characterScale ?? 1;
        const maxW = Math.max(120, Math.round(120 * characterScale));
        const maxH = Math.max(120, Math.round(120 * characterScale));
        const fw = preview.frame?.realWidth ?? preview.width ?? 1;
        const fh = preview.frame?.realHeight ?? preview.height ?? 1;
        const sFit = Math.min(maxW / fw, maxH / fh);

        const cfg = (typeof getCharacterConfig === 'function') ? getCharacterConfig(spriteKey) : null;
        const previewScaleAdjust = cfg?.scaleMultiplier ?? 1;
        preview.setScale(sFit * previewScaleAdjust);

        // Name
        const txt = this.add.text(0, 80, label, {
            fontFamily: 'sans-serif', fontSize: '24px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([border, bg, preview, txt].filter(Boolean));

        // Hover effects
        bg.on('pointerover', () => {
            bg.setFillStyle(0x444444);
            preview.play(`${spriteKey}_down`);
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(0x333333);
            preview.stop();
            preview.setFrame(0);
        });

        return bg; // Return the interactive element
    }

    selectCharacter(gender) {
        gameState.playerGender = gender;
        this.scene.start('GameScene');
        this.scene.start('UIScene'); // Launch parallel UI scene
    }
}
