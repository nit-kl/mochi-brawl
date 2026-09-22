import type { Fighter } from '../player/Fighter';
import { intersects } from './Rect';

/** 誰の攻撃が誰に当たったか。ダメージや速度は含まない。 */
export type HitContact = {
  attackerId: 1 | 2;
  targetId: 1 | 2;
};

/** Hitbox と Hurtbox の重なりだけを見る。物理コライダーは使わない。 */
export function resolveHits(fighters: readonly Fighter[]): HitContact[] {
  const events: HitContact[] = [];

  for (const attacker of fighters) {
    if (!attacker.alive || !attacker.attack.hitbox.isEnabled) continue;
    const hitBounds = attacker.attack.hitbox.bounds();

    for (const target of fighters) {
      if (!target.alive || target.id === attacker.id) continue;
      if (!intersects(hitBounds, target.hurtbox.bounds(target.x, target.y))) continue;
      if (!attacker.attack.hitbox.claim(target.id)) continue;
      events.push({ attackerId: attacker.id, targetId: target.id });
    }
  }

  return events;
}
