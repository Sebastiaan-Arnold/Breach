import type { WeaponId } from '../game/weapons';

/** Ranks in order; a campaign is played at one rank and promotes to the next. */
export const RANKS = ['Recruit', 'Officer', 'Senior Officer', 'Sergeant', 'Lieutenant'] as const;

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
      note: [
        "You've passed the Range. Welcome to the Port Ardley Police Department, Officer.",
        'Narcotics have a raid lined up on the Ashby estate, and they want you on it.',
        'Read the briefing. Then read it again. The plans are never quite right.',
      ],
    },
  },
  {
    id: 'officer',
    title: 'Street crime',
    rank: 1,
    levels: ['harbour-lane'],
    promotion: {
      minStars: 2,
      unlocks: 'smg',
      note: [
        'Every raid this season pointed the same way, and you followed it.',
        "You're promoted to Senior Officer. The armoury has signed out an SMG in your name.",
        'Supply chain unit. Starts Monday.',
      ],
    },
  },
];

export function campaignOf(levelId: string): CampaignDef | undefined {
  return CAMPAIGNS.find((c) => c.levels.includes(levelId));
}
