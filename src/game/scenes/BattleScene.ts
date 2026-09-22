import Phaser from 'phaser';
import { MOCHIMARU } from '../characters/mochimaru';
import { PLACEHOLDER_CHARACTER } from '../characters/placeholderCharacter';
import { createHitResult } from '../combat/HitResult';
import { resolveHits } from '../combat/resolveHits';
import { CombatDebugOverlay } from '../debug/CombatDebugOverlay';
import { createPlayerInput } from '../input/createPlayerInput';
import { PLAYER_TWO_KEYBOARD_LAYOUT } from '../input/KeyboardInput';
import type { PlayerInput } from '../input/PlayerInput';
import { StockMatch, STARTING_STOCKS, type MatchAction } from '../match/StockMatch';
import { Fighter } from '../player/Fighter';
import { PLACEHOLDER_STAGE } from '../stage/PlaceholderStage';

const SPAWNS = [
  { x: 460, y: 470, color: 0x6aa6ff, character: MOCHIMARU },
  { x: 820, y: 470, color: 0xf08a5d, character: PLACEHOLDER_CHARACTER }
] as const;

type FighterSlot = {
  fighter: Fighter;
  input: PlayerInput;
  spawnX: number;
  spawnY: number;
};

type HudSlot = {
  info: Phaser.GameObjects.Text;
  percent: Phaser.GameObjects.Text;
};

export class BattleScene extends Phaser.Scene {
  private readonly slots: FighterSlot[] = [];
  private match!: StockMatch;
  private hud: HudSlot[] = [];
  private resultText!: Phaser.GameObjects.Text;
  private restartKey: Phaser.Input.Keyboard.Key | null = null;
  private debugKey: Phaser.Input.Keyboard.Key | null = null;
  private debugEnabled = false;
  private debugOverlay!: CombatDebugOverlay;

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
      const fighter = new Fighter(this, id, spawn.x, spawn.y, spawn.color, spawn.character);
      this.physics.add.collider(fighter.character.object, ground);
      const input = createPlayerInput(
        this,
        index === 0 ? { touch: true } : { layout: PLAYER_TWO_KEYBOARD_LAYOUT, touch: false }
      );
      this.slots.push({ fighter, input, spawnX: spawn.x, spawnY: spawn.y });
    });

    this.hud = SPAWNS.map((spawn, index) => this.createHud(spawn.character.displayName, index));
    this.refreshHud();
    this.debugOverlay = new CombatDebugOverlay(this, PLACEHOLDER_STAGE.koBounds);

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
    this.debugKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F3) ?? null;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const slot of this.slots) slot.input.destroy();
      if (this.restartKey) this.input.keyboard?.removeKey(this.restartKey);
      if (this.debugKey) this.input.keyboard?.removeKey(this.debugKey);
    });
  }

  update(time: number): void {
    if (this.match.isFinished) {
      if (this.restartKey && Phaser.Input.Keyboard.JustDown(this.restartKey)) this.scene.restart();
      return;
    }

    if (this.debugKey && Phaser.Input.Keyboard.JustDown(this.debugKey)) this.debugEnabled = !this.debugEnabled;

    for (const slot of this.slots) slot.fighter.update(slot.input.read(), time);

    for (const contact of resolveHits(this.slots.map((slot) => slot.fighter))) {
      const attacker = this.slots[contact.attackerId - 1]?.fighter;
      const defender = this.slots[contact.targetId - 1]?.fighter;
      if (!attacker || !defender) continue;
      const result = createHitResult(
        attacker.id,
        defender.id,
        attacker.attack.attackDefinition,
        defender.damagePercent,
        defender.weight,
        attacker.character.facing
      );
      defender.applyHitResult(result, time);
      console.log(
        `${attacker.displayName} ${result.attack.id} hit ${defender.displayName}: ${defender.damagePercent}% knockback ${Math.round(result.knockback)}`
      );
    }

    const actions = this.match.update(
      time,
      this.slots.map((slot) => ({ x: slot.fighter.x, y: slot.fighter.y })),
      PLACEHOLDER_STAGE.koBounds
    );
    this.applyActions(actions);
    this.refreshHud();
    this.updateBlink(time);
    this.debugOverlay.draw(
      this.debugEnabled,
      this.slots.map((slot) => slot.fighter.hurtbox.bounds(slot.fighter.x, slot.fighter.y))
    );
  }

  private applyActions(actions: MatchAction[]): void {
    for (const action of actions) {
      const slot = this.slots[action.index];
      if (!slot) continue;
      if (action.type === 'eliminated') {
        slot.fighter.eliminate();
        continue;
      }
      if (action.type === 'respawn') slot.fighter.resetDamage();
      slot.fighter.place(slot.spawnX, slot.spawnY);
    }

    if (!this.match.isFinished) return;

    const winner = this.match.winner;
    const winnerName = winner === null ? null : this.slots[winner - 1]?.fighter.displayName;
    const headline = winnerName ? `${winnerName} の勝ち` : '引き分け';
    this.resultText.setText(`${headline}\nRキー / タップで再戦`);
    this.resultText.setVisible(true);
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
      if (this.match.isFinished) this.scene.restart();
    });
  }

  private createHud(label: string, index: number): HudSlot {
    const alignRight = index === 1;
    const color = index === 0 ? '#1d4e89' : '#8a3d16';
    const info = this.add.text(alignRight ? 1256 : 24, 16, label, {
      fontFamily: 'sans-serif',
      fontSize: '26px',
      color,
      align: alignRight ? 'right' : 'left',
      lineSpacing: 4
    });
    const percent = this.add.text(alignRight ? 1256 : 24, 92, '0%', {
      fontFamily: 'sans-serif',
      fontSize: '34px',
      color
    });
    for (const text of [info, percent]) {
      text.setOrigin(alignRight ? 1 : 0, 0);
      text.setScrollFactor(0);
      text.setDepth(1500);
    }
    return { info, percent };
  }

  private refreshHud(): void {
    this.hud.forEach((slot, index) => {
      const spawn = SPAWNS[index];
      const fighter = this.slots[index]?.fighter;
      if (!spawn || !fighter) return;
      const stocks = this.match.stocksOf(index);
      const stars = '★'.repeat(stocks) + '☆'.repeat(STARTING_STOCKS - stocks);
      const percent = Math.round(fighter.damagePercent);
      slot.info.setText(`${fighter.displayName}\n${stars}`);
      slot.percent.setText(`${percent}%`);
      slot.percent.setColor(percentColor(percent, index));
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

function percentColor(percent: number, index: number): string {
  if (percent >= 100) return '#d01212';
  if (percent >= 50) return '#e07a00';
  return index === 0 ? '#1d4e89' : '#8a3d16';
}
