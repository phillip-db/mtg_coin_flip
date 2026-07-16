import { Coin, Mode, type Preset, type SimConfig } from "../types";

interface PresetSidebarProps {
  presets: Preset[];
  onLoad: (config: SimConfig) => void;
  onRun: (config: SimConfig) => void;
  onDelete: (id: string) => void;
}

function normalizeConfig(config: SimConfig): SimConfig {
  return {
    ...config,
    activeCardName: config.activeCardName ?? (config as unknown as Record<string, unknown>).selectedCardName as string | null ?? null,
    supportCardNames: config.supportCardNames ?? [],
  };
}

function describeConfig(config: SimConfig): string {
  const choice = config.choice === Coin.HEADS ? "Heads" : "Tails";
  const mode = config.mode === Mode.FIXED
    ? `${config.maxFlips} flips`
    : "Continuous";
  const pause = config.pause ? "Paused" : "Instant";
  let base = `${choice}, ${config.numCoins} coin${config.numCoins > 1 ? "s" : ""}, ${mode}, ${pause}`;
  const active = config.activeCardName ?? (config as unknown as Record<string, unknown>).selectedCardName as string | undefined;
  if (active) base += ` | ${active}`;
  const supports = config.supportCardNames ?? [];
  if (supports.length > 0) base += ` + ${supports.length} support`;
  return base;
}

export default function PresetSidebar({
  presets,
  onLoad,
  onRun,
  onDelete,
}: PresetSidebarProps) {
  if (presets.length === 0) {
    return (
      <div className="panel preset-sidebar">
        <h3>Spellbook</h3>
        <p className="preset-empty">Your spellbook is empty.</p>
      </div>
    );
  }

  return (
    <div className="panel preset-sidebar">
      <h3>Spellbook</h3>
      <div className="preset-list">
        {presets.map((p) => {
          const cfg = normalizeConfig(p.config);
          return (
            <div key={p.id} className="preset-item">
              <div className="preset-info">
                <span className="preset-name">{p.name}</span>
                <span className="preset-desc">{describeConfig(cfg)}</span>
              </div>
              <div className="preset-actions">
                <button
                  className="btn-small"
                  onClick={() => onLoad(cfg)}
                  title="Load into setup form"
                >
                  Load
                </button>
                <button
                  className="btn-small btn-run"
                  onClick={() => onRun(cfg)}
                  title="Run immediately"
                >
                  Run
                </button>
                <button
                  className="btn-small btn-delete"
                  onClick={() => onDelete(p.id)}
                  title="Delete preset"
                >
                  &times;
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
