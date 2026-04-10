// ===== main.js =====
// Entry point configuring and launching the Phaser game

window.onload = function() {
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
        scene: [BootScene, CharSelectScene, GameScene, UIScene, CompleteScene],
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

    const game = new Phaser.Game(config);
};
