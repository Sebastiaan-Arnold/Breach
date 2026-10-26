import Phaser from 'phaser';
import { TILE } from '../config';
import type { Segment } from '../core/geometry';
import { blocksMovement, blocksSight, isOutdoor, type ParsedLevel, type TileKind } from '../core/grid';
import { findPath, type TilePoint } from '../core/pathfinding';
import { buildWallSegments, castRay } from '../core/visibility';
import { Door } from './Door';

/**
 * The static and semi-static world everyone shares: the tile grid, doors and the line-of-sight
 * segments built from them. The operator, enemies and civilians all ask it about collision,
 * sight lines and paths.
 */
export class World {
  readonly width: number;
  readonly height: number;
  readonly doors: Door[] = [];
  private doorAt = new Map<number, Door>();
  private staticSegs: Segment[];
  private segs: Segment[] = [];

  constructor(scene: Phaser.Scene, readonly level: ParsedLevel, doorDepth: number) {
    this.width = level.width;
    this.height = level.height;
    this.staticSegs = buildWallSegments(level.width, level.height, TILE, (x, y) => blocksSight(this.tileAt(x, y)));
    for (const spec of level.doors) {
      const door = new Door(scene, spec, doorDepth);
      this.doors.push(door);
      this.doorAt.set(spec.ty * level.width + spec.tx, door);
    }
    this.refreshSegments();
  }

  /** Call once per frame after doors have moved. */
  update(dt: number): void {
    for (const d of this.doors) d.update(dt);
    this.refreshSegments();
  }

  tileAt(tx: number, ty: number): TileKind {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) return 'wall';
    return this.level.tiles[ty * this.width + tx];
  }

  isDark(tx: number, ty: number): boolean {
    return this.level.dark[ty * this.width + tx] ?? false;
  }

  isOutdoor(tx: number, ty: number): boolean {
    const i = ty * this.width + tx;
    return this.level.tiles[i] === 'floor' && isOutdoor(this.level.material[i]);
  }

  doorAtTile(tx: number, ty: number): Door | undefined {
    return this.doorAt.get(ty * this.width + tx);
  }

  /** For movement: walls, furniture and closed doors. */
  solid = (tx: number, ty: number): boolean => {
    if (blocksMovement(this.tileAt(tx, ty))) return true;
    return this.doorAtTile(tx, ty)?.blocksMovement ?? false;
  };

  /** Walls and door leaves as line segments, for vision and bullets. */
  segments(): Segment[] {
    return this.segs;
  }

  castRay(ox: number, oy: number, dx: number, dy: number, maxDist: number): number {
    return castRay(ox, oy, dx, dy, maxDist, this.segs);
  }

  /** True if nothing blocks a straight line between two points. */
  lineOfSight(ax: number, ay: number, bx: number, by: number): boolean {
    const d = Math.hypot(bx - ax, by - ay);
    if (d < 1) return true;
    return this.castRay(ax, ay, (bx - ax) / d, (by - ay) / d, d) >= d - 0.5;
  }

  /**
   * A walking route in world coordinates (tile centres). By default closed doors are fine, since
   * enemies open them; pass `closedDoors: false` for someone who won't.
   */
  findPath(fromX: number, fromY: number, toX: number, toY: number, closedDoors = true): { x: number; y: number }[] | null {
    const start: TilePoint = { tx: Math.floor(fromX / TILE), ty: Math.floor(fromY / TILE) };
    const goal: TilePoint = { tx: Math.floor(toX / TILE), ty: Math.floor(toY / TILE) };
    const path = findPath(
      this.width, this.height, start, goal,
      (x, y) => !blocksMovement(this.tileAt(x, y)) && (closedDoors || !this.doorAtTile(x, y)?.blocksMovement),
      (x, y) => (this.doorAtTile(x, y)?.blocksMovement ? 2 : 0),
    );
    return path?.map((p) => ({ x: (p.tx + 0.5) * TILE, y: (p.ty + 0.5) * TILE })) ?? null;
  }

  private refreshSegments(): void {
    this.segs = this.staticSegs.concat(this.doors.map((d) => d.segment()));
  }
}
