// ===== CompleteScene.js =====
// Final screen shown when the game is fully complete

class CompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CompleteScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.add.rectangle(w / 2, h / 2, w, h, 0x1a1a2e);

        this.add.text(w / 2, 80, '🎉 CONGRATULATIONS! 🎉', {
            fontFamily: '"Press Start 2P", monospace', fontSize: '24px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(w / 2, 140, 'You are a true Design Thinker!', {
            fontFamily: 'sans-serif', fontSize: '18px', color: '#ecf0f1'
        }).setOrigin(0.5);

        // Summary Card
        const cvw = 600, cvh = 300;
        const sumGrap = this.add.graphics();
        sumGrap.fillStyle(0x34495e, 1);
        sumGrap.fillRoundedRect(w / 2 - cvw / 2, 200, cvw, cvh, 16);
        sumGrap.lineStyle(4, 0x2ecc71);
        sumGrap.strokeRoundedRect(w / 2 - cvw / 2, 200, cvw, cvh, 16);

        const summaryText = [
            `My problem definition:`,
            `"${gameState.problemStatement.problem}"\n`,
            `User Profile:`,
            `${gameState.userProfile.name}, Age ${gameState.userProfile.age || '?'}\n`,
            `Final Commitment:`,
            `${gameState.finalStatement}`
        ].join('\n');

        this.add.text(w / 2 - cvw / 2 + 20, 220, summaryText, {
            fontFamily: 'sans-serif', fontSize: '16px', color: '#ecf0f1', wordWrap: { width: cvw - 40 }
        });

        // Points
        this.add.text(w / 2, h - 80, `Total Points Earned: ⭐ ${gameState.points}`, {
            fontFamily: 'sans-serif', fontSize: '20px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0.5);

    }
}
