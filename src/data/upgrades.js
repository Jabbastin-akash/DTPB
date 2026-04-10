// ===== upgrades.js =====
// Upgrade catalogue — all 7 upgrades with tile swap data

const UPGRADES = [
    {
        id: 'flowers',
        label: 'Plant Flowers',
        icon: '🌸',
        cost: 10,
        description: 'Empty soil → blooming flower patches',
        purchased: false,
        tiles: [
            { x: 18, y: 15, layer: 'Upgrade', fromTile: 1, toTile: 10 }
        ]
    },
    {
        id: 'garden',
        label: 'Water the Garden',
        icon: '💧',
        cost: 15,
        description: 'Dry grass → lush green garden',
        purchased: false,
        requires: 'flowers',
        tiles: [
            { x: 17, y: 14, layer: 'Upgrade', fromTile: 1, toTile: 11 },
            { x: 18, y: 14, layer: 'Upgrade', fromTile: 1, toTile: 11 },
            { x: 19, y: 14, layer: 'Upgrade', fromTile: 1, toTile: 11 },
            { x: 17, y: 16, layer: 'Upgrade', fromTile: 1, toTile: 11 },
            { x: 19, y: 16, layer: 'Upgrade', fromTile: 1, toTile: 11 }
        ]
    },
    {
        id: 'bench',
        label: 'Add Park Bench',
        icon: '🪑',
        cost: 10,
        description: 'Add a cozy bench + nearby villager',
        purchased: false,
        tiles: [
            { x: 16, y: 15, layer: 'Upgrade', fromTile: 1, toTile: 12 }
        ],
        spawnNpc: true
    },
    {
        id: 'pet',
        label: 'Adopt a Pet',
        icon: '🐱',
        cost: 20,
        description: 'A cute pet appears near the fountain!',
        purchased: false,
        tiles: [],
        spawnPet: true
    },
    {
        id: 'fountain',
        label: 'Upgrade Fountain',
        icon: '⛲',
        cost: 30,
        description: 'Small fountain → grand animated fountain',
        purchased: false,
        tiles: [
            { x: 12, y: 9, layer: 'Upgrade', fromTile: 15, toTile: 16 },
            { x: 13, y: 9, layer: 'Upgrade', fromTile: 15, toTile: 16 }
        ]
    },
    {
        id: 'lamps',
        label: 'Add Street Lamps',
        icon: '💡',
        cost: 15,
        description: 'Dark paths → warmly lit pathways',
        purchased: false,
        tiles: [
            { x: 8, y: 8, layer: 'Upgrade', fromTile: 1, toTile: 13 },
            { x: 16, y: 8, layer: 'Upgrade', fromTile: 1, toTile: 13 },
            { x: 8, y: 14, layer: 'Upgrade', fromTile: 1, toTile: 13 }
        ]
    },
    {
        id: 'mural',
        label: 'Paint a Mural',
        icon: '🎨',
        cost: 25,
        description: 'Plain wall → colorful painted mural',
        purchased: false,
        tiles: [
            { x: 2, y: 10, layer: 'Upgrade', fromTile: 3, toTile: 17 }
        ]
    }
];
