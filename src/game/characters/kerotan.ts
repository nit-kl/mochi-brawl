import type { CharacterDefinition } from './CharacterDefinition';
import { optionalCharacterSprites } from './optionalSprites';

export const KEROTAN: CharacterDefinition = {
  id: 'kerotan',
  displayName: 'けろたん',
  moveSpeed: 300,
  airMoveAcceleration: 3900,
  jumpVelocity: -680,
  maxJumps: 2,
  gravityScale: 0.95,
  weight: 0.9,
  look: { visualWidth: 58, visualHeight: 72, markerScale: 1 },
  spriteSet: optionalCharacterSprites('kerotan', 78, 14),
  normalAttack: {
    id: 'kerotan-punch-kick', startupMs: 75, activeMs: 90, recoveryMs: 170,
    canMoveDuringAttack: true, hitbox: { forward: 44, width: 48, height: 32 },
    damage: 5, baseKnockback: 270, knockbackScaling: 7,
    knockbackAngleDegrees: 38, knockbackLockMs: 340, motion: null, visual: 'default'
  },
  specialAttack: {
    id: 'kerotan-leap', startupMs: 115, activeMs: 260, recoveryMs: 230,
    canMoveDuringAttack: false, hitbox: { forward: 36, width: 58, height: 42 },
    damage: 9, baseKnockback: 380, knockbackScaling: 8,
    knockbackAngleDegrees: 30, knockbackLockMs: 380,
    motion: { kind: 'dash', speed: 660 }, visual: 'dash'
  },
  upSpecial: {
    id: 'kerotan-high-jump', startupMs: 80, activeMs: 150, recoveryMs: 220,
    canMoveDuringAttack: false, hitbox: { forward: 0, width: 46, height: 50 },
    damage: 4, baseKnockback: 160, knockbackScaling: 3,
    knockbackAngleDegrees: 80, knockbackLockMs: 220,
    motion: { kind: 'rise', velocity: -1030, steerSpeed: 180 }, visual: 'spring'
  },
  downSpecial: {
    id: 'kerotan-low-kick', startupMs: 70, activeMs: 105, recoveryMs: 175,
    canMoveDuringAttack: false, hitbox: { forward: 35, width: 68, height: 28, offsetY: 27 },
    damage: 6, baseKnockback: 250, knockbackScaling: 7,
    knockbackAngleDegrees: 24, knockbackLockMs: 320, motion: null, visual: 'down_special'
  }
};
