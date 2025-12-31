# Roguelike MVP Design

## Overview

A super lite, tile-based, turn-based roguelike game running in the browser. Uses emojis for characters, CSS Grid for rendering, zero dependencies.

**Goal:** Reach the exit door while surviving enemies.

## Tech Stack

- Pure HTML/CSS/JS
- No build step
- No dependencies
- ~100 lines of JS

## File Structure

```
Rouge Like/
├── index.html      # Single HTML file with embedded CSS
├── game.js         # All game logic
└── docs/plans/     # Design docs
```

## Core Data Structures

```js
const game = {
  map: [],           // 2D array: 'floor', 'wall', 'exit'
  player: { x, y, hp, maxHp },
  enemies: [{ x, y, hp, maxHp }],
  mapWidth: 20,
  mapHeight: 15,
  gameOver: false,
  won: false
}
```

## Map Generation

**Algorithm:**
1. Fill entire map with walls
2. Carve out rectangular room in center (leaving border walls)
3. Randomly place wall clusters inside (30% chance per inner tile)
4. Place player spawn (top-left area) on floor
5. Place exit (bottom-right area) on floor
6. Flood-fill validation: ensure path exists from player to exit
7. Place 3-5 enemies on random floor tiles

**Emoji Legend:**
| Tile | Emoji |
|------|-------|
| Wall | `🧱` |
| Floor | (empty) |
| Exit | `🚪` |
| Player | `🧙` |
| Enemy | `👹` |

**Map size:** 20x15 tiles

## Controls

| Key | Action |
|-----|--------|
| `W` / `ArrowUp` | Move up |
| `A` / `ArrowLeft` | Move left |
| `S` / `ArrowDown` | Move down |
| `D` / `ArrowRight` | Move right |
| `Space` | Attack (prompts direction) |
| `E` | Wait/skip turn |

## Turn System

1. Player takes action (move/attack/wait)
2. All enemies take action
3. Re-render map
4. Check win/lose conditions

## Combat

**Stats:**
- Player HP: 10
- Enemy HP: 3
- Player attack damage: 2
- Enemy attack damage: 1

**Health bars:** Colored `<div>` below each entity
- Player: green bar
- Enemy: red bar
- Width: `(hp / maxHp) * 100%`

## Enemy AI

Simple chase behavior:
1. If adjacent to player → attack
2. Else → move one tile toward player (prefer X-axis, then Y-axis)

## Win/Lose Conditions

- **Win:** Player steps on exit tile (`🚪`) → "You escaped!" message
- **Lose:** Player HP reaches 0 → "Game Over" message
- Both states show "Play Again" button → regenerates map

## Rendering

- CSS Grid container (`display: grid; grid-template-columns: repeat(20, 32px)`)
- Each tile is a `<div>` with fixed size (32x32px)
- Entities (player/enemies) render as emoji inside their tile div
- Full re-render each turn (simple, performant at this scale)

## Future Enhancements (Not MVP)

- Multiple floors/levels
- Items and inventory
- Different enemy types
- Sound effects
- Animations
- Save/load game state
