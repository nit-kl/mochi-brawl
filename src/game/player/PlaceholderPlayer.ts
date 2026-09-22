import Phaser from 'phaser';
import type { PlayerInputState } from '../input/PlayerInput';

const WIDTH = 56;
const HEIGHT = 72;
const MOVE_SPEED = 280;
const JUMP_VELOCITY = -620;
/** 空中の吹き飛ばしを、1秒あたりこの割合で指数減衰させる。 */
const AIR_DRAG_PER_SECOND = 1.05;
/** 操作復帰後に足す横加速度。通常の移動速度へは置き換えない。 */
const KNOCKBACK_STEER_ACCEL = 520;

export type MovementMode = 'normal' | 'knockback-locked' | 'knockback-air';

/** 画像なしの仮キャラ。入力状態だけを受け取り、デバイスのことは知らない。 */
export class PlaceholderPlayer {
  readonly object: Phaser.GameObjects.Rectangle;
  private readonly body: Phaser.Physics.Arcade.Body;
  private readonly marker: Phaser.GameObjects.Rectangle;
  private readonly color: number;
  private facingDirection: 1 | -1 = 1;
  private pose: 'idle' | 'startup' | 'active' | 'recovery' = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
    this.color = color;
    this.object = scene.add.rectangle(x, y, WIDTH, HEIGHT, color);
    this.object.setStrokeStyle(3, 0x666666);
    this.object.setDepth(1);
    this.marker = scene.add.rectangle(x + 22, y, 14, 20, 0x333333);
    this.marker.setDepth(2);
    scene.physics.add.existing(this.object);

    const body = this.object.body;
    if (!(body instanceof Phaser.Physics.Arcade.Body)) {
      throw new Error('仮キャラクターの Arcade Body を作成できませんでした');
    }

    this.body = body;
    this.body.setCollideWorldBounds(false);
    this.body.setAllowGravity(true);
    this.body.setMaxVelocity(2400, 2400);
    this.body.setBounce(0);
    this.body.setDrag(0, 0);
  }

  get y(): number {
    return this.object.y;
  }

  get x(): number {
    return this.object.x;
  }

  get facing(): 1 | -1 {
    return this.facingDirection;
  }

  get velocityX(): number {
    return this.body.velocity.x;
  }

  /** 下に着いていて、上方向へ打ち上げられていない。 */
  get isLanded(): boolean {
    return this.body.blocked.down && this.body.velocity.y >= 0;
  }

  applyInput(input: PlayerInputState, canMove: boolean, mode: MovementMode, dt: number): void {
    if (mode === 'knockback-locked') {
      this.decayAirSpeed(dt);
      this.syncMarker();
      return;
    }

    if (mode === 'knockback-air') {
      this.updateFacing(input, canMove);
      this.decayAirSpeed(dt);
      if (canMove && input.moveX !== 0) {
        this.body.velocity.x += input.moveX * KNOCKBACK_STEER_ACCEL * dt;
      }
      this.syncMarker();
      return;
    }

    this.updateFacing(input, canMove);
    this.body.setVelocityX(canMove ? input.moveX * MOVE_SPEED : 0);
    if (canMove && input.jump && this.body.blocked.down) {
      this.body.setVelocityY(JUMP_VELOCITY);
    }
    this.syncMarker();
  }

  setVelocity(x: number, y: number): void {
    this.body.setVelocity(x, y);
  }

  setPose(phase: 'idle' | 'startup' | 'active' | 'recovery'): void {
    this.pose = phase;
    if (phase === 'startup') this.marker.setDisplaySize(10, 14);
    else if (phase === 'active') this.marker.setDisplaySize(30, 16);
    else if (phase === 'recovery') this.marker.setDisplaySize(12, 12);
    else this.marker.setDisplaySize(14, 20);
    this.syncMarker();
  }

  setFill(color: number): void {
    this.object.setFillStyle(color);
  }

  restoreColor(): void {
    this.object.setFillStyle(this.color);
  }

  place(x: number, y: number): void {
    this.object.setVisible(true);
    this.object.setAlpha(1);
    this.marker.setDisplaySize(14, 20);
    this.pose = 'idle';
    this.marker.setVisible(true);
    this.body.enable = true;
    this.body.setAllowGravity(true);
    this.body.reset(x, y);
    this.syncMarker();
  }

  setAlpha(alpha: number): void {
    this.object.setAlpha(alpha);
    this.marker.setAlpha(alpha);
  }

  eliminate(): void {
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.body.enable = false;
    this.object.setVisible(false);
    this.marker.setVisible(false);
  }

  private updateFacing(input: PlayerInputState, canMove: boolean): void {
    if (!canMove) return;
    if (input.moveX < 0) this.facingDirection = -1;
    else if (input.moveX > 0) this.facingDirection = 1;
  }

  private decayAirSpeed(dt: number): void {
    if (dt <= 0) return;
    this.body.velocity.x *= Math.exp(-AIR_DRAG_PER_SECOND * dt);
  }

  private syncMarker(): void {
    const reach = this.pose === 'active' ? 40 : this.pose === 'startup' ? 12 : 22;
    this.marker.setPosition(this.object.x + this.facingDirection * reach, this.object.y);
  }
}
