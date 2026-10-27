import type { PropDef } from './types';

/** Width and height of a prop in tiles, as drawn. */
export function propSize(p: PropDef): { w: number; h: number } {
  const long = p.kind === 'van' ? 4.4 : 4;
  return p.vertical ? { w: 2, h: long } : { w: long, h: 2 };
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
