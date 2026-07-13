import { useState, useCallback } from "react";
import { Mode, type SimConfig, type RoundResult, type Summary } from "./types";
import { simulateAll, simulateOne, summarize, isWin } from "./logic/simulation";
import SetupPanel from "./components/SetupPanel";
import CurrentRound from "./components/CurrentRound";
import HistoryLog from "./components/HistoryLog";
import SummaryPanel from "./components/SummaryPanel";
import SessionHistory, { type GameRecord } from "./components/SessionHistory";
import PresetSidebar from "./components/PresetSidebar";
import usePresets from "./hooks/usePresets";
import "./App.css";

type View = "setup" | "simulation";

function App() {
  const [view, setView] = useState<View>("setup");
  const [config, setConfig] = useState<SimConfig | null>(null);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [currentRound, setCurrentRound] = useState<RoundResult | null>(null);
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sessionGames, setSessionGames] = useState<GameRecord[]>([]);
  const [setupKey, setSetupKey] = useState(0);
  const [setupInitial, setSetupInitial] = useState<SimConfig | null>(null);
  const { presets, addPreset, deletePreset } = usePresets();

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

  const recordGame = useCallback((s: Summary, choice: SimConfig["choice"]) => {
    setSessionGames((prev) => [
      ...prev,
      { roundsWon: s.roundsWon, totalFlips: s.totalFlips, choice },
    ]);
  }, []);

  const handleStart = useCallback((cfg: SimConfig) => {
    setConfig(cfg);
    setSetupInitial(cfg);
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
      recordGame(s, cfg.choice);
    }
  }, [recordGame]);

  const handleNext = useCallback(() => {
    if (!config) return;
    const round = simulateOne(config.numCoins);
    const updated = [...rounds, round];
    setRounds(updated);
    setCurrentRound(round);

    if (checkIsLast(updated, round, config)) {
      if (config.mode === Mode.PERSISTENT && !isWin(round.counts, config.choice)) {
        const s = summarize(updated, config.choice);
        setSummary(s);
        setDone(true);
        recordGame(s, config.choice);
      }
    }
  }, [config, rounds, checkIsLast, recordGame]);

  const handleFinish = useCallback(() => {
    if (!config) return;
    const s = summarize(rounds, config.choice);
    setSummary(s);
    setDone(true);
    recordGame(s, config.choice);
  }, [config, rounds, recordGame]);

  const handleReset = useCallback(() => {
    setView("setup");
    setRounds([]);
    setCurrentRound(null);
    setDone(false);
    setSummary(null);
    setSetupKey((k) => k + 1);
  }, []);

  const handleLoadPreset = useCallback((cfg: SimConfig) => {
    setSetupInitial(cfg);
    setSetupKey((k) => k + 1);
  }, []);

  const isLast =
    config && currentRound
      ? checkIsLast(rounds, currentRound, config)
      : false;

  return (
    <div className="app">
      <h1>MTG Coin Flip Simulator</h1>

      {view === "setup" && (
        <div className="setup-layout">
          <SetupPanel
            key={setupKey}
            onStart={handleStart}
            onSavePreset={addPreset}
            initialConfig={setupInitial ?? config}
          />
          <PresetSidebar
            presets={presets}
            onLoad={handleLoadPreset}
            onRun={handleStart}
            onDelete={deletePreset}
          />
        </div>
      )}

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

      <SessionHistory games={sessionGames} />
    </div>
  );
}

export default App;
