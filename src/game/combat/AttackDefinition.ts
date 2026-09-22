/** 通常攻撃の性能。キャラクターごとに別定義へ差し替えられる。 */
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
};

export const NEUTRAL_ATTACK: AttackDefinition = {
  id: 'neutral',
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
  knockbackLockMs: 380
};

export type AttackPhaseName = 'idle' | 'startup' | 'active' | 'recovery';
