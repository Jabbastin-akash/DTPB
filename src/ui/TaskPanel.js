// ===== TaskPanel.js =====
// Reusable task panel class using DOM elements

class TaskPanel {
    constructor(scene, taskId, x = 400, y = 300, greeting = null, sourceNpc = null) {
        this.scene = scene;
        this.taskId = taskId;
        this.taskData = TASKS[taskId];
        this.sourceNpc = sourceNpc;
        
        // Root container
        const div = document.createElement('div');
        div.classList.add('task-panel');
        div.style.cssText = `
            position: relative;
            width: 680px;
            max-width: 90%;
            max-height: 85vh;
            overflow-y: auto;
            background-color: rgba(40, 40, 80, 0.95);
            border-radius: 12px;
            padding: 25px;
            border: 3px solid #a9a9a9;
            color: white;
            font-family: 'Press Start 2P', sans-serif;
            font-size: 14px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;
        this.rootDiv = div;

        if (this.taskId === 'task7') {
            // Classroom-themed background for the School task.
            div.style.backgroundImage = 'linear-gradient(rgba(40, 40, 80, 0.92), rgba(40, 40, 80, 0.92)), url("assets/School/Class.png")';
            div.style.backgroundSize = 'cover';
            div.style.backgroundPosition = 'center';
        }
        
        // Header
        const header = document.createElement('h2');
        header.textContent = this.taskData.title;
        header.style.textAlign = 'center';
        header.style.marginTop = '0';
        header.style.marginBottom = '15px';
        header.style.color = '#f1c40f';
        div.appendChild(header);
        this.headerEl = header;

        // Greeting
        const msg = document.createElement('div');
        msg.innerHTML = `<strong>${this.taskData.npcName}:</strong> "${greeting || this.taskData.greeting}"`;
        msg.style.backgroundColor = 'rgba(255,255,255,0.1)';
        msg.style.padding = '10px';
// ... existing code ...
        msg.style.borderRadius = '8px';
        msg.style.marginBottom = '20px';
        msg.style.fontStyle = 'italic';
        div.appendChild(msg);
        this.msgEl = msg;

        // Form
        this.form = document.createElement('form');
        this.inputs = {};

        if (this.taskId === 'task1') {
            this.buildTask1Panel(this.form);
        } else if (this.taskId === 'task2') {
            this.buildTask2Panel(this.form);
        } else if (this.taskId === 'task3a') {
            this.buildTask3aPanel(this.form);
        } else if (this.taskId === 'task4') {
            this.buildTask4Panel(this.form);
        } else if (this.taskData.isSadHappy) {
            this.buildSadHappyFields(this.form);
        } else if (this.taskData.isFinal) {
            this.buildFinalTask(this.form);
        } else {
            this.buildStandardFields(this.form);
            if (this.taskData.hasCanvas) {
                this.buildCanvas(this.form);
            }
        }

        // Action Buttons
        const btnGroup = document.createElement('div');
        btnGroup.style.display = 'flex';
        btnGroup.style.justifyContent = 'space-between';
        btnGroup.style.marginTop = '20px';

        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = 'Close';
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn cancel';
        cancelBtn.onclick = () => this.destroy();

        this.submitBtn = document.createElement('button');
        this.submitBtn.innerText = 'Submit Task';
        this.submitBtn.type = 'submit';
        this.submitBtn.className = 'btn submit';
        this.submitBtn.disabled = true;

        if (this.taskId === 'task1') {
            this.submitBtn.innerText = "Finish Conversation";
            this.submitBtn.style.backgroundColor = '#4A7C59';
            this.submitBtn.style.color = 'white';
            this.submitBtn.style.width = '100%';
            this.submitBtn.style.borderRadius = '8px';
        } else if (this.taskId === 'task2') {
            this.submitBtn.innerText = "The case is filed!";
        } else if (this.taskId === 'task4') {
            this.submitBtn.innerText = "Commit to my village!";
            this.submitBtn.style.backgroundColor = '#C9A84C';
            this.submitBtn.style.color = '#333';
            this.submitBtn.style.width = '100%';
        }

        btnGroup.appendChild(cancelBtn);
        btnGroup.appendChild(this.submitBtn);
        this.form.appendChild(btnGroup);

        // Auto-validate form
        this.form.oninput = () => this.validate();
        this.form.onsubmit = (e) => {
            e.preventDefault();
            this.handleSubmit();
        };

        div.appendChild(this.form);

        // Add to Phaser as DOM Game Object
        this.domElement = this.scene.add.dom(x, y, div).setOrigin(0.5);

        // Disable keyboard capturing so inputs work
        this.scene.input.keyboard.disableGlobalCapture();
    }

    buildTask3aPanel(form) {
        this.rootDiv.style.backgroundColor = '#DFD8C8';
        this.rootDiv.style.color = '#333';
        this.rootDiv.style.backgroundImage = 'linear-gradient(rgba(223, 216, 200, 0.92), rgba(223, 216, 200, 0.92)), url("assets/School/Class.png")';
        this.rootDiv.style.backgroundSize = 'cover';
        this.rootDiv.style.backgroundPosition = 'center';
        this.rootDiv.style.boxShadow = '5px 5px 15px rgba(0,0,0,0.3)';

        this.headerEl.innerHTML = '📋 Interview Notes';
        this.headerEl.style.color = '#4A443B';
        this.headerEl.style.fontFamily = 'serif';
        this.msgEl.style.display = 'none';

        // Clipboard clip
        const clip = document.createElement('div');
        clip.style.width = '120px';
        clip.style.height = '40px';
        clip.style.backgroundColor = '#C0C0C0';
        clip.style.border = '1px solid #888';
        clip.style.borderBottom = 'none';
        clip.style.borderRadius = '10px 10px 0 0';
        clip.style.position = 'absolute';
        clip.style.top = '-20px';
        clip.style.left = 'calc(50% - 60px)';
        clip.style.boxShadow = 'inset 0 4px 8px rgba(0,0,0,0.2)';
        this.rootDiv.style.position = 'relative';
        this.rootDiv.style.marginTop = '20px';
        this.rootDiv.appendChild(clip);


        const paper = document.createElement('div');
        paper.style.padding = '10px 20px';
        paper.style.marginTop = '15px';

        const questions = [
            { label: 'Their name is...', key: 'name', type: 'text', minLength: 2 },
            { label: 'Their problem is...', key: 'problem', type: 'text', minLength: 10 },
            { label: 'They feel...', key: 'feelings', type: 'text', minLength: 10 },
        ];

        questions.forEach(q => {
            const p = document.createElement('p');
            p.style.marginBottom = '20px';
            p.style.fontSize = '18px';
            p.innerText = q.label;
            const input = document.createElement('input');
            input.type = q.type;
            input.style.border = 'none';
            input.style.borderBottom = '2px dotted #999';
            input.style.backgroundColor = 'transparent';
            input.style.marginLeft = '8px';
            input.style.width = '250px';
            input.style.fontSize = '18px';
            p.appendChild(input);
            paper.appendChild(p);
            this.inputs[q.key] = { element: input, config: { minLength: q.minLength } };
        });
        form.appendChild(paper);

        // Canvas section
        const canvasWrap = document.createElement('div');
        canvasWrap.style.marginTop = '20px';
        canvasWrap.innerHTML = `<label style="font-weight:bold; color: #333;">Draw your user (optional — earns bonus points!)</label>`;
        
        const toolbar = document.createElement('div');
        toolbar.style.display = 'flex';
        toolbar.style.gap = '8px';
        toolbar.style.marginBottom = '8px';
        toolbar.style.alignItems = 'center';

        const colors = ['#333333', '#E24B4A', '#378ADD', '#639922'];
        let activeColor = colors[0];

        const pencilBtn = document.createElement('button');
        pencilBtn.innerText = '✏️ Pencil';
        pencilBtn.type = 'button';
        toolbar.appendChild(pencilBtn);

        const eraserBtn = document.createElement('button');
        eraserBtn.innerText = 'Eraser';
        eraserBtn.type = 'button';
        toolbar.appendChild(eraserBtn);

        colors.forEach(c => {
            const swatch = document.createElement('button');
            swatch.style.backgroundColor = c;
            swatch.style.width = '28px';
            swatch.style.height = '28px';
            swatch.style.border = '2px solid white';
            swatch.style.borderRadius = '50%';
            swatch.onclick = (e) => { e.preventDefault(); activeColor = c; };
            toolbar.appendChild(swatch);
        });

        const clearBtn = document.createElement('button');
        clearBtn.innerText = 'Clear';
        clearBtn.type = 'button';
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
        
        let painting = false;
        pencilBtn.onclick = (e) => {
            e.preventDefault();
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = 2;
        };
        eraserBtn.onclick = (e) => {
            e.preventDefault();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 15;
        };
        clearBtn.onclick = (e) => { e.preventDefault(); ctx.clearRect(0, 0, canvas.width, canvas.height); };
        
        canvas.onmousedown = (e) => {
            painting = true;
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        };
        canvas.onmousemove = (e) => {
            if (painting) {
                ctx.lineTo(e.offsetX, e.offsetY);
                ctx.stroke();
            }
        };
        canvas.onmouseup = () => painting = false;
        canvas.onmouseout = () => painting = false;

        canvasWrap.appendChild(canvas);
        form.appendChild(canvasWrap);
        this.drawingCanvas = canvas;
    }

    buildTask2Panel(form) {
        this.headerEl.innerHTML = `🔍 Empathy Story`;
        this.msgEl.style.display = 'none';

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = '1fr 1fr 1fr';
        grid.style.gap = '15px';

        const questions = [
            { q: 'Who', color: '#534AB7', icon: '👤' }, { q: 'What', color: '#D85A30', icon: '❓' },
            { q: 'When', color: '#0F6E56', icon: '⏰' }, { q: 'Where', color: '#185FA5', icon: '📍' },
            { q: 'How', color: '#993556', icon: '🤔' }, { q: 'Why', color: '#854F0B', icon: '💡' }
        ];

        const storyPreview = document.createElement('div');
        storyPreview.style.marginTop = '20px';
        storyPreview.style.padding = '15px';
        storyPreview.style.backgroundColor = 'rgba(0,0,0,0.2)';
        storyPreview.style.borderRadius = '8px';
        storyPreview.innerHTML = '<h4>Story Preview:</h4><p style="color: #ccc; line-height: 1.6;">Start typing to see the story...</p>';
        
        const updateStory = () => {
            const who = this.inputs.who?.element.value || '<strong>[Who]</strong>';
            const what = this.inputs.what?.element.value || '<strong>[what]</strong>';
            const when = this.inputs.when?.element.value || '<strong>[when]</strong>';
            const where = this.inputs.where?.element.value || '<strong>[where]</strong>';
            const how = this.inputs.how?.element.value || '<strong>[how]</strong>';
            const why = this.inputs.why?.element.value || '<strong>[why]</strong>';
            storyPreview.querySelector('p').innerHTML = `${who} was dealing with ${what} when ${when} at ${where}. It affected them because ${how}, which was a problem because ${why}.`;
            this.validate();
        };

        questions.forEach(item => {
            const card = document.createElement('div');
            card.style.borderLeft = `5px solid ${item.color}`;
            card.style.borderRadius = '8px';
            card.style.padding = '10px';
            card.style.backgroundColor = 'rgba(255,255,255,0.05)';

            const qHeader = document.createElement('div');
            qHeader.style.display = 'flex';
            qHeader.style.alignItems = 'center';
            qHeader.style.marginBottom = '8px';

            const iconDiv = document.createElement('div');
            iconDiv.innerText = item.icon;
            iconDiv.style.fontSize = '20px';
            qHeader.appendChild(iconDiv);

            const qText = document.createElement('div');
            qText.innerText = item.q;
            qText.style.fontWeight = 'bold';
            qText.style.marginLeft = '10px';
            qHeader.appendChild(qText);
            card.appendChild(qHeader);

            const textarea = document.createElement('textarea');
            textarea.rows = 3;
            textarea.style.width = '100%';
            textarea.style.backgroundColor = 'rgba(0,0,0,0.2)';
            textarea.style.border = '1px solid #777';
            textarea.style.color = '#fff';
            textarea.style.borderRadius = '4px';
            textarea.oninput = updateStory;
            card.appendChild(textarea);

            this.inputs[item.q.toLowerCase()] = { element: textarea, config: { minLength: 5 } };
            grid.appendChild(card);
        });

        form.appendChild(grid);
        form.appendChild(storyPreview);
    }

    buildTask1Panel(form) {
        this.headerEl.innerText = '🏠 House Conversation';
        this.msgEl.style.display = 'none';

        const convoWrap = document.createElement('div');
        convoWrap.style.display = 'flex';
        convoWrap.style.flexDirection = 'column';
        convoWrap.style.gap = '12px';

        const friendBubble = (text) => {
            const row = document.createElement('div');
            row.style.alignSelf = 'flex-start';
            row.style.maxWidth = '92%';
            row.style.background = 'rgba(255,255,255,0.12)';
            row.style.border = '1px solid rgba(255,255,255,0.2)';
            row.style.borderRadius = '12px';
            row.style.padding = '12px';
            row.style.lineHeight = '1.5';
            row.style.fontSize = '12px';
            row.innerHTML = `<strong>Ruby (friend):</strong> ${text}`;
            convoWrap.appendChild(row);
            return row;
        };

        const playerReply = (key, placeholder, minLength, onChange) => {
            const row = document.createElement('div');
            row.style.alignSelf = 'flex-end';
            row.style.width = '92%';
            row.style.background = 'rgba(0,0,0,0.2)';
            row.style.border = '1px solid rgba(255,255,255,0.25)';
            row.style.borderRadius = '12px';
            row.style.padding = '10px';

            const label = document.createElement('div');
            label.innerText = 'You:';
            label.style.marginBottom = '6px';
            label.style.fontSize = '12px';
            label.style.color = '#9ad1ff';
            row.appendChild(label);

            const input = document.createElement('textarea');
            input.rows = 2;
            input.name = key;
            input.placeholder = placeholder;
            input.style.width = '100%';
            input.style.boxSizing = 'border-box';
            input.style.padding = '10px';
            input.style.borderRadius = '8px';
            input.style.border = '1px solid #60738a';
            input.style.backgroundColor = 'rgba(255,255,255,0.95)';
            input.style.color = '#1f2937';
            input.style.fontFamily = 'Arial, sans-serif';
            input.style.fontSize = '15px';
            input.style.lineHeight = '1.35';
            row.appendChild(input);

            const count = document.createElement('div');
            count.innerText = `0/${minLength} characters`;
            count.style.marginTop = '6px';
            count.style.fontSize = '11px';
            count.style.color = '#ffb3b3';
            row.appendChild(count);

            input.oninput = () => {
                const len = (input.value || '').trim().length;
                count.innerText = `${len}/${minLength} characters`;
                count.style.color = len >= minLength ? '#b8f5c0' : '#ffb3b3';
                if (onChange) onChange(len);
                this.validate();
            };

            this.inputs[key] = { element: input, config: { minLength } };
            convoWrap.appendChild(row);
            return row;
        };

        friendBubble('I have been thinking... what is one real problem around us that you want to solve?');
        playerReply('problem', 'Example: Students forget water bottles and stay thirsty in school.', 12, null);

        const step2 = document.createElement('div');
        step2.style.display = 'none';
        step2.style.flexDirection = 'column';
        step2.style.gap = '12px';

        const step2Friend = document.createElement('div');
        step2Friend.style.alignSelf = 'flex-start';
        step2Friend.style.maxWidth = '92%';
        step2Friend.style.background = 'rgba(255,255,255,0.12)';
        step2Friend.style.border = '1px solid rgba(255,255,255,0.2)';
        step2Friend.style.borderRadius = '12px';
        step2Friend.style.padding = '12px';
        step2Friend.style.lineHeight = '1.5';
        step2Friend.style.fontSize = '12px';
        step2Friend.innerHTML = '<strong>Ruby (friend):</strong> Good one. How does solving this help people at home or school?';
        step2.appendChild(step2Friend);

        const step2ReplyWrap = document.createElement('div');
        step2ReplyWrap.style.alignSelf = 'flex-end';
        step2ReplyWrap.style.width = '92%';
        step2ReplyWrap.style.background = 'rgba(0,0,0,0.2)';
        step2ReplyWrap.style.border = '1px solid rgba(255,255,255,0.25)';
        step2ReplyWrap.style.borderRadius = '12px';
        step2ReplyWrap.style.padding = '10px';

        const step2Label = document.createElement('div');
        step2Label.innerText = 'You:';
        step2Label.style.marginBottom = '6px';
        step2Label.style.fontSize = '12px';
        step2Label.style.color = '#9ad1ff';
        step2ReplyWrap.appendChild(step2Label);

        const helpInput = document.createElement('textarea');
        helpInput.rows = 2;
        helpInput.name = 'helpPeople';
        helpInput.placeholder = 'Example: They can focus better and feel healthier during class.';
        helpInput.style.width = '100%';
        helpInput.style.boxSizing = 'border-box';
        helpInput.style.padding = '10px';
        helpInput.style.borderRadius = '8px';
        helpInput.style.border = '1px solid #60738a';
        helpInput.style.backgroundColor = 'rgba(255,255,255,0.95)';
        helpInput.style.color = '#1f2937';
        helpInput.style.fontFamily = 'Arial, sans-serif';
        helpInput.style.fontSize = '15px';
        helpInput.style.lineHeight = '1.35';
        step2ReplyWrap.appendChild(helpInput);

        const helpCount = document.createElement('div');
        helpCount.innerText = '0/12 characters';
        helpCount.style.marginTop = '6px';
        helpCount.style.fontSize = '11px';
        helpCount.style.color = '#ffb3b3';
        step2ReplyWrap.appendChild(helpCount);

        helpInput.oninput = () => {
            const len = (helpInput.value || '').trim().length;
            helpCount.innerText = `${len}/12 characters`;
            helpCount.style.color = len >= 12 ? '#b8f5c0' : '#ffb3b3';
            this.validate();
        };

        this.inputs.helpPeople = { element: helpInput, config: { minLength: 12 } };
        step2.appendChild(step2ReplyWrap);

        convoWrap.appendChild(step2);

        const problemInput = this.inputs.problem.element;
        problemInput.oninput = () => {
            const len = (problemInput.value || '').trim().length;
            const problemCounter = problemInput.parentElement.querySelector('div:last-child');
            if (problemCounter) {
                problemCounter.innerText = `${len}/12 characters`;
                problemCounter.style.color = len >= 12 ? '#b8f5c0' : '#ffb3b3';
            }
            step2.style.display = len >= 12 ? 'flex' : 'none';
            this.validate();
        };

        form.appendChild(convoWrap);
    }

    buildStandardFields(form) {
        this.taskData.fields.forEach(field => {
            const wrap = document.createElement('div');
            wrap.style.marginBottom = '15px';

            const lbl = document.createElement('label');
            lbl.innerText = field.label;
            lbl.style.display = 'block';
            lbl.style.fontWeight = 'bold';
            lbl.style.marginBottom = '5px';
            wrap.appendChild(lbl);

            let inp;
            if (field.type === 'textarea') {
                inp = document.createElement('textarea');
                inp.rows = 3;
            } else {
                inp = document.createElement('input');
                inp.type = field.type;
            }
            inp.name = field.key;
            inp.placeholder = field.placeholder;
            inp.className = 'task-input';
            inp.style.width = '100%';
            inp.style.padding = '8px';
            inp.style.borderRadius = '4px';
            inp.style.border = '1px solid #ccc';
            inp.style.backgroundColor = '#fff';
            inp.style.color = '#333';
            
            this.inputs[field.key] = { element: inp, config: field };
            wrap.appendChild(inp);
            form.appendChild(wrap);
        });
    }

    buildCanvas(form) {
        const wrap = document.createElement('div');
        wrap.style.marginTop = '20px';
        wrap.innerHTML = `<label style="font-weight:bold">${this.taskData.canvasLabel}</label>`;
        
        const canvas = document.createElement('canvas');
        canvas.width = this.taskData.canvasWidth;
        canvas.height = this.taskData.canvasHeight;
        canvas.style.backgroundColor = '#fff';
        canvas.style.border = '2px solid #aaa';
        canvas.style.cursor = 'crosshair';
        this.ctx = canvas.getContext('2d');
        
        let painting = false;
        
        canvas.onmousedown = (e) => {
            painting = true;
            this.ctx.beginPath();
            this.ctx.moveTo(e.offsetX, e.offsetY);
        };
        canvas.onmousemove = (e) => {
            if (painting) {
                this.ctx.lineTo(e.offsetX, e.offsetY);
                this.ctx.stroke();
            }
        };
        canvas.onmouseup = () => painting = false;
        canvas.onmouseout = () => painting = false;

        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.innerText = 'Clear Drawing';
        clearBtn.onclick = () => this.ctx.clearRect(0,0, canvas.width, canvas.height);

        wrap.appendChild(canvas);
        wrap.appendChild(document.createElement('br'));
        wrap.appendChild(clearBtn);
        form.appendChild(wrap);
        this.drawingCanvas = canvas;
    }

    buildSadHappyFields(form) {
        this.headerEl.innerHTML = '😊 From Sad to Happy 😊';
        this.msgEl.innerHTML = 'On the left, draw or describe what makes your user sad. On the right, show how your idea will make them happy!';

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';

        const canvasWrap = document.createElement('div');
        canvasWrap.style.position = 'relative';
        canvasWrap.style.width = '560px';
        canvasWrap.style.height = '300px';
        canvasWrap.style.border = '2px solid #888';
        canvasWrap.style.borderRadius = '8px';
        canvasWrap.style.overflow = 'hidden';
        canvasWrap.style.backgroundColor = '#ffffff';

        const baseCanvas = document.createElement('canvas');
        baseCanvas.width = 560;
        baseCanvas.height = 300;
        baseCanvas.style.position = 'absolute';
        baseCanvas.style.left = '0';
        baseCanvas.style.top = '0';
        baseCanvas.style.pointerEvents = 'none';

        const drawCanvas = document.createElement('canvas');
        drawCanvas.width = 560;
        drawCanvas.height = 300;
        drawCanvas.style.position = 'absolute';
        drawCanvas.style.left = '0';
        drawCanvas.style.top = '0';
        drawCanvas.style.cursor = 'crosshair';
        drawCanvas.style.touchAction = 'none';

        const baseCtx = baseCanvas.getContext('2d');
        const drawCtx = drawCanvas.getContext('2d');

        const redrawBase = () => {
            // Draw background
            baseCtx.clearRect(0, 0, baseCanvas.width, baseCanvas.height);
            baseCtx.fillStyle = '#ffffff';
            baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);

            // Dividing line
            baseCtx.fillStyle = '#888';
            baseCtx.fillRect(baseCanvas.width / 2 - 1, 0, 2, baseCanvas.height);

            // Headers
            baseCtx.font = 'bold 18px sans-serif';
            baseCtx.fillStyle = '#1A3A5C';
            baseCtx.textAlign = 'center';
            baseCtx.fillText('😢 Sad Space', baseCanvas.width * 0.25, 25);
            baseCtx.fillStyle = '#5C4200';
            baseCtx.fillText('😊 Happy Space', baseCanvas.width * 0.75, 25);
        };

        redrawBase();

        drawCtx.lineJoin = 'round';
        drawCtx.lineCap = 'round';
        drawCtx.lineWidth = 3;
        drawCtx.strokeStyle = '#1d1d1d';
        drawCtx.globalCompositeOperation = 'source-over';

        this.sadHappyHasSadDrawing = false;
        this.sadHappyHasHappyDrawing = false;

        let painting = false;

        const getPos = (e) => {
            const rect = drawCanvas.getBoundingClientRect();
            return {
                x: Math.max(0, Math.min(drawCanvas.width, e.clientX - rect.left)),
                y: Math.max(0, Math.min(drawCanvas.height, e.clientY - rect.top))
            };
        };

        const markSide = (x) => {
            if (x < drawCanvas.width / 2) {
                this.sadHappyHasSadDrawing = true;
            } else {
                this.sadHappyHasHappyDrawing = true;
            }
            this.validate();
        };

        const startDraw = (e) => {
            e.preventDefault();
            const pos = getPos(e);
            painting = true;
            drawCtx.beginPath();
            drawCtx.moveTo(pos.x, pos.y);
            markSide(pos.x);
        };

        const draw = (e) => {
            if (!painting) return;
            e.preventDefault();
            const pos = getPos(e);
            drawCtx.lineTo(pos.x, pos.y);
            drawCtx.stroke();
            markSide(pos.x);
        };

        const stopDraw = () => {
            painting = false;
        };

        drawCanvas.addEventListener('pointerdown', startDraw);
        drawCanvas.addEventListener('pointermove', draw);
        drawCanvas.addEventListener('pointerup', stopDraw);
        drawCanvas.addEventListener('pointerleave', stopDraw);
        drawCanvas.addEventListener('pointercancel', stopDraw);

        canvasWrap.appendChild(baseCanvas);
        canvasWrap.appendChild(drawCanvas);
        container.appendChild(canvasWrap);
        
        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.style.marginTop = '10px';
        toolbar.style.display = 'flex';
        toolbar.style.gap = '10px';
        toolbar.style.alignItems = 'center';

        const pencilBtn = document.createElement('button');
        pencilBtn.innerText = 'Pencil';
        pencilBtn.type = 'button';
        pencilBtn.onclick = (e) => {
            e.preventDefault();
            drawCtx.globalCompositeOperation = 'source-over';
            drawCtx.strokeStyle = '#1d1d1d';
            drawCtx.lineWidth = 3;
        };
        toolbar.appendChild(pencilBtn);

        const eraserBtn = document.createElement('button');
        eraserBtn.innerText = 'Eraser';
        eraserBtn.type = 'button';
        eraserBtn.onclick = (e) => {
            e.preventDefault();
            drawCtx.globalCompositeOperation = 'destination-out';
            drawCtx.lineWidth = 14;
        };
        toolbar.appendChild(eraserBtn);

        const clearBtn = document.createElement('button');
        clearBtn.innerText = 'Clear All';
        clearBtn.type = 'button';
        clearBtn.onclick = (e) => {
            e.preventDefault();
            redrawBase();
            drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
            this.sadHappyHasSadDrawing = false;
            this.sadHappyHasHappyDrawing = false;
            this.validate();
            // Reset to pencil after clearing
            drawCtx.globalCompositeOperation = 'source-over';
            drawCtx.strokeStyle = '#1d1d1d';
            drawCtx.lineWidth = 3;
        };
        toolbar.appendChild(clearBtn);
        container.appendChild(toolbar);

        // Notes area
        const notes = document.createElement('div');
        notes.style.display = 'grid';
        notes.style.gridTemplateColumns = '1fr 1fr';
        notes.style.gap = '12px';
        notes.style.marginTop = '14px';
        notes.style.width = '100%';

        const makeNotesColumn = (title, fields, group, color) => {
            const col = document.createElement('div');
            col.style.display = 'flex';
            col.style.flexDirection = 'column';
            col.style.gap = '6px';

            const heading = document.createElement('div');
            heading.innerText = title;
            heading.style.fontWeight = 'bold';
            heading.style.color = color;
            heading.style.textShadow = '0 1px 2px rgba(0,0,0,0.35)';
            col.appendChild(heading);

            fields.forEach(field => {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = field.placeholder;
                input.style.width = '100%';
                input.style.padding = '8px';
                input.style.borderRadius = '6px';
                input.style.border = '1px solid #777';
                input.style.backgroundColor = 'rgba(255,255,255,0.9)';
                input.style.color = '#222';
                input.oninput = () => this.validate();
                this.inputs[field.key] = { element: input, config: { group, minLength: 2 } };
                col.appendChild(input);
            });

            return col;
        };

        notes.appendChild(makeNotesColumn('Sad notes', this.taskData.sadFields || [], 'sad', '#E7F2FF'));
        notes.appendChild(makeNotesColumn('Happy notes', this.taskData.happyFields || [], 'happy', '#FFF2C6'));
        container.appendChild(notes);

        form.appendChild(container);
        this.sadHappyBaseCanvas = baseCanvas;
        this.sadHappyDrawCanvas = drawCanvas;
        this.sadHappyCanvas = drawCanvas;
    }

    buildTask4Panel(form) {
        this.rootDiv.style.backgroundColor = '#FDF6E3';
        this.rootDiv.style.border = '10px solid #D3C0A0';
        this.rootDiv.style.color = '#584B3A';
        this.rootDiv.style.fontFamily = 'serif';

        this.headerEl.innerHTML = '🏆 Landmark Reward 🏆';
        this.headerEl.style.color = '#8B4513';
        this.headerEl.style.borderBottom = '2px solid #D3C0A0';
        this.headerEl.style.paddingBottom = '10px';
        this.msgEl.style.display = 'none';

        const intro = document.createElement('p');
        intro.style.fontSize = '18px';
        intro.style.lineHeight = '1.8';
        intro.style.marginTop = '24px';
        intro.style.textAlign = 'center';
        intro.innerHTML = `Give your final idea a name. This will be saved in your report.`;
        form.appendChild(intro);

        const wrap = document.createElement('div');
        wrap.style.marginTop = '18px';

        const lbl = document.createElement('label');
        lbl.innerText = 'Final idea name';
        lbl.style.display = 'block';
        lbl.style.fontWeight = 'bold';
        lbl.style.marginBottom = '8px';
        wrap.appendChild(lbl);

        const inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = 'Type the final idea name...';
        inp.style.width = '100%';
        inp.style.padding = '10px';
        inp.style.borderRadius = '6px';
        inp.style.border = '2px solid #D3C0A0';
        inp.style.boxSizing = 'border-box';
        wrap.appendChild(inp);
        form.appendChild(wrap);

        this.inputs['final'] = { element: inp, config: { minLength: 2 } };

        const checkboxWrap = document.createElement('div');
        checkboxWrap.style.marginTop = '30px';
        checkboxWrap.style.textAlign = 'center';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'task4-confirm';
        checkbox.oninput = () => this.validate();
        const label = document.createElement('label');
        label.htmlFor = 'task4-confirm';
        label.innerText = ' I commit to solving this for my village!';
        label.style.fontSize = '16px';
        checkboxWrap.appendChild(checkbox);
        checkboxWrap.appendChild(label);
        form.appendChild(checkboxWrap);
        this.inputs['confirm'] = { element: checkbox, config: { type: 'checkbox' } };

        form.onsubmit = (e) => {
            e.preventDefault();
            this.animateAndSubmit();
        };
    }

    animateAndSubmit() {
        // Confetti
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'absolute';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.overflow = 'hidden';
        this.rootDiv.appendChild(confettiContainer);

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = `${Math.random() * 8 + 4}px`;
            confetti.style.height = `${Math.random() * 8 + 4}px`;
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            confetti.style.top = `${Math.random() * 100}%`;
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.animate([
                { transform: `translateY(-100px) rotate(0deg)`, opacity: 1 },
                { transform: `translateY(600px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], {
                duration: Math.random() * 2000 + 1000,
                easing: 'ease-out'
            });
            confettiContainer.appendChild(confetti);
        }

        // Seal stamp
        const seal = document.createElement('div');
        seal.innerText = 'DT';
        seal.style.position = 'absolute';
        seal.style.bottom = '30px';
        seal.style.right = '30px';
        seal.style.width = '70px';
        seal.style.height = '70px';
        seal.style.backgroundColor = '#c0392b';
        seal.style.borderRadius = '50%';
        seal.style.color = 'white';
        seal.style.display = 'flex';
        seal.style.alignItems = 'center';
        seal.style.justifyContent = 'center';
        seal.style.fontFamily = 'serif';
        seal.style.fontWeight = 'bold';
        seal.style.fontSize = '28px';
        seal.style.transform = 'scale(0) rotate(-30deg)';
        seal.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        seal.style.boxShadow = '0 0 15px rgba(0,0,0,0.4)';

        this.rootDiv.appendChild(seal);

        setTimeout(() => { seal.style.transform = 'scale(1) rotate(10deg)'; }, 50);
        setTimeout(() => { seal.style.transform = 'scale(0.95) rotate(0deg)'; }, 550);
        setTimeout(() => { this.handleSubmit(); }, 2000);
    }

    buildFinalTask(form) {
        // Read-only summary building from GameState
        const sumBox = document.createElement('div');
        sumBox.style.backgroundColor = '#2c3e50';
        sumBox.style.padding = '10px';
        sumBox.innerHTML = `<h4>Summary:</h4>
        <p><strong>Problem:</strong> ${gameState.problemStatement.problem || 'N/A'}</p>
        <p><strong>User:</strong> ${gameState.userProfile.name || 'someone'}</p>
        <p><strong>Needs:</strong> ${gameState.userProfile.problem || 'help'}</p>`;
        form.appendChild(sumBox);

        const lbl = document.createElement('h3');
        lbl.innerText = 'Which problem am I solving for?';
        form.appendChild(lbl);

        const txt = document.createElement('textarea');
        txt.rows = 4;
        txt.style.width = '100%';
        let prep = this.taskData.template;
        if (gameState.userProfile.name) prep = prep.replace('[User name]', gameState.userProfile.name);
        txt.value = prep;
        this.inputs['final'] = { element: txt, config: { minLength: 20 } };
        form.appendChild(txt);
        
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.id = 'confirmBtn';
        const clbl = document.createElement('label');
        clbl.htmlFor = 'confirmBtn';
        clbl.innerText = ' Yes, this is the problem I want to solve!';
        
        this.inputs['confirm'] = { element: cb, config: { type: 'checkbox' } };
        form.appendChild(cb);
        form.appendChild(clbl);
    }

    validate() {
        let valid = true;
        
        if (this.taskData.isSadHappy) {
            // At least one sad and one happy entry required (notes or drawing)
            let hasSadText = false;
            let hasHappyText = false;
            Object.values(this.inputs).forEach(({ element, config }) => {
                if (!config || !element) return;
                const value = (element.value || '').trim();
                if (config.group === 'sad' && value.length > 0) hasSadText = true;
                if (config.group === 'happy' && value.length > 0) hasHappyText = true;
            });

            const hasSad = hasSadText || !!this.sadHappyHasSadDrawing;
            const hasHappy = hasHappyText || !!this.sadHappyHasHappyDrawing;
            valid = hasSad && hasHappy;
        } else if (this.taskData.isFinal) {
            const finalEl = this.inputs['final'].element;
            const finalText = (finalEl.value || finalEl.textContent || '').trim();
            const minLen = (this.inputs['final'] && this.inputs['final'].config && typeof this.inputs['final'].config.minLength === 'number')
                ? this.inputs['final'].config.minLength
                : 10;
            valid = finalText.length >= minLen && this.inputs['confirm'].element.checked;
        } else {
            // Standard validation
            Object.values(this.inputs).forEach(({element, config}) => {
                const val = (element.value || element.textContent || '').trim();
                if (config.minWords) {
                    if (val.split(/\s+/).length < config.minWords) valid = false;
                } else if (config.minLength) {
                    if (val.length < config.minLength) valid = false;
                } else if (!val) valid = false;
            });
        }
        
        this.submitBtn.disabled = !valid;
    }

    handleSubmit() {
        // Save answers to game state based on taskId
        const ans = {};
        Object.keys(this.inputs).forEach(k => {
            const el = this.inputs[k].element;
            ans[k] = (el.value || el.textContent || '').trim();
        });

        // Always store raw answers for export/reporting
        if (typeof gameState.taskAnswers !== 'object' || !gameState.taskAnswers) {
            gameState.taskAnswers = {};
        }
        gameState.taskAnswers[this.taskId] = { ...ans };

        let pointsAwarded = this.taskData.points;

        // Optional single-canvas drawing support (used by task3a and task6)
        let singleDrawingData = null;
        if (this.drawingCanvas) {
            const data = this.drawingCanvas.toDataURL();
            // rudimentary "is empty" check by size (blank is small base64)
            if (data && data.length > 2000) singleDrawingData = data;
        }

        if (typeof gameState.taskDrawings !== 'object' || !gameState.taskDrawings) {
            gameState.taskDrawings = {};
        }

        if (this.taskId === 'task1') {
            gameState.problemStatement = ans;
        } else if (this.taskId === 'task2') {
            gameState.empathyStory = ans;
        } else if (this.taskId === 'task3a') {
            gameState.userProfile = ans;
            // Add bonus if canvas used
            if (singleDrawingData) {
                gameState.userProfile.drawingData = singleDrawingData;
                gameState.taskDrawings[this.taskId] = singleDrawingData;
                if (typeof this.taskData.bonusPoints === 'number') pointsAwarded += this.taskData.bonusPoints;
            }
        } else if (this.taskId === 'task3b') {
            gameState.sadHappyData.sad.texts = [ans.sad1, ans.sad2, ans.sad3];
            gameState.sadHappyData.happy.texts = [ans.happy1, ans.happy2, ans.happy3];

            if (this.sadHappyBaseCanvas && this.sadHappyDrawCanvas) {
                const width = this.sadHappyDrawCanvas.width;
                const height = this.sadHappyDrawCanvas.height;
                const half = Math.floor(width / 2);

                const composite = document.createElement('canvas');
                composite.width = width;
                composite.height = height;
                const compositeCtx = composite.getContext('2d');
                compositeCtx.drawImage(this.sadHappyBaseCanvas, 0, 0);
                compositeCtx.drawImage(this.sadHappyDrawCanvas, 0, 0);

                const leftCanvas = document.createElement('canvas');
                leftCanvas.width = half;
                leftCanvas.height = height;
                leftCanvas.getContext('2d').drawImage(composite, 0, 0, half, height, 0, 0, half, height);

                const rightCanvas = document.createElement('canvas');
                rightCanvas.width = half;
                rightCanvas.height = height;
                rightCanvas.getContext('2d').drawImage(composite, half, 0, half, height, 0, 0, half, height);

                const sadData = this.sadHappyHasSadDrawing ? leftCanvas.toDataURL() : null;
                const happyData = this.sadHappyHasHappyDrawing ? rightCanvas.toDataURL() : null;

                gameState.sadHappyData.sad.drawingData = sadData;
                gameState.sadHappyData.happy.drawingData = happyData;

                // Also store for export convenience
                if (sadData) gameState.taskDrawings['task3b_sad'] = sadData;
                if (happyData) gameState.taskDrawings['task3b_happy'] = happyData;
            }
        } else if (this.taskId === 'task4') {
            gameState.finalStatement = ans.final;
        } else {
            // Generic tasks (e.g., task6/task7) can optionally have a drawing canvas
            if (singleDrawingData) {
                gameState.taskDrawings[this.taskId] = singleDrawingData;
                if (typeof this.taskData.bonusPoints === 'number') pointsAwarded += this.taskData.bonusPoints;
            }
        }

        const sourcePosition = this.sourceNpc ? { x: this.sourceNpc.x, y: this.sourceNpc.y } : null;
        gameState.addPoints(pointsAwarded, sourcePosition);
        gameState.completeTask(this.taskId);

        this.destroy();
    }

    destroy() {
        this.scene.input.keyboard.enableGlobalCapture();
        EventBus.emit('panel:close');
        this.domElement.destroy();
    }
}
