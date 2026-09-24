import Phaser from 'phaser';
import type { CharacterViewState } from './CharacterAnimation';

/** ドリル、採掘リフト、岩盤シェルの演出。攻撃判定は持たない。 */
export class BoteroSpecialView {
  private readonly graphic: Phaser.GameObjects.Graphics;
  private step = '';
  private stepStartedAt = 0;

  constructor(scene: Phaser.Scene) {
    this.graphic = scene.add.graphics().setDepth(2).setVisible(false);
  }

  sync(state: CharacterViewState, now: number): void {
    const visual = state.attackVisual;
    if (state.attackPhase === 'idle' || (
      visual !== 'botero_drill' && visual !== 'botero_lift' && visual !== 'botero_shell'
    )) {
      this.hide();
      return;
    }
    const step = `${visual}:${state.attackPhase}`;
    if (step !== this.step) {
      this.step = step;
      this.stepStartedAt = now;
    }
    const age = Math.max(0, now - this.stepStartedAt);
    const g = this.graphic;
    g.setPosition(state.x, state.bodyY).setVisible(true).clear();
    if (visual === 'botero_drill') this.drawDrill(g, state, age);
    else if (visual === 'botero_lift') this.drawLift(g, state, age);
    else this.drawShell(g, state, age);
  }

  hide(): void {
    this.step = '';
    this.graphic.clear().setVisible(false);
  }

  setAlpha(alpha: number): void {
    this.graphic.setAlpha(alpha);
  }

  private drawDrill(g: Phaser.GameObjects.Graphics, state: CharacterViewState, age: number): void {
    const facing = state.facing;
    if (state.attackPhase === 'startup') {
      const charge = Math.min(1, age / 165);
      g.lineStyle(3, 0xffdb68, 0.35 + charge * 0.55);
      g.strokeEllipse(facing * 32, 0, 40 + charge * 35, 38 + charge * 22);
      g.fillStyle(0xffe285, 0.3 + charge * 0.2);
      g.fillCircle(facing * 56, -3, 5 + charge * 5);
      return;
    }
    if (state.attackPhase !== 'active') return;
    const wave = Math.sin(age / 45) * 4;
    g.lineStyle(5, 0xfac45e, 0.9);
    g.strokeEllipse(facing * 48, 0, 68 + wave, 54 + wave);
    g.lineStyle(3, 0xffffff, 0.75);
    g.strokeEllipse(facing * 52, 0, 45 - wave, 38 - wave);
    for (let i = 0; i < 5; i += 1) {
      const x = -facing * (31 + i * 14);
      const y = 22 + (i % 2) * 12;
      g.fillStyle(i % 2 ? 0xb77846 : 0x8f5735, 0.8 - i * 0.1);
      g.fillCircle(x, y, 8 - i * 0.8);
      g.lineStyle(2, 0xffd074, 0.8 - i * 0.1);
      g.lineBetween(x - facing * 12, y + 3, x - facing * 25, y + 8);
    }
  }

  private drawLift(g: Phaser.GameObjects.Graphics, state: CharacterViewState, age: number): void {
    if (state.attackPhase === 'startup') {
      const charge = Math.min(1, age / 95);
      g.fillStyle(0x9c6c43, 0.3 + charge * 0.3);
      g.fillEllipse(0, 38, 55 + charge * 28, 17 + charge * 9);
      g.lineStyle(3, 0xffd96d, 0.6 + charge * 0.3);
      g.strokeEllipse(0, 38, 57 + charge * 29, 20 + charge * 9);
      return;
    }
    const fade = state.attackPhase === 'recovery' ? Math.max(0.15, 1 - age / 240) : 1;
    g.lineStyle(7, 0xffd562, 0.5 * fade);
    g.lineBetween(0, 38, 0, 93);
    g.lineStyle(3, 0xffffff, 0.8 * fade);
    g.lineBetween(-8, 46, -14, 83);
    g.lineBetween(9, 48, 15, 82);
    g.lineStyle(4, 0xffdf7f, 0.75 * fade);
    g.strokeEllipse(0, -10, 64, 50);
    for (let i = -2; i <= 2; i += 1) {
      const drift = Math.sin(age / 100 + i) * 6;
      g.fillStyle(i % 2 ? 0xd19b5e : 0xa66c41, 0.85 * fade);
      g.fillCircle(i * 17 + drift, 51 + Math.abs(i) * 9, 4 + (i + 2) % 3);
    }
  }

  private drawShell(g: Phaser.GameObjects.Graphics, state: CharacterViewState, age: number): void {
    const charge = state.attackPhase === 'startup' ? Math.min(1, age / 225) : 1;
    const fade = state.attackPhase === 'recovery' ? Math.max(0, 1 - age / 220) : 1;
    if (fade <= 0) return;
    g.fillStyle(0xa6794b, (0.13 + charge * 0.19) * fade);
    g.fillEllipse(0, 5, 78 + charge * 62, 65 + charge * 30);
    g.lineStyle(4 + charge, 0xffd16c, (0.45 + charge * 0.45) * fade);
    g.strokeEllipse(0, 4, 82 + charge * 60, 69 + charge * 27);
    const burst = state.attackPhase === 'active';
    for (let i = 0; i < 8; i += 1) {
      const angle = (i * Math.PI * 2) / 8;
      const distance = (burst ? 53 + Math.min(1, age / 90) * 18 : 38 + charge * 10);
      const x = Math.cos(angle) * distance;
      const y = 4 + Math.sin(angle) * distance * 0.6;
      g.fillStyle(i % 2 ? 0x9c663b : 0xc18b50, (burst ? 0.95 : 0.65) * fade);
      g.fillTriangle(x - 7, y + 8, x + 7, y + 8, x, y - (burst ? 17 : 10));
    }
    if (!burst) return;
    const pulse = Math.min(1, age / 100);
    g.lineStyle(5 - pulse * 2, 0xffe6a4, (0.85 - pulse * 0.25) * fade);
    g.strokeEllipse(0, 8, 134 + pulse * 26, 72 + pulse * 14);
  }
}
