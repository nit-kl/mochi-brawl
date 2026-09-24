import Phaser from 'phaser';
import type { AttackPhaseName, AttackVisual } from '../combat/AttackDefinition';

/** もちぷれすの溜めと衝撃波。判定の中心に合わせて描く。 */
export class MochiPulseView {
  private readonly graphic: Phaser.GameObjects.Graphics;
  private phase: AttackPhaseName = 'idle';
  private phaseStartedAt = 0;

  constructor(scene: Phaser.Scene) {
    this.graphic = scene.add.graphics().setDepth(2).setVisible(false);
  }

  sync(x: number, y: number, visual: AttackVisual, phase: AttackPhaseName, now: number): void {
    const activeMove = visual === 'mochi_pulse' && phase !== 'idle';
    if (!activeMove) {
      this.hide();
      return;
    }
    if (phase !== this.phase) {
      this.phase = phase;
      this.phaseStartedAt = now;
    }

    const age = Math.max(0, now - this.phaseStartedAt);
    const g = this.graphic;
    g.setPosition(x, y + 24).setVisible(true).clear();

    if (phase === 'startup') {
      const charge = Math.min(1, age / 160);
      g.fillStyle(0xffeec5, 0.18 + charge * 0.28);
      g.fillEllipse(0, 0, 38 + charge * 46, 14 + charge * 12);
      g.lineStyle(2 + charge * 2, 0xffa16e, 0.65 + charge * 0.3);
      g.strokeEllipse(0, 0, 46 + charge * 48, 18 + charge * 12);
      return;
    }

    if (phase === 'active') {
      const burst = Math.min(1, age / 95);
      const width = 164 + burst * 24;
      const height = 58 + burst * 12;
      g.fillStyle(0xfff2d1, 0.55 - burst * 0.27);
      g.fillEllipse(0, 0, width, height);
      g.lineStyle(6 - burst * 2, 0xffa66d, 0.95 - burst * 0.24);
      g.strokeEllipse(0, 0, width, height);
      g.lineStyle(3, 0xffffff, 0.8 - burst * 0.25);
      g.strokeEllipse(0, -3, width * 0.72, height * 0.65);
      for (let i = 0; i < 8; i += 1) {
        const angle = (i * Math.PI * 2) / 8;
        const distance = 19 + burst * 58;
        g.fillStyle(i % 2 === 0 ? 0xffffff : 0xffc98b, 0.9 - burst * 0.35);
        g.fillCircle(Math.cos(angle) * distance, Math.sin(angle) * distance * 0.38, 5 - burst * 2);
      }
      return;
    }

    const fade = Math.max(0, 1 - age / 180);
    g.lineStyle(2, 0xffd295, fade * 0.55);
    g.strokeEllipse(0, 0, 164 + (1 - fade) * 24, 58 + (1 - fade) * 10);
  }

  hide(): void {
    this.phase = 'idle';
    this.graphic.clear().setVisible(false);
  }

  setAlpha(alpha: number): void {
    this.graphic.setAlpha(alpha);
  }
}
