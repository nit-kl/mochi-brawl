import type { AttackDefinition } from '../combat/AttackDefinition';

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
  normalAttack: AttackDefinition;
  specialAttack: AttackDefinition | null;
  upSpecial: AttackDefinition | null;
};

/** スティックや上キーが、これより上向きなら上必殺。 */
export const UP_SPECIAL_INPUT = -0.5;
