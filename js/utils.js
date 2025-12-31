import { game, MAP_WIDTH, MAP_HEIGHT, TILES } from './state.js';

// BFS pathfinding validation
export function pathExists(startX, startY, endX, endY) {
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
          game.map[ny][nx] !== TILES.WALL &&
          game.map[ny][nx] !== TILES.DOOR_LOCKED &&
          !visited.has(`${nx},${ny}`)) {
        queue.push([nx, ny]);
      }
    }
  }
  return false;
}

// Check if entity can move to position
export function canMoveTo(x, y, excludeEnemy = null) {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;

  const tile = game.map[y][x];
  if (tile === TILES.WALL) return false;
  if (tile === TILES.DOOR_LOCKED) return false;

  if (x === game.player.x && y === game.player.y) return false;
  if (game.enemies.some(e => e !== excludeEnemy && e.x === x && e.y === y)) return false;

  return true;
}

// Line of sight check (for ranged enemies)
export function hasLineOfSight(fromX, fromY, toX, toY) {
  const dx = Math.sign(toX - fromX);
  const dy = Math.sign(toY - fromY);

  // Only works in cardinal directions
  if (dx !== 0 && dy !== 0) return false;
  if (dx === 0 && dy === 0) return false;

  let x = fromX + dx;
  let y = fromY + dy;

  while (x !== toX || y !== toY) {
    if (game.map[y][x] === TILES.WALL || game.map[y][x] === TILES.DOOR_LOCKED) {
      return false;
    }
    x += dx;
    y += dy;
  }

  return true;
}

// Add message to combat log
export function addMessage(text) {
  game.messages.unshift(text);
  if (game.messages.length > 5) {
    game.messages.pop();
  }
}

// Manhattan distance
export function distance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
