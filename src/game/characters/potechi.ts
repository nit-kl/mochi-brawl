import type { AttackDefinition } from '../combat/AttackDefinition';
import type { CharacterDefinition } from './CharacterDefinition';
import { POTECHI_SPRITES } from './potechiSprites';

const DOSU: AttackDefinition = {
  id: 'dosu',
  startupMs: 110,
  activeMs: 100,
  recoveryMs: 220,
  canMoveDuringAttack: true,
  hitbox: {
    forward: 40,
    width: 52,
    height: 42
  },
  damage: 9,
  baseKnockback: 380,
  knockbackScaling: 9,
  knockbackAngleDegrees: 30,
  knockbackLockMs: 420,
  motion: null,
  visual: 'default'
};

const DOSSUN: AttackDefinition = {
  id: 'dossun',
  startupMs: 180,
  activeMs: 120,
  recoveryMs: 320,
  canMoveDuringAttack: false,
  hitbox: {
    forward: 8,
    width: 108,
    height: 34,
    offsetY: 30
  },
  damage: 14,
  baseKnockback: 520,
  knockbackScaling: 10,
  knockbackAngleDegrees: 35,
  knockbackLockMs: 480,
  motion: {
    kind: 'slam',
    initialVelocityX: 260,
    initialVelocityY: -480,
    fallVelocity: 980,
    landingDelay: 140,
    maxDurationMs: 800,
    landingHitbox: {
      forward: 8,
      width: 108,
      height: 34,
      offsetY: 30
    }
  },
  visual: 'slam'
};

const BANE: AttackDefinition = {
  id: 'bane',
  startupMs: 100,
  activeMs: 140,
  recoveryMs: 240,
  canMoveDuringAttack: false,
  hitbox: {
    forward: 0,
    width: 46,
    height: 44
  },
  damage: 6,
  baseKnockback: 220,
  knockbackScaling: 4,
  knockbackAngleDegrees: 80,
  knockbackLockMs: 240,
  motion: { kind: 'rise', velocity: -850, steerSpeed: 115 },
  visual: 'spring'
};

export const POTECHI: CharacterDefinition = {
  id: 'potechi',
  displayName: 'ぽてち',
  moveSpeed: 240,
  airMoveAcceleration: 2800,
  jumpVelocity: -540,
  maxJumps: 2,
  gravityScale: 1.1,
  weight: 1.4,
  look: { visualWidth: 76, visualHeight: 90, markerScale: 1.45 },
  spriteSet: POTECHI_SPRITES,
  normalAttack: DOSU,
  specialAttack: DOSSUN,
  upSpecial: BANE
};
