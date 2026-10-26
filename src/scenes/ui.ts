import Phaser from 'phaser';
import { FONT, RENDER_SCALE } from '../config';

export const TEXT = '#e5e7eb';
export const DIM = '#9ca3af';
export const ACCENT = '#60a5fa';
export const GOLD = '#facc15';
export const RED = '#ef4444';

type Style = Phaser.Types.GameObjects.Text.TextStyle;

/** Screen text style: crisp at any render scale, with a soft shadow so it reads over the game. */
export function style(size: number, color = TEXT, extra: Style = {}): Style {
  return {
    fontFamily: FONT, fontSize: `${size}px`, color, resolution: 2,
    shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 4, fill: true },
    ...extra,
  };
}

/** Screens are laid out in logical 1280x720 coordinates whatever the render scale. */
export function setupScreenCamera(scene: Phaser.Scene): void {
  scene.cameras.main.setOrigin(0, 0).setZoom(RENDER_SCALE);
}

/** A text button that highlights on hover and runs `onClick` on release. */
export function textButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  size = 18,
  color = TEXT,
): Phaser.GameObjects.Text {
  const t = scene.add.text(x, y, label, style(size, color)).setOrigin(0.5).setInteractive({ useHandCursor: true });
  t.on('pointerover', () => t.setColor(ACCENT));
  t.on('pointerout', () => t.setColor(color));
  t.on('pointerup', onClick);
  return t;
}
