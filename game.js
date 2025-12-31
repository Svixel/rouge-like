const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;
const PLAYER_MAX_HP = 10;
const ENEMY_MAX_HP = 3;
const PLAYER_DAMAGE = 2;
const ENEMY_DAMAGE = 1;
const ENEMY_COUNT = 4;

const TILES = { WALL: 'wall', FLOOR: 'floor', EXIT: 'exit' };
const EMOJI = { WALL: '🧱', PLAYER: '🧙', ENEMY: '👹', EXIT: '🚪' };

let game = {};

function init() {
  game = {
    map: [],
    player: { x: 0, y: 0, hp: PLAYER_MAX_HP },
    enemies: [],
    gameOver: false,
    won: false,
    awaitingAttackDirection: false
  };
  generateMap();
  render();
  updateStats();
  hideOverlay();
}

function generateMap() {
  // Fill with walls
  game.map = Array(MAP_HEIGHT).fill(null).map(() =>
    Array(MAP_WIDTH).fill(TILES.WALL)
  );

  // Carve out room (leave 1-tile border)
  for (let y = 1; y < MAP_HEIGHT - 1; y++) {
    for (let x = 1; x < MAP_WIDTH - 1; x++) {
      game.map[y][x] = Math.random() < 0.25 ? TILES.WALL : TILES.FLOOR;
    }
  }

  // Ensure player spawn area is clear (top-left)
  for (let y = 1; y <= 3; y++) {
    for (let x = 1; x <= 3; x++) {
      game.map[y][x] = TILES.FLOOR;
    }
  }

  // Ensure exit area is clear (bottom-right)
  for (let y = MAP_HEIGHT - 4; y < MAP_HEIGHT - 1; y++) {
    for (let x = MAP_WIDTH - 4; x < MAP_WIDTH - 1; x++) {
      game.map[y][x] = TILES.FLOOR;
    }
  }

  // Place exit
  game.map[MAP_HEIGHT - 2][MAP_WIDTH - 2] = TILES.EXIT;

  // Place player
  game.player.x = 2;
  game.player.y = 2;

  // Validate path exists
  if (!pathExists(game.player.x, game.player.y, MAP_WIDTH - 2, MAP_HEIGHT - 2)) {
    generateMap(); // Regenerate if no path
    return;
  }

  // Place enemies on random floor tiles
  game.enemies = [];
  let attempts = 0;
  while (game.enemies.length < ENEMY_COUNT && attempts < 100) {
    const x = Math.floor(Math.random() * (MAP_WIDTH - 2)) + 1;
    const y = Math.floor(Math.random() * (MAP_HEIGHT - 2)) + 1;

    if (game.map[y][x] === TILES.FLOOR &&
        !(x === game.player.x && y === game.player.y) &&
        !game.enemies.some(e => e.x === x && e.y === y) &&
        Math.abs(x - game.player.x) + Math.abs(y - game.player.y) > 3) {
      game.enemies.push({ x, y, hp: ENEMY_MAX_HP });
    }
    attempts++;
  }
}

function pathExists(startX, startY, endX, endY) {
  const visited = new Set();
  const queue = [[startX, startY]];

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const key = `${x},${y}`;

    if (x === endX && y === endY) return true;
    if (visited.has(key)) continue;
    visited.add(key);

    const neighbors = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of neighbors) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < MAP_WIDTH && ny >= 0 && ny < MAP_HEIGHT &&
          game.map[ny][nx] !== TILES.WALL && !visited.has(`${nx},${ny}`)) {
        queue.push([nx, ny]);
      }
    }
  }
  return false;
}

function render() {
  const mapEl = document.getElementById('map');
  mapEl.innerHTML = '';

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tile = document.createElement('div');
      tile.className = `tile ${game.map[y][x]}`;

      // Check what's on this tile
      if (x === game.player.x && y === game.player.y) {
        tile.textContent = EMOJI.PLAYER;
        tile.innerHTML += `
          <div class="health-bar">
            <div class="health-bar-fill player" style="width: ${(game.player.hp / PLAYER_MAX_HP) * 100}%"></div>
          </div>`;
      } else {
        const enemy = game.enemies.find(e => e.x === x && e.y === y);
        if (enemy) {
          tile.textContent = EMOJI.ENEMY;
          tile.innerHTML = EMOJI.ENEMY + `
            <div class="health-bar">
              <div class="health-bar-fill enemy" style="width: ${(enemy.hp / ENEMY_MAX_HP) * 100}%"></div>
            </div>`;
        } else if (game.map[y][x] === TILES.EXIT) {
          tile.textContent = EMOJI.EXIT;
        } else if (game.map[y][x] === TILES.WALL) {
          tile.textContent = EMOJI.WALL;
        }
      }

      mapEl.appendChild(tile);
    }
  }
}

function updateStats() {
  document.getElementById('player-hp').textContent = game.player.hp;
}

function movePlayer(dx, dy) {
  if (game.gameOver) return;

  const newX = game.player.x + dx;
  const newY = game.player.y + dy;

  // Check bounds and walls
  if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) return;
  if (game.map[newY][newX] === TILES.WALL) return;

  // Check for enemy collision
  const enemy = game.enemies.find(e => e.x === newX && e.y === newY);
  if (enemy) return; // Can't walk through enemies

  game.player.x = newX;
  game.player.y = newY;

  endTurn();
}

function attackInDirection(dx, dy) {
  const targetX = game.player.x + dx;
  const targetY = game.player.y + dy;

  const enemyIndex = game.enemies.findIndex(e => e.x === targetX && e.y === targetY);
  if (enemyIndex !== -1) {
    game.enemies[enemyIndex].hp -= PLAYER_DAMAGE;
    if (game.enemies[enemyIndex].hp <= 0) {
      game.enemies.splice(enemyIndex, 1);
    }
  }

  endTurn();
}

function wait() {
  if (game.gameOver) return;
  endTurn();
}

function endTurn() {
  // Check win condition
  if (game.map[game.player.y][game.player.x] === TILES.EXIT) {
    game.gameOver = true;
    game.won = true;
    showOverlay('You Escaped!', 'win');
    render();
    return;
  }

  // Enemy turns
  moveEnemies();

  // Check lose condition
  if (game.player.hp <= 0) {
    game.gameOver = true;
    game.won = false;
    showOverlay('Game Over', 'lose');
  }

  render();
  updateStats();
}

function moveEnemies() {
  for (const enemy of game.enemies) {
    const dx = Math.sign(game.player.x - enemy.x);
    const dy = Math.sign(game.player.y - enemy.y);

    // Check if adjacent to player - attack
    if (Math.abs(game.player.x - enemy.x) + Math.abs(game.player.y - enemy.y) === 1) {
      game.player.hp -= ENEMY_DAMAGE;
      continue;
    }

    // Try to move toward player
    const moves = [];
    if (dx !== 0) moves.push({ x: enemy.x + dx, y: enemy.y });
    if (dy !== 0) moves.push({ x: enemy.x, y: enemy.y + dy });

    for (const move of moves) {
      if (canMoveTo(move.x, move.y, enemy)) {
        enemy.x = move.x;
        enemy.y = move.y;
        break;
      }
    }
  }
}

function canMoveTo(x, y, excludeEnemy) {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;
  if (game.map[y][x] === TILES.WALL) return false;
  if (x === game.player.x && y === game.player.y) return false;
  if (game.enemies.some(e => e !== excludeEnemy && e.x === x && e.y === y)) return false;
  return true;
}

function showOverlay(message, className) {
  const overlay = document.getElementById('overlay');
  const messageEl = document.getElementById('overlay-message');
  messageEl.textContent = message;
  messageEl.className = className;
  overlay.classList.add('active');
}

function hideOverlay() {
  document.getElementById('overlay').classList.remove('active');
}

// Input handling
document.addEventListener('keydown', (e) => {
  if (game.gameOver) return;

  if (game.awaitingAttackDirection) {
    game.awaitingAttackDirection = false;
    switch(e.key.toLowerCase()) {
      case 'w': case 'arrowup': attackInDirection(0, -1); break;
      case 's': case 'arrowdown': attackInDirection(0, 1); break;
      case 'a': case 'arrowleft': attackInDirection(-1, 0); break;
      case 'd': case 'arrowright': attackInDirection(1, 0); break;
    }
    return;
  }

  switch(e.key.toLowerCase()) {
    case 'w': case 'arrowup': movePlayer(0, -1); break;
    case 's': case 'arrowdown': movePlayer(0, 1); break;
    case 'a': case 'arrowleft': movePlayer(-1, 0); break;
    case 'd': case 'arrowright': movePlayer(1, 0); break;
    case ' ':
      e.preventDefault();
      game.awaitingAttackDirection = true;
      break;
    case 'e': wait(); break;
  }
});

document.getElementById('play-again').addEventListener('click', init);

// Start game
init();
