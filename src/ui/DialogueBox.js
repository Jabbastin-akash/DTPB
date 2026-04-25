// ===== DialogueBox.js =====

class DialogueBox {
    constructor(scene, name, text, portraitKey, npc) {
        this.scene = scene;
        this.npc = npc;
        const w = scene.cameras.main.width;
        const h = scene.cameras.main.height;

        this.container = scene.add.container(w / 2, h + 200);

        // Background
        const bgWidth = Math.min(800, w - 100);
        const bg = scene.add.rectangle(0, 0, bgWidth, 150, 0x111111, 0.95);
        bg.setStrokeStyle(4, 0xaaaaaa);

        // Portrait Box
        const portraitBg = scene.add.rectangle(-bgWidth / 2 + 80, 0, 100, 100, 0x333333);
        const portrait = scene.add.sprite(-bgWidth / 2 + 80, 0, portraitKey, 0); 
        portrait.setScale(2.5); // Scale up face

        // Name
        const nameText = scene.add.text(-bgWidth / 2 + 150, -50, name, {
            fontFamily: '"Press Start 2P", monospace, sans-serif',
            fontSize: '16px',
            color: '#FFD700',
            fontStyle: 'bold'
        });

        // Text
        this.dialogueText = scene.add.text(-bgWidth / 2 + 150, -20, '', {
            fontFamily: 'sans-serif',
            fontSize: '22px',
            color: '#ffffff',
            wordWrap: { width: bgWidth - 180 },
            lineSpacing: 5
        });

        this.fullText = text;
        this.currentChar = 0;

        this.container.add([bg, portraitBg, portrait, nameText, this.dialogueText]);

        // Pop in animation
        scene.tweens.add({
            targets: this.container,
            y: h - 100,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.startTyping();
            }
        });

        // Prevent immediate close on the same interaction click
        this.canClose = false;
        scene.time.delayedCall(100, () => { this.canClose = true; });

        this.closeHandler = (e) => {
            if (!this.canClose) return;
            if (e && e.stopPropagation) e.stopPropagation();
            
            if (this.isTyping) {
                this.isTyping = false;
                if (this.typingTimer) this.typingTimer.remove();
                this.dialogueText.setText(this.fullText);
            } else {
                this.close();
            }
        };

        scene.input.keyboard.on('keydown-SPACE', this.closeHandler);
        scene.input.keyboard.on('keydown-E', this.closeHandler);
        scene.input.on('pointerdown', this.closeHandler);
    }

    startTyping() {
        this.isTyping = true;
        this.typingTimer = this.scene.time.addEvent({
            delay: 30, // typing speed
            repeat: this.fullText.length - 1,
            callback: () => {
                this.currentChar++;
                this.dialogueText.setText(this.fullText.substring(0, this.currentChar));
                if (this.currentChar === this.fullText.length) {
                    this.isTyping = false;
                }
            }
        });
    }

    close() {
        if (this.closing) return;
        this.closing = true;
        
        this.scene.input.keyboard.off('keydown-SPACE', this.closeHandler);
        this.scene.input.keyboard.off('keydown-E', this.closeHandler);
        this.scene.input.off('pointerdown', this.closeHandler);

        this.scene.tweens.add({
            targets: this.container,
            y: this.scene.cameras.main.height + 200,
            duration: 200,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                this.container.destroy();
                EventBus.emit('panel:close');
            }
        });
    }
}
