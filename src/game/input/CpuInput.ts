import type { AttackDefinition, AttackMotion } from '../combat/AttackDefinition';
import type { CharacterDefinition } from '../characters/CharacterDefinition';
import type { InputSource } from './InputSource';
import type { CpuProfile } from './CpuProfile';
import { neutralInput, type PlayerInputState } from './PlayerInput';

export type CpuStateName = 'approach' | 'attack' | 'retreat' | 'jump' | 'special';

export type CpuSense = {
  now: number;
  self: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    landed: boolean;
    attacking: boolean;
    stats: CharacterDefinition;
  };
  opponent: { x: number; y: number };
  ko: { left: number; right: number };
};

/**
 * 2P の入力だけを作る。Fighter は CPU かどうかを見ない。
 * 判断は 150〜250ms ごと。その間は横移動だけを維持する。
 * 下への落下復帰はしない。上必殺は、相手が上にいるときと空中の位置取りに使う。
 */
export class CpuInput implements InputSource {
  private senseData: CpuSense | null = null;
  private nextThinkAt = 0;
  private heldMoveX = 0;
  private state: CpuStateName = 'approach';
  private airJumps = 0;
  private usedRise = false;
  private wasLanded = true;
  private waitingAfterAttack = false;
  private targetDistance = 0;
  private edgeDanger = false;
  private edgeLatched = false;

  constructor(private readonly profile: CpuProfile) {}

  sense(data: CpuSense): void {
    this.senseData = data;
  }

  debugText(): string {
    const now = this.senseData?.now ?? 0;
    const cooldown = Math.max(0, Math.round(this.nextThinkAt - now));
    return [
      `CPU State: ${this.state}`,
      `Target distance: ${Math.round(this.targetDistance)}`,
      `Decision cooldown: ${cooldown}ms`,
      `Edge danger: ${this.edgeDanger}`
    ].join('\n');
  }

  read(): PlayerInputState {
    const data = this.senseData;
    if (!data) return neutralInput();

    this.noteLanding(data);
    this.targetDistance = Math.hypot(data.opponent.x - data.self.x, data.opponent.y - data.self.y);
    const retreat = this.retreatDirection(data);
    this.edgeDanger = retreat !== 0;

    if (data.self.attacking) {
      this.waitingAfterAttack = true;
    } else if (this.waitingAfterAttack) {
      this.waitingAfterAttack = false;
      this.nextThinkAt = Math.max(this.nextThinkAt, data.now + this.profile.postAttackWaitMs);
    }

    if (retreat !== 0) {
      this.heldMoveX = retreat;
      this.state = 'retreat';
      if (!data.self.attacking && data.now >= this.nextThinkAt) {
        this.nextThinkAt = data.now + this.reactionWait();
      }
      return this.held(false, false, false, 0);
    }

    if (data.now < this.nextThinkAt || data.self.attacking) {
      return this.held(false, false, false, 0);
    }

    const decision = this.think(data);
    this.heldMoveX = decision.moveX;
    this.state = decision.state;
    if (decision.jump) this.airJumps += 1;
    if (decision.rise) this.usedRise = true;
    this.nextThinkAt = data.now + this.reactionWait();
    return this.held(decision.jump, decision.attack, decision.special, decision.moveY);
  }

  destroy(): void {
    this.senseData = null;
  }

  private think(data: CpuSense): Decision {
    const dx = data.opponent.x - data.self.x;
    const dy = data.opponent.y - data.self.y;
    const absX = Math.abs(dx);
    const toward = absX < 12 ? this.heldMoveX : Math.sign(dx);

    if (Math.random() < this.profile.mistakeChance) {
      const coast = this.heldMoveX === 0 ? toward : this.heldMoveX;
      return { moveX: coast, moveY: 0, jump: false, attack: false, special: false, rise: false, state: 'approach' };
    }

    const close = this.closeRange(data.self.stats);
    const nearHeight = Math.abs(dy) < 96;
    const clearlyAbove = dy < -80;
    if (clearlyAbove) {
      const vertical = this.verticalMove(data, toward, absX, dy);
      if (vertical) return vertical;
    }

    if (absX <= close && nearHeight && Math.random() < this.profile.attackChance) {
      return { moveX: toward, moveY: 0, jump: false, attack: true, special: false, rise: false, state: 'attack' };
    }

    if (!clearlyAbove) {
      const vertical = this.verticalMove(data, toward, absX, dy);
      if (vertical) return vertical;
    }

    const band = sideSpecialBand(data.self.stats, close);
    const specialMin = band ? Math.max(band.min, close + 8) : 0;
    const grounded = data.self.landed || band?.kind === 'dash';
    if (
      band &&
      grounded &&
      absX >= specialMin &&
      absX <= band.max &&
      nearHeight &&
      !this.wouldLeaveSafeZone(data, toward, band.travel) &&
      Math.random() < this.profile.specialChance
    ) {
      return { moveX: toward, moveY: 0, jump: false, attack: false, special: true, rise: false, state: 'special' };
    }

    return { moveX: toward, moveY: 0, jump: false, attack: false, special: false, rise: false, state: 'approach' };
  }

  /** 相手が上ならジャンプ。空中の上必殺は上昇の強さで使い分ける。 */
  private verticalMove(data: CpuSense, toward: number, absX: number, dy: number): Decision | null {
    const stats = data.self.stats;
    const opponentHigher = dy < -48;
    const rise = riseVelocity(stats.upSpecial);
    const eager = rise !== null && rise < -900;
    const canRise = rise !== null && !this.usedRise;
    const reach = eager ? 380 : 280;

    if (!data.self.landed && canRise && absX < reach) {
      const balloon = eager && (opponentHigher || absX < 260 || this.airJumps >= 1);
      const spring = !eager && this.airJumps >= 1 && dy < 36;
      if ((balloon || spring) && Math.random() < this.profile.jumpChance) {
        return { moveX: toward, moveY: -1, jump: false, attack: false, special: true, rise: true, state: 'special' };
      }
    }

    if (opponentHigher && absX < 320 && this.airJumps < stats.maxJumps && Math.random() < this.profile.jumpChance) {
      return { moveX: toward, moveY: -1, jump: true, attack: false, special: false, rise: false, state: 'jump' };
    }
    return null;
  }

  /** 遅い移動速度ほど、少し手前を近距離とみなす。 */
  private closeRange(stats: CharacterDefinition): number {
    const cautious = 280 / Math.max(stats.moveSpeed, 1);
    const wobble = (Math.random() * 2 - 1) * 16;
    return Math.max(48, this.profile.preferredRange * cautious + wobble);
  }

  private retreatDirection(data: CpuSense): number {
    const margin = this.profile.edgeSafetyDistance;
    const limit = this.edgeLatched ? margin + 80 : margin;
    const nearEdge = data.self.x < data.ko.left + limit || data.self.x > data.ko.right - limit;
    this.edgeLatched = nearEdge;
    if (!nearEdge) return 0;
    const center = (data.ko.left + data.ko.right) / 2;
    return Math.sign(center - data.self.x);
  }

  private wouldLeaveSafeZone(data: CpuSense, direction: number, travel: number): boolean {
    if (direction === 0 || travel <= 0) return false;
    const margin = this.profile.edgeSafetyDistance;
    const dest = data.self.x + direction * travel;
    return dest < data.ko.left + margin || dest > data.ko.right - margin;
  }

  private noteLanding(data: CpuSense): void {
    if (data.self.landed && !this.wasLanded) {
      this.airJumps = 0;
      this.usedRise = false;
    }
    this.wasLanded = data.self.landed;
  }

  private reactionWait(): number {
    const jitter = (Math.random() * 2 - 1) * this.profile.reactionJitterMs;
    return clamp(this.profile.reactionMs + jitter, 150, 250);
  }

  private held(jump: boolean, attack: boolean, special: boolean, moveY: number): PlayerInputState {
    return {
      moveX: this.heldMoveX,
      moveY,
      jump,
      attack,
      special,
      dodge: false
    };
  }
}

type Decision = {
  moveX: number;
  moveY: number;
  jump: boolean;
  attack: boolean;
  special: boolean;
  rise: boolean;
  state: CpuStateName;
};

type SideBand = { kind: 'dash' | 'slam'; min: number; max: number; travel: number };

/** 横必殺の届く距離と、出したら進む見込み。上必殺（rise）はここには入れない。 */
function sideSpecialBand(stats: CharacterDefinition, close: number): SideBand | null {
  const attack = stats.specialAttack;
  const motion: AttackMotion | null = attack?.motion ?? null;
  if (!attack || !motion) return null;
  if (motion.kind === 'dash') {
    const min = close + 18;
    const max = Math.min(close * 3.3, motion.speed * 0.45);
    if (max < min + 12) return null;
    return { kind: 'dash', min, max, travel: motion.speed * (attack.activeMs / 1000) + 32 };
  }
  if (motion.kind === 'slam') {
    const min = close + 12;
    const max = Math.max(close * 2.3, motion.initialVelocityX * 0.9);
    if (max < min + 12) return null;
    return { kind: 'slam', min, max, travel: motion.initialVelocityX * 0.55 + 24 };
  }
  return null;
}

function riseVelocity(attack: AttackDefinition | null): number | null {
  const motion: AttackMotion | null = attack?.motion ?? null;
  if (!motion || motion.kind !== 'rise') return null;
  return motion.velocity;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
