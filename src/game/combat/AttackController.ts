import type Phaser from 'phaser';
import { type AttackDefinition, type AttackPhaseName } from './AttackDefinition';
import { Hitbox } from './Hitbox';

/** startup → active → recovery。数値は AttackDefinition から読む。 */
export class AttackController {
  readonly hitbox: Hitbox;
  private phase: AttackPhaseName = 'idle';
  private phaseEndsAt = 0;

  constructor(scene: Phaser.Scene, private readonly definition: AttackDefinition) {
    this.hitbox = new Hitbox(scene, definition);
  }

  get currentPhase(): AttackPhaseName {
    return this.phase;
  }

  allowsMovement(): boolean {
    return this.phase === 'idle' || this.definition.canMoveDuringAttack;
  }

  update(now: number, attackPressed: boolean, facing: 1 | -1, x: number, y: number): void {
    this.advance(now);
    if (attackPressed) this.tryStart(now);
    this.hitbox.place(x, y, facing);
  }

  cancel(): void {
    this.phase = 'idle';
    this.phaseEndsAt = 0;
    this.hitbox.end();
  }

  private advance(now: number): void {
    if (this.phase === 'idle' || now < this.phaseEndsAt) return;

    if (this.phase === 'startup') {
      this.phase = 'active';
      this.phaseEndsAt = now + this.definition.activeMs;
      this.hitbox.begin();
      return;
    }

    if (this.phase === 'active') {
      this.phase = 'recovery';
      this.phaseEndsAt = now + this.definition.recoveryMs;
      this.hitbox.end();
      return;
    }

    this.phase = 'idle';
  }

  private tryStart(now: number): void {
    if (this.phase !== 'idle') return;
    this.phase = 'startup';
    this.phaseEndsAt = now + this.definition.startupMs;
    this.hitbox.end();
  }
}
