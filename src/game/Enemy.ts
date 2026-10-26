import Phaser from 'phaser';
import { MOVE, TILE } from '../config';
import { moveCircle } from '../core/collision';
import { DEG, rayCircle, wrapAngle } from '../core/geometry';
import type { HostileSlot, HostileType } from '../levels/types';
import { drawDowned, drawFigure, type FigureStyle } from './figures';
import type { NoiseEvent } from './Noise';
import type { World } from './World';

export type EnemyState = 'idle' | 'alert' | 'combat' | 'down';

/** What an enemy needs from the scene it lives in. */
export interface EnemyContext {
  world: World;
  player: { x: number; y: number; alive: boolean; inDark: boolean };
  /** Fires a shot from the enemy along `angle`; the scene resolves what it hits. */
  shoot(e: Enemy, angle: number): void;
  /** A sound the enemy makes (footsteps, a shout). Shouts alert other enemies. */
  noise(e: Enemy, radius: number, kind: NoiseEvent['kind']): void;
}

const RADIUS = 11;
const HALF_FOV = 60 * DEG;
const VIEW_LIT = 440;
const VIEW_DARK = 190;
/** Always noticed at this distance, whichever way they face. */
const VIEW_CLOSE = 46;
const SPEED_PATROL = 52;
const SPEED_ALERT = 88;
const TURN = 4.5;
const REACTION: Record<HostileType, number> = { lookout: 0.45, patroller: 0.6 };
const LOOK_AROUND = 2.6;
/** Angular error of an enemy's shot, in radians (about 4 degrees). */
const SPREAD = 4 * DEG;

const STYLE: FigureStyle = { body: 0x991b1b, chest: 0xdc2626, head: 0x2b2b2b, gun: true };

/**
 * A hostile. Readable rather than clever: Idle (post or patrol), Alert (investigates a noise)
 * and Combat (sees you: turns, reacts, shoots). Noise moves them from Idle to Alert, which is
 * what makes careful play pay off.
 */
export class Enemy {
  readonly prop = false;
  readonly kind = 'suspect' as const;
  state: EnemyState = 'idle';
  x: number;
  y: number;
  facing: number;
  wasHit = false;

  private post: { x: number; y: number; facing: number };
  private route: { x: number; y: number }[];
  private routeIndex = 0;
  private path: { x: number; y: number }[] = [];
  private goal: { x: number; y: number } | null = null;
  private investigate: { x: number; y: number } | null = null;
  private lastSeen: { x: number; y: number } | null = null;
  private sightTime = 0;
  private lostTime = 0;
  private reactTimer = 0;
  private fireTimer = 0;
  private lookTimer = 0;
  private stepTimer = 0;
  private time = Math.random() * 10;
  private downTime = 0;

  private container: Phaser.GameObjects.Container;
  private gfx: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, readonly type: HostileType, slot: HostileSlot, depth: number) {
    this.x = slot.tx * TILE;
    this.y = slot.ty * TILE;
    this.facing = slot.facing * DEG;
    this.post = { x: this.x, y: this.y, facing: this.facing };
    this.route = (slot.route ?? []).map((p) => ({ x: p.tx * TILE, y: p.ty * TILE }));
    this.gfx = scene.add.graphics();
    drawFigure(this.gfx, STYLE);
    this.container = scene.add.container(this.x, this.y, [this.gfx]).setDepth(depth).setVisible(false);
  }

  get alive(): boolean {
    return this.state !== 'down';
  }

  hitTest(ox: number, oy: number, dx: number, dy: number): number {
    return this.alive ? rayCircle(ox, oy, dx, dy, this.x, this.y, RADIUS) : Infinity;
  }

  hit(): void {
    if (!this.alive) return;
    this.state = 'down';
    this.wasHit = true;
    this.gfx.clear();
    drawDowned(this.gfx, STYLE);
  }

  /** Called for every noise in the level. */
  hear(e: NoiseEvent): void {
    if (!this.alive || this.state === 'combat') return;
    // Their own side's footsteps aren't interesting; shouts, shots, doors and you are.
    if (e.source === 'world' && e.kind !== 'shout' && e.kind !== 'shot') return;
    if (Math.hypot(e.x - this.x, e.y - this.y) > e.radius) return;
    this.state = 'alert';
    this.investigate = { x: e.x + Phaser.Math.Between(-12, 12), y: e.y + Phaser.Math.Between(-12, 12) };
    this.goal = null;
    this.lookTimer = 0;
  }

  /** @param visible whether the operator can currently see this enemy */
  update(dt: number, ctx: EnemyContext, visible: boolean): void {
    this.container.setVisible(visible);
    if (!this.alive) {
      // Fall and fade, but stay readable as a body.
      this.downTime += dt;
      this.container.setAlpha(Math.max(0.55, 1 - this.downTime * 0.25));
      return;
    }
    this.time += dt;

    const p = ctx.player;
    const dx = p.x - this.x, dy = p.y - this.y;
    const dist = Math.hypot(dx, dy);
    const toPlayer = Math.atan2(dy, dx);
    let sees = false;
    if (p.alive && dist < (p.inDark ? VIEW_DARK : VIEW_LIT)) {
      const inCone = Math.abs(wrapAngle(toPlayer - this.facing)) < HALF_FOV;
      if ((dist < VIEW_CLOSE || inCone || this.state === 'combat') && ctx.world.lineOfSight(this.x, this.y, p.x, p.y)) sees = true;
    }

    if (sees) {
      this.lastSeen = { x: p.x, y: p.y };
      this.lostTime = 0;
      // Closer and already alert means noticing faster.
      const notice = (this.state === 'alert' ? 0.12 : 0.35) + dist / 1600;
      this.sightTime += dt;
      if (this.state !== 'combat' && this.sightTime >= notice) this.enterCombat(ctx);
    } else {
      this.sightTime = Math.max(0, this.sightTime - dt * 0.5);
    }

    switch (this.state) {
      case 'idle':
        this.updateIdle(dt, ctx);
        break;
      case 'alert':
        this.updateAlert(dt, ctx);
        break;
      case 'combat':
        this.updateCombat(dt, ctx, sees, toPlayer);
        break;
    }

    this.container.setPosition(this.x, this.y);
    this.container.rotation = this.facing;
  }

  private enterCombat(ctx: EnemyContext): void {
    this.state = 'combat';
    this.reactTimer = REACTION[this.type];
    this.fireTimer = 0;
    this.path = [];
    this.goal = null;
    if (this.type === 'lookout') ctx.noise(this, 420, 'shout');
  }

  private updateIdle(dt: number, ctx: EnemyContext): void {
    if (this.type === 'patroller' && this.route.length) {
      const target = this.route[this.routeIndex];
      if (this.walkTo(target, SPEED_PATROL, dt, ctx)) this.routeIndex = (this.routeIndex + 1) % this.route.length;
      return;
    }
    // Back at the post if an investigation took them away; then a slow scan of their arc.
    if (Math.hypot(this.post.x - this.x, this.post.y - this.y) > 6) {
      this.walkTo(this.post, SPEED_PATROL, dt, ctx);
      return;
    }
    const scan = this.post.facing + Math.sin(this.time * 0.6) * 22 * DEG;
    this.turnTo(scan, dt, 1.2);
  }

  private updateAlert(dt: number, ctx: EnemyContext): void {
    if (this.investigate) {
      if (this.walkTo(this.investigate, SPEED_ALERT, dt, ctx)) {
        this.investigate = null;
        this.lookTimer = LOOK_AROUND;
      }
      return;
    }
    if (this.lookTimer > 0) {
      this.lookTimer -= dt;
      this.facing = wrapAngle(this.facing + dt * 1.8 * Math.sign(Math.sin(this.time * 0.9)));
      return;
    }
    this.state = 'idle';
    this.goal = null;
  }

  private updateCombat(dt: number, ctx: EnemyContext, sees: boolean, toPlayer: number): void {
    if (!sees) {
      this.lostTime += dt;
      if (this.lostTime > 0.7 && this.lastSeen) {
        // Lost them: go to where they were last seen.
        this.state = 'alert';
        this.investigate = this.lastSeen;
        this.goal = null;
      }
      return;
    }
    this.turnTo(toPlayer, dt, TURN);
    this.reactTimer -= dt;
    const aligned = Math.abs(wrapAngle(toPlayer - this.facing)) < 12 * DEG;
    if (this.reactTimer > 0 || !aligned) return;
    this.fireTimer -= dt;
    if (this.fireTimer <= 0) {
      this.fireTimer = Phaser.Math.FloatBetween(0.7, 1.1);
      const error = (Math.random() + Math.random() - 1) * SPREAD;
      ctx.shoot(this, this.facing + error);
    }
  }

  /** Walks towards `target` along a path; returns true on arrival. */
  private walkTo(target: { x: number; y: number }, speed: number, dt: number, ctx: EnemyContext): boolean {
    if (Math.hypot(target.x - this.x, target.y - this.y) < 6) return true;
    if (!this.goal || this.goal.x !== target.x || this.goal.y !== target.y) {
      this.goal = target;
      this.path = ctx.world.findPath(this.x, this.y, target.x, target.y) ?? [];
      if (!this.path.length) {
        // Unreachable: give up on it.
        this.goal = null;
        return true;
      }
      this.path[this.path.length - 1] = { ...target };
    }
    const next = this.path[0];
    if (!next) return true;

    // Doors in the way get opened, then waited for.
    const door = ctx.world.doorAtTile(Math.floor(next.x / TILE), Math.floor(next.y / TILE));
    if (door?.blocksMovement) {
      if (door.state === 'closed' && Math.hypot(door.cx - this.x, door.cy - this.y) < TILE * 1.6) {
        const radius = door.toggle(this.x, this.y);
        ctx.noise(this, radius, 'door');
      }
      this.turnTo(Math.atan2(next.y - this.y, next.x - this.x), dt, TURN);
      if (door.state === 'open') return false;
    }

    // Stop short rather than walk into the operator.
    if (Math.hypot(ctx.player.x - this.x, ctx.player.y - this.y) < MOVE.radius * 2 + 4) return false;

    const dx = next.x - this.x, dy = next.y - this.y;
    const d = Math.hypot(dx, dy);
    if (d < 4) {
      this.path.shift();
      return this.path.length === 0;
    }
    const step = Math.min(d, speed * dt);
    const moved = moveCircle(this.x, this.y, (dx / d) * step, (dy / d) * step, MOVE.radius, TILE, ctx.world.solid);
    this.x = moved.x;
    this.y = moved.y;
    this.turnTo(Math.atan2(dy, dx), dt, TURN);

    this.stepTimer -= dt;
    if (this.stepTimer <= 0) {
      this.stepTimer = speed > SPEED_PATROL ? 0.38 : 0.55;
      ctx.noise(this, speed > SPEED_PATROL ? 260 : 190, 'step');
    }
    return false;
  }

  private turnTo(angle: number, dt: number, rate: number): void {
    const diff = wrapAngle(angle - this.facing);
    this.facing = wrapAngle(this.facing + Phaser.Math.Clamp(diff, -rate * dt, rate * dt));
  }
}
