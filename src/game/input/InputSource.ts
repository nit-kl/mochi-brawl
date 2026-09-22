import type { PlayerInputState } from './PlayerInput';

/** デバイスごとの入力変換。GamepadInput も同じインターフェースで後から追加する。 */
export interface InputSource {
  read(): PlayerInputState;
  destroy(): void;
}
