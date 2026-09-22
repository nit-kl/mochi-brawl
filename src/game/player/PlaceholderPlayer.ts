import Phaser from 'phaser';
import type { AttackVisual } from '../combat/AttackDefinition';
import type { PlayerInputState } from '../input/PlayerInput';

const WIDTH = 56;
const HEIGHT = 72;
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
  private readonly dashOrb: Phaser.GameObjects.Arc;
  private readonly dashMark: Phaser.GameObjects.Rectangle;
  private readonly balloon: Phaser.GameObjects.Arc;
  private readonly balloonString: Phaser.GameObjects.Rectangle;
  private readonly color: number;
  private facingDirection: 1 | -1 = 1;
  private pose: 'idle' | 'startup' | 'active' | 'recovery' = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number, color: number, gravityScale: number) {
    this.color = color;
    this.object = scene.add.rectangle(x, y, WIDTH, HEIGHT, color);
    this.object.setStrokeStyle(3, 0x666666);
    this.object.setDepth(1);
    this.marker = scene.add.rectangle(x + 22, y, 14, 20, 0x333333);
    this.marker.setDepth(2);
    this.dashOrb = scene.add.circle(x, y, 40, 0xffe39a, 0.88);
    this.dashOrb.setStrokeStyle(3, 0xc48a00);
    this.dashOrb.setDepth(3);
    this.dashOrb.setVisible(false);
    this.dashMark = scene.add.rectangle(x + 18, y, 10, 16, 0xc48a00);
    this.dashMark.setDepth(4);
    this.dashMark.setVisible(false);
    this.balloon = scene.add.circle(x, y - 78, 16, 0xff8fb8, 0.95);
    this.balloon.setStrokeStyle(2, 0xc45b7a);
    this.balloon.setDepth(3);
    this.balloon.setVisible(false);
    this.balloonString = scene.add.rectangle(x, y - 46, 3, 36, 0x666666);
    this.balloonString.setDepth(3);
    this.balloonString.setVisible(false);
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
      this.syncMarker();
      return;
    }

    if (mode === 'knockback-air') {
      this.updateFacing(input, canMove);
      this.decayAirSpeed(dt);
      if (canMove && input.moveX !== 0) {
        this.body.velocity.x += input.moveX * KNOCKBACK_STEER_ACCEL * dt;
      }
      if (requestJump) this.body.setVelocityY(movement.jumpVelocity);
      this.syncMarker();
      return;
    }

    this.updateFacing(input, canMove);
    if (!canMove) this.body.setVelocityX(0);
    else if (this.isLanded) this.body.setVelocityX(input.moveX * movement.moveSpeed);
    else this.steerToward(input.moveX * movement.moveSpeed, movement.airMoveAcceleration, dt);
    if (requestJump) this.body.setVelocityY(movement.jumpVelocity);
    this.syncMarker();
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

  setActionVisual(style: AttackVisual, dt: number): void {
    const dashing = style === 'dash';
    const ballooning = style === 'balloon';
    this.dashOrb.setVisible(dashing);
    this.dashMark.setVisible(dashing);
    this.balloon.setVisible(ballooning);
    this.balloonString.setVisible(ballooning);
    this.marker.setVisible(!dashing && this.object.visible);
    if (dashing) {
      this.dashOrb.setPosition(this.object.x, this.object.y);
      this.dashOrb.rotation += 14 * dt;
      this.dashMark.setPosition(
        this.object.x + Math.cos(this.dashOrb.rotation) * 22,
        this.object.y + Math.sin(this.dashOrb.rotation) * 22
      );
    }
    if (ballooning) {
      this.balloon.setPosition(this.object.x, this.object.y - 78);
      this.balloonString.setPosition(this.object.x, this.object.y - 46);
    }
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
    this.dashOrb.setVisible(false);
    this.dashMark.setVisible(false);
    this.balloon.setVisible(false);
    this.balloonString.setVisible(false);
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
    this.dashOrb.setVisible(false);
    this.dashMark.setVisible(false);
    this.balloon.setVisible(false);
    this.balloonString.setVisible(false);
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

  private syncMarker(): void {
    const reach = this.pose === 'active' ? 40 : this.pose === 'startup' ? 12 : 22;
    this.marker.setPosition(this.object.x + this.facingDirection * reach, this.object.y);
  }
}
