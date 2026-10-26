import Phaser from 'phaser';
import { COLORS, VIEW_H, VIEW_W } from '../config';
import { sfx } from '../game/audio';
import { campaignStars, isUnlocked, newProgress, progress, saveProgress } from '../game/progress';
import { saveSettings, settings } from '../game/settings';
import { levelById } from '../levels';
import { CAMPAIGNS, RANKS } from '../levels/campaigns';
import { ACCENT, DIM, GOLD, setupScreenCamera, style, TEXT, textButton } from './ui';

/** Title screen and campaign select: rank, cases with their best stars, and what's locked. */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create(): void {
    setupScreenCamera(this);
    this.cameras.main.setBackgroundColor(COLORS.void);
    sfx.muted = !settings.sound;
    // Browsers only allow audio after a user gesture; the first click anywhere unlocks it.
    this.input.once('pointerdown', () => sfx.unlock());

    const cx = VIEW_W / 2;
    this.add.text(cx, 92, 'BREACH', style(64, TEXT, { fontStyle: 'bold' })).setOrigin(0.5);
    this.add.text(cx, 146, 'PORT ARDLEY POLICE DEPARTMENT', style(13, ACCENT, { fontStyle: 'bold' })).setOrigin(0.5);
    this.add.text(cx, 172, `Rank: ${RANKS[progress.rank]}`, style(14, TEXT)).setOrigin(0.5);

    let y = 226;
    for (const c of CAMPAIGNS) {
      const open = progress.rank >= c.rank;
      const total = c.levels.length * 3;
      const header = `${c.title.toUpperCase()}  ·  ${RANKS[c.rank]}`;
      this.add.text(cx - 260, y, header, style(12, open ? ACCENT : DIM, { fontStyle: 'bold' }));
      const promo = progress.rank > c.rank
        ? `${campaignStars(progress, c)} / ${total} ★  ·  promoted`
        : open ? `${campaignStars(progress, c)} / ${total} ★  ·  ${c.promotion.minStars} for promotion` : `Requires ${RANKS[c.rank]}`;
      this.add.text(cx + 260, y, promo, style(11, DIM)).setOrigin(1, 0);
      y += 24;

      c.levels.forEach((id, i) => {
        const level = levelById(id);
        const unlocked = isUnlocked(progress, id);
        const stars = progress.stars[id] ?? 0;
        const name = level.mission ? `${i + 1}   ${level.name}` : level.name;
        if (unlocked) {
          textButton(this, cx - 260, y + 12, name, () => this.play(id), 18).setOrigin(0, 0.5);
          this.add.text(cx + 260, y + 12, '★'.repeat(stars) + '☆'.repeat(3 - stars), style(16, stars ? GOLD : DIM)).setOrigin(1, 0.5);
        } else {
          this.add.text(cx - 260, y + 12, name, style(18, '#4b5563')).setOrigin(0, 0.5);
          this.add.text(cx + 260, y + 12, 'Locked', style(12, '#4b5563')).setOrigin(1, 0.5);
        }
        y += 32;
      });
      y += 18;
    }

    const blood = textButton(this, cx - 200, VIEW_H - 74, '', () => {
      settings.blood = !settings.blood;
      saveSettings();
      refresh();
    }, 12, DIM);
    const sound = textButton(this, cx, VIEW_H - 74, '', () => {
      settings.sound = !settings.sound;
      sfx.muted = !settings.sound;
      saveSettings();
      refresh();
    }, 12, DIM);
    const reset = textButton(this, cx + 200, VIEW_H - 74, 'Reset progress', () => {
      if (reset.getData('armed')) {
        Object.assign(progress, newProgress());
        saveProgress(progress);
        this.scene.restart();
        return;
      }
      reset.setData('armed', true).setText('Click again to reset');
    }, 12, DIM);
    const refresh = () => {
      blood.setText(`Blood effects: ${settings.blood ? 'On' : 'Off'}`);
      sound.setText(`Sound: ${settings.sound ? 'On' : 'Off'}`);
    };
    refresh();

    this.add.text(cx, VIEW_H - 46, 'Esc in game for settings and controls', style(11, DIM)).setOrigin(0.5);
    this.add.text(cx, VIEW_H - 28, `v${__APP_VERSION__}`, style(11, DIM)).setOrigin(0.5);
  }

  private play(levelId: string): void {
    sfx.unlock();
    if (levelById(levelId).mission) this.scene.start('briefing', { levelId });
    else this.scene.start('game', { levelId });
  }
}
