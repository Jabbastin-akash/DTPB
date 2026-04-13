// ===== MazeScene.js =====
// Story Task 5: simple maze with checkpoint questions (placeholder content)

class MazeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MazeScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.movementEnabled = true;
        this._activeDom = null;

        this.add.rectangle(w / 2, h / 2, w, h, 0x111827);

        this.add.text(w / 2, 34, '🧩 MAZE CHECKPOINTS 🧩', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(w / 2, 70, 'Navigate to checkpoints and answer.', {
            fontFamily: 'sans-serif',
            fontSize: '16px',
            color: '#eaeaea'
        }).setOrigin(0.5);

        this.physics.world.setBounds(0, 0, w, h);

        this.player = new Player(this, 80, h - 120);
        this.player.body.setCollideWorldBounds(true);

        // Maze walls (simple rectangles)
        this.walls = [];
        const makeWall = (x, y, ww, hh) => {
            const r = this.add.rectangle(x, y, ww, hh, 0x374151).setOrigin(0.5);
            this.physics.add.existing(r, true);
            this.physics.add.collider(this.player, r);
            this.walls.push(r);
        };

        // Outer boundaries (top UI header excluded)
        makeWall(w / 2, 105, w, 18);
        makeWall(w / 2, h - 10, w, 20);
        makeWall(10, (h + 105) / 2, 20, h - 105);
        makeWall(w - 10, (h + 105) / 2, 20, h - 105);

        // Interior walls
        makeWall(w / 2 - 140, h / 2 + 80, 320, 18);
        makeWall(w / 2 + 170, h / 2 + 10, 320, 18);
        makeWall(w / 2, h / 2 - 120, 18, 260);
        makeWall(w / 2 - 260, h / 2 - 30, 18, 260);

        this.answers = {};
        this.completed = new Set();

        const checkpoints = [
            { key: 'cp1', x: w - 120, y: h - 140, label: 'CP1', question: 'Checkpoint 1 (replace later): What is the problem again in 1 sentence?' },
            { key: 'cp2', x: w / 2 + 210, y: h / 2 - 40, label: 'CP2', question: 'Checkpoint 2 (replace later): What emotion is most important to solve?' },
            { key: 'cp3', x: w / 2 - 260, y: 190, label: 'CP3', question: 'Checkpoint 3 (replace later): Name one simple solution idea.' }
        ];

        this.checkpointObjects = checkpoints.map(cp => {
            const rect = this.add.rectangle(cp.x, cp.y, 70, 50, 0xf59e0b, 0.95).setOrigin(0.5);
            rect.setStrokeStyle(4, 0xffffff, 0.9);
            this.physics.add.existing(rect, true);

            const txt = this.add.text(cp.x, cp.y, cp.label, {
                fontFamily: '"Press Start 2P"',
                fontSize: '11px',
                color: '#111827',
                stroke: '#ffffff',
                strokeThickness: 2
            }).setOrigin(0.5);

            this.physics.add.overlap(this.player, rect, () => {
                if (this._activeDom) return;
                if (this.completed.has(cp.key)) return;
                this.openQuestion(cp, rect);
            });

            return { ...cp, rect, txt };
        });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this._activeDom) {
                this._activeDom.destroy();
                this._activeDom = null;
            }
        });
    }

    openQuestion(checkpoint, checkpointRect) {
        this.movementEnabled = false;
        if (this.input && this.input.keyboard) this.input.keyboard.resetKeys();

        const wrap = document.createElement('div');
        wrap.style.cssText = `
            width: 620px;
            max-width: 92vw;
            background: rgba(40, 40, 80, 0.98);
            border: 3px solid #a9a9a9;
            border-radius: 12px;
            padding: 18px;
            color: #fff;
            font-family: 'Press Start 2P', sans-serif;
            font-size: 12px;
        `;

        const title = document.createElement('div');
        title.textContent = checkpoint.label;
        title.style.cssText = 'text-align:center;color:#f1c40f;margin-bottom:12px;font-size:14px;';
        wrap.appendChild(title);

        const q = document.createElement('div');
        q.textContent = checkpoint.question;
        q.style.cssText = 'background:rgba(255,255,255,0.12);padding:10px;border-radius:8px;margin-bottom:12px;line-height:1.5;';
        wrap.appendChild(q);

        const textarea = document.createElement('textarea');
        textarea.rows = 3;
        textarea.placeholder = 'Type your answer...';
        textarea.style.cssText = 'width:100%;box-sizing:border-box;padding:10px;border-radius:6px;border:2px solid #ccc;';
        wrap.appendChild(textarea);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:10px;justify-content:space-between;margin-top:14px;';

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = 'flex:1;padding:10px;border-radius:6px;border:none;background:#e74c3c;color:#fff;font-weight:bold;cursor:pointer;';

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.textContent = 'Save Answer';
        submitBtn.disabled = true;
        submitBtn.style.cssText = 'flex:1;padding:10px;border-radius:6px;border:none;background:#2ecc71;color:#fff;font-weight:bold;cursor:pointer;';
        submitBtn.style.opacity = '0.6';

        const update = () => {
            const ok = (textarea.value || '').trim().length > 0;
            submitBtn.disabled = !ok;
            submitBtn.style.opacity = ok ? '1' : '0.6';
        };
        textarea.addEventListener('input', update);
        update();

        closeBtn.onclick = () => {
            if (this._activeDom) {
                this._activeDom.destroy();
                this._activeDom = null;
            }
            this.movementEnabled = true;
            if (this.input && this.input.keyboard) this.input.keyboard.resetKeys();
        };

        submitBtn.onclick = () => {
            const answer = (textarea.value || '').trim();
            if (!answer) return;

            this.answers[checkpoint.key] = answer;
            this.completed.add(checkpoint.key);

            checkpointRect.fillColor = 0x2ecc71;

            if (this._activeDom) {
                this._activeDom.destroy();
                this._activeDom = null;
            }

            this.movementEnabled = true;
            if (this.input && this.input.keyboard) this.input.keyboard.resetKeys();

            if (this.completed.size >= 3) {
                this.finishTask();
            }
        };

        btnRow.appendChild(closeBtn);
        btnRow.appendChild(submitBtn);
        wrap.appendChild(btnRow);

        this._activeDom = this.add.dom(this.cameras.main.width / 2, this.cameras.main.height / 2, wrap);
    }

    finishTask() {
        const taskId = 'task5';

        if (typeof gameState.taskAnswers !== 'object' || !gameState.taskAnswers) {
            gameState.taskAnswers = {};
        }
        gameState.taskAnswers[taskId] = {
            cp1: this.answers.cp1 || '',
            cp2: this.answers.cp2 || '',
            cp3: this.answers.cp3 || ''
        };

        const points = (TASKS && TASKS[taskId] && typeof TASKS[taskId].points === 'number') ? TASKS[taskId].points : 35;
        gameState.addPoints(points);
        gameState.completeTask(taskId);

        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.add.rectangle(w / 2, h / 2, 520, 120, 0x000000, 0.6);
        this.add.text(w / 2, h / 2, 'Maze complete!\nReturning to the village...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.time.delayedCall(900, () => {
            this.scene.start('GameScene');
            this.scene.start('UIScene');
        });
    }
}
