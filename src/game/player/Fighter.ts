import type Phaser from 'phaser';
import { AttackController } from '../combat/AttackController';
import type { HitResult } from '../combat/HitResult';
import { Hurtbox } from '../combat/Hurtbox';
import { UP_SPECIAL_INPUT, type CharacterDefinition } from '../characters/CharacterDefinition';
import type { PlayerInputState } from '../input/PlayerInput';
import type { CharacterView, CharacterViewState } from '../view/CharacterAnimation';
import { PlaceholderCharacterView } from '../view/PlaceholderCharacterView';
import { SpriteCharacterView } from '../view/SpriteCharacterView';
import { PlaceholderPlayer } from './PlaceholderPlayer';

const BODY_WIDTH = 56;
const BODY_HEIGHT = 72;
/** 被弾の白い点滅。判定や硬直時間とは別。 */
const HIT_FLASH_MS = 100;

/** 1人分のキャラクター。入力・攻撃・被弾判定を組み立てる。 */
export class Fighter {
  readonly id: 1 | 2;
  readonly character: PlaceholderPlayer;
  readonly hurtbox = new Hurtbox(BODY_WIDTH, BODY_HEIGHT);
  readonly attack: AttackController;
  readonly stats: CharacterDefinition;
  private readonly view: CharacterView;
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
    this.character = new PlaceholderPlayer(scene, x, y, stats.gravityScale);
    const feetY = y + BODY_HEIGHT / 2;
    this.view = stats.spriteSet
      ? new SpriteCharacterView(scene, stats.spriteSet, x, feetY)
      : new PlaceholderCharacterView(scene, x, feetY, color, stats.look);
    this.attack = new AttackController(scene, stats.normalAttack);
    this.syncView(0, 0);
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
    this.syncView(dt, now);
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
    this.syncView(0, now);
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
    this.character.place(x, y);
    this.view.place(x, y + BODY_HEIGHT / 2);
    this.syncView(0, 0);
  }

  eliminate(): void {
    this.alive = false;
    this.attack.cancel();
    this.character.eliminate();
    this.view.hide();
  }

  setAlpha(alpha: number): void {
    this.view.setAlpha(alpha);
  }

  animationDebugText(): string {
    return this.view.debugText();
  }

  private syncView(dt: number, now: number): void {
    const state: CharacterViewState = {
      x: this.character.x,
      bodyY: this.character.y,
      feetY: this.character.y + BODY_HEIGHT / 2,
      facing: this.character.facing,
      velocityX: this.character.velocityX,
      velocityY: this.character.velocityY,
      landed: this.character.isLanded,
      hit: this.isInKnockback,
      attackPhase: this.attack.currentPhase,
      attackVisual: this.attack.visual,
      slamStep: this.attack.displayedSlamStep,
      slamHopAgeMs: this.attack.slamHopAgeMs,
      slamDiveAfterMs:
        this.attack.attackDefinition.motion?.kind === 'slam'
          ? this.attack.attackDefinition.motion.landingDelay
          : 0,
      dt,
      flashing: now < this.flashUntil
    };
    this.view.sync(state);
  }
}
