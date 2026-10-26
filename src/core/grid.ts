/**
 * Level grid parsing. Levels are ASCII for now (one char per 32 px tile); the same data drives
 * collision, line of sight and, later, the briefing map. A Tiled JSON importer can produce the
 * same ParsedLevel shape when levels move to Tiled.
 *
 *   #  concrete wall          w  plywood wall
 *   .  lit floor              ,  dark floor (lights off)
 *   b  low barrier / counter  T  furniture (blocks movement, not sight)
 *   D  door (orientation taken from the walls either side)
 *   P  player start           S  suspect target    C  civilian target
 *   ?  random target slot     M  moving (rail) target
 */

export type TileKind = 'wall' | 'plywood' | 'floor' | 'barrier' | 'furniture';
export type MarkerKind = 'player' | 'suspect' | 'civilian' | 'random' | 'mover';
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
  dark: boolean[];
  doors: DoorSpec[];
  markers: Marker[];
}

const MARKERS: Record<string, MarkerKind> = { P: 'player', S: 'suspect', C: 'civilian', '?': 'random', M: 'mover' };

export function blocksSight(kind: TileKind): boolean {
  return kind === 'wall' || kind === 'plywood';
}

export function blocksMovement(kind: TileKind): boolean {
  return kind !== 'floor';
}

export function parseLevel(rows: readonly string[]): ParsedLevel {
  const height = rows.length;
  const width = Math.max(...rows.map((r) => r.length));
  const tiles: TileKind[] = new Array(width * height);
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
        case 'b': tiles[i] = 'barrier'; break;
        case 'T': tiles[i] = 'furniture'; break;
        case ',': tiles[i] = 'floor'; dark[i] = true; break;
        default: tiles[i] = 'floor';
      }
      if (ch === 'D') {
        const wallLeftRight = isWallChar(at(x - 1, y)) && isWallChar(at(x + 1, y));
        doors.push({ tx: x, ty: y, orientation: wallLeftRight ? 'h' : 'v' });
      } else if (MARKERS[ch]) {
        markers.push({ kind: MARKERS[ch], tx: x, ty: y });
      }
    }
  }

  // Marker, door and furniture tiles inherit darkness from the dark floor around them.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ch = at(x, y);
      if (ch === '.' || ch === ',' || isWallChar(ch) || ch === 'b') continue;
      if ([at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1)].includes(',')) dark[y * width + x] = true;
    }
  }

  return { width, height, tiles, dark, doors, markers };
}

function isWallChar(ch: string): boolean {
  return ch === '#' || ch === 'w';
}
