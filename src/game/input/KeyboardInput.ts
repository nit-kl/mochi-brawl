import Phaser from 'phaser';
import type { InputSource } from './InputSource';
import { neutralInput, type PlayerInputState } from './PlayerInput';

/** 1人分のキー割り当て。2人目は別の layout を渡して同じクラスを作る。 */
export type KeyboardLayout = {
  left: number[];
  right: number[];
  jump: number[];
  up: number[];
  down: number[];
  attack: number[];
  special: number[];
};

const codes = Phaser.Input.Keyboard.KeyCodes;

export const PLAYER_ONE_KEYBOARD_LAYOUT: KeyboardLayout = {
  left: [codes.A],
  right: [codes.D],
  jump: [codes.W, codes.SPACE],
  up: [codes.W],
  down: [codes.S],
  attack: [codes.J],
  special: [codes.K]
};

export const PLAYER_TWO_KEYBOARD_LAYOUT: KeyboardLayout = {
  left: [codes.LEFT],
  right: [codes.RIGHT],
  jump: [codes.UP],
  up: [codes.UP],
  down: [codes.DOWN],
  attack: [codes.ENTER],
  special: [codes.PERIOD]
};

export class KeyboardInput implements InputSource {
  private readonly keyboard: Phaser.Input.Keyboard.KeyboardPlugin | null;
  private readonly left: Phaser.Input.Keyboard.Key[];
  private readonly right: Phaser.Input.Keyboard.Key[];
  private readonly jump: Phaser.Input.Keyboard.Key[];
  private readonly up: Phaser.Input.Keyboard.Key[];
  private readonly down: Phaser.Input.Keyboard.Key[];
  private readonly attack: Phaser.Input.Keyboard.Key[];
  private readonly special: Phaser.Input.Keyboard.Key[];
  private readonly captured: number[];
  private destroyed = false;

  constructor(scene: Phaser.Scene, layout: KeyboardLayout = PLAYER_ONE_KEYBOARD_LAYOUT) {
    const keyboard = scene.input.keyboard;
    this.keyboard = keyboard;
    if (!keyboard) {
      this.left = [];
      this.right = [];
      this.jump = [];
      this.up = [];
      this.down = [];
      this.attack = [];
      this.special = [];
      this.captured = [];
      return;
    }

    this.left = this.bind(keyboard, layout.left);
    this.right = this.bind(keyboard, layout.right);
    this.jump = this.bind(keyboard, layout.jump);
    this.up = this.bind(keyboard, layout.up);
    this.down = this.bind(keyboard, layout.down);
    this.attack = this.bind(keyboard, layout.attack);
    this.special = this.bind(keyboard, layout.special);
    this.captured = [
      ...layout.left,
      ...layout.right,
      ...layout.jump,
      ...layout.up,
      ...layout.down,
      ...layout.attack,
      ...layout.special
    ];
    keyboard.addCapture(this.captured);
  }

  read(): PlayerInputState {
    if (!this.keyboard) return neutralInput();

    let moveX = 0;
    if (this.left.some((key) => key.isDown)) moveX -= 1;
    if (this.right.some((key) => key.isDown)) moveX += 1;

    let jump = false;
    for (const key of this.jump) {
      if (Phaser.Input.Keyboard.JustDown(key)) jump = true;
    }
    let attack = false;
    for (const key of this.attack) {
      if (Phaser.Input.Keyboard.JustDown(key)) attack = true;
    }
    let special = false;
    for (const key of this.special) {
      if (Phaser.Input.Keyboard.JustDown(key)) special = true;
    }

    let moveY = 0;
    if (this.up.some((key) => key.isDown)) moveY -= 1;
    if (this.down.some((key) => key.isDown)) moveY += 1;

    return {
      moveX,
      moveY,
      jump,
      attack,
      special,
      dodge: false
    };
  }

  destroy(): void {
    if (this.destroyed || !this.keyboard) return;
    this.destroyed = true;
    this.keyboard.removeCapture(this.captured);
    const keys = [...this.left, ...this.right, ...this.jump, ...this.up, ...this.down, ...this.attack, ...this.special];
    for (const key of keys) {
      if (!this.keyboard.keys?.includes(key)) continue;
      this.keyboard.removeKey(key);
    }
  }

  private bind(keyboard: Phaser.Input.Keyboard.KeyboardPlugin, keyCodes: number[]): Phaser.Input.Keyboard.Key[] {
    return keyCodes.map((code) => keyboard.addKey(code));
  }
}
