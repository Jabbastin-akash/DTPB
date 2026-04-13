// ===== tasks.js =====
// All task definitions — never hardcode task text elsewhere

const TASKS = {
    task1: {
        id: 'task1',
        title: 'Home: Define the Problem Statement',
        icon: '📋',
        housePos: { x: 5, y: 2 },
        npcPos: { x: 7, y: 8 },
        npcPatrol: [{ x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 }],
        npcName: 'Ruby',
        npcColor: 0xe74c3c,
        roofColor: 0xc0392b,
        points: 20,
        bonusPoints: 0,
        greeting: "At Home: Every big solution starts with understanding the problem. What problem do you want to solve?",
        completeMsg: "Great thinking! You've defined your first problem!",
        dialogue: {
            intro: "At Home: Every big solution starts with understanding the problem. Can you tell me what problem you want to solve?",
            complete: "Great thinking! You've defined your first problem! Now head to the Playground.",
            locked: "I'm still thinking about problems... come back later!",
            in_progress: "How's that problem statement coming along?"
        },
        fields: [
            {
                key: 'problem',
                label: 'What problem do you want to solve?',
                placeholder: 'Describe the problem you want to solve...',
                type: 'textarea',
                minLength: 10,
                validation: 'text'
            },
            {
                key: 'helpPeople',
                label: 'How do you think this will help people?',
                placeholder: 'Explain how solving this would help...',
                type: 'textarea',
                minLength: 10,
                validation: 'text'
            }
        ]
    },

    task2: {
        id: 'task2',
        title: 'Playground: Football Challenge',
        icon: '📖',
        housePos: { x: 3, y: 23 },
        npcPos: { x: 5, y: 24 },
        npcPatrol: [{ x: 4, y: 24 }, { x: 5, y: 24 }, { x: 6, y: 24 }],
        npcName: 'Azure',
        npcColor: 0x3498db,
        roofColor: 0x2980b9,
        points: 30,
        bonusPoints: 0,
        greeting: "At the Playground: kick the ball into each goal corner and answer the question after every successful shot.",
        completeMsg: "Great game! You've finished the football challenge!",
        dialogue: {
            intro: "At the Playground: kick the ball into each goal corner and answer the question after every successful shot.",
            complete: "Great game! Now head to the Classroom.",
            locked: "You need to finish the problem statement with Ruby first.",
            in_progress: "Keep filling out that story, detective!"
        },
        goalQuestions: [
            'What is one clear goal for your solution?',
            'Who benefits most from your solution?',
            'What obstacle could block your idea?',
            'How will you know your solution worked?'
        ],
        // NOTE: Task 2 is completed in FootballScene; fields are not used.
    },

    task3a: {
        id: 'task3a',
        title: 'Classroom: Pick a User',
        icon: '🎨',
        housePos: { x: 5, y: 13 },
        npcPos: { x: 7, y: 20 },
        npcPatrol: [{ x: 6, y: 20 }, { x: 7, y: 20 }, { x: 8, y: 20 }],
        npcName: 'Jade',
        npcColor: 0x2ecc71,
        roofColor: 0x27ae60,
        points: 30,
        bonusPoints: 10, // for drawing
        greeting: "In the Classroom: choose (or invent) a user who faces this problem and describe them.",
        completeMsg: "Fantastic! You've created a user profile!",
        dialogue: {
            intro: "In the Classroom: choose (or invent) a user who faces this problem. Tell me about them.",
            complete: "Nice! Now head to the Corridor.",
            locked: "You need to finish the empathy story with Azure first.",
            in_progress: "Tell me more about this user."
        },
        fields: [
            { key: 'name', label: 'What is their name?', placeholder: 'Enter a name...', type: 'text', minLength: 2, validation: 'text' },
            { key: 'problem', label: 'What problem do they have?', placeholder: 'Describe their problem...', type: 'textarea', minLength: 10, validation: 'text' },
            { key: 'feelings', label: 'How do they feel about it?', placeholder: 'Describe their feelings...', type: 'textarea', minLength: 10, validation: 'text' },
            { key: 'age', label: 'How old are they?', placeholder: '1-100', type: 'number', min: 1, max: 100, validation: 'number' },
            { key: 'when', label: 'When does the problem happen?', placeholder: 'When does this occur...', type: 'text', minLength: 5, validation: 'text' },
            { key: 'wish', label: 'What do they wish for?', placeholder: 'What would they want...', type: 'textarea', minLength: 10, validation: 'text' }
        ],
        hasCanvas: true,
        canvasWidth: 400,
        canvasHeight: 300,
        canvasLabel: 'Draw your user! (optional but earns +10 bonus points)'
    },

    task3b: {
        id: 'task3b',
        title: 'Corridor: Sad Space / Happy Space',
        icon: '😊',
        housePos: { x: 30, y: 13 },
        npcPos: { x: 32, y: 19 },
        npcPatrol: [{ x: 31, y: 19 }, { x: 32, y: 19 }, { x: 33, y: 19 }],
        npcName: 'Sunny',
        npcColor: 0xf39c12,
        roofColor: 0xe67e22,
        points: 25,
        bonusPoints: 0,
        greeting: "In the Corridor: show the sad moments and the happy moments in your user's journey.",
        completeMsg: "Great job exploring feelings! Understanding emotions is key to design!",
        dialogue: {
            intro: "In the Corridor: show the sad moments and the happy moments in your user's journey.",
            complete: "Great job! Now head to the Maze.",
            locked: "You need to create a user profile with Jade first.",
            in_progress: "How are those sad and happy spaces coming along?"
        },
        isSadHappy: true,
        sadFields: [
            { key: 'sad1', label: 'Sad moment 1', placeholder: 'Something that makes them sad...', type: 'text' },
            { key: 'sad2', label: 'Sad moment 2', placeholder: 'Another problem...', type: 'text' },
            { key: 'sad3', label: 'Sad moment 3', placeholder: 'One more...', type: 'text' }
        ],
        happyFields: [
            { key: 'happy1', label: 'Happy solution 1', placeholder: 'Something that would help...', type: 'text' },
            { key: 'happy2', label: 'Happy solution 2', placeholder: 'Another solution...', type: 'text' },
            { key: 'happy3', label: 'Happy solution 3', placeholder: 'One more...', type: 'text' }
        ],
        canvasWidth: 300,
        canvasHeight: 200
    },

    task5: {
        id: 'task5',
        title: 'Maze: Checkpoints',
        icon: '🧩',
        npcName: 'Maze Guide',
        npcColor: 0x7f8c8d,
        roofColor: 0x7f8c8d,
        points: 35,
        bonusPoints: 0,
        greeting: "Enter the maze and answer the checkpoint questions.",
        completeMsg: "You cleared the maze checkpoints!",
        dialogue: {
            intro: "Enter the maze and answer the checkpoint questions.",
            complete: "Great work! Now head to the Park.",
            locked: "Finish the Corridor task first.",
            in_progress: "Keep going — you can do it!"
        },
        // NOTE: Task 5 is completed in MazeScene; fields are not used.
    },

    task6: {
        id: 'task6',
        title: 'Park: Ideate a Solution',
        icon: '🌳',
        npcName: 'Park Ranger',
        npcColor: 0x16a085,
        roofColor: 0x16a085,
        points: 30,
        bonusPoints: 10,
        greeting: "In the Park: sketch and describe your solution idea.",
        completeMsg: "Awesome ideas!",
        dialogue: {
            intro: "In the Park: sketch and describe your solution idea.",
            complete: "Nice! Now head to the School to validate.",
            locked: "Finish the Maze first.",
            in_progress: "Keep refining that idea!"
        },
        fields: [
            { key: 'ideaTitle', label: 'Idea title', placeholder: 'Give your idea a short name...', type: 'text', minLength: 2, validation: 'text' },
            { key: 'ideaDescription', label: 'Describe your idea', placeholder: 'What is it and how does it help?', type: 'textarea', minLength: 10, validation: 'text' }
        ],
        hasCanvas: true,
        canvasWidth: 420,
        canvasHeight: 260,
        canvasLabel: 'Draw your idea (optional, earns +10 bonus points)'
    },

    task7: {
        id: 'task7',
        title: 'School: Validate & Improve',
        icon: '✅',
        npcName: 'Teacher',
        npcColor: 0x8e44ad,
        roofColor: 0x8e44ad,
        points: 30,
        bonusPoints: 0,
        greeting: "At School: validate your idea and decide what to improve.",
        completeMsg: "Great validation!",
        dialogue: {
            intro: "At School: validate your idea and decide what to improve.",
            complete: "Now head to the Landmark for your final reward.",
            locked: "Finish the Park ideation first.",
            in_progress: "Be honest — what can be improved?"
        },
        fields: [
            { key: 'whatWorks', label: 'What works well?', placeholder: 'What is strong about your idea?', type: 'textarea', minLength: 5, validation: 'text' },
            { key: 'whatToImprove', label: 'What would you improve next?', placeholder: 'What would you change or add?', type: 'textarea', minLength: 5, validation: 'text' },
            { key: 'whoToAsk', label: 'Who would you ask for feedback?', placeholder: 'Friend, teacher, parent, etc...', type: 'text', minLength: 2, validation: 'text' }
        ]
    },

    task4: {
        id: 'task4',
        title: 'Landmark: Name Your Final Idea',
        icon: '💡',
        housePos: { x: 17, y: 2 },
        npcPos: { x: 19, y: 8 },
        npcPatrol: [{ x: 18, y: 8 }, { x: 19, y: 8 }, { x: 20, y: 8 }],
        npcName: 'Stella',
        npcColor: 0x9b59b6,
        roofColor: 0x8e44ad,
        points: 35,
        bonusPoints: 0,
        greeting: "At the Landmark: give your final idea a name and claim your reward!",
        completeMsg: "Your final idea is ready!",
        dialogue: {
            intro: "At the Landmark: give your final idea a name and claim your reward!",
            complete: "You did it! The village is proud of you.",
            locked: "You need to finish the sad/happy space with Sunny first.",
            in_progress: "Ready to commit to your final problem statement?"
        },
        isFinal: true,
        template: ''
    }
};

// Task order for sequential unlocking
const TASK_ORDER = ['task1', 'task2', 'task3a', 'task3b', 'task5', 'task6', 'task7', 'task4'];
