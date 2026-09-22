import Phaser from 'phaser';
import { FlowButton } from './FlowButton';

const KO_MS = 420;

export type MatchResultActions = {
  onRematch: () => void;
  onBack: () => void;
};

/** 勝敗パネルと、復活を待たせない短い KO 表示。 */
export class MatchResultView {
  private readonly panel: Phaser.GameObjects.Container;
  private readonly title: Phaser.GameObjects.Text;
  private readonly koText: Phaser.GameObjects.Text;
  private readonly koLight: Phaser.GameObjects.Arc;
  private readonly rematchButton: FlowButton;
  private readonly backButton: FlowButton;
  private koUntil = -1;

  constructor(scene: Phaser.Scene) {
    const board = scene.add.graphics();
    board.fillStyle(0x16324a, 0.2);
    board.fillRoundedRect(-254, -154, 516, 348, 22);
    board.fillStyle(0xfffaf2, 0.94);
    board.fillRoundedRect(-260, -160, 520, 348, 22);
    board.lineStyle(3, 0xffffff, 0.95);
    board.strokeRoundedRect(-260, -160, 520, 348, 22);
    this.title = scene.add
      .text(0, -108, '', {
        fontFamily: 'sans-serif',
        fontSize: '42px',
        fontStyle: 'bold',
        color: '#1d4e89',
        align: 'center'
      })
      .setOrigin(0.5);
    const hint = scene.add
      .text(0, 142, 'R 再戦    Esc キャラ選択', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#3d4d5c',
        align: 'center'
      })
      .setOrigin(0.5);
    this.panel = scene.add.container(640, 300, [board, this.title, hint]).setScrollFactor(0).setDepth(2100).setVisible(false);

    this.rematchButton = new FlowButton(scene, 640, 292, '再戦', () => undefined, {
      width: 360,
      height: 64,
      depth: 2200,
      enabled: false
    });
    this.backButton = new FlowButton(scene, 640, 372, 'キャラ選択へ', () => undefined, {
      width: 360,
      height: 64,
      fill: 0x6d8494,
      depth: 2200,
      enabled: false
    });

    this.koLight = scene.add.circle(0, 0, 18, 0xfff6c8, 0.9).setDepth(1800).setVisible(false);
    this.koText = scene.add
      .text(0, 0, 'KO!', {
        fontFamily: 'sans-serif',
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#d01212',
        stroke: '#fffaf2',
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setDepth(1900)
      .setVisible(false);
  }

  showWinner(name: string | null, actions: MatchResultActions): void {
    this.title.setText(name ? `${name} WIN` : '引き分け');
    this.title.setColor(name === 'ぽてち' ? '#8a3d16' : '#1d4e89');
    this.panel.setVisible(true);
    this.rematchButton.setOnPress(actions.onRematch);
    this.backButton.setOnPress(actions.onBack);
    this.rematchButton.setEnabled(true);
    this.backButton.setEnabled(true);
  }

  showKo(x: number, y: number, now: number): void {
    const point = { x: Phaser.Math.Clamp(x, 90, 1190), y: Phaser.Math.Clamp(y, 140, 560) };
    this.koUntil = now + KO_MS;
    this.koLight.setPosition(point.x, point.y).setVisible(true).setAlpha(0.95).setScale(1);
    this.koText.setPosition(point.x, point.y - 36).setVisible(true).setAlpha(1);
  }

  update(now: number): void {
    if (this.koUntil < 0) return;
    const t = (now - (this.koUntil - KO_MS)) / KO_MS;
    if (t >= 1) {
      this.koUntil = -1;
      this.koLight.setVisible(false);
      this.koText.setVisible(false);
      return;
    }
    this.koLight.setAlpha(1 - t).setScale(1 + t * 1.4);
    this.koText.setAlpha(1 - t);
  }
}
