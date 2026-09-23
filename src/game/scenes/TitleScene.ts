import Phaser from 'phaser';
import { loadMatchSetup, saveMatchSetup, type MatchMode } from '../flow/MatchSetup';
import { isTouchLayout } from '../ui/deviceLayout';
import { FlowButton } from '../ui/FlowButton';

/** 起動直後の画面。スマホは CPU 対戦、PC はひとりで / ふたりでを選ぶ。 */
export class TitleScene extends Phaser.Scene {
  private left = false;
  private touchMode = false;
  private modeIndex = 0;
  private choiceLabel: Phaser.GameObjects.Text | null = null;
  private enterKey: Phaser.Input.Keyboard.Key | null = null;
  private leftKey: Phaser.Input.Keyboard.Key | null = null;
  private rightKey: Phaser.Input.Keyboard.Key | null = null;

  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.left = false;
    this.modeIndex = 0;
    this.touchMode = isTouchLayout();
    this.cameras.main.setBackgroundColor('#9fd6ff');
    this.input.mouse?.disableContextMenu();

    const board = this.add.graphics().setScrollFactor(0);
    board.fillStyle(0x16324a, 0.14);
    board.fillRoundedRect(292, 108, 700, 500, 28);
    board.fillStyle(0xfffaf2, 0.92);
    board.fillRoundedRect(288, 100, 704, 500, 28);
    board.lineStyle(3, 0xffffff, 0.95);
    board.strokeRoundedRect(288, 100, 704, 500, 28);

    this.add
      .text(640, 210, 'もちブロウル', {
        fontFamily: 'sans-serif',
        fontSize: '72px',
        fontStyle: 'bold',
        color: '#1d4e89'
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.add
      .text(640, 300, '小動物たちの 1対1', {
        fontFamily: 'sans-serif',
        fontSize: '28px',
        color: '#3d4d5c'
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    if (this.touchMode) {
      new FlowButton(this, 640, 430, 'はじめる', () => this.choose('cpu'));
      this.input.on(Phaser.Input.Events.POINTER_DOWN, this.startCpu, this);
    } else {
      new FlowButton(this, 640, 400, 'ひとりで', () => this.choose('cpu'));
      new FlowButton(this, 640, 490, 'ふたりで', () => this.choose('local_vs'), { fill: 0x6d8494 });
      this.choiceLabel = this.add
        .text(640, 560, '', {
          fontFamily: 'sans-serif',
          fontSize: '22px',
          color: '#3d4d5c'
        })
        .setOrigin(0.5);
      this.refreshChoice();
      const keyboard = this.input.keyboard;
      const codes = Phaser.Input.Keyboard.KeyCodes;
      this.leftKey = keyboard?.addKey(codes.LEFT) ?? null;
      this.rightKey = keyboard?.addKey(codes.RIGHT) ?? null;
    }

    this.enterKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER) ?? null;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.off(Phaser.Input.Events.POINTER_DOWN, this.startCpu, this);
      const keyboard = this.input.keyboard;
      if (this.enterKey) keyboard?.removeKey(this.enterKey);
      if (this.leftKey) keyboard?.removeKey(this.leftKey);
      if (this.rightKey) keyboard?.removeKey(this.rightKey);
    });
  }

  update(): void {
    if (this.left) return;
    if (!this.touchMode) {
      if (this.justDown(this.leftKey)) this.setModeIndex(0);
      if (this.justDown(this.rightKey)) this.setModeIndex(1);
    }
    if (this.justDown(this.enterKey)) this.choose(this.touchMode || this.modeIndex === 0 ? 'cpu' : 'local_vs');
  }

  private startCpu(): void {
    this.choose('cpu');
  }

  private setModeIndex(index: number): void {
    this.modeIndex = index;
    this.refreshChoice();
  }

  private refreshChoice(): void {
    const name = this.modeIndex === 0 ? 'ひとりで' : 'ふたりで';
    this.choiceLabel?.setText(`← → で選択    Enter で「${name}」`);
  }

  private choose(mode: MatchMode): void {
    if (this.left) return;
    this.left = true;
    const previous = loadMatchSetup(this);
    saveMatchSetup(this, { ...previous, mode });
    this.scene.start('CharacterSelectScene');
  }

  private justDown(key: Phaser.Input.Keyboard.Key | null): boolean {
    return key !== null && Phaser.Input.Keyboard.JustDown(key);
  }
}
