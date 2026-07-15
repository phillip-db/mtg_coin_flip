import { Coin, type RoundResult } from "../types";
import { isWin } from "../logic/simulation";
import CoinImage from "./CoinImage";

interface CurrentRoundProps {
  roundNum: number;
  result: RoundResult;
  choice: Coin;
  isLast: boolean;
  onNext: () => void;
  onFinish: () => void;
}

export default function CurrentRound({
  roundNum,
  result,
  choice,
  isLast,
  onNext,
  onFinish,
}: CurrentRoundProps) {
  const matches = result.counts[choice];
  const total = result.results.length;
  const won = isWin(result.counts, choice);

  return (
    <div className="panel current-round">
      <h3>Flip {roundNum}</h3>
      <div className="coin-row">
        {result.results.map((coin, i) => (
          <CoinImage key={i} coin={coin} />
        ))}
      </div>
      <p className="match-count">
        {matches}/{total} landed on {choice}
      </p>
      <p className={`win-label ${won ? "won" : "lost"}`}>
        {won ? "Victory!" : "Defeat!"}
      </p>
      <button className="btn-primary" onClick={isLast ? onFinish : onNext}>
        {isLast ? "Reveal Fate" : "Flip Again"}
      </button>
    </div>
  );
}
