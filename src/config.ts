import { DEG } from './core/geometry';

export const TILE = 32;
export const VIEW_W = 1280;
export const VIEW_H = 720;

export const FONT = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

/** Flat colour coding: blue for you, red for hostiles, yellow for civilians. */
export const COLORS = {
  void: 0x07090c,
  floor: 0x2a241d,
  floorLine: 0x342c23,
  floorDark: 0x191613,
  floorDarkLine: 0x201c18,
  wall: 0x3b424d,
  wallEdge: 0x9aa6b8,
  plywood: 0x6f5232,
  plywoodEdge: 0xc79c68,
  barrier: 0x6e5236,
  barrierStripe: 0xd4a017,
  furniture: 0x3d342b,
  furnitureEdge: 0x6a5a48,
  door: 0xb98552,
  doorEdge: 0xe0b07a,
  player: 0x3b82f6,
  playerEdge: 0xbfdbfe,
  suspect: 0xef4444,
  civilian: 0xfacc15,
  cardboard: 0xc8a46a,
  laser: 0xff3b3b,
  visionWarm: 0xffc070,
  hudText: 0xe5e7eb,
  hudDim: 0x9ca3af,
  hudAccent: 0x60a5fa,
  ok: 0x4ade80,
} as const;

export const VISION = {
  halfFov: 50 * DEG,
  rangeLit: 680,
  rangeDarkFlashlight: 300,
  rangeDarkNoLight: 90,
  peripheral: 56,
  sweepStep: 0.8 * DEG,
  /** How dark remembered-but-not-visible areas are. */
  rememberedShade: 0.62,
};

export const MOVE = {
  walk: 115,
  sprint: 205,
  radius: 10,
  /** Seconds between footsteps. */
  stepWalk: 0.5,
  stepSprint: 0.3,
};

/** Noise radii in px. Enemy AI will listen for these; for now they drive the on-screen ripples. */
export const NOISE = {
  sprintStep: 280,
  doorSlow: 110,
  doorClose: 110,
  peek: 45,
  kick: 760,
  reload: 70,
};

export const REACH = 64;
