import { useState } from "react";
import { Coin, Mode, type SimConfig } from "../types";

interface SetupPanelProps {
  onStart: (config: SimConfig) => void;
  onSavePreset: (name: string, config: SimConfig) => void;
  initialConfig?: SimConfig | null;
}

export default function SetupPanel({
  onStart,
  onSavePreset,
  initialConfig,
}: SetupPanelProps) {
  const [choice, setChoice] = useState<Coin>(initialConfig?.choice ?? Coin.HEADS);
  const [numCoins, setNumCoins] = useState(initialConfig?.numCoins ?? 1);
  const [mode, setMode] = useState<Mode>(initialConfig?.mode ?? Mode.FIXED);
  const [maxFlips, setMaxFlips] = useState(initialConfig?.maxFlips ?? 1);
  const [pause, setPause] = useState(initialConfig?.pause ?? true);
  const [presetName, setPresetName] = useState("");

  const currentConfig = (): SimConfig => ({
    choice,
    numCoins,
    mode,
    maxFlips: mode === Mode.FIXED ? maxFlips : null,
    pause,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(currentConfig());
  };

  const handleSavePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    onSavePreset(name, currentConfig());
    setPresetName("");
  };

  return (
    <form className="panel setup-panel" onSubmit={handleSubmit}>
      <h2>Setup Simulation</h2>

      <fieldset>
        <legend>Choice</legend>
        <label>
          <input
            type="radio"
            name="choice"
            checked={choice === Coin.HEADS}
            onChange={() => setChoice(Coin.HEADS)}
          />
          Heads
        </label>
        <label>
          <input
            type="radio"
            name="choice"
            checked={choice === Coin.TAILS}
            onChange={() => setChoice(Coin.TAILS)}
          />
          Tails
        </label>
      </fieldset>

      <label className="field">
        <span>Coins per flip:</span>
        <input
          type="number"
          min={1}
          max={100}
          value={numCoins}
          onChange={(e) => setNumCoins(Math.max(1, Number(e.target.value)))}
        />
      </label>

      <fieldset>
        <legend>Mode</legend>
        <label>
          <input
            type="radio"
            name="mode"
            checked={mode === Mode.FIXED}
            onChange={() => setMode(Mode.FIXED)}
          />
          Fixed
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            checked={mode === Mode.PERSISTENT}
            onChange={() => setMode(Mode.PERSISTENT)}
          />
          Continuous
        </label>
      </fieldset>

      {mode === Mode.FIXED && (
        <label className="field">
          <span>Number of flips:</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={maxFlips}
            onChange={(e) => setMaxFlips(Math.max(1, Number(e.target.value)))}
          />
        </label>
      )}

      <label className="field checkbox-field">
        <input
          type="checkbox"
          checked={pause}
          onChange={(e) => setPause(e.target.checked)}
        />
        <span>Pause between flips (show coin images)</span>
      </label>

      <button type="submit" className="btn-primary">
        Start Flipping
      </button>

      <div className="save-preset">
        <input
          type="text"
          placeholder="Preset name..."
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSavePreset(); } }}
        />
        <button
          type="button"
          className="btn-small"
          onClick={handleSavePreset}
          disabled={!presetName.trim()}
        >
          Save Preset
        </button>
      </div>
    </form>
  );
}
