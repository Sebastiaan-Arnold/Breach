import type { LevelDef } from './types';

/**
 * Officer campaign, case 2: a house party in a terraced house and its back garden. Armed men
 * among a crowd of guests who freeze or scatter when the shooting starts.
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
    'Command: The place is full of guests. Check every target. Go in by the {entry}.',
    "Command: Officer, you're cleared to enter.",
  ],
  mission: {
    caseLabel: 'Officer · Case 2',
    title: 'Fenwick Terrace',
    location: '12 Fenwick Terrace, Ashby estate',
    summary: [
      "The Harbour Lane ledger names Kyle Marsh, 19, who deals for the crew from his mother's house.",
      "Tonight he's throwing a party. The house and back garden are full of guests, and some of the crew are armed.",
      'When the shooting starts, guests will freeze or scatter. Check every target.',
      'Warrant: arrest the armed men and get every guest out safely.',
    ],
    twist: { label: 'Party', text: 'A crowd of guests. Secure them all' },
    hostiles: { min: 3, max: 4 },
    loadout: 'Handguns',
    civilians: { min: 6, max: 8, text: 'Six to eight guests' },
    reliability: 'Likely',
    hostileSlots: [
      { type: 'lookout', tx: 27.5, ty: 14.5, facing: 180 },
      { type: 'lookout', tx: 24.5, ty: 18.5, facing: 90 },
      { type: 'lookout', tx: 19.5, ty: 8.5, facing: 270 },
      { type: 'lookout', tx: 20.5, ty: 12.5, facing: 270 },
      { type: 'lookout', tx: 18.5, ty: 18.5, facing: 90 },
      { type: 'lookout', tx: 27.5, ty: 9.5, facing: 180 },
    ],
    civilianSlots: [
      { tx: 17.5, ty: 14.5 }, { tx: 24.5, ty: 12.5 }, { tx: 28.5, ty: 13.5 },
      { tx: 22.5, ty: 17.5 }, { tx: 28.5, ty: 19.5 }, { tx: 26.5, ty: 18.5 }, { tx: 17.5, ty: 20.5 },
      { tx: 17.5, ty: 6.5 }, { tx: 23.5, ty: 8.5 }, { tx: 25.5, ty: 9.5 },
    ],
    unknownZones: [],
    debriefNote: "Marsh's phone has the crew's other address: a ground-floor flat in Tollgate House, where they cut and bag.",
  },
};
