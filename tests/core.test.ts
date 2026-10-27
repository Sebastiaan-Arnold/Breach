import { describe, expect, it } from 'vitest';
import { DEG, pointInPolygon, rayCircle, raySegment, rotateTowards, wrapAngle } from '../src/core/geometry';
import { buildWallSegments, castRay, visibilityPolygon } from '../src/core/visibility';
import { parseLevel, blocksSight } from '../src/core/grid';
import { moveCircle } from '../src/core/collision';
import { findPath } from '../src/core/pathfinding';
import { rollSituation } from '../src/game/situation';
import { endCareer, isUnlocked, newProgress, recordSuccess, settleAbandonedMission, unlockedWeapons } from '../src/game/progress';
import { CAMPAIGNS, DIFFICULTY, SUPPRESSOR_RANK, type CampaignDef } from '../src/levels/campaigns';
import { WEAPONS } from '../src/game/weapons';
import { HARBOUR_LANE } from '../src/levels/harbour-lane';
import { KESTREL_ROAD } from '../src/levels/kestrel-road';
import { RANGE_MAP } from '../src/levels/range';
import { LEVELS } from '../src/levels';
import { propTiles } from '../src/levels/props';

describe('geometry', () => {
  it('wraps angles into [-PI, PI)', () => {
    expect(wrapAngle(Math.PI * 3)).toBeCloseTo(-Math.PI);
    expect(wrapAngle(-Math.PI / 2)).toBeCloseTo(-Math.PI / 2);
  });

  it('rotates the short way round', () => {
    const a = rotateTowards(170 * DEG, -170 * DEG, 5 * DEG);
    expect(wrapAngle(a)).toBeCloseTo(175 * DEG);
  });

  it('intersects rays with segments', () => {
    const seg = { ax: 10, ay: -5, bx: 10, by: 5 };
    expect(raySegment(0, 0, 1, 0, seg)).toBeCloseTo(10);
    expect(raySegment(0, 0, -1, 0, seg)).toBe(Infinity);
    expect(raySegment(0, 20, 1, 0, seg)).toBe(Infinity);
  });

  it('intersects rays with circles', () => {
    expect(rayCircle(0, 0, 1, 0, 10, 0, 2)).toBeCloseTo(8);
    expect(rayCircle(0, 0, 0, 1, 10, 0, 2)).toBe(Infinity);
    expect(rayCircle(10, 0, 1, 0, 10, 0, 2)).toBe(0);
  });

  it('tests points in polygons', () => {
    const sq = [0, 0, 10, 0, 10, 10, 0, 10];
    expect(pointInPolygon(5, 5, sq)).toBe(true);
    expect(pointInPolygon(15, 5, sq)).toBe(false);
  });
});

describe('visibility', () => {
  // 5x3 room with a pillar in the middle:
  //   #####
  //   #.#.#   <- (2,1) is the pillar
  //   #####
  const rows = ['#####', '#.#.#', '#####'];
  const level = parseLevel(rows);
  const blocks = (x: number, y: number) => blocksSight(level.tiles[y * level.width + x]);
  const segs = buildWallSegments(level.width, level.height, 32, blocks);

  it('merges wall edges into few segments', () => {
    // Two 1x1 cells: four edges each.
    expect(segs.length).toBe(8);
  });

  it('stops rays at walls', () => {
    // From the centre of cell (1,1) looking east, the pillar face is at x=64.
    expect(castRay(48, 48, 1, 0, 1000, segs)).toBeCloseTo(16);
  });

  it('keeps the cone inside the room', () => {
    const { polygon, hits } = visibilityPolygon(48, 48, 0, 50 * DEG, 500, segs, 2 * DEG);
    expect(polygon[0]).toBe(48);
    expect(hits.every((h) => h.blocked)).toBe(true);
    for (let i = 0; i < polygon.length; i += 2) {
      expect(polygon[i]).toBeGreaterThanOrEqual(32 - 1e-6);
      expect(polygon[i]).toBeLessThanOrEqual(64 + 1e-6);
    }
    expect(pointInPolygon(60, 48, polygon)).toBe(true);
    expect(pointInPolygon(112, 48, polygon)).toBe(false);
  });

  it('builds a full circle for peripheral vision', () => {
    const { polygon } = visibilityPolygon(48, 48, 0, Math.PI, 10, segs, 10 * DEG);
    expect(pointInPolygon(40, 48, polygon)).toBe(true);
    expect(pointInPolygon(56, 48, polygon)).toBe(true);
  });
});

describe('level parsing', () => {
  it('detects door orientation from the surrounding walls', () => {
    const lvl = parseLevel(['#####', '#.D.#', '##D##', '#...#', '#####']);
    expect(lvl.doors).toEqual([
      { tx: 2, ty: 1, orientation: 'v' },
      { tx: 2, ty: 2, orientation: 'h' },
    ]);
  });

  it('parses the Range', () => {
    const lvl = parseLevel(RANGE_MAP);
    expect(RANGE_MAP.every((r) => r.length === lvl.width)).toBe(true);
    expect(lvl.doors.length).toBeGreaterThan(5);
    // Kill house markers sit on dark floor.
    const mover = lvl.markers.find((m) => m.kind === 'mover')!;
    expect(lvl.dark[mover.ty * lvl.width + mover.tx]).toBe(true);
  });
});

describe('collision', () => {
  const solid = (tx: number, ty: number) => tx < 0 || ty < 0 || tx > 4 || ty > 4 || tx === 3;

  it('stops a circle at a wall', () => {
    const p = moveCircle(80, 80, 100, 0, 10, 32, solid);
    expect(p.x).toBeCloseTo(96 - 10);
    expect(p.y).toBeCloseTo(80);
  });

  it('slides along walls', () => {
    const p = moveCircle(80, 80, 20, 20, 10, 32, solid);
    expect(p.x).toBeCloseTo(86);
    expect(p.y).toBeCloseTo(100);
  });
});

describe('floor materials', () => {
  it('the middle of a block of stacked containers outdoors counts as outdoors', () => {
    const lvl = parseLevel(['#######', '#=====#', '#=TTT=#', '#=TTT=#', '#=TTT=#', '#=====#', '#######']);
    expect(lvl.material[3 * lvl.width + 3]).toBe('concrete');
  });

  it('parses materials and gives doors the indoor floor', () => {
    const lvl = parseLevel(['#####', '#="~#', '##D##', '#...#', '#####']);
    const m = (x: number, y: number) => lvl.material[y * lvl.width + x];
    expect([m(1, 1), m(2, 1), m(3, 1)]).toEqual(['concrete', 'grass', 'tile']);
    expect(m(2, 2)).toBe('wood');
    expect(lvl.tiles[2 * lvl.width + 2]).toBe('floor');
  });
});

describe('pathfinding', () => {
  // 0 = open, 1 = wall.
  const grid = [
    '00000',
    '01110',
    '00010',
    '11010',
    '00000',
  ];
  const open = (x: number, y: number) => grid[y]?.[x] === '0';

  it('finds a route around walls', () => {
    const path = findPath(5, 5, { tx: 0, ty: 2 }, { tx: 2, ty: 2 }, open)!;
    expect(path.at(-1)).toEqual({ tx: 2, ty: 2 });
    for (const p of path) expect(open(p.tx, p.ty)).toBe(true);
  });

  it('never cuts a wall corner diagonally', () => {
    const path = findPath(5, 5, { tx: 0, ty: 0 }, { tx: 4, ty: 4 }, open)!;
    let prev = { tx: 0, ty: 0 };
    for (const p of path) {
      if (p.tx !== prev.tx && p.ty !== prev.ty) {
        expect(open(p.tx, prev.ty) && open(prev.tx, p.ty)).toBe(true);
      }
      prev = p;
    }
  });

  it('returns null when the goal is unreachable', () => {
    expect(findPath(5, 5, { tx: 0, ty: 0 }, { tx: 2, ty: 1 }, open)).toBeNull();
  });
});

describe('situation roll', () => {
  const m = HARBOUR_LANE.mission!;
  const seq = (values: number[]) => { let i = 0; return () => values[i++ % values.length]; };

  it('keeps the hostile count within the briefed range and always includes the patroller', () => {
    for (let i = 0; i < 50; i++) {
      const s = rollSituation(m);
      expect(s.hostiles.length).toBeGreaterThanOrEqual(m.hostiles.min);
      expect(s.hostiles.length).toBeLessThanOrEqual(m.hostiles.max);
      expect(s.hostiles.some((h) => h.type === 'patroller')).toBe(true);
      expect(s.civilians.length).toBe(1);
    }
  });

  it("always includes a hostage's captor", () => {
    const k = KESTREL_ROAD.mission!;
    const captor = k.hostileSlots.find((h) => h.always)!;
    for (let i = 0; i < 50; i++) expect(rollSituation(k).hostiles).toContain(captor);
  });

  it('can exceed the range by one on unverified intel', () => {
    const s = rollSituation({ ...m, reliability: 'Unverified' }, seq([0.99, 0.1, 0.5]));
    expect(s.hostiles.length).toBe(m.hostiles.max + 1);
  });
});

describe('level data', () => {
  for (const def of LEVELS) {
    const lvl = parseLevel(def.map);
    const walkable = (tx: number, ty: number) => lvl.tiles[Math.floor(ty) * lvl.width + Math.floor(tx)] === 'floor';

    it(`${def.id}: rows are equal width and entries start on walkable floor`, () => {
      expect(def.map.every((r) => r.length === lvl.width)).toBe(true);
      for (const e of def.entries) for (const p of e.approach) expect(walkable(p.tx, p.ty)).toBe(true);
    });

    it(`${def.id}: intro walks stay clear of walls, doors and props`, () => {
      const blocked = new Set((def.props ?? []).flatMap(propTiles).map((t) => `${t.tx},${t.ty}`));
      const doors = new Set(lvl.doors.map((d) => `${d.tx},${d.ty}`));
      const clear = (x: number, y: number) => {
        const key = `${Math.floor(x)},${Math.floor(y)}`;
        return walkable(x, y) && !blocked.has(key) && !doors.has(key);
      };
      // The operator is about a third of a tile across: check the route and either side of it.
      const r = 0.3;
      for (const e of def.entries) {
        for (let i = 1; i < e.approach.length; i++) {
          const a = e.approach[i - 1], b = e.approach[i];
          const steps = Math.ceil(Math.hypot(b.tx - a.tx, b.ty - a.ty) * 8);
          for (let k = 0; k <= steps; k++) {
            const x = a.tx + ((b.tx - a.tx) * k) / steps, y = a.ty + ((b.ty - a.ty) * k) / steps;
            for (const [ox, oy] of [[0, 0], [r, r], [-r, r], [r, -r], [-r, -r]]) {
              expect(clear(x + ox, y + oy), `${e.id} at ${x.toFixed(1)},${y.toFixed(1)}`).toBe(true);
            }
          }
        }
      }
    });

    if (def.mission) {
      it(`${def.id}: every spawn slot and patrol point is on floor and reachable from each entry`, () => {
        const m = def.mission!;
        const points = [
          ...m.hostileSlots, ...m.civilianSlots, ...m.hostileSlots.flatMap((h) => h.route ?? []),
          ...(m.hostage ? [m.hostage] : []), ...(m.evidence ? [m.evidence] : []),
        ];
        const passable = (x: number, y: number) => lvl.tiles[y * lvl.width + x] === 'floor';
        for (const p of points) expect(walkable(p.tx, p.ty)).toBe(true);
        for (const e of def.entries) {
          const end = e.approach.at(-1)!;
          for (const p of points) {
            const path = findPath(lvl.width, lvl.height, { tx: Math.floor(end.tx), ty: Math.floor(end.ty) }, { tx: Math.floor(p.tx), ty: Math.floor(p.ty) }, passable);
            expect(path).not.toBeNull();
          }
        }
      });
    }
  }
});

describe('campaign progress', () => {
  const campaigns: CampaignDef[] = [
    { id: 'a', title: 'A', rank: 0, levels: ['a1'], promotion: { minStars: 1, note: [] } },
    { id: 'b', title: 'B', rank: 1, levels: ['b1', 'b2'], promotion: { minStars: 5, unlocks: 'rifle', note: [] } },
  ];

  it('unlocks levels in order and campaigns by rank', () => {
    const p = newProgress();
    expect(isUnlocked(p, 'a1', campaigns)).toBe(true);
    expect(isUnlocked(p, 'b1', campaigns)).toBe(false);
    expect(recordSuccess(p, 'a1', 2, campaigns)?.id).toBe('a');
    expect(p.rank).toBe(1);
    expect(isUnlocked(p, 'b1', campaigns)).toBe(true);
    expect(isUnlocked(p, 'b2', campaigns)).toBe(false);
  });

  it('promotes only with every level done and enough stars, and keeps best stars', () => {
    const p = { ...newProgress(), rank: 1 };
    expect(recordSuccess(p, 'b1', 3, campaigns)).toBeNull();
    expect(recordSuccess(p, 'b2', 1, campaigns)).toBeNull();
    expect(p.rank).toBe(1);
    expect(recordSuccess(p, 'b1', 1, campaigns)).toBeNull();
    expect(p.stars.b1).toBe(3);
    expect(recordSuccess(p, 'b2', 2, campaigns)?.id).toBe('b');
    expect(p.rank).toBe(2);
    expect(unlockedWeapons(p, campaigns)).toEqual(['pistol', 'rifle']);
  });

  it('every campaign level exists and promotion is reachable', () => {
    const ids = new Set(LEVELS.map((l) => l.id));
    for (const c of CAMPAIGNS) {
      for (const id of c.levels) expect(ids.has(id)).toBe(true);
      expect(c.promotion.minStars).toBeLessThanOrEqual(c.levels.length * 3);
    }
  });
});

describe('realism careers', () => {
  it('going down resets to Recruit and stays in realism mode', () => {
    const p = { ...newProgress(true), rank: 2, stars: { a: 3, b: 2 }, completed: ['a', 'b'] };
    const record = endCareer(p, 'b');
    expect(record).toEqual({ rank: 2, stars: 5, levelId: 'b' });
    expect(p).toEqual(newProgress(true));
  });

  it('a mission still deployed on load counts as going down, but only in realism mode', () => {
    const real = { ...newProgress(true), rank: 1, deployed: 'harbour-lane' };
    expect(settleAbandonedMission(real)?.levelId).toBe('harbour-lane');
    expect(real.rank).toBe(0);
    const normal = { ...newProgress(false), rank: 1, deployed: 'harbour-lane' };
    expect(settleAbandonedMission(normal)).toBeNull();
    expect(normal.rank).toBe(1);
  });

  it('finishing a mission clears the deployment', () => {
    const p = { ...newProgress(true), rank: 1, deployed: 'harbour-lane' };
    recordSuccess(p, 'harbour-lane', 2);
    expect(p.deployed).toBeNull();
  });
});

describe('gun roles', () => {
  const vest = Math.max(...DIFFICULTY.map((d) => d.toughness));

  it('suspects get no softer as rank goes up', () => {
    for (let i = 1; i < DIFFICULTY.length; i++) expect(DIFFICULTY[i].toughness).toBeGreaterThanOrEqual(DIFFICULTY[i - 1].toughness);
  });

  it('the rifle stops a vested suspect in one hit and the shotgun can at close range', () => {
    expect(WEAPONS.rifle.damage).toBeGreaterThanOrEqual(vest);
    expect(WEAPONS.shotgun.damage * WEAPONS.shotgun.pellets).toBeGreaterThanOrEqual(vest);
  });

  it('the sniper rifle stops anyone in one hit and outranges everything', () => {
    expect(WEAPONS.sniper.damage).toBeGreaterThanOrEqual(vest + 1);
    for (const w of Object.values(WEAPONS)) if (w.id !== 'sniper') expect(WEAPONS.sniper.range).toBeGreaterThan(w.range);
  });

  it('suppressors fit everything but the shotgun', () => {
    for (const w of Object.values(WEAPONS)) expect(w.suppressible).toBe(w.id !== 'shotgun');
  });

  it('guns are issued in order: shotgun, rifle, sniper rifle, then suppressors', () => {
    expect(CAMPAIGNS.map((c) => c.promotion.unlocks)).toEqual(['shotgun', 'rifle', 'sniper']);
    // The sniper rifle comes with the promotion out of its campaign; suppressors a rank later.
    const sniperRank = CAMPAIGNS.find((c) => c.promotion.unlocks === 'sniper')!.rank + 1;
    expect(SUPPRESSOR_RANK).toBe(sniperRank + 1);
  });

  it('every gun says what it is for', () => {
    for (const w of Object.values(WEAPONS)) expect(w.blurb.length).toBeGreaterThan(0);
  });
});
