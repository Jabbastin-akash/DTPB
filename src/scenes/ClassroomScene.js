// ===== ClassroomScene.js =====
// Separate scene for Task 3a: interview notes in the classroom.

class ClassroomScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ClassroomScene' });
        this._onEsc = null;
        this.dialogDom = null;
        this.teacherSprite = null;

        this.canvasWrapEl = null;
        this.drawingCanvas = null;
        this.drawingHasInk = false;
    }

    create() {
        try {
            const w = this.cameras.main.width;
            const h = this.cameras.main.height;

            // Conversation-only scene (like Task1ConversationScene)
            this.movementEnabled = false;
            if (this.physics?.world) {
                this.physics.world.setBounds(0, 0, w, h);
            }

            this.add.rectangle(w / 2, h / 2, w, h, 0x1a2238).setDepth(0);

            if (this.textures.exists('class_src')) {
                const bg = this.add.image(w / 2, h / 2, 'class_src').setDepth(1);
                const targetW = w * 0.92;
                const targetH = h * 0.92;
                const scale = Math.min(targetW / bg.width, targetH / bg.height);
                bg.setScale(scale);
            }

            this.add.text(w / 2, 38, 'CLASSROOM CONVERSATION', {
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

            this.answers = {
                name: '',
                problem: '',
                feelings: ''
            };

            const taskId = 'task3a';
            const teacherName = (TASKS?.[taskId]?.npcName) ? `Teacher ${TASKS[taskId].npcName}` : 'Teacher';

            this.steps = [
                {
                    key: 'name',
                    minLength: 2,
                    teacherLine: 'What is their name?',
                    placeholder: 'Example: Amina'
                },
                {
                    key: 'problem',
                    minLength: 10,
                    teacherLine: 'What problem are they facing?',
                    placeholder: 'Example: She forgets her water bottle and feels thirsty in class.'
                },
                {
                    key: 'feelings',
                    minLength: 10,
                    teacherLine: 'How do they feel about it?',
                    placeholder: 'Example: She feels embarrassed and frustrated.'
                },
                {
                    key: 'drawing',
                    minLength: 0,
                    teacherLine: 'Draw your user (optional — earns bonus points!)',
                    placeholder: ''
                }
            ];
            this.teacherName = teacherName;
            this.currentStep = 0;

            // If the task isn't unlocked (player skipped ahead), show the locked message and return.
            if (!gameState?.isTaskUnlocked?.(taskId)) {
                const lockedMsg = TASKS?.[taskId]?.dialogue?.locked || 'You need to finish the previous task first.';
                this.add.rectangle(w / 2, h / 2, 680, 160, 0x000000, 0.65).setDepth(40);
                this.add.text(w / 2, h / 2, lockedMsg, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '12px',
                    color: '#ffffff',
                    align: 'center',
                    wordWrap: { width: 640 }
                }).setOrigin(0.5).setDepth(41);
                this.time.delayedCall(900, () => this.returnToWorld());
                return;
            }

            // If already complete, just show a message.
            if (gameState?.isTaskComplete?.(taskId)) {
                const doneMsg = TASKS?.[taskId]?.dialogue?.complete || 'Already completed.';
                this.add.rectangle(w / 2, h / 2, 680, 160, 0x000000, 0.65).setDepth(40);
                this.add.text(w / 2, h / 2, doneMsg, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '12px',
                    color: '#ffffff',
                    align: 'center',
                    wordWrap: { width: 640 }
                }).setOrigin(0.5).setDepth(41);
                this.time.delayedCall(900, () => this.returnToWorld());
                return;
            }

            this.drawCharacters(w, h);
            this.createConversationPanel(w, h);
            this.showStep(0);

            this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
                if (this._onEsc && this.input?.keyboard) this.input.keyboard.off('keydown-ESC', this._onEsc);

                if (this.dialogDom) {
                    this.dialogDom.destroy();
                    this.dialogDom = null;
                }

                this.canvasWrapEl = null;
                this.drawingCanvas = null;
                this.drawingHasInk = false;

                if (this.teacherSprite) {
                    this.teacherSprite.destroy();
                    this.teacherSprite = null;
                }

                if (this.player) {
                    this.player.destroy();
                    this.player = null;
                }

                if (this.input?.keyboard) {
                    this.input.keyboard.enabled = true;
                    this.input.keyboard.resetKeys();
                }
            });
        } catch (err) {
            // Surface the error in-game so it's not a silent blank screen.
            // eslint-disable-next-line no-console
            console.error(err);
            const w = this.cameras.main.width;
            const h = this.cameras.main.height;
            const msg = (err?.stack) ? String(err.stack) : String(err);
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

    drawCharacters(w, h) {
        const characterScale = gameState?.characterScale ?? 1;
        const npcScale = gameState?.npcScale ?? characterScale;
        const playerConvoSize = Math.max(72, Math.round(72 * characterScale));
        const npcConvoSize = Math.max(72, Math.round(72 * npcScale));

        // Teacher sprite (task3a NPC sheet)
        const teacherKey = this.textures.exists('task3a') ? 'task3a' : 'guide';
        this.teacherSprite = this.add.sprite(w / 2 - 60, h / 2 + 80, teacherKey).setDepth(5);
        this.teacherSprite.setDisplaySize(npcConvoSize, npcConvoSize);
        if (this.anims.exists(`${teacherKey}_idle_right`)) {
            // Face toward the player
            this.teacherSprite.play(`${teacherKey}_idle_right`);
        } else if (this.anims.exists(`${teacherKey}_idle_down`)) {
            this.teacherSprite.play(`${teacherKey}_idle_down`);
        }

        // Player sprite
        this.player = new Player(this, w / 2 + 60, h / 2 + 80);
        this.player.setDepth(5);
        this.player.setDisplaySize(playerConvoSize, playerConvoSize);
        this.player.facing = 'left';
        if (this.anims.exists(`${this.player.spriteKey}_idle_left`)) {
            this.player.anims.play(`${this.player.spriteKey}_idle_left`, true);
        }
    }

    createConversationPanel(w, h) {
        const panel = document.createElement('div');
        panel.style.cssText = [
            'width: 760px',
            'max-width: 92vw',
            'max-height: 82vh',
            'overflow-y: auto',
            'overscroll-behavior: contain',
            '-webkit-overflow-scrolling: touch',
            'background: rgba(28, 33, 54, 0.97)',
            'border: 3px solid #a9a9a9',
            'border-radius: 14px',
            'padding: 16px',
            'color: #fff',
            'font-family: "Press Start 2P", sans-serif',
            'font-size: 12px'
        ].join(';') + ';';

        const speech = document.createElement('div');
        speech.style.cssText = 'background: rgba(255,255,255,0.10); border-radius: 10px; padding: 12px; line-height: 1.45; margin-bottom: 10px;';
        panel.appendChild(speech);
        this.speechEl = speech;

        const answer = document.createElement('textarea');
        answer.rows = 3;
        answer.placeholder = 'Type your response...';
        answer.style.cssText = [
            'width: 100%',
            'box-sizing: border-box',
            'padding: 10px',
            'border-radius: 8px',
            'border: 2px solid #7f8fb0',
            'font-family: Arial, sans-serif',
            'font-size: 16px',
            'line-height: 1.35',
            'color: #1f2937',
            'background: rgba(255,255,255,0.98)'
        ].join(';') + ';';
        answer.addEventListener('keydown', (e) => e.stopPropagation());
        answer.addEventListener('keyup', (e) => e.stopPropagation());
        answer.addEventListener('focus', () => {
            this.movementEnabled = false;
        });
        answer.addEventListener('blur', () => {
            this.movementEnabled = false;
        });
        answer.spellcheck = false;
        panel.appendChild(answer);
        this.answerEl = answer;

        const counter = document.createElement('div');
        counter.style.cssText = 'margin-top: 8px; font-size: 11px; color: #ffb3b3;';
        counter.innerText = '0/10 characters';
        panel.appendChild(counter);
        this.counterEl = counter;

        // Optional drawing step (hidden unless on the drawing step)
        const canvasWrap = document.createElement('div');
        canvasWrap.style.cssText = 'margin-top: 10px; display:none;';

        const toolbar = document.createElement('div');
        toolbar.style.cssText = 'display:flex; gap:8px; margin-bottom:8px; align-items:center;';

        const colors = ['#333333', '#E24B4A', '#378ADD', '#639922'];
        let activeColor = colors[0];

        const pencilBtn = document.createElement('button');
        pencilBtn.type = 'button';
        pencilBtn.innerText = '✏️ Pencil';
        toolbar.appendChild(pencilBtn);

        const eraserBtn = document.createElement('button');
        eraserBtn.type = 'button';
        eraserBtn.innerText = 'Eraser';
        toolbar.appendChild(eraserBtn);

        colors.forEach(c => {
            const swatch = document.createElement('button');
            swatch.type = 'button';
            swatch.style.backgroundColor = c;
            swatch.style.width = '28px';
            swatch.style.height = '28px';
            swatch.style.border = '2px solid white';
            swatch.style.borderRadius = '50%';
            swatch.onclick = (e) => { e.preventDefault(); activeColor = c; };
            toolbar.appendChild(swatch);
        });

        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.innerText = 'Clear';
        clearBtn.style.marginLeft = 'auto';
        toolbar.appendChild(clearBtn);

        canvasWrap.appendChild(toolbar);

        const canvas = document.createElement('canvas');
        canvas.width = 540;
        canvas.height = 200;
        canvas.style.backgroundColor = '#fff';
        canvas.style.border = '2px solid #aaa';
        canvas.style.borderRadius = '4px';
        canvas.style.cursor = 'crosshair';

        const ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        const setPencil = () => {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = 2;
        };

        const setEraser = () => {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 15;
        };

        pencilBtn.onclick = (e) => { e.preventDefault(); setPencil(); };
        eraserBtn.onclick = (e) => { e.preventDefault(); setEraser(); };
        clearBtn.onclick = (e) => {
            e.preventDefault();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.drawingHasInk = false;
        };

        let painting = false;
        let lastX = 0;
        let lastY = 0;

        const getPos = (ev) => {
            const rect = canvas.getBoundingClientRect();
            const t0 = ev.touches?.[0];
            const clientX = t0 ? t0.clientX : ev.clientX;
            const clientY = t0 ? t0.clientY : ev.clientY;
            const x = (clientX - rect.left) * (canvas.width / rect.width);
            const y = (clientY - rect.top) * (canvas.height / rect.height);
            return { x, y };
        };

        const startPaint = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            painting = true;
            const pos = getPos(ev);
            lastX = pos.x;
            lastY = pos.y;
        };

        const paint = (ev) => {
            if (!painting) return;
            ev.preventDefault();
            ev.stopPropagation();
            const pos = getPos(ev);
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            lastX = pos.x;
            lastY = pos.y;
            this.drawingHasInk = true;
        };

        const endPaint = (ev) => {
            if (!painting) return;
            ev.preventDefault();
            ev.stopPropagation();
            painting = false;
        };

        canvas.addEventListener('mousedown', startPaint);
        canvas.addEventListener('mousemove', paint);
        globalThis.addEventListener('mouseup', endPaint);

        canvas.addEventListener('touchstart', startPaint, { passive: false });
        canvas.addEventListener('touchmove', paint, { passive: false });
        globalThis.addEventListener('touchend', endPaint, { passive: false });

        // Make sure the default tool is pencil
        setPencil();

        canvasWrap.appendChild(canvas);
        panel.appendChild(canvasWrap);

        this.canvasWrapEl = canvasWrap;
        this.drawingCanvas = canvas;

        const actions = document.createElement('div');
        actions.style.cssText = 'display:flex; gap:10px; margin-top: 12px;';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.innerText = 'Back';
        cancelBtn.style.cssText = 'flex:1; padding:10px; border:none; border-radius:8px; background:#e74c3c; color:#fff; font-weight:bold; cursor:pointer;';
        cancelBtn.onclick = () => this.returnToWorld();

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.innerText = 'Next';
        nextBtn.disabled = true;
        nextBtn.style.cssText = 'flex:1; padding:10px; border:none; border-radius:8px; background:#2ecc71; color:#fff; font-weight:bold; cursor:pointer; opacity:0.6;';
        nextBtn.onclick = () => this.onNextStep();

        actions.appendChild(cancelBtn);
        actions.appendChild(nextBtn);
        panel.appendChild(actions);

        this.nextBtn = nextBtn;

        answer.addEventListener('input', () => {
            const step = this.steps[this.currentStep];
            if (step?.key === 'drawing') {
                // drawing step has no text validation
                this.counterEl.innerText = '';
                this.nextBtn.disabled = false;
                this.nextBtn.style.opacity = '1';
                return;
            }
            const len = (answer.value || '').trim().length;
            const ready = len >= step.minLength;

            this.counterEl.innerText = `${len}/${step.minLength} characters`;
            this.counterEl.style.color = ready ? '#b8f5c0' : '#ffb3b3';
            this.nextBtn.disabled = !ready;
            this.nextBtn.style.opacity = ready ? '1' : '0.6';
        });

        // Anchor to bottom so the panel stays usable on small screens.
        this.dialogDom = this.add.dom(w / 2, h - 12, panel).setDepth(30);
        this.dialogDom.setOrigin(0.5, 1);

        if (this.input?.keyboard) {
            this.input.keyboard.resetKeys();
            this.input.keyboard.enabled = true;
        }
    }

    showStep(index) {
        this.currentStep = index;
        const step = this.steps[index];
        this.speechEl.innerHTML = `<strong>${this.teacherName}:</strong> ${step.teacherLine}`;

        const isDrawing = step.key === 'drawing';
        this.nextBtn.innerText = (index === this.steps.length - 1) ? 'Finish Conversation' : 'Next';

        if (this.canvasWrapEl) this.canvasWrapEl.style.display = isDrawing ? 'block' : 'none';
        this.answerEl.style.display = isDrawing ? 'none' : 'block';

        if (isDrawing) {
            this.counterEl.innerText = '';
            this.nextBtn.disabled = false;
            this.nextBtn.style.opacity = '1';
        } else {
            this.answerEl.placeholder = step.placeholder;
            this.answerEl.value = this.answers[step.key] || '';

            const len = (this.answerEl.value || '').trim().length;
            const ready = len >= step.minLength;
            this.counterEl.innerText = `${len}/${step.minLength} characters`;
            this.counterEl.style.color = ready ? '#b8f5c0' : '#ffb3b3';
            this.nextBtn.disabled = !ready;
            this.nextBtn.style.opacity = ready ? '1' : '0.6';
        }
    }

    onNextStep() {
        const step = this.steps[this.currentStep];
        if (step.key !== 'drawing') {
            const value = (this.answerEl.value || '').trim();
            if (value.length < step.minLength) return;
            this.answers[step.key] = value;
        }

        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
            return;
        }

        this.finishConversation();
    }

    finishConversation() {
        const taskId = 'task3a';

        // Optional drawing bonus
        let drawingData = null;
        if (this.drawingCanvas) {
            const data = this.drawingCanvas.toDataURL();
            if (this.drawingHasInk && data && data.length > 2000) {
                drawingData = data;
            }
        }

        // Store raw answers for export/reporting
        if (!gameState.taskAnswers || typeof gameState.taskAnswers !== 'object') {
            gameState.taskAnswers = {};
        }
        gameState.taskAnswers[taskId] = {
            name: this.answers.name || '',
            problem: this.answers.problem || '',
            feelings: this.answers.feelings || ''
        };

        // Store in the dedicated userProfile slot used across the game
        gameState.userProfile = {
            name: this.answers.name || '',
            problem: this.answers.problem || '',
            feelings: this.answers.feelings || '',
            age: 0,
            when: '',
            wish: '',
            drawingData
        };

        let points = (TASKS?.[taskId] && typeof TASKS[taskId].points === 'number') ? TASKS[taskId].points : 30;

        if (drawingData) {
            if (!gameState.taskDrawings || typeof gameState.taskDrawings !== 'object') {
                gameState.taskDrawings = {};
            }
            gameState.taskDrawings[taskId] = drawingData;
            const bonus = (TASKS?.[taskId] && typeof TASKS[taskId].bonusPoints === 'number') ? TASKS[taskId].bonusPoints : 0;
            points += bonus;
        }

        gameState.addPoints(points);
        gameState.completeTask(taskId);

        if (this.dialogDom) {
            this.dialogDom.destroy();
            this.dialogDom = null;
        }

        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const msg = TASKS?.[taskId]?.dialogue?.complete || 'Interview Notes Complete! Now head to the Corridor.';
        this.add.rectangle(w / 2, h / 2, 680, 160, 0x000000, 0.65).setDepth(40);
        this.add.text(w / 2, h / 2, msg, {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 640 }
        }).setOrigin(0.5).setDepth(41);

        this.time.delayedCall(950, () => this.returnToWorld());
    }

    update() {
        if (this.player) this.player.update();
    }

    returnToWorld() {
        this.scene.start('GameScene');
        this.scene.start('UIScene');
    }
}
