import Phaser from 'phaser';
import type { AttackVisual } from '../combat/AttackDefinition';
import type { PlaceholderLook } from '../characters/CharacterDefinition';
import type { CharacterView, CharacterViewState } from './CharacterAnimation';

/** 矩形の仮表示。物理ボディは持たない。 */
export class PlaceholderCharacterView implements CharacterView {
  private readonly shell: Phaser.GameObjects.Rectangle;
  private readonly marker: Phaser.GameObjects.Rectangle;
  private readonly slamMark: Phaser.GameObjects.Rectangle;
  private readonly dashOrb: Phaser.GameObjects.Arc;
  private readonly dashMark: Phaser.GameObjects.Rectangle;
  private readonly balloon: Phaser.GameObjects.Arc;
  private readonly balloonString: Phaser.GameObjects.Rectangle;
  private readonly color: number;
  private readonly markerScale: number;
  private facing: 1 | -1 = 1;
  private pose: CharacterViewState['attackPhase'] = 'idle';

  constructor(scene: Phaser.Scene, x: number, feetY: number, color: number, look: PlaceholderLook) {
    this.color = color;
    this.markerScale = look.markerScale;
    const bodyY = feetY - look.visualHeight / 2;
    this.shell = scene.add.rectangle(x, feetY, look.visualWidth, look.visualHeight, color);
    this.shell.setOrigin(0.5, 1);
    this.shell.setStrokeStyle(3, 0x666666);
    this.shell.setDepth(1);
    this.marker = scene.add.rectangle(x + 22, bodyY, 14 * look.markerScale, 20 * look.markerScale, 0x333333);
    this.marker.setDepth(2);
    this.slamMark = scene.add.rectangle(x, feetY + 10, 22, 16, 0x6a3410);
    this.slamMark.setDepth(3);
    this.slamMark.setVisible(false);
    this.dashOrb = scene.add.circle(x, bodyY, 40, 0xffe39a, 0.88);
    this.dashOrb.setStrokeStyle(3, 0xc48a00);
    this.dashOrb.setDepth(3);
    this.dashOrb.setVisible(false);
    this.dashMark = scene.add.rectangle(x + 18, bodyY, 10, 16, 0xc48a00);
    this.dashMark.setDepth(4);
    this.dashMark.setVisible(false);
    this.balloon = scene.add.circle(x, bodyY - 78, 16, 0xff8fb8, 0.95);
    this.balloon.setStrokeStyle(2, 0xc45b7a);
    this.balloon.setDepth(3);
    this.balloon.setVisible(false);
    this.balloonString = scene.add.rectangle(x, bodyY - 46, 3, 36, 0x666666);
    this.balloonString.setDepth(3);
    this.balloonString.setVisible(false);
  }

  sync(state: CharacterViewState): void {
    this.facing = state.facing;
    this.pose = state.attackPhase;
    this.applyPoseSize();
    this.applyAction(state.attackVisual, state.dt);
    this.shell.setFillStyle(state.flashing ? 0xffffff : this.color);
    this.layout(state);
  }

  setAlpha(alpha: number): void {
    this.shell.setAlpha(alpha);
    this.marker.setAlpha(alpha);
  }

  place(x: number, feetY: number): void {
    this.pose = 'idle';
    this.shell.setVisible(true);
    this.shell.setAlpha(1);
    this.shell.setScale(1, 1);
    this.marker.setVisible(true);
    this.marker.setAlpha(1);
    this.applyPoseSize();
    this.slamMark.setVisible(false);
    this.dashOrb.setVisible(false);
    this.dashMark.setVisible(false);
    this.balloon.setVisible(false);
    this.balloonString.setVisible(false);
    this.shell.setFillStyle(this.color);
    this.shell.setPosition(x, feetY);
  }

  hide(): void {
    this.shell.setVisible(false);
    this.marker.setVisible(false);
    this.slamMark.setVisible(false);
    this.dashOrb.setVisible(false);
    this.dashMark.setVisible(false);
    this.balloon.setVisible(false);
    this.balloonString.setVisible(false);
  }

  debugText(): string {
    return '';
  }

  private applyPoseSize(): void {
    const scale = this.markerScale;
    if (this.pose === 'startup') this.marker.setDisplaySize(10 * scale, 14 * scale);
    else if (this.pose === 'active') this.marker.setDisplaySize(30 * scale, 16 * scale);
    else if (this.pose === 'recovery') this.marker.setDisplaySize(12 * scale, 12 * scale);
    else this.marker.setDisplaySize(14 * scale, 20 * scale);
  }

  private applyAction(style: AttackVisual, dt: number): void {
    const dashing = style === 'dash';
    const ballooning = style === 'balloon';
    const slamming = style === 'slam';
    this.dashOrb.setVisible(dashing);
    this.dashMark.setVisible(dashing);
    this.balloon.setVisible(ballooning);
    this.balloonString.setVisible(ballooning);
    this.slamMark.setVisible(slamming && this.shell.visible);
    this.marker.setVisible(!dashing && this.shell.visible);
    if (slamming) this.shell.setScale(1.22, 0.7);
    else if (style === 'down_special') this.shell.setScale(1.15, 0.72);
    else if (style === 'spring') this.shell.setScale(0.84, 1.42);
    else this.shell.setScale(1, 1);
    if (dashing) this.dashOrb.rotation += 14 * dt;
  }

  private layout(state: CharacterViewState): void {
    const reach = this.pose === 'active' ? 40 : this.pose === 'startup' ? 12 : 22;
    this.marker.setPosition(state.x + this.facing * reach, state.bodyY);
    this.shell.setPosition(state.x, state.feetY);
    this.slamMark.setPosition(state.x + this.facing * 18, state.feetY + 12);
    if (this.dashOrb.visible) {
      this.dashOrb.setPosition(state.x, state.bodyY);
      this.dashMark.setPosition(
        state.x + Math.cos(this.dashOrb.rotation) * 22,
        state.bodyY + Math.sin(this.dashOrb.rotation) * 22
      );
    }
    if (this.balloon.visible) {
      this.balloon.setPosition(state.x, state.bodyY - 78);
      this.balloonString.setPosition(state.x, state.bodyY - 46);
    }
  }
}
