import type { FloorLabel, StationDef } from './range';

/** A position in tile units; fractions are allowed (0.5 is a tile's centre). */
export interface TilePos {
  tx: number;
  ty: number;
}

export interface EntryDef {
  id: string;
  /** Shown on the briefing map and in the intro, e.g. "front door". */
  name: string;
  /** The intro walk: from the drop-off point to where the operator stands at the entry. */
  approach: TilePos[];
}

export type HostileType = 'lookout' | 'patroller';

/**
 * How a hostile reacts to a fight it hears: pushers come for you, holders dig in and cover the
 * door you'd come through.
 */
export type Temperament = 'pusher' | 'holder';

export interface HostileSlot {
  type: HostileType;
  tx: number;
  ty: number;
  /** Degrees, 0 = east, 90 = south. */
  facing: number;
  /** Patrollers walk this loop. */
  route?: TilePos[];
  /** Fixes the reaction to a fight; rolled per deploy when left out. */
  temperament?: Temperament;
}

export interface CivilianSlot {
  tx: number;
  ty: number;
}

export type Reliability = 'Confirmed' | 'Likely' | 'Unverified';

export interface MissionDef {
  caseLabel: string;
  title: string;
  location: string;
  /** Case file text on the briefing screen. */
  summary: string[];
  hostiles: { min: number; max: number };
  loadout: string;
  civilians: { min: number; max: number; text: string };
  reliability: Reliability;
  hostileSlots: HostileSlot[];
  civilianSlots: CivilianSlot[];
  /** Areas the plans don't cover; greyed out on the briefing map. Tile rectangles, inclusive. */
  unknownZones: { x0: number; y0: number; x1: number; y1: number }[];
  /** A line for the debrief once the site is secured. */
  debriefNote: string;
}

/** Set dressing drawn into the level art; it doesn't block movement or sight. */
export interface PropDef {
  kind: 'van';
  tx: number;
  ty: number;
}

export interface LevelDef {
  id: string;
  name: string;
  map: readonly string[];
  labels: readonly FloorLabel[];
  props?: readonly PropDef[];
  entries: EntryDef[];
  /** Radio lines played over the intro walk. `{entry}` is replaced by the entry's name. */
  intro: string[];
  /** Training stations; present on the Range only. */
  stations?: readonly StationDef[];
  mission?: MissionDef;
}
