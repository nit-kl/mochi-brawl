import Phaser from 'phaser';
import type { AttackDefinition, HitboxShape } from './AttackDefinition';
import { rectFromCenter, type Rect } from './Rect';

type ResolvedHitbox = {
  forward: number;
  width: number;
  height: number;
  offsetY: number;
};

/** 攻撃判定。active の間だけ有効で、同じ相手には1回しか当たらない。 */
export class Hitbox {
  private enabled = false;
  private readonly alreadyHit = new Set<number>();
  private readonly visual: Phaser.GameObjects.Rectangle;
  private shape: ResolvedHitbox;
  private centerX = 0;
  private centerY = 0;

  constructor(scene: Phaser.Scene, definition: AttackDefinition) {
    this.shape = resolveShape(definition.hitbox);
    this.visual = scene.add.rectangle(0, 0, this.shape.width, this.shape.height, 0xffe14a, 0.7);
    this.visual.setStrokeStyle(2, 0xc48a00);
    this.visual.setDepth(2);
    this.visual.setVisible(false);
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  use(definition: AttackDefinition): void {
    this.applyShape(resolveShape(definition.hitbox));
  }

  setShape(shape: HitboxShape): void {
    this.applyShape(resolveShape(shape));
  }

  begin(): void {
    this.enabled = true;
    this.alreadyHit.clear();
    this.visual.setVisible(false);
  }

  end(): void {
    this.enabled = false;
    this.visual.setVisible(false);
  }

  /** F3 のときだけ、有効な攻撃判定を黄色で出す。 */
  setDebugVisible(show: boolean): void {
    this.visual.setVisible(show && this.enabled);
  }

  place(x: number, y: number, facing: 1 | -1): void {
    this.centerX = x + this.shape.forward * facing;
    this.centerY = y + this.shape.offsetY;
    this.visual.setPosition(this.centerX, this.centerY);
  }

  bounds(): Rect {
    return rectFromCenter(this.centerX, this.centerY, this.shape.width, this.shape.height);
  }

  /** この攻撃でその相手に初めて当たるときだけ true。 */
  claim(targetId: number): boolean {
    if (!this.enabled || this.alreadyHit.has(targetId)) return false;
    this.alreadyHit.add(targetId);
    return true;
  }

  private applyShape(shape: ResolvedHitbox): void {
    this.shape = shape;
    this.visual.setDisplaySize(shape.width, shape.height);
  }
}

function resolveShape(shape: HitboxShape): ResolvedHitbox {
  return {
    forward: shape.forward,
    width: shape.width,
    height: shape.height,
    offsetY: shape.offsetY ?? 0
  };
}
