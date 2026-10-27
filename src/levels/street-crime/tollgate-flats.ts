import type { LevelDef } from '../types';

/**
 * Officer campaign, case 3: a ground-floor flat with the power cut. Darkness inside a real raid.
 * Legend: see src/core/grid.ts.
 */
const MAP: readonly string[] = [
  '############################################',
  '#""""""""""""""""""""""""""""""""""""""""""#',
  '#"""####################################"""#',
  '#"""#~~~~~~#,,,,,,,,,,,,,i,,,,,,,TTTTT,#"""#',
  '#"""#~~~~~~#,TTT,,,,,,,,,i,,,,,,,,,,,,,#===#',
  '#"""#~~~~~~#,,,,,,,,,,,,,i,,,,,,,,,,,,,#===#',
  '#"""#~~~~~~#,,,,,,,TT,,,,D,,,,,,,,,,,,,#===#',
  '#"""#~~~~~~#,,,,,,,TT,,,,i,,,TT,,,,,,,,#===#',
  '#"""#~~~~~~#,,,,,,,,,,,,,i,,,TT,,,,,,,,#===#',
  '#"""#~~~~~~#,,,,,,,,,,,,,i,,,,,,,,,,,,,#===#',
  '#"""#~~~~~~#iiiiDiiiiiiiiiiiiiiDiiiiiii#===#',
  '#"""#~~~~~~#,,,,,,,,,,,,,,,,,,,,,,,,,,,#===#',
  '#"""#~~~~~~D,,,,,,,,,,,,,,,,,,,,,,,,,,,D===#',
  '#"""#~~~~~~#,,,,,,,,,,,,,,,,,,,,,,,,,,,#===#',
  '#"""#~~~~~~#iiiiDiiiiiiiDiiiiiiiiDiiiii#===#',
  '#"""#~~~~~~#,,,,,,,,,i,,,TTi,,,,,,,,,,,#===#',
  '#"""#~~~~~~#,TT,,,,,,i,,,,,i,,,,,,,,TT,#===#',
  '#"""#~~~~~~#,TT,,,,,,i,,,,,i,,,,,,,,TT,#===#',
  '#"""#~~~~~~#,,,,,,,,,i,,,,,i,,,,,,,,,,,#===#',
  '#"""#~~~~~~#,,,,,,,,,i,,,,,i,,,,,,,,,,,#===#',
  '#"""#~~~~~~#,,,,,,,,,i,,,,,i,,,,,,,,,,,#===#',
  '#"""#~~~~~~#,,,,,,,,,i,,,,,i,,,,,,,,,,,#===#',
  '#"""####~###############################===#',
  '#==========================================#',
  '#==========================================#',
  '#==========================================#',
  '#==========================================#',
  '#==========================================#',
  '#==========================================#',
  '############################################',
];

export const TOLLGATE_FLATS: LevelDef = {
  id: 'tollgate-flats',
  name: 'Tollgate Flats',
  map: MAP,
  labels: [],
  props: [
    { kind: 'van', tx: 18, ty: 25 },
  ],
  entries: [
    { id: 'stairwell', name: 'stairwell door', approach: [{ tx: 24.5, ty: 25.5 }, { tx: 24.5, ty: 23.5 }, { tx: 8.5, ty: 23.5 }, { tx: 8.5, ty: 20.5 }, { tx: 8.5, ty: 12.5 }, { tx: 10.3, ty: 12.5 }] },
    { id: 'garden', name: 'garden door', approach: [{ tx: 24.5, ty: 25.5 }, { tx: 41.5, ty: 24.5 }, { tx: 41.5, ty: 12.5 }, { tx: 40.3, ty: 12.5 }] },
  ],
  intro: [
    'Control: Unit 7, on scene at Tollgate House.',
    "Command: Power's out inside. Entry via the {entry}.",
    'Command: Cleared to enter.',
  ],
  mission: {
    title: 'Tollgate Flats',
    location: 'Flat 1, Tollgate House, Ashby estate',
    time: '01:15',
    situation: [
      'Flat 1, Tollgate House. The crew cuts and bags here.',
      'Power to the flat is cut.',
      'Neighbours report traffic through the rear garden.',
    ],
    objective: 'Search the flat. Arrest all occupants.',
    twist: { label: 'Power', text: 'Cut. Weapon light only' },
    hostiles: { min: 3, max: 4 },
    loadout: 'Handguns',
    civilians: { min: 0, max: 1, text: 'A visitor, possibly' },
    reliability: 'Likely',
    hostileSlots: [
      { type: 'lookout', tx: 18.5, ty: 5.5, facing: 112 },
      { type: 'lookout', tx: 35.5, ty: 7.5, facing: 165 },
      { type: 'lookout', tx: 18.5, ty: 19.5, facing: 250 },
      { type: 'lookout', tx: 35.5, ty: 19.5, facing: 248 },
      { type: 'lookout', tx: 37.5, ty: 12.5, facing: 180 },
      { type: 'patroller', tx: 14.5, ty: 12.5, facing: 0, route: [{ tx: 36.5, ty: 12.5 }, { tx: 31.5, ty: 8.5 }, { tx: 21.5, ty: 8.5 }, { tx: 16.5, ty: 11.5 }, { tx: 13.5, ty: 12.5 }] },
    ],
    civilianSlots: [{ tx: 29.5, ty: 17.5 }, { tx: 13.5, ty: 7.5 }, { tx: 23.5, ty: 18.5 }],
    unknownZones: [{ x0: 22, y0: 15, x1: 26, y1: 21 }],
    debriefNote: "Phone on the counter. Texts from 'HM': 'Mercer St garage. Thursday. Bring the van.'",
  },
};
