import { game, TILES } from './state.js';
import { canMoveTo, hasLineOfSight, distance, addMessage } from './utils.js';
import { enemyAttackPlayer, enemyRangedAttack } from './combat.js';

// Process all enemy turns
export function moveEnemies(onComplete) {
  let pendingRanged = [];

  for (const enemy of game.enemies) {
    if (enemy.hp <= 0) continue;

    // Slow enemies skip every other turn
    if (enemy.slow) {
      if (enemy.turnSkipped) {
        enemy.turnSkipped = false;
      } else {
        enemy.turnSkipped = true;
        continue;
      }
    }

    const dist = distance(enemy.x, enemy.y, game.player.x, game.player.y);

    // Check if adjacent to player - melee attack
    if (dist === 1) {
      enemyAttackPlayer(enemy);
      continue;
    }

    // Ranged behavior
    if (enemy.behavior === 'ranged' && enemy.range) {
      // Check if in range and has line of sight
      if (dist <= enemy.range && hasLineOfSight(enemy.x, enemy.y, game.player.x, game.player.y)) {
        pendingRanged.push(enemy);
        continue;
      }
    }

    // Chase behavior - move toward player
    moveTowardPlayer(enemy);
  }

  // Process ranged attacks sequentially
  if (pendingRanged.length > 0) {
    processRangedAttacks(pendingRanged, 0, onComplete);
  } else {
    if (onComplete) onComplete();
  }
}

function processRangedAttacks(enemies, index, onComplete) {
  if (index >= enemies.length) {
    if (onComplete) onComplete();
    return;
  }

  const enemy = enemies[index];
  enemyRangedAttack(enemy, () => {
    processRangedAttacks(enemies, index + 1, onComplete);
  });
}

function moveTowardPlayer(enemy) {
  const dx = Math.sign(game.player.x - enemy.x);
  const dy = Math.sign(game.player.y - enemy.y);

  // Try to move toward player, preferring the axis with more distance
  const moves = [];

  if (Math.abs(game.player.x - enemy.x) >= Math.abs(game.player.y - enemy.y)) {
    // Prefer horizontal
    if (dx !== 0) moves.push({ x: enemy.x + dx, y: enemy.y });
    if (dy !== 0) moves.push({ x: enemy.x, y: enemy.y + dy });
  } else {
    // Prefer vertical
    if (dy !== 0) moves.push({ x: enemy.x, y: enemy.y + dy });
    if (dx !== 0) moves.push({ x: enemy.x + dx, y: enemy.y });
  }

  // Add diagonal alternatives
  if (dx !== 0 && dy !== 0) {
    moves.push({ x: enemy.x + dx, y: enemy.y + dy });
  }

  // Try each move in order
  for (const move of moves) {
    if (canMoveTo(move.x, move.y, enemy)) {
      enemy.x = move.x;
      enemy.y = move.y;
      return;
    }
  }
}
