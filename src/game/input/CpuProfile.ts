/** 将来 easy / hard を足すときの設定。今は normal だけを使う。 */
export type CpuDifficulty = 'easy' | 'normal' | 'hard';

export type CpuProfile = {
  id: CpuDifficulty;
  /** 判断の基準間隔。実際は jitter を足して 150〜250ms に収める。 */
  reactionMs: number;
  reactionJitterMs: number;
  attackChance: number;
  specialChance: number;
  jumpChance: number;
  /** 通常攻撃を出す横距離の基準。遅いキャラはこれより少し手前で止める。 */
  preferredRange: number;
  /** 左右の KO 線から、これ以内なら中央へ戻る。 */
  edgeSafetyDistance: number;
  /** この確率では、ボタンを押さず今の移動を続ける。 */
  mistakeChance: number;
  /** 攻撃モーションが終わってから、次の判断まで待つ時間。 */
  postAttackWaitMs: number;
};

export const NORMAL_CPU: CpuProfile = {
  id: 'normal',
  reactionMs: 200,
  reactionJitterMs: 50,
  attackChance: 0.72,
  specialChance: 0.36,
  jumpChance: 0.62,
  preferredRange: 96,
  edgeSafetyDistance: 130,
  mistakeChance: 0.12,
  postAttackWaitMs: 280
};
