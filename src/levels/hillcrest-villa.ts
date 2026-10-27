import type { LevelDef } from './types';

/**
 * Lieutenant campaign, case 1: an L-shaped villa of glass and render round a pool terrace.
 * Legend: see src/core/grid.ts.
 */
const MAP: readonly string[] = [
  '##################################################',
  '#""""""""""""""""""""""""""""""""""""""""""""""""#',
  '#"""""""""""""""""""""""TTT"""""""""TTT""""""""""#',
  '#"""""""""""""""""""""""TTT"""""""""TTT""""""""""#',
  '#"""##########################################"""#',
  '#"""#~~~~~~~~~~~~~i.................i........#"""#',
  '#"""#~~~~~~~~~~~~~i.................i...TTT..#"""#',
  '#"""#~~~TTTTTT~~~~i....TTTT.........i...TTT..#"""#',
  '#"""D~~~TTTTTT~~~~D....TTTT.........D...TTT..#"""#',
  '#"""#~~~~~~~~~~~~~i..........TTTT...i........#"""#',
  '#"""#~~~~~~~~~~~~~i.................i........#"""#',
  '#"""#~~~~~~~~~~~~~i.................i........#"""#',
  '#"""#iiiiiiDiiiiii#ggggggggDgggggggg#gggDgggg#"""#',
  '#"""#.............g============================""#',
  '#"""#.............g============================""#',
  '#"""#.............g============================""#',
  '#"""#iiiii...iiiiig======%%%%%%%%%%%%%%%%======""#',
  '#"""#....i...i....g==T===%%%%%%%%%%%%%%%%==T===""#',
  '#"""#....i...i....D==T===%%%%%%%%%%%%%%%%==T===""#',
  '#"""#TTT.D...D....g==T===%%%%%%%%%%%%%%%%==T===""#',
  '#"""#....i...i.TT.g==T===%%%%%%%%%%%%%%%%==T===""#',
  '#"""#....i...i.TT.g======%%%%%%%%%%%%%%%%======""#',
  '#"""#....i...i....g============================""#',
  '#"""#######D######g============================""#',
  '#"""""=========================================""#',
  '#"""""=========================================""#',
  '#"""""===============""""""""""""""""""""""""""""#',
  '#""TTT===============""""""""""""""""""""###D###"#',
  '#""TTT"""""====""""""""""""""""""""""""""#~~~~~#"#',
  '#""""""""""===="""""""""""TTT""""""""""""#~~~~~#"#',
  '#""""""""""===="""""""""""TTT"""TTT""""""#~~~~~#"#',
  '#""""""""""===="""""""""""""""""TTT""""""#~~~~~#"#',
  '#""""""""""====""""""""""""""""""""""""""#######"#',
  '##################################################',
];

export const HILLCREST_VILLA: LevelDef = {
  id: 'hillcrest-villa',
  name: 'Hillcrest Villa',
  map: MAP,
  labels: [],
  props: [
    { kind: 'car', tx: 6, ty: 25, color: 0x111827 },
  ],
  entries: [
    { id: 'front', name: 'front door', approach: [{ tx: 12.5, ty: 32 }, { tx: 12.5, ty: 26 }, { tx: 11.5, ty: 24.4 }] },
    { id: 'terrace', name: 'pool terrace', approach: [{ tx: 48.4, ty: 30.5 }, { tx: 48.4, ty: 22.5 }, { tx: 46.6, ty: 22.5 }] },
    { id: 'kitchen', name: 'kitchen door', approach: [{ tx: 2, ty: 31.5 }, { tx: 2, ty: 8.5 }, { tx: 3.4, ty: 8.5 }] },
  ],
  intro: [
    'Control: Unit 7, on scene at Hillcrest Rise.',
    'Command: Glass on the terrace side. Entry via the {entry}.',
    'Command: Cleared to enter.',
  ],
  mission: {
    title: 'Hillcrest Villa',
    location: '3 Hillcrest Rise',
    time: '19:40',
    situation: [
      "Councillor Graham Pryce, named in Voight's phone. Private villa, Hillcrest Rise.",
      'Private security on the pool terrace and in the house.',
      'Glass facades on the terrace side. They can see you coming.',
    ],
    objective: 'Arrest Councillor Pryce. Neutralise his security.',
    hostiles: { min: 5, max: 6 },
    loadout: 'Handguns, rifles',
    civilians: { min: 2, max: 3, text: 'Pryce (unarmed), family, staff' },
    reliability: 'Likely',
    hostileSlots: [
      { type: 'lookout', tx: 22.5, ty: 14.5, facing: 90 },
      { type: 'lookout', tx: 44.5, ty: 23.5, facing: 180 },
      { type: 'patroller', tx: 20.5, ty: 22.5, facing: 0, route: [{ tx: 44.5, ty: 22.5 }, { tx: 44.5, ty: 14.5 }, { tx: 20.5, ty: 14.5 }, { tx: 20.5, ty: 22.5 }] },
      { type: 'heavy', tx: 30.5, ty: 6.5, facing: 90 },
      { type: 'lookout', tx: 8.5, ty: 14.5, facing: 0 },
      { type: 'hider', tx: 6.5, ty: 21.5, facing: 270 },
      { type: 'lookout', tx: 15.5, ty: 9.5, facing: 180 },
    ],
    civilianSlots: [{ tx: 39.5, ty: 9.5 }, { tx: 21.5, ty: 9.5 }, { tx: 6.5, ty: 6.5 }, { tx: 44.5, ty: 29.5 }],
    unknownZones: [],
    debriefNote: "Pryce's laptop: payments to Councillor Anna Kessler. They meet on her yacht, the Halcyon, at the marina.",
  },
};
