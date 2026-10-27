import Phaser from 'phaser';
import { RENDER_SCALE, VIEW_H, VIEW_W } from '../config';
import { sfx } from '../game/audio';
import { saveSettings, settings } from '../game/settings';
import type { GameScene, HudState, Outcome } from './GameScene';
import { ACCENT, DIM, GOLD, RED, setupScreenCamera, style, TEXT } from './ui';

/** How long a station's tutorial text stays up after entering it, then how long it fades. */
const TUTORIAL_HOLD = 9;
const TUTORIAL_FADE = 1.2;
const TOAST_LIFE = 3;
const BAR_HEIGHT = 74;

const CONTROLS: [string, string][] = [
  ['Move', 'WASD'],
  ['Sprint (loud)', 'Shift'],
  ['Aim / fire', 'Mouse / left click'],
  ['Open or close a door', 'E or right click'],
  ['Secure a civilian', 'Hold E next to them'],
  ['Reload', 'R'],
  ['Primary / pistol', '1 / 2'],
  ['Skip intro', 'Space'],
  ['Frame rate', 'F3'],
];

interface Toast {
  text: Phaser.GameObjects.Text;
  age: number;
}

interface Button {
  text: Phaser.GameObjects.Text;
  label: () => string;
  action: () => void;
  owner: Phaser.GameObjects.Container;
}

/**
 * Screen-space UI on top of the game. Deliberately minimal: ammo and armour in a corner, short
 * messages and, only in the tutorial, a station card that fades once read. Settings and
 * controls live in the Esc menu.
 */
export class HudScene extends Phaser.Scene {
  private tutorial!: Phaser.GameObjects.Container;
  private tutorialTitle!: Phaser.GameObjects.Text;
  private tutorialBody!: Phaser.GameObjects.Text;
  private tutorialAge = 0;
  private lastStation: string | undefined;

  private weaponName!: Phaser.GameObjects.Text;
  private reserve!: Phaser.GameObjects.Text;
  private gfx!: Phaser.GameObjects.Graphics;
  private overlay!: Phaser.GameObjects.Graphics;
  private subtitle!: Phaser.GameObjects.Text;
  private skipHint!: Phaser.GameObjects.Text;
  private securing!: Phaser.GameObjects.Text;

  private menu!: Phaser.GameObjects.Container;
  private debrief!: Phaser.GameObjects.Container;
  private debriefTitle!: Phaser.GameObjects.Text;
  private debriefStars!: Phaser.GameObjects.Text;
  private debriefBody!: Phaser.GameObjects.Text;
  private debriefNote!: Phaser.GameObjects.Text;
  private debriefBg!: Phaser.GameObjects.Graphics;
  private shownOutcome: Outcome | null = null;
  private buttons: Button[] = [];
  private toasts: Toast[] = [];
  private fps!: Phaser.GameObjects.Text;

  constructor() {
    super('hud');
  }

  private get game_(): GameScene {
    return this.scene.get('game') as GameScene;
  }

  create(): void {
    setupScreenCamera(this);
    this.tutorialAge = 0;
    this.lastStation = undefined;
    this.shownOutcome = null;
    this.buttons = [];
    this.toasts = [];

    this.overlay = this.add.graphics();
    this.tutorialTitle = this.add.text(0, 0, '', style(13, ACCENT, { fontStyle: 'bold' }));
    this.tutorialBody = this.add.text(0, 22, '', style(13, TEXT, { lineSpacing: 5, wordWrap: { width: 460 } }));
    this.tutorial = this.add.container(28, 24, [this.tutorialTitle, this.tutorialBody]).setAlpha(0);

    this.gfx = this.add.graphics();
    this.weaponName = this.add.text(VIEW_W - 28, VIEW_H - 62, '', style(11, DIM, { fontStyle: 'bold' })).setOrigin(1, 0);
    this.reserve = this.add.text(VIEW_W - 28, VIEW_H - 44, '', style(15, TEXT, { fontStyle: 'bold' })).setOrigin(1, 0);
    this.subtitle = this.add.text(VIEW_W / 2, VIEW_H - BAR_HEIGHT - 34, '', style(16, TEXT)).setOrigin(0.5, 0);
    this.skipHint = this.add.text(VIEW_W - 28, VIEW_H - 44, 'Space to skip', style(11, DIM)).setOrigin(1, 0);
    this.securing = this.add.text(VIEW_W / 2, VIEW_H * 0.62, 'Securing', style(12, TEXT)).setOrigin(0.5, 0);

    // F3 toggles a frame-rate readout, handy for checking performance on different machines.
    this.fps = this.add.text(VIEW_W - 16, 12, '', style(11, DIM)).setOrigin(1, 0).setVisible(false);
    this.input.keyboard?.addCapture('F3');
    this.input.keyboard?.on('keydown-F3', () => this.fps.setVisible(!this.fps.visible));
    this.input.keyboard?.on('keydown-ESC', () => this.toggleMenu());
    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.debrief.visible) this.buttons.find((b) => b.owner === this.debrief)?.action();
    });

    this.menu = this.buildMenu();
    this.debrief = this.buildDebrief();

    const onToast = (text: string) => this.showToast(text);
    this.game.events.on('toast', onToast);
    this.events.once('shutdown', () => this.game.events.off('toast', onToast));

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      const hovered = this.buttonAt(p);
      for (const b of this.buttons) b.text.setColor(b === hovered ? ACCENT : TEXT);
    });
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      const b = this.buttonAt(p);
      if (!b) return;
      b.action();
      for (const x of this.buttons) x.text.setText(x.label());
    });
  }

  update(_time: number, deltaMs: number): void {
    const dt = deltaMs / 1000;
    const s = this.game_.hud;
    if (!s) return;

    this.updateTutorial(s, dt);
    if (this.fps.visible) this.fps.setText(`${Math.round(this.game.loop.actualFps)} fps  ·  ${this.scale.width}x${this.scale.height}`);

    const cut = s.cutscene;
    this.gfx.clear();
    this.overlay.clear();
    if (!cut) this.drawStatus(s);
    for (const t of [this.weaponName, this.reserve]) t.setVisible(!cut);
    this.drawOverlay(s);
    this.subtitle.setText(cut?.subtitle ?? '');
    this.skipHint.setVisible(!!cut);
    this.securing.setVisible(s.securing !== null);

    this.toasts = this.toasts.filter((t) => {
      t.age += dt;
      t.text.setAlpha(Math.min(1, t.age / 0.15, (TOAST_LIFE - t.age) / 0.6));
      if (t.age >= TOAST_LIFE) t.text.destroy();
      return t.age < TOAST_LIFE;
    });
    this.toasts.forEach((t, i) => t.text.setY(VIEW_H * 0.72 + i * 22));

    if (s.outcome && s.outcome !== this.shownOutcome) this.showDebrief(s.outcome);
  }

  // ---------------------------------------------------------------- in-game readouts

  private updateTutorial(s: HudState, dt: number): void {
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
  }

  /** Ammo as a row of rounds with spare rounds beside it; armour and health above. */
  private drawStatus(s: HudState): void {
    const g = this.gfx;
    const w = s.weapon;
    const round = w.magSize > 15 ? 3 : 4;
    const gap = 2;
    const right = VIEW_W - 28 - this.reserve.width - 12;
    const y = VIEW_H - 41;
    const shown = w.reload !== null ? Math.round(w.magSize * w.reload) : w.mag;
    for (let i = 0; i < w.magSize; i++) {
      const x = right - (w.magSize - i) * (round + gap);
      const color = w.reload !== null ? 0x60a5fa : w.mag === 0 ? 0xef4444 : 0xe5e7eb;
      g.fillStyle(0x000000, 0.45);
      g.fillRect(x + 1, y + 1, round, 14);
      g.fillStyle(color, i < shown ? 0.95 : 0.15);
      g.fillRect(x, y, round, 14);
    }
    this.weaponName.setText(w.name.toUpperCase());
    this.reserve.setText(`${w.reserve}`);

    // Armour (blue) then health (white), right-aligned above the weapon name.
    const pips = [{ on: s.armor > 0, color: 0x60a5fa }, { on: s.health > 1, color: 0xe5e7eb }, { on: s.health > 0, color: 0xe5e7eb }];
    pips.forEach((p, i) => {
      const x = VIEW_W - 28 - (pips.length - i) * 22 + 4;
      g.fillStyle(0x000000, 0.45);
      g.fillRect(x + 1, VIEW_H - 83, 18, 6);
      g.fillStyle(p.on ? p.color : 0xef4444, p.on ? 0.95 : 0.35);
      g.fillRect(x, VIEW_H - 84, 18, 6);
    });

    if (s.securing !== null) {
      g.fillStyle(0x000000, 0.5);
      g.fillRect(VIEW_W / 2 - 60, VIEW_H * 0.62 + 20, 120, 4);
      g.fillStyle(0xfacc15, 1);
      g.fillRect(VIEW_W / 2 - 60, VIEW_H * 0.62 + 20, 120 * s.securing, 4);
    }
  }

  private drawOverlay(s: HudState): void {
    const g = this.overlay;
    // A red flash at the edges of the screen when hit.
    if (s.hurt > 0) {
      for (let i = 0; i < 6; i++) {
        const inset = i * 14;
        g.lineStyle(14, 0xb91c1c, s.hurt * (0.4 - i * 0.06));
        g.strokeRect(inset + 7, inset + 7, VIEW_W - inset * 2 - 14, VIEW_H - inset * 2 - 14);
      }
    }
    // Letterbox bars for the intro.
    const bars = s.cutscene?.bars ?? 0;
    if (bars > 0) {
      g.fillStyle(0x000000, 1);
      g.fillRect(0, 0, VIEW_W, BAR_HEIGHT * bars);
      g.fillRect(0, VIEW_H - BAR_HEIGHT * bars, VIEW_W, BAR_HEIGHT * bars);
    }
  }

  private showToast(text: string): void {
    const t = this.add.text(VIEW_W / 2, VIEW_H * 0.72, text, style(14, TEXT)).setOrigin(0.5, 0).setAlpha(0);
    this.toasts.push({ text: t, age: 0 });
    if (this.toasts.length > 3) this.toasts.shift()!.text.destroy();
  }

  // ---------------------------------------------------------------- menu and debrief

  private toggleMenu(): void {
    if (this.debrief.visible) return;
    const open = !this.menu.visible;
    this.menu.setVisible(open);
    if (open) this.scene.pause('game');
    else this.scene.resume('game');
  }

  private addButton(owner: Phaser.GameObjects.Container, x: number, y: number, label: () => string, action: () => void, size = 18): void {
    const text = this.add.text(x, y, label(), style(size, TEXT)).setOrigin(0.5);
    owner.add(text);
    this.buttons.push({ text, label, action, owner });
  }

  private buttonAt(p: Phaser.Input.Pointer): Button | undefined {
    // The HUD camera is zoomed, so convert from screen to layout coordinates.
    const x = p.x / RENDER_SCALE, y = p.y / RENDER_SCALE;
    return this.buttons.find((b) => b.owner.visible && b.text.getBounds().contains(x, y));
  }

  private buildMenu(): Phaser.GameObjects.Container {
    const cx = VIEW_W / 2;
    const bg = this.add.graphics();
    bg.fillStyle(0x05070a, 0.82);
    bg.fillRect(0, 0, VIEW_W, VIEW_H);
    const menu = this.add.container(0, 0, [bg, this.add.text(cx, 130, 'PAUSED', style(30, TEXT, { fontStyle: 'bold' })).setOrigin(0.5)]);
    menu.setDepth(80).setVisible(false);

    // In a realism career there's no restarting a mission, and quitting one ends the career.
    const realism = this.game_.realism;
    let quitArmed = false;
    const items: [() => string, () => void][] = [
      [() => 'Resume', () => this.toggleMenu()],
      [() => `Blood effects: ${settings.blood ? 'On' : 'Off'}`, () => { settings.blood = !settings.blood; saveSettings(); }],
      [() => `Sound: ${settings.sound ? 'On' : 'Off'}`, () => { settings.sound = !settings.sound; sfx.muted = !settings.sound; saveSettings(); }],
      ...(realism ? [] : [[() => 'Restart', () => { this.scene.resume('game'); this.game_.retry(); }] as [() => string, () => void]]),
      realism
        ? [() => (quitArmed ? 'Click again to end your career' : 'Quit (ends your realism career)'), () => {
          if (!quitArmed) {
            quitArmed = true;
            return;
          }
          this.scene.resume('game');
          this.game_.abandon();
        }]
        : [() => 'Quit to menu', () => { this.scene.resume('game'); this.game_.toMenu(); }],
    ];
    items.forEach(([label, action], i) => this.addButton(menu, cx, 190 + i * 38, label, action));

    menu.add(this.add.text(cx, 392, 'CONTROLS', style(11, ACCENT, { fontStyle: 'bold' })).setOrigin(0.5));
    CONTROLS.forEach(([what, key], i) => {
      menu.add(this.add.text(cx - 12, 416 + i * 22, what, style(13, DIM)).setOrigin(1, 0));
      menu.add(this.add.text(cx + 12, 416 + i * 22, key, style(13, TEXT)));
    });
    return menu;
  }

  private buildDebrief(): Phaser.GameObjects.Container {
    const cx = VIEW_W / 2;
    const bg = this.add.graphics();
    this.debriefBg = bg;
    this.debriefTitle = this.add.text(cx, 175, '', style(24, TEXT, { fontStyle: 'bold' })).setOrigin(0.5);
    this.debriefStars = this.add.text(cx, 222, '', style(40, GOLD)).setOrigin(0.5);
    this.debriefBody = this.add.text(cx - 220, 262, '', style(14, TEXT, { lineSpacing: 7 }));
    this.debriefNote = this.add.text(cx - 220, 0, '', style(13, DIM, { fontStyle: 'italic', wordWrap: { width: 440 } }));
    const box = this.add.container(0, 0, [
      bg,
      this.add.text(cx, 145, 'DEBRIEF', style(12, ACCENT, { fontStyle: 'bold' })).setOrigin(0.5),
      this.debriefTitle, this.debriefStars, this.debriefBody, this.debriefNote,
    ]).setDepth(90).setVisible(false);
    return box;
  }

  private showDebrief(o: Outcome): void {
    this.shownOutcome = o;
    this.menu.setVisible(false);
    for (const b of this.buttons.filter((x) => x.owner === this.debrief)) b.text.destroy();
    this.buttons = this.buttons.filter((x) => x.owner !== this.debrief);

    this.debriefTitle.setText(o.title).setColor(o.success ? TEXT : RED);
    this.debriefStars.setText(o.stars ? o.stars.map((b) => (b ? '★' : '☆')).join(' ') : '');
    this.debriefBody.setY(o.stars ? 262 : 222).setText(o.lines.join('\n'));
    this.debriefNote.setY(this.debriefBody.y + this.debriefBody.height + 18).setText(o.note ?? '');

    // Size the panel to its content.
    const cx = VIEW_W / 2;
    const contentBottom = o.note ? this.debriefNote.y + this.debriefNote.height : this.debriefBody.y + this.debriefBody.height;
    const buttonsY = contentBottom + 44;
    const bg = this.debriefBg;
    bg.clear();
    bg.fillStyle(0x05070a, 0.75);
    bg.fillRect(0, 0, VIEW_W, VIEW_H);
    bg.fillStyle(0x0b1220, 0.97);
    bg.fillRoundedRect(cx - 280, 120, 560, buttonsY + 36 - 120, 10);
    bg.lineStyle(1, 0x60a5fa, 0.6);
    bg.strokeRoundedRect(cx - 280, 120, 560, buttonsY + 36 - 120, 10);

    if (o.careerOver) {
      this.addButton(this.debrief, cx, buttonsY, () => 'Back to the academy', () => this.game_.toMenu(), 16);
    } else if (o.success) {
      this.addButton(this.debrief, cx - 90, buttonsY, () => 'Continue', () => this.game_.toMenu(), 16);
      this.addButton(this.debrief, cx + 90, buttonsY, () => 'Play again', () => this.game_.retry(), 16);
    } else {
      this.addButton(this.debrief, cx - 90, buttonsY, () => 'Retry', () => this.game_.retry(), 16);
      this.addButton(this.debrief, cx + 90, buttonsY, () => 'Menu', () => this.game_.toMenu(), 16);
    }
    this.debrief.setVisible(true);
  }
}
