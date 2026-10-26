import Phaser from 'phaser';
import { COLORS, NOISE, TILE } from '../config';
import { DEG, type Segment } from '../core/geometry';
import type { DoorSpec } from '../core/grid';

export type DoorState = 'closed' | 'peek' | 'open';
export type DoorAction = 'slow' | 'kick' | 'peek' | 'close';

const PEEK_ANGLE = 22 * DEG;
const PASSABLE_ANGLE = 70 * DEG;
const SPEED: Record<DoorAction, number> = { slow: 1.7, kick: 16, peek: 1.0, close: 2.6 };
const NOISE_FOR: Record<DoorAction, number> = { slow: NOISE.doorSlow, kick: NOISE.kick, peek: NOISE.peek, close: NOISE.doorClose };

/**
 * A door is a leaf pivoting on a hinge at one side of its tile. Its leaf is a real line segment
 * in the line-of-sight system, so cracking it open (peek) naturally reveals a thin slice of the
 * room behind it.
 */
export class Door {
  readonly tx: number;
  readonly ty: number;
  readonly hingeX: number;
  readonly hingeY: number;
  readonly closedAngle: number;
  readonly cx: number;
  readonly cy: number;
  state: DoorState = 'closed';
  /** Set when the door was kicked open; enemies right behind it are stunned. */
  lastAction: DoorAction | null = null;

  private angle: number;
  private targetAngle: number;
  private speed = 0;
  private swingDir = 1;
  private gfx: Phaser.GameObjects.Graphics;
  private dirty = true;

  constructor(scene: Phaser.Scene, readonly spec: DoorSpec, depth: number) {
    this.tx = spec.tx;
    this.ty = spec.ty;
    this.cx = spec.tx * TILE + TILE / 2;
    this.cy = spec.ty * TILE + TILE / 2;
    if (spec.orientation === 'h') {
      this.hingeX = spec.tx * TILE;
      this.hingeY = this.cy;
      this.closedAngle = 0;
    } else {
      this.hingeX = this.cx;
      this.hingeY = spec.ty * TILE;
      this.closedAngle = 90 * DEG;
    }
    this.angle = this.targetAngle = this.closedAngle;
    this.gfx = scene.add.graphics().setDepth(depth);
  }

  get blocksMovement(): boolean {
    return Math.abs(this.angle - this.closedAngle) < PASSABLE_ANGLE;
  }

  get moving(): boolean {
    return this.angle !== this.targetAngle;
  }

  /** The actions that make sense for the door's current state, in menu order. */
  options(): DoorAction[] {
    if (this.state === 'closed') return ['slow', 'kick', 'peek'];
    if (this.state === 'peek') return ['slow', 'kick', 'close'];
    return ['close'];
  }

  segment(): Segment {
    return {
      ax: this.hingeX,
      ay: this.hingeY,
      bx: this.hingeX + Math.cos(this.angle) * TILE,
      by: this.hingeY + Math.sin(this.angle) * TILE,
    };
  }

  /** Applies an action from someone standing at (fromX, fromY). Returns the noise radius. */
  act(action: DoorAction, fromX: number, fromY: number): number {
    if (this.state === 'closed' && action !== 'close') {
      // Doors swing away from whoever opens them.
      if (this.spec.orientation === 'h') this.swingDir = fromY < this.cy ? 1 : -1;
      else this.swingDir = fromX < this.cx ? -1 : 1;
    }
    this.lastAction = action;
    this.speed = SPEED[action];
    switch (action) {
      case 'slow':
      case 'kick':
        this.state = 'open';
        this.targetAngle = this.closedAngle + this.swingDir * 90 * DEG;
        break;
      case 'peek':
        this.state = 'peek';
        this.targetAngle = this.closedAngle + this.swingDir * PEEK_ANGLE;
        break;
      case 'close':
        this.state = 'closed';
        this.targetAngle = this.closedAngle;
        break;
    }
    return NOISE_FOR[action];
  }

  /** Rough position just past the door on the side it swings into. */
  farSide(): { x: number; y: number } {
    if (this.spec.orientation === 'h') return { x: this.cx, y: this.cy + this.swingDir * TILE };
    return { x: this.cx - this.swingDir * TILE, y: this.cy };
  }

  update(dt: number): void {
    if (this.angle !== this.targetAngle) {
      const diff = this.targetAngle - this.angle;
      const step = this.speed * dt;
      this.angle = Math.abs(diff) <= step ? this.targetAngle : this.angle + Math.sign(diff) * step;
      this.dirty = true;
    }
    if (this.dirty) this.draw();
  }

  private draw(): void {
    this.dirty = false;
    const g = this.gfx;
    const s = this.segment();
    g.clear();
    g.lineStyle(7, COLORS.door, 1);
    g.lineBetween(s.ax, s.ay, s.bx, s.by);
    g.lineStyle(2, COLORS.doorEdge, 1);
    g.lineBetween(s.ax, s.ay, s.bx, s.by);
    g.fillStyle(COLORS.doorEdge, 1);
    g.fillCircle(s.ax, s.ay, 3.5);
  }
}
