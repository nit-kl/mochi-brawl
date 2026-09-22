import type Phaser from 'phaser';

/** 選択画面の半透明パネル。上辺の左上を原点にする。 */
export function drawMenuPanel(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  options?: { stroke?: number; strokeWidth?: number; fillAlpha?: number }
): void {
  const stroke = options?.stroke ?? 0xffffff;
  const strokeWidth = options?.strokeWidth ?? 2;
  graphics.clear();
  graphics.fillStyle(0x16324a, 0.16);
  graphics.fillRoundedRect(x + 2, y + 5, width, height, 22);
  graphics.fillStyle(0xfffaf2, options?.fillAlpha ?? 0.92);
  graphics.fillRoundedRect(x, y, width, height, 22);
  graphics.lineStyle(strokeWidth, stroke, 0.95);
  graphics.strokeRoundedRect(x, y, width, height, 22);
}
