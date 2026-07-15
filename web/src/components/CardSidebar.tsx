import { useState, useRef, useMemo } from "react";
import coinFlipCards, { type CoinFlipCard } from "../data/coinFlipCards";

export default function CardSidebar() {
  const [hoveredCard, setHoveredCard] = useState<CoinFlipCard | null>(null);
  const [tooltipY, setTooltipY] = useState(0);
  const [commanderOnly, setCommanderOnly] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const TOOLTIP_HEIGHT = 279;

  const visibleCards = useMemo(
    () => commanderOnly ? coinFlipCards.filter((c) => c.commanderLegal) : coinFlipCards,
    [commanderOnly],
  );

  const handleMouseEnter = (card: CoinFlipCard, e: React.MouseEvent) => {
    setHoveredCard(card);
    if (sidebarRef.current) {
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const itemRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const idealTop = itemRect.top - sidebarRect.top;
      const maxTop = window.innerHeight - sidebarRect.top - TOOLTIP_HEIGHT - 8;
      setTooltipY(Math.max(0, Math.min(idealTop, maxTop)));
    }
  };

  return (
    <div className="card-sidebar panel" ref={sidebarRef}>
      <h3>Coin Flip Cards</h3>

      <label className="card-sidebar-filter">
        <input
          type="checkbox"
          checked={commanderOnly}
          onChange={(e) => setCommanderOnly(e.target.checked)}
        />
        Commander legal only
      </label>

      <div className="card-sidebar-list">
        {visibleCards.map((card) => (
          <a
            key={card.name}
            href={card.scryfallUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-sidebar-link"
            onMouseEnter={(e) => handleMouseEnter(card, e)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <span className="card-sidebar-name">
              {card.canBeCommander && (
                <span className="card-cmdr-badge" title="Can be your commander">&#9813;</span>
              )}
              {card.name}
            </span>
            <span className="card-mv" title="Mana value">{card.manaValue}</span>
          </a>
        ))}
      </div>

      {hoveredCard && (
        <div
          className="card-tooltip"
          style={{ top: tooltipY }}
        >
          <img
            src={hoveredCard.imageUrl}
            alt={hoveredCard.name}
            width={200}
            height={279}
          />
        </div>
      )}
    </div>
  );
}
