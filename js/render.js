import {
  game,
  MAP_WIDTH,
  MAP_HEIGHT,
  TILES,
  EMOJI,
  PLAYER_MAX_HP,
  ENEMY_TYPES
} from './state.js';

// Set dynamic map size in CSS
export function setMapSize(width, height) {
  const mapEl = document.getElementById('map');
  mapEl.style.gridTemplateColumns = `repeat(${width}, 32px)`;
  mapEl.style.gridTemplateRows = `repeat(${height}, 32px)`;
}

// Main render function - redraws entire map
export function render() {
  const mapEl = document.getElementById('map');
  mapEl.innerHTML = '';

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tile = document.createElement('div');
      const tileType = game.map[y][x];
      tile.className = `tile ${tileType}`;

      // Render in priority order: player > enemy > projectile > item > tile
      if (x === game.player.x && y === game.player.y) {
        renderPlayer(tile);
      } else {
        const enemy = game.enemies.find(e => e.x === x && e.y === y);
        const projectile = game.projectiles.find(p => p.x === x && p.y === y);
        const item = game.items.find(i => i.x === x && i.y === y);

        if (enemy) {
          renderEnemy(tile, enemy);
        } else if (projectile) {
          tile.textContent = EMOJI.PROJECTILE;
        } else if (item) {
          renderItem(tile, item);
        } else {
          renderTile(tile, tileType);
        }
      }

      mapEl.appendChild(tile);
    }
  }
}

function renderPlayer(tile) {
  tile.innerHTML = `${EMOJI.PLAYER}
    <div class="health-bar">
      <div class="health-bar-fill player" style="width: ${(game.player.hp / game.player.maxHp) * 100}%"></div>
    </div>`;
}

function renderEnemy(tile, enemy) {
  const maxHp = ENEMY_TYPES[enemy.type]?.hp || 3;
  tile.innerHTML = `${enemy.emoji}
    <div class="health-bar">
      <div class="health-bar-fill enemy" style="width: ${(enemy.hp / maxHp) * 100}%"></div>
    </div>`;
}

function renderItem(tile, item) {
  if (item.type === 'key') {
    tile.textContent = EMOJI.KEY;
  }
}

function renderTile(tile, tileType) {
  switch (tileType) {
    case TILES.WALL:
      tile.textContent = EMOJI.WALL;
      break;
    case TILES.EXIT:
      tile.textContent = EMOJI.EXIT;
      break;
    case TILES.DOOR_LOCKED:
      tile.textContent = EMOJI.DOOR_LOCKED;
      break;
    case TILES.DOOR_UNLOCKED:
      tile.textContent = EMOJI.DOOR_UNLOCKED;
      break;
    case TILES.STAIRS_DOWN:
      tile.textContent = EMOJI.STAIRS;
      break;
    // FLOOR tiles are empty
  }
}

// Update all UI elements
export function updateUI() {
  // Player HP
  const hpEl = document.getElementById('player-hp');
  if (hpEl) hpEl.textContent = game.player.hp;

  const maxHpEl = document.getElementById('player-max-hp');
  if (maxHpEl) maxHpEl.textContent = game.player.maxHp;

  // Keys
  const keysEl = document.getElementById('key-count');
  if (keysEl) keysEl.textContent = game.player.inventory.keys;

  // Floor
  const floorEl = document.getElementById('current-floor');
  if (floorEl) floorEl.textContent = game.currentFloor;

  // Ability
  const abilityEl = document.getElementById('current-ability');
  if (abilityEl) {
    abilityEl.textContent = game.player.selectedAbility === 'melee' ? 'Melee' : 'Ranged';
  }

  // Messages
  const messagesEl = document.getElementById('message-log');
  if (messagesEl) {
    messagesEl.innerHTML = game.messages
      .map(msg => `<div class="message">${msg}</div>`)
      .join('');
  }
}

// Show game over overlay
export function showOverlay(message, isWin) {
  const overlay = document.getElementById('overlay');
  const messageEl = document.getElementById('overlay-message');
  messageEl.textContent = message;
  messageEl.className = isWin ? 'win' : 'lose';
  overlay.classList.add('active');
}

// Hide overlay
export function hideOverlay() {
  document.getElementById('overlay').classList.remove('active');
}

// Flash tile for attack feedback (optional enhancement)
export function flashTile(x, y, color = '#ff0000') {
  const index = y * MAP_WIDTH + x;
  const tiles = document.querySelectorAll('.tile');
  if (tiles[index]) {
    tiles[index].style.backgroundColor = color;
    setTimeout(() => {
      tiles[index].style.backgroundColor = '';
    }, 150);
  }
}
