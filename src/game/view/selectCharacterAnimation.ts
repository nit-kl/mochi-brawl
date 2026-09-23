import type { CharacterAnimationName, CharacterViewState } from './CharacterAnimation';

const RISING_SPEED = 40;
const RUN_SPEED = 40;

/**
 * 被弾、必殺、通常攻撃、ジャンプか落下、走り、待機の順。
 * 画像がない状態は次の候補へ落とす。
 */
export function selectCharacterAnimation(
  state: CharacterViewState,
  available: ReadonlySet<CharacterAnimationName>
): CharacterAnimationName {
  const attacking = state.attackPhase !== 'idle';
  const order: CharacterAnimationName[] = [];
  if (state.hit) order.push('hit');
  if (attacking && state.attackVisual === 'dash') order.push('special_roll');
  if (attacking && state.attackVisual === 'slam') order.push('special_slam');
  if (attacking && (state.attackVisual === 'balloon' || state.attackVisual === 'spring')) {
    order.push('up_special');
  }
  if (attacking && state.attackVisual === 'down_special') order.push('down_special', 'attack');
  if (attacking && state.attackVisual === 'default') order.push('attack');
  if (!state.landed) order.push(state.velocityY < -RISING_SPEED ? 'jump' : 'fall');
  if (state.landed && Math.abs(state.velocityX) > RUN_SPEED) order.push('run');
  order.push('idle');
  return order.find((name) => available.has(name)) ?? 'idle';
}
