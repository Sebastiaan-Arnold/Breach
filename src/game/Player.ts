import Phaser from 'phaser';
import { MOVE, TILE } from '../config';
import { DEG, wrapAngle } from '../core/geometry';
import { moveCircle } from '../core/collision';
import { WEAPONS, WeaponState, type WeaponId } from './weapons';

export interface PlayerInput {
  moveX: number;
  moveY: number;
  sprint: boolean;
  /** World-space angle towards the cursor. */
  aimAt: number;
  /** Speed multiplier, e.g. for the brisk walk in the intro. Doesn't make footsteps louder. */
  pace?: number;
}

export interface StepEvent {
  loud: boolean;
}

/** How quickly the operator reaches full speed and comes to a stop (per second). */
const ACCEL = 12;
const DECEL = 16;
/** How quickly the aim eases towards the cursor, before the gun's turn-rate cap. */
const TURN_EASE = 24;

const GUN_LENGTH: Record<WeaponId, number> = { pistol: 17, smg: 20, shotgun: 25, rifle: 26 };

export class Player {
  x: number;
  y: number;
  facing = 0;
  /** 0 = rock steady, 1 = all over the place. Drives the laser wobble. */
  instability = 0;
  sprinting = false;
  moving = false;
  /** Light body armour absorbs the first hit; two more take the operator down. */
  armor = 1;
  health = 2;
  weapon: WeaponState;

  private vx = 0;
  private vy = 0;
  private gunKick = 0;
  private weapons = new Map<WeaponId, WeaponState>();
  private container: Phaser.GameObjects.Container;
  private gunGfx: Phaser.GameObjects.Graphics;
  private stepTimer = 0;
  private time = 0;
  private hurtTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, depth: number) {
    this.x = x;
    this.y = y;
    this.weapon = this.equip('pistol');

    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(1.5, 2.5, 22, 30);

    const body = scene.add.graphics();
    // Vest and shoulders, in the operator's blue.
    body.fillStyle(0x1d4ed8, 1);
    body.fillEllipse(0, 0, 15, 25);
    body.fillStyle(0x3b82f6, 1);
    body.fillEllipse(1, 0, 10, 18);
    body.lineStyle(1, 0x0b1d4a, 0.9);
    body.strokeEllipse(0, 0, 15, 25);
    // Helmet with a light catching its top.
    body.fillStyle(0x1e293b, 1);
    body.fillCircle(1, 0, 6.5);
    body.fillStyle(0xffffff, 0.18);
    body.fillCircle(0, -1.8, 3);
    body.fillStyle(0x93c5fd, 0.9);
    body.fillRect(6, -2.5, 1.5, 5);

    this.gunGfx = scene.add.graphics();
    this.container = scene.add.container(x, y, [shadow, this.gunGfx, body]).setDepth(depth);
    this.drawGun();
  }

  get displayObject(): Phaser.GameObjects.Container {
    return this.container;
  }

  get alive(): boolean {
    return this.health > 0;
  }

  /** Takes a hit. Returns true if it took the operator down. */
  damage(): boolean {
    // A shotgun's pellets or two shots in the same instant count as one hit.
    if (!this.alive || this.hurtTimer > 0) return false;
    this.hurtTimer = 0.25;
    if (this.armor > 0) this.armor--;
    else this.health--;
    this.kick(0.6);
    if (!this.alive) this.container.setAlpha(0.6).setScale(0.9);
    return !this.alive;
  }

  /** The angle the laser (and every shot) actually points: facing plus a slow drift. */
  get aimAngle(): number {
    const t = this.time;
    const n = Math.sin(t * 1.9) * 0.6 + Math.sin(t * 3.3 + 1.3) * 0.3 + Math.sin(t * 5.7 + 2.1) * 0.1;
    return this.facing + this.instability * this.weapon.def.wobble * DEG * n;
  }

  get muzzle(): { x: number; y: number } {
    const len = GUN_LENGTH[this.weapon.def.id];
    return { x: this.x + Math.cos(this.facing) * len, y: this.y + Math.sin(this.facing) * len };
  }

  equip(id: WeaponId): WeaponState {
    let w = this.weapons.get(id);
    if (!w) {
      w = new WeaponState(WEAPONS[id]);
      this.weapons.set(id, w);
    }
    if (this.weapon && this.weapon !== w) this.weapon.reloadLeft = 0;
    this.weapon = w;
    if (this.gunGfx) this.drawGun();
    return w;
  }

  update(dt: number, input: PlayerInput, solid: (tx: number, ty: number) => boolean): StepEvent | null {
    this.time += dt;
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    const len = Math.hypot(input.moveX, input.moveY);
    const wantsToMove = len > 0;
    const speed = (wantsToMove && input.sprint ? MOVE.sprint : MOVE.walk) * (input.pace ?? 1);
    const tvx = wantsToMove ? (input.moveX / len) * speed : 0;
    const tvy = wantsToMove ? (input.moveY / len) * speed : 0;
    const k = 1 - Math.exp(-(wantsToMove ? ACCEL : DECEL) * dt);
    this.vx += (tvx - this.vx) * k;
    this.vy += (tvy - this.vy) * k;
    if (!wantsToMove && Math.hypot(this.vx, this.vy) < 4) this.vx = this.vy = 0;

    if (this.vx !== 0 || this.vy !== 0) {
      const p = moveCircle(this.x, this.y, this.vx * dt, this.vy * dt, MOVE.radius, TILE, solid);
      // Lose the velocity a wall absorbed, so the operator doesn't "push" against it.
      if (dt > 0) {
        this.vx = (p.x - this.x) / dt;
        this.vy = (p.y - this.y) / dt;
      }
      this.x = p.x;
      this.y = p.y;
    }
    const actual = Math.hypot(this.vx, this.vy);
    this.moving = actual > 20;
    this.sprinting = this.moving && input.sprint && actual > MOVE.walk * 1.1;

    // Aim eases towards the cursor; heavier guns are capped to a slower swing.
    const before = this.facing;
    const diff = wrapAngle(input.aimAt - this.facing);
    const maxStep = this.weapon.def.turnRate * DEG * dt;
    this.facing = wrapAngle(this.facing + Phaser.Math.Clamp(diff * (1 - Math.exp(-TURN_EASE * dt)), -maxStep, maxStep));
    const angularSpeed = Math.abs(wrapAngle(this.facing - before)) / Math.max(dt, 1e-4);
    const turnShake = Math.min(0.3, (angularSpeed / (this.weapon.def.turnRate * DEG)) * 0.3);

    const target = Math.max(this.sprinting ? 1 : this.moving ? 0.35 : 0, turnShake);
    const rate = target > this.instability ? 5 : 3;
    this.instability += (target - this.instability) * Math.min(1, rate * dt);

    this.gunKick *= Math.exp(-18 * dt);
    this.gunGfx.x = -this.gunKick * 4;

    this.weapon.update(dt);
    this.container.setPosition(this.x, this.y);
    this.container.rotation = this.facing;

    if (!wantsToMove || !this.moving) {
      this.stepTimer = 0;
      return null;
    }
    this.stepTimer -= dt;
    if (this.stepTimer <= 0) {
      this.stepTimer = this.sprinting ? MOVE.stepSprint : MOVE.stepWalk;
      return { loud: this.sprinting };
    }
    return null;
  }

  /** Recoil: unsettles the aim and knocks the gun back a little. */
  kick(amount: number): void {
    this.instability = Math.min(1.2, this.instability + amount);
    this.gunKick = 1;
  }

  private drawGun(): void {
    const g = this.gunGfx;
    const id = this.weapon.def.id;
    const len = GUN_LENGTH[id];
    const w = id === 'pistol' ? 3.5 : id === 'smg' ? 4.5 : 5;
    g.clear();
    // Arms from the shoulders to the grip.
    g.lineStyle(4.5, 0x1e40af, 1);
    g.lineBetween(0, -8.5, 10, -1.5);
    g.lineBetween(0, 8.5, 7, 1.8);
    // The gun, with a lit top edge.
    g.fillStyle(0x3a4048, 1);
    g.fillRect(6, -w / 2, len - 6, w);
    g.fillStyle(0x8b95a3, 1);
    g.fillRect(6, -w / 2, len - 6, 1);
    if (id !== 'pistol') {
      g.fillStyle(0x3a4048, 1);
      g.fillRect(9, w / 2 - 0.5, 3, 3.5);
    }
    // Gloved hands.
    g.fillStyle(0x27272a, 1);
    g.fillCircle(10, -1.5, 2.3);
    g.fillCircle(7, 1.8, 2.3);
  }
}
