import { useState } from "react";
import { Coin, Mode, type SimConfig } from "../types";

interface SetupPanelProps {
  onStart: (config: SimConfig) => void;
}

export default function SetupPanel({ onStart }: SetupPanelProps) {
  const [choice, setChoice] = useState<Coin>(Coin.HEADS);
  const [numCoins, setNumCoins] = useState(1);
  const [mode, setMode] = useState<Mode>(Mode.FIXED);
  const [maxFlips, setMaxFlips] = useState(1);
  const [pause, setPause] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      choice,
      numCoins,
      mode,
      maxFlips: mode === Mode.FIXED ? maxFlips : null,
      pause,
    });
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
    </form>
  );
}
