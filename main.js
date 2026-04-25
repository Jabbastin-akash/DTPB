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

function clearFxTarget(target) {
    if (!target) return;
    if (typeof target.clearFX === 'function') target.clearFX();
    if (typeof target.resetPostPipeline === 'function') target.resetPostPipeline(true);
    if (target.postFX && typeof target.postFX.clear === 'function') target.postFX.clear();
    if (target.preFX && typeof target.preFX.clear === 'function') target.preFX.clear();
    if (Array.isArray(target.postPipelines) && target.postPipelines.length) {
        target.postPipelines.length = 0;
        target.hasPostPipeline = false;
    }
}

function clearSceneFx(scene) {
    if (!scene) return;
    clearFxTarget(scene.cameras?.main);
    if (scene.children && Array.isArray(scene.children.list)) {
        scene.children.list.forEach(child => clearFxTarget(child));
    }
}

window.onload = function() {
    patchContainerAdd();
    const config = {
        type: Phaser.AUTO,
        width: 1920,
        height: 1080,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        parent: 'game-container',
        pixelArt: true, // Crucial for sharp pixel art
        roundPixels: true, // Eliminates tile seam gaps from sub-pixel rendering
        backgroundColor: '#1a1a2e',
        scene: [BootScene, CharSelectScene, Task1ConversationScene, ClassroomScene, GameScene, UIScene, FootballScene, MazeScene, CompleteScene],
        callbacks: {
            postBoot: (game) => {
                const hookScene = (scene) => {
                    if (!scene || !scene.events) return;
                    scene.events.on(Phaser.Scenes.Events.CREATE, () => clearSceneFx(scene));
                };

                game.scene.scenes.forEach(hookScene);
                if (game.scene.events) {
                    game.scene.events.on(Phaser.Scenes.Events.ADD, (key, scene) => hookScene(scene));
                } else if (typeof game.scene.on === 'function') {
                    game.scene.on(Phaser.Scenes.Events.ADD, (key, scene) => hookScene(scene));
                }
            }
        },
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
