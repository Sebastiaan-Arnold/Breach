import Phaser from 'phaser';
import { COLORS, VIEW_H, VIEW_W } from '../config';
import { sfx } from '../game/audio';
import { endedCareer, loadCareer, switchCareer, type CareerMode, type Progress } from '../game/progress';
import { saveSettings, settings } from '../game/settings';
import { levelById } from '../levels';
import { RANKS } from '../levels/campaigns';
import { ACCENT, DIM, RED, setupScreenCamera, style, TEXT, textButton } from './ui';

const CARD = { w: 360, h: 168, gap: 40, y: 268 };

/** The start menu: pick a career, normal or realism, then on to its campaigns. */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  create(): void {
    setupScreenCamera(this);
    this.cameras.main.setBackgroundColor(COLORS.void);
    sfx.muted = !settings.sound;
    // Browsers only allow audio after a user gesture; the first click anywhere unlocks it.
    this.input.once('pointerdown', () => sfx.unlock());

    const cx = VIEW_W / 2;
    this.add.text(cx, 120, 'BREACH', style(84, TEXT, { fontStyle: 'bold' })).setOrigin(0.5);
    this.add.text(cx, 186, 'PORT ARDLEY POLICE DEPARTMENT', style(14, ACCENT, { fontStyle: 'bold' })).setOrigin(0.5);
    this.add.text(cx, 214, 'You only know what you see. Slow is smooth.', style(14, DIM)).setOrigin(0.5);

    this.card('normal', cx - CARD.w - CARD.gap / 2, 'Normal career', 'Retry missions as often as you like.', ACCENT);
    this.card('realism', cx + CARD.gap / 2, 'Realism career', 'One life. Going down ends the career.', RED);

    const ended = endedCareer.record;
    if (ended && endedCareer.reason === 'left') {
      this.add.text(cx, CARD.y + CARD.h + 40, [
        `Your realism career ended: you left a mission unfinished at ${levelById(ended.levelId).name}.`,
        `Rank reached: ${RANKS[ended.rank]}, ${ended.stars} ★.`,
      ].join('\n'), style(13, RED, { align: 'center', lineSpacing: 4 })).setOrigin(0.5, 0);
      endedCareer.record = null;
    }

    const blood = textButton(this, cx - 100, VIEW_H - 74, '', () => {
      settings.blood = !settings.blood;
      saveSettings();
      refresh();
    }, 12, DIM);
    const sound = textButton(this, cx + 100, VIEW_H - 74, '', () => {
      settings.sound = !settings.sound;
      sfx.muted = !settings.sound;
      saveSettings();
      refresh();
    }, 12, DIM);
    const refresh = () => {
      blood.setText(`Blood effects: ${settings.blood ? 'On' : 'Off'}`);
      sound.setText(`Sound: ${settings.sound ? 'On' : 'Off'}`);
    };
    refresh();

    this.add.text(cx, VIEW_H - 46, 'Esc in game for settings and controls', style(11, DIM)).setOrigin(0.5);
    this.add.text(cx, VIEW_H - 28, `v${__APP_VERSION__}`, style(11, DIM)).setOrigin(0.5);
  }

  /** A clickable card for one career, showing where it stands. */
  private card(mode: CareerMode, x: number, title: string, blurb: string, color: string): void {
    const p: Progress = loadCareer(mode);
    const stars = Object.values(p.stars).reduce((a, b) => a + b, 0);
    const fresh = p.rank === 0 && p.completed.length === 0;
    const accent = Phaser.Display.Color.HexStringToColor(color).color;

    const box = this.add.graphics();
    const draw = (hover: boolean) => {
      box.clear();
      box.fillStyle(hover ? 0x111c30 : 0x0b1220, 1);
      box.fillRoundedRect(x, CARD.y, CARD.w, CARD.h, 10);
      box.lineStyle(hover ? 2 : 1, accent, hover ? 1 : 0.6);
      box.strokeRoundedRect(x, CARD.y, CARD.w, CARD.h, 10);
    };
    draw(false);
    this.add.text(x + 24, CARD.y + 22, title.toUpperCase(), style(13, color, { fontStyle: 'bold' }));
    this.add.text(x + 24, CARD.y + 48, fresh ? 'New career' : `Rank: ${RANKS[p.rank]}`, style(22, TEXT, { fontStyle: 'bold' }));
    this.add.text(x + 24, CARD.y + 82, fresh ? 'Starts at the academy' : `${stars} ★ earned`, style(13, DIM));
    this.add.text(x + 24, CARD.y + 122, blurb, style(12, DIM));

    const zone = this.add.zone(x + CARD.w / 2, CARD.y + CARD.h / 2, CARD.w, CARD.h).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => draw(true));
    zone.on('pointerout', () => draw(false));
    zone.on('pointerup', () => {
      sfx.unlock();
      switchCareer(mode);
      this.scene.start('menu');
    });
  }
}
