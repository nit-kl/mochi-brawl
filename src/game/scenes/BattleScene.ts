import Phaser from 'phaser';
import { NEUTRAL_ATTACK } from '../combat/AttackDefinition';
import { resolveHits } from '../combat/resolveHits';
import { createPlayerInput } from '../input/createPlayerInput';
import { PLAYER_TWO_KEYBOARD_LAYOUT } from '../input/KeyboardInput';
import type { PlayerInput } from '../input/PlayerInput';
import { StockMatch, STARTING_STOCKS, type MatchAction } from '../match/StockMatch';
import { Fighter } from '../player/Fighter';

const SPAWNS = [
  { x: 460, y: 470, color: 0x6aa6ff, label: '1P' },
  { x: 820, y: 470, color: 0xf08a5d, label: '2P' }
] as const;

type FighterSlot = {
  fighter: Fighter;
  input: PlayerInput;
  spawnX: number;
  spawnY: number;
};

export class BattleScene extends Phaser.Scene {
  private readonly slots: FighterSlot[] = [];
  private match!: StockMatch;
  private hud: Phaser.GameObjects.Text[] = [];
  private resultText!: Phaser.GameObjects.Text;
  private restartKey: Phaser.Input.Keyboard.Key | null = null;

  constructor() {
    super('BattleScene');
  }

  create(): void {
    this.cameras.main.setScroll(0, 0);
    this.input.mouse?.disableContextMenu();

    const ground = this.add.rectangle(640, 610, 900, 90, 0x79b85a);
    ground.setDepth(0);
    this.physics.add.existing(ground, true);

    this.match = new StockMatch(SPAWNS.length, STARTING_STOCKS);
    this.slots.length = 0;

    SPAWNS.forEach((spawn, index) => {
      const id = (index + 1) as 1 | 2;
      const fighter = new Fighter(this, id, spawn.x, spawn.y, spawn.color, NEUTRAL_ATTACK);
      this.physics.add.collider(fighter.character.object, ground);
      const input = createPlayerInput(
        this,
        index === 0 ? { touch: true } : { layout: PLAYER_TWO_KEYBOARD_LAYOUT, touch: false }
      );
      this.slots.push({ fighter, input, spawnX: spawn.x, spawnY: spawn.y });
    });

    this.hud = SPAWNS.map((spawn, index) => {
      const text = this.add.text(index === 0 ? 24 : 1256, 18, '', {
        fontFamily: 'sans-serif',
        fontSize: '28px',
        color: index === 0 ? '#1d4e89' : '#8a3d16'
      });
      text.setOrigin(index === 0 ? 0 : 1, 0);
      text.setScrollFactor(0);
      text.setDepth(1500);
      return text;
    });
    this.refreshHud();

    this.resultText = this.add
      .text(640, 250, '', {
        fontFamily: 'sans-serif',
        fontSize: '40px',
        color: '#222222',
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2000)
      .setVisible(false);

    this.restartKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R) ?? null;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const slot of this.slots) slot.input.destroy();
      if (this.restartKey) this.input.keyboard?.removeKey(this.restartKey);
    });
  }

  update(time: number): void {
    if (this.match.isFinished) {
      if (this.restartKey && Phaser.Input.Keyboard.JustDown(this.restartKey)) this.scene.restart();
      return;
    }

    for (const slot of this.slots) slot.fighter.update(slot.input.read(), time);

    for (const hit of resolveHits(this.slots.map((slot) => slot.fighter))) {
      console.log(`Player ${hit.attackerId} hit Player ${hit.targetId}`);
      this.slots[hit.targetId - 1]?.fighter.onHit(time);
    }

    const actions = this.match.update(
      time,
      this.slots.map((slot) => slot.fighter.y)
    );
    this.applyActions(actions);
    this.refreshHud();
    this.updateBlink(time);
  }

  private applyActions(actions: MatchAction[]): void {
    for (const action of actions) {
      const slot = this.slots[action.index];
      if (!slot) continue;
      if (action.type === 'eliminated') {
        slot.fighter.eliminate();
        continue;
      }
      slot.fighter.place(slot.spawnX, slot.spawnY);
    }

    if (!this.match.isFinished) return;

    const winner = this.match.winner;
    const headline = winner === null ? '引き分け' : `${winner}P の勝ち`;
    this.resultText.setText(`${headline}\nRキー / タップで再戦`);
    this.resultText.setVisible(true);
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
      if (this.match.isFinished) this.scene.restart();
    });
  }

  private refreshHud(): void {
    this.hud.forEach((text, index) => {
      const spawn = SPAWNS[index];
      if (!spawn) return;
      const marks = '●'.repeat(this.match.stocksOf(index)) + '○'.repeat(STARTING_STOCKS - this.match.stocksOf(index));
      text.setText(index === 0 ? `${spawn.label}  ${marks}` : `${marks}  ${spawn.label}`);
    });
  }

  private updateBlink(time: number): void {
    this.slots.forEach((slot, index) => {
      if (this.match.stocksOf(index) <= 0) return;
      const visiblePhase = Math.floor(time / 120) % 2 === 0;
      slot.fighter.setAlpha(this.match.isInvulnerable(index, time) && !visiblePhase ? 0.35 : 1);
    });
  }
}
