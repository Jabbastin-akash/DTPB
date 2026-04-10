// ===== EventBus.js =====
// Singleton Phaser EventEmitter for cross-scene communication
// Usage: EventBus.emit('npc:interact', { npcId, taskId })
//        EventBus.on('npc:interact', handler)

const EventBus = new Phaser.Events.EventEmitter();
