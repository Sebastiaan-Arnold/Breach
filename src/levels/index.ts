import { HARBOUR_LANE } from './harbour-lane';
import { KESTREL_ROAD } from './kestrel-road';
import { MERCER_STREET } from './mercer-street';
import { RANGE } from './range';
import { TOLLGATE_FLATS } from './tollgate-flats';
import type { LevelDef } from './types';
import { WESTQUAY_LOCKUPS } from './westquay-lockups';

/** Every playable level, in campaign order. */
export const LEVELS: readonly LevelDef[] = [RANGE, HARBOUR_LANE, TOLLGATE_FLATS, MERCER_STREET, KESTREL_ROAD, WESTQUAY_LOCKUPS];

export function levelById(id: string): LevelDef {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`Unknown level: ${id}`);
  return level;
}
