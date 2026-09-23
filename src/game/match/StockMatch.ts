import { isOutsideKoBounds, type KoBounds } from '../stage/KoBounds';

export const STARTING_STOCKS = 3;
export const RESPAWN_INVULNERABLE_MS = 1200;

export type MatchAction =
  | { type: 'recover'; index: number }
  | { type: 'respawn'; index: number }
  | { type: 'eliminated'; index: number };

/** ストックと、その時点で有効な KO 境界。キャラクターの移動や入力は持たない。 */
export class StockMatch {
  private readonly stocks: number[];
  private readonly invulnerableUntil: number[];
  private finished = false;
  private winnerId: 1 | 2 | null = null;

  constructor(playerCount: number, startingStocks = STARTING_STOCKS) {
    this.stocks = Array.from({ length: playerCount }, () => startingStocks);
    this.invulnerableUntil = Array.from({ length: playerCount }, () => 0);
  }

  stocksOf(index: number): number {
    return this.stocks[index] ?? 0;
  }

  isInvulnerable(index: number, now: number): boolean {
    return now < (this.invulnerableUntil[index] ?? 0);
  }

  get winner(): 1 | 2 | null {
    return this.winnerId;
  }

  get isFinished(): boolean {
    return this.finished;
  }

  update(now: number, positions: readonly { x: number; y: number }[], bounds: KoBounds): MatchAction[] {
    if (this.finished) return [];

    const actions: MatchAction[] = [];
    const eliminated: number[] = [];

    for (let index = 0; index < this.stocks.length; index += 1) {
      const position = positions[index];
      if ((this.stocks[index] ?? 0) <= 0 || !position) continue;
      if (!isOutsideKoBounds(position.x, position.y, bounds)) continue;

      if (this.isInvulnerable(index, now)) {
        actions.push({ type: 'recover', index });
        continue;
      }

      this.stocks[index] = (this.stocks[index] ?? 1) - 1;
      if ((this.stocks[index] ?? 0) <= 0) {
        eliminated.push(index);
        continue;
      }

      this.invulnerableUntil[index] = now + RESPAWN_INVULNERABLE_MS;
      actions.push({ type: 'respawn', index });
    }

    if (eliminated.length === 1) {
      this.finished = true;
      this.winnerId = eliminated[0] === 0 ? 2 : 1;
    } else if (eliminated.length > 1) {
      this.finished = true;
      this.winnerId = null;
    }

    for (const index of eliminated) actions.push({ type: 'eliminated', index });
    return actions;
  }
}
