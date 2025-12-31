import { game, MAP_WIDTH, MAP_HEIGHT, TILES, ITEMS } from './state.js';
import { pathExists } from './utils.js';

// Generate the entire map
export function generateMap() {
  // Fill with walls
  game.map = Array(MAP_HEIGHT).fill(null).map(() =>
    Array(MAP_WIDTH).fill(TILES.WALL)
  );

  // Generate rooms using BSP
  const rooms = generateRooms();

  // Carve out rooms
  for (const room of rooms) {
    carveRoom(room);
  }

  // Connect rooms with corridors
  connectRooms(rooms);

  // Place doors at some corridor entrances
  placeDoors(rooms);

  // Place player in first room
  const startRoom = rooms[0];
  game.player.x = Math.floor(startRoom.x + startRoom.w / 2);
  game.player.y = Math.floor(startRoom.y + startRoom.h / 2);

  // Place exit/stairs in last room
  const endRoom = rooms[rooms.length - 1];
  const exitX = Math.floor(endRoom.x + endRoom.w / 2);
  const exitY = Math.floor(endRoom.y + endRoom.h / 2);
  game.map[exitY][exitX] = TILES.STAIRS_DOWN;

  // Validate path exists
  if (!pathExists(game.player.x, game.player.y, exitX, exitY)) {
    generateMap(); // Regenerate if no path
    return;
  }

  // Place keys (1-2 per floor)
  placeItems();
}

function generateRooms() {
  const rooms = [];
  const MIN_ROOM_SIZE = 5;
  const MAX_ROOM_SIZE = 8;

  function split(x, y, w, h, depth) {
    // Stop splitting if too small or max depth reached
    if (depth === 0 || w < MIN_ROOM_SIZE * 2 + 3 || h < MIN_ROOM_SIZE * 2 + 3) {
      // Create room with padding
      const roomW = MIN_ROOM_SIZE + Math.floor(Math.random() * (Math.min(MAX_ROOM_SIZE, w - 2) - MIN_ROOM_SIZE + 1));
      const roomH = MIN_ROOM_SIZE + Math.floor(Math.random() * (Math.min(MAX_ROOM_SIZE, h - 2) - MIN_ROOM_SIZE + 1));
      const roomX = x + 1 + Math.floor(Math.random() * (w - roomW - 2));
      const roomY = y + 1 + Math.floor(Math.random() * (h - roomH - 2));

      rooms.push({ x: roomX, y: roomY, w: roomW, h: roomH });
      return;
    }

    // Decide split direction
    const horizontal = Math.random() < 0.5;

    if (horizontal && h >= MIN_ROOM_SIZE * 2 + 3) {
      const splitY = y + MIN_ROOM_SIZE + 2 + Math.floor(Math.random() * (h - MIN_ROOM_SIZE * 2 - 4));
      split(x, y, w, splitY - y, depth - 1);
      split(x, splitY, w, h - (splitY - y), depth - 1);
    } else if (w >= MIN_ROOM_SIZE * 2 + 3) {
      const splitX = x + MIN_ROOM_SIZE + 2 + Math.floor(Math.random() * (w - MIN_ROOM_SIZE * 2 - 4));
      split(x, y, splitX - x, h, depth - 1);
      split(splitX, y, w - (splitX - x), h, depth - 1);
    } else {
      // Can't split, create room
      const roomW = MIN_ROOM_SIZE + Math.floor(Math.random() * (Math.min(MAX_ROOM_SIZE, w - 2) - MIN_ROOM_SIZE + 1));
      const roomH = MIN_ROOM_SIZE + Math.floor(Math.random() * (Math.min(MAX_ROOM_SIZE, h - 2) - MIN_ROOM_SIZE + 1));
      const roomX = x + 1 + Math.floor(Math.random() * Math.max(1, w - roomW - 2));
      const roomY = y + 1 + Math.floor(Math.random() * Math.max(1, h - roomH - 2));

      rooms.push({ x: roomX, y: roomY, w: roomW, h: roomH });
    }
  }

  split(0, 0, MAP_WIDTH, MAP_HEIGHT, 4);
  return rooms;
}

function carveRoom(room) {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      if (x > 0 && x < MAP_WIDTH - 1 && y > 0 && y < MAP_HEIGHT - 1) {
        game.map[y][x] = TILES.FLOOR;
      }
    }
  }
}

function connectRooms(rooms) {
  for (let i = 0; i < rooms.length - 1; i++) {
    const a = rooms[i];
    const b = rooms[i + 1];

    // Get center points
    const ax = Math.floor(a.x + a.w / 2);
    const ay = Math.floor(a.y + a.h / 2);
    const bx = Math.floor(b.x + b.w / 2);
    const by = Math.floor(b.y + b.h / 2);

    // L-shaped corridor
    if (Math.random() < 0.5) {
      carveCorridor(ax, ay, bx, ay); // Horizontal first
      carveCorridor(bx, ay, bx, by); // Then vertical
    } else {
      carveCorridor(ax, ay, ax, by); // Vertical first
      carveCorridor(ax, by, bx, by); // Then horizontal
    }
  }
}

function carveCorridor(x1, y1, x2, y2) {
  const dx = Math.sign(x2 - x1);
  const dy = Math.sign(y2 - y1);

  let x = x1;
  let y = y1;

  while (x !== x2 || y !== y2) {
    if (x > 0 && x < MAP_WIDTH - 1 && y > 0 && y < MAP_HEIGHT - 1) {
      if (game.map[y][x] === TILES.WALL) {
        game.map[y][x] = TILES.FLOOR;
      }
    }

    if (x !== x2) x += dx;
    else if (y !== y2) y += dy;
  }

  // Carve final tile
  if (x > 0 && x < MAP_WIDTH - 1 && y > 0 && y < MAP_HEIGHT - 1) {
    if (game.map[y][x] === TILES.WALL) {
      game.map[y][x] = TILES.FLOOR;
    }
  }
}

function placeDoors(rooms) {
  // Place 2-3 locked doors at random corridor-room boundaries
  const doorCount = 2 + Math.floor(Math.random() * 2);
  let placed = 0;
  let attempts = 0;

  while (placed < doorCount && attempts < 100) {
    const x = 1 + Math.floor(Math.random() * (MAP_WIDTH - 2));
    const y = 1 + Math.floor(Math.random() * (MAP_HEIGHT - 2));

    // Check if this is a good door location (corridor entrance)
    if (game.map[y][x] === TILES.FLOOR && isDoorCandidate(x, y)) {
      game.map[y][x] = TILES.DOOR_LOCKED;
      placed++;
    }
    attempts++;
  }
}

function isDoorCandidate(x, y) {
  // A door candidate has walls on opposite sides and floors on the other two sides
  const horizontal =
    game.map[y][x - 1] === TILES.WALL &&
    game.map[y][x + 1] === TILES.WALL &&
    game.map[y - 1][x] === TILES.FLOOR &&
    game.map[y + 1][x] === TILES.FLOOR;

  const vertical =
    game.map[y - 1][x] === TILES.WALL &&
    game.map[y + 1][x] === TILES.WALL &&
    game.map[y][x - 1] === TILES.FLOOR &&
    game.map[y][x + 1] === TILES.FLOOR;

  return horizontal || vertical;
}

function placeItems() {
  game.items = [];

  // Place 1-2 keys per floor
  const keyCount = 1 + Math.floor(Math.random() * 2);
  let placed = 0;
  let attempts = 0;

  while (placed < keyCount && attempts < 100) {
    const x = 1 + Math.floor(Math.random() * (MAP_WIDTH - 2));
    const y = 1 + Math.floor(Math.random() * (MAP_HEIGHT - 2));

    if (game.map[y][x] === TILES.FLOOR &&
        !(x === game.player.x && y === game.player.y)) {
      game.items.push({ x, y, type: 'key' });
      placed++;
    }
    attempts++;
  }
}

// For next floor generation
export function nextFloor() {
  game.currentFloor++;
  game.items = [];
  game.enemies = [];
  game.projectiles = [];
  generateMap();
}
