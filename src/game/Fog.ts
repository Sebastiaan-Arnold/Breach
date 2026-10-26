import Phaser from 'phaser';
import { COLORS, TILE, VISION } from '../config';

/**
 * Three layers of knowledge:
 *  - visible: inside the current vision polygons, fully lit
 *  - remembered: seen before, drawn dim; live entities are hidden there by their own check
 *  - unknown: never seen, pure black, not even walls
 *
 * `memory` accumulates every vision polygon ever drawn. Each frame the unknown layer is black
 * with `memory` erased out of it, and the dim layer is a translucent shade with the current
 * vision erased out of it.
 */
export class Fog {
  private memory: Phaser.GameObjects.RenderTexture;
  private unknown: Phaser.GameObjects.RenderTexture;
  private dim: Phaser.GameObjects.RenderTexture;
  private brush: Phaser.GameObjects.Graphics;
  private glow: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, width: number, height: number, glowDepth: number, fogDepth: number) {
    this.memory = scene.make.renderTexture({ x: 0, y: 0, width, height }, false).setOrigin(0);
    this.dim = scene.add.renderTexture(0, 0, width, height).setOrigin(0).setDepth(fogDepth);
    this.unknown = scene.add.renderTexture(0, 0, width, height).setOrigin(0).setDepth(fogDepth + 1);
    this.brush = scene.make.graphics({}, false);
    this.glow = scene.add.graphics().setDepth(glowDepth);
  }

  /**
   * @param polys current vision polygons (flat point arrays)
   * @param wallTiles wall tiles struck by vision rays this frame, so walls get remembered too
   */
  update(polys: readonly number[][], wallTiles: readonly { tx: number; ty: number }[], warmth: number): void {
    const b = this.brush;
    b.clear();
    b.fillStyle(0xffffff, 1);
    for (const p of polys) fillPoly(b, p);
    for (const t of wallTiles) b.fillRect(t.tx * TILE, t.ty * TILE, TILE, TILE);

    this.memory.draw(b);

    this.dim.clear();
    this.dim.fill(0x000000, VISION.rememberedShade);
    this.dim.erase(b);

    this.unknown.clear();
    this.unknown.fill(COLORS.void, 1);
    this.unknown.erase(this.memory);

    const g = this.glow;
    g.clear();
    g.fillStyle(COLORS.visionWarm, warmth);
    if (polys[0]) fillPoly(g, polys[0]);
  }

  reset(): void {
    this.memory.clear();
  }
}

function fillPoly(g: Phaser.GameObjects.Graphics, p: readonly number[]): void {
  if (p.length < 6) return;
  g.beginPath();
  g.moveTo(p[0], p[1]);
  for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]);
  g.closePath();
  g.fillPath();
}
