import Phaser from 'phaser';
import type { CharacterViewState } from './CharacterAnimation';

/** ぽてちの必殺技に、専用スプライトと重なる衝撃・上昇・岩の演出を描く。 */
export class PotechiSpecialView {
  private readonly graphic: Phaser.GameObjects.Graphics;
  private step = '';
  private stepStartedAt = 0;

  constructor(scene: Phaser.Scene) {
    this.graphic = scene.add.graphics().setDepth(2).setVisible(false);
  }

  sync(state: CharacterViewState, now: number): void {
    const visual = state.attackVisual;
    if (state.attackPhase === 'idle' || (
      visual !== 'potechi_slam' && visual !== 'potechi_spring' && visual !== 'potechi_quake'
    )) {
      this.hide();
      return;
    }

    const step = `${visual}:${visual === 'potechi_slam' ? state.slamStep : state.attackPhase}`;
    if (step !== this.step) {
      this.step = step;
      this.stepStartedAt = now;
    }
    const age = Math.max(0, now - this.stepStartedAt);
    const g = this.graphic;
    g.setPosition(state.x, state.bodyY).setVisible(true).clear();
    if (visual === 'potechi_slam') this.drawSlam(g, state, age);
    else if (visual === 'potechi_spring') this.drawSpring(g, state, age);
    else this.drawQuake(g, state, age);
  }

  hide(): void {
    this.step = '';
    this.graphic.clear().setVisible(false);
  }

  setAlpha(alpha: number): void {
    this.graphic.setAlpha(alpha);
  }

  private drawSlam(g: Phaser.GameObjects.Graphics, state: CharacterViewState, age: number): void {
    const facing = state.facing;
    if (state.slamStep === 'windup') {
      const charge = Math.min(1, age / 160);
      g.lineStyle(3, 0xffc165, 0.4 + charge * 0.45);
      g.strokeEllipse(facing * 18, 31, 62 + charge * 55, 19 + charge * 13);
      g.fillStyle(0xffe7a5, 0.25 + charge * 0.25);
      g.fillEllipse(facing * 18, 32, 40 + charge * 36, 11 + charge * 9);
      return;
    }
    if (state.slamStep === 'hop') {
      const trail = 0.45 + Math.min(1, age / 140) * 0.45;
      for (let i = 0; i < 4; i += 1) {
        const back = facing * (-22 - i * 12);
        g.lineStyle(5 - i, i % 2 ? 0xffcf84 : 0xffffff, trail * (1 - i * 0.15));
        g.lineBetween(back, 9 + i * 7, back - facing * 17, 27 + i * 9);
      }
      return;
    }
    if (state.slamStep !== 'strike') return;
    const pulse = Math.min(1, age / 105);
    const alpha = 1 - Math.min(1, age / 185);
    g.fillStyle(0xffeab1, 0.46 * alpha);
    g.fillEllipse(facing * 16, 22, 154 + pulse * 40, 48 + pulse * 16);
    g.lineStyle(6 - pulse * 3, 0xed954c, 0.9 * alpha);
    g.strokeEllipse(facing * 16, 22, 154 + pulse * 60, 48 + pulse * 20);
    for (let i = -2; i <= 2; i += 1) {
      const x = i * 35 + facing * 16;
      const rise = Math.sin((i + 3) * 1.7) * 5;
      g.fillStyle(i % 2 ? 0xa5653a : 0xc9864d, alpha);
      g.fillTriangle(x - 10, 19, x + 10, 19, x + 3, -9 - pulse * 19 + rise);
    }
  }

  private drawSpring(g: Phaser.GameObjects.Graphics, state: CharacterViewState, age: number): void {
    const charge = state.attackPhase === 'startup';
    const fade = state.attackPhase === 'recovery' ? Math.max(0.25, 1 - age / 220) : 1;
    const width = charge ? 54 : 68;
    g.fillStyle(0xffe8a8, (charge ? 0.28 : 0.35) * fade);
    g.fillEllipse(0, 37, width, charge ? 20 : 31);
    g.lineStyle(charge ? 3 : 5, 0xffb95f, 0.85 * fade);
    g.strokeEllipse(0, 37, width, charge ? 20 : 31);
    if (charge) return;
    for (let i = -1; i <= 1; i += 1) {
      const x = i * 23;
      const length = 20 + (1 - Math.abs(i)) * 15;
      g.lineStyle(5, i === 0 ? 0xffffff : 0xffcf75, 0.85 * fade);
      g.lineBetween(x, 48, x, 48 + length);
      g.fillStyle(0xfff5cb, 0.88 * fade);
      g.fillCircle(x, 48 + length + 5, 4);
    }
    const halo = 48 + Math.sin(age / 55) * 6;
    g.lineStyle(3, 0xffe6a0, 0.65 * fade);
    g.strokeEllipse(0, -11, halo * 1.7, halo);
  }

  private drawQuake(g: Phaser.GameObjects.Graphics, state: CharacterViewState, age: number): void {
    const centerY = 25;
    if (state.attackPhase === 'startup') {
      const charge = Math.min(1, age / 210);
      g.fillStyle(0xb77a43, 0.16 + charge * 0.2);
      g.fillEllipse(0, centerY, 82 + charge * 82, 24 + charge * 20);
      g.lineStyle(3, 0xffc465, 0.4 + charge * 0.5);
      g.strokeEllipse(0, centerY, 90 + charge * 78, 28 + charge * 18);
      for (let i = -2; i <= 2; i += 1) {
        const x = i * 30;
        g.lineStyle(2, 0x754323, charge * 0.8);
        g.lineBetween(x - 7, 38, x + 8, 32);
      }
      return;
    }
    const fading = state.attackPhase === 'recovery';
    const alpha = fading ? Math.max(0, 1 - age / 210) : 1;
    const growth = fading ? 1 : Math.min(1, age / 90);
    g.fillStyle(0xffe0a1, 0.28 * alpha);
    g.fillEllipse(0, centerY, 190 + growth * 25, 58 + growth * 10);
    g.lineStyle(5 - growth * 2, 0xec9e51, 0.9 * alpha);
    g.strokeEllipse(0, centerY, 190 + growth * 26, 58 + growth * 11);
    for (let i = -3; i <= 3; i += 1) {
      const x = i * 27;
      const peak = (i % 2 === 0 ? 35 : 25) * growth;
      g.fillStyle(i % 2 === 0 ? 0xb87842 : 0xd39a59, 0.95 * alpha);
      g.fillTriangle(x - 13, 45, x + 13, 45, x + 3, 45 - peak);
      g.lineStyle(2, 0xffd38f, 0.8 * alpha);
      g.lineBetween(x + 3, 45 - peak, x + 11, 39);
    }
  }
}
