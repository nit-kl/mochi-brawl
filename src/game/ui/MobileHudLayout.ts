import Phaser from 'phaser';
import { isTouchLayout, measureGameFrame, watchDeviceLayout } from './deviceLayout';

type HudSlot = {
  root: Phaser.GameObjects.Container;
};

const DESKTOP = { leftX: 24, rightX: 1256, top: 16 };

/** HUD パネルを、タッチ端末では Safe Area の内側へ寄せる。 */
export class MobileHudLayout {
  private readonly onChange = (): void => {
    this.apply();
  };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly slots: HudSlot[]
  ) {
    const stopWatch = watchDeviceLayout(this.onChange);
    this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.onChange);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      stopWatch();
      this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.onChange);
    });
  }

  apply(): void {
    if (!isTouchLayout()) {
      this.place(DESKTOP.leftX, DESKTOP.rightX, DESKTOP.top);
      return;
    }
    const frame = measureGameFrame(this.scene);
    const pad = 16 / frame.cssPerGame;
    const width = this.scene.scale.gameSize.width;
    this.place(frame.insetLeft + pad, width - frame.insetRight - pad, frame.insetTop + pad);
  }

  private place(leftX: number, rightX: number, top: number): void {
    this.slots[0]?.root.setPosition(leftX, top);
    this.slots[1]?.root.setPosition(rightX, top);
  }
}
