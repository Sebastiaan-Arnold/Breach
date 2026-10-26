import Phaser from 'phaser';
import { COLORS, VIEW_H, VIEW_W } from '../config';
import { sfx } from '../game/audio';
import { saveSettings, settings } from '../game/settings';
import { LEVELS } from '../levels';
import { ACCENT, DIM, setupScreenCamera, style, TEXT, textButton } from './ui';

/** Title screen and level select. */
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
    this.add.text(cx, 150, 'BREACH', style(84, TEXT, { fontStyle: 'bold' })).setOrigin(0.5);
    this.add.text(cx, 222, 'PORT ARDLEY POLICE DEPARTMENT', style(14, ACCENT, { fontStyle: 'bold' })).setOrigin(0.5);
    this.add.text(cx, 262, 'You only know what you see. Slow is smooth.', style(15, DIM)).setOrigin(0.5);

    LEVELS.forEach((level, i) => {
      const y = 340 + i * 64;
      const label = level.mission ? `${level.mission.caseLabel}` : 'Academy · Training';
      this.add.text(cx, y - 14, label.toUpperCase(), style(11, ACCENT, { fontStyle: 'bold' })).setOrigin(0.5);
      textButton(this, cx, y + 8, level.name, () => {
        sfx.unlock();
        if (level.mission) this.scene.start('briefing', { levelId: level.id });
        else this.scene.start('game', { levelId: level.id });
      }, 22);
    });

    const blood = textButton(this, cx - 90, VIEW_H - 92, '', () => {
      settings.blood = !settings.blood;
      saveSettings();
      refresh();
    }, 13, DIM);
    const sound = textButton(this, cx + 90, VIEW_H - 92, '', () => {
      settings.sound = !settings.sound;
      sfx.muted = !settings.sound;
      saveSettings();
      refresh();
    }, 13, DIM);
    const refresh = () => {
      blood.setText(`Blood effects: ${settings.blood ? 'On' : 'Off'}`);
      sound.setText(`Sound: ${settings.sound ? 'On' : 'Off'}`);
    };
    refresh();

    this.add.text(cx, VIEW_H - 56, 'Esc in game for settings and controls', style(11, DIM)).setOrigin(0.5);
    this.add.text(cx, VIEW_H - 34, `v${__APP_VERSION__}`, style(11, DIM)).setOrigin(0.5);
  }
}
