import type { WeaponId } from '../game/weapons';
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
  /**
   * The intro walk: from the drop-off point to where the operator stands at the entry. The
   * drop-off can differ per entry, so far-side entries don't need a long walk round.
   */
  approach: TilePos[];
}

/**
 * Lookouts hold a post, patrollers walk a route, hiders wait behind cover with a shotgun and only
 * fire at close range.
 */
export type HostileType = 'lookout' | 'patroller' | 'hider';

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
  /** Always there, whatever the roll (a hostage's captor, say). */
  always?: boolean;
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
  /** A specialty mission issues its own primary gun instead of the player's choice. */
  issued?: WeaponId;
  /** What makes this case different, as one highlighted line in the briefing's intel. */
  twist?: { label: string; text: string };
  /**
   * Someone held against their will. Once the alarm goes up (a suspect sees you, or a shot or
   * shout), the operator has `seconds` to reach and secure them, or the mission fails.
   */
  hostage?: TilePos & { seconds: number };
  /**
   * Evidence that gets destroyed (shredded, flushed) if the alarm goes up: the nearest suspect
   * runs to it, and after `seconds` there it's gone, and with it the first star.
   */
  evidence?: TilePos & { seconds: number };
}

/**
 * Set dressing drawn into the level art. Props don't block anything themselves; cars and
 * containers sit on furniture tiles ('T') in the map, which do.
 */
export interface PropDef {
  kind: 'van' | 'car' | 'container' | 'rack' | 'truck';
  tx: number;
  ty: number;
  /** Vehicles and containers lie east-west unless vertical. */
  vertical?: boolean;
  /** Size in tiles for racking (and to override the default size of anything else). */
  w?: number;
  h?: number;
  color?: number;
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
