import Phaser from 'phaser';
import { FONT, RENDER_SCALE, VIEW_H, VIEW_W } from '../config';
import { sfx } from '../game/audio';
import { saveSettings, settings } from '../game/settings';
import type { RangeScene } from './RangeScene';

const TEXT = '#e5e7eb';
const DIM = '#9ca3af';
const ACCENT = '#60a5fa';
const GOLD = '#facc15';
const RED = '#ef4444';

/** How long a station's tutorial text stays up after entering it, then how long it fades. */
const TUTORIAL_HOLD = 9;
const TUTORIAL_FADE = 1.2;
const TOAST_LIFE = 3;

const CONTROLS: [string, string][] = [
  ['Move', 'WASD'],
  ['Sprint (loud)', 'Shift'],
  ['Aim / fire', 'Mouse / left click'],
  ['Open or close a door', 'E or right click'],
  ['Reload', 'R'],
  ['Flashlight', 'F'],
  ['Switch gun (Range only)', '1-4'],
  ['Frame rate', 'F3'],
];

type Style = Phaser.Types.GameObjects.Text.TextStyle;

interface Toast {
  text: Phaser.GameObjects.Text;
  age: number;
}

interface MenuItem {
  text: Phaser.GameObjects.Text;
  label: () => string;
  action: () => void;
}

/**
 * Screen-space UI on top of the game. Deliberately minimal: a small ammo readout, short toasts
 * and, only in the tutorial, a station card that fades once read. Everything else (settings,
 * controls) lives in the Esc menu.
 */
export class HudScene extends Phaser.Scene {
  private tutorial!: Phaser.GameObjects.Container;
  private tutorialTitle!: Phaser.GameObjects.Text;
  private tutorialBody!: Phaser.GameObjects.Text;
  private tutorialAge = 0;
  private lastStation: string | undefined;

  private weaponName!: Phaser.GameObjects.Text;
  private reserve!: Phaser.GameObjects.Text;
  private light!: Phaser.GameObjects.Text;
  private ammoGfx!: Phaser.GameObjects.Graphics;

  private title!: Phaser.GameObjects.Container;
  private menu!: Phaser.GameObjects.Container;
  private menuItems: MenuItem[] = [];
  private debrief!: Phaser.GameObjects.Container;
  private debriefBody!: Phaser.GameObjects.Text;
  private debriefStars!: Phaser.GameObjects.Text;
  private toasts: Toast[] = [];
  private fps!: Phaser.GameObjects.Text;

  constructor() {
    super('hud');
  }

  create(): void {
    // Lay out in logical 1280x720 coordinates whatever the render scale.
    this.cameras.main.setOrigin(0, 0).setZoom(RENDER_SCALE);
    sfx.muted = !settings.sound;

    this.tutorialTitle = this.add.text(0, 0, '', style(13, ACCENT, { fontStyle: 'bold' }));
    this.tutorialBody = this.add.text(0, 22, '', style(13, TEXT, { lineSpacing: 5, wordWrap: { width: 460 } }));
    this.tutorial = this.add.container(28, 24, [this.tutorialTitle, this.tutorialBody]).setAlpha(0);

    this.ammoGfx = this.add.graphics();
    this.weaponName = this.add.text(VIEW_W - 28, VIEW_H - 62, '', style(11, DIM, { fontStyle: 'bold' })).setOrigin(1, 0);
    this.reserve = this.add.text(VIEW_W - 28, VIEW_H - 44, '', style(15, TEXT, { fontStyle: 'bold' })).setOrigin(1, 0);
    this.light = this.add.text(VIEW_W - 28, VIEW_H - 82, '', style(10, DIM, { fontStyle: 'bold' })).setOrigin(1, 0);

    // F3 toggles a frame-rate readout, handy for checking performance on different machines.
    this.fps = this.add.text(VIEW_W - 16, 12, '', style(11, DIM)).setOrigin(1, 0).setVisible(false);
    this.input.keyboard?.addCapture('F3');
    this.input.keyboard?.on('keydown-F3', () => this.fps.setVisible(!this.fps.visible));
    this.input.keyboard?.on('keydown-ESC', () => this.toggleMenu());

    this.title = this.buildTitle();
    this.menu = this.buildMenu();
    this.debrief = this.buildDebrief();
    if (this.registry.get('started') === true) this.title.setVisible(false);

    const onToast = (text: string) => this.showToast(text);
    this.game.events.on('toast', onToast);
    this.events.once('shutdown', () => this.game.events.off('toast', onToast));

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.hoverMenu(p));
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (this.title.visible) {
        sfx.unlock();
        this.registry.set('started', true);
        this.title.setVisible(false);
      } else if (this.menu.visible) {
        this.clickMenu(p);
      } else if (this.debrief.visible) {
        this.scene.get('range').scene.restart();
      }
    });
  }

  update(_time: number, deltaMs: number): void {
    const dt = deltaMs / 1000;
    const s = (this.scene.get('range') as RangeScene).hud;
    if (!s) return;

    // Tutorial card: appears on entering a station, fades once it has had time to be read.
    const station = s.tutorial ? s.station : undefined;
    if (station?.id !== this.lastStation) {
      this.lastStation = station?.id;
      this.tutorialAge = 0;
      if (station) {
        this.tutorialTitle.setText(station.name.toUpperCase());
        this.tutorialBody.setText(station.brief.join('\n'));
      }
    }
    if (!this.menu.visible) this.tutorialAge += dt;
    const fade = 1 - Phaser.Math.Clamp((this.tutorialAge - TUTORIAL_HOLD) / TUTORIAL_FADE, 0, 1);
    this.tutorial.setAlpha(station ? fade : 0);

    if (this.fps.visible) this.fps.setText(`${Math.round(this.game.loop.actualFps)} fps  ·  ${this.scale.width}x${this.scale.height}`);
    this.drawAmmo(s.weapon);
    this.light.setText(s.dark ? (s.flashlight ? 'LIGHT ON' : 'LIGHT OFF') : '');
    this.light.setColor(s.flashlight ? DIM : RED);

    this.toasts = this.toasts.filter((t) => {
      t.age += dt;
      t.text.setAlpha(Math.min(1, t.age / 0.15, (TOAST_LIFE - t.age) / 0.6));
      if (t.age >= TOAST_LIFE) t.text.destroy();
      return t.age < TOAST_LIFE;
    });
    this.toasts.forEach((t, i) => t.text.setY(VIEW_H * 0.72 + i * 22));

    if (s.debrief && !this.debrief.visible) this.showDebrief(s.debrief);
    if (!s.debrief && this.debrief.visible) this.debrief.setVisible(false);
  }

  /** The magazine as a row of rounds, with the spare rounds as a number beside it. */
  private drawAmmo(w: RangeScene['hud']['weapon']): void {
    const g = this.ammoGfx;
    g.clear();
    const round = w.magSize > 15 ? 3 : 4;
    const gap = 2;
    const right = VIEW_W - 28 - this.reserve.width - 12;
    const y = VIEW_H - 41;
    const shown = w.reload !== null ? Math.round(w.magSize * w.reload) : w.mag;
    for (let i = 0; i < w.magSize; i++) {
      const x = right - (w.magSize - i) * (round + gap);
      const loaded = i < shown;
      const color = w.reload !== null ? 0x60a5fa : w.mag === 0 ? 0xef4444 : 0xe5e7eb;
      g.fillStyle(0x000000, 0.45);
      g.fillRect(x + 1, y + 1, round, 14);
      g.fillStyle(color, loaded ? 0.95 : 0.15);
      g.fillRect(x, y, round, 14);
    }
    this.weaponName.setText(w.name.toUpperCase());
    this.reserve.setText(`${w.reserve}`);
  }

  private showToast(text: string): void {
    const t = this.add.text(VIEW_W / 2, VIEW_H * 0.72, text, style(14, TEXT)).setOrigin(0.5, 0).setAlpha(0);
    this.toasts.push({ text: t, age: 0 });
    if (this.toasts.length > 3) this.toasts.shift()!.text.destroy();
  }

  // ---------------------------------------------------------------- menu

  private toggleMenu(): void {
    if (this.title.visible || this.debrief.visible) return;
    const open = !this.menu.visible;
    this.menu.setVisible(open);
    if (open) this.scene.pause('range');
    else this.scene.resume('range');
  }

  private buildMenu(): Phaser.GameObjects.Container {
    const cx = VIEW_W / 2;
    const bg = this.add.graphics();
    bg.fillStyle(0x05070a, 0.82);
    bg.fillRect(0, 0, VIEW_W, VIEW_H);
    const items: Phaser.GameObjects.GameObject[] = [
      bg,
      this.add.text(cx, 150, 'PAUSED', style(30, TEXT, { fontStyle: 'bold' })).setOrigin(0.5),
    ];

    const entries: [() => string, () => void][] = [
      [() => 'Resume', () => this.toggleMenu()],
      [() => `Blood effects: ${settings.blood ? 'On' : 'Off'}`, () => { settings.blood = !settings.blood; saveSettings(); }],
      [() => `Sound: ${settings.sound ? 'On' : 'Off'}`, () => { settings.sound = !settings.sound; sfx.muted = !settings.sound; saveSettings(); }],
      [() => 'Restart', () => { this.toggleMenu(); this.scene.get('range').scene.restart(); }],
    ];
    this.menuItems = entries.map(([label, action], i) => {
      const text = this.add.text(cx, 220 + i * 40, label(), style(18, TEXT)).setOrigin(0.5);
      items.push(text);
      return { text, label, action };
    });

    items.push(this.add.text(cx, 400, 'CONTROLS', style(11, ACCENT, { fontStyle: 'bold' })).setOrigin(0.5));
    CONTROLS.forEach(([what, key], i) => {
      items.push(this.add.text(cx - 12, 426 + i * 22, what, style(13, DIM)).setOrigin(1, 0));
      items.push(this.add.text(cx + 12, 426 + i * 22, key, style(13, TEXT)));
    });
    items.push(this.add.text(cx, VIEW_H - 40, 'Esc to resume', style(11, DIM)).setOrigin(0.5));
    return this.add.container(0, 0, items).setDepth(80).setVisible(false);
  }

  private menuItemAt(p: Phaser.Input.Pointer): MenuItem | undefined {
    // The HUD camera is zoomed, so convert from screen to layout coordinates.
    const x = p.x / RENDER_SCALE, y = p.y / RENDER_SCALE;
    return this.menuItems.find((m) => m.text.getBounds().contains(x, y));
  }

  private hoverMenu(p: Phaser.Input.Pointer): void {
    if (!this.menu.visible) return;
    const hovered = this.menuItemAt(p);
    for (const m of this.menuItems) m.text.setColor(m === hovered ? ACCENT : TEXT);
  }

  private clickMenu(p: Phaser.Input.Pointer): void {
    const item = this.menuItemAt(p);
    if (!item) return;
    item.action();
    for (const m of this.menuItems) m.text.setText(m.label());
  }

  // ---------------------------------------------------------------- title and debrief

  private buildTitle(): Phaser.GameObjects.Container {
    const bg = this.add.graphics();
    bg.fillStyle(0x05070a, 0.86);
    bg.fillRect(0, 0, VIEW_W, VIEW_H);
    const cx = VIEW_W / 2;
    const items: Phaser.GameObjects.GameObject[] = [
      bg,
      this.add.text(cx, 190, 'BREACH', style(84, TEXT, { fontStyle: 'bold' })).setOrigin(0.5),
      this.add.text(cx, 262, 'PORT ARDLEY POLICE DEPARTMENT  ·  ACADEMY', style(14, ACCENT, { fontStyle: 'bold' })).setOrigin(0.5),
      this.add.text(cx, 330, [
        'Recruit, this is the Range. Five stations teach you the job:',
        'movement, the laser, doors, when not to shoot, and a dark kill house.',
        '',
        'You only know what you see. Slow is smooth.',
      ].join('\n'), style(15, DIM, { align: 'center', lineSpacing: 6 })).setOrigin(0.5, 0),
      this.add.text(cx, 500, 'CLICK TO BEGIN', style(18, TEXT, { fontStyle: 'bold' })).setOrigin(0.5),
      this.add.text(cx, 530, 'Esc for settings and controls', style(12, DIM)).setOrigin(0.5),
      this.add.text(cx, VIEW_H - 40, `v${__APP_VERSION__}  ·  Prototype: the Range`, style(11, DIM)).setOrigin(0.5),
    ];
    return this.add.container(0, 0, items).setDepth(100);
  }

  private buildDebrief(): Phaser.GameObjects.Container {
    const bg = this.add.graphics();
    bg.fillStyle(0x05070a, 0.75);
    bg.fillRect(0, 0, VIEW_W, VIEW_H);
    bg.fillStyle(0x0b1220, 0.97);
    bg.fillRoundedRect(VIEW_W / 2 - 260, 150, 520, 400, 10);
    bg.lineStyle(1, 0x60a5fa, 0.6);
    bg.strokeRoundedRect(VIEW_W / 2 - 260, 150, 520, 400, 10);
    const cx = VIEW_W / 2;
    this.debriefStars = this.add.text(cx, 250, '', style(42, GOLD)).setOrigin(0.5);
    this.debriefBody = this.add.text(cx - 200, 300, '', style(15, TEXT, { lineSpacing: 8 }));
    const items = [
      bg,
      this.add.text(cx, 180, 'DEBRIEF', style(12, ACCENT, { fontStyle: 'bold' })).setOrigin(0.5),
      this.add.text(cx, 205, 'Range qualification complete', style(22, TEXT, { fontStyle: 'bold' })).setOrigin(0.5),
      this.debriefStars,
      this.debriefBody,
      this.add.text(cx, 515, 'Click or press Enter to run the Range again', style(13, DIM)).setOrigin(0.5),
    ];
    return this.add.container(0, 0, items).setDepth(90).setVisible(false);
  }

  private showDebrief(d: NonNullable<RangeScene['hud']['debrief']>): void {
    const star = (b: boolean) => (b ? '★' : '☆');
    const line = (b: boolean, label: string) => `${b ? '✓' : '✗'}  ${label}`;
    this.debriefStars.setText(d.stars.map(star).join(' '));
    const acc = d.shots ? Math.round((d.hits / d.shots) * 100) : 0;
    this.debriefBody.setText([
      line(d.stars[0], 'All stations completed'),
      line(d.stars[1], d.civiliansHit ? `Civilians hit: ${d.civiliansHit}` : 'No civilians hit'),
      line(d.stars[2], 'No damage taken'),
      '',
      `Shots fired   ${d.shots}`,
      `Hits          ${d.hits}   (${acc}% accuracy)`,
    ].join('\n'));
    this.debrief.setVisible(true);
  }
}

/** HUD text style: crisp at any render scale, with a soft shadow so it reads over the game. */
function style(size: number, color = TEXT, extra: Style = {}): Style {
  return {
    fontFamily: FONT, fontSize: `${size}px`, color, resolution: 2,
    shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 4, fill: true },
    ...extra,
  };
}
