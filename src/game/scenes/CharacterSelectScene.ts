import Phaser from 'phaser';
import { CHARACTER_ROSTER, opponentProfile, type CharacterProfile } from '../characters/roster';
import { loadMatchSetup, saveMatchSetup } from '../flow/MatchSetup';
import { isTouchLayout } from '../ui/deviceLayout';
import { FlowButton } from '../ui/FlowButton';
import { drawMenuPanel } from '../ui/menuPanel';
import { ensureCharacterAnimations, preloadCharacterSprites } from '../view/SpriteCharacterView';

const CARD_W = 340;
const CARD_H = 420;

/** 1P のキャラクターを選ぶ。2P は選ばれなかった側。 */
export class CharacterSelectScene extends Phaser.Scene {
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
    super('CharacterSelectScene');
  }

  preload(): void {
    for (const entry of CHARACTER_ROSTER) {
      if (entry.character.spriteSet) preloadCharacterSprites(this, entry.character.spriteSet);
    }
  }

  create(): void {
    this.leftScene = false;
    this.cards.length = 0;
    this.cameras.main.setBackgroundColor('#9fd6ff');
    this.input.mouse?.disableContextMenu();
    for (const entry of CHARACTER_ROSTER) {
      if (entry.character.spriteSet) ensureCharacterAnimations(this, entry.character.spriteSet);
    }

    const saved = loadMatchSetup(this);
    const savedIndex = CHARACTER_ROSTER.findIndex((entry) => entry.character.id === saved.player1CharacterId);
    this.index = savedIndex >= 0 ? savedIndex : 0;

    this.add
      .text(640, 58, 'キャラクター選択', {
        fontFamily: 'sans-serif',
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#1d4e89'
      })
      .setOrigin(0.5);
    this.add
      .text(640, 108, isTouchLayout() ? 'カードをタップして、決定' : '← → または A D    Enter / Space で決定', {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        color: '#3d4d5c'
      })
      .setOrigin(0.5);

    const gap = 72;
    const total = CHARACTER_ROSTER.length * CARD_W + (CHARACTER_ROSTER.length - 1) * gap;
    let cardX = (1280 - total) / 2 + CARD_W / 2;
    for (const entry of CHARACTER_ROSTER) {
      this.addCard(entry, cardX);
      cardX += CARD_W + gap;
    }
    this.refresh();

    new FlowButton(this, 180, 58, 'もどる', () => this.back(), { width: 180, height: 56, fill: 0x6d8494 });
    new FlowButton(this, 640, 652, '決定', () => this.confirm());

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

  private addCard(entry: CharacterProfile, x: number): void {
    const top = 148;
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

    const idle = entry.character.spriteSet?.anims.find((anim) => anim.name === 'idle');
    if (idle) {
      const sprite = this.add.sprite(x, top + 250, idle.textureKey, idle.frames[0] ?? 0);
      sprite.play(idle.textureKey);
      sprite.setDisplaySize(idle.frameWidth * idle.visualScale, idle.frameHeight * idle.visualScale);
      sprite.setOrigin(idle.footAnchor.x, idle.footAnchor.y);
    }

    this.add
      .text(x, top + 286, entry.character.displayName, {
        fontFamily: 'sans-serif',
        fontSize: '32px',
        fontStyle: 'bold',
        color: entry.nameColor
      })
      .setOrigin(0.5);
    this.add
      .text(x, top + 340, entry.blurb, {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        color: '#3d4d5c',
        align: 'center'
      })
      .setOrigin(0.5);
  }

  private refresh(): void {
    const top = 148;
    const gap = 72;
    const total = CHARACTER_ROSTER.length * CARD_W + (CHARACTER_ROSTER.length - 1) * gap;
    let x = (1280 - total) / 2;
    this.cards.forEach((graphics, index) => {
      const selected = index === this.index;
      const accent = CHARACTER_ROSTER[index]?.marker ?? 0x4c8dff;
      drawMenuPanel(graphics, x, top, CARD_W, CARD_H, {
        stroke: selected ? accent : 0xffffff,
        strokeWidth: selected ? 6 : 2
      });
      x += CARD_W + gap;
    });
  }

  private move(delta: number): void {
    const count = CHARACTER_ROSTER.length;
    if (count === 0) return;
    this.index = (this.index + delta + count) % count;
    this.refresh();
  }

  private confirm(): void {
    if (this.leftScene) return;
    const selected = CHARACTER_ROSTER[this.index];
    if (!selected) return;
    this.leftScene = true;
    const previous = loadMatchSetup(this);
    const opponent = opponentProfile(selected.character.id);
    saveMatchSetup(this, {
      mode: previous.mode,
      player1CharacterId: selected.character.id,
      player2CharacterId: opponent.character.id,
      stageId: previous.stageId
    });
    this.scene.start('StageSelectScene');
  }

  private back(): void {
    if (this.leftScene) return;
    this.leftScene = true;
    this.scene.start('TitleScene');
  }

  private justDown(key: Phaser.Input.Keyboard.Key | null): boolean {
    return key !== null && Phaser.Input.Keyboard.JustDown(key);
  }
}
