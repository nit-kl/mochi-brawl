import Phaser from 'phaser';
import { measureGameFrame } from './deviceLayout';
import { layoutTouchControls, type TouchControlPlacement, type Vec2 } from './touchControlLayout';

export type TouchButtonId = 'jump' | 'attack' | 'special' | 'guard';

type ButtonView = {
  root: Phaser.GameObjects.Container;
  circle: Phaser.GameObjects.Arc;
  fill: number;
  pressedFill: number;
};

const STROKE = 0x243044;

/** 仮想スティックと右手3ボタンの見た目。入力の成否は持たない。 */
export class TouchControlsView {
  private placement: TouchControlPlacement;
  private readonly root: Phaser.GameObjects.Container;
  private readonly stickRing: Phaser.GameObjects.Arc;
  private readonly stickWell: Phaser.GameObjects.Arc;
  private readonly knob: Phaser.GameObjects.Arc;
  private readonly buttons: Record<TouchButtonId, ButtonView>;
  private readonly labels: Record<TouchButtonId, Phaser.GameObjects.Text>;
  private knobOffsetX = 0;
  private knobOffsetY = 0;
  private knobActive = false;

  constructor(private readonly scene: Phaser.Scene) {
    this.placement = layoutTouchControls(measureGameFrame(scene));
    this.stickRing = scene.add.circle(0, 0, this.placement.stickRadius, 0xffffff, 0.28);
    this.stickRing.setStrokeStyle(5, 0xffffff, 0.95);
    this.stickWell = scene.add.circle(0, 0, this.placement.stickRadius * 0.72, 0x102033, 0.28);
    this.stickWell.setStrokeStyle(3, 0xffffff, 0.45);
    this.knob = scene.add.circle(0, 0, this.placement.knobRadius, 0xffffff, 0.96);
    this.knob.setStrokeStyle(4, STROKE, 1);

    this.buttons = {
      jump: this.createButton(0x3d92f5, 0xb9dcff),
      attack: this.createButton(0xf25b5b, 0xffc1b8),
      special: this.createButton(0x9b6dff, 0xe3d4ff),
      guard: this.createButton(0x4db7a1, 0xb7f4e2)
    };
    this.labels = {
      jump: this.createLabel(this.buttons.jump, 'ジャンプ'),
      attack: this.createLabel(this.buttons.attack, '攻撃'),
      special: this.createLabel(this.buttons.special, '必殺'),
      guard: this.createLabel(this.buttons.guard, '防御')
    };

    this.root = scene.add.container(0, 0, [
      this.stickRing,
      this.stickWell,
      this.knob,
      this.buttons.jump.root,
      this.buttons.attack.root,
      this.buttons.special.root,
      this.buttons.guard.root
    ]);
    this.root.setScrollFactor(0);
    this.root.setDepth(1000);
    this.applyPlacement();
  }

  layout(): void {
    this.placement = layoutTouchControls(measureGameFrame(this.scene));
    this.applyPlacement();
  }

  setVisible(visible: boolean): void {
    this.root.setVisible(visible);
    if (!visible) this.setKnob(0, 0, false);
  }

  hitButton(x: number, y: number): TouchButtonId | null {
    const order: TouchButtonId[] = ['attack', 'special', 'jump', 'guard'];
    for (const id of order) {
      const at = this.placement[id];
      if (distance(x, y, at.x, at.y) <= this.placement.touchRadius) return id;
    }
    return null;
  }

  hitsStick(x: number, y: number): boolean {
    const at = this.placement.stick;
    return distance(x, y, at.x, at.y) <= this.placement.grabRadius;
  }

  stickCenter(): Vec2 {
    return this.placement.stick;
  }

  stickRadius(): number {
    return this.placement.stickRadius;
  }

  /** ノブをスティック中心からのゲーム座標オフセットへ動かす。 */
  setKnob(offsetX: number, offsetY: number, active: boolean): void {
    this.knobOffsetX = offsetX;
    this.knobOffsetY = offsetY;
    this.knobActive = active;
    const at = this.placement.stick;
    this.knob.setPosition(at.x + offsetX, at.y + offsetY);
    this.stickRing.setStrokeStyle(active ? 7 : 5, 0xffffff, active ? 1 : 0.95);
    this.knob.setFillStyle(0xffffff, active ? 1 : 0.96);
  }

  setPressed(id: TouchButtonId, pressed: boolean): void {
    const button = this.buttons[id];
    button.root.setScale(pressed ? 0.92 : 1);
    button.circle.setFillStyle(pressed ? button.pressedFill : button.fill, pressed ? 1 : 0.92);
    button.circle.setStrokeStyle(pressed ? 6 : 4, pressed ? 0xffffff : STROKE, 1);
  }

  resetPressed(): void {
    this.setPressed('jump', false);
    this.setPressed('attack', false);
    this.setPressed('special', false);
    this.setPressed('guard', false);
    this.setKnob(0, 0, false);
  }

  destroy(): void {
    this.root.destroy();
  }

  private applyPlacement(): void {
    const place = this.placement;
    this.stickRing.setPosition(place.stick.x, place.stick.y);
    this.stickRing.setRadius(place.stickRadius);
    this.stickWell.setPosition(place.stick.x, place.stick.y);
    this.stickWell.setRadius(place.stickRadius * 0.72);
    this.knob.setRadius(place.knobRadius);
    this.setKnob(this.knobOffsetX, this.knobOffsetY, this.knobActive);
    for (const id of ['jump', 'attack', 'special', 'guard'] as const) {
      const at = place[id];
      this.buttons[id].root.setPosition(at.x, at.y);
      this.buttons[id].circle.setRadius(place.visualRadius);
      this.labels[id].setFontSize(place.fontPx);
    }
  }

  private createButton(fill: number, pressedFill: number): ButtonView {
    const circle = this.scene.add.circle(0, 0, 40, fill, 0.92);
    circle.setStrokeStyle(4, STROKE, 1);
    const root = this.scene.add.container(0, 0, [circle]);
    return { root, circle, fill, pressedFill };
  }

  private createLabel(button: ButtonView, text: string): Phaser.GameObjects.Text {
    const label = this.scene.add
      .text(0, 0, text, {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        color: '#1a1a1a'
      })
      .setOrigin(0.5);
    button.root.add(label);
    return label;
  }
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x1 - x2, y1 - y2);
}
