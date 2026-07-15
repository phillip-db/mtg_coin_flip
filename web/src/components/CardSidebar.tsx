import { useState, useRef } from "react";
import coinFlipCards from "../data/coinFlipCards";

function imageUrl(cardName: string): string {
  return `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}&format=image&version=normal`;
}

export default function CardSidebar() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [tooltipY, setTooltipY] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (name: string, e: React.MouseEvent) => {
    setHoveredCard(name);
    if (sidebarRef.current) {
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const itemRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltipY(itemRect.top - sidebarRect.top);
    }
  };

  return (
    <div className="card-sidebar panel" ref={sidebarRef}>
      <h3>Coin Flip Cards</h3>
      <div className="card-sidebar-list">
        {coinFlipCards.map((card) => (
          <a
            key={card.name}
            href={card.scryfallUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-sidebar-link"
            onMouseEnter={(e) => handleMouseEnter(card.name, e)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {card.name}
          </a>
        ))}
      </div>

      {hoveredCard && (
        <div
          className="card-tooltip"
          style={{ top: tooltipY }}
        >
          <img
            src={imageUrl(hoveredCard)}
            alt={hoveredCard}
            width={200}
            height={279}
          />
        </div>
      )}
    </div>
  );
}
