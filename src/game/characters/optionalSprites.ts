import type { CharacterSpriteSet } from './CharacterSpriteSet';

/** けろたん・ぼてろ用。攻撃系だけ横長の 384×256、ほかは 256×256。 */
export function optionalCharacterSprites(id: string, visualHeight: number, attackFrameRate = 10): CharacterSpriteSet {
  const names = [
    ['idle', 'idle', 5, -1],
    ['run', 'run', 9, -1],
    ['jump', 'jump', 8, -1],
    ['fall', 'fall', 8, -1],
    ['attack', 'attack', 10, 0],
    ['special_roll', 'special', 10, -1],
    ['up_special', 'up_special', 10, -1],
    ['down_special', 'down_special', 10, 0],
    ['hit', 'hit', 9, 0]
  ] as const;
  return {
    id,
    anims: names.map(([name, file, frameRate, repeat]) => ({
      name,
      textureKey: `${id}-${file}-sheet`,
      url: `assets/characters/${id}/sprites/${file}.png`,
      frameWidth: file === 'attack' || file === 'special' || file === 'down_special' ? 384 : 256,
      frameHeight: 256,
      frames: [0, 1, 2, 3],
      frameRate: name === 'attack' ? attackFrameRate : frameRate,
      repeat,
      visualScale: visualHeight / 190,
      footAnchor: { x: 0.5, y: 1 }
    }))
  };
}
