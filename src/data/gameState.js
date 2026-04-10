// ===== gameState.js =====
// Single global state object — all game data is read/written here

const gameState = {
    points: 0,
    tasksComplete: [],          // e.g. ['task1', 'task2', ...]
    upgradesPurchased: [],      // e.g. ['flowers', 'bench', ...]
    playerGender: 'male',       // Set by CharSelectScene

    // Task 1 — Define the Problem Statement
    problemStatement: {
        problem: '',
        helpPeople: ''
    },

    // Task 2 — Empathize & Define Story
    empathyStory: {
        who: '',
        what: '',
        when: '',
        where: '',
        how: '',
        why: ''
    },

    // Task 3a — Find a User
    userProfile: {
        name: '',
        problem: '',
        feelings: '',
        age: 0,
        when: '',
        wish: '',
        drawingData: null       // base64 PNG or null
    },

    // Task 3b — Sad / Happy Space
    sadHappyData: {
        sad: {
            texts: ['', '', ''],
            drawingData: null
        },
        happy: {
            texts: ['', '', ''],
            drawingData: null
        }
    },

    // Task 4 — My Product Will Help
    finalStatement: '',

    // Helper methods
    addPoints(amount, sourcePosition = null) {
        this.points += amount;
        EventBus.emit('points:changed', this.points);
        EventBus.emit('points:added', { amount, sourcePosition });
    },

    spendPoints(amount) {
        if (this.points >= amount) {
            this.points -= amount;
            EventBus.emit('points:changed', this.points);
            return true;
        }
        return false;
    },

    completeTask(taskId) {
        if (!this.tasksComplete.includes(taskId)) {
            this.tasksComplete.push(taskId);
            EventBus.emit('task:completed', { taskId, total: this.tasksComplete.length, isNewCompletion: true });
        }
    },

    isTaskComplete(taskId) {
        return this.tasksComplete.includes(taskId);
    },

    isTaskUnlocked(taskId) {
        // task1 is always unlocked; others require previous task completion
        const order = ['task1', 'task2', 'task3a', 'task3b', 'task4'];
        const idx = order.indexOf(taskId);
        if (idx <= 0) return true;
        return this.tasksComplete.includes(order[idx - 1]);
    },

    purchaseUpgrade(upgradeId) {
        if (!this.upgradesPurchased.includes(upgradeId)) {
            this.upgradesPurchased.push(upgradeId);
        }
    },

    isUpgradePurchased(upgradeId) {
        return this.upgradesPurchased.includes(upgradeId);
    },

    getCompletedTaskCount() {
        return this.tasksComplete.length;
    },

    get allTasksComplete() {
        const totalTasks = (typeof TASKS === 'object' && TASKS) ? Object.keys(TASKS).length : 5;
        return this.tasksComplete.length >= totalTasks;
    }
};
