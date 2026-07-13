export const Coin = {
  HEADS: "HEADS",
  TAILS: "TAILS",
} as const;

export type Coin = (typeof Coin)[keyof typeof Coin];

export const Mode = {
  FIXED: "FIXED",
  PERSISTENT: "PERSISTENT",
} as const;

export type Mode = (typeof Mode)[keyof typeof Mode];

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
