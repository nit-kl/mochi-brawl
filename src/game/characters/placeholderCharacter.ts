import { PLACEHOLDER_ATTACK } from '../combat/AttackDefinition';
import type { CharacterDefinition } from './CharacterDefinition';

/** 2P 用。固有技はまだなく、通常攻撃と 1 段ジャンプだけ。 */
export const PLACEHOLDER_CHARACTER: CharacterDefinition = {
  id: 'placeholder',
  displayName: '2P',
  moveSpeed: 280,
  airMoveAcceleration: 3600,
  jumpVelocity: -620,
  maxJumps: 1,
  gravityScale: 1,
  weight: 1,
  normalAttack: PLACEHOLDER_ATTACK,
  specialAttack: null,
  upSpecial: null
};
