import type Phaser from 'phaser';
import { type AttackDefinition, type AttackPhaseName, type AttackVisual } from './AttackDefinition';
import { Hitbox } from './Hitbox';
import type { PlaceholderPlayer } from '../player/PlaceholderPlayer';

type SlamStep = 'none' | 'windup' | 'hop' | 'strike';

/** startup → active → recovery。技定義を差し替えて同じ流れで再生する。 */
export class AttackController {
  readonly hitbox: Hitbox;
  private definition: AttackDefinition;
  private phase: AttackPhaseName = 'idle';
  private phaseEndsAt = 0;
  private aim: 1 | -1 = 1;
  private pendingRise = false;
  private now = 0;
  private slamStep: SlamStep = 'none';
  private pendingHop = false;
  private hopVx = 0;
  private hopAt = 0;
  private slamStartedAt = 0;
  private leftGround = false;

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
    this.slamStep = definition.motion?.kind === 'slam' ? 'windup' : 'none';
    this.pendingHop = false;
    this.hopVx = 0;
    this.slamStartedAt = now;
    this.leftGround = false;
    this.hitbox.end();
    return true;
  }

  update(now: number, x: number, y: number): void {
    this.now = now;
    this.advance(now);
    this.hitbox.place(x, y, this.aim);
  }

  /** 入力で速度を決めたあとに呼ぶ。突進、上昇、叩きつけだけが速度を持つ。 */
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
      return;
    }

    if (motion.kind === 'slam' && this.slamStep === 'hop' && !this.slamExpired(motion, this.now)) {
      this.applySlamHop(player, motion);
    }
  }

  cancel(): void {
    this.phase = 'idle';
    this.phaseEndsAt = 0;
    this.pendingRise = false;
    this.slamStep = 'none';
    this.pendingHop = false;
    this.leftGround = false;
    this.hitbox.end();
  }

  private applySlamHop(
    player: PlaceholderPlayer,
    motion: Extract<AttackDefinition['motion'], { kind: 'slam' }>
  ): void {
    if (this.pendingHop) {
      this.hopVx = motion.initialVelocityX * this.aim;
      player.setVelocityY(motion.initialVelocityY);
      this.pendingHop = false;
    }
    player.setVelocityX(this.hopVx);
    if (!player.isLanded) this.leftGround = true;
    if (!player.isLanded && this.now - this.hopAt >= motion.landingDelay) player.setVelocityY(motion.fallVelocity);
    if (!this.leftGround || !player.isLanded) return;

    this.slamStep = 'strike';
    this.phase = 'active';
    this.phaseEndsAt = this.now + this.definition.activeMs;
    this.hitbox.setShape(motion.landingHitbox);
    this.hitbox.begin();
    this.hitbox.place(player.x, player.y, this.aim);
  }

  private advance(now: number): void {
    if (this.slamStep === 'windup' || this.slamStep === 'hop' || this.slamStep === 'strike') {
      this.advanceSlam(now);
      return;
    }
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

  private slamExpired(motion: Extract<AttackDefinition['motion'], { kind: 'slam' }>, now: number): boolean {
    return now - this.slamStartedAt >= motion.maxDurationMs;
  }

  /** 着地しないまま最大時間を超えたら、Hitbox を出さずに通常状態へ戻す。 */
  private endSlamInAir(): void {
    this.phase = 'idle';
    this.phaseEndsAt = 0;
    this.pendingRise = false;
    this.slamStep = 'none';
    this.pendingHop = false;
    this.leftGround = false;
    this.hitbox.end();
  }

  private advanceSlam(now: number): void {
    const motion = this.definition.motion;
    if (
      (this.slamStep === 'windup' || this.slamStep === 'hop') &&
      motion?.kind === 'slam' &&
      this.slamExpired(motion, now)
    ) {
      this.endSlamInAir();
      return;
    }

    if (this.slamStep === 'windup' && now >= this.phaseEndsAt) {
      this.slamStep = 'hop';
      this.pendingHop = true;
      this.hopAt = now;
      this.leftGround = false;
      return;
    }

    if (this.slamStep === 'strike' && now >= this.phaseEndsAt) {
      this.phase = 'recovery';
      this.phaseEndsAt = now + this.definition.recoveryMs;
      this.slamStep = 'none';
      this.hitbox.end();
    }
  }
}
