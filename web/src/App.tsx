import { useState, useCallback } from "react";
import { Mode, type SimConfig, type RoundResult, type Summary } from "./types";
import { simulateAll, simulateOne, summarize, isWin } from "./logic/simulation";
import SetupPanel from "./components/SetupPanel";
import CurrentRound from "./components/CurrentRound";
import HistoryLog from "./components/HistoryLog";
import SummaryPanel from "./components/SummaryPanel";
import SessionHistory, { type GameRecord } from "./components/SessionHistory";
import PresetSidebar from "./components/PresetSidebar";
import CardSidebar from "./components/CardSidebar";
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
  const [activeCardName, setActiveCardName] = useState<string | null>(null);
  const [supportCardNames, setSupportCardNames] = useState<string[]>([]);
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

  const recordGame = useCallback((s: Summary, cfg: SimConfig) => {
    setSessionGames((prev) => [
      ...prev,
      {
        roundsWon: s.roundsWon,
        totalFlips: s.totalFlips,
        choice: cfg.choice,
        activeCardName: cfg.activeCardName,
        supportCardNames: cfg.supportCardNames,
      },
    ]);
  }, []);

  const handleStart = useCallback((cfg: SimConfig) => {
    setConfig(cfg);
    setSetupInitial(cfg);
    setActiveCardName(cfg.activeCardName);
    setSupportCardNames(cfg.supportCardNames);
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
      recordGame(s, cfg);
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
        recordGame(s, config);
      }
    }
  }, [config, rounds, checkIsLast, recordGame]);

  const handleFinish = useCallback(() => {
    if (!config) return;
    const s = summarize(rounds, config.choice);
    setSummary(s);
    setDone(true);
    recordGame(s, config);
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
    setActiveCardName(cfg.activeCardName);
    setSupportCardNames(cfg.supportCardNames ?? []);
    setSetupKey((k) => k + 1);
  }, []);

  const handleToggleSupport = useCallback((name: string) => {
    setSupportCardNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);

  const isLast =
    config && currentRound
      ? checkIsLast(rounds, currentRound, config)
      : false;

  return (
    <div className="app-layout">
      <CardSidebar
        activeCardName={activeCardName}
        supportCardNames={supportCardNames}
        onSelectActive={setActiveCardName}
        onToggleSupport={handleToggleSupport}
      />

      <div className="app">
        <h1>MTG Coin Flip Simulator</h1>
        <hr className="title-divider" />

        {view === "setup" && (
          <div className="setup-layout">
            <SetupPanel
              key={setupKey}
              onStart={handleStart}
              onSavePreset={addPreset}
              initialConfig={setupInitial ?? config}
              activeCardName={activeCardName}
              supportCardNames={supportCardNames}
              onClearActive={() => setActiveCardName(null)}
              onRemoveSupport={(name) =>
                setSupportCardNames((prev) => prev.filter((n) => n !== name))
              }
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
              <SummaryPanel
                summary={summary}
                onReset={handleReset}
                activeCardName={config.activeCardName}
                supportCardNames={config.supportCardNames}
              />
            )}
          </>
        )}

        <SessionHistory games={sessionGames} />
      </div>
    </div>
  );
}

export default App;
