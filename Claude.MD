# Rouge Like - Project Instructions

A tile-based, turn-based roguelike browser game with emoji characters.

## Project Overview

**Goal:** Build a minimal roguelike where the player navigates a procedurally generated dungeon, fights enemies, and reaches the exit.

**Design Doc:** [docs/plans/2025-12-31-roguelike-mvp-design.md](docs/plans/2025-12-31-roguelike-mvp-design.md)

## Tech Stack

- Pure HTML/CSS/JavaScript (no frameworks, no build step)
- CSS Grid for rendering
- Zero dependencies
- Target: ~100 lines of JS for MVP

## File Structure

```text
Rouge Like/
├── CLAUDE.md           # This file
├── index.html          # Entry point with embedded CSS
├── game.js             # All game logic
└── docs/plans/         # Design documentation
```

## Game Development Conventions

### State Management

All game state lives in a single `game` object:

```js
const game = {
  map: [],              // 2D array of tile types
  player: { x, y, hp, maxHp },
  enemies: [],
  gameOver: false,
  won: false
}
```

**Rules:**

- Never mutate state directly during rendering
- Complete all state changes, then render once
- Keep state flat - avoid nested objects where possible

### Game Loop Pattern

This is a turn-based game, not real-time. The loop is:

```text
1. Wait for player input
2. Process player action
3. Process enemy actions
4. Update state
5. Render
6. Check win/lose
```

**Do not:**

- Use `requestAnimationFrame` for game logic (save for future animations only)
- Process input during rendering
- Allow actions when `game.gameOver === true`

### Coordinate System

- Origin (0,0) is top-left
- X increases rightward
- Y increases downward
- Access tiles as `map[y][x]` (row-major)

### Entity Positioning

Entities (player, enemies) store their own `{x, y}` coordinates. They are NOT stored in the map array - the map only holds terrain.

### Collision Detection

Before any move, check:

1. Is target in bounds?
2. Is target tile walkable (`floor` or `exit`)?
3. Is target occupied by another entity?

### Rendering Approach

- Full re-render each turn (simple, correct, fast enough)
- DOM structure: Grid container > Tile divs > Entity spans
- Health bars are child divs within entity tiles

## Code Style

### Naming

| Type       | Convention           | Example                       |
| ---------- | -------------------- | ----------------------------- |
| Functions  | camelCase, verb prefix | `movePlayer`, `renderMap`   |
| Constants  | UPPER_SNAKE          | `MAP_WIDTH`, `PLAYER_DAMAGE`  |
| Game state | `game.propertyName`  | `game.player`, `game.enemies` |
| Tile types | lowercase strings    | `'floor'`, `'wall'`, `'exit'` |

### Function Organization

Order functions in game.js:

1. Constants
2. State initialization
3. Map generation
4. Input handling
5. Game logic (movement, combat, AI)
6. Rendering
7. Win/lose conditions
8. Entry point (`init()`)

### Keep Functions Small

Each function should do one thing:

- `generateMap()` - creates terrain only
- `placeEntities()` - positions player, enemies, exit
- `moveEntity(entity, dx, dy)` - moves any entity
- `attack(attacker, defender)` - handles combat math

## Testing During Development

Since there's no test framework:

1. **Console logging:** Add temporary `console.log` for debugging, remove before committing

2. **Manual testing checklist:**
   - Player can move in all 4 directions
   - Player blocked by walls
   - Player can attack enemies
   - Enemies chase and attack player
   - Health bars update correctly
   - Win condition triggers at exit
   - Lose condition triggers at 0 HP
   - "Play Again" regenerates map

3. **Edge cases to verify:**
   - Player can't move off map edges
   - Multiple enemies don't stack on same tile
   - Exit is always reachable (flood-fill validation)

## Common Pitfalls

### Off-by-one errors

- Map indices are 0-based
- Check `< mapWidth` not `<= mapWidth`

### Row/column confusion

- `map[y][x]` not `map[x][y]`
- When iterating: outer loop is Y (rows), inner is X (columns)

### Event listener stacking

- Only attach keyboard listener once
- Check `game.gameOver` before processing input

### Enemy movement conflicts

- Process enemies in order
- Check for collisions between enemies, not just with player

## Emoji Reference

| Entity | Emoji | Notes   |
| ------ | ----- | ------- |
| Player | `🧙`  | Wizard  |
| Enemy  | `👹`  | Ogre    |
| Wall   | `🧱`  | Brick   |
| Exit   | `🚪`  | Door    |
| Floor  | (empty) | No emoji |

## Development Workflow

1. **Start simple:** Get player rendering and moving first
2. **Add incrementally:** Walls > Exit > Win condition > Enemies > Combat > Lose condition
3. **Test each addition** before moving to the next
4. **Commit working states** - easy rollback if something breaks

## Commands

```bash
# Open in browser (macOS)
open index.html

# Or use any local server
python3 -m http.server 8000
# Then visit http://127.0.0.1:8000
```

## Implementation Checklist

Build in this order:

1. [ ] HTML boilerplate with CSS Grid container
2. [ ] Render empty map (all floors)
3. [ ] Add player emoji, keyboard movement
4. [ ] Generate walls, validate movement
5. [ ] Add exit tile, win condition
6. [ ] Add enemies (static, no AI)
7. [ ] Enemy AI (chase behavior)
8. [ ] Combat system (attack action)
9. [ ] Health bars and damage
10. [ ] Lose condition
11. [ ] Play Again button
12. [ ] Polish and balance

## Questions to Ask Before Coding

- Does this change affect the game state?
- Will this cause a re-render?
- What happens at map edges?
- What if two entities want the same tile?
- Is this the simplest solution?
