import Phaser from 'phaser';
import { FONT } from '../config';
import type { Door, DoorAction } from './Door';

const LABELS: Record<DoorAction, string> = { slow: 'Open slowly', kick: 'Kick', peek: 'Peek', close: 'Close' };
const HINTS: Record<DoorAction, string> = { slow: 'quiet', kick: 'loud · stuns', peek: 'crack it', close: '' };
const ROW_H = 26;
const WIDTH = 176;

/**
 * The small menu a closed door offers. Lives in world space next to the cursor; clicks are
 * hit-tested by the scene so a menu click never doubles as a shot.
 */
export class DoorMenu {
  door: Door | null = null;
  private options: DoorAction[] = [];
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Graphics;
  private texts: Phaser.GameObjects.Text[] = [];
  private hover = -1;

  constructor(private scene: Phaser.Scene, depth: number) {
    this.bg = scene.add.graphics();
    this.container = scene.add.container(0, 0, [this.bg]).setDepth(depth).setVisible(false);
  }

  get isOpen(): boolean {
    return this.door !== null;
  }

  open(door: Door, x: number, y: number): void {
    this.door = door;
    this.options = door.options();
    this.hover = -1;
    for (const t of this.texts) t.destroy();
    this.texts = [];
    this.options.forEach((o, i) => {
      const label = this.scene.add.text(12, 8 + i * ROW_H, `${i + 1}  ${LABELS[o]}`, {
        fontFamily: FONT, fontSize: '14px', color: '#e5e7eb', resolution: 2,
      });
      const hint = this.scene.add.text(WIDTH - 10, 10 + i * ROW_H, HINTS[o], {
        fontFamily: FONT, fontSize: '10px', color: '#9ca3af', resolution: 2,
      }).setOrigin(1, 0);
      this.texts.push(label, hint);
    });
    this.container.add(this.texts);
    this.container.setPosition(x + 14, y - 10).setVisible(true);
    this.draw();
  }

  close(): void {
    this.door = null;
    this.container.setVisible(false);
    for (const t of this.texts) t.destroy();
    this.texts = [];
  }

  /** Index of the option under a world-space point, or -1. */
  optionAt(wx: number, wy: number): number {
    if (!this.door) return -1;
    const lx = wx - this.container.x;
    const ly = wy - this.container.y - 4;
    if (lx < 0 || lx > WIDTH || ly < 0) return -1;
    const i = Math.floor(ly / ROW_H);
    return i < this.options.length ? i : -1;
  }

  optionFor(index: number): DoorAction | undefined {
    return this.options[index];
  }

  setHover(index: number): void {
    if (index === this.hover) return;
    this.hover = index;
    this.draw();
  }

  private draw(): void {
    const g = this.bg;
    const h = this.options.length * ROW_H + 8;
    g.clear();
    g.fillStyle(0x0b1220, 0.94);
    g.fillRoundedRect(0, 0, WIDTH, h, 6);
    g.lineStyle(1, 0x60a5fa, 0.7);
    g.strokeRoundedRect(0, 0, WIDTH, h, 6);
    if (this.hover >= 0) {
      g.fillStyle(0x1e3a8a, 0.9);
      g.fillRoundedRect(3, 4 + this.hover * ROW_H, WIDTH - 6, ROW_H, 4);
    }
  }
}
