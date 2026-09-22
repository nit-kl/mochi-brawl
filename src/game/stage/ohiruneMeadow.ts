import type { StageDefinition } from './StageDefinition';

/**
 * おひるね草原。論理解像度 1280×720。
 * メイン足場の上面は y=565。左右の浮遊足場はその上。
 */
export const OHIRUNE_MEADOW: StageDefinition = {
  id: 'ohirune_meadow',
  displayName: 'おひるね草原',
  spawnPoints: [
    { x: 520, y: 470 },
    { x: 760, y: 470 }
  ],
  respawnPoints: [
    { x: 580, y: 400 },
    { x: 700, y: 400 }
  ],
  koBounds: {
    left: -200,
    right: 1480,
    top: -300,
    bottom: 920
  },
  platforms: [
    { id: 'main', kind: 'main', x: 640, y: 597, width: 820, height: 64, color: 0x6eae52 },
    { id: 'left', kind: 'side', x: 360, y: 476, width: 180, height: 32, color: 0xa6dc78 },
    { id: 'right', kind: 'side', x: 920, y: 476, width: 180, height: 32, color: 0xa6dc78 }
  ],
  shrinkPhases: [
    {
      id: 'normal',
      startSec: 0,
      warningLeadSec: 0,
      warningText: '',
      durationSec: 0
    },
    {
      id: 'drop-sides',
      startSec: 180,
      warningLeadSec: 5,
      warningText: 'ステージがせまくなる！',
      durationSec: 1.6
    },
    {
      id: 'shrink-main',
      startSec: 300,
      warningLeadSec: 5,
      warningText: 'ステージがせまくなる！',
      durationSec: 1.8,
      mainWidth: 520
    }
  ]
};
