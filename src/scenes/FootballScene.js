// ===== FootballScene.js =====
// Story Task 2: football corner challenge with kick + question loop

class FootballScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FootballScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.movementEnabled = true;
        this._activeDom = null;
        this.answers = {};
        this.completedGoals = new Set();
        this.kickCount = 0;
        this.maxKicks = 4;
        this.currentTargetIndex = 0;
        this.ballInFlight = false;
        this._kickTween = null;
        this.lastKickAt = -99999;
        this.kickCooldownMs = 350;
        this.validHitWindowMs = 1400;
        this.lastKickDir = { x: 0, y: -1 };

        this.drawField(w, h);
        this.physics.world.setBounds(0, 0, w, h);

        this.player = new Player(this, w / 2, h - 120);
        this.player.body.setCollideWorldBounds(true);
        this.player.facing = 'up';

        this.ensureFootballSpriteCrops();
        if (!this.textures.exists('football_ball_trim') && !this.textures.exists('football_ball_img')) {
            this.createBallTexture();
        }

        let ballTextureKey = 'football_ball';
        if (this.textures.exists('football_ball_trim')) {
            ballTextureKey = 'football_ball_trim';
        } else if (this.textures.exists('football_ball_img')) {
            ballTextureKey = 'football_ball_img';
        }

        this.ball = this.physics.add.image(this.player.x + 38, this.player.y - 8, ballTextureKey);
        const ballDisplaySize = ballTextureKey === 'football_ball' ? 28 : 34;
        this.ball.setDisplaySize(ballDisplaySize, ballDisplaySize);
        this.ball.body.setSize(Math.floor(ballDisplaySize * 0.62), Math.floor(ballDisplaySize * 0.62), true);
        this.ball.setBounce(0.78, 0.78);
        this.ball.setCollideWorldBounds(true);
        this.ball.setDrag(130, 130);
        this.ball.setMaxVelocity(470, 470);
        this.ball.setDepth(this.ball.y + 20);

        this.ballShadow = this.add.ellipse(
            this.ball.x,
            this.ball.y + Math.floor(ballDisplaySize * 0.36),
            Math.floor(ballDisplaySize * 0.8),
            Math.floor(ballDisplaySize * 0.28),
            0x000000,
            0.28
        ).setDepth(this.ball.y + 10);

        this.physics.add.collider(this.player, this.ball);

        this._onKickKeyDown = (event) => {
            if (!event || event.repeat) return;
            if (this._activeDom || this.movementEnabled === false) return;
            const code = event.code;
            if (code === 'Space' || code === 'KeyE' || code === 'KeyF' || code === 'Enter') {
                this.tryKickBall(this.time.now);
            }
        };
        this.input.keyboard.on('keydown', this._onKickKeyDown);

        const goal = {
            x: Math.floor(w / 2 - 210),
            y: 108,
            width: 420,
            height: 132
        };

        let goalTextureKey = null;
        if (this.textures.exists('football_goal_trim')) {
            goalTextureKey = 'football_goal_trim';
        } else if (this.textures.exists('football_goalpost_img')) {
            goalTextureKey = 'football_goalpost_img';
        }

        let cornerPoints = {
            leftX: goal.x + 16,
            rightX: goal.x + goal.width - 16,
            topY: goal.y + 16,
            bottomY: goal.y + goal.height - 16
        };

        if (goalTextureKey) {
            const goalSprite = this.add.image(goal.x + goal.width / 2, goal.y + goal.height / 2 + 8, goalTextureKey).setDepth(3);
            goalSprite.setDisplaySize(goal.width + 70, goal.height + 58);
            this.goalSprite = goalSprite;

            const gb = goalSprite.getBounds();
            cornerPoints = {
                leftX: Math.floor(gb.left + gb.width * 0.23),
                rightX: Math.floor(gb.right - gb.width * 0.23),
                topY: Math.floor(gb.top + gb.height * 0.3),
                bottomY: Math.floor(gb.top + gb.height * 0.79)
            };
        } else {
            this.add.rectangle(goal.x + goal.width / 2, goal.y + goal.height / 2, goal.width, goal.height)
                .setStrokeStyle(5, 0xffffff, 0.95)
                .setFillStyle(0x0b2d12, 0.12)
                .setDepth(2);

            this.add.rectangle(goal.x, goal.y + goal.height / 2, 12, goal.height + 10, 0xffffff, 0.95).setOrigin(0.5).setDepth(2);
            this.add.rectangle(goal.x + goal.width, goal.y + goal.height / 2, 12, goal.height + 10, 0xffffff, 0.95).setOrigin(0.5).setDepth(2);
        }

        const questions = this.getGoalQuestions();
        const targets = [
            { key: 'topLeft', x: cornerPoints.leftX, y: cornerPoints.topY, label: 'Left Top Corner', question: questions[0] },
            { key: 'topRight', x: cornerPoints.rightX, y: cornerPoints.topY, label: 'Right Top Corner', question: questions[1] },
            { key: 'bottomLeft', x: cornerPoints.leftX, y: cornerPoints.bottomY, label: 'Left Bottom Corner', question: questions[2] },
            { key: 'bottomRight', x: cornerPoints.rightX, y: cornerPoints.bottomY, label: 'Right Bottom Corner', question: questions[3] }
        ];

        this.goalObjects = targets.map((t, i) => {
            const marker = this.add.circle(t.x, t.y, 17, 0xffd166, 0.38).setStrokeStyle(3, 0xffffff, 0.95).setDepth(6);
            const markerText = this.add.text(t.x, t.y - 26, String(i + 1), {
                fontFamily: '"Press Start 2P"',
                fontSize: '12px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(6);

            const zone = this.add.zone(t.x, t.y, 38, 38);
            this.physics.add.existing(zone, true);

            this.physics.add.overlap(this.ball, zone, () => this.onCornerHit(t, marker, markerText));

            return { ...t, index: i, marker, markerText, zone };
        });

        this.hudText = this.add.text(w / 2, 68, '', {
            fontFamily: 'sans-serif',
            fontSize: '16px',
            color: '#eef7ee'
        }).setOrigin(0.5).setDepth(10);

        this.hintText = this.add.text(w / 2, h - 28, 'Move near ball and press SPACE/E/F.', {
            fontFamily: 'sans-serif',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(10);

        this.updateHud();

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this._onKickKeyDown && this.input?.keyboard) {
                this.input.keyboard.off('keydown', this._onKickKeyDown);
            }
            if (this._kickTween) {
                this._kickTween.remove();
                this._kickTween = null;
            }
            if (this._activeDom) {
                this._activeDom.destroy();
                this._activeDom = null;
            }
            if (this.input?.keyboard) {
                this.input.keyboard.enabled = true;
            }
        });
    }

    drawField(w, h) {
        if (this.textures.exists('football_ground_img')) {
            const field = this.add.image(w / 2, h / 2, 'football_ground_img').setDepth(0);
            // Cover the whole canvas (no background border) while preserving aspect ratio
            const sx = w / (field.width || 1);
            const sy = h / (field.height || 1);
            field.setScale(Math.max(sx, sy));
        } else {
            this.add.rectangle(w / 2, h / 2, w, h, 0x2d8540).setDepth(0);
        }

        this.add.text(w / 2, 34, 'PLAYGROUND FOOTBALL', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(10);
    }

    ensureFootballSpriteCrops() {
        const makeTrimmed = (srcKey, dstKey, pad = 2) => {
            if (!this.textures.exists(srcKey) || this.textures.exists(dstKey)) return;

            const srcImg = this.textures.get(srcKey)?.getSourceImage?.();
            if (!srcImg || !srcImg.width || !srcImg.height) return;

            const c = document.createElement('canvas');
            c.width = srcImg.width;
            c.height = srcImg.height;
            const cctx = c.getContext('2d');
            cctx.clearRect(0, 0, c.width, c.height);
            cctx.drawImage(srcImg, 0, 0);

            const data = cctx.getImageData(0, 0, c.width, c.height).data;
            let minX = c.width;
            let minY = c.height;
            let maxX = -1;
            let maxY = -1;

            for (let y = 0; y < c.height; y++) {
                for (let x = 0; x < c.width; x++) {
                    const a = data[(y * c.width + x) * 4 + 3];
                    if (a > 8) {
                        if (x < minX) minX = x;
                        if (y < minY) minY = y;
                        if (x > maxX) maxX = x;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            if (maxX < minX || maxY < minY) return;

            minX = Math.max(0, minX - pad);
            minY = Math.max(0, minY - pad);
            maxX = Math.min(c.width - 1, maxX + pad);
            maxY = Math.min(c.height - 1, maxY + pad);

            const w = maxX - minX + 1;
            const h = maxY - minY + 1;

            const out = document.createElement('canvas');
            out.width = w;
            out.height = h;
            const octx = out.getContext('2d');
            octx.imageSmoothingEnabled = false;
            octx.clearRect(0, 0, w, h);
            octx.drawImage(srcImg, minX, minY, w, h, 0, 0, w, h);

            this.textures.addCanvas(dstKey, out);
        };

        makeTrimmed('football_ball_img', 'football_ball_trim', 1);
        makeTrimmed('football_goalpost_img', 'football_goal_trim', 1);
    }

    createBallTexture() {
        if (this.textures.exists('football_ball')) return;

        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff, 1);
        g.fillCircle(12, 12, 12);
        g.lineStyle(2, 0x111111, 1);
        g.strokeCircle(12, 12, 12);
        g.fillStyle(0x111111, 1);
        g.fillCircle(12, 12, 3);
        g.generateTexture('football_ball', 24, 24);
        g.destroy();
    }

    getGoalQuestions() {
        const taskQuestions = TASKS?.task2?.goalQuestions;
        if (Array.isArray(taskQuestions) && taskQuestions.length >= 4) {
            return taskQuestions.slice(0, 4);
        }
        return [
            'What is one clear goal for your project?',
            'Who benefits most if you solve this well?',
            'What is the hardest obstacle right now?',
            'What would success look like in one sentence?'
        ];
    }

    update(time) {
        if (this.player) this.player.update();

        if (this.ball) {
            this.ball.setDepth(this.ball.y + 20);
            if (this.ballShadow) {
                const speed = this.ball.body?.speed || 0;
                const shadowScale = Phaser.Math.Clamp(1 - speed / 900, 0.72, 1);
                this.ballShadow.setPosition(this.ball.x, this.ball.y + Math.floor(this.ball.displayHeight * 0.36));
                this.ballShadow.setScale(shadowScale, shadowScale);
                this.ballShadow.setDepth(this.ball.y + 10);
            }
        }
    }

    tryKickBall(time) {
        if (!this.ball || !this.player || this._activeDom || this.movementEnabled === false) return;
        if (time < this.lastKickAt + this.kickCooldownMs) return;
        if (this.ballInFlight) return;

        if (this.kickCount >= this.maxKicks) {
            this.flashHint('All 4 kicks are used. Answer the active question to continue.');
            return;
        }

        if (this.currentTargetIndex >= this.goalObjects.length) return;

        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.ball.x, this.ball.y);
        if (dist > 90) {
            this.flashHint('Move closer to the ball before kicking.');
            return;
        }

        const target = this.goalObjects[this.currentTargetIndex];
        this.kickToTarget(target);
        this.lastKickAt = time;
        this.kickCount += 1;
        this.updateHud();
    }

    kickToTarget(target) {
        if (!target || !this.ball) return;

        const startX = this.player.x;
        const startY = this.player.y + Math.max(8, Math.floor((this.player.displayHeight || 32) * 0.3));
        this.ball.setPosition(startX, startY);

        const dx = target.x - startX;
        const dy = target.y - startY;
        const dist = Math.hypot(dx, dy) || 1;
        const dir = { x: dx / dist, y: dy / dist };

        this.lastKickDir = dir;
        this.ballInFlight = true;
        this.movementEnabled = false;

        this.ball.setVelocity(0, 0);
        this.ball.setAngularVelocity(0);

        if (this._kickTween) {
            this._kickTween.remove();
            this._kickTween = null;
        }

        const travelMs = Phaser.Math.Clamp(Math.floor(dist * 1.5), 280, 720);
        this._kickTween = this.tweens.add({
            targets: this.ball,
            x: target.x,
            y: target.y,
            duration: travelMs,
            ease: 'Linear',
            onUpdate: () => {
                this.ball.rotation += 0.2;
            },
            onComplete: () => {
                this._kickTween = null;
                if (!this.ballInFlight || this._activeDom) return;
                this.onCornerHit(target, target.marker, target.markerText, true);
            }
        });
    }

    getKickDirection() {
        const body = this.player?.body;
        const vx = body?.velocity?.x || 0;
        const vy = body?.velocity?.y || 0;

        if (Math.abs(vx) + Math.abs(vy) > 15) {
            const len = Math.hypot(vx, vy) || 1;
            return { x: vx / len, y: vy / len };
        }

        const facing = this.player?.facing || 'up';
        if (facing === 'left') return { x: -1, y: 0 };
        if (facing === 'right') return { x: 1, y: 0 };
        if (facing === 'down') return { x: 0, y: 1 };
        return { x: 0, y: -1 };
    }

    onCornerHit(goal, marker, label, force = false) {
        if (this._activeDom || this.completedGoals.has(goal.key)) return;

        const expected = this.goalObjects[this.currentTargetIndex];
        if (!expected || goal.key !== expected.key) return;

        if (!force) {
            const sinceKick = this.time.now - this.lastKickAt;
            const speed = this.ball?.body?.speed || 0;
            if (sinceKick > this.validHitWindowMs || speed < 110) return;
        }

        if (this._kickTween) {
            this._kickTween.remove();
            this._kickTween = null;
        }

        this.ballInFlight = false;
        this.ball.setVelocity(0, 0);
        this.ball.setAngularVelocity(0);
        this.openQuestion(goal, marker, label);
    }

    openQuestion(goal, marker, label) {
        this.movementEnabled = false;
        if (this.input?.keyboard) {
            this.input.keyboard.resetKeys();
            this.input.keyboard.enabled = false;
        }

        const wrap = document.createElement('div');
        wrap.style.cssText = [
            'width: 620px',
            'max-width: 92vw',
            'background: rgba(30, 32, 52, 0.98)',
            'border: 3px solid #a9a9a9',
            'border-radius: 12px',
            'padding: 18px',
            'color: #fff',
            'font-family: "Press Start 2P", sans-serif',
            'font-size: 12px'
        ].join(';') + ';';

        const title = document.createElement('div');
        title.textContent = `Corner: ${goal.label}`;
        title.style.cssText = 'text-align:center;color:#f1c40f;margin-bottom:12px;font-size:14px;';
        wrap.appendChild(title);

        const q = document.createElement('div');
        q.textContent = goal.question;
        q.style.cssText = 'background:rgba(255,255,255,0.12);padding:10px;border-radius:8px;margin-bottom:12px;line-height:1.5;';
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

        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:10px;justify-content:center;margin-top:14px;';

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.textContent = 'Save Answer & Continue';
        submitBtn.disabled = true;
        submitBtn.style.cssText = 'padding:10px 16px;border-radius:6px;border:none;background:#2ecc71;color:#fff;font-weight:bold;cursor:pointer;opacity:0.6;';

        const updateState = () => {
            const ok = (textarea.value || '').trim().length > 0;
            submitBtn.disabled = !ok;
            submitBtn.style.opacity = ok ? '1' : '0.6';
        };
        textarea.addEventListener('input', updateState);
        updateState();

        submitBtn.onclick = () => {
            const answer = (textarea.value || '').trim();
            if (!answer) return;

            this.answers[goal.key] = answer;
            this.completedGoals.add(goal.key);
            this.currentTargetIndex += 1;
            marker.setFillStyle(0x2ecc71, 0.85);
            label.setColor('#c8ffd2');
            this.updateHud();

            if (this._activeDom) {
                this._activeDom.destroy();
                this._activeDom = null;
            }

            this.movementEnabled = true;
            if (this.input?.keyboard) {
                this.input.keyboard.enabled = true;
                this.input.keyboard.resetKeys();
            }

            const w = this.cameras.main.width;
            const h = this.cameras.main.height;
            const next = this.goalObjects[this.currentTargetIndex] || null;
            const toward = next || { x: this.player.x, y: this.player.y - 42 };
            const vx = toward.x - this.player.x;
            const vy = toward.y - this.player.y;
            const len = Math.hypot(vx, vy) || 1;
            const dropX = Phaser.Math.Clamp(this.player.x + (vx / len) * 42, 20, w - 20);
            const dropY = Phaser.Math.Clamp(this.player.y + (vy / len) * 42, 20, h - 20);
            this.ball.setPosition(dropX, dropY);
            this.ball.setVelocity(0, 0);
            this.ball.setAngularVelocity(0);
            this.ballInFlight = false;
            this.movementEnabled = true;

            if (this.completedGoals.size >= 4) {
                this.finishTask();
            }
        };

        row.appendChild(submitBtn);
        wrap.appendChild(row);

        this._activeDom = this.add.dom(this.cameras.main.width / 2, this.cameras.main.height / 2, wrap);
        this._activeDom.setDepth(200);
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }

    updateHud() {
        if (!this.hudText) return;
        const nextNum = this.completedGoals.size >= 4 ? '-' : String(this.currentTargetIndex + 1);
        const left = Math.max(0, this.maxKicks - this.kickCount);
        this.hudText.setText(`Corners hit: ${this.completedGoals.size}/4  |  Kicks left: ${left}  |  Next: ${nextNum}`);
    }

    flashHint(message) {
        if (!this.hintText) return;
        this.hintText.setText(message);
        this.tweens.killTweensOf(this.hintText);
        this.hintText.setAlpha(1);
        this.tweens.add({
            targets: this.hintText,
            alpha: 0.55,
            duration: 500,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.hintText.setText('Move near ball and press SPACE/E/F. Kicks auto-aim to targets 1 -> 4.');
                this.hintText.setAlpha(1);
            }
        });
    }

    finishTask() {
        const taskId = 'task2';

        if (!gameState.taskAnswers || typeof gameState.taskAnswers !== 'object') {
            gameState.taskAnswers = {};
        }

        gameState.taskAnswers[taskId] = {
            topLeft: this.answers.topLeft || '',
            topRight: this.answers.topRight || '',
            bottomLeft: this.answers.bottomLeft || '',
            bottomRight: this.answers.bottomRight || ''
        };

        const points = (TASKS && TASKS[taskId] && typeof TASKS[taskId].points === 'number') ? TASKS[taskId].points : 30;
        gameState.addPoints(points);
        gameState.completeTask(taskId);

        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.add.rectangle(w / 2, h / 2, 560, 126, 0x000000, 0.65).setDepth(220);
        this.add.text(w / 2, h / 2, 'Challenge complete!\nReturning to the city...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(221);

        this.time.delayedCall(900, () => {
            this.scene.start('GameScene');
            this.scene.start('UIScene');
        });
    }
}
