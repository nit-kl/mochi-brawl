import type { CharacterSpriteSet } from './CharacterSpriteSet';

const STRIP_H = 724;
const CELL4 = 543;
const CELL6 = 362;
/** idle の体の高さ。もちまる（約 80px）より少し大きく、低めで幅のある見た目にする。 */
const BODY_PX = 360;
const SCALE = 96 / BODY_PX;

export const POTECHI_SPRITES: CharacterSpriteSet = {
  id: 'potechi',
  anims: [
    {
      name: 'idle',
      textureKey: 'potechi-idle-sheet',
      url: 'assets/characters/potechi/sprites/potechi_idle.png',
      frameWidth: CELL4,
      frameHeight: STRIP_H,
      frames: [0, 1, 2, 3],
      frameRate: 5,
      repeat: -1,
      visualScale: SCALE,
      footAnchor: { x: 0.5, y: (STRIP_H - 170) / STRIP_H }
    },
    {
      name: 'run',
      textureKey: 'potechi-run-sheet',
      url: 'assets/characters/potechi/sprites/potechi_run.png',
      frameWidth: CELL6,
      frameHeight: STRIP_H,
      frames: [0, 1, 2, 3, 4, 5],
      frameRate: 8,
      repeat: -1,
      visualScale: SCALE,
      footAnchor: { x: 0.5, y: (STRIP_H - 213) / STRIP_H }
    },
    {
      name: 'jump',
      textureKey: 'potechi-jump-sheet',
      url: 'assets/characters/potechi/sprites/potechi_jump.png',
      frameWidth: CELL4,
      frameHeight: STRIP_H,
      frames: [0, 1, 3],
      frameRate: 8,
      repeat: -1,
      visualScale: SCALE,
      footAnchor: { x: 0.5, y: (STRIP_H - 136) / STRIP_H }
    },
    {
      name: 'fall',
      textureKey: 'potechi-fall-sheet',
      url: 'assets/characters/potechi/sprites/potechi_fall.png',
      frameWidth: CELL4,
      frameHeight: STRIP_H,
      frames: [0, 1],
      frameRate: 7,
      repeat: -1,
      visualScale: SCALE,
      footAnchor: { x: 0.5, y: (STRIP_H - 179) / STRIP_H }
    },
    {
      name: 'attack',
      textureKey: 'potechi-attack-sheet',
      url: 'assets/characters/potechi/sprites/potechi_attack.png',
      frameWidth: CELL4,
      frameHeight: STRIP_H,
      frames: [0, 1, 2, 3],
      frameRate: 9,
      repeat: 0,
      visualScale: SCALE,
      footAnchor: { x: 0.5, y: (STRIP_H - 126) / STRIP_H }
    },
    {
      name: 'special_slam',
      textureKey: 'potechi-special-slam-sheet',
      url: 'assets/characters/potechi/sprites/potechi_special_slam.png',
      frameWidth: CELL6,
      frameHeight: STRIP_H,
      frames: [0, 1, 2, 3, 4, 5],
      frameRate: 1,
      repeat: 0,
      visualScale: SCALE,
      footAnchor: { x: 0.5, y: (STRIP_H - 67) / STRIP_H },
      footPads: [87, 89, 320, 191, 67, 84]
    },
    {
      name: 'up_special',
      textureKey: 'potechi-up-special-sheet',
      url: 'assets/characters/potechi/sprites/potechi_up_special.png',
      frameWidth: CELL6,
      frameHeight: STRIP_H,
      frames: [0, 1, 2],
      frameRate: 10,
      repeat: -1,
      visualScale: SCALE,
      footAnchor: { x: 0.5, y: (STRIP_H - 112) / STRIP_H }
    },
    {
      name: 'down_special',
      textureKey: 'potechi-down-special-sheet',
      url: 'assets/characters/potechi/sprites/potechi_down_special.png',
      frameWidth: CELL4,
      frameHeight: STRIP_H,
      frames: [0, 1, 2, 3],
      frameRate: 9,
      repeat: 0,
      visualScale: SCALE,
      footAnchor: { x: 0.5, y: (STRIP_H - 126) / STRIP_H }
    },
    {
      name: 'hit',
      textureKey: 'potechi-hit-sheet',
      url: 'assets/characters/potechi/sprites/potechi_hit.png',
      frameWidth: CELL4,
      frameHeight: STRIP_H,
      frames: [0, 1, 2, 3],
      frameRate: 9,
      repeat: 0,
      visualScale: SCALE,
      footAnchor: { x: 0.5, y: (STRIP_H - 143) / STRIP_H }
    }
  ]
};
