import Phaser from 'phaser';
import type { PlayerInputState } from '../input/PlayerInput';

const WIDTH = 56;
const HEIGHT = 72;
const MOVE_SPEED = 280;
const JUMP_VELOCITY = -620;

/** 画像なしの仮キャラ。入力状態だけを受け取り、デバイスのことは知らない。 */
export class PlaceholderPlayer {
  readonly object: Phaser.GameObjects.Rectangle;
  private readonly body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
    this.object = scene.add.rectangle(x, y, WIDTH, HEIGHT, color);
    this.object.setStrokeStyle(3, 0x666666);
    this.object.setDepth(1);
    scene.physics.add.existing(this.object);

    const body = this.object.body;
    if (!(body instanceof Phaser.Physics.Arcade.Body)) {
      throw new Error('仮キャラクターの Arcade Body を作成できませんでした');
    }

    this.body = body;
    this.body.setCollideWorldBounds(false);
    this.body.setAllowGravity(true);
    this.body.setMaxVelocity(450, 900);
    this.body.setBounce(0);
    this.body.setDrag(0, 0);
  }

  get y(): number {
    return this.object.y;
  }

  applyInput(input: PlayerInputState): void {
    this.body.setVelocityX(input.moveX * MOVE_SPEED);

    if (input.jump && this.body.blocked.down) {
      this.body.setVelocityY(JUMP_VELOCITY);
    }
  }

  place(x: number, y: number): void {
    this.object.setVisible(true);
    this.object.setAlpha(1);
    this.body.enable = true;
    this.body.setAllowGravity(true);
    this.body.reset(x, y);
  }

  setAlpha(alpha: number): void {
    this.object.setAlpha(alpha);
  }

  eliminate(): void {
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.body.enable = false;
    this.object.setVisible(false);
  }
}
