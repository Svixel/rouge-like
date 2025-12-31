import { game } from './state.js';

// Callbacks - will be set by main.js
let onMove = null;
let onAttack = null;
let onWait = null;
let onAbilityChange = null;

// Initialize input system with callbacks
export function initInput(callbacks) {
  onMove = callbacks.onMove;
  onAttack = callbacks.onAttack;
  onWait = callbacks.onWait;
  onAbilityChange = callbacks.onAbilityChange;

  document.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(e) {
  // Ignore input when game is over
  if (game.gameOver) return;

  // If awaiting direction for attack
  if (game.awaitingDirection) {
    handleDirectionInput(e);
    return;
  }

  const key = e.key.toLowerCase();

  // Ability selection
  if (key === '1') {
    game.player.selectedAbility = 'melee';
    if (onAbilityChange) onAbilityChange();
    return;
  }
  if (key === '2') {
    game.player.selectedAbility = 'ranged';
    if (onAbilityChange) onAbilityChange();
    return;
  }

  // Movement
  switch (key) {
    case 'w':
    case 'arrowup':
      if (onMove) onMove(0, -1);
      break;
    case 's':
    case 'arrowdown':
      if (onMove) onMove(0, 1);
      break;
    case 'a':
    case 'arrowleft':
      if (onMove) onMove(-1, 0);
      break;
    case 'd':
    case 'arrowright':
      if (onMove) onMove(1, 0);
      break;
    case ' ':
      e.preventDefault();
      game.awaitingDirection = true;
      game.actionType = game.player.selectedAbility;
      break;
    case 'e':
      if (onWait) onWait();
      break;
  }
}

function handleDirectionInput(e) {
  const key = e.key.toLowerCase();
  let dx = 0, dy = 0;

  switch (key) {
    case 'w':
    case 'arrowup':
      dy = -1;
      break;
    case 's':
    case 'arrowdown':
      dy = 1;
      break;
    case 'a':
    case 'arrowleft':
      dx = -1;
      break;
    case 'd':
    case 'arrowright':
      dx = 1;
      break;
    case 'escape':
      // Cancel attack
      game.awaitingDirection = false;
      game.actionType = null;
      return;
    default:
      return; // Ignore other keys
  }

  game.awaitingDirection = false;

  if (onAttack && (dx !== 0 || dy !== 0)) {
    onAttack(dx, dy, game.actionType);
  }

  game.actionType = null;
}

// Cleanup function (optional, for testing)
export function removeInput() {
  document.removeEventListener('keydown', handleKeyDown);
}
