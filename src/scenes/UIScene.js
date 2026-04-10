// ===== UIScene.js =====
// Parallel scene that overlays HUD and UI panels on top of the game world

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // Initialize HUD
        this.hud = new HUD(this, 0, 0);

        // Listen for interaction events
        EventBus.on('npc:interact', this.handleInteraction, this);
    }

    handleInteraction(data) {
        // Check if an existing panel is open
        if (this.currentPanel) return;

        const { npcId, taskId, name, greeting, npc } = data;

        if (npcId === 'shopkeeper') {
            this.currentPanel = new ShopPanel(this, this.cameras.main.width / 2, this.cameras.main.height / 2);
        } else if (taskId) {
            this.currentPanel = new TaskPanel(this, taskId, this.cameras.main.width / 2, this.cameras.main.height / 2, greeting, npc);
        }

        // Clean up when panel closes
        EventBus.once('panel:close', () => {
            this.currentPanel = null;
        });
    }
}
