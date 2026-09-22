import Phaser from 'phaser';
import { KeyboardInput } from '../input/KeyboardInput';
import { PlayerInput } from '../input/PlayerInput';
import { TouchInput } from '../input/TouchInput';
import { PlaceholderPlayer } from '../player/PlaceholderPlayer';

export class BattleScene extends Phaser.Scene {
  private player!: PlaceholderPlayer;
  private playerInput!: PlayerInput;

  constructor() {
    super('BattleScene');
  }

  create(): void {
    this.cameras.main.setScroll(0, 0);
    this.input.mouse?.disableContextMenu();

    this.add.text(24, 20, 'mochi-brawl', {
      fontFamily: 'sans-serif',
      fontSize: '28px',
      color: '#222222'
    });

    const ground = this.add.rectangle(640, 610, 900, 90, 0x79b85a);
    ground.setDepth(0);
    this.physics.add.existing(ground, true);

    this.player = new PlaceholderPlayer(this, 640, 470);
    this.physics.add.collider(this.player.object, ground);

    this.playerInput = new PlayerInput([new KeyboardInput(this), new TouchInput(this)]);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.playerInput.destroy());
  }

  update(): void {
    this.player.applyInput(this.playerInput.read());
  }
}
