import type Phaser from 'phaser';
import { type AttackDefinition, type AttackPhaseName, type AttackVisual } from './AttackDefinition';
import { Hitbox } from './Hitbox';
import type { PlaceholderPlayer } from '../player/PlaceholderPlayer';

/** startup → active → recovery。技定義を差し替えて同じ流れで再生する。 */
export class AttackController {
  readonly hitbox: Hitbox;
  private definition: AttackDefinition;
  private phase: AttackPhaseName = 'idle';
  private phaseEndsAt = 0;
  private aim: 1 | -1 = 1;
  private pendingRise = false;

  constructor(scene: Phaser.Scene, definition: AttackDefinition) {
    this.definition = definition;
    this.hitbox = new Hitbox(scene, definition);
  }

  get currentPhase(): AttackPhaseName {
    return this.phase;
  }

  get attackDefinition(): AttackDefinition {
    return this.definition;
  }

  get visual(): AttackVisual {
    return this.phase === 'idle' ? 'default' : this.definition.visual;
  }

  allowsMovement(): boolean {
    return this.phase === 'idle' || this.definition.canMoveDuringAttack;
  }

  /** 再生を始めたときだけ true。 */
  tryStart(now: number, definition: AttackDefinition, facing: 1 | -1): boolean {
    if (this.phase !== 'idle') return false;
    this.definition = definition;
    this.aim = facing;
    this.hitbox.use(definition);
    this.phase = 'startup';
    this.phaseEndsAt = now + definition.startupMs;
    this.pendingRise = false;
    this.hitbox.end();
    return true;
  }

  update(now: number, x: number, y: number): void {
    this.advance(now);
    this.hitbox.place(x, y, this.aim);
  }

  /** 入力で速度を決めたあとに呼ぶ。突進と上昇だけが速度を持つ。 */
  applyMotion(player: PlaceholderPlayer, moveX: number): void {
    const motion = this.definition.motion;
    if (!motion || this.phase === 'idle') return;

    if (motion.kind === 'dash' && this.phase === 'active') {
      player.setVelocityX(motion.speed * this.aim);
      return;
    }

    if (motion.kind === 'rise' && (this.phase === 'active' || this.phase === 'recovery')) {
      if (this.pendingRise) {
        player.setVelocityY(motion.velocity);
        this.pendingRise = false;
      }
      player.setVelocityX(moveX * motion.steerSpeed);
    }
  }

  cancel(): void {
    this.phase = 'idle';
    this.phaseEndsAt = 0;
    this.pendingRise = false;
    this.hitbox.end();
  }

  private advance(now: number): void {
    if (this.phase === 'idle' || now < this.phaseEndsAt) return;

    if (this.phase === 'startup') {
      this.phase = 'active';
      this.phaseEndsAt = now + this.definition.activeMs;
      this.pendingRise = this.definition.motion?.kind === 'rise';
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
    this.pendingRise = false;
  }
}
