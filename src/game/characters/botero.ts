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
    id: 'botero-drill-rush', startupMs: 165, activeMs: 355, recoveryMs: 310,
    canMoveDuringAttack: false, hitbox: { forward: 44, width: 84, height: 52 },
    damage: 14, baseKnockback: 500, knockbackScaling: 10,
    knockbackAngleDegrees: 23, knockbackLockMs: 490,
    motion: { kind: 'dash', speed: 590 }, visual: 'botero_drill'
  },
  upSpecial: {
    id: 'botero-lift', startupMs: 95, activeMs: 175, recoveryMs: 240,
    canMoveDuringAttack: false, hitbox: { forward: 0, width: 62, height: 78, offsetY: -16 },
    damage: 7, baseKnockback: 250, knockbackScaling: 5,
    knockbackAngleDegrees: 84, knockbackLockMs: 280,
    motion: { kind: 'rise', velocity: -900, steerSpeed: 120 }, visual: 'botero_lift'
  },
  downSpecial: {
    id: 'botero-bedrock-shell', startupMs: 225, activeMs: 170, recoveryMs: 330,
    canMoveDuringAttack: false, hitbox: { forward: 0, width: 134, height: 72, offsetY: 8 },
    damage: 12, baseKnockback: 450, knockbackScaling: 9,
    knockbackAngleDegrees: 72, knockbackLockMs: 450, motion: null, visual: 'botero_shell',
    armorDamageMultiplier: 0.5
  }
};
