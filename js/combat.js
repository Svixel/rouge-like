import { game, TILES, PLAYER_MELEE_DAMAGE, PLAYER_RANGED_DAMAGE, EMOJI } from './state.js';
import { addMessage } from './utils.js';
import { render, updateUI, flashTile } from './render.js';

// Melee attack in direction
export function meleeAttack(dx, dy) {
  const targetX = game.player.x + dx;
  const targetY = game.player.y + dy;

  const enemy = game.enemies.find(e => e.x === targetX && e.y === targetY);

  if (enemy) {
    enemy.hp -= PLAYER_MELEE_DAMAGE;
    addMessage(`Hit ${enemy.type} for ${PLAYER_MELEE_DAMAGE} damage!`);
    flashTile(targetX, targetY, '#ff6666');

    if (enemy.hp <= 0) {
      addMessage(`${enemy.type} defeated!`);
    }
  } else {
    addMessage('Missed!');
  }
}

// Fire a projectile
export function fireProjectile(dx, dy, onComplete) {
  const projectile = {
    x: game.player.x + dx,
    y: game.player.y + dy,
    dx,
    dy,
    damage: PLAYER_RANGED_DAMAGE
  };

  game.projectiles.push(projectile);
  animateProjectiles(onComplete);
}

// Animate projectiles step by step
function animateProjectiles(onComplete) {
  const toRemove = [];

  for (const proj of game.projectiles) {
    // Check bounds
    if (proj.x <= 0 || proj.x >= game.map[0].length - 1 ||
        proj.y <= 0 || proj.y >= game.map.length - 1) {
      toRemove.push(proj);
      continue;
    }

    // Check wall/door collision
    const tile = game.map[proj.y][proj.x];
    if (tile === TILES.WALL || tile === TILES.DOOR_LOCKED) {
      toRemove.push(proj);
      continue;
    }

    // Check enemy collision
    const hitEnemy = game.enemies.find(e => e.x === proj.x && e.y === proj.y);
    if (hitEnemy) {
      hitEnemy.hp -= proj.damage;
      addMessage(`Ranged hit ${hitEnemy.type} for ${proj.damage} damage!`);
      flashTile(proj.x, proj.y, '#ffff66');

      if (hitEnemy.hp <= 0) {
        addMessage(`${hitEnemy.type} defeated!`);
      }

      toRemove.push(proj);
      continue;
    }

    // Move projectile
    proj.x += proj.dx;
    proj.y += proj.dy;
  }

  // Remove finished projectiles
  game.projectiles = game.projectiles.filter(p => !toRemove.includes(p));

  // Render current state
  render();
  updateUI();

  // Continue animation or finish
  if (game.projectiles.length > 0) {
    setTimeout(() => animateProjectiles(onComplete), 80);
  } else {
    if (onComplete) onComplete();
  }
}

// Enemy attacks player
export function enemyAttackPlayer(enemy) {
  game.player.hp -= enemy.damage;
  addMessage(`${enemy.type} hits you for ${enemy.damage} damage!`);
  flashTile(game.player.x, game.player.y, '#ff0000');
}

// Enemy ranged attack (creates enemy projectile toward player)
export function enemyRangedAttack(enemy, onComplete) {
  const dx = Math.sign(game.player.x - enemy.x);
  const dy = Math.sign(game.player.y - enemy.y);

  // Only fire in cardinal directions
  if (dx !== 0 && dy !== 0) {
    if (onComplete) onComplete();
    return;
  }

  const projectile = {
    x: enemy.x + dx,
    y: enemy.y + dy,
    dx,
    dy,
    damage: enemy.damage,
    isEnemy: true
  };

  game.projectiles.push(projectile);
  animateEnemyProjectiles(onComplete);
}

function animateEnemyProjectiles(onComplete) {
  const toRemove = [];

  for (const proj of game.projectiles) {
    if (!proj.isEnemy) continue;

    // Check bounds
    if (proj.x <= 0 || proj.x >= game.map[0].length - 1 ||
        proj.y <= 0 || proj.y >= game.map.length - 1) {
      toRemove.push(proj);
      continue;
    }

    // Check wall collision
    const tile = game.map[proj.y][proj.x];
    if (tile === TILES.WALL || tile === TILES.DOOR_LOCKED) {
      toRemove.push(proj);
      continue;
    }

    // Check player collision
    if (proj.x === game.player.x && proj.y === game.player.y) {
      game.player.hp -= proj.damage;
      addMessage(`Hit by ranged attack for ${proj.damage} damage!`);
      flashTile(proj.x, proj.y, '#ff0000');
      toRemove.push(proj);
      continue;
    }

    // Move projectile
    proj.x += proj.dx;
    proj.y += proj.dy;
  }

  game.projectiles = game.projectiles.filter(p => !toRemove.includes(p));

  render();
  updateUI();

  const enemyProjectiles = game.projectiles.filter(p => p.isEnemy);
  if (enemyProjectiles.length > 0) {
    setTimeout(() => animateEnemyProjectiles(onComplete), 80);
  } else {
    if (onComplete) onComplete();
  }
}
