import Phaser from 'phaser';
import type { InputSource } from './InputSource';
import { neutralInput, type PlayerInputState } from './PlayerInput';

export class KeyboardInput implements InputSource {
  private readonly keyboard: Phaser.Input.Keyboard.KeyboardPlugin | null;
  private readonly left: Phaser.Input.Keyboard.Key | null;
  private readonly right: Phaser.Input.Keyboard.Key | null;
  private readonly altLeft: Phaser.Input.Keyboard.Key | null;
  private readonly altRight: Phaser.Input.Keyboard.Key | null;
  private readonly jump: Phaser.Input.Keyboard.Key | null;
  private readonly altJump: Phaser.Input.Keyboard.Key | null;
  private readonly down: Phaser.Input.Keyboard.Key | null;
  private destroyed = false;

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    this.keyboard = keyboard;

    if (!keyboard) {
      this.left = null;
      this.right = null;
      this.altLeft = null;
      this.altRight = null;
      this.jump = null;
      this.altJump = null;
      this.down = null;
      return;
    }

    const codes = Phaser.Input.Keyboard.KeyCodes;
    this.left = keyboard.addKey(codes.A);
    this.altLeft = keyboard.addKey(codes.LEFT);
    this.right = keyboard.addKey(codes.D);
    this.altRight = keyboard.addKey(codes.RIGHT);
    this.altJump = keyboard.addKey(codes.W);
    this.jump = keyboard.addKey(codes.SPACE);
    this.down = keyboard.addKey(codes.S);

    keyboard.addCapture([
      codes.A,
      codes.D,
      codes.W,
      codes.S,
      codes.SPACE,
      codes.LEFT,
      codes.RIGHT
    ]);
  }

  read(): PlayerInputState {
    if (
      !this.left ||
      !this.right ||
      !this.altLeft ||
      !this.altRight ||
      !this.jump ||
      !this.altJump ||
      !this.down
    ) {
      return neutralInput();
    }

    let moveX = 0;
    if (this.left.isDown || this.altLeft.isDown) moveX -= 1;
    if (this.right.isDown || this.altRight.isDown) moveX += 1;

    const jump = Phaser.Input.Keyboard.JustDown(this.jump) || Phaser.Input.Keyboard.JustDown(this.altJump);

    return {
      moveX,
      moveY: this.down.isDown ? 1 : 0,
      jump,
      attack: false,
      special: false,
      dodge: false
    };
  }

  destroy(): void {
    if (this.destroyed || !this.keyboard) return;
    this.destroyed = true;
    const codes = Phaser.Input.Keyboard.KeyCodes;
    this.keyboard.removeCapture([
      codes.A,
      codes.D,
      codes.W,
      codes.S,
      codes.SPACE,
      codes.LEFT,
      codes.RIGHT
    ]);
    for (const key of [this.left, this.right, this.altLeft, this.altRight, this.jump, this.altJump, this.down]) {
      if (key) this.keyboard.removeKey(key);
    }
  }
}
