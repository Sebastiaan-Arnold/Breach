/**
 * Level grid parsing. Levels are ASCII for now (one char per 32 px tile); the same data drives
 * collision, line of sight, pathfinding and the briefing map. A Tiled JSON importer can produce
 * the same ParsedLevel shape when levels move to Tiled.
 *
 *   #  concrete / brick wall  w  plywood wall        i  interior (plaster) wall
 *   .  wood floor             ,  wood floor, dark    ~  tiled floor
 *   :  concrete floor indoors ;  concrete floor indoors, dark
 *   =  pavement (outdoors)    "  grass (outdoors)
 *   b  low barrier / counter  T  furniture (blocks movement, not sight)
 *   D  door (orientation taken from the walls either side)
 *   S  suspect target         C  civilian target   ?  random target slot
 *   M  moving (rail) target
 *
 * Markers and doors take the floor material and darkness of the tiles around them.
 */

export type TileKind = 'wall' | 'plywood' | 'interior' | 'floor' | 'barrier' | 'furniture';
export type FloorMaterial = 'wood' | 'tile' | 'screed' | 'concrete' | 'grass';
export type MarkerKind = 'suspect' | 'civilian' | 'random' | 'mover';
export type DoorOrientation = 'h' | 'v';

export interface DoorSpec {
  tx: number;
  ty: number;
  /** 'h': the door sits in a wall running east-west, so you pass through it north-south. */
  orientation: DoorOrientation;
}

export interface Marker {
  kind: MarkerKind;
  tx: number;
  ty: number;
}

export interface ParsedLevel {
  width: number;
  height: number;
  tiles: TileKind[];
  material: FloorMaterial[];
  dark: boolean[];
  doors: DoorSpec[];
  markers: Marker[];
}

const MARKERS: Record<string, MarkerKind> = { S: 'suspect', C: 'civilian', '?': 'random', M: 'mover' };
const FLOORS: Record<string, FloorMaterial> = { '.': 'wood', ',': 'wood', '~': 'tile', ':': 'screed', ';': 'screed', '=': 'concrete', '"': 'grass' };
const DARK_FLOORS = new Set([',', ';']);

export function blocksSight(kind: TileKind): boolean {
  return kind === 'wall' || kind === 'plywood' || kind === 'interior';
}

export function blocksMovement(kind: TileKind): boolean {
  return kind !== 'floor';
}

/** Outdoor floors: always lit, and where approach routes and drop-off points live. */
export function isOutdoor(material: FloorMaterial): boolean {
  return material === 'concrete' || material === 'grass';
}

export function parseLevel(rows: readonly string[]): ParsedLevel {
  const height = rows.length;
  const width = Math.max(...rows.map((r) => r.length));
  const tiles: TileKind[] = new Array(width * height);
  const material: FloorMaterial[] = new Array(width * height).fill('wood');
  const dark: boolean[] = new Array(width * height).fill(false);
  const doors: DoorSpec[] = [];
  const markers: Marker[] = [];
  const at = (x: number, y: number) => (y >= 0 && y < height ? rows[y][x] ?? '#' : '#');

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ch = at(x, y);
      const i = y * width + x;
      switch (ch) {
        case '#': tiles[i] = 'wall'; break;
        case 'w': tiles[i] = 'plywood'; break;
        case 'i': tiles[i] = 'interior'; break;
        case 'b': tiles[i] = 'barrier'; break;
        case 'T': tiles[i] = 'furniture'; break;
        default: tiles[i] = 'floor';
      }
      if (FLOORS[ch]) material[i] = FLOORS[ch];
      if (DARK_FLOORS.has(ch)) dark[i] = true;
      if (ch === 'D') {
        const wallLeftRight = isWallChar(at(x - 1, y)) && isWallChar(at(x + 1, y));
        doors.push({ tx: x, ty: y, orientation: wallLeftRight ? 'h' : 'v' });
      } else if (MARKERS[ch]) {
        markers.push({ kind: MARKERS[ch], tx: x, ty: y });
      }
    }
  }

  // Markers, doors and furniture take the floor around them: darkness if any neighbour is dark,
  // material from the first floor neighbour (indoor floors win, so a doorway counts as inside).
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ch = at(x, y);
      if (FLOORS[ch] || isWallChar(ch) || ch === 'b') continue;
      const around = [at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)];
      const i = y * width + x;
      if (around.some((c) => DARK_FLOORS.has(c))) dark[i] = true;
      const floors = around.filter((c) => FLOORS[c]).map((c) => FLOORS[c]);
      const indoor = floors.find((m) => !isOutdoor(m));
      if (indoor ?? floors[0]) material[i] = indoor ?? floors[0];
    }
  }

  return { width, height, tiles, material, dark, doors, markers };
}

function isWallChar(ch: string): boolean {
  return ch === '#' || ch === 'w' || ch === 'i';
}
