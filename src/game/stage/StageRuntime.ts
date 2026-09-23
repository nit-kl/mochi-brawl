import Phaser from 'phaser';
import type { KoBounds } from './KoBounds';
import type { StageDefinition } from './StageDefinition';
import { StageArtView } from './StageArtView';

type LivePlatform = {
  id: string;
  kind: 'main' | 'side';
  rect: Phaser.GameObjects.Rectangle;
  body: Phaser.Physics.Arcade.StaticBody;
  baseX: number;
  baseY: number;
  width: number;
  height: number;
  visualWidth: number;
};

/** 定義から足場を作る。経過時間では足場も KO 境界も変えない。 */
export class StageRuntime {
  readonly definition: StageDefinition;
  private readonly platforms: LivePlatform[];
  private readonly art: StageArtView;

  constructor(private readonly scene: Phaser.Scene, definition: StageDefinition) {
    this.definition = definition;
    this.platforms = definition.platforms.map((platform) => {
      const rect = scene.add.rectangle(platform.x, platform.y, platform.width, platform.height, platform.color);
      rect.setVisible(false);
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
        visualWidth: platform.visualWidth ?? platform.width
      };
    });
    const main = this.platforms.find((platform) => platform.kind === 'main');
    this.art = new StageArtView(scene, main?.visualWidth ?? 820);
    for (const platform of this.platforms) this.syncArt(platform);
  }

  bind(bodies: readonly Phaser.GameObjects.GameObject[]): void {
    for (const body of bodies) {
      for (const platform of this.platforms) {
        this.scene.physics.add.collider(body, platform.rect);
      }
    }
  }

  update(_elapsedMs: number): void {}

  /** 定義どおりの KO 境界。試合中は動かさない。 */
  currentKoBounds(): KoBounds {
    return this.definition.koBounds;
  }

  hideWarning(): void {}

  /** 今ある足場。試合中に消えない。 */
  livePlatforms(): { kind: 'main' | 'side'; centerX: number; top: number; left: number; right: number }[] {
    return this.platforms.map((platform) => {
      const width = platform.rect.width;
      const centerX = platform.rect.x;
      return {
        kind: platform.kind,
        centerX,
        top: platform.rect.y - platform.height / 2,
        left: centerX - width / 2,
        right: centerX + width / 2
      };
    });
  }

  debugText(elapsedMs: number): string {
    return `経過 ${(elapsedMs / 1000).toFixed(1)}秒`;
  }

  private syncArt(platform: LivePlatform): void {
    if (platform.kind === 'main') {
      this.art.syncMain(platform.baseX, platform.baseY, platform.visualWidth, platform.height);
      return;
    }
    this.art.syncSide(platform.id, platform.rect.x, platform.rect.y, platform.height, 1, true);
  }
}
