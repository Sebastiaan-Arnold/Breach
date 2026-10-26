import Phaser from 'phaser';
import { FONT, VIEW_H, VIEW_W } from '../config';
import { sfx } from '../game/audio';
import type { RangeScene } from './RangeScene';

const TEXT = '#e5e7eb';
const DIM = '#9ca3af';
const ACCENT = '#60a5fa';
const GOLD = '#facc15';

interface Toast {
  text: Phaser.GameObjects.Text;
  age: number;
}

/** Screen-space UI on top of the Range: station brief, checklist, ammo, toasts, title and debrief. */
export class HudScene extends Phaser.Scene {
  private stationTitle!: Phaser.GameObjects.Text;
  private stationBrief!: Phaser.GameObjects.Text;
  private checklist!: Phaser.GameObjects.Text;
  private weaponName!: Phaser.GameObjects.Text;
  private ammo!: Phaser.GameObjects.Text;
  private status!: Phaser.GameObjects.Text;
  private reloadBar!: Phaser.GameObjects.Graphics;
  private panels!: Phaser.GameObjects.Graphics;
  private title!: Phaser.GameObjects.Container;
  private debrief!: Phaser.GameObjects.Container;
  private debriefBody!: Phaser.GameObjects.Text;
  private debriefStars!: Phaser.GameObjects.Text;
  private toasts: Toast[] = [];

  constructor() {
    super('hud');
  }

  create(): void {
    const style = (size: number, color = TEXT, extra: Phaser.Types.GameObjects.Text.TextStyle = {}) => ({
      fontFamily: FONT, fontSize: `${size}px`, color, resolution: 2, ...extra,
    });

    this.panels = this.add.graphics();
    this.add.text(24, 20, 'THE RANGE  ·  PORT ARDLEY POLICE ACADEMY', style(11, ACCENT, { fontStyle: 'bold' }));
    this.stationTitle = this.add.text(24, 38, '', style(20, TEXT, { fontStyle: 'bold' }));
    this.stationBrief = this.add.text(24, 66, '', style(13, DIM, { lineSpacing: 4, wordWrap: { width: 470 } }));

    this.add.text(VIEW_W - 24, 20, 'QUALIFICATION', style(11, ACCENT, { fontStyle: 'bold' })).setOrigin(1, 0);
    this.checklist = this.add.text(VIEW_W - 24, 40, '', style(13, TEXT, { align: 'right', lineSpacing: 6 })).setOrigin(1, 0);

    this.add.text(24, VIEW_H - 30,
      'WASD move · Shift sprint · Mouse aim · LMB fire · E / RMB door · R reload · F light · 1-4 guns',
      style(11, DIM));

    this.weaponName = this.add.text(VIEW_W - 24, VIEW_H - 98, '', style(12, DIM, { fontStyle: 'bold' })).setOrigin(1, 0);
    this.ammo = this.add.text(VIEW_W - 24, VIEW_H - 82, '', style(30, TEXT, { fontStyle: 'bold' })).setOrigin(1, 0);
    this.status = this.add.text(VIEW_W - 24, VIEW_H - 40, '', style(11, DIM)).setOrigin(1, 0);
    this.reloadBar = this.add.graphics();

    this.title = this.buildTitle(style);
    this.debrief = this.buildDebrief(style);
    if (this.registry.get('started') === true) this.title.setVisible(false);

    const onToast = (text: string) => this.showToast(text, style(15, TEXT));
    this.game.events.on('toast', onToast);
    this.events.once('shutdown', () => this.game.events.off('toast', onToast));

    this.input.on('pointerup', () => {
      if (this.title.visible) {
        sfx.unlock();
        this.registry.set('started', true);
        this.title.setVisible(false);
      } else if (this.debrief.visible) {
        this.scene.get('range').scene.restart();
      }
    });
  }

  update(_time: number, deltaMs: number): void {
    const range = this.scene.get('range') as RangeScene;
    const s = range.hud;
    if (!s) return;

    this.stationTitle.setText(s.station?.name ?? '');
    this.stationBrief.setText(s.station?.brief.join('\n') ?? '');
    this.checklist.setText(s.checklist.map((c) => `${c.name}  ${c.detail}  ${c.done ? '✓' : '○'}`).join('\n'));

    const w = s.weapon;
    this.weaponName.setText(w.name.toUpperCase());
    this.ammo.setText(`${w.mag} / ${w.reserve}`);
    this.ammo.setColor(w.mag === 0 ? '#ef4444' : TEXT);
    this.status.setText(`${s.flashlight ? 'LIGHT ON' : 'LIGHT OFF'}${s.dark ? '  ·  DARK ROOM' : ''}`);

    const g = this.reloadBar;
    g.clear();
    if (w.reload !== null) {
      g.fillStyle(0x1f2937, 1);
      g.fillRect(VIEW_W - 184, VIEW_H - 48, 160, 4);
      g.fillStyle(0x60a5fa, 1);
      g.fillRect(VIEW_W - 184, VIEW_H - 48, 160 * w.reload, 4);
    }

    const p = this.panels;
    p.clear();
    p.fillStyle(0x05070a, 0.72);
    const briefH = 58 + this.stationBrief.height;
    p.fillRoundedRect(12, 12, 500, s.station ? briefH : 30, 6);
    p.fillRoundedRect(VIEW_W - 12 - (this.checklist.width + 24), 12, this.checklist.width + 24, 36 + this.checklist.height, 6);
    p.fillRoundedRect(VIEW_W - 204, VIEW_H - 106, 192, 94, 6);

    this.toasts = this.toasts.filter((t) => {
      t.age += deltaMs / 1000;
      t.text.setAlpha(Math.min(1, (3.2 - t.age) / 0.5));
      if (t.age >= 3.2) t.text.destroy();
      return t.age < 3.2;
    });
    this.toasts.forEach((t, i) => t.text.setY(150 + i * 26));

    if (s.debrief && !this.debrief.visible) this.showDebrief(s.debrief);
    if (!s.debrief && this.debrief.visible) this.debrief.setVisible(false);
  }

  private showToast(text: string, style: Phaser.Types.GameObjects.Text.TextStyle): void {
    const t = this.add.text(VIEW_W / 2, 150, text, { ...style, backgroundColor: '#05070acc', padding: { x: 10, y: 4 } }).setOrigin(0.5, 0);
    this.toasts.push({ text: t, age: 0 });
    if (this.toasts.length > 4) {
      this.toasts.shift()!.text.destroy();
    }
  }

  private buildTitle(style: (size: number, color?: string, extra?: Phaser.Types.GameObjects.Text.TextStyle) => Phaser.Types.GameObjects.Text.TextStyle): Phaser.GameObjects.Container {
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
      this.add.text(cx, 540, `v${__APP_VERSION__}  ·  Prototype: the Range`, style(11, DIM)).setOrigin(0.5),
    ];
    return this.add.container(0, 0, items).setDepth(100);
  }

  private buildDebrief(style: (size: number, color?: string, extra?: Phaser.Types.GameObjects.Text.TextStyle) => Phaser.Types.GameObjects.Text.TextStyle): Phaser.GameObjects.Container {
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
