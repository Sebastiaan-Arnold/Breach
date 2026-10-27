import type { LevelDef } from '../types';

/**
 * Officer campaign, case 5: a family home taken over by the crew, one of the owners held in a
 * back bedroom. Once the alarm goes up, a clock runs.
 * Legend: see src/core/grid.ts.
 */
const MAP: readonly string[] = [
  '##############################################',
  '#""""""""""""""""""""""""""""""""""""""""""""#',
  '#"""""""""""""""%%%%%%%%%%"""""""""""""""""""#',
  '#""""""""""""""%%%%%%%%%%%%""""""""""""""""""#',
  '#"""""""""""""""%%%%%%%%%%"""""""""""""""""""#',
  '#""""""""""""""""""""""""""""""""""""""""""""#',
  '#"""""##gggggg###ggggggg###gggggg##gggg#"""""#',
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
    'Control: Unit 7, on scene at Kestrel Road.',
    'Command: One hostage, rear bedroom. Entry via the {entry}.',
    'Command: Cleared to enter.',
  ],
  mission: {
    title: 'Kestrel Road',
    location: '22 Kestrel Road, Ashby Heights',
    time: '02:20',
    situation: [
      'Two of the Mercer Street crew seen entering 22 Kestrel Road with bags.',
      'Owners, a retired couple, are inside. One held in a rear bedroom.',
    ],
    objective: 'Rescue the hostage. Arrest all suspects.',
    twist: { label: 'Hostage', text: '30 s to reach once compromised' },
    hostiles: { min: 2, max: 4 },
    loadout: 'Handguns',
    civilians: { min: 1, max: 2, text: 'Second homeowner, possibly a visitor' },
    reliability: 'Unverified',
    hostileSlots: [
      { type: 'lookout', tx: 12.5, ty: 10.5, facing: 117, always: true },
      { type: 'lookout', tx: 30.5, ty: 10.5, facing: 120 },
      { type: 'lookout', tx: 26.5, ty: 22.5, facing: 225 },
      { type: 'lookout', tx: 36.5, ty: 21.5, facing: 338 },
      { type: 'patroller', tx: 8.5, ty: 14.5, facing: 0, route: [{ tx: 37.5, ty: 14.5 }, { tx: 33.5, ty: 18.5 }, { tx: 24.5, ty: 18.5 }, { tx: 10.5, ty: 18.5 }, { tx: 8.5, ty: 14.5 }] },
    ],
    civilianSlots: [{ tx: 16.5, ty: 21.5 }, { tx: 18.5, ty: 10.5 }, { tx: 21.5, ty: 22.5 }, { tx: 36.5, ty: 10.5 }],
    unknownZones: [],
    hostage: { tx: 10.5, ty: 11.5, seconds: 30 },
    debriefNote: 'Homeowners state the men wore Corvan Logistics jackets.',
  },
};
