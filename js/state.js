// Map dimensions (increased from 20x15)
export const MAP_WIDTH = 30;
export const MAP_HEIGHT = 20;

// Player stats
export const PLAYER_MAX_HP = 10;
export const PLAYER_MELEE_DAMAGE = 2;
export const PLAYER_RANGED_DAMAGE = 1;

// Enemy stats
export const ENEMY_TYPES = {
  GRUNT: { hp: 3, damage: 1, emoji: '👹', behavior: 'chase' },
  ARCHER: { hp: 2, damage: 1, emoji: '🏹', behavior: 'ranged', range: 4 },
  BRUTE: { hp: 6, damage: 2, emoji: '👺', behavior: 'chase', slow: true }
};

// Tile types
export const TILES = {
  WALL: 'wall',
  FLOOR: 'floor',
  EXIT: 'exit',
  DOOR_LOCKED: 'door_locked',
  DOOR_UNLOCKED: 'door_unlocked',
  STAIRS_DOWN: 'stairs_down'
};

// Item types
export const ITEMS = {
  KEY: 'key'
};

// Emojis
export const EMOJI = {
  WALL: '🧱',
  PLAYER: '🧙',
  EXIT: '🚪',
  DOOR_LOCKED: '🔐',
  DOOR_UNLOCKED: '🚪',
  STAIRS: '🕳️',
  KEY: '🗝️',
  PROJECTILE: '⚡'
};

// Game state - mutable singleton
export const game = {
  map: [],
  player: {
    x: 0,
    y: 0,
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
    inventory: { keys: 0 },
    selectedAbility: 'melee'  // 'melee' or 'ranged'
  },
  enemies: [],
  items: [],
  projectiles: [],
  currentFloor: 1,
  gameOver: false,
  won: false,
  awaitingDirection: false,
  actionType: null,
  messages: []
};

// Reset game state
export function resetGame() {
  game.map = [];
  game.player.x = 0;
  game.player.y = 0;
  game.player.hp = PLAYER_MAX_HP;
  game.player.maxHp = PLAYER_MAX_HP;
  game.player.inventory = { keys: 0 };
  game.player.selectedAbility = 'melee';
  game.enemies = [];
  game.items = [];
  game.projectiles = [];
  game.currentFloor = 1;
  game.gameOver = false;
  game.won = false;
  game.awaitingDirection = false;
  game.actionType = null;
  game.messages = [];
}
