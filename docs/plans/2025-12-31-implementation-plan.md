# Implementation Plan: Roguelike MVP

## Phase 1: HTML Structure & Styling

**File: index.html**
- [ ] Basic HTML5 boilerplate
- [ ] CSS Grid container for map (20x15, 32px tiles)
- [ ] Tile styling (walls, floors, entities)
- [ ] Health bar styling
- [ ] Game over / win overlay
- [ ] Play Again button

## Phase 2: Core Game State

**File: game.js**
- [ ] Game state object (map, player, enemies)
- [ ] Map generation function
  - Fill with walls
  - Carve room
  - Random wall clusters
  - Place player, exit, enemies
- [ ] Flood-fill pathfinding validation

## Phase 3: Rendering

- [ ] `render()` function to draw map to DOM
- [ ] Entity rendering (player, enemies with health bars)
- [ ] Update DOM on each turn

## Phase 4: Input & Turn System

- [ ] Keyboard event listeners (WASD, arrows, Space, E)
- [ ] `movePlayer(dx, dy)` function
- [ ] `attackEnemy(direction)` function
- [ ] `wait()` function (skip turn)
- [ ] Turn sequence: player → enemies → render → check win/lose

## Phase 5: Enemy AI

- [ ] `moveEnemies()` function
- [ ] Chase logic: move toward player
- [ ] Attack if adjacent

## Phase 6: Win/Lose

- [ ] Check if player on exit → win
- [ ] Check if player HP <= 0 → lose
- [ ] Display overlay with message
- [ ] Play Again resets game

## Implementation Order

1. index.html (structure + CSS)
2. game.js: state + map generation
3. game.js: rendering
4. game.js: input handling
5. game.js: enemy AI
6. game.js: win/lose conditions
7. Test full loop
