import { game, ENEMY_TYPES, TILES } from './state.js';
import { addMessage } from './utils.js';

// Spawn enemies based on current floor
export function spawnEnemies() {
  game.enemies = [];

  // More enemies on higher floors
  const baseCount = 4;
  const count = baseCount + game.currentFloor * 2;

  let placed = 0;
  let attempts = 0;

  while (placed < count && attempts < 200) {
    const x = 1 + Math.floor(Math.random() * (game.map[0].length - 2));
    const y = 1 + Math.floor(Math.random() * (game.map.length - 2));

    if (canSpawnAt(x, y)) {
      const enemy = createEnemy(x, y);
      game.enemies.push(enemy);
      placed++;
    }
    attempts++;
  }
}

function canSpawnAt(x, y) {
  if (game.map[y][x] !== TILES.FLOOR) return false;
  if (x === game.player.x && y === game.player.y) return false;
  if (game.enemies.some(e => e.x === x && e.y === y)) return false;

  // Minimum distance from player
  const dist = Math.abs(x - game.player.x) + Math.abs(y - game.player.y);
  if (dist < 5) return false;

  return true;
}

function createEnemy(x, y) {
  // Determine enemy type based on floor and randomness
  const roll = Math.random();
  let type;

  if (game.currentFloor >= 3 && roll < 0.2) {
    type = 'BRUTE';
  } else if (game.currentFloor >= 2 && roll < 0.4) {
    type = 'ARCHER';
  } else {
    type = 'GRUNT';
  }

  const template = ENEMY_TYPES[type];

  return {
    x,
    y,
    type,
    hp: template.hp,
    maxHp: template.hp,
    damage: template.damage,
    emoji: template.emoji,
    behavior: template.behavior,
    slow: template.slow || false,
    range: template.range || 0,
    turnSkipped: false  // For slow enemies
  };
}

// Check for item pickup when player moves
export function checkPickups() {
  const itemIndex = game.items.findIndex(
    item => item.x === game.player.x && item.y === game.player.y
  );

  if (itemIndex !== -1) {
    const item = game.items[itemIndex];

    switch (item.type) {
      case 'key':
        game.player.inventory.keys++;
        addMessage('Picked up a key!');
        break;
    }

    game.items.splice(itemIndex, 1);
  }
}

// Try to unlock door if player has key
export function tryUnlockDoor(x, y) {
  if (game.map[y][x] === TILES.DOOR_LOCKED) {
    if (game.player.inventory.keys > 0) {
      game.player.inventory.keys--;
      game.map[y][x] = TILES.DOOR_UNLOCKED;
      addMessage('Unlocked the door!');
      return true;
    } else {
      addMessage('Door is locked. Need a key!');
      return false;
    }
  }
  return true; // Not a locked door
}

// Remove dead enemies
export function removeDeadEnemies() {
  game.enemies = game.enemies.filter(e => e.hp > 0);
}
