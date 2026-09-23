/** 将来 easy / hard を足すときの設定。今は normal だけを使う。 */
export type CpuDifficulty = 'easy' | 'normal' | 'hard';

export type CpuProfile = {
  id: CpuDifficulty;
  /** 判断の基準間隔。実際は jitter を足して 100〜250ms に収める。 */
  reactionMs: number;
  reactionJitterMs: number;
  attackChance: number;
  specialChance: number;
  mistakeChance: number;
  /** 通常攻撃を出す横距離。技のリーチはこの値と一緒に見る。 */
  preferredDistance: number;
  /** 足場の端から、これより外なら復帰を優先する。 */
  recoveryThreshold: number;
  postAttackWaitMs: number;
};

export const NORMAL_CPU: CpuProfile = {
  id: 'normal',
  reactionMs: 170,
  reactionJitterMs: 70,
  attackChance: 0.74,
  specialChance: 0.34,
  mistakeChance: 0.14,
  preferredDistance: 92,
  recoveryThreshold: 36,
  postAttackWaitMs: 320
};
