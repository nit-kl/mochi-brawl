import type { AttackDefinition } from './AttackDefinition';

/** 1 ヒット分の結果。当たりの有無は resolveHits、性能の適用はここ。 */
export type HitResult = {
  attackerId: 1 | 2;
  defenderId: 1 | 2;
  attack: AttackDefinition;
  damage: number;
  /** (baseKnockback + ヒット後のダメージ% × knockbackScaling) / weight */
  knockback: number;
  velocityX: number;
  velocityY: number;
};

/**
 * 吹き飛ばし速度。
 * knockback = (baseKnockback + (被弾前% + damage) × knockbackScaling) / weight
 * 角度は前方水平から上向き。右向きは +x、左向きは -x、上は -y。
 */
export function createHitResult(
  attackerId: 1 | 2,
  defenderId: 1 | 2,
  attack: AttackDefinition,
  defenderDamagePercent: number,
  defenderWeight: number,
  facing: 1 | -1
): HitResult {
  const damage = attack.damage;
  const percentAfterHit = defenderDamagePercent + damage;
  const weight = Math.max(defenderWeight, 0.05);
  const knockback = (attack.baseKnockback + percentAfterHit * attack.knockbackScaling) / weight;
  const radians = (attack.knockbackAngleDegrees * Math.PI) / 180;

  return {
    attackerId,
    defenderId,
    attack,
    damage,
    knockback,
    velocityX: Math.cos(radians) * knockback * facing,
    velocityY: -Math.sin(radians) * knockback
  };
}
