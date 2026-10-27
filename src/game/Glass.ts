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
    const joins = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return false;
      const i = y * width + x;
      return this.intact.has(i) || this.doors.has(i) || blocksSight(this.level.tiles[i]);
    };
    /** A centred square of width `w`, with an arm out to each side the pane joins. */
    const arms = (i: number, w: number) => {
      const x = i % width, y = Math.floor(i / width);
      const px = x * TILE, py = y * TILE, a = (TILE - w) / 2;
      g.fillRect(px + a, py + a, w, w);
      if (joins(x - 1, y)) g.fillRect(px, py + a, a + w, w);
      if (joins(x + 1, y)) g.fillRect(px + a, py + a, TILE - a, w);
      if (joins(x, y - 1)) g.fillRect(px + a, py, w, a + w);
      if (joins(x, y + 1)) g.fillRect(px + a, py + a, w, TILE - a);
    };
    g.clear();
    // The frame, then the pane inside it.
    g.fillStyle(0x1e293b, 1);
    for (const i of this.intact) arms(i, 8);
    g.fillStyle(COLORS.glass, 0.85);
    for (const i of this.intact) arms(i, 4);
  }
}
