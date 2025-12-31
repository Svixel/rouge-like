import { game, MAP_WIDTH, MAP_HEIGHT, TILES, resetGame } from './state.js';
import { addMessage } from './utils.js';
import { setMapSize, render, updateUI, showOverlay, hideOverlay } from './render.js';
import { initInput } from './input.js';
import { generateMap, nextFloor } from './map.js';
import { spawnEnemies, checkPickups, tryUnlockDoor, removeDeadEnemies } from './entities.js';
import { meleeAttack, fireProjectile } from './combat.js';
import { moveEnemies } from './ai.js';

// Initialize the game
function init() {
  resetGame();
  setMapSize(MAP_WIDTH, MAP_HEIGHT);
  generateMap();
  spawnEnemies();
  render();
  updateUI();
  hideOverlay();
  addMessage('Welcome to floor ' + game.currentFloor + '!');
}

// Handle player movement
function handleMove(dx, dy) {
  if (game.gameOver) return;

  const newX = game.player.x + dx;
  const newY = game.player.y + dy;

  // Check bounds
  if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) return;

  // Check walls
  if (game.map[newY][newX] === TILES.WALL) return;

  // Check locked doors - try to unlock
  if (game.map[newY][newX] === TILES.DOOR_LOCKED) {
    if (!tryUnlockDoor(newX, newY)) {
      render();
      updateUI();
      return;
    }
  }

  // Check for enemy collision
  const enemy = game.enemies.find(e => e.x === newX && e.y === newY);
  if (enemy) return; // Can't walk through enemies

  // Move player
  game.player.x = newX;
  game.player.y = newY;

  // Check for pickups
  checkPickups();

  // Check for stairs
  if (game.map[newY][newX] === TILES.STAIRS_DOWN) {
    addMessage('Descending to floor ' + (game.currentFloor + 1) + '...');
    nextFloor();
    spawnEnemies();
    render();
    updateUI();
    addMessage('Welcome to floor ' + game.currentFloor + '!');
    return;
  }

  endTurn();
}

// Handle attack in direction
function handleAttack(dx, dy, attackType) {
  if (game.gameOver) return;

  if (attackType === 'melee') {
    meleeAttack(dx, dy);
    removeDeadEnemies();
    endTurn();
  } else if (attackType === 'ranged') {
    fireProjectile(dx, dy, () => {
      removeDeadEnemies();
      endTurn();
    });
  }
}

// Handle wait/skip turn
function handleWait() {
  if (game.gameOver) return;
  endTurn();
}

// Handle ability change (just update UI)
function handleAbilityChange() {
  updateUI();
  updateAbilityIndicator();
}

// Update ability indicator in UI
function updateAbilityIndicator() {
  const meleeEl = document.getElementById('melee-ability');
  const rangedEl = document.getElementById('ranged-ability');

  if (meleeEl && rangedEl) {
    if (game.player.selectedAbility === 'melee') {
      meleeEl.className = 'ability-active';
      rangedEl.className = 'ability-inactive';
    } else {
      meleeEl.className = 'ability-inactive';
      rangedEl.className = 'ability-active';
    }
  }
}

// End turn - enemy actions and check conditions
function endTurn() {
  // Enemy turns (async for projectile animations)
  moveEnemies(() => {
    removeDeadEnemies();

    // Check lose condition
    if (game.player.hp <= 0) {
      game.gameOver = true;
      game.won = false;
      showOverlay('Game Over', false);
    }

    render();
    updateUI();
  });
}

// Setup play again button
function setupPlayAgain() {
  const playAgainBtn = document.getElementById('play-again');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', init);
  }
}

// Start the game
function start() {
  initInput({
    onMove: handleMove,
    onAttack: handleAttack,
    onWait: handleWait,
    onAbilityChange: handleAbilityChange
  });

  setupPlayAgain();
  init();
}

// Run when DOM is ready
start();
