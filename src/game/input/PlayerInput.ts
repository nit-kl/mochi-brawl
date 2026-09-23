import type { InputSource } from './InputSource';

/** 全デバイス共通の入力。キャラクター制御はこの型だけを見る。 */
export type PlayerInputState = {
  /** -1 左、+1 右 */
  moveX: number;
  /** -1 上、+1 下 */
  moveY: number;
  jump: boolean;
  attack: boolean;
  special: boolean;
  dodge: boolean;
};

export function neutralInput(): PlayerInputState {
  return {
    moveX: 0,
    moveY: 0,
    jump: false,
    attack: false,
    special: false,
    dodge: false
  };
}

function clampUnit(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

/**
 * KeyboardInput / TouchInput / CpuInput を1つの PlayerInputState にまとめる。
 * read() は1フレームに1回だけ呼ぶ。jump、attack、special は押したフレームだけ true になる。
 */
export class PlayerInput {
  private readonly sources: InputSource[];

  constructor(sources: InputSource[]) {
    this.sources = sources;
  }

  read(): PlayerInputState {
    let moveX = 0;
    let moveY = 0;
    let jump = false;
    let attack = false;
    let special = false;
    let dodge = false;

    for (const source of this.sources) {
      const state = source.read();
      if (Math.abs(state.moveX) > Math.abs(moveX)) moveX = state.moveX;
      if (Math.abs(state.moveY) > Math.abs(moveY)) moveY = state.moveY;
      jump = jump || state.jump;
      attack = attack || state.attack;
      special = special || state.special;
      dodge = dodge || state.dodge;
    }

    return {
      moveX: clampUnit(moveX),
      moveY: clampUnit(moveY),
      jump,
      attack,
      special,
      dodge
    };
  }

  destroy(): void {
    for (const source of this.sources) source.destroy();
    this.sources.length = 0;
  }
}
