import type { KoBounds } from './KoBounds';

/**
 * 仮ステージ。内部解像度は 1280×720。
 * 下端はこれまでの落下ライン（中心 y > 920）を引き継ぐ。
 */
export const PLACEHOLDER_STAGE: { koBounds: KoBounds } = {
  koBounds: {
    left: -200,
    right: 1480,
    top: -300,
    bottom: 920
  }
};
