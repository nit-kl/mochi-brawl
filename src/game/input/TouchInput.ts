import Phaser from 'phaser';
import type { InputSource } from './InputSource';
import { neutralInput, type PlayerInputState } from './PlayerInput';

const STICK_RADIUS = 52;
const STICK_GRAB_RADIUS = 72;
const KNOB_RADIUS = 22;
const JUMP_RADIUS = 46;
const ATTACK_RADIUS = 42;
const EDGE = 36;
const DEADZONE = 0.18;
const JUMP_FILL_ALPHA = 0.78;
const ATTACK_FILL_ALPHA = 0.9;
const TOUCH_LAYOUT_QUERY = '(pointer: coarse) and (hover: none)';

/** マウス操作のPCでは false。スマホの横持ちだけ true。 */
export function isTouchLayout(): boolean {
  return window.matchMedia(TOUCH_LAYOUT_QUERY).matches;
}

export class TouchInput implements InputSource {
  private readonly scene: Phaser.Scene;
  private readonly ui: Phaser.GameObjects.Container;
  private readonly knob: Phaser.GameObjects.Arc;
  private readonly jumpButton: Phaser.GameObjects.Arc;
  private readonly attackButton: Phaser.GameObjects.Arc;
  private readonly media: MediaQueryList;
  private readonly stickX: number;
  private readonly stickY: number;
  private readonly jumpX: number;
  private readonly jumpY: number;
  private readonly attackX: number;
  private readonly attackY: number;
  private enabled: boolean;
  private moveX = 0;
  private moveY = 0;
  private jumpQueued = false;
  private attackQueued = false;
  private stickPointerId: number | null = null;
  private destroyed = false;

  private readonly onPointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (!this.enabled) return;

    if (distance(pointer.x, pointer.y, this.attackX, this.attackY) <= ATTACK_RADIUS) {
      this.attackQueued = true;
      this.attackButton.setFillStyle(0xffd0c4, 1);
      return;
    }

    if (distance(pointer.x, pointer.y, this.jumpX, this.jumpY) <= JUMP_RADIUS) {
      this.jumpQueued = true;
      this.jumpButton.setFillStyle(0xffe08a, 0.9);
      return;
    }

    if (
      this.stickPointerId === null &&
      distance(pointer.x, pointer.y, this.stickX, this.stickY) <= STICK_GRAB_RADIUS
    ) {
      this.stickPointerId = pointer.id;
      this.updateStick(pointer.x, pointer.y);
    }
  };

  private readonly onPointerMove = (pointer: Phaser.Input.Pointer): void => {
    if (!this.enabled || pointer.id !== this.stickPointerId) return;
    this.updateStick(pointer.x, pointer.y);
  };

  private readonly onPointerUp = (pointer: Phaser.Input.Pointer): void => {
    if (pointer.id === this.stickPointerId) this.resetStick();
    this.jumpButton.setFillStyle(0xffffff, JUMP_FILL_ALPHA);
    this.attackButton.setFillStyle(0xff8d7a, ATTACK_FILL_ALPHA);
  };

  private readonly onMediaChange = (): void => {
    this.setEnabled(this.media.matches);
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    scene.input.addPointer(3);

    const width = scene.scale.gameSize.width;
    const height = scene.scale.gameSize.height;
    this.stickX = EDGE + STICK_RADIUS;
    this.stickY = height - EDGE - STICK_RADIUS;
    this.jumpX = width - EDGE - JUMP_RADIUS;
    this.jumpY = this.stickY;
    this.attackX = this.jumpX;
    this.attackY = this.jumpY - JUMP_RADIUS - 18 - ATTACK_RADIUS;

    const base = scene.add.circle(this.stickX, this.stickY, STICK_RADIUS, 0xffffff, 0.2);
    base.setStrokeStyle(3, 0xffffff, 0.75);
    this.knob = scene.add.circle(this.stickX, this.stickY, KNOB_RADIUS, 0xffffff, 0.85);
    this.jumpButton = scene.add.circle(this.jumpX, this.jumpY, JUMP_RADIUS, 0xffffff, JUMP_FILL_ALPHA);
    this.jumpButton.setStrokeStyle(3, 0xffffff, 0.9);
    this.attackButton = scene.add.circle(this.attackX, this.attackY, ATTACK_RADIUS, 0xff8d7a, ATTACK_FILL_ALPHA);
    this.attackButton.setStrokeStyle(3, 0xffffff, 0.9);
    const jumpLabel = scene.add
      .text(this.jumpX, this.jumpY, 'ジャンプ', {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        color: '#222222'
      })
      .setOrigin(0.5);
    const attackLabel = scene.add
      .text(this.attackX, this.attackY, '攻撃', {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        color: '#222222'
      })
      .setOrigin(0.5);

    this.ui = scene.add.container(0, 0, [base, this.knob, this.jumpButton, jumpLabel, this.attackButton, attackLabel]);
    this.ui.setScrollFactor(0);
    this.ui.setDepth(1000);

    this.media = window.matchMedia(TOUCH_LAYOUT_QUERY);
    this.enabled = isTouchLayout();
    this.ui.setVisible(this.enabled);
    this.media.addEventListener('change', this.onMediaChange);

    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown);
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp);
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.onPointerUp);
  }

  read(): PlayerInputState {
    if (!this.enabled) return neutralInput();

    const jump = this.jumpQueued;
    const attack = this.attackQueued;
    this.jumpQueued = false;
    this.attackQueued = false;
    return {
      moveX: this.moveX,
      moveY: this.moveY,
      jump,
      attack,
      special: false,
      dodge: false
    };
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.media.removeEventListener('change', this.onMediaChange);
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown);
    this.scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.onPointerUp);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.onPointerUp);
    this.ui.destroy();
  }

  private setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.ui.setVisible(enabled);
    if (!enabled) {
      this.resetStick();
      this.jumpQueued = false;
      this.attackQueued = false;
      this.jumpButton.setFillStyle(0xffffff, JUMP_FILL_ALPHA);
      this.attackButton.setFillStyle(0xff8d7a, ATTACK_FILL_ALPHA);
    }
  }

  private updateStick(x: number, y: number): void {
    let dx = x - this.stickX;
    let dy = y - this.stickY;
    const dist = Math.hypot(dx, dy);
    if (dist > STICK_RADIUS && dist > 0) {
      dx = (dx / dist) * STICK_RADIUS;
      dy = (dy / dist) * STICK_RADIUS;
    }

    this.knob.setPosition(this.stickX + dx, this.stickY + dy);

    const nx = dx / STICK_RADIUS;
    const ny = dy / STICK_RADIUS;
    if (Math.hypot(nx, ny) < DEADZONE) {
      this.moveX = 0;
      this.moveY = 0;
      return;
    }

    this.moveX = clampUnit(nx);
    this.moveY = clampUnit(ny);
  }

  private resetStick(): void {
    this.stickPointerId = null;
    this.moveX = 0;
    this.moveY = 0;
    this.knob.setPosition(this.stickX, this.stickY);
  }
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x1 - x2, y1 - y2);
}

function clampUnit(value: number): number {
  return Math.max(-1, Math.min(1, value));
}
