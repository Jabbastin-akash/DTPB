// ===== CompleteScene.js =====
// Final screen shown when the game is fully complete

class CompleteScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CompleteScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.add.rectangle(w / 2, h / 2, w, h, 0x1a1a2e);

        this.add.text(w / 2, 80, '🎉 CONGRATULATIONS! 🎉', {
            fontFamily: '"Press Start 2P", monospace', fontSize: '24px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(w / 2, 140, 'You are a true Design Thinker!', {
            fontFamily: 'sans-serif', fontSize: '18px', color: '#ecf0f1'
        }).setOrigin(0.5);

        // Summary Card
        const cvw = 680, cvh = 340;
        const sumGrap = this.add.graphics();
        sumGrap.fillStyle(0x34495e, 1);
        sumGrap.fillRoundedRect(w / 2 - cvw / 2, 200, cvw, cvh, 16);
        sumGrap.lineStyle(4, 0x2ecc71);
        sumGrap.strokeRoundedRect(w / 2 - cvw / 2, 200, cvw, cvh, 16);

        const ideaTitle = (gameState.taskAnswers && gameState.taskAnswers.task6 && gameState.taskAnswers.task6.ideaTitle)
            ? gameState.taskAnswers.task6.ideaTitle
            : 'N/A';

        const summaryText = [
            `Problem:`,
            `"${(gameState.problemStatement && gameState.problemStatement.problem) ? gameState.problemStatement.problem : ''}"`,
            '',
            `User:`,
            `${(gameState.userProfile && gameState.userProfile.name) ? gameState.userProfile.name : 'N/A'} (Age ${(gameState.userProfile && gameState.userProfile.age) ? gameState.userProfile.age : '?'})`,
            '',
            `Park idea title:`,
            `${ideaTitle}`,
            '',
            `Final idea name:`,
            `${gameState.finalStatement || 'N/A'}`
        ].join('\n');

        this.add.text(w / 2 - cvw / 2 + 20, 220, summaryText, {
            fontFamily: 'sans-serif', fontSize: '16px', color: '#ecf0f1', wordWrap: { width: cvw - 40 }
        });

        // Points
        this.add.text(w / 2, h - 80, `Total Points Earned: ⭐ ${gameState.points}`, {
            fontFamily: 'sans-serif', fontSize: '20px', color: '#f1c40f', fontStyle: 'bold'
        }).setOrigin(0.5);

        // PDF export button
        const btnW = 360;
        const btnH = 54;
        const btnY = h - 150;
        const btnBg = this.add.rectangle(w / 2, btnY, btnW, btnH, 0x2ecc71, 1).setOrigin(0.5);
        btnBg.setStrokeStyle(3, 0x000000, 0.35);
        btnBg.setInteractive({ useHandCursor: true });

        const btnText = this.add.text(w / 2, btnY, 'Download PDF Report', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            color: '#0b2f1a'
        }).setOrigin(0.5);
        btnText.setInteractive({ useHandCursor: true });

        const click = () => this.downloadPdfReport();
        btnBg.on('pointerup', click);
        btnText.on('pointerup', click);

        // Auto-download once on entry (user requested both auto + button)
        this._autoDownloaded = false;
        this.time.delayedCall(500, () => {
            if (this._autoDownloaded) return;
            this._autoDownloaded = true;
            this.downloadPdfReport(true);
        });

    }

    downloadPdfReport(isAuto = false) {
        try {
            const jsPDF = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
            if (!jsPDF) {
                if (!isAuto) {
                    alert('PDF export is unavailable (jsPDF failed to load).');
                }
                return;
            }

            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();

            const marginX = 44;
            const marginTop = 54;
            const marginBottom = 54;
            const lineH = 16;

            const wrapText = (text, maxW) => {
                if (!text) return [''];
                return doc.splitTextToSize(String(text), maxW);
            };

            const addWrapped = (text, x, y, maxW, lh = lineH) => {
                const lines = wrapText(text, maxW);
                for (const line of lines) {
                    if (y > pageH - marginBottom) {
                        doc.addPage();
                        y = marginTop;
                    }
                    doc.text(line, x, y);
                    y += lh;
                }
                return y;
            };

            const addHeading = (text, y) => {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                y = addWrapped(text, marginX, y, pageW - marginX * 2, 18);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(11);
                y += 6;
                return y;
            };

            const addKeyValue = (key, value, y) => {
                const safeVal = (value === null || value === undefined) ? '' : String(value);
                return addWrapped(`${key}: ${safeVal}`, marginX, y, pageW - marginX * 2);
            };

            const addImageBlock = (dataUrl, y, label = null, maxHeightPt = 260) => {
                if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) return y;
                if (y > pageH - marginBottom - maxHeightPt) {
                    doc.addPage();
                    y = marginTop;
                }
                if (label) {
                    doc.setFont('helvetica', 'italic');
                    doc.setFontSize(10);
                    y = addWrapped(label, marginX, y, pageW - marginX * 2);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(11);
                }

                const imgW = pageW - marginX * 2;
                const imgH = Math.min(maxHeightPt, Math.floor(imgW * 0.65));
                doc.addImage(dataUrl, 'PNG', marginX, y, imgW, imgH);
                return y + imgH + 14;
            };

            // --- Title Page ---
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(20);
            doc.text('Design Thinking World Report', marginX, 72);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            const dateStr = new Date().toISOString().slice(0, 10);
            doc.text(`Date: ${dateStr}`, marginX, 96);
            doc.text(`Total points: ${gameState.points}`, marginX, 114);

            let y = 150;
            y = addHeading('Quick Summary', y);
            y = addKeyValue('Problem', gameState.problemStatement?.problem || '', y);
            y = addKeyValue('User', gameState.userProfile?.name || '', y);
            y = addKeyValue('Park idea title', gameState.taskAnswers?.task6?.ideaTitle || '', y);
            y = addKeyValue('Final idea name', gameState.finalStatement || '', y);

            // --- Task Pages ---
            const order = (typeof TASK_ORDER !== 'undefined' && Array.isArray(TASK_ORDER) && TASK_ORDER.length)
                ? TASK_ORDER
                : Object.keys(TASKS || {});

            order.forEach((taskId) => {
                doc.addPage();
                let yy = marginTop;
                const task = (TASKS && TASKS[taskId]) ? TASKS[taskId] : { title: taskId };
                yy = addHeading(task.title || taskId, yy);

                const answers = (gameState.taskAnswers && gameState.taskAnswers[taskId]) ? gameState.taskAnswers[taskId] : null;
                if (answers && typeof answers === 'object') {
                    Object.entries(answers).forEach(([k, v]) => {
                        yy = addKeyValue(k, v, yy);
                    });
                } else {
                    yy = addWrapped('No answers saved for this task.', marginX, yy, pageW - marginX * 2);
                }

                // Task-specific drawings
                if (taskId === 'task3a' && gameState.userProfile?.drawingData) {
                    yy = addImageBlock(gameState.userProfile.drawingData, yy + 12, 'User drawing');
                }

                if (taskId === 'task3b') {
                    if (gameState.sadHappyData?.sad?.drawingData) {
                        yy = addImageBlock(gameState.sadHappyData.sad.drawingData, yy + 12, 'Sad space drawing');
                    }
                    if (gameState.sadHappyData?.happy?.drawingData) {
                        yy = addImageBlock(gameState.sadHappyData.happy.drawingData, yy + 12, 'Happy space drawing');
                    }
                }

                const genericDrawing = gameState.taskDrawings ? gameState.taskDrawings[taskId] : null;
                if (genericDrawing) {
                    yy = addImageBlock(genericDrawing, yy + 12, 'Drawing');
                }
            });

            // Filename: user name (if known) + date
            const rawName = (gameState.userProfile && gameState.userProfile.name) ? gameState.userProfile.name : 'player';
            const safeName = String(rawName).trim().replace(/[^a-z0-9\-_]+/gi, '_').replace(/^_+|_+$/g, '').slice(0, 24) || 'player';
            const fileName = `DesignThinkingWorld_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`;

            doc.save(fileName);
        } catch (err) {
            console.error('PDF export failed:', err);
            if (!isAuto) alert('PDF export failed. Check the console for details.');
        }
    }
}
