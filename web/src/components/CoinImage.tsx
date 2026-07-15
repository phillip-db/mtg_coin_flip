import { Coin } from "../types";

interface CoinImageProps {
  coin: Coin;
  size?: number;
}

export default function CoinImage({ coin, size = 80 }: CoinImageProps) {
  const isHeads = coin === Coin.HEADS;
  const id = isHeads ? "heads" : "tails";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="coin-image"
    >
      <defs>
        {isHeads ? (
          <radialGradient id={`bg-${id}-${size}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#f5e08c" />
            <stop offset="60%" stopColor="#c9a84c" />
            <stop offset="100%" stopColor="#8b7340" />
          </radialGradient>
        ) : (
          <radialGradient id={`bg-${id}-${size}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#d0d0d8" />
            <stop offset="60%" stopColor="#9a9aa8" />
            <stop offset="100%" stopColor="#5c5c6a" />
          </radialGradient>
        )}
      </defs>

      {/* Outer ring */}
      <circle
        cx="50"
        cy="50"
        r="47"
        fill="none"
        stroke={isHeads ? "#6b5a34" : "#4a4a56"}
        strokeWidth="2"
      />

      {/* Coin body */}
      <circle
        cx="50"
        cy="50"
        r="44"
        fill={`url(#bg-${id}-${size})`}
        stroke={isHeads ? "#a6882e" : "#6a6a78"}
        strokeWidth="1.5"
      />

      {/* Inner decorative ring */}
      <circle
        cx="50"
        cy="50"
        r="36"
        fill="none"
        stroke={isHeads ? "rgba(107,90,52,0.5)" : "rgba(74,74,86,0.5)"}
        strokeWidth="1"
        strokeDasharray="4 3"
      />

      {isHeads ? (
        <>
          {/* Sunburst rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="50"
              y1="50"
              x2={50 + 30 * Math.cos((angle * Math.PI) / 180)}
              y2={50 + 30 * Math.sin((angle * Math.PI) / 180)}
              stroke="rgba(107,90,52,0.25)"
              strokeWidth="1"
            />
          ))}
          {/* Sun symbol */}
          <circle
            cx="50"
            cy="44"
            r="8"
            fill="none"
            stroke="#6b5a34"
            strokeWidth="1.5"
          />
          <circle cx="50" cy="44" r="4" fill="#6b5a34" opacity="0.6" />
        </>
      ) : (
        <>
          {/* Crescent moon */}
          <circle
            cx="50"
            cy="42"
            r="10"
            fill="none"
            stroke="#4a4a56"
            strokeWidth="1.5"
          />
          <circle cx="54" cy="39" r="8" fill={`url(#bg-${id}-${size})`} />
        </>
      )}

      {/* Letter */}
      <text
        x="50"
        y="72"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="20"
        fontWeight="bold"
        fontFamily="Cinzel, Palatino Linotype, Book Antiqua, Palatino, serif"
        fill={isHeads ? "#5c4d2a" : "#3a3a44"}
      >
        {isHeads ? "H" : "T"}
      </text>
    </svg>
  );
}
