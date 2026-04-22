// ===== characterConfig.js =====
// Centralized per-character tuning so scale/speed/hitbox stays consistent across scenes.

const CHARACTER_CONFIG = {
    player_male: {
        scaleMultiplier: 1.0,
        speed: 220,
        hitbox: { w: 18, h: 14, offsetYFromBottom: 1 }
    },
    player_female: {
        scaleMultiplier: 0.75,
        speed: 220,
        hitbox: { w: 16, h: 12, offsetYFromBottom: 1 }
    },

    // Example future character
    ironman: {
        scaleMultiplier: 0.12,
        speed: 220,
        hitbox: { w: 16, h: 12, offsetYFromBottom: 1 }
    }
};

// Safe accessor (handles unknown keys)
function getCharacterConfig(textureKey) {
    return CHARACTER_CONFIG[textureKey] || { scaleMultiplier: 1.0, speed: 220, hitbox: { w: 16, h: 12, offsetYFromBottom: 1 } };
}
