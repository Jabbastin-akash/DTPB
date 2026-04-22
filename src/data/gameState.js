// ===== gameState.js =====
// Single global state object — all game data is read/written here

const gameState = {
    points: 0,
    tasksComplete: [],          // e.g. ['task1', 'task2', ...]
    upgradesPurchased: [],      // e.g. ['flowers', 'bench', ...]
    playerGender: 'male',       // Set by CharSelectScene

    // Optional explicit player texture key (e.g. 'ironman').
    // If set, it overrides playerGender-based selection.
    playerTextureKey: null,

    // Global visual scale for character sprites (Player + NPCs + conversation scenes)
    // Increase this to make characters appear larger across the game.
    characterScale: 1.5,

    // Player scale ONLY for the main world/website (GameScene). This does not affect
    // Football/Maze/Classroom scenes unless they explicitly opt-in.
    // Example: 0.9 makes the player ~10% smaller than characterScale in the overworld.
    playerWorldScaleMultiplier: 0.9,

    // House sprite scale ONLY for the main world/website (GameScene).
    // Example: 1.1 makes all houses ~10% larger in the overworld.
    houseScale: 1.1,

    // Separate NPC scale (villagers, task NPCs, teacher/friend sprites).
    // If undefined/null, NPCs fall back to characterScale.
    npcScale: 1.8,

    // Generic per-task storage (used by new story tasks + PDF export)
    taskAnswers: {},            // e.g. { task6: { ideaTitle: '...', ... } }
    taskDrawings: {},           // e.g. { task6: 'data:image/png;base64,...' }

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
            EventBus.emit('task:completed', { taskId, total: this.getCompletedTaskCount(), isNewCompletion: true });
        }
    },

    isTaskComplete(taskId) {
        return this.tasksComplete.includes(taskId);
    },

    isTaskUnlocked(taskId) {
        // task1 is always unlocked; others require previous task completion
        const order = (typeof TASK_ORDER !== 'undefined' && Array.isArray(TASK_ORDER) && TASK_ORDER.length)
            ? TASK_ORDER
            : ['task1', 'task2', 'task3a', 'task3b', 'task5', 'task6', 'task7', 'task4'];

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
        const order = (typeof TASK_ORDER !== 'undefined' && Array.isArray(TASK_ORDER) && TASK_ORDER.length)
            ? TASK_ORDER
            : (typeof TASKS === 'object' && TASKS) ? Object.keys(TASKS) : [];

        if (!order || order.length === 0) return this.tasksComplete.length;
        return order.filter(tId => this.tasksComplete.includes(tId)).length;
    },

    get allTasksComplete() {
        const order = (typeof TASK_ORDER !== 'undefined' && Array.isArray(TASK_ORDER) && TASK_ORDER.length)
            ? TASK_ORDER
            : (typeof TASKS === 'object' && TASKS) ? Object.keys(TASKS) : [];

        if (!order || order.length === 0) return false;
        return order.every(tId => this.tasksComplete.includes(tId));
    }
};
