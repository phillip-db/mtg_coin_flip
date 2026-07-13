import { Coin } from "../types";

interface CoinImageProps {
  coin: Coin;
}

export default function CoinImage({ coin }: CoinImageProps) {
  const isHeads = coin === Coin.HEADS;
  const bg = isHeads ? "#FFD700" : "#C0C0C0";
  const letter = isHeads ? "H" : "T";

  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="coin-image">
      <circle cx="40" cy="40" r="37" fill={bg} stroke="#333" strokeWidth="2" />
      <text
        x="40"
        y="40"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="36"
        fontWeight="bold"
        fill="#333"
      >
        {letter}
      </text>
    </svg>
  );
}
