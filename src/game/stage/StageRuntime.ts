import Phaser from 'phaser';
import type { ShrinkPhase, StageDefinition } from './StageDefinition';
import { resolveShrinkPhases } from './shrinkSchedule';

type LivePlatform = {
  id: string;
  kind: 'main' | 'side';
  rect: Phaser.GameObjects.Rectangle;
  body: Phaser.Physics.Arcade.StaticBody;
  baseX: number;
  baseY: number;
  width: number;
  height: number;
  gone: boolean;
};

export type StageDebugSnapshot = {
  elapsedSec: number;
  phase: 0 | 1 | 2;
  nextShrinkSec: number | null;
};

/** 定義から足場を作り、経過時間で Phase を進める。キャラクターは動かさない。 */
export class StageRuntime {
  readonly definition: StageDefinition;
  private readonly phases: ShrinkPhase[];
  private readonly platforms: LivePlatform[];
  private readonly warning: Phaser.GameObjects.Text;
  private mainFinished = false;

  constructor(private readonly scene: Phaser.Scene, definition: StageDefinition) {
    this.definition = definition;
    this.phases = resolveShrinkPhases(definition);
    this.platforms = definition.platforms.map((platform) => {
      const rect = scene.add.rectangle(platform.x, platform.y, platform.width, platform.height, platform.color);
      rect.setDepth(0);
      scene.physics.add.existing(rect, true);
      return {
        id: platform.id,
        kind: platform.kind,
        rect,
        body: rect.body as Phaser.Physics.Arcade.StaticBody,
        baseX: platform.x,
        baseY: platform.y,
        width: platform.width,
        height: platform.height,
        gone: false
      };
    });
    this.warning = scene.add
      .text(640, 112, '', {
        fontFamily: 'sans-serif',
        fontSize: '32px',
        color: '#1a1a1a',
        stroke: '#f4fbff',
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1400)
      .setVisible(false);
  }

  bind(bodies: readonly Phaser.GameObjects.GameObject[]): void {
    for (const body of bodies) {
      for (const platform of this.platforms) {
        this.scene.physics.add.collider(body, platform.rect);
      }
    }
  }

  update(elapsedMs: number): void {
    this.playSideDismiss(elapsedMs);
    this.playMainShrink(elapsedMs);
    this.refreshWarning(elapsedMs);
  }

  hideWarning(): void {
    this.warning.setVisible(false);
  }

  snapshot(elapsedMs: number): StageDebugSnapshot {
    const elapsedSec = elapsedMs / 1000;
    const dropAt = this.phase('drop-sides')?.startSec ?? Number.POSITIVE_INFINITY;
    const shrinkAt = this.phase('shrink-main')?.startSec ?? Number.POSITIVE_INFINITY;
    const phase: 0 | 1 | 2 = elapsedSec >= shrinkAt ? 2 : elapsedSec >= dropAt ? 1 : 0;
    const nextShrinkSec = phase === 0 ? dropAt : phase === 1 ? shrinkAt : null;
    return { elapsedSec, phase, nextShrinkSec };
  }

  debugText(elapsedMs: number): string {
    const info = this.snapshot(elapsedMs);
    const next = info.nextShrinkSec === null ? 'なし' : `${info.nextShrinkSec.toFixed(1)}秒`;
    return `経過 ${info.elapsedSec.toFixed(1)}秒  Phase ${info.phase}  次の縮小 ${next}`;
  }

  private playSideDismiss(elapsedMs: number): void {
    const phase = this.phase('drop-sides');
    if (!phase || elapsedMs < phase.startSec * 1000) return;
    const duration = Math.max(phase.durationSec * 1000, 1);
    const t = clamp01((elapsedMs - phase.startSec * 1000) / duration);
    for (const platform of this.platforms) {
      if (platform.kind !== 'side' || platform.gone) continue;
      if (t >= 1) {
        this.removePlatform(platform);
        continue;
      }
      const shake = Math.sin(elapsedMs / 42) * 6;
      const drop = t * 22;
      const blink = Math.floor(elapsedMs / 90) % 2 === 0 ? 1 : 0.3;
      platform.rect.setPosition(platform.baseX + shake, platform.baseY + drop);
      platform.rect.setAlpha((1 - t) * blink);
      platform.body.updateFromGameObject();
    }
  }

  private playMainShrink(elapsedMs: number): void {
    const phase = this.phase('shrink-main');
    const main = this.platforms.find((platform) => platform.kind === 'main');
    if (!phase || !main || elapsedMs < phase.startSec * 1000) return;
    const target = phase.mainWidth ?? main.width;
    const duration = Math.max(phase.durationSec * 1000, 1);
    const t = smoothstep((elapsedMs - phase.startSec * 1000) / duration);
    const width = main.width + (target - main.width) * t;
    if (t < 1 || !this.mainFinished) {
      main.rect.setSize(width, main.height);
      main.body.updateFromGameObject();
      if (t >= 1) this.mainFinished = true;
    }
  }

  private refreshWarning(elapsedMs: number): void {
    let text = '';
    for (const phase of this.phases) {
      if (!phase.warningText || phase.warningLeadSec <= 0) continue;
      const start = phase.startSec * 1000;
      const lead = phase.warningLeadSec * 1000;
      if (elapsedMs >= start - lead && elapsedMs < start + 600) text = phase.warningText;
    }
    this.warning.setText(text);
    this.warning.setVisible(text.length > 0);
  }

  private removePlatform(platform: LivePlatform): void {
    platform.gone = true;
    platform.body.enable = false;
    platform.rect.setVisible(false);
    platform.rect.setAlpha(0);
  }

  private phase(id: ShrinkPhase['id']): ShrinkPhase | undefined {
    return this.phases.find((phase) => phase.id === id);
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}
