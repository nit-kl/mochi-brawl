import Phaser from 'phaser';
import { CHARACTER_ROSTER, type CharacterProfile } from '../characters/roster';
import { preloadCharacterPortrait, portraitKey } from '../characters/characterAssets';
import { loadMatchSetup, saveMatchSetup } from '../flow/MatchSetup';
import { isTouchLayout } from '../ui/deviceLayout';
import { FlowButton } from '../ui/FlowButton';
import { drawMenuPanel } from '../ui/menuPanel';
import { ensureCharacterAnimations, preloadCharacterSprites } from '../view/SpriteCharacterView';

const CARD_W = 470;
const CARD_H = 200;
const CARD_GAP_X = 24;
const CARD_GAP_Y = 18;
const CARD_TOP = 160;
const CARD_LEFT = (1280 - CARD_W * 2 - CARD_GAP_X) / 2;

/** 1P と 2P を順に選ぶ。CPU モードでは 2P が CPU を操作する。 */
export class CharacterSelectScene extends Phaser.Scene {
  private index = 0;
  private selecting: 1 | 2 = 1;
  private player1Index = 0;
  private player2Index = 1;
  private leftScene = false;
  private readonly cards: Phaser.GameObjects.Graphics[] = [];
  private readonly tags: Phaser.GameObjects.Text[] = [];
  private status!: Phaser.GameObjects.Text;
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
      preloadCharacterPortrait(this, entry.character.id, 'select');
    }
  }

  create(): void {
    this.leftScene = false;
    this.cards.length = 0;
    this.tags.length = 0;
    this.cameras.main.setBackgroundColor('#9fd6ff');
    this.input.mouse?.disableContextMenu();
    for (const entry of CHARACTER_ROSTER) {
      if (entry.character.spriteSet) ensureCharacterAnimations(this, entry.character.spriteSet);
    }

    const saved = loadMatchSetup(this);
    const savedIndex = CHARACTER_ROSTER.findIndex((entry) => entry.character.id === saved.player1CharacterId);
    this.index = savedIndex >= 0 ? savedIndex : 0;
    this.player1Index = this.index;
    const savedOpponent = CHARACTER_ROSTER.findIndex((entry) => entry.character.id === saved.player2CharacterId);
    this.player2Index = savedOpponent >= 0 ? savedOpponent : (this.index + 1) % CHARACTER_ROSTER.length;
    this.selecting = 1;

    this.add
      .text(640, 58, 'キャラクター選択', {
        fontFamily: 'sans-serif',
        fontSize: '40px',
        fontStyle: 'bold',
        color: '#1d4e89'
      })
      .setOrigin(0.5);
    this.add
      .text(640, 104, isTouchLayout() ? 'カードをタップして、決定' : '← → または A D    Enter / Space で決定', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#3d4d5c'
      })
      .setOrigin(0.5);
    this.status = this.add.text(640, 134, '', {
      fontFamily: 'sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#1d4e89'
    }).setOrigin(0.5);

    CHARACTER_ROSTER.forEach((entry, index) => this.addCard(entry, index));
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

  private addCard(entry: CharacterProfile, cardIndex: number): void {
    const x = CARD_LEFT + (cardIndex % 2) * (CARD_W + CARD_GAP_X) + CARD_W / 2;
    const top = CARD_TOP + Math.floor(cardIndex / 2) * (CARD_H + CARD_GAP_Y);
    const graphics = this.add.graphics();
    this.cards.push(graphics);
    const hit = this.add.rectangle(x, top + CARD_H / 2, CARD_W, CARD_H, 0x000000, 0).setInteractive();
    hit.on('pointerdown', (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      if (!pointer.primaryDown) return;
      this.index = cardIndex;
      this.refresh();
    });

    const imageX = x - CARD_W / 2 + 74;
    const imageY = top + CARD_H / 2;
    const selectKey = portraitKey(entry.character.id, 'select');
    const idle = entry.character.spriteSet?.anims.find((anim) => anim.name === 'idle');
    if (this.textures.exists(selectKey)) {
      const image = this.add.image(imageX, imageY, selectKey);
      const scale = Math.min(130 / image.width, 150 / image.height);
      image.setScale(scale);
    } else if (idle && this.textures.exists(idle.textureKey)) {
      const sprite = this.add.sprite(imageX, imageY + 45, idle.textureKey, idle.frames[0] ?? 0);
      sprite.play(idle.textureKey);
      const scale = Math.min(130 / idle.frameWidth, 145 / idle.frameHeight);
      sprite.setDisplaySize(idle.frameWidth * scale, idle.frameHeight * scale);
      sprite.setOrigin(idle.footAnchor.x, idle.footAnchor.y);
    } else {
      this.add.circle(imageX, imageY - 5, 52, entry.bodyColor).setStrokeStyle(3, entry.marker);
      this.add.text(imageX, imageY - 7, entry.character.displayName.slice(0, 1), {
        fontFamily: 'sans-serif', fontSize: '48px', fontStyle: 'bold', color: '#ffffff'
      }).setOrigin(0.5);
    }

    this.add
      .text(x + 30, top + 62, entry.character.displayName, {
        fontFamily: 'sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: entry.nameColor
      })
      .setOrigin(0.5);
    this.add
      .text(x + 30, top + 113, entry.blurb, {
        fontFamily: 'sans-serif',
        fontSize: '17px',
        color: '#3d4d5c',
        align: 'center',
        wordWrap: { width: 210 }
      })
      .setOrigin(0.5);
    this.tags.push(this.add.text(x + 30, top + 166, '', {
      fontFamily: 'sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#1d4e89'
    }).setOrigin(0.5));
  }

  private refresh(): void {
    this.cards.forEach((graphics, index) => {
      const selected = index === this.index;
      const accent = CHARACTER_ROSTER[index]?.marker ?? 0x4c8dff;
      const x = CARD_LEFT + (index % 2) * (CARD_W + CARD_GAP_X);
      const y = CARD_TOP + Math.floor(index / 2) * (CARD_H + CARD_GAP_Y);
      drawMenuPanel(graphics, x, y, CARD_W, CARD_H, {
        stroke: selected ? accent : 0xffffff,
        strokeWidth: selected ? 5 : 2
      });
      const labels = [index === (this.selecting === 1 ? this.index : this.player1Index) ? '1P' : '', this.selecting === 2 && index === this.index ? '2P' : ''].filter(Boolean);
      this.tags[index]?.setText(labels.join('  '));
    });
    const one = CHARACTER_ROSTER[this.player1Index]?.character.displayName ?? '';
    this.status.setText(this.selecting === 1 ? '1P を選択中' : `1P: ${one}    2P（${loadMatchSetup(this).mode === 'cpu' ? 'CPU' : 'ふたりで'}）を選択中`);
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
    if (this.selecting === 1) {
      this.player1Index = this.index;
      this.selecting = 2;
      this.index = this.player2Index === this.player1Index ? (this.index + 1) % CHARACTER_ROSTER.length : this.player2Index;
      this.refresh();
      return;
    }
    this.player2Index = this.index;
    this.leftScene = true;
    const previous = loadMatchSetup(this);
    const player1 = CHARACTER_ROSTER[this.player1Index];
    saveMatchSetup(this, {
      mode: previous.mode,
      player1CharacterId: player1.character.id,
      player2CharacterId: selected.character.id,
      stageId: previous.stageId
    });
    this.scene.start('StageSelectScene');
  }

  private back(): void {
    if (this.leftScene) return;
    if (this.selecting === 2) {
      this.selecting = 1;
      this.index = this.player1Index;
      this.refresh();
      return;
    }
    this.leftScene = true;
    this.scene.start('TitleScene');
  }

  private justDown(key: Phaser.Input.Keyboard.Key | null): boolean {
    return key !== null && Phaser.Input.Keyboard.JustDown(key);
  }
}
