import Phaser from 'phaser';
import { FlowButton } from '../ui/FlowButton';

/** 起動直後の画面。選択結果はまだ持たない。 */
export class TitleScene extends Phaser.Scene {
  private left = false;
  private enterKey: Phaser.Input.Keyboard.Key | null = null;

  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.left = false;
    this.cameras.main.setBackgroundColor('#9fd6ff');
    this.input.mouse?.disableContextMenu();

    const board = this.add.graphics().setScrollFactor(0);
    board.fillStyle(0x16324a, 0.14);
    board.fillRoundedRect(292, 128, 700, 420, 28);
    board.fillStyle(0xfffaf2, 0.92);
    board.fillRoundedRect(288, 120, 704, 420, 28);
    board.lineStyle(3, 0xffffff, 0.95);
    board.strokeRoundedRect(288, 120, 704, 420, 28);

    this.add
      .text(640, 230, 'もちブロウル', {
        fontFamily: 'sans-serif',
        fontSize: '72px',
        fontStyle: 'bold',
        color: '#1d4e89'
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.add
      .text(640, 320, '小動物たちの 1対1', {
        fontFamily: 'sans-serif',
        fontSize: '28px',
        color: '#3d4d5c'
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    new FlowButton(this, 640, 440, 'はじめる', () => this.begin());
    this.enterKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER) ?? null;
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.begin, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off(Phaser.Input.Events.POINTER_DOWN, this.begin, this);
      if (this.enterKey) this.input.keyboard?.removeKey(this.enterKey);
    });
  }

  update(): void {
    if (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) this.begin();
  }

  private begin(): void {
    if (this.left) return;
    this.left = true;
    this.scene.start('CharacterSelectScene');
  }
}
