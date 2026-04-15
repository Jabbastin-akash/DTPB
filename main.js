// ===== main.js =====
// Entry point configuring and launching the Phaser game

function patchContainerAdd() {
    const originalAdd = Phaser.GameObjects.Container.prototype.add;
    Phaser.GameObjects.Container.prototype.add = function(child) {
        if (Array.isArray(child)) {
            const filtered = child.filter(Boolean);
            if (filtered.length === 0) return this;
            return originalAdd.call(this, filtered);
        }
        if (!child) return this;
        return originalAdd.call(this, child);
    };
}

window.onload = function() {
    patchContainerAdd();
    const config = {
        type: Phaser.AUTO,
        width: 1024,
        height: 720,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        parent: 'game-container',
        pixelArt: true, // Crucial for sharp pixel art
        backgroundColor: '#1a1a2e',
        scene: [BootScene, CharSelectScene, Task1ConversationScene, GameScene, UIScene, FootballScene, MazeScene, CompleteScene],
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        dom: {
            createContainer: true // Needed for html overlay UI panels
        }
    };

    globalThis.game = new Phaser.Game(config);
};
