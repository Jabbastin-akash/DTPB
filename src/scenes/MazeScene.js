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

        this.add.rectangle(w / 2, h / 2, w, h, 0x0b1220);

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

        const maze = this.buildMazeLayout(w, h);
        this.maze = maze;

        this.physics.world.setBounds(maze.bounds.x, maze.bounds.y, maze.bounds.w, maze.bounds.h);

        this.player = new Player(this, maze.start.x, maze.start.y);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.checkCollision.none = false;
        this.player.body.setBounce(0);

        // Improve collision stability at higher speeds
        this.physics.world.TILE_BIAS = 32;

        this.walls = [];
        const makeWall = (x, y, ww, hh) => {
            const r = this.add.rectangle(x + ww / 2, y + hh / 2, ww, hh, 0x394864).setDepth(2);
            this.physics.add.existing(r, true);
            r.body.checkCollision.none = false;
            this.physics.add.collider(this.player, r);
            this.walls.push(r);
        };

        maze.wallRects.forEach(r => makeWall(r.x, r.y, r.w, r.h));

        this.answers = {};
        this.completed = new Set();

        const checkpointQuestions = [
            'Checkpoint 1: What is the problem again in 1 sentence?',
            'Checkpoint 2: What emotion is most important to solve?',
            'Checkpoint 3: Name one simple solution idea.'
        ];

        const checkpoints = maze.checkpointCells.map((cell, idx) => {
            const p = this.cellToWorld(cell, maze);
            return {
                key: `cp${idx + 1}`,
                x: p.x,
                y: p.y,
                label: `CP${idx + 1}`,
                question: checkpointQuestions[idx]
            };
        });

        this.checkpointObjects = checkpoints.map(cp => {
            const rect = this.add.rectangle(cp.x, cp.y, 74, 54, 0xf59e0b, 0.95).setOrigin(0.5).setDepth(4);
            rect.setStrokeStyle(4, 0xffffff, 0.9);
            this.physics.add.existing(rect, true);

            const txt = this.add.text(cp.x, cp.y, cp.label, {
                fontFamily: '"Press Start 2P"',
                fontSize: '11px',
                color: '#111827',
                stroke: '#ffffff',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(5);

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
            if (this.input?.keyboard) {
                this.input.keyboard.enabled = true;
            }
        });
    }

    buildMazeLayout(w, h) {
        const cols = 9;
        const rows = 6;
        const top = 110;
        const horizontalPad = 22;
        const verticalPad = 16;

        const maxCellW = Math.floor((w - horizontalPad * 2) / cols);
        const maxCellH = Math.floor((h - top - verticalPad * 2) / rows);
        const cellSize = Math.max(72, Math.min(maxCellW, maxCellH));
        const wall = Math.max(12, Math.floor(cellSize * 0.14));

        const mazeW = cols * cellSize;
        const mazeH = rows * cellSize;
        const originX = Math.floor((w - mazeW) / 2);
        const originY = top + Math.floor((h - top - mazeH) / 2);

        const startCell = { x: 0, y: rows - 1 };
        const cells = this.generateMazeCells(cols, rows, startCell.x, startCell.y);
        const checkpointCells = this.findCheckpointCells(cells, startCell.x, startCell.y, 3);

        const wallRects = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cell = cells[y][x];
                const px = originX + x * cellSize;
                const py = originY + y * cellSize;

                if (cell.walls.top) wallRects.push({ x: px, y: py, w: cellSize, h: wall });
                if (cell.walls.left) wallRects.push({ x: px, y: py, w: wall, h: cellSize });
                if (y === rows - 1 && cell.walls.bottom) wallRects.push({ x: px, y: py + cellSize - wall, w: cellSize, h: wall });
                if (x === cols - 1 && cell.walls.right) wallRects.push({ x: px + cellSize - wall, y: py, w: wall, h: cellSize });
            }
        }

        const start = this.cellToWorld(startCell, { originX, originY, cellSize });

        return {
            cols,
            rows,
            cellSize,
            wall,
            originX,
            originY,
            wallRects,
            checkpointCells,
            start,
            bounds: { x: originX, y: originY, w: mazeW, h: mazeH }
        };
    }

    generateMazeCells(cols, rows, startX, startY) {
        const cells = Array.from({ length: rows }, (_, y) =>
            Array.from({ length: cols }, (_, x) => ({
                x,
                y,
                visited: false,
                walls: { top: true, right: true, bottom: true, left: true }
            }))
        );

        let seed = 1337;
        const rand = () => {
            seed = (seed * 1664525 + 1013904223) >>> 0;
            return seed / 4294967296;
        };

        const stack = [];
        const first = cells[startY][startX];
        first.visited = true;
        stack.push(first);

        const dirs = [
            { dx: 0, dy: -1, from: 'top', to: 'bottom' },
            { dx: 1, dy: 0, from: 'right', to: 'left' },
            { dx: 0, dy: 1, from: 'bottom', to: 'top' },
            { dx: -1, dy: 0, from: 'left', to: 'right' }
        ];

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const options = [];

            for (const d of dirs) {
                const nx = current.x + d.dx;
                const ny = current.y + d.dy;
                if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                const next = cells[ny][nx];
                if (!next.visited) {
                    options.push({ next, from: d.from, to: d.to });
                }
            }

            if (options.length === 0) {
                stack.pop();
                continue;
            }

            const pick = options[Math.floor(rand() * options.length)];
            current.walls[pick.from] = false;
            pick.next.walls[pick.to] = false;
            pick.next.visited = true;
            stack.push(pick.next);
        }

        return cells;
    }

    findCheckpointCells(cells, startX, startY, count) {
        const rows = cells.length;
        const cols = cells[0].length;
        const dist = Array.from({ length: rows }, () => Array(cols).fill(-1));

        const q = [{ x: startX, y: startY }];
        dist[startY][startX] = 0;

        while (q.length > 0) {
            const cur = q.shift();
            const cell = cells[cur.y][cur.x];

            const neighbors = [
                { ok: !cell.walls.top, x: cur.x, y: cur.y - 1 },
                { ok: !cell.walls.right, x: cur.x + 1, y: cur.y },
                { ok: !cell.walls.bottom, x: cur.x, y: cur.y + 1 },
                { ok: !cell.walls.left, x: cur.x - 1, y: cur.y }
            ];

            for (const n of neighbors) {
                if (!n.ok) continue;
                if (n.x < 0 || n.x >= cols || n.y < 0 || n.y >= rows) continue;
                if (dist[n.y][n.x] !== -1) continue;
                dist[n.y][n.x] = dist[cur.y][cur.x] + 1;
                q.push({ x: n.x, y: n.y });
            }
        }

        const ranked = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (x === startX && y === startY) continue;
                if (dist[y][x] < 0) continue;
                ranked.push({ x, y, d: dist[y][x] });
            }
        }
        ranked.sort((a, b) => b.d - a.d);

        const picks = [];
        const minGap = 3;
        for (const c of ranked) {
            const farEnough = picks.every(p => Math.abs(p.x - c.x) + Math.abs(p.y - c.y) >= minGap);
            if (!farEnough) continue;
            picks.push({ x: c.x, y: c.y });
            if (picks.length >= count) break;
        }

        for (const c of ranked) {
            if (picks.length >= count) break;
            if (!picks.some(p => p.x === c.x && p.y === c.y)) {
                picks.push({ x: c.x, y: c.y });
            }
        }

        return picks.slice(0, count);
    }

    cellToWorld(cell, layout) {
        return {
            x: Math.floor(layout.originX + cell.x * layout.cellSize + layout.cellSize / 2),
            y: Math.floor(layout.originY + cell.y * layout.cellSize + layout.cellSize / 2)
        };
    }

    update() {
        if (!this.movementEnabled) {
            if (this.player && this.player.body) {
                this.player.body.setVelocity(0, 0);
                if (this.player.animName && !this.player.animName.endsWith("_idle")) {
                    this.player.animName = this.player.animName.replace("_walk", "_idle");
                    this.player.play(this.player.animName, true);
                }
            }
            return;
        }
        if (this.player && typeof this.player.update === "function") {
            this.player.update();
        } else if (this.player) {
            // Basic fallback movement if player class is missing update logic
            const speed = 120;
            const keys = this.input.keyboard.createCursorKeys();
            let vx = 0;
            let vy = 0;
            if (keys.left.isDown) vx = -speed;
            else if (keys.right.isDown) vx = speed;
            if (keys.up.isDown) vy = -speed;
            else if (keys.down.isDown) vy = speed;
            if (vx !== 0 && vy !== 0) {
                vx *= 0.7071; vy *= 0.7071;
            }
            if (this.player.body) this.player.body.setVelocity(vx, vy);
        }
    }

    openQuestion(checkpoint, checkpointRect) {
        this.movementEnabled = false;
        if (this.input?.keyboard) {
            this.input.keyboard.resetKeys();
            this.input.keyboard.enabled = false;
        }

        const wrap = document.createElement('div');
        wrap.style.cssText = `
            width: 620px;
            max-width: 92vw;
            background: rgba(40, 40, 80, 0.98);
            border: 3px solid #a9a9a9;
            border-radius: 12px;
            padding: 18px;
            color: #fff;
            font-family: Arial, sans-serif;
            font-size: 14px;
        `;

        const title = document.createElement('div');
        title.textContent = checkpoint.label;
        title.style.cssText = 'text-align:center;color:#f1c40f;margin-bottom:12px;font-size:28px;font-family:"Press Start 2P", sans-serif;';
        wrap.appendChild(title);

        const q = document.createElement('div');
        q.textContent = checkpoint.question;
        q.style.cssText = 'background:rgba(255,255,255,0.12);padding:10px;border-radius:8px;margin-bottom:12px;line-height:1.35;font-size:14px;font-family:"Press Start 2P", sans-serif;';
        wrap.appendChild(q);

        const textarea = document.createElement('textarea');
        textarea.rows = 3;
        textarea.placeholder = 'Type your answer...';
        textarea.style.cssText = [
            'width:100%',
            'box-sizing:border-box',
            'padding:10px',
            'border-radius:6px',
            'border:2px solid #ccc',
            'font-family: Arial, sans-serif',
            'font-size:16px',
            'line-height:1.35'
        ].join(';') + ';';
        textarea.addEventListener('keydown', (e) => e.stopPropagation());
        textarea.addEventListener('keyup', (e) => e.stopPropagation());
        textarea.spellcheck = false;
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
            if (this.input?.keyboard) {
                this.input.keyboard.enabled = true;
                this.input.keyboard.resetKeys();
            }
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
            if (this.input?.keyboard) {
                this.input.keyboard.enabled = true;
                this.input.keyboard.resetKeys();
            }

            if (this.completed.size >= 3) {
                this.finishTask();
            }
        };

        btnRow.appendChild(closeBtn);
        btnRow.appendChild(submitBtn);
        wrap.appendChild(btnRow);

        this._activeDom = this.add.dom(this.cameras.main.width / 2, this.cameras.main.height / 2, wrap);
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
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
