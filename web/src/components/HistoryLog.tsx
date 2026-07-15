import { useEffect, useRef } from "react";
import { Coin, type RoundResult } from "../types";
import { isWin } from "../logic/simulation";

interface HistoryLogProps {
  rounds: RoundResult[];
  choice: Coin;
}

export default function HistoryLog({ rounds, choice }: HistoryLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rounds.length]);

  return (
    <div className="panel history-log">
      <h3>Chronicle</h3>
      <div className="history-scroll">
        {rounds.map((r, i) => {
          const matches = r.counts[choice];
          const total = r.results.length;
          const won = isWin(r.counts, choice);
          return (
            <div key={i} className="history-entry">
              Round {i + 1}: {matches}/{total} {choice}{" "}
              <span className={won ? "won" : "lost"}>
                {won ? "\u2713 won" : "\u2717 lost"}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}
