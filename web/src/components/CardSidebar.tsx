import { useState, useRef, useMemo } from "react";
import coinFlipCards, { type CoinFlipCard } from "../data/coinFlipCards";
import { getCardCategory } from "../data/cardEffects";

interface CardSidebarProps {
  activeCardName: string | null;
  supportCardNames: string[];
  onSelectActive: (name: string | null) => void;
  onToggleSupport: (name: string) => void;
}

export default function CardSidebar({
  activeCardName,
  supportCardNames,
  onSelectActive,
  onToggleSupport,
}: CardSidebarProps) {
  const [hoveredCard, setHoveredCard] = useState<CoinFlipCard | null>(null);
  const [tooltipY, setTooltipY] = useState(0);
  const [commanderOnly, setCommanderOnly] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const TOOLTIP_HEIGHT = 279;

  const allCards = useMemo(() => {
    const filtered = commanderOnly
      ? coinFlipCards.filter((c) => c.commanderLegal)
      : coinFlipCards;

    const supporting: CoinFlipCard[] = [];
    const active: CoinFlipCard[] = [];
    for (const card of filtered) {
      const cat = getCardCategory(card.name);
      if (cat === "supporting") supporting.push(card);
      else active.push(card);
    }
    return { supporting, active };
  }, [commanderOnly]);

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

  const renderCard = (card: CoinFlipCard, type: "active" | "supporting") => {
    const isActive = type === "active";
    const isSelected = isActive
      ? activeCardName === card.name
      : supportCardNames.includes(card.name);

    return (
      <div
        key={card.name}
        className={`card-sidebar-link${isSelected ? " card-selected" : ""}`}
        onMouseEnter={(e) => handleMouseEnter(card, e)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <label className="card-select-label">
          <input
            type={isActive ? "radio" : "checkbox"}
            name={isActive ? "active-card" : undefined}
            checked={isSelected}
            onChange={() =>
              isActive
                ? onSelectActive(card.name)
                : onToggleSupport(card.name)
            }
            onClick={(e) => {
              if (isActive && isSelected) {
                e.preventDefault();
                onSelectActive(null);
              }
            }}
          />
          <a
            href={card.scryfallUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-link-name"
            onClick={(e) => e.stopPropagation()}
          >
            {card.canBeCommander && (
              <span className="card-cmdr-badge" title="Can be your commander">&#9813;</span>
            )}
            {card.name}
          </a>
        </label>
        <span className="card-mv" title="Mana value">{card.manaValue}</span>
      </div>
    );
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
        {allCards.supporting.length > 0 && (
          <>
            <div className="card-section-header">Supporting</div>
            {allCards.supporting.map((c) => renderCard(c, "supporting"))}
          </>
        )}

        <div className="card-section-header">Active</div>
        {allCards.active.map((c) => renderCard(c, "active"))}
      </div>

      {hoveredCard && (
        <div className="card-tooltip" style={{ top: tooltipY }}>
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
