// ===== TaskPanel.js =====
// Reusable task panel class using DOM elements

class TaskPanel {
    constructor(scene, taskId, x = 400, y = 300, greeting, sourceNpc = null) {
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
            this.submitBtn.innerText = "Tell the village!";
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
        this.rootDiv.style.backgroundImage = 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M5 0h1L0 6V5zM6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E")';
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
        // Speech bubble
        const bubble = document.createElement('div');
        bubble.style.display = 'flex';
        bubble.style.alignItems = 'center';
        bubble.style.marginBottom = '25px';

        const face = document.createElement('div');
        face.style.width = '48px';
        face.style.height = '48px';
        face.style.backgroundColor = '#e67e22'; // Guide's color
        face.style.borderRadius = '50%';
        face.style.flexShrink = '0';
        face.style.display = 'flex';
        face.style.alignItems = 'center';
        face.style.justifyContent = 'center';
        face.style.fontSize = '24px';
        face.innerText = '👋';
        bubble.appendChild(face);

        const dialogue = document.createElement('div');
        dialogue.style.position = 'relative';
        dialogue.style.backgroundColor = 'rgba(255,255,255,0.1)';
        dialogue.style.padding = '15px';
        dialogue.style.borderRadius = '10px';
        dialogue.style.marginLeft = '15px';
        dialogue.innerHTML = "Hello! I'm your village guide. Every great solution starts with a problem. Tell me — <strong>what problem do you want to solve?</strong>";
        
        const tail = document.createElement('div');
        tail.style.position = 'absolute';
        tail.style.left = '-10px';
        tail.style.top = '50%';
        tail.style.transform = 'translateY(-50%)';
        tail.style.width = '0';
        tail.style.height = '0';
        tail.style.borderTop = '10px solid transparent';
        tail.style.borderBottom = '10px solid transparent';
        tail.style.borderRight = '10px solid rgba(255,255,255,0.1)';
        dialogue.appendChild(tail);

        bubble.appendChild(dialogue);
        form.appendChild(bubble);

        // Input fields
        const fields = [
            { key: 'problem', label: 'The problem is...', placeholder: 'e.g. Students forget their water bottles at school', minLength: 10 },
            { key: 'helpPeople', label: 'This matters because...', placeholder: 'e.g. They get dehydrated and can\'t focus in class', minLength: 10 }
        ];

        fields.forEach(field => {
            const wrap = document.createElement('div');
            wrap.style.marginBottom = '20px';

            const lbl = document.createElement('label');
            lbl.innerText = field.label;
            lbl.style.display = 'flex';
            lbl.style.justifyContent = 'space-between';
            lbl.style.alignItems = 'center';
            lbl.style.fontWeight = 'bold';
            lbl.style.marginBottom = '8px';
            wrap.appendChild(lbl);

            const inp = document.createElement('input');
            inp.type = 'text';
            inp.name = field.key;
            inp.placeholder = field.placeholder;
            inp.className = 'task-input';
            inp.style.width = '100%';
            inp.style.padding = '12px';
            inp.style.borderRadius = '8px';
            inp.style.border = '1px solid #555';
            inp.style.backgroundColor = 'rgba(0,0,0,0.2)';
            inp.style.color = '#fff';
            inp.style.fontSize = '16px';
            
            const countBadge = document.createElement('span');
            countBadge.innerText = '0 chars';
            countBadge.style.fontSize = '12px';
            countBadge.style.padding = '3px 6px';
            countBadge.style.borderRadius = '5px';
            countBadge.style.backgroundColor = '#777';
            countBadge.style.color = 'white';

            inp.oninput = () => {
                const len = inp.value.length;
                countBadge.innerText = `${len} chars`;
                countBadge.style.backgroundColor = len >= field.minLength ? '#4A7C59' : '#d9534f';
                this.validate();
            };

            lbl.appendChild(countBadge);
            this.inputs[field.key] = { element: inp, config: field };
            wrap.appendChild(inp);
            form.appendChild(wrap);
        });
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

        const canvas = document.createElement('canvas');
        canvas.width = 560;
        canvas.height = 300;
        canvas.style.cursor = 'crosshair';
        canvas.style.border = '2px solid #888';
        canvas.style.borderRadius = '8px';
        const ctx = canvas.getContext('2d');

        // Draw background
        ctx.fillStyle = '#D6E4F0'; // Sad space
        ctx.fillRect(0, 0, canvas.width / 2, canvas.height);
        ctx.fillStyle = '#FFF3C4'; // Happy space
        ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height);
        
        // Dividing line
        ctx.fillStyle = '#888';
        ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);

        // Headers
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#1A3A5C';
        ctx.textAlign = 'center';
        ctx.fillText('😢 Sad Space', canvas.width * 0.25, 25);
        ctx.fillStyle = '#5C4200';
        ctx.fillText('😊 Happy Space', canvas.width * 0.75, 25);

        container.appendChild(canvas);
        
        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.style.marginTop = '10px';
        toolbar.style.display = 'flex';
        toolbar.style.gap = '10px';

        const textBtn = document.createElement('button');
        textBtn.innerText = 'T';
        textBtn.title = 'Add Text';
        textBtn.onclick = (e) => {
            e.preventDefault();
            const text = prompt('Enter text:');
            if (text) {
                const x = prompt('Enter X position (0-560):', 280);
                const y = prompt('Enter Y position (0-300):', 150);
                ctx.font = '16px sans-serif';
                ctx.fillStyle = '#000';
                ctx.fillText(text, parseInt(x), parseInt(y));
            }
        };
        toolbar.appendChild(textBtn);

        const clearBtn = document.createElement('button');
        clearBtn.innerText = 'Clear All';
        clearBtn.onclick = (e) => {
            e.preventDefault();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw background
            ctx.fillStyle = '#D6E4F0';
            ctx.fillRect(0, 0, canvas.width / 2, canvas.height);
            ctx.fillStyle = '#FFF3C4';
            ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height);
            ctx.fillStyle = '#888';
            ctx.fillRect(canvas.width / 2 - 1, 0, 2, canvas.height);
            ctx.font = 'bold 18px sans-serif';
            ctx.fillStyle = '#1A3A5C';
            ctx.textAlign = 'center';
            ctx.fillText('😢 Sad Space', canvas.width * 0.25, 25);
            ctx.fillStyle = '#5C4200';
            ctx.fillText('😊 Happy Space', canvas.width * 0.75, 25);
        };
        toolbar.appendChild(clearBtn);
        container.appendChild(toolbar);

        form.appendChild(container);
        this.drawingCanvas = canvas; // For validation
        this.inputs['sadhappy'] = { element: canvas, config: { minLength: 1 } }; // Dummy input for validation
    }

    buildTask4Panel(form) {
        this.rootDiv.style.backgroundColor = '#FDF6E3';
        this.rootDiv.style.border = '10px solid #D3C0A0';
        this.rootDiv.style.color = '#584B3A';
        this.rootDiv.style.fontFamily = 'serif';

        this.headerEl.innerHTML = '🎓 Certificate of Completion 🎓';
        this.headerEl.style.color = '#8B4513';
        this.headerEl.style.borderBottom = '2px solid #D3C0A0';
        this.headerEl.style.paddingBottom = '10px';
        this.msgEl.style.display = 'none';

        const template = document.createElement('p');
        template.style.fontSize = '18px';
        template.style.lineHeight = '1.8';
        template.style.marginTop = '30px';
        template.style.textAlign = 'center';

        const userName = `<strong>${gameState.userProfile.name || 'My user'}</strong>`;
        template.innerHTML = `${userName} needs a way to <span contenteditable="true" class="editable-span">solve their problem</span> because <span contenteditable="true" class="editable-span">of its impact</span>.`;

        const style = document.createElement('style');
        style.textContent = `
            .editable-span {
                background-color: #F0EAD6;
                padding: 4px 8px;
                border-radius: 4px;
                outline: none;
                border-bottom: 2px dashed #B0A080;
            }
            .editable-span:focus {
                background-color: #fff;
                box-shadow: 0 0 0 2px #B0A080;
            }
        `;
        document.head.appendChild(style);

        form.appendChild(template);
        this.inputs['final'] = { element: template, config: { minLength: 20 } };

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
            // At least one sad and one happy entry required
            let hasSad = false, hasHappy = false;
            Object.values(this.inputs).forEach(({element, config}) => {
                if (config.key.startsWith('sad') && element.value.trim().length > 3) hasSad = true;
                if (config.key.startsWith('happy') && element.value.trim().length > 3) hasHappy = true;
            });
            valid = hasSad && hasHappy;
        } else if (this.taskData.isFinal) {
            const finalEl = this.inputs['final'].element;
            const finalText = (finalEl.value || finalEl.textContent || '').trim();
            valid = finalText.length > 10 && this.inputs['confirm'].element.checked;
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

        let pointsAwarded = this.taskData.points;

        if (this.taskId === 'task1') {
            gameState.problemStatement = ans;
        } else if (this.taskId === 'task2') {
            gameState.empathyStory = ans;
        } else if (this.taskId === 'task3a') {
            gameState.userProfile = ans;
            // Add bonus if canvas used
            if (this.drawingCanvas) {
                 const data = this.drawingCanvas.toDataURL();
                 // rudimentary "is empty" check by size (blank is small base64)
                 if (data.length > 2000) {
                     gameState.userProfile.drawingData = data;
                     pointsAwarded += this.taskData.bonusPoints;
                 }
            }
        } else if (this.taskId === 'task3b') {
            gameState.sadHappyData.sad.texts = [ans.sad1, ans.sad2, ans.sad3];
            gameState.sadHappyData.happy.texts = [ans.happy1, ans.happy2, ans.happy3];
        } else if (this.taskId === 'task4') {
            gameState.finalStatement = ans.final;
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
