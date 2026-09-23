import type { AttackPhaseName, AttackVisual } from '../combat/AttackDefinition';

/** 表示専用。戦闘の数値は持たない。 */
export type CharacterAnimationName =
  | 'hit'
  | 'special_roll'
  | 'special_slam'
  | 'up_special'
  | 'down_special'
  | 'attack'
  | 'jump'
  | 'fall'
  | 'run'
  | 'idle';

export type CharacterViewState = {
  x: number;
  bodyY: number;
  feetY: number;
  facing: 1 | -1;
  velocityX: number;
  velocityY: number;
  landed: boolean;
  hit: boolean;
  attackPhase: AttackPhaseName;
  attackVisual: AttackVisual;
  /** どっすーん！の表示用。速度や判定は変えない。 */
  slamStep: 'none' | 'windup' | 'hop' | 'strike';
  slamHopAgeMs: number;
  /** 空中姿勢から急降下へ切り替えるまでの時間。slam 以外は 0。 */
  slamDiveAfterMs: number;
  dt: number;
  flashing: boolean;
};

export interface CharacterView {
  sync(state: CharacterViewState): void;
  setAlpha(alpha: number): void;
  place(x: number, feetY: number): void;
  hide(): void;
  /** F3 用。本番 HUD には出さない。 */
  debugText(): string;
}
