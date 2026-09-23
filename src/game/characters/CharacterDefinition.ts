import type { AttackDefinition } from '../combat/AttackDefinition';
import type { CharacterSpriteSet } from './CharacterSpriteSet';

/** 仮表示の大きさ。物理ボディと Hurtbox とは別。 */
export type PlaceholderLook = {
  visualWidth: number;
  visualHeight: number;
  markerScale: number;
};

/** キャラクターごとの基本性能。シーンや Fighter に固有値を書かない。 */
export type CharacterDefinition = {
  id: string;
  displayName: string;
  moveSpeed: number;
  airMoveAcceleration: number;
  jumpVelocity: number;
  maxJumps: number;
  /** 1 でワールド重力のまま。 */
  gravityScale: number;
  /** 1 が標準。小さいほど吹き飛びやすい。 */
  weight: number;
  look: PlaceholderLook;
  /** 本番スプライト。無いキャラクターは仮表示のまま。 */
  spriteSet: CharacterSpriteSet | null;
  normalAttack: AttackDefinition;
  specialAttack: AttackDefinition | null;
  upSpecial: AttackDefinition | null;
  downSpecial: AttackDefinition | null;
};

/** スティックや上キーが、これより上向きなら上必殺。 */
export const UP_SPECIAL_INPUT = -0.5;
export const DOWN_SPECIAL_INPUT = 0.5;
