import type { StageDefinition } from './StageDefinition';

/**
 * おひるね草原。論理解像度 1280×720。
 * メイン足場の上面は y=565。当たりは画面の外まで続く常設床。絵の幅は 820。
 * 左右の浮遊足場はその上。下方向の KO は無効。
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
    bottom: 920,
    bottomKoEnabled: false
  },
  platforms: [
    { id: 'main', kind: 'main', x: 640, y: 597, width: 8000, height: 64, visualWidth: 820, color: 0x6eae52 },
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
    }
  ]
};
