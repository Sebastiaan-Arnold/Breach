import { RANGE_STATIONS, stationAt, type StationDef, type StationId } from '../levels/range';
import type { Target } from './Target';

export interface ChecklistItem {
  id: StationId;
  name: string;
  done: boolean;
  detail: string;
}

const LANE_HITS_NEEDED = 5;
const SPRINT_NEEDED = 0.6;

/** Tracks progress through the Range's training stations. */
export class RangeStations {
  private done = new Set<StationId>();
  private sprintTime = 0;
  private reachedEnd = false;
  private laneHits = 0;

  constructor(private targets: readonly Target[]) {}

  get allDone(): boolean {
    return this.done.size === RANGE_STATIONS.length;
  }

  onSprint(dt: number, tx: number, ty: number): void {
    if (stationAt(tx, ty)?.id === 'movement') this.sprintTime += dt;
  }

  onTargetHit(t: Target): void {
    if (t.station === 'targets') this.laneHits++;
  }

  /** Returns stations that were completed by this check. */
  update(tx: number, ty: number): StationDef[] {
    if (stationAt(tx, ty)?.id === 'movement' && tx >= 52) this.reachedEnd = true;
    const completed: StationDef[] = [];
    for (const s of RANGE_STATIONS) {
      if (this.done.has(s.id) || !this.isComplete(s.id)) continue;
      this.done.add(s.id);
      completed.push(s);
    }
    return completed;
  }

  checklist(): ChecklistItem[] {
    return RANGE_STATIONS.map((s) => ({ id: s.id, name: s.name, done: this.done.has(s.id), detail: this.detail(s.id) }));
  }

  private suspects(id: StationId): { down: number; total: number } {
    const list = this.targets.filter((t) => t.station === id && t.kind === 'suspect');
    return { down: list.filter((t) => !t.alive).length, total: list.length };
  }

  private isComplete(id: StationId): boolean {
    switch (id) {
      case 'movement':
        return this.reachedEnd && this.sprintTime >= SPRINT_NEEDED;
      case 'targets':
        return this.laneHits >= LANE_HITS_NEEDED;
      case 'doors':
      case 'shoot':
      case 'killhouse': {
        const s = this.suspects(id);
        return s.total > 0 && s.down === s.total;
      }
    }
  }

  private detail(id: StationId): string {
    const tick = (b: boolean) => (b ? '✓' : '·');
    switch (id) {
      case 'movement':
        return `sprint ${tick(this.sprintTime >= SPRINT_NEEDED)}  end ${tick(this.reachedEnd)}`;
      case 'targets':
        return `hits ${Math.min(this.laneHits, LANE_HITS_NEEDED)}/${LANE_HITS_NEEDED}`;
      case 'doors':
      case 'shoot': {
        const s = this.suspects(id);
        return `suspects ${s.down}/${s.total}`;
      }
      case 'killhouse':
        // The real count is rolled per run, so only show what's been found.
        return this.done.has('killhouse') ? 'clear' : `suspects down ${this.suspects('killhouse').down}`;
    }
  }
}
