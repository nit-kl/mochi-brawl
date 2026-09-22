import Phaser from 'phaser';
import { KeyboardInput, PLAYER_ONE_KEYBOARD_LAYOUT, type KeyboardLayout } from './KeyboardInput';
import type { InputSource } from './InputSource';
import { PlayerInput } from './PlayerInput';
import { TouchInput } from './TouchInput';

export type PlayerInputOptions = {
  layout?: KeyboardLayout;
  /** 省略時はタッチ操作を付ける。2P のキーボード専用では false。 */
  touch?: boolean;
};

/** 1人分の入力。デバイスの追加や差し替えはこの関数だけを変える。 */
export function createPlayerInput(scene: Phaser.Scene, options: PlayerInputOptions = {}): PlayerInput {
  const sources: InputSource[] = [new KeyboardInput(scene, options.layout ?? PLAYER_ONE_KEYBOARD_LAYOUT)];
  if (options.touch ?? true) sources.push(new TouchInput(scene));
  return new PlayerInput(sources);
}
