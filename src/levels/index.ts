import { COLD_STORE } from './cold-store';
import { CORVAN_DEPOT } from './corvan-depot';
import { CORVAN_HEAD_OFFICE } from './corvan-head-office';
import { FENWICK_TERRACE } from './fenwick-terrace';
import { FERRY_ROAD } from './ferry-road';
import { HARBOUR_FREIGHT } from './harbour-freight';
import { HARBOUR_LANE } from './harbour-lane';
import { KESTREL_ROAD } from './kestrel-road';
import { MERCER_STREET } from './mercer-street';
import { RANGE } from './range';
import { SALTER_STREET } from './salter-street';
import { TOLLGATE_FLATS } from './tollgate-flats';
import type { LevelDef } from './types';
import { WESTQUAY_LOCKUPS } from './westquay-lockups';

/** Every playable level, in campaign order. */
export const LEVELS: readonly LevelDef[] = [
  RANGE,
  HARBOUR_LANE, FENWICK_TERRACE, TOLLGATE_FLATS, MERCER_STREET, KESTREL_ROAD, WESTQUAY_LOCKUPS,
  CORVAN_DEPOT, CORVAN_HEAD_OFFICE, SALTER_STREET, COLD_STORE, FERRY_ROAD, HARBOUR_FREIGHT,
];

export function levelById(id: string): LevelDef {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`Unknown level: ${id}`);
  return level;
}
