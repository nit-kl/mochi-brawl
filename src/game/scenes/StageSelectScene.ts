import Phaser from 'phaser';
import { loadMatchSetup, saveMatchSetup } from '../flow/MatchSetup';
import { STAGE_LISTINGS, stageListingById } from '../stage/stageCatalog';
import { isTouchLayout } from '../ui/deviceLayout';
import { FlowButton } from '../ui/FlowButton';
import { drawMenuPanel } from '../ui/menuPanel';

const CARD_W = 760;
const CARD_H = 430;

/** 対戦ステージを選ぶ。項目は STAGE_LISTINGS に足す。 */
export class StageSelectScene extends Phaser.Scene {
  private index = 0;
  private leftScene = false;
  private readonly cards: Phaser.GameObjects.Graphics[] = [];
  private leftKey: Phaser.Input.Keyboard.Key | null = null;
  private rightKey: Phaser.Input.Keyboard.Key | null = null;
  private aKey: Phaser.Input.Keyboard.Key | null = null;
  private dKey: Phaser.Input.Keyboard.Key | null = null;
  private enterKey: Phaser.Input.Keyboard.Key | null = null;
  private spaceKey: Phaser.Input.Keyboard.Key | null = null;
  private escKey: Phaser.Input.Keyboard.Key | null = null;

  constructor() {
    super('StageSelectScene');
  }

  preload(): void {
    for (const listing of STAGE_LISTINGS) {
      if (this.textures.exists(listing.previewKey)) continue;
      this.load.image(listing.previewKey, listing.previewUrl);
    }
  }

  create(): void {
    this.leftScene = false;
    this.cards.length = 0;
    this.cameras.main.setBackgroundColor('#9fd6ff');
    this.input.mouse?.disableContextMenu();

    const saved = loadMatchSetup(this);
    const savedIndex = STAGE_LISTINGS.findIndex((entry) => entry.definition.id === saved.stageId);
    this.index = savedIndex >= 0 ? savedIndex : 0;

    this.add
      .text(640, 52, 'ステージ選択', {
        fontFamily: 'sans-serif',
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#1d4e89'
      })
      .setOrigin(0.5);
    this.add
      .text(640, 100, isTouchLayout() ? 'カードをタップして、決定' : '← → で選択    Enter / Space で決定', {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        color: '#3d4d5c'
      })
      .setOrigin(0.5);

    const gap = 40;
    const total = STAGE_LISTINGS.length * CARD_W + Math.max(0, STAGE_LISTINGS.length - 1) * gap;
    let cardX = (1280 - total) / 2 + CARD_W / 2;
    for (const listing of STAGE_LISTINGS) {
      this.addCard(listing.definition.displayName, listing.previewKey, cardX);
      cardX += CARD_W + gap;
    }
    this.refresh();

    new FlowButton(this, 180, 52, 'もどる', () => this.back(), { width: 180, height: 56, fill: 0x6d8494 });
    new FlowButton(this, 640, 656, '決定', () => this.confirm());

    const keyboard = this.input.keyboard;
    const codes = Phaser.Input.Keyboard.KeyCodes;
    this.leftKey = keyboard?.addKey(codes.LEFT) ?? null;
    this.rightKey = keyboard?.addKey(codes.RIGHT) ?? null;
    this.aKey = keyboard?.addKey(codes.A) ?? null;
    this.dKey = keyboard?.addKey(codes.D) ?? null;
    this.enterKey = keyboard?.addKey(codes.ENTER) ?? null;
    this.spaceKey = keyboard?.addKey(codes.SPACE) ?? null;
    this.escKey = keyboard?.addKey(codes.ESC) ?? null;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const key of [this.leftKey, this.rightKey, this.aKey, this.dKey, this.enterKey, this.spaceKey, this.escKey]) {
        if (key) keyboard?.removeKey(key);
      }
    });
  }

  update(): void {
    if (this.leftScene) return;
    if (this.justDown(this.leftKey) || this.justDown(this.aKey)) this.move(-1);
    if (this.justDown(this.rightKey) || this.justDown(this.dKey)) this.move(1);
    if (this.justDown(this.enterKey) || this.justDown(this.spaceKey)) this.confirm();
    if (this.justDown(this.escKey)) this.back();
  }

  private addCard(name: string, previewKey: string, x: number): void {
    const top = 132;
    const graphics = this.add.graphics();
    this.cards.push(graphics);
    const cardIndex = this.cards.length - 1;
    const hit = this.add.rectangle(x, top + CARD_H / 2, CARD_W, CARD_H, 0x000000, 0).setInteractive();
    hit.on('pointerdown', (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      if (!pointer.primaryDown) return;
      this.index = cardIndex;
      this.refresh();
    });

    if (this.textures.exists(previewKey)) {
      const image = this.add.image(x, top + 175, previewKey);
      const source = image.texture.getSourceImage();
      const aspect = source.width > 0 && source.height > 0 ? source.width / source.height : 16 / 9;
      const previewW = 560;
      image.setDisplaySize(previewW, previewW / aspect);
    }
    this.add
      .text(x, top + 378, name, {
        fontFamily: 'sans-serif',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#1d4e89'
      })
      .setOrigin(0.5);
  }

  private refresh(): void {
    const top = 132;
    const gap = 40;
    const total = STAGE_LISTINGS.length * CARD_W + Math.max(0, STAGE_LISTINGS.length - 1) * gap;
    let x = (1280 - total) / 2;
    this.cards.forEach((graphics, index) => {
      drawMenuPanel(graphics, x, top, CARD_W, CARD_H, {
        stroke: index === this.index ? 0x4c8dff : 0xffffff,
        strokeWidth: index === this.index ? 6 : 2
      });
      x += CARD_W + gap;
    });
  }

  private move(delta: number): void {
    const count = STAGE_LISTINGS.length;
    if (count === 0) return;
    this.index = (this.index + delta + count) % count;
    this.refresh();
  }

  private confirm(): void {
    if (this.leftScene) return;
    const listing = STAGE_LISTINGS[this.index] ?? stageListingById('');
    this.leftScene = true;
    const previous = loadMatchSetup(this);
    saveMatchSetup(this, { ...previous, stageId: listing.definition.id });
    this.scene.start('BattleScene');
  }

  private back(): void {
    if (this.leftScene) return;
    this.leftScene = true;
    this.scene.start('CharacterSelectScene');
  }

  private justDown(key: Phaser.Input.Keyboard.Key | null): boolean {
    return key !== null && Phaser.Input.Keyboard.JustDown(key);
  }
}
