import type Phaser from 'phaser';
import type { Rect } from '../combat/Rect';
import type { KoBounds } from '../stage/KoBounds';

/** F3 で切り替える開発用表示。普段は描かない。 */
export class CombatDebugOverlay {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(40);
    this.label = scene.add
      .text(640, 148, '', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#333333'
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1600)
      .setVisible(false);
  }

  draw(enabled: boolean, hurtboxes: readonly Rect[], bounds: KoBounds, stageLine = ''): void {
    this.graphics.clear();
    this.label.setVisible(enabled);
    if (!enabled) return;

    this.graphics.lineStyle(2, 0xff4d6a, 0.85);
    this.graphics.lineBetween(bounds.left, 0, bounds.left, 720);
    this.graphics.lineBetween(bounds.right, 0, bounds.right, 720);
    this.graphics.lineBetween(0, bounds.top, 1280, bounds.top);
    const bottomLine = bounds.bottomKoEnabled ? `下 ${Math.round(bounds.bottom)}` : 'bottom KO disabled';
    const boundsLine = [
      `current KO left ${Math.round(bounds.left)}`,
      `current KO right ${Math.round(bounds.right)}`,
      `current KO top ${Math.round(bounds.top)}`,
      bottomLine
    ].join('\n');
    this.label.setText(stageLine ? `${stageLine}\n${boundsLine}` : boundsLine);

    this.graphics.lineStyle(2, 0x14b8a6, 1);
    for (const box of hurtboxes) {
      this.graphics.strokeRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
    }
  }
}
