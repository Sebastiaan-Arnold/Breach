import type { PropDef } from './types';

/** Width and height of a prop in tiles, as drawn. */
export function propSize(p: PropDef): { w: number; h: number } {
  if (p.w !== undefined && p.h !== undefined) return { w: p.w, h: p.h };
  const long = p.kind === 'van' ? 4.4 : p.kind === 'truck' ? 9 : 4;
  const wide = p.kind === 'truck' ? 3 : 2;
  return p.vertical ? { w: wide, h: long } : { w: long, h: wide };
}

/**
 * The tiles a prop stands on. Props are solid: nobody walks through a parked van, a car or a
 * container (cars and containers also sit on furniture tiles in the map).
 */
export function propTiles(p: PropDef): { tx: number; ty: number }[] {
  const { w, h } = propSize(p);
  const tiles: { tx: number; ty: number }[] = [];
  for (let ty = Math.floor(p.ty); ty < Math.ceil(p.ty + h); ty++) {
    for (let tx = Math.floor(p.tx); tx < Math.ceil(p.tx + w); tx++) tiles.push({ tx, ty });
  }
  return tiles;
}
