import Phaser from 'phaser';
import { COLORS, FONT, TILE } from '../config';
import { blocksSight, type ParsedLevel, type TileKind } from '../core/grid';
import type { FloorLabel } from '../levels/range';

const PLANK_H = 8;
const PLANK_LEN = 96;
const AO_WALL = [0.34, 0.2, 0.1, 0.04];
const AO_LOW = [0.2, 0.1, 0.04];

/**
 * Draws a level's static art (floors, walls, furniture, shadows, labels) once into a render
 * texture at the game's render scale, so it stays sharp when the camera is zoomed in.
 */
export function drawLevelArt(
  scene: Phaser.Scene,
  level: ParsedLevel,
  labels: readonly FloorLabel[],
  rails: readonly { x0: number; x1: number; y: number }[],
  depth: number,
  scale: number,
): Phaser.GameObjects.RenderTexture {
  const { width, height } = level;
  const kindAt = (x: number, y: number): TileKind =>
    x < 0 || y < 0 || x >= width || y >= height ? 'wall' : level.tiles[y * width + x];
  const darkAt = (x: number, y: number) => level.dark[y * width + x] ?? false;
  const g = scene.make.graphics({}, false);
  /** Draws a highlight on each side of tile (x, y) whose neighbour is `exposed`. */
  const edges = (x: number, y: number, exposed: (k: TileKind) => boolean, color: number, w: number) => {
    const px = x * TILE, py = y * TILE;
    g.fillStyle(color, 0.9);
    if (exposed(kindAt(x, y - 1))) g.fillRect(px, py, TILE, w);
    if (exposed(kindAt(x, y + 1))) g.fillRect(px, py + TILE - w, TILE, w);
    if (exposed(kindAt(x - 1, y))) g.fillRect(px, py, w, TILE);
    if (exposed(kindAt(x + 1, y))) g.fillRect(px + TILE - w, py, w, TILE);
  };

  // Floors: continuous wooden planks, each with its own tone.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (blocksSight(kindAt(x, y))) continue;
      const base = darkAt(x, y) ? COLORS.floorDark : COLORS.floor;
      for (let r = 0; r < TILE / PLANK_H; r++) {
        const row = y * (TILE / PLANK_H) + r;
        const offset = Math.floor(hash(row, 7) * PLANK_LEN);
        const py = y * TILE + r * PLANK_H;
        let sx = x * TILE;
        while (sx < (x + 1) * TILE) {
          const plank = Math.floor((sx + offset) / PLANK_LEN);
          const end = Math.min((x + 1) * TILE, (plank + 1) * PLANK_LEN - offset);
          g.fillStyle(tone(base, 0.86 + hash(row, plank) * 0.26), 1);
          g.fillRect(sx, py, end - sx, PLANK_H);
          g.fillStyle(0xffffff, 0.025);
          g.fillRect(sx, py + 3 + Math.floor(hash(plank, row) * 3), end - sx, 1);
          if (end < (x + 1) * TILE) {
            g.fillStyle(0x000000, 0.35);
            g.fillRect(end - 0.5, py, 1, PLANK_H);
          }
          sx = end;
        }
        g.fillStyle(0x000000, 0.28);
        g.fillRect(x * TILE, py, TILE, 0.75);
      }
    }
  }

  // Soft contact shadows where floor meets walls and low furniture.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (kindAt(x, y) !== 'floor') continue;
      const px = x * TILE, py = y * TILE;
      const sides: [number, number, 'n' | 's' | 'w' | 'e'][] = [[0, -1, 'n'], [0, 1, 's'], [-1, 0, 'w'], [1, 0, 'e']];
      for (const [dx, dy, side] of sides) {
        const k = kindAt(x + dx, y + dy);
        const ramp = blocksSight(k) ? AO_WALL : k === 'furniture' || k === 'barrier' ? AO_LOW : null;
        if (!ramp) continue;
        ramp.forEach((a, i) => {
          g.fillStyle(0x000000, a);
          if (side === 'n') g.fillRect(px, py + i * 2, TILE, 2);
          else if (side === 's') g.fillRect(px, py + TILE - (i + 1) * 2, TILE, 2);
          else if (side === 'w') g.fillRect(px + i * 2, py, 2, TILE);
          else g.fillRect(px + TILE - (i + 1) * 2, py, 2, TILE);
        });
      }
    }
  }

  // Furniture and the firing-line counter, with drop shadows.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const kind = kindAt(x, y);
      const px = x * TILE, py = y * TILE;
      if (kind === 'furniture') {
        g.fillStyle(0x000000, 0.3);
        g.fillRect(px + 3, py + 4, TILE, TILE);
      } else if (kind === 'barrier') {
        g.fillStyle(0x000000, 0.3);
        g.fillRect(px + 9, py + 3, TILE - 12, TILE);
      }
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const kind = kindAt(x, y);
      const px = x * TILE, py = y * TILE;
      if (kind === 'furniture') {
        g.fillStyle(tone(COLORS.furniture, 0.95 + hash(x, y, 3) * 0.1), 1);
        g.fillRect(px, py, TILE, TILE);
        g.fillStyle(0xffffff, 0.04);
        for (let i = 4; i < TILE; i += 6) g.fillRect(px, py + i, TILE, 1);
        edges(x, y, (k) => k !== 'furniture', COLORS.furnitureEdge, 1.5);
      } else if (kind === 'barrier') {
        g.fillStyle(COLORS.barrier, 1);
        g.fillRect(px + 6, py, TILE - 12, TILE);
        g.fillStyle(0xffffff, 0.08);
        g.fillRect(px + 6, py, 2, TILE);
        g.fillStyle(COLORS.barrierStripe, 0.75);
        g.fillRect(px + 15, py + (y % 2 ? 0 : 6), 2, TILE - 6);
      }
    }
  }

  // Walls: textured concrete and plywood with a lit top edge.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const kind = kindAt(x, y);
      if (!blocksSight(kind)) continue;
      const px = x * TILE, py = y * TILE;
      if (kind === 'wall') {
        g.fillStyle(tone(COLORS.wall, 0.96 + hash(x, y, 1) * 0.08), 1);
        g.fillRect(px, py, TILE, TILE);
        for (let i = 0; i < 7; i++) {
          g.fillStyle(hash(x, y, 20 + i) > 0.5 ? 0xffffff : 0x000000, 0.06);
          g.fillRect(px + hash(x, y, 30 + i) * (TILE - 3), py + hash(x, y, 40 + i) * (TILE - 3), 2 + hash(x, y, 50 + i) * 3, 2);
        }
      } else {
        g.fillStyle(COLORS.plywood, 1);
        g.fillRect(px, py, TILE, TILE);
        const along = kindAt(x - 1, y) === 'plywood' || kindAt(x + 1, y) === 'plywood';
        g.fillStyle(0x000000, 0.12);
        for (let i = 7; i < TILE; i += 8) {
          if (along) g.fillRect(px, py + i, TILE, 1);
          else g.fillRect(px + i, py, 1, TILE);
        }
      }
      edges(x, y, (k) => !blocksSight(k), kind === 'wall' ? COLORS.wallEdge : COLORS.plywoodEdge, 1.5);
    }
  }

  // Door sills, so doorways read even when the door is open.
  for (const d of level.doors) {
    const px = d.tx * TILE, py = d.ty * TILE;
    g.fillStyle(0x000000, 0.3);
    if (d.orientation === 'h') g.fillRect(px, py + TILE / 2 - 4, TILE, 8);
    else g.fillRect(px + TILE / 2 - 4, py, 8, TILE);
  }

  for (const r of rails) {
    g.fillStyle(0x000000, 0.35);
    g.fillRect(r.x0, r.y - 2, r.x1 - r.x0, 4);
    g.fillStyle(0x8a8f96, 0.6);
    g.fillRect(r.x0, r.y - 1, r.x1 - r.x0, 1.5);
  }

  const rt = scene.add.renderTexture(0, 0, width * TILE * scale, height * TILE * scale)
    .setOrigin(0).setScale(1 / scale).setDepth(depth);
  g.setScale(scale);
  rt.draw(g);
  g.destroy();

  for (const l of labels) {
    const t = scene.make.text({
      x: l.tx * TILE * scale, y: l.ty * TILE * scale, text: l.text,
      style: { fontFamily: FONT, fontSize: `${(l.size ?? 16) * scale}px`, fontStyle: 'bold', color: '#e8d6b3' },
    }, false).setAlpha(0.2);
    rt.draw(t);
    t.destroy();
  }
  return rt;
}

/** Deterministic pseudo-random number in [0, 1) for a grid position. */
function hash(x: number, y: number, n = 0): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(n, 1274126177)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function tone(color: number, f: number): number {
  const r = Math.min(255, Math.round(((color >> 16) & 0xff) * f));
  const gg = Math.min(255, Math.round(((color >> 8) & 0xff) * f));
  const b = Math.min(255, Math.round((color & 0xff) * f));
  return (r << 16) | (gg << 8) | b;
}
