import Phaser from 'phaser';
import { COLORS, MOVE, NOISE, REACH, RENDER_SCALE, TILE, VISION } from '../config';
import { circleIntersectsRect, DEG, pointInPolygon, type Segment } from '../core/geometry';
import { blocksMovement, blocksSight, parseLevel, type ParsedLevel, type TileKind } from '../core/grid';
import { buildWallSegments, castRay, visibilityPolygon, type RayHit } from '../core/visibility';
import { KILLHOUSE_ROLL, RANGE_LABELS, RANGE_MAP, stationAt, type StationDef } from '../levels/range';
import { sfx } from '../game/audio';
import { Door } from '../game/Door';
import { Effects } from '../game/Effects';
import { Fog } from '../game/Fog';
import { drawLevelArt } from '../game/LevelArt';
import { NoiseSystem } from '../game/Noise';
import { Player } from '../game/Player';
import { RangeStations, type ChecklistItem } from '../game/RangeStations';
import { Target, type TargetKind } from '../game/Target';
import type { WeaponId } from '../game/weapons';

const DEPTH = { world: 0, decals: 1, doors: 4, targets: 5, player: 6, glow: 7, fog: 10, light: 12, ripples: 20, laser: 21 };
const RAIL_NOISE = 250;
const CAMERA_LOOKAHEAD = 70;

export interface Debrief {
  shots: number;
  hits: number;
  civiliansHit: number;
  /** Completed, no civilian hit, no damage taken. */
  stars: [boolean, boolean, boolean];
}

export interface HudState {
  station: StationDef | undefined;
  checklist: ChecklistItem[];
  weapon: { name: string; mag: number; magSize: number; reserve: number; reload: number | null };
  flashlight: boolean;
  dark: boolean;
  debrief: Debrief | null;
}

interface Tracer { x0: number; y0: number; x1: number; y1: number; age: number }
type Keys = Record<'W' | 'A' | 'S' | 'D' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'SHIFT', Phaser.Input.Keyboard.Key>;

/**
 * The Range: prototype milestone 1. Movement, vision cone and fog, laser aim, doors and
 * cardboard targets, wrapped in the academy's training stations.
 */
export class RangeScene extends Phaser.Scene {
  hud!: HudState;

  private level!: ParsedLevel;
  private staticSegs: Segment[] = [];
  private doors: Door[] = [];
  private doorAt = new Map<number, Door>();
  private targets: Target[] = [];
  private player!: Player;
  private fog!: Fog;
  private noise!: NoiseSystem;
  private stations!: RangeStations;
  private laserGfx!: Phaser.GameObjects.Graphics;
  private effects!: Effects;
  private keys!: Keys;

  private visionPolys: number[][] = [];
  private tracers: Tracer[] = [];
  private muzzleFlash = 0;
  private triggerPressed = false;
  private lookX = 0;
  private lookY = 0;
  private lastStation: StationDef | undefined;
  private announced = false;
  private stats = { shots: 0, hits: 0 };
  private debrief: Debrief | null = null;

  constructor() {
    super('range');
  }

  init(): void {
    this.doors = [];
    this.doorAt.clear();
    this.targets = [];
    this.tracers = [];
    this.muzzleFlash = 0;
    this.triggerPressed = false;
    this.lastStation = undefined;
    this.announced = false;
    this.stats = { shots: 0, hits: 0 };
    this.debrief = null;
  }

  create(): void {
    this.level = parseLevel(RANGE_MAP);
    const { width, height } = this.level;
    this.cameras.main.setBackgroundColor(COLORS.void);
    const rails = this.level.markers.filter((m) => m.kind === 'mover')
      .map((m) => ({ x0: (m.tx + 0.3) * TILE, x1: (m.tx + 7.7) * TILE, y: (m.ty + 0.5) * TILE }));
    drawLevelArt(this, this.level, RANGE_LABELS, rails, DEPTH.world, RENDER_SCALE);
    this.staticSegs = buildWallSegments(width, height, TILE, (x, y) => blocksSight(this.tileAt(x, y)));

    for (const spec of this.level.doors) {
      const door = new Door(this, spec, DEPTH.doors);
      this.doors.push(door);
      this.doorAt.set(spec.ty * width + spec.tx, door);
    }
    this.spawnTargets();

    const start = this.level.markers.find((m) => m.kind === 'player')!;
    this.player = new Player(this, (start.tx + 0.5) * TILE, (start.ty + 0.5) * TILE, DEPTH.player);
    this.fog = new Fog(this, width * TILE, height * TILE, DEPTH.glow, DEPTH.fog);
    this.noise = new NoiseSystem(this, DEPTH.ripples);
    this.laserGfx = this.add.graphics().setDepth(DEPTH.laser);
    this.effects = new Effects(this, width * TILE, height * TILE, RENDER_SCALE, DEPTH.decals, DEPTH.light);
    this.stations = new RangeStations(this.targets);

    // Unbounded on purpose: the operator stays centred even at the map edge (beyond it is just dark).
    this.cameras.main.setZoom(RENDER_SCALE).startFollow(this.player.displayObject, false, 0.1, 0.1);

    this.setupInput();
    if (!this.scene.isActive('hud')) this.scene.launch('hud');
    this.updateHud();
  }

  update(_time: number, deltaMs: number): void {
    const dt = Math.min(deltaMs, 50) / 1000;
    const active = this.registry.get('started') === true && !this.debrief;
    const p = this.player;
    const k = this.keys;

    if (active && !this.announced) {
      this.announced = true;
      this.toast("Range control: the range is hot. You're cleared to enter.");
    }

    // Movement and aim.
    let mx = 0, my = 0;
    if (active) {
      if (k.A.isDown || k.LEFT.isDown) mx -= 1;
      if (k.D.isDown || k.RIGHT.isDown) mx += 1;
      if (k.W.isDown || k.UP.isDown) my -= 1;
      if (k.S.isDown || k.DOWN.isDown) my += 1;
    }
    const pointer = this.input.activePointer;
    const wp = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const aimAt = active ? Math.atan2(wp.y - p.y, wp.x - p.x) : p.facing;
    const step = p.update(dt, { moveX: mx, moveY: my, sprint: active && k.SHIFT.isDown, aimAt }, this.solid);
    const ptx = Math.floor(p.x / TILE), pty = Math.floor(p.y / TILE);
    if (step) {
      sfx.footstep(step.loud);
      if (step.loud) this.noise.emit({ x: p.x, y: p.y, radius: NOISE.sprintStep, source: 'player' }, p.x, p.y);
    }
    if (p.sprinting) this.stations.onSprint(dt, ptx, pty);

    for (const d of this.doors) d.update(dt);

    this.updateVision(ptx, pty);

    for (const t of this.targets) {
      if (t.update(dt, this.canSee(t.x, t.y), p.x, p.y)) this.worldNoise(t.x, t.y, RAIL_NOISE);
    }

    // Shooting: semi-auto fires per click, automatics while held.
    if (active) {
      if (this.triggerPressed || (pointer.leftButtonDown() && p.weapon.def.auto)) this.tryFire(this.triggerPressed);
    }
    this.triggerPressed = false;

    this.effects.update(dt, this.solid);
    this.drawLaserAndFx(dt);
    this.noise.update(dt);

    // Camera looks a little ahead of where the operator is aiming.
    this.lookX += (Math.cos(p.facing) * CAMERA_LOOKAHEAD - this.lookX) * Math.min(1, dt * 4);
    this.lookY += (Math.sin(p.facing) * CAMERA_LOOKAHEAD - this.lookY) * Math.min(1, dt * 4);
    this.cameras.main.setFollowOffset(-this.lookX, -this.lookY);

    // Stations.
    const station = stationAt(ptx, pty);
    if (station && station !== this.lastStation) {
      if (this.lastStation && p.weapon.reserve < p.weapon.def.magSize * p.weapon.def.spareMags) {
        p.weapon.refill();
        this.toast('Ammo restocked');
      }
      this.lastStation = station;
    }
    if (active) {
      for (const s of this.stations.update(ptx, pty)) {
        sfx.ok();
        this.toast(`${s.name} complete`);
      }
      if (this.stations.allDone) this.finish();
    }

    this.updateHud();
  }

  // ---------------------------------------------------------------- world

  private tileAt(tx: number, ty: number): TileKind {
    const { width, height, tiles } = this.level;
    if (tx < 0 || ty < 0 || tx >= width || ty >= height) return 'wall';
    return tiles[ty * width + tx];
  }

  private solid = (tx: number, ty: number): boolean => {
    if (blocksMovement(this.tileAt(tx, ty))) return true;
    const door = this.doorAt.get(ty * this.level.width + tx);
    return door ? door.blocksMovement : false;
  };

  private isDark(tx: number, ty: number): boolean {
    return this.level.dark[ty * this.level.width + tx] ?? false;
  }

  private spawnTargets(): void {
    const slots: { x: number; y: number }[] = [];
    for (const m of this.level.markers) {
      const x = (m.tx + 0.5) * TILE;
      const y = (m.ty + 0.5) * TILE;
      const station = stationAt(m.tx, m.ty)?.id ?? 'killhouse';
      if (m.kind === 'suspect' || m.kind === 'civilian') {
        const lane = station === 'targets';
        this.addTarget(m.kind, x, y, station, !lane, lane ? 1.6 : 0);
      } else if (m.kind === 'random') {
        slots.push({ x, y });
      } else if (m.kind === 'mover') {
        this.targets.push(new Target(this, {
          kind: 'suspect', x, y, station, popup: false, respawn: 0,
          rail: { x0: x, x1: x + 7 * TILE, speed: 36 },
        }, DEPTH.targets));
      }
    }

    // The kill house layout is fixed; who is in it is rolled on every run.
    Phaser.Utils.Array.Shuffle(slots);
    const r = KILLHOUSE_ROLL;
    const nS = Phaser.Math.Between(r.minSuspects, r.maxSuspects);
    const nC = Phaser.Math.Between(r.minCivilians, r.maxCivilians);
    slots.forEach((s, i) => {
      if (i < nS) this.addTarget('suspect', s.x, s.y, 'killhouse', true, 0);
      else if (i < nS + nC) this.addTarget('civilian', s.x, s.y, 'killhouse', true, 0);
    });
  }

  private addTarget(kind: TargetKind, x: number, y: number, station: StationDef['id'], popup: boolean, respawn: number): void {
    this.targets.push(new Target(this, { kind, x, y, station, popup, respawn }, DEPTH.targets));
  }

  // ---------------------------------------------------------------- vision

  private segments(): Segment[] {
    return this.staticSegs.concat(this.doors.map((d) => d.segment()));
  }

  private updateVision(ptx: number, pty: number): void {
    const p = this.player;
    const segs = this.segments();
    const range = this.isDark(ptx, pty)
      ? (p.flashlight ? VISION.rangeDarkFlashlight : VISION.rangeDarkNoLight)
      : VISION.rangeLit;
    const cone = visibilityPolygon(p.x, p.y, p.facing, VISION.halfFov, range, segs, VISION.sweepStep);
    const peri = visibilityPolygon(p.x, p.y, 0, Math.PI, VISION.peripheral, segs, 8 * DEG);
    this.visionPolys = [cone.polygon, peri.polygon];

    // Walls the rays struck get remembered too, otherwise rooms would have no outline.
    const seen = new Set<number>();
    const wallTiles: { tx: number; ty: number }[] = [];
    const markTile = (tx: number, ty: number) => {
      const key = ty * this.level.width + tx;
      if (seen.has(key) || !blocksSight(this.tileAt(tx, ty))) return;
      seen.add(key);
      wallTiles.push({ tx, ty });
    };
    const mark = (hits: RayHit[]) => {
      for (let i = 0; i < hits.length; i++) {
        const a = hits[i];
        if (!a.blocked) continue;
        markTile(Math.floor((a.x + a.dx * 2) / TILE), Math.floor((a.y + a.dy * 2) / TILE));
        // At grazing angles neighbouring rays land far apart on the same wall face; the face
        // between them is visible too, so fill it in.
        const b = hits[i + 1];
        if (!b?.blocked) continue;
        if (Math.abs(a.y - b.y) < 0.01 && Math.abs(a.y / TILE - Math.round(a.y / TILE)) < 0.001) {
          const ty = Math.round(a.y / TILE) - (a.dy < 0 ? 1 : 0);
          for (let tx = Math.floor(Math.min(a.x, b.x) / TILE); tx <= Math.floor(Math.max(a.x, b.x) / TILE); tx++) markTile(tx, ty);
        } else if (Math.abs(a.x - b.x) < 0.01 && Math.abs(a.x / TILE - Math.round(a.x / TILE)) < 0.001) {
          const tx = Math.round(a.x / TILE) - (a.dx < 0 ? 1 : 0);
          for (let ty = Math.floor(Math.min(a.y, b.y) / TILE); ty <= Math.floor(Math.max(a.y, b.y) / TILE); ty++) markTile(tx, ty);
        }
      }
    };
    mark(cone.hits);
    mark(peri.hits);

    const dark = this.isDark(ptx, pty);
    this.fog.update(this.visionPolys, wallTiles, {
      x: p.x,
      y: p.y,
      range,
      falloff: dark ? VISION.falloffDark : VISION.falloffLit,
      warmth: dark && p.flashlight ? 0.08 : 0.035,
    });
  }

  /** True if the operator can currently see any part of something at (x, y). */
  private canSee(x: number, y: number): boolean {
    const r = 7;
    const pts = [[x, y], [x + r, y], [x - r, y], [x, y + r], [x, y - r]];
    return this.visionPolys.some((poly) => pts.some(([px, py]) => pointInPolygon(px, py, poly)));
  }

  // ---------------------------------------------------------------- combat

  private traceShot(angle: number, range: number): { x: number; y: number; dist: number; target?: Target } {
    const p = this.player;
    const dx = Math.cos(angle), dy = Math.sin(angle);
    let dist = castRay(p.x, p.y, dx, dy, range, this.segments());
    let target: Target | undefined;
    for (const t of this.targets) {
      const d = t.hitTest(p.x, p.y, dx, dy);
      if (d < dist) {
        dist = d;
        target = t;
      }
    }
    return { x: p.x + dx * dist, y: p.y + dy * dist, dist, target };
  }

  private tryFire(pressed: boolean): void {
    const p = this.player;
    const w = p.weapon;
    if (w.reloading) return;
    if (w.mag <= 0) {
      if (!pressed) return;
      sfx.dryFire();
      if (!this.reload()) this.toast('Out of ammo');
      return;
    }
    if (!w.canFire()) return;

    w.fire();
    this.stats.shots++;
    const base = p.aimAngle;
    const muzzle = p.muzzle;
    let landed = false;
    for (let i = 0; i < w.def.pellets; i++) {
      const a = base + (w.def.pellets > 1 ? Phaser.Math.FloatBetween(-1, 1) * w.def.spread * DEG : 0);
      const dx = Math.cos(a), dy = Math.sin(a);
      const shot = this.traceShot(a, w.def.range);
      if (shot.target) {
        this.effects.targetHit(shot.x, shot.y, dx, dy);
        this.onTargetHit(shot.target);
        landed = true;
      } else if (shot.dist < w.def.range) {
        this.effects.bulletHole(shot.x, shot.y, dx, dy);
      }
      this.tracers.push({ x0: muzzle.x, y0: muzzle.y, x1: shot.x, y1: shot.y, age: 0 });
    }
    if (landed) this.stats.hits++;
    p.kick(w.def.recoil);
    this.muzzleFlash = 0.05;
    this.effects.muzzle(muzzle.x, muzzle.y, w.def.id !== 'pistol');
    this.effects.casing(p.x, p.y, p.facing, w.def.id === 'shotgun');
    sfx.shot(w.def.id !== 'pistol');
    this.noise.emit({ x: p.x, y: p.y, radius: w.def.noise, source: 'player' }, p.x, p.y);
  }

  private onTargetHit(t: Target): void {
    if (t.state !== 'up') return;
    t.hit();
    this.stations.onTargetHit(t);
    if (t.kind === 'civilian') {
      sfx.penalty();
      this.toast('Civilian hit. That costs you a star.');
    } else {
      sfx.hit();
    }
  }

  private reload(): boolean {
    const w = this.player.weapon;
    if (w.reserve <= 0 && w.mag < w.def.magSize && !w.reloading) {
      this.toast('No spare magazines');
      return false;
    }
    if (!w.startReload()) return false;
    sfx.reload();
    this.noise.emit({ x: this.player.x, y: this.player.y, radius: NOISE.reload, source: 'player' }, this.player.x, this.player.y);
    return true;
  }

  private drawLaserAndFx(dt: number): void {
    const p = this.player;
    const g = this.laserGfx;
    g.clear();

    const aim = this.traceShot(p.aimAngle, p.weapon.def.range);
    const muzzleLen = Math.hypot(p.muzzle.x - p.x, p.muzzle.y - p.y);
    if (aim.dist > muzzleLen) {
      const dx = Math.cos(p.aimAngle), dy = Math.sin(p.aimAngle);
      const sx = p.x + dx * muzzleLen, sy = p.y + dy * muzzleLen;
      const alpha = p.weapon.reloading ? 0.3 : 1;
      g.lineStyle(4, COLORS.laser, 0.07 * alpha);
      g.lineBetween(sx, sy, aim.x, aim.y);
      g.lineStyle(1.1, COLORS.laser, 0.8 * alpha);
      g.lineBetween(sx, sy, aim.x, aim.y);
      g.fillStyle(COLORS.laser, 0.25 * alpha);
      g.fillCircle(aim.x, aim.y, 4.5);
      g.fillStyle(0xffd0d0, alpha);
      g.fillCircle(aim.x, aim.y, 1.6);
    }

    if (this.muzzleFlash > 0) {
      this.muzzleFlash -= dt;
      const m = p.muzzle;
      const fx = Math.cos(p.facing), fy = Math.sin(p.facing);
      g.fillStyle(0xffe6a8, 0.95);
      g.fillTriangle(m.x - fy * 3, m.y + fx * 3, m.x + fy * 3, m.y - fx * 3, m.x + fx * 14, m.y + fy * 14);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(m.x + fx * 2, m.y + fy * 2, 2.5);
    }
    this.tracers = this.tracers.filter((t) => (t.age += dt) < 0.06);
    for (const t of this.tracers) {
      g.lineStyle(1.2, 0xfff1b8, 0.6 * (1 - t.age / 0.06));
      g.lineBetween(t.x0, t.y0, t.x1, t.y1);
    }
  }

  // ---------------------------------------------------------------- doors

  private doorUnder(wx: number, wy: number): Door | undefined {
    return this.doorAt.get(Math.floor(wy / TILE) * this.level.width + Math.floor(wx / TILE));
  }

  private nearestDoor(): Door | undefined {
    const p = this.player;
    let best: Door | undefined;
    let bestD = REACH;
    for (const d of this.doors) {
      const dist = Phaser.Math.Distance.Between(p.x, p.y, d.cx, d.cy);
      if (dist <= bestD) {
        bestD = dist;
        best = d;
      }
    }
    return best;
  }

  private inReach(d: Door): boolean {
    return Phaser.Math.Distance.Between(this.player.x, this.player.y, d.cx, d.cy) <= REACH;
  }

  private toggleDoor(door: Door): void {
    const p = this.player;
    if (door.state === 'open' && circleIntersectsRect(p.x, p.y, MOVE.radius + 1, { x: door.tx * TILE, y: door.ty * TILE, w: TILE, h: TILE })) {
      this.toast('Step out of the doorway first');
      return;
    }
    const radius = door.toggle(p.x, p.y);
    this.noise.emit({ x: door.cx, y: door.cy, radius, source: 'player' }, p.x, p.y);
    sfx.creak();
  }

  // ---------------------------------------------------------------- input

  private setupInput(): void {
    const kb = this.input.keyboard!;
    this.keys = kb.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT') as Keys;
    this.input.mouse?.disableContextMenu();

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.registry.get('started') !== true || this.debrief) return;
      const wp = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;

      if (pointer.rightButtonDown()) {
        const under = this.doorUnder(wp.x, wp.y);
        const door = under && this.inReach(under) ? under : this.nearestDoor();
        if (door) this.toggleDoor(door);
        else if (under) this.toast('Get closer to the door');
        return;
      }
      this.triggerPressed = true;
    });

    kb.on('keydown', (e: KeyboardEvent) => {
      if (this.registry.get('started') !== true) return;
      if (this.debrief) {
        if (e.code === 'Enter') this.scene.restart();
        return;
      }
      const digit = /^Digit([1-4])$/.exec(e.code);
      if (digit) {
        this.switchWeapon((['pistol', 'smg', 'shotgun', 'rifle'] as WeaponId[])[Number(digit[1]) - 1]);
        return;
      }
      switch (e.code) {
        case 'KeyE': {
          const d = this.nearestDoor();
          if (d) this.toggleDoor(d);
          break;
        }
        case 'KeyR':
          this.reload();
          break;
        case 'KeyF':
          this.player.flashlight = !this.player.flashlight;
          sfx.toggle();
          break;
      }
    });
  }

  private switchWeapon(id: WeaponId): void {
    if (this.player.weapon.def.id === id) return;
    const w = this.player.equip(id);
    sfx.reload();
    this.toast(`${w.def.name} (Range only: every gun is on the rack for testing)`);
  }

  // ---------------------------------------------------------------- flow

  private worldNoise(x: number, y: number, radius: number): void {
    const p = this.player;
    this.noise.emit({ x, y, radius, source: 'world' }, p.x, p.y);
    const d = Phaser.Math.Distance.Between(x, y, p.x, p.y);
    if (d < radius) sfx.railTick({ pan: (x - p.x) / 400, vol: 1 - d / radius });
  }

  private finish(): void {
    if (this.debrief) return;
    const civiliansHit = this.targets.filter((t) => t.kind === 'civilian' && t.wasHit).length;
    this.debrief = {
      shots: this.stats.shots,
      hits: this.stats.hits,
      civiliansHit,
      stars: [true, civiliansHit === 0, true],
    };
    sfx.secured();
  }

  private toast(text: string): void {
    this.game.events.emit('toast', text);
  }

  private updateHud(): void {
    const p = this.player;
    const w = p.weapon;
    const ptx = Math.floor(p.x / TILE), pty = Math.floor(p.y / TILE);
    this.hud = {
      station: stationAt(ptx, pty),
      checklist: this.stations.checklist(),
      weapon: {
        name: w.def.name,
        mag: w.mag,
        magSize: w.def.magSize,
        reserve: w.reserve,
        reload: w.reloading ? 1 - w.reloadLeft / w.def.reloadTime : null,
      },
      flashlight: p.flashlight,
      dark: this.isDark(ptx, pty),
      debrief: this.debrief,
    };
  }
}
