import Phaser from 'phaser';
import type { AttackVisual } from '../combat/AttackDefinition';

const LIFE_MS = 280;
const POOL = 6;

type Spark = {
  graphic: Phaser.GameObjects.Graphics;
  born: number;
  scale: number;
  mochi: boolean;
  potechi: boolean;
  botero: boolean;
};

/** ヒット位置の見た目だけ。判定には加えない。 */
export class HitEffectView {
  private readonly sparks: Spark[];

  constructor(scene: Phaser.Scene) {
    this.sparks = Array.from({ length: POOL }, () => ({
      graphic: scene.add.graphics().setDepth(20).setVisible(false),
      born: -1,
      scale: 1,
      mochi: false,
      potechi: false,
      botero: false
    }));
  }

  spawn(x: number, y: number, visual: AttackVisual, now: number): void {
    const spark = this.sparks.find((item) => item.born < 0) ?? this.sparks[0];
    if (!spark) return;
    spark.born = now;
    spark.scale = effectScale(visual);
    spark.mochi = visual === 'mochi_pulse';
    spark.potechi = visual === 'potechi_slam' || visual === 'potechi_spring' || visual === 'potechi_quake';
    spark.botero = visual === 'botero_drill' || visual === 'botero_lift' || visual === 'botero_shell';
    spark.graphic.setPosition(x, y).setVisible(true);
    this.draw(spark, 1);
  }

  update(now: number): void {
    for (const spark of this.sparks) {
      if (spark.born < 0) continue;
      const t = (now - spark.born) / LIFE_MS;
      if (t >= 1) {
        spark.born = -1;
        spark.graphic.setVisible(false);
        continue;
      }
      this.draw(spark, 1 - t);
    }
  }

  private draw(spark: Spark, alpha: number): void {
    const g = spark.graphic;
    const scale = spark.scale * (0.75 + (1 - alpha) * 0.45);
    g.clear();
    g.lineStyle(3, spark.mochi ? 0xffb176 : spark.potechi ? 0xffbd69 : spark.botero ? 0xffd36d : 0xfff3bf, alpha);
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      const inner = 8 * scale;
      const outer = 30 * scale;
      g.lineBetween(Math.cos(angle) * inner, Math.sin(angle) * inner, Math.cos(angle) * outer, Math.sin(angle) * outer);
    }
    g.fillStyle(0xffffff, alpha);
    g.fillCircle(0, 0, 7 * scale);
    g.fillStyle(spark.mochi ? 0xffe8c0 : spark.potechi ? 0xffd18c : spark.botero ? 0xc5965e : 0xffd15c, alpha * 0.9);
    g.fillCircle(-4 * scale, -3 * scale, 3 * scale);
    g.fillCircle(5 * scale, 2 * scale, 2.4 * scale);
  }
}

function effectScale(visual: AttackVisual): number {
  if (visual === 'dash' || visual === 'slam' || visual === 'potechi_slam' || visual === 'potechi_quake') return 1.65;
  if (visual === 'potechi_spring') return 1.4;
  if (visual === 'botero_drill' || visual === 'botero_shell') return 1.6;
  if (visual === 'botero_lift') return 1.35;
  if (visual === 'mochi_pulse') return 1.45;
  if (visual === 'balloon' || visual === 'spring') return 1.2;
  return 0.85;
}
