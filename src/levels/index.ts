import { HARBOUR_LANE } from './harbour-lane';
import { RANGE } from './range';
import type { LevelDef } from './types';

/** Every playable level, in campaign order. */
export const LEVELS: readonly LevelDef[] = [RANGE, HARBOUR_LANE];

export function levelById(id: string): LevelDef {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`Unknown level: ${id}`);
  return level;
}
