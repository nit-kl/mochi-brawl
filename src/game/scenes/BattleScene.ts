import Phaser from 'phaser';

export class BattleScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('BattleScene');
  }

  create() {
    this.add.text(24, 20, 'mochi-brawl / Milestone 01', {
      fontFamily: 'sans-serif',
      fontSize: '28px',
      color: '#222222'
    });

    const ground = this.add.rectangle(640, 610, 900, 90, 0x79b85a);
    this.physics.add.existing(ground, true);

    this.player = this.add.rectangle(520, 500, 56, 72, 0xffffff);
    this.physics.add.existing(this.player);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(false);
    body.setMaxVelocity(450, 900);

    this.physics.add.collider(this.player, ground);
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const speed = 260;

    if (this.cursors.left.isDown) body.setVelocityX(-speed);
    else if (this.cursors.right.isDown) body.setVelocityX(speed);
    else body.setVelocityX(0);

    if (Phaser.Input.Keyboard.JustDown(this.cursors.space) && body.blocked.down) {
      body.setVelocityY(-620);
    }
  }
}
