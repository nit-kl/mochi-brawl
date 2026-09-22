import type Phaser from 'phaser';
import type { Rect } from '../combat/Rect';
import type { KoBounds } from '../stage/KoBounds';

/** F3 で切り替える開発用表示。普段は描かない。 */
export class CombatDebugOverlay {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, private readonly bounds: KoBounds) {
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

  draw(enabled: boolean, hurtboxes: readonly Rect[]): void {
    this.graphics.clear();
    this.label.setVisible(enabled);
    if (!enabled) return;

    const { left, right, top, bottom } = this.bounds;
    this.graphics.lineStyle(2, 0xff4d6a, 0.85);
    this.graphics.strokeRect(left, top, right - left, bottom - top);
    this.label.setText(`KO境界  左 ${left}  右 ${right}  上 ${top}  下 ${bottom}`);

    this.graphics.lineStyle(2, 0x14b8a6, 1);
    for (const box of hurtboxes) {
      this.graphics.strokeRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
    }
  }
}
