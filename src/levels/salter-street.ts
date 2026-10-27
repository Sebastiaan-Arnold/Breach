import type { LevelDef } from './types';

/**
 * Senior Officer campaign, case 3: a lodging house of narrow corridors and small rooms. Close
 * quarters, made for the shotgun.
 * Legend: see src/core/grid.ts.
 */
const MAP: readonly string[] = [
  '####################################',
  '#""""""""""""""""""""""""""""""====#',
  '#""""""""""""""""""""""""""""""====#',
  '#"""###########D################===#',
  '#"""#TT.....i~~~~TTi...TTi,,,TT#===#',
  '#"""#TT.....i~~~~~~i...TTi,,,TT#===#',
  '#"""#.......i~~~~~~i.....D,,,,,#===#',
  '#"""#....TT.i~~~~TTi.....i,,,,,#===#',
  '#"""#.......i~~~~TTi.....i,,,,,#===#',
  '#"""#.......i~~~~~~i.....i,,,,,#===#',
  '#"""#iiiDiiiiiiiDiiiiiDiiiiiDii#===#',
  '#"""#..........................D===#',
  '#"""#iiDiiiiDii..iiiDiiiiiiDiii#===#',
  '#"""#.....i~~~i..i......i,,,,,,#===#',
  '#"""#...TTi~~~i..iTT....iTT,,,,#===#',
  '#"""#.....i~~~i..i......i,,,,,,#===#',
  '#"""#.....i~~~i..i......i,,,,,,#===#',
  '#"""#.....i~~~i..i......i,,,,,,#===#',
  '#"""#TT...iT~~i..i....TTi,,,,TT#===#',
  '#"""#TT...iT~~i..i....TTi,,,,TT#===#',
  '#"""###########D################===#',
  '#==================================#',
  '#==================================#',
  '####################################',
];

export const SALTER_STREET: LevelDef = {
  id: 'salter-street',
  name: 'Salter Street',
  map: MAP,
  labels: [],
  entries: [
    { id: 'front', name: 'front door', approach: [{ tx: 6.5, ty: 21.6 }, { tx: 15.5, ty: 21.6 }, { tx: 15.5, ty: 21.4 }] },
    { id: 'back', name: 'back door', approach: [{ tx: 2.5, ty: 1.5 }, { tx: 15.5, ty: 1.5 }, { tx: 15.5, ty: 2.4 }] },
    { id: 'side', name: 'side door', approach: [{ tx: 33.5, ty: 21.5 }, { tx: 33.5, ty: 11.5 }, { tx: 32.6, ty: 11.5 }] },
  ],
  intro: [
    'Control: Unit 7, on scene at Salter Street.',
    'Command: Tight rooms, closed doors. Entry via the {entry}.',
    'Command: Cleared to enter.',
  ],
  mission: {
    title: 'Salter Street',
    location: 'Lodging house, 9 Salter Street',
    time: '04:30',
    situation: [
      "Lodging house used by Rook's couriers between runs.",
      'One narrow corridor, small rooms both sides. Rear rooms dark.',
      'Lodgers not involved are on site.',
    ],
    objective: 'Arrest the couriers. Seize their records.',
    twist: { label: 'CQB', text: 'Tight rooms. Shotgun recommended' },
    hostiles: { min: 4, max: 6 },
    loadout: 'Handguns, shotguns',
    civilians: { min: 1, max: 2, text: 'Lodgers in some rooms' },
    reliability: 'Likely',
    hostileSlots: [
      { type: 'lookout', tx: 15.5, ty: 14.5, facing: 90 },
      { type: 'lookout', tx: 15.5, ty: 7.5, facing: 270 },
      { type: 'patroller', tx: 6.5, ty: 11.5, facing: 0, route: [{ tx: 29.5, ty: 11.5 }, { tx: 6.5, ty: 11.5 }] },
      { type: 'lookout', tx: 20.5, ty: 16.5, facing: 270 },
      { type: 'hider', tx: 7.5, ty: 5.5, facing: 90 },
      { type: 'hider', tx: 7.5, ty: 18.5, facing: 270 },
      { type: 'hider', tx: 27.5, ty: 18.5, facing: 270 },
      { type: 'hider', tx: 27.5, ty: 6.5, facing: 180 },
    ],
    civilianSlots: [{ tx: 21.5, ty: 7.5 }, { tx: 12.5, ty: 15.5 }, { tx: 22.5, ty: 15.5 }],
    unknownZones: [{ x0: 26, y0: 4, x1: 30, y1: 9 }],
    debriefNote: 'Delivery sheets: consignments held at the Corvan cold store, Westquay Docks.',
  },
};
