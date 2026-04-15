// ===== Task1ConversationScene.js =====
// Separate scene for Task 1: two friends talk at home to identify the core problem.

class Task1ConversationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Task1ConversationScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.movementEnabled = true;
        this.physics.world.setBounds(0, 0, w, h);

        this.answers = {
            problem: '',
            helpPeople: ''
        };

        this.steps = [
            {
                key: 'problem',
                minLength: 12,
                friendLine: 'I have been thinking about our village. What is one real problem we should solve first?',
                placeholder: 'Example: Students forget water bottles and stay thirsty in school.'
            },
            {
                key: 'helpPeople',
                minLength: 12,
                friendLine: 'That sounds important. How will solving it help people in daily life?',
                placeholder: 'Example: They can focus better in class and stay healthy.'
            }
        ];
        this.currentStep = 0;

        this.drawHouseInterior(w, h);
        this.drawCharacters(w, h);
        this.createConversationPanel(w, h);
        this.showStep(0);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this.dialogDom) {
                this.dialogDom.destroy();
                this.dialogDom = null;
            }
            if (this.input?.keyboard) {
                this.input.keyboard.enabled = true;
                this.input.keyboard.resetKeys();
            }
        });
    }

    drawHouseInterior(w, h) {
        this.add.rectangle(w / 2, h / 2, w, h, 0x1a2238).setDepth(0);

        const bg = this.add.image(w / 2, h / 2, 'home_convo_bg').setDepth(1);
        const targetW = w * 0.6;
        const targetH = h * 0.6;
        const scale = Math.min(targetW / bg.width, targetH / bg.height);
        bg.setScale(scale);

        this.add.text(w / 2, 38, 'HOME CONVERSATION', {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(10);
    }

    drawCharacters(w, h) {
        const roleMap = this.registry.get('npcRoleSpriteMap') || {};
        let friendKey = roleMap.guide || 'guide';
        if (!this.textures.exists(friendKey)) {
            friendKey = 'player_male';
        }

        this.friend = this.add.sprite(w / 2 - 60, h / 2 + 80, friendKey).setDepth(5);
        this.friend.setDisplaySize(72, 72);
        if (this.anims.exists(`${friendKey}_idle_right`)) {
            this.friend.play(`${friendKey}_idle_right`);
        }

        this.player = new Player(this, w / 2 + 60, h / 2 + 80);
        this.player.setDepth(5);
        this.player.setDisplaySize(72, 72);
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
            this.movementEnabled = true;
        });
        answer.spellcheck = false;
        panel.appendChild(answer);
        this.answerEl = answer;

        const counter = document.createElement('div');
        counter.style.cssText = 'margin-top: 8px; font-size: 11px; color: #ffb3b3;';
        counter.innerText = '0/12 characters';
        panel.appendChild(counter);
        this.counterEl = counter;

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
            const len = (answer.value || '').trim().length;
            const ready = len >= step.minLength;

            this.counterEl.innerText = `${len}/${step.minLength} characters`;
            this.counterEl.style.color = ready ? '#b8f5c0' : '#ffb3b3';
            this.nextBtn.disabled = !ready;
            this.nextBtn.style.opacity = ready ? '1' : '0.6';
        });

        this.dialogDom = this.add.dom(w / 2, h - 125, panel).setDepth(30);

        if (this.input?.keyboard) {
            this.input.keyboard.resetKeys();
            this.input.keyboard.enabled = true;
        }
    }

    showStep(index) {
        this.currentStep = index;
        const step = this.steps[index];

        this.speechEl.innerHTML = `<strong>Ruby:</strong> ${step.friendLine}`;
        this.answerEl.placeholder = step.placeholder;
        this.answerEl.value = this.answers[step.key] || '';
        this.nextBtn.innerText = (index === this.steps.length - 1) ? 'Finish Conversation' : 'Next';

        const len = (this.answerEl.value || '').trim().length;
        const ready = len >= step.minLength;
        this.counterEl.innerText = `${len}/${step.minLength} characters`;
        this.counterEl.style.color = ready ? '#b8f5c0' : '#ffb3b3';
        this.nextBtn.disabled = !ready;
        this.nextBtn.style.opacity = ready ? '1' : '0.6';

        if (document.activeElement === this.answerEl) {
            this.answerEl.setSelectionRange(this.answerEl.value.length, this.answerEl.value.length);
        }
    }

    update() {
        if (this.player) this.player.update();
    }

    onNextStep() {
        const step = this.steps[this.currentStep];
        const value = (this.answerEl.value || '').trim();
        if (value.length < step.minLength) return;

        this.answers[step.key] = value;

        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
            return;
        }

        this.finishConversation();
    }

    finishConversation() {
        const taskId = 'task1';

        if (!gameState.taskAnswers || typeof gameState.taskAnswers !== 'object') {
            gameState.taskAnswers = {};
        }
        gameState.taskAnswers[taskId] = {
            problem: this.answers.problem || '',
            helpPeople: this.answers.helpPeople || ''
        };

        gameState.problemStatement = {
            problem: this.answers.problem || '',
            helpPeople: this.answers.helpPeople || ''
        };

        const points = (TASKS?.[taskId] && typeof TASKS[taskId].points === 'number') ? TASKS[taskId].points : 20;
        gameState.addPoints(points);
        gameState.completeTask(taskId);

        if (this.dialogDom) {
            this.dialogDom.destroy();
            this.dialogDom = null;
        }

        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        this.add.rectangle(w / 2, h / 2, 620, 130, 0x000000, 0.65).setDepth(40);
        this.add.text(w / 2, h / 2, 'Conversation Complete!\nNow head to the Playground.', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(41);

        this.time.delayedCall(950, () => this.returnToWorld());
    }

    returnToWorld() {
        this.scene.start('GameScene');
        this.scene.start('UIScene');
    }
}
