import Phaser from 'phaser';

const KO_MS = 420;

/** 勝敗パネルと、復活を待たせない短い KO 表示。 */
export class MatchResultView {
  private readonly panel: Phaser.GameObjects.Container;
  private readonly title: Phaser.GameObjects.Text;
  private readonly koText: Phaser.GameObjects.Text;
  private readonly koLight: Phaser.GameObjects.Arc;
  private koUntil = -1;

  constructor(scene: Phaser.Scene) {
    const board = scene.add.graphics();
    board.fillStyle(0x16324a, 0.2);
    board.fillRoundedRect(-214, -68, 436, 156, 22);
    board.fillStyle(0xfffaf2, 0.94);
    board.fillRoundedRect(-220, -76, 440, 156, 22);
    board.lineStyle(3, 0xffffff, 0.95);
    board.strokeRoundedRect(-220, -76, 440, 156, 22);
    this.title = scene.add
      .text(0, -28, '', {
        fontFamily: 'sans-serif',
        fontSize: '42px',
        fontStyle: 'bold',
        color: '#1d4e89',
        align: 'center'
      })
      .setOrigin(0.5);
    const hint = scene.add
      .text(0, 28, 'Rキー / タップで再戦', {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        color: '#3d4d5c',
        align: 'center'
      })
      .setOrigin(0.5);
    this.panel = scene.add.container(640, 250, [board, this.title, hint]).setScrollFactor(0).setDepth(2100).setVisible(false);

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

  showWinner(name: string | null): void {
    this.title.setText(name ? `${name} WIN` : '引き分け');
    this.title.setColor(name === 'ぽてち' ? '#8a3d16' : '#1d4e89');
    this.panel.setVisible(true);
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
