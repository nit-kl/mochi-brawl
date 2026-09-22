import Phaser from 'phaser';
import { profileById, type CharacterProfile } from '../characters/roster';
import { createHitResult } from '../combat/HitResult';
import { resolveHits } from '../combat/resolveHits';
import { CombatDebugOverlay } from '../debug/CombatDebugOverlay';
import { loadMatchSetup } from '../flow/MatchSetup';
import { createPlayerInput } from '../input/createPlayerInput';
import { PLAYER_TWO_KEYBOARD_LAYOUT } from '../input/KeyboardInput';
import type { PlayerInput } from '../input/PlayerInput';
import { StockMatch, STARTING_STOCKS, type MatchAction } from '../match/StockMatch';
import { Fighter } from '../player/Fighter';
import { preloadListedStage, resolveStage } from '../stage/stageCatalog';
import type { StageDefinition } from '../stage/StageDefinition';
import { StageRuntime } from '../stage/StageRuntime';
import { BattleHud } from '../ui/BattleHud';
import { HitEffectView } from '../ui/HitEffectView';
import { MatchResultView } from '../ui/MatchResultView';
import { MobileHudLayout } from '../ui/MobileHudLayout';
import { ensureCharacterAnimations, preloadCharacterSprites } from '../view/SpriteCharacterView';

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
  private backKey: Phaser.Input.Keyboard.Key | null = null;
  private debugKey: Phaser.Input.Keyboard.Key | null = null;
  private debugEnabled = false;
  private debugOverlay!: CombatDebugOverlay;
  private stage!: StageRuntime;
  private stageDefinition: StageDefinition = resolveStage('ohirune_meadow');
  private players: CharacterProfile[] = [];
  private startedAt: number | null = null;
  private leaving = false;

  constructor() {
    super('BattleScene');
  }

  init(): void {
    const setup = loadMatchSetup(this);
    this.stageDefinition = resolveStage(setup.stageId);
    this.players = [profileById(setup.player1CharacterId), profileById(setup.player2CharacterId)];
  }

  preload(): void {
    preloadListedStage(this, this.stageDefinition.id);
    for (const entry of this.players) {
      if (entry.character.spriteSet) preloadCharacterSprites(this, entry.character.spriteSet);
    }
  }

  create(): void {
    this.leaving = false;
    this.cameras.main.setScroll(0, 0);
    this.input.mouse?.disableContextMenu();

    this.stage = new StageRuntime(this, this.stageDefinition);
    this.startedAt = null;
    for (const entry of this.players) {
      if (entry.character.spriteSet) ensureCharacterAnimations(this, entry.character.spriteSet);
    }

    this.match = new StockMatch(this.players.length, STARTING_STOCKS);
    this.slots.length = 0;

    this.players.forEach((entry, index) => {
      const spawn = this.stageDefinition.spawnPoints[index];
      const respawn = this.stageDefinition.respawnPoints[index];
      if (!spawn || !respawn) return;
      const id = (index + 1) as 1 | 2;
      const fighter = new Fighter(this, id, spawn.x, spawn.y, entry.bodyColor, entry.character);
      const input = createPlayerInput(
        this,
        index === 0 ? { touch: true } : { layout: PLAYER_TWO_KEYBOARD_LAYOUT, touch: false }
      );
      this.slots.push({ fighter, input, respawnX: respawn.x, respawnY: respawn.y });
    });
    this.stage.bind(this.slots.map((slot) => slot.fighter.character.object));

    this.hud = new BattleHud(
      this,
      this.players.map((entry) => ({
        name: entry.character.displayName,
        marker: entry.marker,
        nameColor: entry.nameColor
      }))
    );
    new MobileHudLayout(this, this.hud.slots);
    this.hitEffects = new HitEffectView(this);
    this.resultView = new MatchResultView(this);
    this.refreshHud();
    this.debugOverlay = new CombatDebugOverlay(this, this.stageDefinition.koBounds);

    const keyboard = this.input.keyboard;
    this.restartKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.R) ?? null;
    this.backKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) ?? null;
    this.debugKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F3) ?? null;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const slot of this.slots) slot.input.destroy();
      if (this.restartKey) keyboard?.removeKey(this.restartKey);
      if (this.backKey) keyboard?.removeKey(this.backKey);
      if (this.debugKey) keyboard?.removeKey(this.debugKey);
    });
  }

  update(time: number): void {
    if (this.startedAt === null) this.startedAt = time;
    const elapsed = time - this.startedAt;

    if (this.match.isFinished) {
      this.stage.hideWarning();
      for (const slot of this.slots) slot.fighter.attack.hitbox.setDebugVisible(false);
      this.resultView.update(time);
      if (this.restartKey && Phaser.Input.Keyboard.JustDown(this.restartKey)) this.leaveMatch('rematch');
      if (this.backKey && Phaser.Input.Keyboard.JustDown(this.backKey)) this.leaveMatch('select');
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
    this.resultView.showWinner(winnerName ?? null, {
      onRematch: () => this.leaveMatch('rematch'),
      onBack: () => this.leaveMatch('select')
    });
  }

  private leaveMatch(mode: 'rematch' | 'select'): void {
    if (!this.match.isFinished || this.leaving) return;
    this.leaving = true;
    if (mode === 'rematch') this.scene.restart();
    else this.scene.start('CharacterSelectScene');
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
