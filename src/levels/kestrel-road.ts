import type { LevelDef } from './types';

/**
 * Officer campaign, case 4: a family home taken over by the crew. Several civilians, thin intel.
 * Legend: see src/core/grid.ts.
 */
const MAP: readonly string[] = [
  '##############################################',
  '#""""""""""""""""""""""""""""""""""""""""""""#',
  '#""""""""""""""""""""""""""""""""""""""""""""#',
  '#""""""""""""""""""""""""""""""""""""""""""""#',
  '#""""""""""""""""""""""""""""""""""""""""""""#',
  '#""""""""""""""""""""""""""""""""""""""""""""#',
  '#"""""##################################"""""#',
  '#"""""#,,,,,,,,i.........i.......i~~~~~#"""""#',
  '#"""""#,TT,,,,,i.....TT..i....TT.i~~~TT#"""""#',
  '#"""""#,TT,,,,,i.....TT..i....TT.i~~~~~#"""""#',
  '#"""""#,,,,,,,,i.........i.......i~~~~~#"""""#',
  '#"""""#,,,,,,,,i.........i.......i~~~~~#"""""#',
  '#"""""#,,,,,,,,i.........i.......i~~~~~#"""""#',
  '#"""""#iiiiDiiiiiiiiDiiiiiiiiDiiiiiiDii#"""""#',
  '#"====D................................#"""""#',
  '#"====#................................#"""""#',
  '#"====#iiiDiiiiiiiiiiiiiDiiiiiiiiDiiiii#"""""#',
  '#"====#............i.........i~~~~TTTTT#"""""#',
  '#"====#......TT....i.........i~~~~~~~~~#"""""#',
  '#"====#.T....TT....i..TTTTT..i~~~~~~~~~#"""""#',
  '#"====#.T..........D..TTTTT..i~~~~~~~~~D===""#',
  '#"====#.T..........i.........D~~TT~~~~~#===""#',
  '#"====#.T..........i.........i~~TT~~~~~#===""#',
  '#"====#............i.........i~~~~~~~~~#===""#',
  '#"====#######D##########################===""#',
  '#"===="""""""=""""""""""""""""""""""""""===""#',
  '#"===="""""""=""""""""""""""""""""""""""===""#',
  '#============================================#',
  '#============================================#',
  '#============================================#',
  '#============================================#',
  '##############################################',
];

export const KESTREL_ROAD: LevelDef = {
  id: 'kestrel-road',
  name: 'Kestrel Road',
  map: MAP,
  labels: [],
  props: [
    { kind: 'van', tx: 30.5, ty: 28.5 },
  ],
  entries: [
    { id: 'front', name: 'front door', approach: [{ tx: 28.5, ty: 28.5 }, { tx: 13.5, ty: 27.5 }, { tx: 13.5, ty: 25.4 }] },
    { id: 'side', name: 'side door', approach: [{ tx: 8.5, ty: 28.5 }, { tx: 3.5, ty: 27.5 }, { tx: 3.5, ty: 14.5 }, { tx: 5.3, ty: 14.5 }] },
    { id: 'kitchen', name: 'kitchen door', approach: [{ tx: 28.5, ty: 28.5 }, { tx: 28.5, ty: 27.4 }, { tx: 41.5, ty: 27.4 }, { tx: 41.5, ty: 20.5 }, { tx: 40.3, ty: 20.5 }] },
  ],
  intro: [
    'Dispatch: Unit 7, you are on Kestrel Road.',
    'Command: The homeowners may be in there. Check before you shoot. Go in by the {entry}.',
    "Command: Officer, you're cleared to enter.",
  ],
  mission: {
    caseLabel: 'Officer · Case 4',
    title: 'Kestrel Road',
    location: '22 Kestrel Road, Ashby Heights',
    summary: [
      'Two of the Mercer Street crew were seen carrying bags into a detached house on Kestrel Road.',
      'The owners, a retired couple, have not answered their phone since yesterday. They may be inside with them.',
      'Intel on numbers is thin. Treat the marks on the plan as a guess.',
      'Warrant: arrest the suspects and get the homeowners out safely.',
    ],
    hostiles: { min: 2, max: 4 },
    loadout: 'Handguns reported',
    civilians: { min: 2, max: 3, text: 'The homeowners are believed to be inside' },
    reliability: 'Unverified',
    hostileSlots: [
      { type: 'lookout', tx: 12.5, ty: 10.5, facing: 117 },
      { type: 'lookout', tx: 30.5, ty: 10.5, facing: 120 },
      { type: 'lookout', tx: 26.5, ty: 22.5, facing: 225 },
      { type: 'lookout', tx: 36.5, ty: 21.5, facing: 338 },
      { type: 'patroller', tx: 8.5, ty: 14.5, facing: 0, route: [{ tx: 37.5, ty: 14.5 }, { tx: 33.5, ty: 18.5 }, { tx: 24.5, ty: 18.5 }, { tx: 10.5, ty: 18.5 }, { tx: 8.5, ty: 14.5 }] },
    ],
    civilianSlots: [{ tx: 16.5, ty: 21.5 }, { tx: 18.5, ty: 10.5 }, { tx: 21.5, ty: 22.5 }, { tx: 36.5, ty: 10.5 }],
    unknownZones: [],
    debriefNote: 'The homeowners were paid to look the other way, in cash, by a man in a Corvan Logistics jacket.',
  },
};
