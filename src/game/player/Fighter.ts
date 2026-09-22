import type Phaser from 'phaser';
import { AttackController } from '../combat/AttackController';
import type { AttackDefinition } from '../combat/AttackDefinition';
import { Hurtbox } from '../combat/Hurtbox';
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
  alive = true;
  private flashUntil = 0;

  constructor(scene: Phaser.Scene, id: 1 | 2, x: number, y: number, color: number, attackDefinition: AttackDefinition) {
    this.id = id;
    this.character = new PlaceholderPlayer(scene, x, y, color);
    this.attack = new AttackController(scene, attackDefinition);
  }

  get x(): number {
    return this.character.x;
  }

  get y(): number {
    return this.character.y;
  }

  update(input: PlayerInputState, now: number): void {
    if (!this.alive) return;
    this.character.applyInput(input, this.attack.allowsMovement());
    this.attack.update(now, input.attack, this.character.facing, this.x, this.y);
    this.character.setPose(this.attack.currentPhase);
    this.updateFlash(now);
  }

  onHit(now: number): void {
    this.flashUntil = now + HIT_FLASH_MS;
    this.character.setFill(0xffffff);
  }

  place(x: number, y: number): void {
    this.alive = true;
    this.flashUntil = 0;
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
