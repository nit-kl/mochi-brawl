import Phaser from 'phaser';
import { KeyboardInput } from './KeyboardInput';
import { PlayerInput } from './PlayerInput';
import { TouchInput } from './TouchInput';

/** 1人分の入力。デバイスの追加や差し替えはこの配列だけを変える。 */
export function createPlayerInput(scene: Phaser.Scene): PlayerInput {
  return new PlayerInput([new KeyboardInput(scene), new TouchInput(scene)]);
}
