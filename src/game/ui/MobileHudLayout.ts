import Phaser from 'phaser';
import { isTouchLayout, measureGameFrame, watchDeviceLayout } from './deviceLayout';

type HudSlot = {
  info: Phaser.GameObjects.Text;
  percent: Phaser.GameObjects.Text;
};

const DESKTOP = { leftX: 24, rightX: 1256, top: 16, percentGap: 76 };

/** HUD の文言は変えず、タッチ端末では Safe Area の内側へ寄せる。 */
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
    const percentY = top + DESKTOP.percentGap;
    const left = this.slots[0];
    const right = this.slots[1];
    if (left) {
      left.info.setPosition(leftX, top);
      left.percent.setPosition(leftX, percentY);
    }
    if (right) {
      right.info.setPosition(rightX, top);
      right.percent.setPosition(rightX, percentY);
    }
  }
}
