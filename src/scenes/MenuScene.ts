import Phaser from 'phaser';
import { COLORS, VIEW_H, VIEW_W } from '../config';
import { sfx } from '../game/audio';
import { campaignStars, endedCareer, isUnlocked, newProgress, progress, saveProgress } from '../game/progress';
import { levelById } from '../levels';
import { CAMPAIGNS, RANKS, type CampaignDef } from '../levels/campaigns';
import { ACCENT, DIM, GOLD, RED, setupScreenCamera, style, TEXT, textButton } from './ui';

const LOCKED = '#4b5563';
const LEFT = { x: 200, w: 300 };
const RIGHT = { x: 560, w: 520 };
const TOP = 230;

/**
 * Title screen and campaign select: campaigns on the left (one per rank), the chosen campaign's
 * cases with their best stars on the right. Opens on the current campaign.
 */
export class MenuScene extends Phaser.Scene {
  private selected = 0;
  private cases: Phaser.GameObjects.GameObject[] = [];
  private rows: { campaign: CampaignDef; text: Phaser.GameObjects.Text; marker: Phaser.GameObjects.Text }[] = [];

  constructor() {
    super('menu');
  }

  create(): void {
    setupScreenCamera(this);
    this.cameras.main.setBackgroundColor(COLORS.void);
    this.cases = [];
    this.rows = [];

    const cx = VIEW_W / 2;
    this.add.text(cx, 82, 'BREACH', style(64, TEXT, { fontStyle: 'bold' })).setOrigin(0.5);
    this.add.text(cx, 136, 'PORT ARDLEY POLICE DEPARTMENT', style(13, ACCENT, { fontStyle: 'bold' })).setOrigin(0.5);
    const career = progress.realism ? 'REALISM CAREER' : 'NORMAL CAREER';
    this.add.text(cx, 162, `${career}   ·   Rank: ${RANKS[progress.rank]}`, style(14, progress.realism ? RED : TEXT)).setOrigin(0.5);

    // A realism career that just ended gets one notice.
    const ended = endedCareer.record;
    if (ended) {
      const why = { down: 'You went down at', quit: 'You quit a mission at', left: 'You left a mission unfinished at' }[endedCareer.reason];
      const where = levelById(ended.levelId).name;
      this.add.text(cx, VIEW_H - 136, [
        `Realism career over: ${why.toLowerCase()} ${where}.`,
        `Rank reached: ${RANKS[ended.rank]}, ${ended.stars} ★. A new career starts as Recruit.`,
      ].join('\n'), style(13, RED, { align: 'center', lineSpacing: 4 })).setOrigin(0.5, 0);
      endedCareer.record = null;
    }

    // Campaigns, one per rank. The current one (the highest open) is selected.
    this.add.text(LEFT.x, TOP - 30, 'CAMPAIGNS', style(11, ACCENT, { fontStyle: 'bold' }));
    CAMPAIGNS.forEach((c, i) => {
      const open = progress.rank >= c.rank;
      const y = TOP + i * 52;
      const marker = this.add.text(LEFT.x - 18, y, '▸', style(16, ACCENT));
      const text = this.add.text(LEFT.x, y, c.title, style(18, open ? TEXT : LOCKED));
      const sub = open
        ? `${RANKS[c.rank]}  ·  ${campaignStars(progress, c)} / ${c.levels.length * 3} ★`
        : `Requires ${RANKS[c.rank]}`;
      this.add.text(LEFT.x, y + 24, sub, style(11, open ? DIM : LOCKED));
      if (open) {
        text.setInteractive({ useHandCursor: true });
        text.on('pointerup', () => this.select(i));
        text.on('pointerover', () => text.setColor(ACCENT));
        text.on('pointerout', () => this.refreshRows());
      }
      this.rows.push({ campaign: c, text, marker });
    });
    const current = CAMPAIGNS.map((c, i) => ({ c, i })).filter(({ c }) => progress.rank >= c.rank).at(-1);
    this.select(current?.i ?? 0);

    // A fresh realism career can skip the academy and start as an Officer.
    if (progress.realism && progress.rank === 0 && progress.completed.length === 0) {
      const skip = textButton(this, LEFT.x, TOP + CAMPAIGNS.length * 52 + 20, 'Skip the academy: start as Officer', () => {
        progress.rank = 1;
        saveProgress(progress);
        this.scene.restart();
      }, 13, ACCENT).setOrigin(0, 0.5);
      skip.on('pointerout', () => skip.setColor(ACCENT));
    }

    textButton(this, cx - 120, VIEW_H - 74, 'Back', () => this.scene.start('title'), 12, DIM);
    const reset = textButton(this, cx + 120, VIEW_H - 74, 'Reset this career', () => {
      if (reset.getData('armed')) {
        Object.assign(progress, newProgress(progress.realism));
        saveProgress(progress);
        this.scene.restart();
        return;
      }
      reset.setData('armed', true).setText('Click again to reset this career');
    }, 12, DIM);

    this.add.text(cx, VIEW_H - 46, 'Esc in game for settings and controls', style(11, DIM)).setOrigin(0.5);
    this.add.text(cx, VIEW_H - 28, `v${__APP_VERSION__}`, style(11, DIM)).setOrigin(0.5);
  }

  private select(i: number): void {
    this.selected = i;
    this.refreshRows();
    for (const o of this.cases) o.destroy();
    this.cases = [];

    const c = CAMPAIGNS[i];
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      this.cases.push(o);
      return o;
    };
    const promoted = progress.rank > c.rank;
    const status = promoted
      ? 'Promoted'
      : `${c.promotion.minStars} ★ and every case for promotion to ${RANKS[c.rank + 1] ?? 'the next rank'}`;
    add(this.add.text(RIGHT.x, TOP - 30, `${c.title.toUpperCase()}  ·  ${RANKS[c.rank]}`, style(11, ACCENT, { fontStyle: 'bold' })));
    add(this.add.text(RIGHT.x + RIGHT.w, TOP - 30, status, style(11, DIM)).setOrigin(1, 0));

    c.levels.forEach((id, k) => {
      const level = levelById(id);
      const y = TOP + 6 + k * 40;
      const unlocked = isUnlocked(progress, id);
      const stars = progress.stars[id] ?? 0;
      const name = level.mission ? `${k + 1}   ${level.name}` : level.name;
      if (unlocked) {
        add(textButton(this, RIGHT.x, y, name, () => this.play(id), 18).setOrigin(0, 0.5));
        add(this.add.text(RIGHT.x + RIGHT.w, y, '★'.repeat(stars) + '☆'.repeat(3 - stars), style(16, stars ? GOLD : DIM)).setOrigin(1, 0.5));
      } else {
        add(this.add.text(RIGHT.x, y, name, style(18, LOCKED)).setOrigin(0, 0.5));
        add(this.add.text(RIGHT.x + RIGHT.w, y, 'Locked', style(12, LOCKED)).setOrigin(1, 0.5));
      }
    });
  }

  private refreshRows(): void {
    this.rows.forEach((r, i) => {
      const open = progress.rank >= r.campaign.rank;
      r.marker.setVisible(i === this.selected);
      r.text.setColor(i === this.selected ? ACCENT : open ? TEXT : LOCKED);
    });
  }

  private play(levelId: string): void {
    sfx.unlock();
    if (levelById(levelId).mission) this.scene.start('briefing', { levelId });
    else this.scene.start('game', { levelId });
  }
}
