import Phaser from 'phaser';
import { MOCHIMARU } from '../characters/mochimaru';
import { POTECHI } from '../characters/potechi';
import { createHitResult } from '../combat/HitResult';
import { resolveHits } from '../combat/resolveHits';
import { CombatDebugOverlay } from '../debug/CombatDebugOverlay';
import { createPlayerInput } from '../input/createPlayerInput';
import { PLAYER_TWO_KEYBOARD_LAYOUT } from '../input/KeyboardInput';
import type { PlayerInput } from '../input/PlayerInput';
import { StockMatch, STARTING_STOCKS, type MatchAction } from '../match/StockMatch';
import { Fighter } from '../player/Fighter';
import { OHIRUNE_MEADOW } from '../stage/ohiruneMeadow';
import { preloadOhiruneStageArt } from '../stage/StageArtView';
import { StageRuntime } from '../stage/StageRuntime';
import { BattleHud } from '../ui/BattleHud';
import { HitEffectView } from '../ui/HitEffectView';
import { MatchResultView } from '../ui/MatchResultView';
import { MobileHudLayout } from '../ui/MobileHudLayout';
import { ensureCharacterAnimations, preloadCharacterSprites } from '../view/SpriteCharacterView';

const ROSTER = [
  { color: 0x6aa6ff, character: MOCHIMARU },
  { color: 0xf08a5d, character: POTECHI }
] as const;

type FighterSlot = {
  fighter: Fighter;
  input: PlayerInput;
  respawnX: number;
  respawnY: number;
};

export class BattleScene extends Phaser.Scene {
  private readonly slots: FighterSlot[] = [];
  private match!: StockMatch;
  private hud!: BattleHud;
  private hitEffects!: HitEffectView;
  private resultView!: MatchResultView;
  private restartKey: Phaser.Input.Keyboard.Key | null = null;
  private debugKey: Phaser.Input.Keyboard.Key | null = null;
  private debugEnabled = false;
  private debugOverlay!: CombatDebugOverlay;
  private stage!: StageRuntime;
  private startedAt: number | null = null;

  constructor() {
    super('BattleScene');
  }

  preload(): void {
    preloadOhiruneStageArt(this);
    for (const entry of ROSTER) {
      if (entry.character.spriteSet) preloadCharacterSprites(this, entry.character.spriteSet);
    }
  }

  create(): void {
    this.cameras.main.setScroll(0, 0);
    this.input.mouse?.disableContextMenu();

    this.stage = new StageRuntime(this, OHIRUNE_MEADOW);
    this.startedAt = null;
    for (const entry of ROSTER) {
      if (entry.character.spriteSet) ensureCharacterAnimations(this, entry.character.spriteSet);
    }

    this.match = new StockMatch(ROSTER.length, STARTING_STOCKS);
    this.slots.length = 0;

    ROSTER.forEach((entry, index) => {
      const spawn = OHIRUNE_MEADOW.spawnPoints[index];
      const respawn = OHIRUNE_MEADOW.respawnPoints[index];
      if (!spawn || !respawn) return;
      const id = (index + 1) as 1 | 2;
      const fighter = new Fighter(this, id, spawn.x, spawn.y, entry.color, entry.character);
      const input = createPlayerInput(
        this,
        index === 0 ? { touch: true } : { layout: PLAYER_TWO_KEYBOARD_LAYOUT, touch: false }
      );
      this.slots.push({ fighter, input, respawnX: respawn.x, respawnY: respawn.y });
    });
    this.stage.bind(this.slots.map((slot) => slot.fighter.character.object));

    this.hud = new BattleHud(this, [
      { name: 'もちまる', marker: 0x4c8dff, nameColor: '#1d4e89' },
      { name: 'ぽてち', marker: 0xf08a5d, nameColor: '#8a3d16' }
    ]);
    new MobileHudLayout(this, this.hud.slots);
    this.hitEffects = new HitEffectView(this);
    this.resultView = new MatchResultView(this);
    this.refreshHud();
    this.debugOverlay = new CombatDebugOverlay(this, OHIRUNE_MEADOW.koBounds);

    this.restartKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R) ?? null;
    this.debugKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F3) ?? null;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const slot of this.slots) slot.input.destroy();
      if (this.restartKey) this.input.keyboard?.removeKey(this.restartKey);
      if (this.debugKey) this.input.keyboard?.removeKey(this.debugKey);
    });
  }

  update(time: number): void {
    if (this.startedAt === null) this.startedAt = time;
    const elapsed = time - this.startedAt;

    if (this.match.isFinished) {
      this.stage.hideWarning();
      for (const slot of this.slots) slot.fighter.attack.hitbox.setDebugVisible(false);
      if (this.restartKey && Phaser.Input.Keyboard.JustDown(this.restartKey)) this.scene.restart();
      return;
    }

    if (this.debugKey && Phaser.Input.Keyboard.JustDown(this.debugKey)) this.debugEnabled = !this.debugEnabled;
    this.stage.update(elapsed);

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
      this.hitEffects.spawn((attacker.x + defender.x) / 2, (attacker.y + defender.y) / 2, result.attack.visual, time);
      console.log(
        `${attacker.displayName} ${result.attack.id} hit ${defender.displayName}: ${defender.damagePercent}% knockback ${Math.round(result.knockback)}`
      );
    }

    const actions = this.match.update(
      time,
      this.slots.map((slot) => ({ x: slot.fighter.x, y: slot.fighter.y })),
      this.stage.definition.koBounds
    );
    this.applyActions(actions, time);
    this.refreshHud();
    this.hitEffects.update(time);
    this.resultView.update(time);
    this.updateBlink(time);
    for (const slot of this.slots) slot.fighter.attack.hitbox.setDebugVisible(this.debugEnabled);
    const animationLine = this.slots
      .map((slot) => slot.fighter.animationDebugText())
      .filter((line) => line.length > 0)
      .join('\n');
    const stageLine = [this.stage.debugText(elapsed), animationLine].filter((line) => line.length > 0).join('\n');
    this.debugOverlay.draw(
      this.debugEnabled,
      this.slots.map((slot) => slot.fighter.hurtbox.bounds(slot.fighter.x, slot.fighter.y)),
      stageLine
    );
  }

  private applyActions(actions: MatchAction[], time: number): void {
    for (const action of actions) {
      const slot = this.slots[action.index];
      if (!slot) continue;
      if (action.type === 'eliminated' || action.type === 'respawn') {
        this.resultView.showKo(slot.fighter.x, slot.fighter.y, time);
      }
      if (action.type === 'eliminated') {
        slot.fighter.eliminate();
        continue;
      }
      if (action.type === 'respawn') slot.fighter.resetDamage();
      slot.fighter.place(slot.respawnX, slot.respawnY);
    }

    if (!this.match.isFinished) return;

    const winner = this.match.winner;
    const winnerName = winner === null ? null : this.slots[winner - 1]?.fighter.displayName;
    this.resultView.showWinner(winnerName);
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
      if (this.match.isFinished) this.scene.restart();
    });
  }

  private refreshHud(): void {
    this.slots.forEach((slot, index) => {
      this.hud.refresh(index, this.match.stocksOf(index), Math.round(slot.fighter.damagePercent));
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
