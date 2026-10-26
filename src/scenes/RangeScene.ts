import Phaser from 'phaser';
import { COLORS, FONT, MOVE, NOISE, REACH, TILE, VISION } from '../config';
import { circleIntersectsRect, DEG, pointInPolygon, type Segment } from '../core/geometry';
import { blocksMovement, blocksSight, parseLevel, type ParsedLevel, type TileKind } from '../core/grid';
import { buildWallSegments, castRay, visibilityPolygon, type RayHit } from '../core/visibility';
import { KILLHOUSE_ROLL, RANGE_LABELS, RANGE_MAP, stationAt, type StationDef } from '../levels/range';
import { sfx } from '../game/audio';
import { Door, type DoorAction } from '../game/Door';
import { DoorMenu } from '../game/DoorMenu';
import { Fog } from '../game/Fog';
import { NoiseSystem } from '../game/Noise';
import { Player } from '../game/Player';
import { RangeStations, type ChecklistItem } from '../game/RangeStations';
import { Target, type TargetKind } from '../game/Target';
import type { WeaponId } from '../game/weapons';

const DEPTH = { world: 0, decals: 1, doors: 4, targets: 5, player: 6, glow: 7, fog: 10, ripples: 20, laser: 21, menu: 30 };
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
interface Impact { x: number; y: number; age: number }
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
  private menu!: DoorMenu;
  private stations!: RangeStations;
  private laserGfx!: Phaser.GameObjects.Graphics;
  private decalGfx!: Phaser.GameObjects.Graphics;
  private keys!: Keys;

  private visionPolys: number[][] = [];
  private tracers: Tracer[] = [];
  private impacts: Impact[] = [];
  private muzzleFlash = 0;
  private triggerPressed = false;
  private suppressUntilRelease = false;
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
    this.impacts = [];
    this.muzzleFlash = 0;
    this.triggerPressed = false;
    this.suppressUntilRelease = false;
    this.lastStation = undefined;
    this.announced = false;
    this.stats = { shots: 0, hits: 0 };
    this.debrief = null;
  }

  create(): void {
    this.level = parseLevel(RANGE_MAP);
    const { width, height } = this.level;
    this.cameras.main.setBackgroundColor(COLORS.void);
    this.drawStaticWorld();
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
    this.decalGfx = this.add.graphics().setDepth(DEPTH.decals);
    this.menu = new DoorMenu(this, DEPTH.menu);
    this.stations = new RangeStations(this.targets);

    // Unbounded on purpose: the operator stays centred even at the map edge (beyond it is just dark).
    this.cameras.main.startFollow(this.player.displayObject, true, 0.12, 0.12);

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
    if (this.menu.door && Phaser.Math.Distance.Between(p.x, p.y, this.menu.door.cx, this.menu.door.cy) > REACH + 24) this.menu.close();
    this.menu.setHover(this.menu.optionAt(wp.x, wp.y));

    this.updateVision(ptx, pty);

    for (const t of this.targets) {
      if (t.update(dt, this.canSee(t.x, t.y), p.x, p.y)) this.worldNoise(t.x, t.y, RAIL_NOISE);
    }

    // Shooting: semi-auto fires per click, automatics while held.
    if (!pointer.leftButtonDown()) this.suppressUntilRelease = false;
    if (active && !this.menu.isOpen && !this.suppressUntilRelease) {
      if (this.triggerPressed || (pointer.leftButtonDown() && p.weapon.def.auto)) this.tryFire(this.triggerPressed);
    }
    this.triggerPressed = false;

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

  private drawStaticWorld(): void {
    const { width, height } = this.level;
    const g = this.make.graphics({}, false);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const kind = this.tileAt(x, y);
        const px = x * TILE, py = y * TILE;
        const dark = this.isDark(x, y);
        g.fillStyle(dark ? COLORS.floorDark : COLORS.floor, 1);
        g.fillRect(px, py, TILE, TILE);
        g.lineStyle(1, dark ? COLORS.floorDarkLine : COLORS.floorLine, 1);
        g.strokeRect(px + 0.5, py + 0.5, TILE, TILE);
        if (kind === 'wall' || kind === 'plywood') {
          g.fillStyle(kind === 'wall' ? COLORS.wall : COLORS.plywood, 1);
          g.fillRect(px, py, TILE, TILE);
        } else if (kind === 'barrier') {
          g.fillStyle(COLORS.barrier, 1);
          g.fillRect(px + 6, py, TILE - 12, TILE);
          g.fillStyle(COLORS.barrierStripe, 0.8);
          g.fillRect(px + 14, py + 4, 4, TILE - 8);
        } else if (kind === 'furniture') {
          g.fillStyle(COLORS.furniture, 1);
          g.fillRect(px + 1, py + 1, TILE - 2, TILE - 2);
          g.lineStyle(1.5, COLORS.furnitureEdge, 1);
          g.strokeRect(px + 2, py + 2, TILE - 4, TILE - 4);
        }
      }
    }

    // Blueprint-style edges where walls meet open floor.
    const edge = (kind: TileKind) => (kind === 'wall' ? COLORS.wallEdge : COLORS.plywoodEdge);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const kind = this.tileAt(x, y);
        if (!blocksSight(kind)) continue;
        g.lineStyle(2, edge(kind), 1);
        const px = x * TILE, py = y * TILE;
        if (!blocksSight(this.tileAt(x, y - 1))) g.lineBetween(px, py + 1, px + TILE, py + 1);
        if (!blocksSight(this.tileAt(x, y + 1))) g.lineBetween(px, py + TILE - 1, px + TILE, py + TILE - 1);
        if (!blocksSight(this.tileAt(x - 1, y))) g.lineBetween(px + 1, py, px + 1, py + TILE);
        if (!blocksSight(this.tileAt(x + 1, y))) g.lineBetween(px + TILE - 1, py, px + TILE - 1, py + TILE);
      }
    }

    // Rail for the moving target.
    for (const m of this.level.markers.filter((mk) => mk.kind === 'mover')) {
      const y = (m.ty + 0.5) * TILE;
      g.lineStyle(2, 0x4b4036, 1);
      g.lineBetween((m.tx + 0.2) * TILE, y, (m.tx + 7.8) * TILE, y);
    }

    const rt = this.add.renderTexture(0, 0, width * TILE, height * TILE).setOrigin(0).setDepth(DEPTH.world);
    rt.draw(g);
    g.destroy();

    for (const l of RANGE_LABELS) {
      const t = this.make.text({
        x: l.tx * TILE, y: l.ty * TILE, text: l.text,
        style: { fontFamily: FONT, fontSize: `${l.size ?? 16}px`, fontStyle: 'bold', color: '#e8d6b3' },
      }, false).setAlpha(0.22);
      rt.draw(t);
      t.destroy();
    }
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

    const warmth = this.isDark(ptx, pty) && p.flashlight ? 0.09 : 0.045;
    this.fog.update(this.visionPolys, wallTiles, warmth);
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
      const shot = this.traceShot(a, w.def.range);
      if (shot.target) {
        this.onTargetHit(shot.target);
        landed = true;
      } else if (shot.dist < w.def.range) {
        this.impacts.push({ x: shot.x, y: shot.y, age: 0 });
        if (this.impacts.length > 80) this.impacts.shift();
      }
      this.tracers.push({ x0: muzzle.x, y0: muzzle.y, x1: shot.x, y1: shot.y, age: 0 });
    }
    if (landed) this.stats.hits++;
    p.kick(w.def.recoil);
    this.muzzleFlash = 0.05;
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
      g.lineStyle(5, COLORS.laser, 0.1 * alpha);
      g.lineBetween(sx, sy, aim.x, aim.y);
      g.lineStyle(1.5, COLORS.laser, 0.85 * alpha);
      g.lineBetween(sx, sy, aim.x, aim.y);
      g.fillStyle(COLORS.laser, alpha);
      g.fillCircle(aim.x, aim.y, 2.5);
    }

    if (this.muzzleFlash > 0) {
      this.muzzleFlash -= dt;
      const m = p.muzzle;
      g.fillStyle(0xffe08a, 0.9);
      g.fillCircle(m.x + Math.cos(p.facing) * 4, m.y + Math.sin(p.facing) * 4, 6);
    }
    this.tracers = this.tracers.filter((t) => (t.age += dt) < 0.07);
    for (const t of this.tracers) {
      g.lineStyle(2, 0xfff1b8, 0.8 * (1 - t.age / 0.07));
      g.lineBetween(t.x0, t.y0, t.x1, t.y1);
    }

    const d = this.decalGfx;
    d.clear();
    this.impacts = this.impacts.filter((i) => (i.age += dt) < 8);
    for (const i of this.impacts) {
      d.fillStyle(0x0f0f0f, 0.7 * (1 - i.age / 8));
      d.fillCircle(i.x, i.y, 2.5);
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

  private doorAction(door: Door, action: DoorAction): void {
    const p = this.player;
    if (action === 'close' && circleIntersectsRect(p.x, p.y, MOVE.radius + 1, { x: door.tx * TILE, y: door.ty * TILE, w: TILE, h: TILE })) {
      this.toast('Step out of the doorway first');
      return;
    }
    const radius = door.act(action, p.x, p.y);
    this.noise.emit({ x: door.cx, y: door.cy, radius, source: 'player' }, p.x, p.y);
    if (action === 'kick') {
      sfx.kick();
      this.cameras.main.shake(120, 0.004);
      // Anyone right behind a kicked door is stunned.
      const far = door.farSide();
      for (const t of this.targets) {
        if (Phaser.Math.Distance.Between(t.x, t.y, far.x, far.y) < TILE * 1.4) t.stun();
      }
    } else {
      sfx.creak({ vol: action === 'peek' ? 0.6 : 1 });
    }
    this.stations.onDoor(stationAt(door.tx, door.ty)?.id, action);
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
        if (door) this.menu.open(door, wp.x, wp.y);
        else if (under) this.toast('Get closer to the door');
        else this.menu.close();
        return;
      }

      if (this.menu.isOpen) {
        const action = this.menu.optionFor(this.menu.optionAt(wp.x, wp.y));
        if (action && this.menu.door) this.doorAction(this.menu.door, action);
        this.menu.close();
        this.suppressUntilRelease = true;
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
      if (digit && this.menu.isOpen) {
        const action = this.menu.optionFor(Number(digit[1]) - 1);
        if (action && this.menu.door) this.doorAction(this.menu.door, action);
        this.menu.close();
        return;
      }
      if (digit) {
        this.switchWeapon((['pistol', 'smg', 'shotgun', 'rifle'] as WeaponId[])[Number(digit[1]) - 1]);
        return;
      }
      switch (e.code) {
        case 'KeyE': {
          const d = this.nearestDoor();
          if (d) this.doorAction(d, d.state === 'open' ? 'close' : 'slow');
          break;
        }
        case 'KeyR':
          this.reload();
          break;
        case 'KeyF':
          this.player.flashlight = !this.player.flashlight;
          sfx.toggle();
          break;
        case 'Escape':
          this.menu.close();
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
    this.menu.close();
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
