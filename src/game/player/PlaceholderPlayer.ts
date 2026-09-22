import Phaser from 'phaser';
import type { PlayerInputState } from '../input/PlayerInput';

const WIDTH = 56;
const HEIGHT = 72;
/** 空中の吹き飛ばしを、1秒あたりこの割合で指数減衰させる。 */
const AIR_DRAG_PER_SECOND = 1.05;
/** 操作復帰後に足す横加速度。通常の移動速度へは置き換えない。 */
const KNOCKBACK_STEER_ACCEL = 520;

export type MovementMode = 'normal' | 'knockback-locked' | 'knockback-air';

/** 見た目を持たない物理ボディ。表示は CharacterView が行う。 */
export class PlaceholderPlayer {
  readonly object: Phaser.GameObjects.Rectangle;
  private readonly body: Phaser.Physics.Arcade.Body;
  private facingDirection: 1 | -1 = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, gravityScale: number) {
    this.object = scene.add.rectangle(x, y, WIDTH, HEIGHT, 0xffffff, 0);
    this.object.setVisible(false);
    scene.physics.add.existing(this.object);

    const body = this.object.body;
    if (!(body instanceof Phaser.Physics.Arcade.Body)) {
      throw new Error('キャラクターの Arcade Body を作成できませんでした');
    }

    this.body = body;
    this.body.setCollideWorldBounds(false);
    this.body.setAllowGravity(true);
    this.body.setMaxVelocity(2400, 2400);
    this.body.setBounce(0);
    this.body.setDrag(0, 0);
    const worldGravity = scene.physics.world?.gravity.y ?? 1400;
    this.body.setGravityY(worldGravity * (gravityScale - 1));
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

  get velocityY(): number {
    return this.body.velocity.y;
  }

  /** 下に着いていて、上方向へ打ち上げられていない。 */
  get isLanded(): boolean {
    return this.body.blocked.down && this.body.velocity.y >= 0;
  }

  applyInput(
    input: PlayerInputState,
    canMove: boolean,
    mode: MovementMode,
    dt: number,
    movement: { moveSpeed: number; airMoveAcceleration: number; jumpVelocity: number },
    requestJump: boolean
  ): void {
    if (mode === 'knockback-locked') {
      this.decayAirSpeed(dt);
      return;
    }

    if (mode === 'knockback-air') {
      this.updateFacing(input, canMove);
      this.decayAirSpeed(dt);
      if (canMove && input.moveX !== 0) {
        this.body.velocity.x += input.moveX * KNOCKBACK_STEER_ACCEL * dt;
      }
      if (requestJump) this.body.setVelocityY(movement.jumpVelocity);
      return;
    }

    this.updateFacing(input, canMove);
    if (!canMove) this.body.setVelocityX(0);
    else if (this.isLanded) this.body.setVelocityX(input.moveX * movement.moveSpeed);
    else this.steerToward(input.moveX * movement.moveSpeed, movement.airMoveAcceleration, dt);
    if (requestJump) this.body.setVelocityY(movement.jumpVelocity);
  }

  setVelocity(x: number, y: number): void {
    this.body.setVelocity(x, y);
  }

  setVelocityX(x: number): void {
    this.body.setVelocityX(x);
  }

  setVelocityY(y: number): void {
    this.body.setVelocityY(y);
  }

  place(x: number, y: number): void {
    this.object.setVisible(false);
    this.body.enable = true;
    this.body.setAllowGravity(true);
    this.body.reset(x, y);
  }

  eliminate(): void {
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);
    this.body.enable = false;
    this.object.setVisible(false);
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

  private steerToward(target: number, acceleration: number, dt: number): void {
    const delta = target - this.body.velocity.x;
    const step = acceleration * dt;
    if (Math.abs(delta) <= step) this.body.velocity.x = target;
    else this.body.velocity.x += Math.sign(delta) * step;
  }
}
