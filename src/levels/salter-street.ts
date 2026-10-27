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
    'Dispatch: Unit 7, you are on Salter Street.',
    'Command: Tight rooms and closed doors. Go in by the {entry}.',
    "Command: Senior Officer, you're cleared to enter.",
  ],
  mission: {
    caseLabel: 'Senior Officer · Case 3',
    title: 'Salter Street',
    location: 'Lodging house, 9 Salter Street',
    summary: [
      "Rook's couriers sleep at a lodging house here. One of them knows where his consignments are kept.",
      'One narrow corridor, small rooms either side, the back rooms dark. Up close, a shotgun is the right tool.',
      'Expect men behind closed doors. Lodgers with nothing to do with Corvan live there too.',
      'Warrant: arrest the couriers and seize their records.',
    ],
    hostiles: { min: 4, max: 6 },
    loadout: 'Handguns and shotguns',
    civilians: { min: 1, max: 2, text: 'Lodgers in some of the rooms' },
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
    debriefNote: "A courier's delivery sheets show where Rook's consignments wait before they ship: a Corvan cold store on Westquay Docks.",
  },
};
