import type Phaser from 'phaser';
import { OHIRUNE_MEADOW } from './ohiruneMeadow';
import { preloadOhiruneStageArt } from './StageArtView';
import type { StageDefinition } from './StageDefinition';

/** ステージ選択に並べる項目。定義を足すと選択画面に増える。 */
export type StageListing = {
  definition: StageDefinition;
  previewKey: string;
  previewUrl: string;
};

export const STAGE_LISTINGS: readonly StageListing[] = [
  {
    definition: OHIRUNE_MEADOW,
    previewKey: 'ohirune-background',
    previewUrl: 'assets/stages/ohirune-meadow/background.png'
  }
];

export function resolveStage(id: string): StageDefinition {
  return STAGE_LISTINGS.find((entry) => entry.definition.id === id)?.definition ?? OHIRUNE_MEADOW;
}

export function stageListingById(id: string): StageListing {
  return STAGE_LISTINGS.find((entry) => entry.definition.id === id) ?? STAGE_LISTINGS[0];
}

/** 選択されたステージの表示用画像。Collider は StageDefinition 側。 */
export function preloadListedStage(scene: Phaser.Scene, stageId: string): void {
  if (resolveStage(stageId).id === 'ohirune_meadow') preloadOhiruneStageArt(scene);
}
