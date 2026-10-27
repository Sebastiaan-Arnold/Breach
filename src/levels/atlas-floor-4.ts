import type { LevelDef } from './types';

/**
 * Sergeant campaign, case 2: a guest corridor with rooms both sides. Meridian's security has six of them.
 * Legend: see src/core/grid.ts.
 */
const MAP: readonly string[] = [
  '##############################################',
  '##############################################',
  '#####i~~TT.i~~TT.i~~TT.i~~TT.i~~TT.i~~TT.i===#',
  '#####i~~TT.i~~TT.i~~TT.i~~TT.i~~TT.i~~TT.i===#',
  '#####i.....i.....i.....i.....i.....i.....i===#',
  '#####i.....i.....i.....i.....i.....i.....i===#',
  '#####i.....i.....i.....i.....i.....i.....i===#',
  '#####i.....i.....i.....i.....i.....i.....i===#',
  '#::::i.....i.....i.....i.....i.....i.....i===#',
  '#::::iiiDiiiiiDiiiiiDiiiiiDiiiiiDiiiiiDiii===#',
  '#::::D...................................D===#',
  '#::::i...................................i===#',
  '#::::iiiDiiiiiDiiii:::iiiiDiiiiiDiiiiiDiii===#',
  '#::::i.....i.....i:::::i.....i.....i.....i===#',
  '#::::i.....i.....i:::::i.....i.....i.....i===#',
  '#####i.....i.....i:::::i.....i.....i.....i===#',
  '#####i.....i.....i:::::i.....i.....i.....i===#',
  '#####i.....i.....i:::::i.....i.....i.....i===#',
  '#####i.....i.....i:::::i.....i.....i.....i===#',
  '#####i.....i.....i:~~~:i.....i.....i.....i===#',
  '#####i~~TT.i~~TT.i:~~~:i~~TT.i~~TT.i~~TT.i===#',
  '#####i~~TT.i~~TT.i:~~~:i~~TT.i~~TT.i~~TT.i===#',
  '##############################################',
  '##############################################',
];

export const ATLAS_FLOOR_4: LevelDef = {
  id: 'atlas-floor-4',
  name: 'Grand Atlas: Floor 4',
  map: MAP,
  labels: [],
  entries: [
    { id: 'stairs', name: 'stairwell', approach: [{ tx: 2.5, ty: 13.5 }, { tx: 2.5, ty: 10.5 }, { tx: 4.4, ty: 10.5 }] },
    { id: 'lift', name: 'service lift', approach: [{ tx: 20.5, ty: 20.5 }, { tx: 20.5, ty: 13.6 }] },
    { id: 'fire', name: 'fire escape', approach: [{ tx: 43.5, ty: 20.5 }, { tx: 43.5, ty: 10.5 }, { tx: 42.4, ty: 10.5 }] },
  ],
  intro: [
    'Control: Unit 7, floor 4.',
    'Command: Guests in some rooms. Check your targets. Entry via the {entry}.',
    'Command: Cleared to enter.',
  ],
  mission: {
    title: 'Grand Atlas: Floor 4',
    location: 'Grand Atlas Hotel, floor 4',
    time: '21:35',
    situation: [
      'Meridian security booked six rooms on floor 4.',
      'One long corridor, doors both sides. Guests in other rooms.',
      'Contractors in plate carriers in the corridor.',
    ],
    objective: 'Clear floor 4. Arrest the security team.',
    hostiles: { min: 4, max: 6 },
    loadout: 'Handguns, shotguns, rifles',
    civilians: { min: 2, max: 3, text: 'Hotel guests, a housekeeper' },
    reliability: 'Likely',
    hostileSlots: [
      { type: 'heavy', tx: 15.5, ty: 10.5, facing: 180 },
      { type: 'heavy', tx: 35.5, ty: 11.5, facing: 0 },
      { type: 'lookout', tx: 20.5, ty: 5.5, facing: 90 },
      { type: 'lookout', tx: 32.5, ty: 16.5, facing: 270 },
      { type: 'hider', tx: 31.5, ty: 4.5, facing: 90 },
      { type: 'hider', tx: 13.5, ty: 17.5, facing: 270 },
      { type: 'patroller', tx: 7.5, ty: 11.5, facing: 0, route: [{ tx: 39.5, ty: 11.5 }, { tx: 7.5, ty: 11.5 }] },
    ],
    civilianSlots: [{ tx: 8.5, ty: 6.5 }, { tx: 38.5, ty: 5.5 }, { tx: 26.5, ty: 16.5 }, { tx: 24.5, ty: 10.5 }],
    unknownZones: [],
    debriefNote: 'Floor 4 clear. Key cards for the conference suite recovered.',
  },
};
