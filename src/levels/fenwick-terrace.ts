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
    'Control: Unit 7, on scene at Fenwick Terrace.',
    "Command: Party's still going. Check your targets. Entry via the {entry}.",
    'Command: Cleared to enter.',
  ],
  mission: {
    title: 'Fenwick Terrace',
    location: '12 Fenwick Terrace, Ashby estate',
    time: '23:30',
    situation: [
      "Kyle Marsh, 19, deals for the Voss crew from his mother's address.",
      'House party in progress. House and rear garden occupied.',
      'Armed crew members among the guests.',
    ],
    objective: 'Arrest the armed suspects. Secure all guests.',
    twist: { label: 'Crowd', text: 'Party in progress. Check every target' },
    hostiles: { min: 3, max: 4 },
    loadout: 'Handguns',
    civilians: { min: 6, max: 8, text: '6–8 guests' },
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
    debriefNote: "Marsh's phone recovered. Second address: Flat 1, Tollgate House, used to cut and bag.",
  },
};
