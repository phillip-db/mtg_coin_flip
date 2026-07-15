import type { Summary } from "../types";
import { getCardEffect, evaluateOutcome, evaluateSupport } from "../data/cardEffects";
import { highlightCardText } from "../utils/highlightCardText";

interface SummaryPanelProps {
  summary: Summary;
  onReset: () => void;
  activeCardName?: string | null;
  supportCardNames?: string[];
}

export default function SummaryPanel({
  summary,
  onReset,
  activeCardName,
  supportCardNames = [],
}: SummaryPanelProps) {
  const activeEffect = activeCardName ? getCardEffect(activeCardName) : null;
  const activeOutcome = activeCardName ? evaluateOutcome(activeCardName, summary) : null;

  const supportOutcomes = supportCardNames
    .map((name) => ({ name, text: evaluateSupport(name, summary) }))
    .filter((s) => s.text != null);

  const hasCardContent = (activeEffect && activeOutcome) || supportOutcomes.length > 0;

  return (
    <div className="panel summary-panel">
      <h3>Final Tally</h3>
      <table className="summary-table">
        <tbody>
          <tr>
            <td>Total flips:</td>
            <td>{summary.totalFlips}</td>
          </tr>
          <tr>
            <td>Rounds won:</td>
            <td>
              {summary.roundsWon}/{summary.totalFlips}
            </td>
          </tr>
          <tr>
            <td>Total coins:</td>
            <td>{summary.totalCoins}</td>
          </tr>
          <tr>
            <td>Matches:</td>
            <td>
              {summary.totalMatches}/{summary.totalCoins} (
              {summary.matchPct.toFixed(1)}%)
            </td>
          </tr>
        </tbody>
      </table>

      {hasCardContent && (
        <div className="card-outcome">
          {activeEffect && activeOutcome && (
            <>
              <h4>{activeCardName}</h4>
              <p className="card-outcome-effect">{highlightCardText(activeEffect.effect)}</p>
              <p className="card-outcome-result">{highlightCardText(activeOutcome)}</p>
            </>
          )}

          {supportOutcomes.length > 0 && (
            <div className="card-outcome-support">
              <h4>Supporting Effects</h4>
              {supportOutcomes.map((s) => (
                <p key={s.name} className="card-outcome-support-line">{highlightCardText(s.text!)}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <button className="btn-primary" onClick={onReset}>
        Begin Anew
      </button>
    </div>
  );
}
