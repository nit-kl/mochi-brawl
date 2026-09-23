import type { AttackDefinition, AttackMotion } from '../combat/AttackDefinition';
import type { CharacterDefinition } from '../characters/CharacterDefinition';
import type { InputSource } from './InputSource';
import type { CpuProfile } from './CpuProfile';
import { neutralInput, type PlayerInputState } from './PlayerInput';

export type CpuStateName = 'approach' | 'attack' | 'recover' | 'jump' | 'special';

type Surface = {
  kind: 'main' | 'side';
  centerX: number;
  top: number;
  left: number;
  right: number;
};

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
  platforms: readonly Surface[];
  ko: { left: number; right: number };
};

/**
 * 2P の入力だけを作る。Fighter は CPU かどうかを見ない。
 * 判断は 100〜250ms ごと。その間は横移動だけを維持する。
 */
export class CpuInput implements InputSource {
  private senseData: CpuSense | null = null;
  private nextThinkAt = 0;
  private heldMoveX = 0;
  private state: CpuStateName = 'approach';
  private airJumps = 0;
  private usedRise = false;

  constructor(private readonly profile: CpuProfile) {}

  sense(data: CpuSense): void {
    this.senseData = data;
  }

  debugText(): string {
    return `CPU State: ${this.state}`;
  }

  read(): PlayerInputState {
    const data = this.senseData;
    if (!data) return neutralInput();
    if (data.self.landed) {
      this.airJumps = 0;
      this.usedRise = false;
    }
    if (data.now < this.nextThinkAt || data.self.attacking) {
      return this.held(false, false, false, 0);
    }
    const decision = this.think(data);
    this.heldMoveX = decision.moveX;
    this.state = decision.state;
    if (decision.jump) this.airJumps += 1;
    if (decision.rise) this.usedRise = true;
    const extra = decision.attack || decision.special ? this.profile.postAttackWaitMs : 0;
    this.nextThinkAt = data.now + this.reactionWait() + extra;
    return this.held(decision.jump, decision.attack, decision.special, decision.moveY);
  }

  destroy(): void {
    this.senseData = null;
  }

  private think(data: CpuSense): Decision {
    const dx = data.opponent.x - data.self.x;
    const dy = data.opponent.y - data.self.y;
    const absX = Math.abs(dx);
    const toward = absX < 10 ? 0 : Math.sign(dx);
    const home = nearestSurface(data.self.x, data.platforms);

    if (home && this.needsRecovery(data, home)) {
      return this.recover(data, home);
    }

    const edge = this.horizontalHazard(data);
    if (edge !== 0) {
      return { moveX: edge, moveY: 0, jump: false, attack: false, special: false, rise: false, state: 'recover' };
    }

    if (Math.random() < this.profile.mistakeChance) {
      return { moveX: toward === 0 ? 0 : -toward, moveY: 0, jump: false, attack: false, special: false, rise: false, state: 'approach' };
    }

    const close = this.profile.preferredDistance;
    const sameHeight = Math.abs(dy) < 72;
    const opponentHigher = dy < -64;
    if (opponentHigher && absX < 280 && this.airJumps < data.self.stats.maxJumps) {
      return { moveX: toward, moveY: -1, jump: true, attack: false, special: false, rise: false, state: 'jump' };
    }

    if (absX <= close && sameHeight && Math.random() < this.profile.attackChance) {
      return { moveX: toward, moveY: 0, jump: false, attack: true, special: false, rise: false, state: 'attack' };
    }

    const band = sideSpecialBand(data.self.stats, close);
    const specialMin = band ? Math.max(band.min, close + 8) : 0;
    if (band && absX >= specialMin && absX <= band.max && sameHeight && Math.random() < this.profile.specialChance) {
      return { moveX: toward, moveY: 0, jump: false, attack: false, special: true, rise: false, state: 'special' };
    }

    return { moveX: toward, moveY: 0, jump: false, attack: false, special: false, rise: false, state: 'approach' };
  }

  private recover(data: CpuSense, home: Surface): Decision {
    const dx = home.centerX - data.self.x;
    const moveX = Math.abs(dx) < 12 ? 0 : Math.sign(dx);
    const outside = this.outsideDistance(data.self.x, home);
    const falling = data.self.velocityY > 20 || data.self.y > home.top - 16;
    const rise = riseVelocity(data.self.stats.upSpecial);
    const eager = rise !== null && rise < -900;
    const jumpsLeft = data.self.stats.maxJumps - this.airJumps;
    const miss = Math.random() < this.profile.mistakeChance;
    if (miss) {
      return { moveX, moveY: 0, jump: false, attack: false, special: false, rise: false, state: 'recover' };
    }

    const far = outside > 70;
    const useRise =
      rise !== null &&
      !this.usedRise &&
      !data.self.landed &&
      (eager ? this.airJumps >= 1 && far : this.airJumps >= data.self.stats.maxJumps);
    if (useRise) {
      return { moveX, moveY: -1, jump: false, attack: false, special: true, rise: true, state: 'recover' };
    }
    if (!data.self.landed && falling && jumpsLeft > 0) {
      return { moveX, moveY: -1, jump: true, attack: false, special: false, rise: false, state: 'recover' };
    }
    if (data.self.landed && jumpsLeft > 0 && data.self.y > home.top + 8) {
      return { moveX, moveY: -1, jump: true, attack: false, special: false, rise: false, state: 'recover' };
    }
    return { moveX, moveY: 0, jump: false, attack: false, special: false, rise: false, state: 'recover' };
  }

  /** 左右の KO 線に近いときは中央へ歩く。下へ落ちた復帰ではない。 */
  private horizontalHazard(data: CpuSense): number {
    const margin = 96;
    if (data.self.x < data.ko.left + margin) return 1;
    if (data.self.x > data.ko.right - margin) return -1;
    return 0;
  }

  private needsRecovery(data: CpuSense, home: Surface): boolean {
    const outside = this.outsideDistance(data.self.x, home) > this.profile.recoveryThreshold;
    const fallingPast =
      !data.self.landed &&
      data.self.y > home.top + 28 &&
      (data.self.x < home.left - 8 || data.self.x > home.right + 8);
    return outside || fallingPast;
  }

  private outsideDistance(x: number, home: Surface): number {
    if (x < home.left) return home.left - x;
    if (x > home.right) return x - home.right;
    return 0;
  }

  private reactionWait(): number {
    const jitter = (Math.random() * 2 - 1) * this.profile.reactionJitterMs;
    return clamp(this.profile.reactionMs + jitter, 100, 250);
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

function nearestSurface(x: number, platforms: readonly Surface[]): Surface | null {
  let best: Surface | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const platform of platforms) {
    const dist = x < platform.left ? platform.left - x : x > platform.right ? x - platform.right : 0;
    const rank = dist + (platform.kind === 'main' ? -0.5 : 0);
    if (rank < bestDist) {
      best = platform;
      bestDist = rank;
    }
  }
  return best;
}

/** 横必殺の届く距離。上必殺（rise）は復帰側で見る。 */
function sideSpecialBand(stats: CharacterDefinition, close: number): { min: number; max: number } | null {
  const motion = stats.specialAttack?.motion ?? null;
  if (!motion) return null;
  if (motion.kind === 'dash') return { min: close + 24, max: close * 3.2 };
  if (motion.kind === 'slam') return { min: close * 0.55, max: Math.max(close * 2.4, motion.initialVelocityX * 0.85) };
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
