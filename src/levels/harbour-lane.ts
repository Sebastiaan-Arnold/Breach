import type { LevelDef } from './types';

/**
 * Officer campaign, case 1: a raid on a rented terraced house used for street-level dealing.
 * Legend: see src/core/grid.ts. 46 x 34 tiles of 32 px.
 */
const MAP: readonly string[] = [
  '##############################################',
  '#""""""""""""""""""""""""""""""""""""""""""""#',
  '#""""""""""""""""""""""""""""""""""""""""""""#',
  '#""""""""""""""""""""""""""""""""""""""""""""#',
  '#""""""""""""""""""""""""""""""""""""""""""""#',
  '#""""""""""""""""""""""""""""""""""""""""""""#',
  '#""""""""""""""""""""""""""""""""""""""""""""#',
  '#"""""""##############################"""""""#',
  '#"""""""#,,,,,,,,,i~~~~TTi...........#"""""""#',
  '#"""""""#,TT,,,,,,i~~~~~~i........TT.#"""""""#',
  '#"""""""#,TT,,,,,,i~~~~~~i........TT.#"""""""#',
  '#"""""""#,,,,,,,,,i~~~~~~iTT.........#"""""""#',
  '#"""""""#iiiiDiiiiiiiDiiiiiiiiiDiiiii#"""""""#',
  '#""=====D............................#"""""""#',
  '#""=="""#............................#"""""""#',
  '#""=="""#iiiiiiDiiiiiiiiiiiiiiDiiiiii#"""""""#',
  '#""=="""#..............i~~~~~~TTTTTT~#"""""""#',
  '#""=="""#.TTT..........i~~~~~~~~~~~~~#"""""""#',
  '#""=="""#..............i~~~~~~~~~~~~~#"""""""#',
  '#""=="""#.......TT.....i~~~~~~~~~~~~~D===""""#',
  '#""=="""#.......TT.....D~~~~TTT~~~~~~#"==""""#',
  '#""=="""#..............i~~~~~~~~~~~~~#"==""""#',
  '#""=="""#T.............i~~~~~~~~~~~~~#"==""""#',
  '#""=="""#T.............i~~~~~~~~~~~~~#"==""""#',
  '#""=="""#######D######################"==""""#',
  '#""==""""""""""="""""""""""""""""""""""==""""#',
  '#""==""""""""""="""""""""""""""""""""""==""""#',
  '#============================================#',
  '#============================================#',
  '#============================================#',
  '#============================================#',
  '#============================================#',
  '#============================================#',
  '##############################################',
];

export const HARBOUR_LANE: LevelDef = {
  id: 'harbour-lane',
  name: '14 Harbour Lane',
  map: MAP,
  labels: [],
  props: [{ kind: 'van', tx: 19.5, ty: 29 }],
  entries: [
    { id: 'front', name: 'front door', approach: [{ tx: 25.5, ty: 30.5 }, { tx: 25.5, ty: 27.5 }, { tx: 15.5, ty: 27.5 }, { tx: 15.5, ty: 25.5 }] },
    { id: 'side', name: 'side door', approach: [{ tx: 25.5, ty: 30.5 }, { tx: 25.5, ty: 27.5 }, { tx: 4.5, ty: 27.5 }, { tx: 4.5, ty: 13.5 }, { tx: 6.8, ty: 13.5 }] },
    { id: 'kitchen', name: 'kitchen door', approach: [{ tx: 25.5, ty: 30.5 }, { tx: 39.5, ty: 27.5 }, { tx: 39.5, ty: 19.5 }, { tx: 38.4, ty: 19.5 }] },
  ],
  intro: [
    'Dispatch: Unit 7, you are on scene at 14 Harbour Lane.',
    'Command: Perimeter is set. Approach via the {entry}.',
    "Command: Officer, you're cleared to enter.",
  ],
  mission: {
    caseLabel: 'Officer · Case 1',
    title: 'Harbour Lane',
    location: '14 Harbour Lane, Ashby estate',
    summary: [
      'Street-level dealing on the Ashby estate has been traced to a rented terraced house.',
      'Tenant: Danny Voss, 31, prior convictions for possession with intent to supply.',
      'An informant reports associates at the house most nights, and talk of a new supplier.',
      'Warrant: search the premises and arrest anyone involved.',
    ],
    hostiles: { min: 2, max: 3 },
    loadout: 'Handguns reported',
    civilians: { min: 1, max: 1, text: "The tenant's partner may be inside" },
    reliability: 'Likely',
    hostileSlots: [
      { type: 'lookout', tx: 19.5, ty: 19.5, facing: 135 },
      { type: 'lookout', tx: 33.5, ty: 19.5, facing: 0 },
      { type: 'lookout', tx: 12.5, ty: 9.5, facing: 80 },
      { type: 'lookout', tx: 32.5, ty: 9.5, facing: 120 },
      { type: 'lookout', tx: 11.5, ty: 13.5, facing: 180 },
      {
        type: 'patroller', tx: 25.5, ty: 13.5, facing: 0,
        route: [{ tx: 34.5, ty: 13.5 }, { tx: 30.5, ty: 18.5 }, { tx: 20.5, ty: 20.5 }, { tx: 13.5, ty: 18.5 }, { tx: 11.5, ty: 13.5 }],
      },
    ],
    civilianSlots: [{ tx: 21.5, ty: 10.5 }, { tx: 28.5, ty: 9.5 }, { tx: 26.5, ty: 22.5 }],
    unknownZones: [{ x0: 19, y0: 8, x1: 24, y1: 11 }],
    debriefNote: "A ledger in the kitchen lists weekly deliveries from someone called 'the Harbourmaster'.",
  },
};
