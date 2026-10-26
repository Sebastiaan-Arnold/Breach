import Phaser from 'phaser';
import { COLORS, VIEW_H, VIEW_W } from './config';
import { HudScene } from './scenes/HudScene';
import { RangeScene } from './scenes/RangeScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: VIEW_W,
  height: VIEW_H,
  backgroundColor: COLORS.void,
  // 16:9, scaled to fit: the same layout has to work on a phone later.
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true },
  input: { activePointers: 2 },
  scene: [RangeScene, HudScene],
});

if (import.meta.env.DEV) (window as unknown as { game: Phaser.Game }).game = game;
