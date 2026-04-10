// ===== tasks.js =====
// All 5 task definitions — never hardcode task text elsewhere

const TASKS = {
    task1: {
        id: 'task1',
        title: 'Define the Problem Statement',
        icon: '📋',
        housePos: { x: 5, y: 2 },
        npcPos: { x: 7, y: 8 },
        npcPatrol: [{ x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 }],
        npcName: 'Ruby',
        npcColor: 0xe74c3c,
        roofColor: 0xc0392b,
        points: 20,
        bonusPoints: 0,
        greeting: "Hello! Every big solution starts with understanding the problem. Can you tell me what problem you want to solve?",
        completeMsg: "Great thinking! You've defined your first problem!",
        dialogue: {
            intro: "Hello! Every big solution starts with understanding the problem. Can you tell me what problem you want to solve?",
            complete: "Great thinking! You've defined your first problem! Now go see Azure over there.",
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
        title: 'Empathize & Define Story',
        icon: '📖',
        housePos: { x: 29, y: 2 },
        npcPos: { x: 31, y: 8 },
        npcPatrol: [{ x: 30, y: 8 }, { x: 31, y: 8 }, { x: 32, y: 8 }],
        npcName: 'Azure',
        npcColor: 0x3498db,
        roofColor: 0x2980b9,
        points: 30,
        bonusPoints: 0,
        greeting: "We are like detectives! We watch and listen to understand how people feel and what they need. Now let's define the problem as a story.",
        completeMsg: "Amazing detective work! Your empathy story is complete!",
        dialogue: {
            intro: "We are like detectives! We watch and listen to understand how people feel and what they need. Now let's define the problem as a story.",
            complete: "Amazing detective work! Now go find Jade and tell her about your user.",
            locked: "You need to finish the problem statement with Ruby first.",
            in_progress: "Keep filling out that story, detective!"
        },
        fields: [
            { key: 'who', label: 'Who is facing the problem?', placeholder: 'Describe the person or group...', type: 'textarea', minWords: 5, validation: 'words' },
            { key: 'what', label: 'What is happening to them?', placeholder: 'Describe the situation...', type: 'textarea', minWords: 5, validation: 'words' },
            { key: 'when', label: 'When does it happen?', placeholder: 'Time of day, specific moment...', type: 'textarea', minWords: 5, validation: 'words' },
            { key: 'where', label: 'Where does it happen?', placeholder: 'Location or context...', type: 'textarea', minWords: 5, validation: 'words' },
            { key: 'how', label: 'How does it affect them?', placeholder: 'Emotional or physical impact...', type: 'textarea', minWords: 5, validation: 'words' },
            { key: 'why', label: 'Why is it a problem?', placeholder: 'What makes this worth solving...', type: 'textarea', minWords: 5, validation: 'words' }
        ]
    },

    task3a: {
        id: 'task3a',
        title: 'Find a User',
        icon: '🎨',
        housePos: { x: 5, y: 13 },
        npcPos: { x: 7, y: 20 },
        npcPatrol: [{ x: 6, y: 20 }, { x: 7, y: 20 }, { x: 8, y: 20 }],
        npcName: 'Jade',
        npcColor: 0x2ecc71,
        roofColor: 0x27ae60,
        points: 30,
        bonusPoints: 10, // for drawing
        greeting: "Now let's find a real user! Think of someone who actually faces this problem. Tell me about them.",
        completeMsg: "Fantastic! You've created a user profile!",
        dialogue: {
            intro: "Now let's find a real user! Think of someone who actually faces this problem. Tell me about them.",
            complete: "Fantastic! You've created a user profile! Now go talk to Sunny.",
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
        title: 'Sad Space / Happy Space',
        icon: '😊',
        housePos: { x: 30, y: 13 },
        npcPos: { x: 32, y: 19 },
        npcPatrol: [{ x: 31, y: 19 }, { x: 32, y: 19 }, { x: 33, y: 19 }],
        npcName: 'Sunny',
        npcColor: 0xf39c12,
        roofColor: 0xe67e22,
        points: 25,
        bonusPoints: 0,
        greeting: "Let's understand how your user feels! Show us the sad moments and the happy moments in their life.",
        completeMsg: "Great job exploring feelings! Understanding emotions is key to design!",
        dialogue: {
            intro: "Let's understand how your user feels! Show us the sad moments and the happy moments in their life.",
            complete: "Great job exploring feelings! Now go see Stella to finalize your idea.",
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

    task4: {
        id: 'task4',
        title: 'My Product Will Help!',
        icon: '💡',
        housePos: { x: 17, y: 2 },
        npcPos: { x: 19, y: 8 },
        npcPatrol: [{ x: 18, y: 8 }, { x: 19, y: 8 }, { x: 20, y: 8 }],
        npcName: 'Stella',
        npcColor: 0x9b59b6,
        roofColor: 0x8e44ad,
        points: 35,
        bonusPoints: 0,
        greeting: "You've done amazing detective work! Now it's time to commit. Which problem are YOU going to solve with your product?",
        completeMsg: "You've committed to your problem! You're a true Design Thinker!",
        dialogue: {
            intro: "You've done amazing detective work! Now it's time to commit. Which problem are YOU going to solve with your product?",
            complete: "You've committed to your problem! You're a true Design Thinker! The village is proud of you.",
            locked: "You need to finish the sad/happy space with Sunny first.",
            in_progress: "Ready to commit to your final problem statement?"
        },
        isFinal: true,
        template: '[User name] needs a way to [solve problem] because [reason/impact].'
    }
};

// Task order for sequential unlocking
const TASK_ORDER = ['task1', 'task2', 'task3a', 'task3b', 'task4'];
