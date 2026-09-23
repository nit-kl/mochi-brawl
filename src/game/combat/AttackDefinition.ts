export type HitboxShape = {
  /** 向いている方向を正とした、体の中心からの距離 */
  forward: number;
  width: number;
  height: number;
  /** 体の中心から下を正とする */
  offsetY?: number;
};

/** 技が active 中に体へかける移動。未指定なら速度は入力側のまま。 */
export type AttackMotion =
  | { kind: 'dash'; speed: number }
  | { kind: 'rise'; velocity: number; steerSpeed: number }
  | {
      kind: 'slam';
      initialVelocityX: number;
      initialVelocityY: number;
      fallVelocity: number;
      /** 跳び始めてから、下方向の速度へ切り替えるまでの時間 */
      landingDelay: number;
      /** 技の開始から、着地しないまま打ち切るまでの時間 */
      maxDurationMs: number;
      landingHitbox: HitboxShape;
    };

export type AttackVisual = 'default' | 'dash' | 'balloon' | 'slam' | 'spring' | 'down_special';

/** 通常攻撃や必殺の性能。キャラクターごとに別定義へ差し替えられる。 */
export type AttackDefinition = {
  id: string;
  startupMs: number;
  activeMs: number;
  recoveryMs: number;
  /** false の攻撃では、攻撃中の移動とジャンプを止める。 */
  canMoveDuringAttack: boolean;
  hitbox: HitboxShape;
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

export type AttackPhaseName = 'idle' | 'startup' | 'active' | 'recovery';
