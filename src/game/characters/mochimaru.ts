import type { AttackDefinition } from '../combat/AttackDefinition';
import type { CharacterDefinition } from './CharacterDefinition';
import { MOCHIMARU_SPRITES } from './mochimaruSprites';

const PECHI: AttackDefinition = {
  id: 'pechi',
  startupMs: 70,
  activeMs: 90,
  recoveryMs: 150,
  canMoveDuringAttack: true,
  hitbox: {
    forward: 46,
    width: 44,
    height: 34
  },
  damage: 6,
  baseKnockback: 280,
  knockbackScaling: 7,
  knockbackAngleDegrees: 28,
  knockbackLockMs: 360,
  motion: null,
  visual: 'default'
};

const GURUGURU: AttackDefinition = {
  id: 'guruguru',
  startupMs: 120,
  activeMs: 360,
  recoveryMs: 250,
  canMoveDuringAttack: false,
  hitbox: {
    forward: 34,
    width: 62,
    height: 48
  },
  damage: 10,
  baseKnockback: 440,
  knockbackScaling: 9,
  knockbackAngleDegrees: 18,
  knockbackLockMs: 420,
  motion: { kind: 'dash', speed: 700 },
  visual: 'dash'
};

const BALLOON: AttackDefinition = {
  id: 'balloon',
  startupMs: 80,
  activeMs: 140,
  recoveryMs: 200,
  canMoveDuringAttack: false,
  hitbox: {
    forward: 0,
    width: 48,
    height: 52
  },
  damage: 4,
  baseKnockback: 150,
  knockbackScaling: 3,
  knockbackAngleDegrees: 80,
  knockbackLockMs: 220,
  motion: { kind: 'rise', velocity: -980, steerSpeed: 180 },
  visual: 'balloon'
};

export const MOCHIMARU: CharacterDefinition = {
  id: 'mochimaru',
  displayName: 'もちまる',
  moveSpeed: 280,
  airMoveAcceleration: 3600,
  jumpVelocity: -620,
  maxJumps: 2,
  gravityScale: 1,
  weight: 1,
  look: { visualWidth: 56, visualHeight: 72, markerScale: 1 },
  spriteSet: MOCHIMARU_SPRITES,
  normalAttack: PECHI,
  specialAttack: GURUGURU,
  upSpecial: BALLOON
};
