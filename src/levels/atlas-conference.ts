import type { LevelDef } from './types';

/**
 * Sergeant campaign, case 3: the ballroom and boardroom on floor 6, where the partners meet.
 * Legend: see src/core/grid.ts.
 */
const MAP: readonly string[] = [
  '################################################',
  '################################################',
  '######........TTTTTTTTT........i..g............#',
  '######.........................i..g............#',
  '#::::#.........................i..g............#',
  '#::::#...TT....TT....TT....TT..i..g............#',
  '#::::D...TT....TT....TT....TT..i..g...TTTTTT...#',
  '#::::#.........................i..D...TTTTTT...#',
  '#::::#.........................i..g...TTTTTT...#',
  '#::::#.........................i..g............#',
  '######...TT....TT....TT....TT..D..g............#',
  '######...TT....TT....TT....TT..i..g............#',
  '######.........................i..g............#',
  '######.........................i..iiiiiiiiiiiii#',
  '######.........................i..i............#',
  '######...TT....TT....TT....TT..i..i............#',
  '######...TT....TT....TT....TT..i..D....TTTT....#',
  '######.........................i..i....TTTT....#',
  '######.........................i..i............#',
  '######.........................i..i............#',
  '######iiiiiiDiiiiiiiiiiiDiiiiiii..iiiiiiiiiiiii#',
  '#::::#~~~~~~~~~~~~~~~~~~~~~~~~~i..i~~~~~~~~~~~~#',
  '#::::#~~~~~~~~~~~~~~~~~~~~~~~~~i..i~~~~~~~~~~~~#',
  '#::::#~~~~~~~~~~~~~~~~~~~~~~~~~i..i~~TTTTTTTT~~#',
  '#::::D~~~~~~~~~~~~~~~~~~~~~~~~~D..D~~~~~~~~~~~~#',
  '#::::#~~~~~~~~~~~~~~~~~~~~~~~~~i..i~~~~~~~~~~~~#',
  '#::::#~~~~~~~~~~~~~~~~~~~~~~~~~i..i~~TTTTTTTT~~#',
  '#::::#~~~~~~~~~~~~~~~~~~~~~~~~~i..i~~~~~~~~~~~~#',
  '################################..i~~~~~~~~~~~~#',
  '################################################',
];

export const ATLAS_CONFERENCE: LevelDef = {
  id: 'atlas-conference',
  name: 'Grand Atlas: Conference Suite',
  map: MAP,
  labels: [],
  entries: [
    { id: 'lifts', name: 'main lifts', approach: [{ tx: 2.5, ty: 26.5 }, { tx: 2.5, ty: 24.5 }, { tx: 4.4, ty: 24.5 }] },
    { id: 'fire', name: 'ballroom fire stair', approach: [{ tx: 2.5, ty: 8.5 }, { tx: 2.5, ty: 6.5 }, { tx: 4.4, ty: 6.5 }] },
    { id: 'service', name: 'service lift', approach: [{ tx: 46, ty: 27.5 }, { tx: 36.5, ty: 27.5 }] },
  ],
  intro: [
    'Control: Unit 7, floor 6.',
    'Command: Partners are in the boardroom. Entry via the {entry}.',
    'Command: Cleared to enter.',
  ],
  mission: {
    title: 'Grand Atlas: Conference Suite',
    location: 'Grand Atlas Hotel, floor 6',
    time: '22:00',
    situation: [
      'Meridian Partners in the boardroom. Hotel staff serving.',
      'Ballroom next door set for an event. Tables for cover.',
      'Contractors guarding the boardroom.',
    ],
    objective: 'Arrest the partners. Neutralise their security.',
    hostiles: { min: 5, max: 6 },
    loadout: 'Handguns, shotguns, rifles',
    civilians: { min: 3, max: 4, text: 'Two partners (unarmed), hotel staff' },
    reliability: 'Likely',
    hostileSlots: [
      { type: 'heavy', tx: 36.5, ty: 7.5, facing: 180 },
      { type: 'heavy', tx: 40.5, ty: 4.5, facing: 180 },
      { type: 'lookout', tx: 18.5, ty: 24.5, facing: 180 },
      { type: 'lookout', tx: 18.5, ty: 12.5, facing: 180 },
      { type: 'hider', tx: 29.5, ty: 13.5, facing: 180 },
      { type: 'patroller', tx: 32.5, ty: 3.5, facing: 90, route: [{ tx: 32.5, ty: 27.5 }, { tx: 32.5, ty: 3.5 }] },
      { type: 'lookout', tx: 40.5, ty: 24.5, facing: 0 },
    ],
    civilianSlots: [{ tx: 37.5, ty: 4.5 }, { tx: 44.5, ty: 9.5 }, { tx: 12.5, ty: 8.5 }, { tx: 42.5, ty: 21.5 }],
    unknownZones: [],
    debriefNote: 'Two partners in custody. The senior partners left by the rear stairs for the service yard.',
  },
};
