import { rectFromCenter, type Rect } from './Rect';

/** 被弾判定。物理コライダーとは別の矩形。 */
export class Hurtbox {
  constructor(
    private readonly width: number,
    private readonly height: number
  ) {}

  bounds(x: number, y: number): Rect {
    return rectFromCenter(x, y, this.width, this.height);
  }
}
