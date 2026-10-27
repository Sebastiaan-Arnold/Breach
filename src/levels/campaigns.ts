import type { WeaponId } from '../game/weapons';

/** Ranks in order; a campaign is played at one rank and promotes to the next. */
export const RANKS = ['Recruit', 'Officer', 'Senior Officer', 'Sergeant', 'Lieutenant'] as const;

/**
 * How sharp enemies are. Every rank's campaign is harder than the last: faster reactions,
 * quicker to notice you, tighter aim and a faster rate of fire.
 */
export interface Difficulty {
  /** Multiplier on how long an enemy takes to react before its first shot. */
  reaction: number;
  /** Multiplier on how long an enemy takes to notice the operator. */
  notice: number;
  /** Angular error of an enemy's shot, in degrees. */
  spread: number;
  /** Seconds between an enemy's shots, min and max. */
  fireInterval: [number, number];
  /** Damage it takes to stop a suspect: 1 unarmoured, 2 in a light vest. Each gun's damage counts against it. */
  toughness: number;
}

/** Indexed by rank (see RANKS). The Range has no enemies, so Recruit shares Officer's values. */
export const DIFFICULTY: readonly Difficulty[] = [
  { reaction: 1, notice: 1, spread: 4, fireInterval: [0.7, 1.1], toughness: 1 },
  { reaction: 1, notice: 1, spread: 4, fireInterval: [0.7, 1.1], toughness: 1 },
  { reaction: 0.85, notice: 0.8, spread: 3.2, fireInterval: [0.6, 0.95], toughness: 2 },
  { reaction: 0.72, notice: 0.65, spread: 2.6, fireInterval: [0.5, 0.85], toughness: 2 },
  { reaction: 0.6, notice: 0.55, spread: 2.2, fireInterval: [0.45, 0.75], toughness: 2 },
];

/**
 * Suppressors are the last issue: they come with promotion to Lieutenant, after the sniper rifle.
 * Then earlier cases can be replayed quietly.
 */
export const SUPPRESSOR_RANK = 4;

export interface CampaignDef {
  id: string;
  title: string;
  /** Index into RANKS: the rank this campaign is played at. */
  rank: number;
  /** Level ids, in order. Each unlocks when the previous one is completed. */
  levels: string[];
  promotion: {
    /** Stars needed across the campaign, on top of completing every level. */
    minStars: number;
    /** A gun issued with the promotion. */
    unlocks?: WeaponId;
    /** The captain's note on the promotion screen. */
    note: string[];
  };
}

export const CAMPAIGNS: readonly CampaignDef[] = [
  {
    id: 'academy',
    title: 'Academy',
    rank: 0,
    levels: ['range'],
    promotion: {
      minStars: 1,
      unlocks: 'shotgun',
      note: [
        "You've passed the Range. Welcome to the Port Ardley Police Department, Officer.",
        'Narcotics want you on a raid on the Ashby estate. The armoury has issued you a shotgun for it.',
        'Read the briefing. Then read it again. The plans are never quite right.',
      ],
    },
  },
  {
    id: 'officer',
    title: 'Street crime',
    rank: 1,
    levels: ['harbour-lane', 'tollgate-flats', 'mercer-street', 'kestrel-road', 'westquay-lockups'],
    promotion: {
      minStars: 10,
      unlocks: 'rifle',
      note: [
        'Five raids, and every one of them pointed the same way: Corvan Logistics.',
        "You're promoted to Senior Officer. The armoury has signed out an assault rifle in your name.",
        'Supply chain unit. Starts Monday.',
      ],
    },
  },
  {
    id: 'senior',
    title: 'Supply chain',
    rank: 2,
    levels: ['corvan-depot', 'corvan-head-office', 'salter-street', 'cold-store', 'ferry-road', 'pier-six', 'harbour-freight'],
    promotion: {
      minStars: 14,
      unlocks: 'sniper',
      note: [
        'Corvan Logistics was never a parcel firm. It was a pipeline, and you followed it to the end.',
        "You're promoted to Sergeant. The sniper rifle you carried at the yard is yours now.",
        "The money is next. Somebody has been cleaning Corvan's cash, and they meet at a hotel.",
      ],
    },
  },
];

export function campaignOf(levelId: string): CampaignDef | undefined {
  return CAMPAIGNS.find((c) => c.levels.includes(levelId));
}
