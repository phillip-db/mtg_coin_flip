export enum Coin {
  HEADS = "HEADS",
  TAILS = "TAILS",
}

export enum Mode {
  FIXED = "FIXED",
  PERSISTENT = "PERSISTENT",
}

export interface RoundResult {
  results: Coin[];
  counts: Record<Coin, number>;
}

export interface Summary {
  totalFlips: number;
  totalCoins: number;
  totalMatches: number;
  matchPct: number;
  roundsWon: number;
}

export interface SimConfig {
  choice: Coin;
  numCoins: number;
  mode: Mode;
  maxFlips: number | null;
  pause: boolean;
}
