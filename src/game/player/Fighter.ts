import type Phaser from 'phaser';
import { AttackController } from '../combat/AttackController';
import type { HitResult } from '../combat/HitResult';
import { Hurtbox } from '../combat/Hurtbox';
import { UP_SPECIAL_INPUT, type CharacterDefinition } from '../characters/CharacterDefinition';
import type { PlayerInputState } from '../input/PlayerInput';
import { PlaceholderPlayer } from './PlaceholderPlayer';

const BODY_WIDTH = 56;
const BODY_HEIGHT = 72;
const HIT_FLASH_MS = 160;

/** 1人分のキャラクター。入力・攻撃・被弾判定を組み立てる。 */
export class Fighter {
  readonly id: 1 | 2;
  readonly character: PlaceholderPlayer;
  readonly hurtbox = new Hurtbox(BODY_WIDTH, BODY_HEIGHT);
  readonly attack: AttackController;
  readonly stats: CharacterDefinition;
  damagePercent = 0;
  alive = true;
  private flashUntil = 0;
  private isInKnockback = false;
  private knockbackUntil = 0;
  private previousTime = -1;
  private jumpsRemaining: number;
  private upSpecialRemaining: number;
  private wasLanded = false;
  /** 上キー兼ジャンプで消費した分。そのキーを押したまま必殺が始まれば戻す。 */
  private jumpedFromHeldUp = false;

  constructor(scene: Phaser.Scene, id: 1 | 2, x: number, y: number, color: number, stats: CharacterDefinition) {
    this.id = id;
    this.stats = stats;
    this.jumpsRemaining = stats.maxJumps;
    this.upSpecialRemaining = stats.upSpecial ? 1 : 0;
    this.character = new PlaceholderPlayer(scene, x, y, color, stats.gravityScale);
    this.attack = new AttackController(scene, stats.normalAttack);
  }

  get displayName(): string {
    return this.stats.displayName;
  }

  get weight(): number {
    return this.stats.weight;
  }

  get x(): number {
    return this.character.x;
  }

  get y(): number {
    return this.character.y;
  }

  update(input: PlayerInputState, now: number): void {
    if (!this.alive) return;
    const dt = this.previousTime < 0 ? 0 : Math.min(0.05, (now - this.previousTime) / 1000);
    this.previousTime = now;
    if (this.isInKnockback && this.character.isLanded) this.isInKnockback = false;
    this.recoverResources();

    const mode = !this.isInKnockback
      ? 'normal'
      : now < this.knockbackUntil
        ? 'knockback-locked'
        : 'knockback-air';
    if (input.moveY >= UP_SPECIAL_INPUT) this.jumpedFromHeldUp = false;

    const canAct = this.attack.allowsMovement() && mode !== 'knockback-locked';
    this.character.applyInput(input, this.attack.allowsMovement(), mode, dt, this.stats, false);
    const specialStarted = this.tryUseMove(input, now);
    if (specialStarted && this.jumpedFromHeldUp) {
      this.jumpsRemaining = Math.min(this.stats.maxJumps, this.jumpsRemaining + 1);
      this.jumpedFromHeldUp = false;
      this.character.setVelocityY(0);
    } else if (!specialStarted && canAct && input.jump && this.jumpsRemaining > 0) {
      this.jumpsRemaining -= 1;
      this.character.setVelocityY(this.stats.jumpVelocity);
      this.jumpedFromHeldUp = input.moveY < UP_SPECIAL_INPUT;
    }
    this.attack.update(now, this.x, this.y);
    this.attack.applyMotion(this.character, input.moveX);
    this.character.setPose(this.attack.currentPhase);
    this.character.setActionVisual(this.attack.visual, dt);
    this.updateFlash(now);
  }

  private recoverResources(): void {
    const landed = this.character.isLanded;
    if (landed && !this.wasLanded) {
      this.jumpsRemaining = this.stats.maxJumps;
      this.upSpecialRemaining = this.stats.upSpecial ? 1 : 0;
      this.jumpedFromHeldUp = false;
    }
    this.wasLanded = landed;
  }

  /** 必殺系を開始できたフレームだけ true。そのフレームのジャンプは消費しない。 */
  private tryUseMove(input: PlayerInputState, now: number): boolean {
    if (input.attack) {
      this.attack.tryStart(now, this.stats.normalAttack, this.character.facing);
      return false;
    }
    if (!input.special) return false;

    if (input.moveY < UP_SPECIAL_INPUT) {
      if (this.upSpecialRemaining <= 0 || !this.stats.upSpecial) return false;
      if (!this.attack.tryStart(now, this.stats.upSpecial, this.character.facing)) return false;
      this.upSpecialRemaining -= 1;
      return true;
    }

    if (!this.stats.specialAttack) return false;
    return this.attack.tryStart(now, this.stats.specialAttack, this.character.facing);
  }

  applyHitResult(result: HitResult, now: number): void {
    this.damagePercent += result.damage;
    this.isInKnockback = true;
    this.knockbackUntil = now + result.attack.knockbackLockMs;
    this.character.setVelocity(result.velocityX, result.velocityY);
    this.attack.cancel();
    this.flashUntil = now + HIT_FLASH_MS;
    this.character.setFill(0xffffff);
  }

  resetDamage(): void {
    this.damagePercent = 0;
    this.isInKnockback = false;
    this.knockbackUntil = 0;
  }

  place(x: number, y: number): void {
    this.alive = true;
    this.flashUntil = 0;
    this.isInKnockback = false;
    this.knockbackUntil = 0;
    this.jumpsRemaining = this.stats.maxJumps;
    this.upSpecialRemaining = this.stats.upSpecial ? 1 : 0;
    this.wasLanded = false;
    this.jumpedFromHeldUp = false;
    this.attack.cancel();
    this.character.restoreColor();
    this.character.place(x, y);
  }

  eliminate(): void {
    this.alive = false;
    this.attack.cancel();
    this.character.eliminate();
  }

  setAlpha(alpha: number): void {
    this.character.setAlpha(alpha);
  }

  private updateFlash(now: number): void {
    if (now >= this.flashUntil) this.character.restoreColor();
  }
}
