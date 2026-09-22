import Phaser from 'phaser';

/** メニュー用の角丸ボタン。対戦の判定には使わない。 */
export class FlowButton {
  readonly root: Phaser.GameObjects.Container;
  private readonly zone: Phaser.GameObjects.Zone;
  private onPress: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    onPress: () => void,
    options?: { width?: number; height?: number; fill?: number; depth?: number; enabled?: boolean }
  ) {
    const width = options?.width ?? 300;
    const height = options?.height ?? 68;
    const fill = options?.fill ?? 0x4c8dff;
    this.onPress = onPress;
    const board = scene.add.graphics();
    board.fillStyle(0x16324a, 0.18);
    board.fillRoundedRect(-width / 2 + 2, -height / 2 + 4, width, height, 18);
    board.fillStyle(fill, 1);
    board.fillRoundedRect(-width / 2, -height / 2, width, height, 18);
    board.lineStyle(3, 0xffffff, 0.95);
    board.strokeRoundedRect(-width / 2, -height / 2, width, height, 18);
    const text = scene.add
      .text(0, 0, label, {
        fontFamily: 'sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#ffffff'
      })
      .setOrigin(0.5);
    this.root = scene.add.container(x, y, [board, text]).setScrollFactor(0).setDepth(options?.depth ?? 20);
    this.zone = scene.add.zone(x, y, width, height).setScrollFactor(0).setDepth((options?.depth ?? 20) + 1);
    this.zone.on(
      'pointerdown',
      (_pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.onPress();
      }
    );
    this.setEnabled(options?.enabled ?? true);
  }

  setOnPress(onPress: () => void): void {
    this.onPress = onPress;
  }

  setEnabled(enabled: boolean): void {
    this.root.setVisible(enabled);
    this.zone.setVisible(enabled);
    if (enabled) this.zone.setInteractive();
    else this.zone.disableInteractive();
  }
}
