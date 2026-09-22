import Phaser from 'phaser';
import type { AttackDefinition } from './AttackDefinition';
import { rectFromCenter, type Rect } from './Rect';

/** 攻撃判定。active の間だけ有効で、同じ相手には1回しか当たらない。 */
export class Hitbox {
  private enabled = false;
  private readonly alreadyHit = new Set<number>();
  private readonly visual: Phaser.GameObjects.Rectangle;
  private centerX = 0;
  private centerY = 0;

  constructor(scene: Phaser.Scene, private definition: AttackDefinition) {
    const { width, height } = definition.hitbox;
    this.visual = scene.add.rectangle(0, 0, width, height, 0xffe14a, 0.7);
    this.visual.setStrokeStyle(2, 0xc48a00);
    this.visual.setDepth(2);
    this.visual.setVisible(false);
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  use(definition: AttackDefinition): void {
    this.definition = definition;
    this.visual.setDisplaySize(definition.hitbox.width, definition.hitbox.height);
  }

  begin(): void {
    this.enabled = true;
    this.alreadyHit.clear();
    this.visual.setVisible(true);
  }

  end(): void {
    this.enabled = false;
    this.visual.setVisible(false);
  }

  place(x: number, y: number, facing: 1 | -1): void {
    this.centerX = x + this.definition.hitbox.forward * facing;
    this.centerY = y;
    this.visual.setPosition(this.centerX, this.centerY);
  }

  bounds(): Rect {
    return rectFromCenter(this.centerX, this.centerY, this.definition.hitbox.width, this.definition.hitbox.height);
  }

  /** この攻撃でその相手に初めて当たるときだけ true。 */
  claim(targetId: number): boolean {
    if (!this.enabled || this.alreadyHit.has(targetId)) return false;
    this.alreadyHit.add(targetId);
    return true;
  }
}
