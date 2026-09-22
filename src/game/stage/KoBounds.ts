/** 画面外の KO 境界。キャラクターの中心がこの外に出るとストックが減る。 */
export type KoBounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export function isOutsideKoBounds(x: number, y: number, bounds: KoBounds): boolean {
  return x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom;
}
