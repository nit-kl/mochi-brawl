import type { KoBounds } from './KoBounds';

export type StagePoint = { x: number; y: number };

export type PlatformKind = 'main' | 'side';

export type PlatformDefinition = {
  id: string;
  kind: PlatformKind;
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
};

/** 経過時間で足場が変わる段階。startSec は試合開始からの秒。 */
export type ShrinkPhase = {
  id: 'normal' | 'drop-sides' | 'shrink-main';
  startSec: number;
  /** 開始の何秒前から予告を出すか。0 なら予告なし。 */
  warningLeadSec: number;
  warningText: string;
  /** 演出の長さ。0 なら即座。 */
  durationSec: number;
  /** shrink-main のときの最終幅 */
  mainWidth?: number;
};

export type StageDefinition = {
  id: string;
  displayName: string;
  spawnPoints: StagePoint[];
  respawnPoints: StagePoint[];
  koBounds: KoBounds;
  platforms: PlatformDefinition[];
  shrinkPhases: ShrinkPhase[];
};
