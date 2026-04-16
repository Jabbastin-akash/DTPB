// ===== ClassroomScene.js =====
// Separate scene for Task 3a: interview notes in the classroom.

class ClassroomScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ClassroomScene' });
        this._onPanelClose = null;
        this._onEsc = null;
        this.currentPanel = null;
    }

    create() {
        try {
            const w = this.cameras.main.width;
            const h = this.cameras.main.height;

            this.add.rectangle(w / 2, h / 2, w, h, 0x1a2238).setDepth(0);

            if (this.textures.exists('class_src')) {
                const bg = this.add.image(w / 2, h / 2, 'class_src').setDepth(1);
                const targetW = w * 0.92;
                const targetH = h * 0.92;
                const scale = Math.min(targetW / bg.width, targetH / bg.height);
                bg.setScale(scale);
            }

            this.add.text(w / 2, 38, 'CLASSROOM', {
                fontFamily: '"Press Start 2P"',
                fontSize: '18px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 5
            }).setOrigin(0.5).setDepth(10);

            if (this.input?.keyboard) {
                this.input.keyboard.resetKeys();
                this.input.keyboard.enabled = true;
                this._onEsc = () => this.returnToWorld();
                this.input.keyboard.once('keydown-ESC', this._onEsc);
            }

            const taskId = 'task3a';
            const greeting = TASKS?.[taskId]?.greeting || null;

            if (typeof TaskPanel !== 'function') {
                throw new Error('TaskPanel is not loaded');
            }

            this.currentPanel = new TaskPanel(this, taskId, w / 2, h / 2, greeting, null);

            this._onPanelClose = () => {
                this.currentPanel = null;
                this.returnToWorld();
            };
            EventBus.once('panel:close', this._onPanelClose);

            this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
                if (this._onPanelClose) EventBus.off('panel:close', this._onPanelClose);
                if (this._onEsc && this.input?.keyboard) this.input.keyboard.off('keydown-ESC', this._onEsc);
            });
        } catch (err) {
            // Surface the error in-game so it's not a silent blank screen.
            // eslint-disable-next-line no-console
            console.error(err);
            const w = this.cameras.main.width;
            const h = this.cameras.main.height;
            const msg = (err && err.stack) ? String(err.stack) : String(err);
            this.add.text(20, 20, `ClassroomScene error:\n${msg}`, {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffcccc',
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: { x: 10, y: 10 },
                wordWrap: { width: Math.max(300, w - 40) }
            }).setDepth(999);
            this.add.text(20, h - 40, 'Press ESC to return', {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff'
            }).setDepth(999);
            if (this.input?.keyboard) {
                this.input.keyboard.resetKeys();
                this.input.keyboard.enabled = true;
                this._onEsc = () => this.returnToWorld();
                this.input.keyboard.once('keydown-ESC', this._onEsc);
            }
        }
    }

    returnToWorld() {
        this.scene.start('GameScene');
        this.scene.start('UIScene');
    }
}
