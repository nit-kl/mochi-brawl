/** 画面外の KO 境界。キャラクターの中心が有効な辺の外に出るとストックが減る。 */
export type KoBounds = {
  left: number;
  right: number;
  top: number;
  /** 下方向の基準。bottomKoEnabled が false のときは判定に使わない。 */
  bottom: number;
  bottomKoEnabled: boolean;
};

export function isOutsideKoBounds(x: number, y: number, bounds: KoBounds): boolean {
  if (x < bounds.left || x > bounds.right || y < bounds.top) return true;
  return bounds.bottomKoEnabled && y > bounds.bottom;
}
