import Phaser from 'phaser';
import { COLORS, TILE } from '../config';
import { blocksSight, type ParsedLevel } from '../core/grid';

/**
 * Glass walls and windows. Panes are drawn on their own layer, not baked into the level art,
 * because a shot shatters them: the pane goes, the tile becomes floor and the gap can be walked
 * through.
 *
 * Each pane is a post with an arm towards every neighbour it joins (more glass, a wall or a
 * door), so straight runs read as one line and corners close.
 */
export class Glass {
  private intact = new Set<number>();
  private doors = new Set<number>();
  private gfx: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, private level: ParsedLevel, depth: number) {
    level.tiles.forEach((k, i) => {
      if (k === 'glass') this.intact.add(i);
    });
    for (const d of level.doors) this.doors.add(d.ty * level.width + d.tx);
    this.gfx = scene.add.graphics().setDepth(depth);
    this.draw();
  }

  isIntact(tx: number, ty: number): boolean {
    return this.intact.has(ty * this.level.width + tx);
  }

  /** Shatters the pane at (tx, ty). Returns true if there was one. */
  shatter(tx: number, ty: number): boolean {
    const i = ty * this.level.width + tx;
    if (!this.intact.delete(i)) return false;
    this.level.tiles[i] = 'floor';
    this.draw();
    return true;
  }

  private draw(): void {
    const g = this.gfx;
    const { width, height } = this.level;
    const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height;
    // More glass, or a door set in it: the pane continues that way.
    const pane = (x: number, y: number) => inside(x, y) && (this.intact.has(y * width + x) || this.doors.has(y * width + x));
    const wall = (x: number, y: number) => !inside(x, y) || blocksSight(this.level.tiles[y * width + x]);
    /**
     * Which sides a pane reaches. Always towards more glass; towards a wall only along the run
     * the pane is part of, so a wall meeting the middle of a glass front doesn't make a T.
     */
    const joins = (x: number, y: number, dx: number, dy: number) => {
      if (pane(x + dx, y + dy)) return true;
      if (!wall(x + dx, y + dy)) return false;
      const alongX = pane(x - 1, y) || pane(x + 1, y), alongY = pane(x, y - 1) || pane(x, y + 1);
      if (dx !== 0) return alongX || !alongY;
      return alongY || !alongX;
    };
    /** A centred square of width `w`, with an arm out to each side the pane joins. */
    const arms = (i: number, w: number) => {
      const x = i % width, y = Math.floor(i / width);
      const px = x * TILE, py = y * TILE, a = (TILE - w) / 2;
      g.fillRect(px + a, py + a, w, w);
      if (joins(x, y, -1, 0)) g.fillRect(px, py + a, a + w, w);
      if (joins(x, y, 1, 0)) g.fillRect(px + a, py + a, TILE - a, w);
      if (joins(x, y, 0, -1)) g.fillRect(px + a, py, w, a + w);
      if (joins(x, y, 0, 1)) g.fillRect(px + a, py + a, w, TILE - a);
    };
    g.clear();
    // The frame, then the pane inside it.
    g.fillStyle(0x1e293b, 1);
    for (const i of this.intact) arms(i, 8);
    g.fillStyle(COLORS.glass, 0.85);
    for (const i of this.intact) arms(i, 4);
  }
}
