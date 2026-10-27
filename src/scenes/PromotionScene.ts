import Phaser from 'phaser';
import { COLORS, VIEW_H, VIEW_W } from '../config';
import { sfx } from '../game/audio';
import { WEAPONS } from '../game/weapons';
import { CAMPAIGNS, RANKS, SUPPRESSOR_RANK } from '../levels/campaigns';
import { ACCENT, DIM, fadeIn, GOLD, goTo, setupScreenCamera, style, TEXT, textButton } from './ui';

/** Closes a campaign: the new rank, a short note from the captain and any gun issued with it. */
export class PromotionScene extends Phaser.Scene {
  private campaignId = '';

  constructor() {
    super('promotion');
  }

  init(data: { campaignId: string }): void {
    this.campaignId = data.campaignId;
  }

  create(): void {
    setupScreenCamera(this);
    fadeIn(this, 500);
    this.cameras.main.setBackgroundColor(COLORS.void);
    const c = CAMPAIGNS.find((x) => x.id === this.campaignId)!;
    const cx = VIEW_W / 2;
    sfx.secured();

    this.add.text(cx, 150, 'PROMOTED', style(14, ACCENT, { fontStyle: 'bold' })).setOrigin(0.5);
    this.add.text(cx, 200, RANKS[c.rank + 1], style(48, TEXT, { fontStyle: 'bold' })).setOrigin(0.5);
    this.add.text(cx, 246, '★', style(28, GOLD)).setOrigin(0.5);

    const note = this.add.text(cx, 300, c.promotion.note.join('\n\n'), style(15, TEXT, {
      align: 'center', lineSpacing: 4, wordWrap: { width: 640 },
    })).setOrigin(0.5, 0);
    this.add.text(cx, note.y + note.height + 18, c.promotion.from ?? 'Captain Hale', style(13, DIM, { fontStyle: 'italic' })).setOrigin(0.5, 0);

    const suppressors = c.rank + 1 === SUPPRESSOR_RANK;
    const issued = c.promotion.unlocks ? WEAPONS[c.promotion.unlocks].name : suppressors ? 'Suppressors' : null;
    if (issued) {
      const hint = suppressors ? 'Fit them from the loadout on any briefing.' : 'Try it on the Range, or choose it on your next briefing.';
      this.add.text(cx, note.y + note.height + 70, `Issued: ${issued}`, style(16, ACCENT, { fontStyle: 'bold' })).setOrigin(0.5);
      this.add.text(cx, note.y + note.height + 96, hint, style(12, DIM)).setOrigin(0.5);
    }

    const go = () => goTo(this, 'menu');
    textButton(this, cx, VIEW_H - 80, 'Continue', go, 20);
    this.input.keyboard?.once('keydown-ENTER', go);
  }
}
