import Phaser from 'phaser';
import { COLORS } from '../config';
import { rayCircle } from '../core/geometry';
import type { StationId } from '../levels/range';

export type TargetKind = 'suspect' | 'civilian';
export type TargetState = 'hidden' | 'up' | 'down';

export interface TargetOpts {
  kind: TargetKind;
  x: number;
  y: number;
  station: StationId;
  /** Lies flat until the operator first sees it, then springs up. */
  popup: boolean;
  /** Seconds before a downed target stands back up; 0 means it stays down. */
  respawn: number;
  rail?: { x0: number; x1: number; speed: number };
}

const RADIUS = 11;
const RAIL_TICK = 0.55;

/** A cardboard target on the Range. Real enemies will share its visibility and hit rules. */
export class Target {
  readonly kind: TargetKind;
  readonly station: StationId;
  state: TargetState;
  x: number;
  y: number;
  /** Civilian targets remember being hit so the debrief can count them. */
  wasHit = false;

  private container: Phaser.GameObjects.Container;
  private gfx: Phaser.GameObjects.Graphics;
  private popTimer = -1;
  private downTimer = 0;
  private railDir = 1;
  private railTimer = 0;

  constructor(private scene: Phaser.Scene, private opts: TargetOpts, depth: number) {
    this.kind = opts.kind;
    this.station = opts.station;
    this.x = opts.x;
    this.y = opts.y;
    this.state = opts.popup ? 'hidden' : 'up';
    this.gfx = scene.add.graphics();
    this.container = scene.add.container(this.x, this.y, [this.gfx]).setDepth(depth).setVisible(false);
    this.container.rotation = Math.PI;
    this.redraw();
  }

  get alive(): boolean {
    return this.state !== 'down';
  }

  /** Distance along a ray to this target, or Infinity. Only standing targets can be hit. */
  hitTest(ox: number, oy: number, dx: number, dy: number): number {
    if (this.state !== 'up') return Infinity;
    return rayCircle(ox, oy, dx, dy, this.x, this.y, RADIUS);
  }

  hit(): void {
    if (this.state !== 'up') return;
    this.state = 'down';
    this.wasHit = true;
    this.downTimer = this.opts.respawn;
    this.redraw();
    this.scene.tweens.add({ targets: this.container, scale: 0.8, duration: 160, ease: 'Quad.Out' });
  }

  /**
   * @param visible whether the operator can currently see this spot
   * @returns true when the rail target made a noise this frame
   */
  update(dt: number, visible: boolean, px: number, py: number): boolean {
    this.container.setVisible(visible);
    let noisy = false;

    if (this.state === 'hidden') {
      if (visible && this.popTimer < 0) this.popTimer = 0.22;
      if (this.popTimer >= 0 && (this.popTimer -= dt) <= 0) {
        this.state = 'up';
        this.container.rotation = Math.atan2(py - this.y, px - this.x);
        this.redraw();
        this.container.setScale(0.35);
        this.scene.tweens.add({ targets: this.container, scale: 1, duration: 180, ease: 'Back.Out' });
      }
    } else if (this.state === 'down' && this.opts.respawn > 0) {
      if ((this.downTimer -= dt) <= 0) {
        this.state = 'up';
        this.redraw();
        this.container.setScale(0.35);
        this.scene.tweens.add({ targets: this.container, scale: 1, duration: 180, ease: 'Back.Out' });
      }
    }

    const rail = this.opts.rail;
    if (rail && this.state !== 'down') {
      this.x += this.railDir * rail.speed * dt;
      if (this.x > rail.x1 || this.x < rail.x0) {
        this.x = Phaser.Math.Clamp(this.x, rail.x0, rail.x1);
        this.railDir *= -1;
      }
      if ((this.railTimer -= dt) <= 0) {
        this.railTimer = RAIL_TICK;
        noisy = true;
      }
      this.container.x = this.x;
      if (this.state === 'up') this.container.rotation = Math.atan2(py - this.y, px - this.x);
    }
    return noisy;
  }

  private redraw(): void {
    const g = this.gfx;
    const color = this.kind === 'suspect' ? COLORS.suspect : COLORS.civilian;
    g.clear();
    if (this.state === 'hidden') {
      // Lying flat: just the edge of the cardboard.
      g.fillStyle(COLORS.cardboard, 0.9);
      g.fillRect(-12, -2, 24, 4);
      return;
    }
    const down = this.state === 'down';
    const a = down ? 0.4 : 1;
    g.fillStyle(COLORS.cardboard, 0.85 * a);
    g.fillRoundedRect(-13, -13, 26, 26, 3);
    g.lineStyle(1.5, 0x7a5f37, a);
    g.strokeRoundedRect(-13, -13, 26, 26, 3);
    if (this.kind === 'suspect') {
      g.fillStyle(0x1f2937, a);
      g.fillRect(6, -2.5, 12, 5);
    } else {
      g.fillStyle(0xfef3c7, a);
      g.fillCircle(7, -7, 3);
      g.fillCircle(7, 7, 3);
    }
    g.fillStyle(color, a);
    g.fillCircle(0, 0, 9);
    g.lineStyle(2, 0x111111, 0.6 * a);
    g.strokeCircle(0, 0, 9);
    if (down && this.kind === 'civilian') {
      g.lineStyle(3, COLORS.suspect, 0.9);
      g.lineBetween(-8, -8, 8, 8);
      g.lineBetween(-8, 8, 8, -8);
    }
  }
}
