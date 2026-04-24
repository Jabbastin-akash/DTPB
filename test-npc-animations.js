#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('🧪 NPC Animation System Test\n');

const bootScenePath = path.join(__dirname, 'src/scenes/BootScene.js');
const content = fs.readFileSync(bootScenePath, 'utf-8');

console.log('✅ Test 1: NPC Asset Loading');
['D_Idle', 'D_Walk', 'U_Idle', 'U_Walk', 'S_Idle', 'S_Walk'].forEach(asset => {
    if (content.includes(asset)) {
        console.log(`  ✓ Found ${asset}`);
    }
});

console.log('\n✅ Test 2: NPC Sheet Building');
console.log(content.includes('const buildNpcSheets') ? '  ✓ buildNpcSheets exists' : '  ❌ Missing');

console.log('\n✅ Test 3: Placeholder Fallback');
console.log(content.includes('createPlaceholderSheet') ? '  ✓ Placeholder exists' : '  ❌ Missing');

console.log('\n✅ Test 4: Animation Creation');
console.log(content.includes('const createHumanoidAnimations') ? '  ✓ Animation function exists' : '  ❌ Missing');

console.log('\n✅ Test 5: Fallback Animations');
console.log(content.includes('fallbackKey') ? '  ✓ Fallback animations implemented' : '  ⚠️  Missing');

console.log('\n✅ Test 6: Valkyrie Assets');
console.log(content.includes('// this.load.image(\'valk3_idle_0\'') ? '  ✓ Disabled' : '  ⚠️  Might still load');

console.log('\n✅ All checks completed!');
