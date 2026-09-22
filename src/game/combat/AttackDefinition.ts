/** 技が active 中に体へかける移動。未指定なら速度は入力側のまま。 */
export type AttackMotion =
  | { kind: 'dash'; speed: number }
  | { kind: 'rise'; velocity: number; steerSpeed: number };

export type AttackVisual = 'default' | 'dash' | 'balloon';

/** 通常攻撃や必殺の性能。キャラクターごとに別定義へ差し替えられる。 */
export type AttackDefinition = {
  id: string;
  startupMs: number;
  activeMs: number;
  recoveryMs: number;
  /** false の攻撃では、攻撃中の移動とジャンプを止める。 */
  canMoveDuringAttack: boolean;
  hitbox: {
    /** 向いている方向を正とした、体の中心からの距離 */
    forward: number;
    width: number;
    height: number;
  };
  damage: number;
  baseKnockback: number;
  knockbackScaling: number;
  /** 前方水平を 0、真上を 90 とした吹き飛ばし角度（度） */
  knockbackAngleDegrees: number;
  /** この間は移動入力で吹き飛ばし速度を上書きしない */
  knockbackLockMs: number;
  motion: AttackMotion | null;
  visual: AttackVisual;
};

/** 2P 用の仮通常攻撃。Milestone 04 までの共通性能。 */
export const PLACEHOLDER_ATTACK: AttackDefinition = {
  id: 'placeholder-neutral',
  startupMs: 80,
  activeMs: 100,
  recoveryMs: 180,
  canMoveDuringAttack: true,
  hitbox: {
    forward: 48,
    width: 46,
    height: 36
  },
  damage: 8,
  baseKnockback: 320,
  knockbackScaling: 8,
  knockbackAngleDegrees: 30,
  knockbackLockMs: 380,
  motion: null,
  visual: 'default'
};

export type AttackPhaseName = 'idle' | 'startup' | 'active' | 'recovery';
