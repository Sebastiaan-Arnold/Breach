import Phaser from 'phaser';
import { VIEW_H, VIEW_W } from '../config';
import { isOutdoor, parseLevel } from '../core/grid';
import { sfx } from '../game/audio';
import { progress, unlockedWeapons } from '../game/progress';
import { WEAPONS, type WeaponId } from '../game/weapons';
import { rollSituation, type Situation } from '../game/situation';
import { levelById } from '../levels';
import { propSize } from '../levels/props';
import type { LevelDef, Reliability } from '../levels/types';
import { ACCENT, DIM, RED, setupScreenCamera, style, TEXT } from './ui';

const MAP = { x: 40, y: 120, w: 720, h: 545 };
const PANEL = { x: 800, w: 420 };
const RELIABILITY_COLOR: Record<Reliability, string> = { Confirmed: '#4ade80', Likely: '#facc15', Unverified: RED };

interface EntryView {
  route: Phaser.GameObjects.Graphics;
  pts: { x: number; y: number }[];
  marker: Phaser.GameObjects.Graphics;
  mapLabel: Phaser.GameObjects.Text;
}

/**
 * The briefing: a police tablet with the floor plan on the left and the case file, intel and
 * entry choice on the right. The real situation is rolled here, so the map's marks point at it
 * (mostly).
 */
export class BriefingScene extends Phaser.Scene {
  private def!: LevelDef;
  private situation!: Situation;
  private entryIndex = 0;
  private hoverIndex = -1;
  private entries: EntryView[] = [];
  private rows: Phaser.GameObjects.Text[] = [];
  private primary: WeaponId = 'pistol';
  private gunLabels: Phaser.GameObjects.Text[] = [];
  private deployLabel!: Phaser.GameObjects.Text;

  constructor() {
    super('briefing');
  }

  init(data: { levelId: string }): void {
    this.def = levelById(data.levelId);
    this.situation = rollSituation(this.def.mission!);
    this.entryIndex = 0;
    this.hoverIndex = -1;
    this.entries = [];
    this.rows = [];
    this.gunLabels = [];
    // Default to the best gun issued so far.
    this.primary = unlockedWeapons(progress).at(-1) ?? 'pistol';
  }

  create(): void {
    setupScreenCamera(this);
    this.cameras.main.setBackgroundColor(0x05070a);
    const m = this.def.mission!;

    // Tablet frame.
    const frame = this.add.graphics();
    frame.fillStyle(0x0b1220, 1);
    frame.fillRoundedRect(16, 16, VIEW_W - 32, VIEW_H - 32, 14);
    frame.lineStyle(2, 0x1e3a5f, 1);
    frame.strokeRoundedRect(16, 16, VIEW_W - 32, VIEW_H - 32, 14);
    frame.lineStyle(1, 0x1e3a5f, 1);
    frame.lineBetween(PANEL.x - 20, 40, PANEL.x - 20, VIEW_H - 40);

    this.add.text(MAP.x, 40, m.caseLabel.toUpperCase(), style(12, ACCENT, { fontStyle: 'bold' }));
    this.add.text(MAP.x, 58, m.title, style(30, TEXT, { fontStyle: 'bold' }));
    this.add.text(MAP.x, 96, m.location, style(13, DIM));

    this.drawMap();
    this.drawPanel();
    this.refreshEntries();

    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      const digit = /^Digit([1-9])$/.exec(e.code);
      if (digit && Number(digit[1]) <= this.def.entries.length) this.selectEntry(Number(digit[1]) - 1);
      if (e.code === 'Enter') this.deploy();
      if (e.code === 'Escape') this.scene.start('menu');
    });
  }

  // ---------------------------------------------------------------- floor plan

  private drawMap(): void {
    const level = parseLevel(this.def.map);
    const s = Math.floor(Math.min(MAP.w / level.width, MAP.h / level.height));
    const ox = MAP.x + Math.floor((MAP.w - level.width * s) / 2);
    const oy = MAP.y + Math.floor((MAP.h - level.height * s) / 2);
    const g = this.add.graphics();
    const edge = (x: number, y: number) => x === 0 || y === 0 || x === level.width - 1 || y === level.height - 1;

    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        const i = y * level.width + x;
        const kind = level.tiles[i];
        const px = ox + x * s, py = oy + y * s;
        // The property boundary is drawn quietly so the building reads first.
        if (edge(x, y) && kind === 'wall') g.fillStyle(0x1e3a5f, 1);
        else if (kind === 'wall' || kind === 'plywood') g.fillStyle(0x7aa2d6, 1);
        else if (kind === 'interior') g.fillStyle(0x5b7fae, 1);
        else if (kind === 'furniture') g.fillStyle(0x22324d, 1);
        else if (isOutdoor(level.material[i])) g.fillStyle(level.material[i] === 'grass' ? 0x0d1a17 : 0x111a26, 1);
        else g.fillStyle(0x16233a, 1);
        g.fillRect(px, py, s, s);
      }
    }
    // Faint blueprint grid.
    g.lineStyle(1, 0x60a5fa, 0.06);
    for (let x = 0; x <= level.width; x++) g.lineBetween(ox + x * s, oy, ox + x * s, oy + level.height * s);
    for (let y = 0; y <= level.height; y++) g.lineBetween(ox, oy + y * s, ox + level.width * s, oy + y * s);

    for (const d of level.doors) {
      g.fillStyle(0xf59e0b, 1);
      if (d.orientation === 'h') g.fillRect(ox + d.tx * s, oy + d.ty * s + s / 2 - 1.5, s, 3);
      else g.fillRect(ox + d.tx * s + s / 2 - 1.5, oy + d.ty * s, 3, s);
    }
    for (const prop of this.def.props ?? []) {
      const { w, h } = propSize(prop);
      g.fillStyle(prop.kind === 'van' ? 0x1e3a8a : 0x334155, 1);
      g.fillRoundedRect(ox + prop.tx * s, oy + prop.ty * s, w * s, h * s, 3);
    }

    // Areas the plans don't cover.
    for (const z of this.def.mission!.unknownZones) {
      const x0 = ox + z.x0 * s, y0 = oy + z.y0 * s, w = (z.x1 - z.x0 + 1) * s, h = (z.y1 - z.y0 + 1) * s;
      g.fillStyle(0x334155, 0.95);
      g.fillRect(x0, y0, w, h);
      g.lineStyle(1, 0x94a3b8, 0.35);
      hatch(g, x0, y0, w, h, 8);
      this.add.text(x0 + w / 2, y0 + 3, 'NO PLANS', style(9, DIM, { fontStyle: 'bold' })).setOrigin(0.5, 0);
    }

    // Command's marks: last known suspect positions and the reported civilian.
    const marks = this.add.graphics();
    for (const p of this.situation.suspectMarks) {
      const x = ox + p.tx * s, y = oy + p.ty * s;
      marks.lineStyle(3, 0xef4444, 0.95);
      marks.lineBetween(x - 7, y - 7, x + 7, y + 7);
      marks.lineBetween(x - 7, y + 7, x + 7, y - 7);
    }
    for (const c of this.situation.civilians) {
      marks.lineStyle(2, 0xfacc15, 0.9);
      marks.strokeCircle(ox + c.tx * s, oy + c.ty * s, s * 1.6);
    }

    // Entry points: a route from the van, a numbered marker and a name.
    const cx = ox + (level.width * s) / 2, cy = oy + (level.height * s) / 2;
    this.def.entries.forEach((entry, i) => {
      const pts = entry.approach.map((p) => ({ x: ox + p.tx * s, y: oy + p.ty * s }));
      const end = pts[pts.length - 1];
      const route = this.add.graphics();
      const marker = this.add.graphics().setPosition(end.x, end.y);
      this.add.text(end.x, end.y, `${i + 1}`, style(13, TEXT, { fontStyle: 'bold' })).setOrigin(0.5).setDepth(2);
      // Label on the outside of the building, away from the centre of the map.
      const away = Math.atan2(end.y - cy, end.x - cx);
      const lx = end.x + Math.cos(away) * 22, ly = end.y + Math.sin(away) * 22;
      const mapLabel = this.add.text(lx, ly, cap(entry.name), style(11, TEXT, { fontStyle: 'bold' }))
        .setOrigin(Math.cos(away) < -0.3 ? 1 : Math.cos(away) > 0.3 ? 0 : 0.5, Math.sin(away) > 0.3 ? 0 : Math.sin(away) < -0.3 ? 1 : 0.5);
      const zone = this.add.zone(end.x, end.y, 34, 34).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => this.hover(i));
      zone.on('pointerout', () => this.hover(-1));
      zone.on('pointerup', () => this.selectEntry(i));
      this.entries.push({ route, pts, marker, mapLabel });
    });

    const legend = this.add.graphics();
    const ly = MAP.y + MAP.h + 18;
    legend.lineStyle(2.5, 0xef4444, 1);
    legend.lineBetween(MAP.x + 4, ly - 5, MAP.x + 14, ly + 5);
    legend.lineBetween(MAP.x + 4, ly + 5, MAP.x + 14, ly - 5);
    this.add.text(MAP.x + 22, ly, 'Last known suspect', style(11, DIM)).setOrigin(0, 0.5);
    legend.lineStyle(2, 0xfacc15, 1);
    legend.strokeCircle(MAP.x + 190, ly, 7);
    this.add.text(MAP.x + 204, ly, 'Civilian reported', style(11, DIM)).setOrigin(0, 0.5);
    legend.fillStyle(0x2563eb, 1);
    legend.fillCircle(MAP.x + 370, ly, 8);
    this.add.text(MAP.x + 384, ly, 'Entry point: click to choose', style(11, DIM)).setOrigin(0, 0.5);
  }

  // ---------------------------------------------------------------- case file, intel, entry

  private drawPanel(): void {
    const m = this.def.mission!;
    const x = PANEL.x, w = PANEL.w;
    let y = 40;
    const heading = (t: string) => {
      this.add.text(x, y, t, style(11, ACCENT, { fontStyle: 'bold' }));
      y += 20;
    };

    heading('CASE FILE');
    const summary = this.add.text(x, y, m.summary.join('\n\n'), style(12, TEXT, { lineSpacing: 2, wordWrap: { width: w } }));
    y += summary.height + 20;

    heading('INTEL');
    const rows: [string, string, string?][] = [
      ['Hostiles', `${m.hostiles.min} to ${m.hostiles.max} suspects`],
      ['Loadout', m.loadout],
      ['Civilians', m.civilians.text],
      ['Reliability', m.reliability, RELIABILITY_COLOR[m.reliability]],
    ];
    for (const [k, v, color] of rows) {
      this.add.text(x, y, k, style(13, DIM));
      const value = this.add.text(x + 110, y, v, style(13, color ?? TEXT, { wordWrap: { width: w - 110 } }));
      y += value.height + 6;
    }
    y += 16;

    heading('LOADOUT');
    const guns = unlockedWeapons(progress);
    this.add.text(x, y, 'Primary', style(13, DIM));
    let gx = x + 110;
    for (const id of guns) {
      const label = this.add.text(gx, y, WEAPONS[id].name, style(13, TEXT)).setInteractive({ useHandCursor: true });
      label.setData('gun', id);
      label.on('pointerup', () => this.selectGun(id));
      this.gunLabels.push(label);
      gx += label.width + 22;
    }
    y += 22;
    this.add.text(x + 110, y, guns.length > 1 ? 'Pistol always carried as a sidearm (2)' : 'More guns are issued with promotion', style(11, DIM));
    y += 34;
    this.selectGun(this.primary);

    heading('CHOOSE ENTRY');
    this.def.entries.forEach((entry, i) => {
      const row = this.add.text(x, y, '', style(15, TEXT)).setInteractive({ useHandCursor: true });
      row.on('pointerover', () => this.hover(i));
      row.on('pointerout', () => this.hover(-1));
      row.on('pointerup', () => this.selectEntry(i));
      row.setData('label', `${i + 1}   ${cap(entry.name)}`);
      this.rows.push(row);
      y += 28;
    });

    // Deploy button.
    const by = VIEW_H - 112, bw = w, bh = 48;
    const box = this.add.graphics();
    const drawBox = (hover: boolean) => {
      box.clear();
      box.fillStyle(hover ? 0x2563eb : 0x1d4ed8, 1);
      box.fillRoundedRect(x, by, bw, bh, 8);
    };
    drawBox(false);
    this.deployLabel = this.add.text(x + bw / 2, by + bh / 2, '', style(18, '#ffffff', { fontStyle: 'bold' })).setOrigin(0.5);
    const zone = this.add.zone(x + bw / 2, by + bh / 2, bw, bh).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => drawBox(true));
    zone.on('pointerout', () => drawBox(false));
    zone.on('pointerup', () => this.deploy());

    const back = this.add.text(x + bw / 2, by + bh + 22, 'Back to menu', style(12, DIM)).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setColor(ACCENT));
    back.on('pointerout', () => back.setColor(DIM));
    back.on('pointerup', () => this.scene.start('menu'));
  }

  private selectGun(id: WeaponId): void {
    if (id !== this.primary) sfx.select();
    this.primary = id;
    for (const l of this.gunLabels) {
      const on = l.getData('gun') === id;
      l.setColor(on ? ACCENT : DIM).setFontStyle(on ? 'bold' : 'normal');
    }
  }

  private hover(i: number): void {
    this.hoverIndex = i;
    this.refreshEntries();
  }

  private selectEntry(i: number): void {
    if (i !== this.entryIndex) sfx.select();
    this.entryIndex = i;
    this.refreshEntries();
  }

  /** Selected entry: bright route, filled marker, highlighted row. Others stay quiet. */
  private refreshEntries(): void {
    this.entries.forEach((e, i) => {
      const on = i === this.entryIndex;
      const hot = i === this.hoverIndex;
      e.route.clear();
      e.route.lineStyle(on ? 3 : 2, 0x60a5fa, on ? 0.95 : hot ? 0.6 : 0.25);
      for (let k = 1; k < e.pts.length; k++) {
        if (on) e.route.lineBetween(e.pts[k - 1].x, e.pts[k - 1].y, e.pts[k].x, e.pts[k].y);
        else dashed(e.route, e.pts[k - 1].x, e.pts[k - 1].y, e.pts[k].x, e.pts[k].y);
      }
      e.marker.clear();
      if (on) {
        e.marker.fillStyle(0x60a5fa, 0.25);
        e.marker.fillCircle(0, 0, 19);
      }
      e.marker.fillStyle(on ? 0x2563eb : hot ? 0x1e3a8a : 0x0b1220, 1);
      e.marker.fillCircle(0, 0, 13);
      e.marker.lineStyle(2, 0x60a5fa, on || hot ? 1 : 0.7);
      e.marker.strokeCircle(0, 0, 13);
      e.mapLabel.setColor(on ? TEXT : DIM).setAlpha(on || hot ? 1 : 0.7);
      const row = this.rows[i];
      row.setText(`${on ? '▸' : ' '} ${row.getData('label')}`).setColor(on ? ACCENT : hot ? TEXT : DIM);
    });
    this.deployLabel.setText(`DEPLOY  ·  ${cap(this.def.entries[this.entryIndex].name)}`);
  }

  private deploy(): void {
    sfx.unlock();
    this.scene.start('game', {
      levelId: this.def.id, entryId: this.def.entries[this.entryIndex].id, situation: this.situation, primary: this.primary,
    });
  }
}

function cap(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

/** Diagonal hatching clipped to a rectangle. */
function hatch(g: Phaser.GameObjects.Graphics, x0: number, y0: number, w: number, h: number, step: number): void {
  // Each line runs up and to the right: (x0 + k + t, y0 + h - t) for t where it stays inside.
  for (let k = -h; k < w; k += step) {
    const t0 = Math.max(0, -k), t1 = Math.min(h, w - k);
    if (t0 < t1) g.lineBetween(x0 + k + t0, y0 + h - t0, x0 + k + t1, y0 + h - t1);
  }
}

function dashed(g: Phaser.GameObjects.Graphics, x0: number, y0: number, x1: number, y1: number): void {
  const d = Math.hypot(x1 - x0, y1 - y0);
  const n = Math.max(1, Math.floor(d / 8));
  for (let k = 0; k < n; k += 2) {
    const a = k / n, b = Math.min(1, (k + 1) / n);
    g.lineBetween(x0 + (x1 - x0) * a, y0 + (y1 - y0) * a, x0 + (x1 - x0) * b, y0 + (y1 - y0) * b);
  }
}
