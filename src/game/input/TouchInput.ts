import Phaser from 'phaser';
import type { InputSource } from './InputSource';
import { neutralInput, type PlayerInputState } from './PlayerInput';
import { isPortraitPhone, isTouchLayout, watchDeviceLayout } from '../ui/deviceLayout';
import { TouchControlsView, type TouchButtonId } from '../ui/TouchControlsView';

const DEADZONE = 0.18;

/** スマホ操作の入力状態。見た目は TouchControlsView が持つ。 */
export class TouchInput implements InputSource {
  private readonly scene: Phaser.Scene;
  private readonly view: TouchControlsView;
  private readonly stopWatch: () => void;
  private enabled = false;
  private moveX = 0;
  private moveY = 0;
  private jumpQueued = false;
  private attackQueued = false;
  private specialQueued = false;
  private stickPointerId: number | null = null;
  private readonly buttonPointer: Record<TouchButtonId, number | null> = {
    jump: null,
    attack: null,
    special: null
  };
  private destroyed = false;

  private readonly onPointerDown = (pointer: Phaser.Input.Pointer): void => {
    if (!this.enabled) return;

    const button = this.view.hitButton(pointer.x, pointer.y);
    if (button) {
      if (this.buttonPointer[button] !== null) return;
      this.buttonPointer[button] = pointer.id;
      this.queueButton(button);
      this.view.setPressed(button, true);
      return;
    }

    if (this.stickPointerId === null && this.view.hitsStick(pointer.x, pointer.y)) {
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
    for (const id of ['jump', 'attack', 'special'] as const) {
      if (this.buttonPointer[id] !== pointer.id) continue;
      this.buttonPointer[id] = null;
      this.view.setPressed(id, false);
    }
  };

  private readonly onResize = (): void => {
    this.view.layout();
    this.refreshEnabled();
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    scene.input.addPointer(4);
    this.view = new TouchControlsView(scene);
    this.stopWatch = watchDeviceLayout(this.onResize);
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.onResize);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.scale.off(Phaser.Scale.Events.RESIZE, this.onResize);
    });

    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown);
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp);
    scene.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.onPointerUp);
    this.refreshEnabled();
  }

  read(): PlayerInputState {
    if (!this.enabled) return neutralInput();

    const jump = this.jumpQueued;
    const attack = this.attackQueued;
    const special = this.specialQueued;
    this.jumpQueued = false;
    this.attackQueued = false;
    this.specialQueued = false;
    return {
      moveX: this.moveX,
      moveY: this.moveY,
      jump,
      attack,
      special,
      dodge: false
    };
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.stopWatch();
    this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.onResize);
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown);
    this.scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.onPointerUp);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.onPointerUp);
    this.view.destroy();
  }

  private refreshEnabled(): void {
    this.setEnabled(isTouchLayout() && !isPortraitPhone());
  }

  private setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.view.setVisible(enabled);
    if (!enabled) {
      this.resetStick();
      this.jumpQueued = false;
      this.attackQueued = false;
      this.specialQueued = false;
      this.buttonPointer.jump = null;
      this.buttonPointer.attack = null;
      this.buttonPointer.special = null;
      this.view.resetPressed();
    }
  }

  private queueButton(id: TouchButtonId): void {
    if (id === 'jump') this.jumpQueued = true;
    else if (id === 'attack') this.attackQueued = true;
    else this.specialQueued = true;
  }

  private updateStick(x: number, y: number): void {
    const center = this.view.stickCenter();
    const radius = this.view.stickRadius();
    let dx = x - center.x;
    let dy = y - center.y;
    const dist = Math.hypot(dx, dy);
    if (dist > radius && dist > 0) {
      dx = (dx / dist) * radius;
      dy = (dy / dist) * radius;
    }

    this.view.setKnob(dx, dy, true);
    const nx = dx / radius;
    const ny = dy / radius;
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
    this.view.setKnob(0, 0, false);
  }
}

function clampUnit(value: number): number {
  return Math.max(-1, Math.min(1, value));
}
