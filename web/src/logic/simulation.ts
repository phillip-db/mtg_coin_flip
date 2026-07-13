import { Coin, Mode, type RoundResult, type SimConfig, type Summary } from "../types";

export function flipCoins(n: number): Coin[] {
  const sides = [Coin.HEADS, Coin.TAILS];
  return Array.from({ length: n }, () => sides[Math.floor(Math.random() * 2)]);
}

export function countResults(results: Coin[]): Record<Coin, number> {
  return {
    [Coin.HEADS]: results.filter((c) => c === Coin.HEADS).length,
    [Coin.TAILS]: results.filter((c) => c === Coin.TAILS).length,
  };
}

export function isWin(counts: Record<Coin, number>, choice: Coin): boolean {
  return counts[choice] > 0;
}

export function simulateOne(numCoins: number): RoundResult {
  const results = flipCoins(numCoins);
  const counts = countResults(results);
  return { results, counts };
}

export function simulateAll(config: SimConfig): RoundResult[] {
  const rounds: RoundResult[] = [];

  while (true) {
    const round = simulateOne(config.numCoins);
    rounds.push(round);

    if (config.mode === Mode.FIXED && rounds.length >= config.maxFlips!) {
      break;
    }
    if (config.mode === Mode.PERSISTENT && round.counts[config.choice] === 0) {
      break;
    }
  }

  return rounds;
}

export function summarize(
  rounds: RoundResult[],
  choice: Coin
): Summary {
  const totalCoins = rounds.reduce(
    (sum, r) => sum + r.results.length,
    0
  );
  const totalMatches = rounds.reduce((sum, r) => sum + r.counts[choice], 0);
  const roundsWon = rounds.filter((r) => isWin(r.counts, choice)).length;

  return {
    totalFlips: rounds.length,
    totalCoins,
    totalMatches,
    matchPct: (totalMatches / totalCoins) * 100,
    roundsWon,
  };
}
