// ===== HUD.js =====
// Top bar heads-up display showing points and task progress

class HUD extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.setScrollFactor(0).setDepth(10);

        const GAME_WIDTH = scene.sys.game.config.width;
        this.totalTasks = (typeof TASKS === 'object' && TASKS) ? Object.keys(TASKS).length : 5;
        const BAR_HEIGHT = 56;
        const PADDING_X = 16;
        const PADDING_Y = 10;

        this.progressBarWidth = 160;
        this.progressBarHeight = 8;
        this.progressBarX = GAME_WIDTH - PADDING_X - this.progressBarWidth;
        this.progressBarY = PADDING_Y + 34;

        // --- Background ---
        const bg = scene.add.graphics();
        bg.fillStyle(0x000000, 0.55);
        bg.fillRoundedRect(0, 0, GAME_WIDTH, BAR_HEIGHT, 8);
        bg.lineStyle(2, 0x5a5a6a, 0.55);
        bg.strokeRoundedRect(0, 0, GAME_WIDTH, BAR_HEIGHT, 8);
        this.add(bg);

        // --- Left Side: Player Progression ---
        const pointsIcon = scene.add.text(PADDING_X, PADDING_Y + 2, '★', {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            color: '#FFD700'
        });

        this.pointsText = scene.add.text(pointsIcon.x + pointsIcon.width + 10, PADDING_Y, gameState.points, {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: '#FFD700',
            align: 'left'
        }).setOrigin(0, 0);

        this.add([pointsIcon, this.pointsText].filter(Boolean));

        // --- Right Side: Task Progress ---
        const tasksLabel = scene.add.text(GAME_WIDTH - PADDING_X, PADDING_Y, 'Tasks', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#ffffff',
            align: 'right'
        }).setOrigin(1, 0);

        this.progressCount = scene.add.text(tasksLabel.x, PADDING_Y + 18, `${gameState.getCompletedTaskCount()}/${this.totalTasks}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '14px',
            color: '#cfd0d7',
            align: 'right'
        }).setOrigin(1, 0);

        // Progress Bar
        const progressBg = scene.add.graphics();
        progressBg.fillStyle(0x1d1d25, 0.95);
        progressBg.fillRoundedRect(this.progressBarX, this.progressBarY, this.progressBarWidth, this.progressBarHeight, 4);
        progressBg.lineStyle(2, 0x000000, 0.35);
        progressBg.strokeRoundedRect(this.progressBarX, this.progressBarY, this.progressBarWidth, this.progressBarHeight, 4);
        
        this.progressBar = scene.add.graphics();

        // Add checkmark icon for feedback
        this.checkmark = scene.add.text(this.progressBarX - 18, PADDING_Y + 2, '✓', {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            color: '#2ecc71',
            align: 'left'
        }).setAlpha(0);

        this.add([tasksLabel, this.progressCount, progressBg, this.progressBar, this.checkmark].filter(Boolean));

        // --- Event Listeners & Initial State ---
        this.getAll().forEach(item => item.setScrollFactor(0).setDepth(10));
        scene.add.existing(this);

        EventBus.on('points:changed', this.updatePoints, this);
        EventBus.on('task:completed', this.updateProgress, this);

        this.updatePoints(gameState.points);
        this.updateProgress({ total: gameState.getCompletedTaskCount() });
    }

    updatePoints(newPoints) {
        this.pointsText.setText(newPoints);

        // Feedback animation
        this.scene.tweens.add({
            targets: this.pointsText,
            scale: 1.2,
            duration: 150,
            ease: 'Power1',
            yoyo: true
        });
    }

    updateProgress({ total, isNewCompletion }) {
        const totalTasks = this.totalTasks;

        this.progressCount.setText(`${total}/${totalTasks}`);

        const progressWidth = (total / totalTasks) * this.progressBarWidth;

        // Animate the progress bar fill
        this.scene.tweens.add({
            targets: { value: this.currentProgress || 0 },
            value: progressWidth,
            duration: 400,
            ease: 'Power2',
            onUpdate: (tween) => {
                this.progressBar.clear();
                this.progressBar.fillStyle(0x2ecc71, 1);
                this.progressBar.fillRoundedRect(this.progressBarX, this.progressBarY, tween.targets[0].value, this.progressBarHeight, 4);
            },
            onComplete: () => {
                this.currentProgress = progressWidth;
            }
        });


        if (isNewCompletion) {
            this.checkmark.setAlpha(1);
            this.scene.tweens.add({
                targets: this.checkmark,
                alpha: 0,
                delay: 1000,
                duration: 500,
                ease: 'Power1'
            });

            this.scene.tweens.add({
                targets: this.progressCount,
                scale: 1.12,
                duration: 120,
                yoyo: true,
                ease: 'Power1'
            });
        }
    }

    destroy() {
        EventBus.off('points:changed', this.updatePoints, this);
        EventBus.off('task:completed', this.updateProgress, this);
        super.destroy();
    }
}
