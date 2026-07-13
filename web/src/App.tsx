import { useState, useCallback } from "react";
import { Mode, type SimConfig, type RoundResult, type Summary } from "./types";
import { simulateAll, simulateOne, summarize, isWin } from "./logic/simulation";
import SetupPanel from "./components/SetupPanel";
import CurrentRound from "./components/CurrentRound";
import HistoryLog from "./components/HistoryLog";
import SummaryPanel from "./components/SummaryPanel";
import "./App.css";

type View = "setup" | "simulation";

function App() {
  const [view, setView] = useState<View>("setup");
  const [config, setConfig] = useState<SimConfig | null>(null);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [currentRound, setCurrentRound] = useState<RoundResult | null>(null);
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);

  const checkIsLast = useCallback(
    (allRounds: RoundResult[], latest: RoundResult, cfg: SimConfig) => {
      if (cfg.mode === Mode.FIXED && allRounds.length >= cfg.maxFlips!) {
        return true;
      }
      if (cfg.mode === Mode.PERSISTENT && latest.counts[cfg.choice] === 0) {
        return true;
      }
      return false;
    },
    []
  );

  const handleStart = useCallback((cfg: SimConfig) => {
    setConfig(cfg);
    setRounds([]);
    setCurrentRound(null);
    setDone(false);
    setSummary(null);
    setView("simulation");

    if (cfg.pause) {
      const round = simulateOne(cfg.numCoins);
      setRounds([round]);
      setCurrentRound(round);
    } else {
      const allRounds = simulateAll(cfg);
      setRounds(allRounds);
      const s = summarize(allRounds, cfg.choice);
      setSummary(s);
      setDone(true);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (!config) return;
    const round = simulateOne(config.numCoins);
    setRounds((prev) => {
      const updated = [...prev, round];

      if (checkIsLast(updated, round, config)) {
        const won = isWin(round.counts, config.choice);
        if (config.mode === Mode.PERSISTENT && !won) {
          const s = summarize(updated, config.choice);
          setSummary(s);
          setDone(true);
        }
      }

      return updated;
    });
    setCurrentRound(round);
  }, [config, checkIsLast]);

  const handleFinish = useCallback(() => {
    if (!config) return;
    setRounds((prev) => {
      const s = summarize(prev, config.choice);
      setSummary(s);
      return prev;
    });
    setDone(true);
  }, [config]);

  const handleReset = useCallback(() => {
    setView("setup");
    setRounds([]);
    setCurrentRound(null);
    setDone(false);
    setSummary(null);
  }, []);

  const isLast =
    config && currentRound
      ? checkIsLast(rounds, currentRound, config)
      : false;

  return (
    <div className="app">
      <h1>MTG Coin Flip Simulator</h1>

      {view === "setup" && <SetupPanel onStart={handleStart} initialConfig={config} />}

      {view === "simulation" && config && (
        <>
          {config.pause && currentRound && !done && (
            <CurrentRound
              roundNum={rounds.length}
              result={currentRound}
              choice={config.choice}
              isLast={isLast}
              onNext={handleNext}
              onFinish={handleFinish}
            />
          )}

          {rounds.length > 0 && (
            <HistoryLog rounds={rounds} choice={config.choice} />
          )}

          {done && summary && (
            <SummaryPanel summary={summary} onReset={handleReset} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
