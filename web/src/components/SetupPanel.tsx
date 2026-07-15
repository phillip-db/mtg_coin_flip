import { useState } from "react";
import { Coin, Mode, type SimConfig } from "../types";
import { getCardEffectText, getCardConstraints, type CardConstraints } from "../data/cardEffects";
import { highlightCardText } from "../utils/highlightCardText";

interface SetupPanelProps {
  onStart: (config: SimConfig) => void;
  onSavePreset: (name: string, config: SimConfig) => void;
  initialConfig?: SimConfig | null;
  activeCardName: string | null;
  supportCardNames: string[];
  onClearActive: () => void;
  onRemoveSupport: (name: string) => void;
}

export default function SetupPanel({
  onStart,
  onSavePreset,
  initialConfig,
  activeCardName,
  supportCardNames,
  onClearActive,
  onRemoveSupport,
}: SetupPanelProps) {
  const [choice, setChoice] = useState<Coin>(initialConfig?.choice ?? Coin.HEADS);
  const [numCoins, setNumCoins] = useState(initialConfig?.numCoins ?? 1);
  const [mode, setMode] = useState<Mode>(initialConfig?.mode ?? Mode.FIXED);
  const [maxFlips, setMaxFlips] = useState(initialConfig?.maxFlips ?? 1);
  const [pause, setPause] = useState(initialConfig?.pause ?? true);
  const [presetName, setPresetName] = useState("");

  const constraints: CardConstraints | undefined = activeCardName
    ? getCardConstraints(activeCardName)
    : undefined;

  const hasThumb = supportCardNames.includes("Krark's Thumb");
  const coinsLocked = constraints?.numCoins != null || hasThumb;
  const modeLocked = constraints?.mode != null;
  const flipsLocked = constraints?.maxFlips != null;
  const baseNumCoins = constraints?.numCoins ?? numCoins;
  const effectiveNumCoins = hasThumb ? baseNumCoins * 2 : baseNumCoins;
  const effectiveMode = constraints?.mode ?? mode;
  const effectiveMaxFlips = constraints?.maxFlips ?? maxFlips;

  const currentConfig = (): SimConfig => ({
    choice,
    numCoins: effectiveNumCoins,
    mode: effectiveMode,
    maxFlips: effectiveMode === Mode.FIXED ? effectiveMaxFlips : null,
    pause,
    activeCardName,
    supportCardNames,
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
      <h2>Prepare Your Spell</h2>

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
          value={effectiveNumCoins}
          onChange={(e) => setNumCoins(Math.max(1, Number(e.target.value)))}
          disabled={coinsLocked}
        />
        {coinsLocked && (
          <span className="field-lock" title={hasThumb ? "Doubled by Krark's Thumb" : `Locked by ${activeCardName}`}>&#128274;</span>
        )}
      </label>

      <fieldset disabled={modeLocked}>
        <legend>Mode {modeLocked && <span className="field-lock" title={`Locked by ${activeCardName}`}>&#128274;</span>}</legend>
        <label>
          <input
            type="radio"
            name="mode"
            checked={effectiveMode === Mode.FIXED}
            onChange={() => setMode(Mode.FIXED)}
          />
          Fixed
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            checked={effectiveMode === Mode.PERSISTENT}
            onChange={() => setMode(Mode.PERSISTENT)}
          />
          Continuous
        </label>
      </fieldset>

      {effectiveMode === Mode.FIXED && (
        <label className="field">
          <span>Number of flips:</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={effectiveMaxFlips}
            onChange={(e) => setMaxFlips(Math.max(1, Number(e.target.value)))}
            disabled={flipsLocked}
          />
          {flipsLocked && (
            <span className="field-lock" title={`Locked by ${activeCardName}`}>&#128274;</span>
          )}
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

      {(activeCardName || supportCardNames.length > 0) && (
        <div className="selected-cards-display">
          {activeCardName && (
            <div className="selected-card-item selected-card-active">
              <div className="selected-card-header">
                <span className="selected-card-label">Active Effect</span>
                <button type="button" className="btn-small btn-delete" onClick={onClearActive} title="Remove">
                  &times;
                </button>
              </div>
              <span className="selected-card-name">{activeCardName}</span>
              {getCardEffectText(activeCardName) && (
                <p className="selected-card-effect">{highlightCardText(getCardEffectText(activeCardName)!)}</p>
              )}
            </div>
          )}
          {supportCardNames.length > 0 && (
            <div className="selected-card-item selected-card-support">
              <span className="selected-card-label">Supporting Effects</span>
              {supportCardNames.map((name) => (
                <div key={name} className="support-card-row">
                  <span className="selected-card-name">{name}</span>
                  <button type="button" className="btn-small btn-delete" onClick={() => onRemoveSupport(name)} title="Remove">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button type="submit" className="btn-primary">
        Cast the Coins
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
