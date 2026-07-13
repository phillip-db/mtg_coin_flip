import type { Summary } from "../types";

interface SummaryPanelProps {
  summary: Summary;
  onReset: () => void;
}

export default function SummaryPanel({ summary, onReset }: SummaryPanelProps) {
  return (
    <div className="panel summary-panel">
      <h3>Summary</h3>
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
      <button className="btn-primary" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
