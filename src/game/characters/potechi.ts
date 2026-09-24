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
  startupMs: 160,
  activeMs: 155,
  recoveryMs: 340,
  canMoveDuringAttack: false,
  hitbox: {
    forward: 16,
    width: 154,
    height: 48,
    offsetY: 22
  },
  damage: 15,
  baseKnockback: 540,
  knockbackScaling: 10,
  knockbackAngleDegrees: 42,
  knockbackLockMs: 500,
  motion: {
    kind: 'slam',
    initialVelocityX: 315,
    initialVelocityY: -510,
    fallVelocity: 1200,
    landingDelay: 155,
    maxDurationMs: 950,
    landingHitbox: {
      forward: 16,
      width: 154,
      height: 48,
      offsetY: 22
    }
  },
  visual: 'potechi_slam'
};

const BANE: AttackDefinition = {
  id: 'bane',
  startupMs: 95,
  activeMs: 185,
  recoveryMs: 220,
  canMoveDuringAttack: false,
  hitbox: {
    forward: 0,
    width: 62,
    height: 82,
    offsetY: -12
  },
  damage: 7,
  baseKnockback: 250,
  knockbackScaling: 5,
  knockbackAngleDegrees: 83,
  knockbackLockMs: 280,
  motion: { kind: 'rise', velocity: -940, steerSpeed: 145 },
  visual: 'potechi_spring'
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
  upSpecial: BANE,
  downSpecial: {
    id: 'potechi-quake', startupMs: 210, activeMs: 155, recoveryMs: 320,
    canMoveDuringAttack: false, hitbox: { forward: 0, width: 190, height: 58, offsetY: 25 },
    damage: 12, baseKnockback: 470, knockbackScaling: 9,
    knockbackAngleDegrees: 68, knockbackLockMs: 470, motion: null, visual: 'potechi_quake'
  }
};
