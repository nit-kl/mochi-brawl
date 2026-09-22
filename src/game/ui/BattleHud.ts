import Phaser from 'phaser';

const PANEL_W = 248;
const PANEL_H = 128;
const STOCK_COUNT = 3;

export type BattleHudSlot = {
  root: Phaser.GameObjects.Container;
};

type SlotParts = BattleHudSlot & {
  percent: Phaser.GameObjects.Text;
  stocks: Phaser.GameObjects.Arc[];
  marker: number;
};

/** 左上と右上の対戦 HUD。ストック数やダメージ計算は持たない。 */
export class BattleHud {
  readonly slots: BattleHudSlot[];
  private readonly parts: SlotParts[];

  constructor(
    scene: Phaser.Scene,
    players: readonly { name: string; marker: number; nameColor: string }[]
  ) {
    this.parts = players.map((player, index) => this.createSlot(scene, player, index === 1));
    this.slots = this.parts;
  }

  refresh(index: number, stocks: number, percent: number): void {
    const slot = this.parts[index];
    if (!slot) return;
    const look = percentLook(percent, slot.marker);
    slot.percent.setText(`${percent}%`);
    slot.percent.setColor(look.color);
    slot.percent.setFontSize(look.size);
    slot.percent.setFontStyle(look.bold ? 'bold' : 'normal');
    slot.stocks.forEach((mark, markIndex) => {
      const filled = markIndex < stocks;
      mark.setFillStyle(filled ? slot.marker : 0xe7eef5, 1);
      mark.setStrokeStyle(filled ? 0 : 2, 0x8aa0b8);
    });
  }

  private createSlot(
    scene: Phaser.Scene,
    player: { name: string; marker: number; nameColor: string },
    alignRight: boolean
  ): SlotParts {
    const root = scene.add.container(0, 0).setScrollFactor(0).setDepth(1500);
    const panel = scene.add.graphics();
    panel.fillStyle(0x16324a, 0.18);
    panel.fillRoundedRect(alignRight ? -PANEL_W + 2 : 2, 5, PANEL_W, PANEL_H, 18);
    panel.fillStyle(0xfffaf2, 0.78);
    panel.fillRoundedRect(alignRight ? -PANEL_W : 0, 0, PANEL_W, PANEL_H, 18);
    panel.lineStyle(2, 0xffffff, 0.9);
    panel.strokeRoundedRect(alignRight ? -PANEL_W : 0, 0, PANEL_W, PANEL_H, 18);
    root.add(panel);

    const markerX = alignRight ? -34 : 34;
    const marker = scene.add.circle(markerX, 32, 16, player.marker);
    marker.setStrokeStyle(3, 0xffffff, 1);
    const name = scene.add
      .text(alignRight ? -58 : 58, 16, player.name, {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: player.nameColor
      })
      .setOrigin(alignRight ? 1 : 0, 0);
    root.add([marker, name]);

    const stocks = Array.from({ length: STOCK_COUNT }, (_, index) => {
      const x = alignRight ? -22 - index * 22 : 22 + index * 22;
      const mark = scene.add.circle(x, 62, 7, player.marker);
      root.add(mark);
      return mark;
    });

    const percent = scene.add
      .text(alignRight ? -16 : 16, PANEL_H - 10, '0%', {
        fontFamily: 'sans-serif',
        fontSize: '40px',
        color: player.nameColor
      })
      .setOrigin(alignRight ? 1 : 0, 1);
    root.add(percent);
    return { root, percent, stocks, marker: player.marker };
  }
}

function percentLook(percent: number, marker: number): { color: string; size: number; bold: boolean } {
  if (percent >= 100) return { color: '#d01212', size: 54, bold: true };
  if (percent >= 50) return { color: '#e07a00', size: 46, bold: true };
  const color = marker === 0xf08a5d ? '#8a3d16' : '#1d4e89';
  return { color, size: 40, bold: false };
}
