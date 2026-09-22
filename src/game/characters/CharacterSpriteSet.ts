import type { CharacterAnimationName } from '../view/CharacterAnimation';

/** スプライトの足元。origin と同じで、0 が上、1 が下。 */
export type FootAnchor = {
  x: number;
  y: number;
};

/** 1 アニメーション分の表示。戦闘の数値は持たない。 */
export type AnimationVisualDefinition = {
  name: CharacterAnimationName;
  textureKey: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
  /** シート上の全コマではなく、再生する番号だけを書く。 */
  frames: readonly number[];
  frameRate: number;
  repeat: number;
  /** フレーム幅・高さにかける表示倍率。 */
  visualScale: number;
  footAnchor: FootAnchor;
  offsetX?: number;
  offsetY?: number;
  /**
   * `frames` と同じ順の、フレーム下端から足元までの余白。
   * 指定したアニメはコマごとに origin を変える。
   */
  footPads?: readonly number[];
};

/**
 * attack 用シートが無いあいだの仮表示。
 * 同じ名前のアニメーションを anims に足したら、こちらは使わない。
 */
export type AttackPoseFallback = {
  offsetX: number;
  offsetY?: number;
  scaleX: number;
  angle: number;
};

export type CharacterSpriteDefinition = {
  id: string;
  anims: readonly AnimationVisualDefinition[];
  attackFallback?: AttackPoseFallback;
};

/** CharacterDefinition から参照する表示セット。 */
export type CharacterSpriteSet = CharacterSpriteDefinition;
