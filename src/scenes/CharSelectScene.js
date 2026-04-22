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
            fontFamily: 'sans-serif',
            fontSize: '32px',
            color: '#f6c90e',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Central character list (UI knows what exists)
        this.characters = [
            { key: 'player_male', label: 'Male', color: '#3498db' },
            { key: 'player_female', label: 'Female', color: '#e91e8c' },
            { key: 'ironman', label: 'Ironman', color: '#f97316' }
        ];

        // Layout for 3 items
        const startX = 250;
        const spacing = 180;
        const y = 320;

        this.characters.forEach((c, index) => {
            const x = startX + index * spacing;
            const card = this.createCard(x, y, c.key, c.label, c.color);
            card.on('pointerdown', () => this.selectCharacter(c.key));
        });
    }

    createCard(x, y, spriteKey, label, color) {
        // Background
        const bg = this.add.rectangle(x, y, 200, 260, 0x333333).setInteractive();
        this.add.rectangle(x, y, 204, 264, Phaser.Display.Color.HexStringToColor(color).color).setDepth(-1);

        // Sprite preview (scaled up)
        const preview = this.add.sprite(x, y - 30, spriteKey, 0);

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
        this.add.text(x, y + 80, label, {
            fontFamily: 'sans-serif',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Hover effects (only if the animation exists for that spriteKey)
        bg.on('pointerover', () => {
            bg.setFillStyle(0x444444);
            const hoverAnim = `${spriteKey}_down`;
            if (this.anims.exists(hoverAnim)) preview.play(hoverAnim);
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(0x333333);
            preview.stop();
            preview.setFrame(0);
        });

        return bg; // Return the interactive element
    }

    selectCharacter(choice) {
        // Store explicit texture key (preferred). Keep gender for backward compatibility.
        if (choice === 'player_male' || choice === 'player_female' || choice === 'ironman') {
            gameState.playerTextureKey = choice;
            gameState.playerGender = (choice === 'player_female') ? 'female' : 'male';
        } else {
            // Backward compatible with older calls that pass 'male'/'female'
            gameState.playerGender = choice;
            gameState.playerTextureKey = null;
        }

        this.scene.start('GameScene');
        this.scene.start('UIScene'); // Launch parallel UI scene
    }
}
