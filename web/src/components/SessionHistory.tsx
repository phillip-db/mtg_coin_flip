import type { Coin } from "../types";
import CoinImage from "./CoinImage";

interface GameRecord {
  roundsWon: number;
  totalFlips: number;
  choice: Coin;
}

interface SessionHistoryProps {
  games: GameRecord[];
}

export type { GameRecord };

export default function SessionHistory({ games }: SessionHistoryProps) {
  if (games.length === 0) return null;

  return (
    <div className="panel session-history">
      <h3>Campaign Record</h3>
      <div className="session-entries">
        {games.map((g, i) => (
          <div key={i} className="session-entry">
            <span>
              Game {i + 1}: {g.roundsWon}/{g.totalFlips} flips won
            </span>
            <span className="session-choice">
              <CoinImage coin={g.choice} size={24} />
              {g.choice}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
