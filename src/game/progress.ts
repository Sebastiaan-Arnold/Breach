import { CAMPAIGNS, type CampaignDef } from '../levels/campaigns';
import type { WeaponId } from './weapons';

/**
 * Campaign progress: rank, best stars per level and which levels are done. Saved in the
 * browser; storage can be unavailable (private windows, blocked site data), so reads and writes
 * fall back gracefully and the game still plays.
 */
export interface Progress {
  rank: number;
  stars: Record<string, number>;
  completed: string[];
}

const KEY = 'breach.progress';

export function newProgress(): Progress {
  return { rank: 0, stars: {}, completed: [] };
}

export function isUnlocked(p: Progress, levelId: string, campaigns: readonly CampaignDef[] = CAMPAIGNS): boolean {
  const c = campaigns.find((x) => x.levels.includes(levelId));
  if (!c || p.rank < c.rank) return false;
  const i = c.levels.indexOf(levelId);
  return i === 0 || p.completed.includes(c.levels[i - 1]);
}

export function campaignStars(p: Progress, c: CampaignDef): number {
  return c.levels.reduce((sum, id) => sum + (p.stars[id] ?? 0), 0);
}

/** The pistol is always carried; promotions issue the rest. */
export function unlockedWeapons(p: Progress, campaigns: readonly CampaignDef[] = CAMPAIGNS): WeaponId[] {
  const guns: WeaponId[] = ['pistol'];
  for (const c of campaigns) if (p.rank > c.rank && c.promotion.unlocks) guns.push(c.promotion.unlocks);
  return guns;
}

/**
 * Records a successful run (keeping the best stars). Returns the campaign whose promotion this
 * just earned: every level completed, enough stars, and still at that campaign's rank.
 */
export function recordSuccess(
  p: Progress,
  levelId: string,
  stars: number,
  campaigns: readonly CampaignDef[] = CAMPAIGNS,
): CampaignDef | null {
  p.stars[levelId] = Math.max(p.stars[levelId] ?? 0, stars);
  if (!p.completed.includes(levelId)) p.completed.push(levelId);
  const c = campaigns.find((x) => x.levels.includes(levelId));
  if (!c || p.rank !== c.rank) return null;
  const allDone = c.levels.every((id) => p.completed.includes(id));
  if (!allDone || campaignStars(p, c) < c.promotion.minStars) return null;
  p.rank = c.rank + 1;
  return c;
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...newProgress(), ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    // Fall through to a fresh start.
  }
  return newProgress();
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Not persisted this session; progress still applies until the tab closes.
  }
}

/** The player's progress for this session. */
export const progress: Progress = loadProgress();
