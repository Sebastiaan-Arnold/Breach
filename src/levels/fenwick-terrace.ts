import type { LevelDef } from './types';

/**
 * Officer campaign, case 2: a terraced house with back gardens and an alley behind. The runner
 * bolts for the end of the street or the alley the moment he knows you're there.
 * Legend: see src/core/grid.ts.
 */
const MAP: readonly string[] = [
  '##############################################',
  '#============================================#',
  '#============================================#',
  '#============================================#',
  '#wwwwww"wwwwwwwwwwwwww"wwwwwwwwwwwwww"wwwwwww#',
  '#"TTT""""""""""w""""""""""""""w"""""""""TTTT"#',
  '#"TTT"""""""""""""""""""""TTT"w"""""""""TTTT"#',
  '#""""""""""""""w""""""""""TTT"w""""""""""""""#',
  '#""""""""""""""w""""""""""""""w""""""""""""""#',
  '#""""""""""""""w"""""""""""""""""""""""""""""#',
  '#""""""""""""""w""""""""""""""w""""""""""""""#',
  '######################D#######################',
  '################TT~~~~~~~~~~~~################',
  '################~~~~~~TT~~~~~~################',
  '################~~~~~~TT~~~~~~################',
  '################~~~~~~~~~~~~~~################',
  '################iiDiiiiiiiDiii################',
  '################....i.......TT################',
  '################....i.........################',
  '################....i.........################',
  '################....i...TTTT..################',
  '##################D###########################',
  '#============================================#',
  '#============================================#',
  '#====TTTT=========================TTTT=======#',
  '#====TTTT=========================TTTT=======#',
  '#============================================#',
  '#=======================TTTT=================#',
  '#=======================TTTT=================#',
  '##############################################',
];

export const FENWICK_TERRACE: LevelDef = {
  id: 'fenwick-terrace',
  name: 'Fenwick Terrace',
  map: MAP,
  labels: [],
  props: [
    { kind: 'car', tx: 5, ty: 24, color: 0x475569 },
    { kind: 'car', tx: 34, ty: 24, color: 0x7c2d12 },
    { kind: 'car', tx: 24, ty: 27 },
  ],
  entries: [
    { id: 'front', name: 'front door', approach: [{ tx: 10.5, ty: 27 }, { tx: 18.5, ty: 27 }, { tx: 18.5, ty: 22.6 }] },
    { id: 'back', name: 'back gate', approach: [{ tx: 30.5, ty: 2 }, { tx: 22.5, ty: 2 }, { tx: 22.5, ty: 3.4 }] },
    { id: 'garden', name: "neighbour's garden", approach: [{ tx: 2.5, ty: 2.5 }, { tx: 7.5, ty: 2.5 }, { tx: 7.5, ty: 6.5 }, { tx: 13.6, ty: 6.5 }] },
  ],
  intro: [
    'Dispatch: Unit 7, you are on Fenwick Terrace.',
    'Command: Marsh runs. Get close before he knows you are there. Go in by the {entry}.',
    "Command: Officer, you're cleared to enter.",
  ],
  mission: {
    caseLabel: 'Officer · Case 2',
    title: 'Fenwick Terrace',
    location: '12 Fenwick Terrace, Ashby estate',
    summary: [
      "The Harbour Lane ledger names the crew's runner: Kyle Marsh, 19, who deals from his mother's house.",
      'Marsh runs, every time. If he sees you or hears trouble, he is out the other side of the house.',
      "He's unarmed. Don't shoot him: catch him before he reaches the end of the street or the alley.",
      'Warrant: arrest Marsh and anyone with him.',
    ],
    hostiles: { min: 3, max: 4 },
    loadout: 'Handguns. Marsh is unarmed',
    civilians: { min: 1, max: 2, text: 'His mother, and neighbours in the gardens' },
    reliability: 'Likely',
    hostileSlots: [
      { type: 'runner', tx: 25.5, ty: 14.5, facing: 180 },
      { type: 'lookout', tx: 24.5, ty: 18.5, facing: 90 },
      { type: 'lookout', tx: 19.5, ty: 8.5, facing: 270 },
      { type: 'lookout', tx: 20.5, ty: 12.5, facing: 270 },
      { type: 'lookout', tx: 18.5, ty: 18.5, facing: 90 },
    ],
    civilianSlots: [{ tx: 28.5, ty: 19.5 }, { tx: 10.5, ty: 8.5 }, { tx: 35.5, ty: 7.5 }],
    unknownZones: [],
    exits: [{ tx: 1.5, ty: 2.5 }, { tx: 44.5, ty: 2.5 }, { tx: 1.5, ty: 26.5 }, { tx: 44.5, ty: 26.5 }],
    debriefNote: "Marsh's phone has the crew's other address: a ground-floor flat in Tollgate House, where they cut and bag.",
  },
};
