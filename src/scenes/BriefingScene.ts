import Phaser from 'phaser';
import { VIEW_H, VIEW_W } from '../config';
import { isOutdoor, parseLevel } from '../core/grid';
import { rollSituation, type Situation } from '../game/situation';
import { levelById } from '../levels';
import type { LevelDef, Reliability } from '../levels/types';
import { ACCENT, DIM, RED, setupScreenCamera, style, TEXT, textButton } from './ui';

const MAP = { x: 40, y: 120, w: 720, h: 560 };
const RELIABILITY_COLOR: Record<Reliability, string> = { Confirmed: '#4ade80', Likely: '#facc15', Unverified: RED };

/**
 * The briefing: a police tablet with the floor plan on the left and the case file and intel on
 * the right. The real situation is rolled here, so the map's marks point at it (mostly).
 */
export class BriefingScene extends Phaser.Scene {
  private def!: LevelDef;
  private situation!: Situation;
  private entryIndex = 0;
  private entryMarks: Phaser.GameObjects.Graphics[] = [];
  private entryLabels: Phaser.GameObjects.Text[] = [];
  private entryText!: Phaser.GameObjects.Text;

  constructor() {
    super('briefing');
  }

  init(data: { levelId: string }): void {
    this.def = levelById(data.levelId);
    this.situation = rollSituation(this.def.mission!);
    this.entryIndex = 0;
    this.entryMarks = [];
    this.entryLabels = [];
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

    this.add.text(MAP.x, 40, m.caseLabel.toUpperCase(), style(12, ACCENT, { fontStyle: 'bold' }));
    this.add.text(MAP.x, 58, m.title, style(30, TEXT, { fontStyle: 'bold' }));
    this.add.text(MAP.x, 96, m.location, style(13, DIM));

    this.drawMap();
    this.drawCaseFile();

    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      const digit = /^Digit([1-9])$/.exec(e.code);
      if (digit && Number(digit[1]) <= this.def.entries.length) this.selectEntry(Number(digit[1]) - 1);
      if (e.code === 'Enter') this.deploy();
      if (e.code === 'Escape') this.scene.start('menu');
    });
  }

  private drawMap(): void {
    const level = parseLevel(this.def.map);
    const s = Math.floor(Math.min(MAP.w / level.width, MAP.h / level.height));
    const ox = MAP.x + Math.floor((MAP.w - level.width * s) / 2);
    const oy = MAP.y + Math.floor((MAP.h - level.height * s) / 2);
    const g = this.add.graphics();

    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        const i = y * level.width + x;
        const kind = level.tiles[i];
        const px = ox + x * s, py = oy + y * s;
        if (kind === 'wall' || kind === 'plywood') g.fillStyle(0x7aa2d6, 1);
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

    // Areas the plans don't cover.
    for (const z of this.def.mission!.unknownZones) {
      const x0 = ox + z.x0 * s, y0 = oy + z.y0 * s, w = (z.x1 - z.x0 + 1) * s, h = (z.y1 - z.y0 + 1) * s;
      g.fillStyle(0x334155, 0.95);
      g.fillRect(x0, y0, w, h);
      g.lineStyle(1, 0x94a3b8, 0.4);
      hatch(g, x0, y0, w, h, 8);
      this.add.text(x0 + w / 2, y0 + h / 2, 'NO PLANS', style(10, DIM, { fontStyle: 'bold' })).setOrigin(0.5);
    }

    // Command's markings: last known suspect positions and the reported civilian.
    const marks = this.add.graphics();
    for (const p of this.situation.suspectMarks) {
      const x = ox + p.tx * s, y = oy + p.ty * s;
      marks.lineStyle(3, 0xef4444, 0.95);
      marks.lineBetween(x - 7, y - 7, x + 7, y + 7);
      marks.lineBetween(x - 7, y + 7, x + 7, y - 7);
    }
    for (const c of this.situation.civilians) {
      marks.lineStyle(2, 0xfacc15, 0.9);
      marks.strokeCircle(ox + c.tx * s, oy + c.ty * s, s * 1.8);
    }
    for (const prop of this.def.props ?? []) {
      g.fillStyle(0x1e3a8a, 1);
      g.fillRoundedRect(ox + prop.tx * s, oy + prop.ty * s, 4.4 * s, 2 * s, 3);
    }

    // Entry points, with their approach routes.
    this.def.entries.forEach((entry, i) => {
      const route = this.add.graphics();
      route.lineStyle(2, 0x60a5fa, 0.35);
      const pts = entry.approach.map((p) => ({ x: ox + p.tx * s, y: oy + p.ty * s }));
      for (let k = 1; k < pts.length; k++) dashed(route, pts[k - 1].x, pts[k - 1].y, pts[k].x, pts[k].y);
      const end = pts[pts.length - 1];
      const mark = this.add.graphics();
      const label = this.add.text(end.x, end.y, `${i + 1}`, style(12, TEXT, { fontStyle: 'bold' })).setOrigin(0.5);
      const zone = this.add.zone(end.x, end.y, 30, 30).setInteractive({ useHandCursor: true });
      zone.on('pointerup', () => this.selectEntry(i));
      mark.setPosition(end.x, end.y);
      this.entryMarks.push(mark);
      this.entryLabels.push(label);
    });

    this.add.text(MAP.x, MAP.y + MAP.h + 6, 'Red X: last known suspect position   ·   Circle: civilian reported   ·   Click a number to choose your entry',
      style(11, DIM));
  }

  private drawCaseFile(): void {
    const m = this.def.mission!;
    const x = 800, w = 420;
    let y = 120;
    const heading = (t: string) => {
      this.add.text(x, y, t, style(11, ACCENT, { fontStyle: 'bold' }));
      y += 20;
    };

    heading('CASE FILE');
    const summary = this.add.text(x, y, m.summary.join('\n\n'), style(13, TEXT, { lineSpacing: 3, wordWrap: { width: w } }));
    y += summary.height + 22;

    heading('INTEL');
    const rows: [string, string, string?][] = [
      ['Estimated hostiles', `${m.hostiles.min} to ${m.hostiles.max} suspects`],
      ['Expected loadout', m.loadout],
      ['Civilians', m.civilians.text],
      ['Reliability', m.reliability, RELIABILITY_COLOR[m.reliability]],
    ];
    for (const [k, v, color] of rows) {
      this.add.text(x, y, k, style(13, DIM));
      this.add.text(x + 150, y, v, style(13, color ?? TEXT, { wordWrap: { width: w - 150 } }));
      y += 24;
    }
    y += 14;

    heading('ENTRY');
    this.entryText = this.add.text(x, y, '', style(15, TEXT));
    y += 50;

    textButton(this, x + w / 2, VIEW_H - 92, 'DEPLOY', () => this.deploy(), 24);
    textButton(this, x + w / 2, VIEW_H - 54, 'Back', () => this.scene.start('menu'), 13, DIM);
    this.selectEntry(0);
  }

  private selectEntry(i: number): void {
    this.entryIndex = i;
    this.entryMarks.forEach((g, k) => {
      g.clear();
      const on = k === i;
      g.fillStyle(on ? 0x2563eb : 0x0b1220, 1);
      g.fillCircle(0, 0, 11);
      g.lineStyle(2, 0x60a5fa, on ? 1 : 0.7);
      g.strokeCircle(0, 0, 11);
    });
    this.entryLabels.forEach((t) => t.setDepth(1));
    const entry = this.def.entries[i];
    this.entryText?.setText(`${i + 1}  ${entry.name[0].toUpperCase()}${entry.name.slice(1)}`);
  }

  private deploy(): void {
    this.scene.start('game', { levelId: this.def.id, entryId: this.def.entries[this.entryIndex].id, situation: this.situation });
  }
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
