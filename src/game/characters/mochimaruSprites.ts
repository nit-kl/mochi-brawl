import type { CharacterSpriteSet } from './CharacterSpriteSet';

const IDLE_FRAME = 627;
const RUN_FRAME = 512;
const ATTACK_FRAME_W = 543;
const ATTACK_FRAME_H = 724;
export const MOCHIMARU_SPRITES: CharacterSpriteSet = {
  id: 'mochimaru',
  anims: [
    {
      name: 'idle',
      textureKey: 'mochimaru-idle-sheet',
      url: 'assets/characters/mochimaru/sprites/mochimaru_idle.png',
      frameWidth: IDLE_FRAME,
      frameHeight: IDLE_FRAME,
      frames: [0, 1],
      frameRate: 5,
      repeat: -1,
      visualScale: 80 / 446,
      footAnchor: { x: 0.5, y: (IDLE_FRAME - 54) / IDLE_FRAME }
    },
    {
      name: 'run',
      textureKey: 'mochimaru-run-sheet',
      url: 'assets/characters/mochimaru/sprites/mochimaru_run.png',
      frameWidth: RUN_FRAME,
      frameHeight: RUN_FRAME,
      frames: [0, 1, 2, 3, 4, 5],
      frameRate: 10,
      repeat: -1,
      visualScale: 80 / 346,
      footAnchor: { x: 0.5, y: (RUN_FRAME - 56) / RUN_FRAME }
    },
    {
      name: 'jump',
      textureKey: 'mochimaru-jump-sheet',
      url: 'assets/characters/mochimaru/sprites/mochimaru_jump.png',
      frameWidth: IDLE_FRAME,
      frameHeight: IDLE_FRAME,
      frames: [0, 1],
      frameRate: 8,
      repeat: -1,
      visualScale: 80 / 376,
      footAnchor: { x: 0.5, y: (IDLE_FRAME - 79) / IDLE_FRAME }
    },
    {
      name: 'fall',
      textureKey: 'mochimaru-fall-sheet',
      url: 'assets/characters/mochimaru/sprites/mochimaru_fall.png',
      frameWidth: IDLE_FRAME,
      frameHeight: IDLE_FRAME,
      frames: [0, 1],
      frameRate: 7,
      repeat: -1,
      visualScale: 80 / 420,
      footAnchor: { x: 0.5, y: (IDLE_FRAME - 67) / IDLE_FRAME }
    },
    {
      name: 'attack',
      textureKey: 'mochimaru-attack-sheet',
      url: 'assets/characters/mochimaru/sprites/mochimaru_attack.png',
      frameWidth: ATTACK_FRAME_W,
      frameHeight: ATTACK_FRAME_H,
      frames: [0, 1, 2, 3],
      frameRate: 13,
      repeat: 0,
      visualScale: 80 / 450,
      footAnchor: { x: 0.5, y: (ATTACK_FRAME_H - 120) / ATTACK_FRAME_H }
    },
    {
      name: 'special_roll',
      textureKey: 'mochimaru-roll-sheet',
      url: 'assets/characters/mochimaru/sprites/mochimaru_special_roll.png',
      frameWidth: RUN_FRAME,
      frameHeight: RUN_FRAME,
      frames: [0, 1, 2, 3, 4, 5],
      frameRate: 12,
      repeat: -1,
      visualScale: 80 / 372,
      footAnchor: { x: 0.5, y: (RUN_FRAME - 33) / RUN_FRAME }
    },
    {
      name: 'up_special',
      textureKey: 'mochimaru-balloon-sheet',
      url: 'assets/characters/mochimaru/sprites/mochimaru_up_special.png',
      frameWidth: RUN_FRAME,
      frameHeight: RUN_FRAME,
      frames: [0, 1, 2, 3, 4, 5],
      frameRate: 10,
      repeat: -1,
      visualScale: 80 / 267,
      footAnchor: { x: 0.5, y: (RUN_FRAME - 33) / RUN_FRAME }
    },
    {
      name: 'hit',
      textureKey: 'mochimaru-hit-sheet',
      url: 'assets/characters/mochimaru/sprites/mochimaru_hit.png',
      frameWidth: IDLE_FRAME,
      frameHeight: IDLE_FRAME,
      frames: [0, 1, 2, 3],
      frameRate: 9,
      repeat: 0,
      visualScale: 80 / 471,
      footAnchor: { x: 0.5, y: (IDLE_FRAME - 38) / IDLE_FRAME }
    }
  ]
};
