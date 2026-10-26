import Phaser from 'phaser';
import { COLORS, MOVE, TILE } from '../config';
import { DEG, rotateTowards, wrapAngle } from '../core/geometry';
import { moveCircle } from '../core/collision';
import { WEAPONS, WeaponState, type WeaponId } from './weapons';

export interface PlayerInput {
  moveX: number;
  moveY: number;
  sprint: boolean;
  /** World-space angle towards the cursor. */
  aimAt: number;
}

export interface StepEvent {
  loud: boolean;
}

export class Player {
  x: number;
  y: number;
  facing = 0;
  /** 0 = rock steady, 1 = all over the place. Drives the laser wobble. */
  instability = 0;
  sprinting = false;
  moving = false;
  flashlight = true;
  weapon: WeaponState;

  private weapons = new Map<WeaponId, WeaponState>();
  private container: Phaser.GameObjects.Container;
  private gunGfx: Phaser.GameObjects.Graphics;
  private stepTimer = 0;
  private time = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, depth: number) {
    this.x = x;
    this.y = y;
    this.weapon = this.equip('pistol');

    const body = scene.add.graphics();
    body.fillStyle(0x000000, 0.35);
    body.fillCircle(1.5, 2, MOVE.radius + 1);
    body.fillStyle(COLORS.player, 1);
    body.fillCircle(0, 0, MOVE.radius);
    body.lineStyle(2, COLORS.playerEdge, 1);
    body.strokeCircle(0, 0, MOVE.radius);
    body.fillStyle(COLORS.playerEdge, 1);
    body.fillTriangle(MOVE.radius - 1, -4, MOVE.radius - 1, 4, MOVE.radius + 4, 0);
    this.gunGfx = scene.add.graphics();
    this.container = scene.add.container(x, y, [this.gunGfx, body]).setDepth(depth);
    this.drawGun();
  }

  get displayObject(): Phaser.GameObjects.Container {
    return this.container;
  }

  /** The angle the laser (and every shot) actually points: facing plus wobble. */
  get aimAngle(): number {
    const t = this.time;
    const n = Math.sin(t * 6.1) * 0.55 + Math.sin(t * 10.7 + 1.3) * 0.3 + Math.sin(t * 17.3 + 2.1) * 0.15;
    return this.facing + this.instability * this.weapon.def.wobble * DEG * n;
  }

  get muzzle(): { x: number; y: number } {
    const len = this.weapon.def.id === 'rifle' || this.weapon.def.id === 'shotgun' ? 24 : 18;
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
    const len = Math.hypot(input.moveX, input.moveY);
    this.moving = len > 0;
    this.sprinting = this.moving && input.sprint;
    const speed = this.sprinting ? MOVE.sprint : MOVE.walk;
    if (this.moving) {
      const p = moveCircle(this.x, this.y, (input.moveX / len) * speed * dt, (input.moveY / len) * speed * dt, MOVE.radius, TILE, solid);
      this.x = p.x;
      this.y = p.y;
    }

    // Heavier guns swing round more slowly; fast turns also unsettle the aim.
    const before = this.facing;
    this.facing = wrapAngle(rotateTowards(this.facing, input.aimAt, this.weapon.def.turnRate * DEG * dt));
    const turnRate = Math.abs(wrapAngle(this.facing - before)) / Math.max(dt, 1e-4);
    const turnShake = Math.min(0.5, turnRate / (this.weapon.def.turnRate * DEG) * 0.5);

    const target = Math.max(this.sprinting ? 1 : this.moving ? 0.55 : 0.04, turnShake);
    const rate = target > this.instability ? 7 : 2.6;
    this.instability += (target - this.instability) * Math.min(1, rate * dt);

    this.weapon.update(dt);
    this.container.setPosition(this.x, this.y);
    this.container.rotation = this.facing;

    if (!this.moving) {
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

  kick(amount: number): void {
    this.instability = Math.min(1.4, this.instability + amount);
  }

  private drawGun(): void {
    const g = this.gunGfx;
    const id = this.weapon.def.id;
    const len = id === 'rifle' ? 24 : id === 'shotgun' ? 23 : id === 'smg' ? 19 : 17;
    const w = id === 'pistol' ? 4 : 5;
    g.clear();
    g.fillStyle(0x111827, 1);
    g.fillRect(4, -w / 2, len - 4, w);
    g.fillStyle(0x6b7280, 1);
    g.fillRect(len - 3, -w / 2, 3, w);
  }
}
