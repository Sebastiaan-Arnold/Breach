import Phaser from 'phaser';
import { COLORS, RENDER_SCALE, VIEW_H, VIEW_W } from './config';
import { BriefingScene } from './scenes/BriefingScene';
import { GameScene } from './scenes/GameScene';
import { HudScene } from './scenes/HudScene';
import { MenuScene } from './scenes/MenuScene';
import { PromotionScene } from './scenes/PromotionScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: VIEW_W * RENDER_SCALE,
  height: VIEW_H * RENDER_SCALE,
  backgroundColor: COLORS.void,
  // 16:9, scaled to fit: the same layout has to work on a phone later.
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true },
  input: { activePointers: 2 },
  scene: [MenuScene, BriefingScene, GameScene, HudScene, PromotionScene],
});

if (import.meta.env.DEV) (window as unknown as { game: Phaser.Game }).game = game;
