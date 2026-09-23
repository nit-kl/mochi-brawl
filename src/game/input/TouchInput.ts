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
  private readonly eventController = new AbortController();
  private stickPointerId: number | null = null;
  private readonly buttonPointer: Record<TouchButtonId, number | null> = {
    jump: null,
    attack: null,
    special: null,
    guard: null
  };
  private destroyed = false;

  private readonly onStickDown = (event: PointerEvent): void => {
    if (!this.enabled || this.stickPointerId !== null) return;
    event.preventDefault();
    this.stickPointerId = event.pointerId;
    this.view.stickElement().setPointerCapture(event.pointerId);
    this.updateStick(event.clientX, event.clientY);
  };

  private readonly onStickMove = (event: PointerEvent): void => {
    if (!this.enabled || event.pointerId !== this.stickPointerId) return;
    this.updateStick(event.clientX, event.clientY);
  };

  private readonly onStickUp = (event: PointerEvent): void => {
    if (event.pointerId === this.stickPointerId) this.resetStick();
  };

  private readonly onResize = (): void => {
    this.refreshEnabled();
  };

  private readonly onBlur = (): void => {
    this.resetControls();
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.view = new TouchControlsView();
    const signal = this.eventController.signal;
    const stick = this.view.stickElement();
    stick.addEventListener('pointerdown', this.onStickDown, { signal });
    stick.addEventListener('pointermove', this.onStickMove, { signal });
    stick.addEventListener('pointerup', this.onStickUp, { signal });
    stick.addEventListener('pointercancel', this.onStickUp, { signal });
    for (const id of ['jump', 'attack', 'special', 'guard'] as const) {
      const button = this.view.buttonElement(id);
      button.addEventListener('pointerdown', (event) => {
        if (!this.enabled || this.buttonPointer[id] !== null) return;
        event.preventDefault();
        this.buttonPointer[id] = event.pointerId;
        button.setPointerCapture(event.pointerId);
        this.queueButton(id);
        this.view.setPressed(id, true);
      }, { signal });
      const release = (event: PointerEvent): void => {
        if (this.buttonPointer[id] !== event.pointerId) return;
        this.buttonPointer[id] = null;
        this.view.setPressed(id, false);
      };
      button.addEventListener('pointerup', release, { signal });
      button.addEventListener('pointercancel', release, { signal });
    }
    window.addEventListener('blur', this.onBlur, { signal });
    this.stopWatch = watchDeviceLayout(this.onResize);
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.onResize);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.scale.off(Phaser.Scale.Events.RESIZE, this.onResize);
    });

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
      guard: this.buttonPointer.guard !== null,
      dodge: false
    };
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.stopWatch();
    this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.onResize);
    this.eventController.abort();
    this.setEnabled(false);
    this.view.destroy();
  }

  private refreshEnabled(): void {
    this.setEnabled(isTouchLayout() && !isPortraitPhone());
  }

  private setEnabled(enabled: boolean): void {
    if (this.enabled === enabled) return;
    this.enabled = enabled;
    document.body.classList.toggle('touch-battle', enabled);
    this.view.setVisible(enabled);
    if (!enabled) this.resetControls();
    this.scene.scale.refresh();
  }

  private resetControls(): void {
    this.resetStick();
    this.jumpQueued = false;
    this.attackQueued = false;
    this.specialQueued = false;
    for (const id of ['jump', 'attack', 'special', 'guard'] as const) this.buttonPointer[id] = null;
    this.view.resetPressed();
  }

  private queueButton(id: TouchButtonId): void {
    if (id === 'jump') this.jumpQueued = true;
    else if (id === 'attack') this.attackQueued = true;
    else if (id === 'special') this.specialQueued = true;
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
