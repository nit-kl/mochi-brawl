import type { CharacterDefinition } from './CharacterDefinition';
import { optionalCharacterSprites } from './optionalSprites';

export const BOTERO: CharacterDefinition = {
  id: 'botero',
  displayName: 'ぼてろ',
  moveSpeed: 215,
  airMoveAcceleration: 2500,
  jumpVelocity: -510,
  maxJumps: 2,
  gravityScale: 1.15,
  weight: 1.55,
  look: { visualWidth: 86, visualHeight: 88, markerScale: 1.4 },
  spriteSet: optionalCharacterSprites('botero', 96),
  normalAttack: {
    id: 'botero-push', startupMs: 125, activeMs: 110, recoveryMs: 240,
    canMoveDuringAttack: true, hitbox: { forward: 42, width: 60, height: 44 },
    damage: 10, baseKnockback: 390, knockbackScaling: 9,
    knockbackAngleDegrees: 28, knockbackLockMs: 440, motion: null, visual: 'default'
  },
  specialAttack: {
    id: 'botero-charge', startupMs: 200, activeMs: 320, recoveryMs: 300,
    canMoveDuringAttack: false, hitbox: { forward: 40, width: 74, height: 50 },
    damage: 14, baseKnockback: 500, knockbackScaling: 10,
    knockbackAngleDegrees: 23, knockbackLockMs: 490,
    motion: { kind: 'dash', speed: 530 }, visual: 'dash'
  },
  upSpecial: {
    id: 'botero-bounce', startupMs: 110, activeMs: 130, recoveryMs: 260,
    canMoveDuringAttack: false, hitbox: { forward: 0, width: 56, height: 48 },
    damage: 6, baseKnockback: 230, knockbackScaling: 4,
    knockbackAngleDegrees: 80, knockbackLockMs: 250,
    motion: { kind: 'rise', velocity: -810, steerSpeed: 105 }, visual: 'spring'
  },
  downSpecial: {
    id: 'botero-ground-pound', startupMs: 145, activeMs: 145, recoveryMs: 270,
    canMoveDuringAttack: false, hitbox: { forward: 0, width: 106, height: 40, offsetY: 28 },
    damage: 11, baseKnockback: 430, knockbackScaling: 9,
    knockbackAngleDegrees: 65, knockbackLockMs: 430, motion: null, visual: 'down_special'
  }
};
