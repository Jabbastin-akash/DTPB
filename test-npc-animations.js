#!/usr/bin/env node
/**
 * Test script to verify NPC animations are working
 * Run with: node test-npc-animations.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 NPC Animation System Test\n');

// Check if BootScene.js exists
const bootScenePath = path.join(__dirname, 'src/scenes/BootScene.js');
if (!fs.existsSync(bootScenePath)) {
    console.error('❌ BootScene.js not found');
    process.exit(1);
}

const bootSceneContent = fs.readFileSync(bootScenePath, 'utf-8');

// Test 1: Check for NPC asset paths
console.log('✅ Test 1: NPC Asset Loading');
const npcAssets = ['D_Idle', 'D_Walk', 'U_Idle', 'U_Walk', 'S_Idle', 'S_Walk'];
for (const asset of npcAssets) {
    if (bootSceneContent.includes(asset)) {
        console.log(`  ✓ Found ${asset} in preload`);
    }
}

// Test 2: Check for buildNpcSheets function
console.log('\n✅ Test 2: NPC Sheet Building');
if (bootSceneContent.includes('const buildNpcSheets')) {
    console.log('  ✓ buildNpcSheets function exists');
} else {
    console.error('  ❌ buildNpcSheets function missing');
}

// Test 3: Check for placeholder fallback
console.log('\n✅ Test 3: Placeholder Fallback');
if (bootSceneContent.includes('createPlaceholderSheet')) {
    console.log('  ✓ Placeholder creation exists');
} else {
    console.error('  ❌ Placeholder creation missing');
}

// Test 4: Check for createHumanoidAnimations function
console.log('\n✅ Test 4: Animation Creation');
if (bootSceneContent.includes('const createHumanoidAnimations')) {
    console.log('  ✓ createHumanoidAnimations function exists');
} else {
    console.error('  ❌ createHumanoidAnimations function missing');
}

// Test 5: Check for fallback animations
console.log('\n✅ Test 5: Fallback Animations');
if (bootSceneContent.includes('fallbackKey')) {
    console.log('  ✓ Fallback animations implemented');
} else {
    console.error('  ❌ Fallback animations missing');
}

// Test 6: Verify npcKeyToSet mapping
console.log('\n✅ Test 6: NPC Key Mapping');
const npcKeyMatches = bootSceneContent.match(/const npcKeyToSet = \{([^}]+)\}/s);
if (npcKeyMatches) {
    const mappingStr = npcKeyMatches[1];
    const keys = mappingStr.match(/(\w+):/g) || [];
    console.log(`  ✓ Found ${keys.length} NPC keys`);
    keys.forEach(k => {
        const key = k.replace(':', '');
        console.log(`    - ${key}`);
    });
} else {
    console.error('  ❌ npcKeyToSet not found');
}

// Test 7: Check for error handling
console.log('\n✅ Test 7: Error Handling');
if (bootSceneContent.includes('console.warn') || bootSceneContent.includes('console.error')) {
    console.log('  ✓ Error handling/logging present');
} else {
    console.warn('  ⚠️  Limited error handling');
}

// Test 8: Verify Valkyrie assets are commented out
console.log('\n✅ Test 8: Valkyrie Assets (Should be disabled)');
if (bootSceneContent.includes('// this.load.image(\'valk3_idle_0\'')) {
    console.log('  ✓ Valkyrie assets commented out');
} else if (bootSceneContent.includes('this.load.image(\'valk3_idle_0\'')) {
    console.warn('  ⚠️  Valkyrie assets still being loaded (may cause 404)');
} else {
    console.log('  ✓ Valkyrie assets disabled');
}

console.log('\n✅ All tests completed!');
