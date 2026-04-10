// ===== SpriteGenerator.js =====
// Generates player and NPC sprite sheets programmatically

const SPRITE_W = 32;
const SPRITE_H = 32;

function generateCharacterSheet(options = {}) {
    const {
        skinColor = '#f5c7a0', hairColor = '#4a3728',
        shirtColor = '#3498db', pantsColor = '#2c3e50',
        shoeColor = '#4a3728', hatColor = null,
        vestColor = null, accessory = null,
        gender = 'male'
    } = options;

    // 4 directions × 3 frames = 12 sprites
    // Layout: 3 columns (frames) × 4 rows (down, left, right, up)
    const canvas = document.createElement('canvas');
    canvas.width = SPRITE_W * 3;
    canvas.height = SPRITE_H * 4;
    const ctx = canvas.getContext('2d');

    const dirs = ['down', 'left', 'right', 'up'];
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 3; col++) {
            drawCharSprite(ctx, col * SPRITE_W, row * SPRITE_H, dirs[row], col, {
                skinColor, hairColor, shirtColor, pantsColor, shoeColor, hatColor, vestColor, accessory, gender
            });
        }
    }
    return canvas;
}

function drawCharSprite(ctx, ox, oy, dir, frame, c) {
    const s = 2; // pixel scale
    const walk = frame === 1 ? -1 : frame === 2 ? 1 : 0;
    const arm = frame === 1 ? 1 : frame === 2 ? -1 : 0;

    if (dir === 'down') {
        // Hair/hat
        ctx.fillStyle = c.hatColor || c.hairColor;
        ctx.fillRect(ox + 5 * s, oy, 6 * s, 3 * s);
        if (c.hatColor) ctx.fillRect(ox + 4 * s, oy + 2 * s, 8 * s, s);
        // Face
        ctx.fillStyle = c.skinColor;
        ctx.fillRect(ox + 5 * s, oy + 2 * s, 6 * s, 4 * s);
        // Eyes
        ctx.fillStyle = '#2c2c2c';
        ctx.fillRect(ox + 6 * s, oy + 3 * s, s, s);
        ctx.fillRect(ox + 9 * s, oy + 3 * s, s, s);
        // Mouth
        ctx.fillStyle = c.gender === 'female' ? '#e74c3c' : '#c0392b';
        ctx.fillRect(ox + 7 * s, oy + 5 * s, 2 * s, s);
        // Body
        ctx.fillStyle = c.shirtColor;
        ctx.fillRect(ox + 5 * s, oy + 6 * s, 6 * s, 4 * s);
        if (c.vestColor) {
            ctx.fillStyle = c.vestColor;
            ctx.fillRect(ox + 5 * s, oy + 6 * s, 2 * s, 4 * s);
            ctx.fillRect(ox + 9 * s, oy + 6 * s, 2 * s, 4 * s);
        }
        // Arms
        ctx.fillStyle = c.skinColor;
        ctx.fillRect(ox + 3 * s, oy + (7 + arm) * s, 2 * s, 3 * s);
        ctx.fillRect(ox + 11 * s, oy + (7 - arm) * s, 2 * s, 3 * s);
        // Pants
        ctx.fillStyle = c.pantsColor;
        ctx.fillRect(ox + 5 * s, oy + 10 * s, 3 * s, 3 * s);
        ctx.fillRect(ox + 8 * s, oy + 10 * s, 3 * s, 3 * s);
        // Shoes
        ctx.fillStyle = c.shoeColor;
        ctx.fillRect(ox + 5 * s, oy + 13 * s, 2 * s, s);
        ctx.fillRect(ox + 9 * s, oy + 13 * s, 2 * s, s);
        // Accessory
        if (c.accessory === 'clipboard') {
            ctx.fillStyle = '#a08060';
            ctx.fillRect(ox + 12 * s, oy + 8 * s, 3 * s, 4 * s);
            ctx.fillStyle = '#fff';
            ctx.fillRect(ox + 12 * s, oy + 9 * s, 2 * s, 2 * s);
        }
        if (c.accessory === 'crown') {
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(ox + 5 * s, oy, 6 * s, 2 * s);
            ctx.fillRect(ox + 7 * s, oy - s, 2 * s, s);
        }
    }
    else if (dir === 'up') {
        ctx.fillStyle = c.hatColor || c.hairColor;
        ctx.fillRect(ox + 5 * s, oy, 6 * s, 5 * s);
        if (c.hatColor) ctx.fillRect(ox + 4 * s, oy + 4 * s, 8 * s, s);
        ctx.fillStyle = c.skinColor;
        ctx.fillRect(ox + 4 * s, oy + 2 * s, s, 2 * s);
        ctx.fillRect(ox + 11 * s, oy + 2 * s, s, 2 * s);
        ctx.fillStyle = c.shirtColor;
        ctx.fillRect(ox + 5 * s, oy + 6 * s, 6 * s, 4 * s);
        if (c.vestColor) {
            ctx.fillStyle = c.vestColor;
            ctx.fillRect(ox + 5 * s, oy + 6 * s, 2 * s, 4 * s);
            ctx.fillRect(ox + 9 * s, oy + 6 * s, 2 * s, 4 * s);
        }
        ctx.fillStyle = c.skinColor;
        ctx.fillRect(ox + 3 * s, oy + (7 - arm) * s, 2 * s, 3 * s);
        ctx.fillRect(ox + 11 * s, oy + (7 + arm) * s, 2 * s, 3 * s);
        ctx.fillStyle = c.pantsColor;
        ctx.fillRect(ox + 5 * s, oy + 10 * s, 3 * s, 3 * s);
        ctx.fillRect(ox + 8 * s, oy + 10 * s, 3 * s, 3 * s);
        ctx.fillStyle = c.shoeColor;
        ctx.fillRect(ox + 5 * s, oy + 13 * s, 2 * s, s);
        ctx.fillRect(ox + 9 * s, oy + 13 * s, 2 * s, s);
    }
    else if (dir === 'left') {
        ctx.fillStyle = c.hatColor || c.hairColor;
        ctx.fillRect(ox + 5 * s, oy, 5 * s, 4 * s);
        if (c.hatColor) ctx.fillRect(ox + 3 * s, oy + 3 * s, 7 * s, s);
        ctx.fillStyle = c.skinColor;
        ctx.fillRect(ox + 6 * s, oy + 2 * s, 4 * s, 4 * s);
        ctx.fillStyle = '#2c2c2c';
        ctx.fillRect(ox + 6 * s, oy + 3 * s, s, s);
        ctx.fillStyle = c.shirtColor;
        ctx.fillRect(ox + 6 * s, oy + 6 * s, 4 * s, 4 * s);
        ctx.fillStyle = c.skinColor;
        ctx.fillRect(ox + 5 * s, oy + (7 + arm) * s, 2 * s, 3 * s);
        ctx.fillStyle = c.pantsColor;
        ctx.fillRect(ox + 6 * s, oy + 10 * s, 2 * s, 3 * s);
        ctx.fillRect(ox + 8 * s, oy + 10 * s, 2 * s, 3 * s);
        ctx.fillStyle = c.shoeColor;
        ctx.fillRect(ox + (5 + (frame === 1 ? -1 : 0)) * s, oy + 13 * s, 3 * s, s);
        ctx.fillRect(ox + (8 + (frame === 2 ? 1 : 0)) * s, oy + 13 * s, 2 * s, s);
    }
    else if (dir === 'right') {
        ctx.fillStyle = c.hatColor || c.hairColor;
        ctx.fillRect(ox + 6 * s, oy, 5 * s, 4 * s);
        if (c.hatColor) ctx.fillRect(ox + 6 * s, oy + 3 * s, 7 * s, s);
        ctx.fillStyle = c.skinColor;
        ctx.fillRect(ox + 6 * s, oy + 2 * s, 4 * s, 4 * s);
        ctx.fillStyle = '#2c2c2c';
        ctx.fillRect(ox + 9 * s, oy + 3 * s, s, s);
        ctx.fillStyle = c.shirtColor;
        ctx.fillRect(ox + 6 * s, oy + 6 * s, 4 * s, 4 * s);
        ctx.fillStyle = c.skinColor;
        ctx.fillRect(ox + 9 * s, oy + (7 + arm) * s, 2 * s, 3 * s);
        ctx.fillStyle = c.pantsColor;
        ctx.fillRect(ox + 6 * s, oy + 10 * s, 2 * s, 3 * s);
        ctx.fillRect(ox + 8 * s, oy + 10 * s, 2 * s, 3 * s);
        ctx.fillStyle = c.shoeColor;
        ctx.fillRect(ox + (5 + (frame === 1 ? -1 : 0)) * s, oy + 13 * s, 3 * s, s);
        ctx.fillRect(ox + (8 + (frame === 2 ? 1 : 0)) * s, oy + 13 * s, 2 * s, s);
    }
}

// Pre-defined NPC sprite configs
const NPC_SPRITES = {
    guide: { skinColor: '#f5c7a0', hairColor: '#6b4226', shirtColor: '#ecf0f1', pantsColor: '#2c3e50', vestColor: '#e67e22', accessory: 'clipboard' },
    task1: { skinColor: '#f5c7a0', hairColor: '#c0392b', shirtColor: '#e74c3c', pantsColor: '#922b21' },
    task2: { skinColor: '#d4a574', hairColor: '#2c3e50', shirtColor: '#3498db', pantsColor: '#1a5276' },
    task3a: { skinColor: '#f5c7a0', hairColor: '#1e8449', shirtColor: '#2ecc71', pantsColor: '#196f3d' },
    task3b: { skinColor: '#c68642', hairColor: '#4a3728', shirtColor: '#f39c12', pantsColor: '#b7950b' },
    task4: { skinColor: '#f5c7a0', hairColor: '#6c3483', shirtColor: '#9b59b6', pantsColor: '#5b2c6f' },
    shopkeeper: { skinColor: '#f5c7a0', hairColor: '#f1c40f', shirtColor: '#f39c12', pantsColor: '#e67e22', accessory: 'crown' },
    villager1: { skinColor: '#f5c7a0', hairColor: '#e91e8c', shirtColor: '#ff69b4', pantsColor: '#c71585', gender: 'female' },
    villager2: { skinColor: '#d4a574', hairColor: '#2c3e50', shirtColor: '#1abc9c', pantsColor: '#16a085' },
    villager3: { skinColor: '#f5c7a0', hairColor: '#f1c40f', shirtColor: '#f9e79f', pantsColor: '#f0b27a', gender: 'female' },
    player_male: { skinColor: '#f5c7a0', hairColor: '#4a3728', shirtColor: '#e74c3c', pantsColor: '#34495e', hatColor: '#e74c3c' },
    player_female: { skinColor: '#f5c7a0', hairColor: '#8e44ad', shirtColor: '#e91e8c', pantsColor: '#2c3e50', gender: 'female' },
};

function generateAllSprites() {
    const sheets = {};
    for (const [key, config] of Object.entries(NPC_SPRITES)) {
        sheets[key] = generateCharacterSheet(config);
    }
    return sheets;
}

// Generate a simple exclamation mark texture
function generateExclamationTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 24;
    const ctx = canvas.getContext('2d');
    // Glow
    ctx.fillStyle = 'rgba(241, 196, 15, 0.4)';
    ctx.beginPath();
    ctx.arc(8, 12, 10, 0, Math.PI * 2);
    ctx.fill();
    // Mark
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(6, 2, 4, 12);
    ctx.fillRect(6, 16, 4, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(7, 3, 1, 10);
    return canvas;
}

// Generate pet sprites (simple cat/dog)
function generatePetSheet(type) {
    const canvas = document.createElement('canvas');
    canvas.width = SPRITE_W * 3;
    canvas.height = SPRITE_H;
    const ctx = canvas.getContext('2d');
    const s = 2;

    for (let frame = 0; frame < 3; frame++) {
        const ox = frame * SPRITE_W;
        const legOff = frame === 1 ? 1 : frame === 2 ? -1 : 0;

        if (type === 'cat') {
            ctx.fillStyle = '#e67e22';
            ctx.fillRect(ox + 6 * s, 7 * s, 6 * s, 4 * s);
            ctx.fillRect(ox + 4 * s, 4 * s, 4 * s, 4 * s);
            ctx.fillRect(ox + 4 * s, 3 * s, s, s);
            ctx.fillRect(ox + 7 * s, 3 * s, s, s);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(ox + 5 * s, 5 * s, s, s);
            ctx.fillRect(ox + 7 * s, 5 * s, s, s);
            ctx.fillStyle = '#d35400';
            ctx.fillRect(ox + (6 + legOff) * s, 11 * s, s, 2 * s);
            ctx.fillRect(ox + 8 * s, 11 * s, s, 2 * s);
            ctx.fillRect(ox + (10 - legOff) * s, 11 * s, s, 2 * s);
            ctx.fillRect(ox + 11 * s, 11 * s, s, 2 * s);
            ctx.fillStyle = '#e67e22';
            ctx.fillRect(ox + 12 * s, (frame === 1 ? 6 : 7) * s, s, 2 * s);
        } else {
            ctx.fillStyle = '#a0522d';
            ctx.fillRect(ox + 5 * s, 7 * s, 7 * s, 4 * s);
            ctx.fillRect(ox + 3 * s, 4 * s, 4 * s, 4 * s);
            ctx.fillStyle = '#c19a6b';
            ctx.fillRect(ox + 3 * s, 6 * s, 2 * s, 2 * s);
            ctx.fillStyle = '#2c2c2c';
            ctx.fillRect(ox + 3 * s, 6 * s, s, s);
            ctx.fillRect(ox + 4 * s, 5 * s, s, s);
            ctx.fillRect(ox + 6 * s, 5 * s, s, s);
            ctx.fillStyle = '#8b4513';
            ctx.fillRect(ox + 3 * s, 3 * s, s, 3 * s);
            ctx.fillRect(ox + 6 * s, 3 * s, s, 3 * s);
            ctx.fillRect(ox + (5 + legOff) * s, 11 * s, 2 * s, 2 * s);
            ctx.fillRect(ox + (9 - legOff) * s, 11 * s, 2 * s, 2 * s);
        }
    }
    return canvas;
}
