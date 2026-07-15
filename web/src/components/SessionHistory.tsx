import type { Coin } from "../types";
import CoinImage from "./CoinImage";
import { evaluateOutcome, evaluateSupport } from "../data/cardEffects";
import { highlightCardText } from "../utils/highlightCardText";

interface GameRecord {
  roundsWon: number;
  totalFlips: number;
  choice: Coin;
  activeCardName?: string | null;
  supportCardNames?: string[];
}

interface SessionHistoryProps {
  games: GameRecord[];
}

export type { GameRecord };

function buildSummaryForHistory(g: GameRecord) {
  return {
    totalFlips: g.totalFlips,
    totalCoins: g.totalFlips,
    totalMatches: g.roundsWon,
    matchPct: g.totalFlips > 0 ? (g.roundsWon / g.totalFlips) * 100 : 0,
    roundsWon: g.roundsWon,
  };
}

export default function SessionHistory({ games }: SessionHistoryProps) {
  if (games.length === 0) return null;

  return (
    <div className="panel session-history">
      <h3>Campaign Record</h3>
      <div className="session-entries">
        {games.map((g, i) => {
          const s = buildSummaryForHistory(g);
          const activeOutcome = g.activeCardName
            ? evaluateOutcome(g.activeCardName, s)
            : null;
          const supportLines = (g.supportCardNames ?? [])
            .map((name) => evaluateSupport(name, s))
            .filter(Boolean);
          const hasCards = g.activeCardName || supportLines.length > 0;

          return (
            <div key={i} className="session-entry">
              <div className="session-entry-main">
                <span>
                  Game {i + 1}: {g.roundsWon}/{g.totalFlips} flips won
                </span>
                <span className="session-choice">
                  <CoinImage coin={g.choice} size={24} />
                  {g.choice}
                </span>
              </div>
              {hasCards && (
                <div className="session-card-outcome">
                  {g.activeCardName && (
                    <span className="session-card-name">{g.activeCardName}</span>
                  )}
                  {activeOutcome && (
                    <span className="session-card-result">{highlightCardText(activeOutcome)}</span>
                  )}
                  {supportLines.map((line, j) => (
                    <span key={j} className="session-card-support">{highlightCardText(line!)}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
