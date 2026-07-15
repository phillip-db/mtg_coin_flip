import { type ReactNode } from "react";

const highlights: { pattern: RegExp; className: string }[] = [
  {
    pattern:
      /[+-]\d+\/[+-]\d+|double strike|haste|flying|menace|trample|defender|indestructible|phases? out|phased out/gi,
    className: "hl-stat",
  },
  {
    pattern:
      /\bdamage\b|destroy(?:ed|s)?|sacrifice[ds]?|loses? the game|exile[ds]?/gi,
    className: "hl-damage",
  },
  {
    pattern: /\bdrawn?\b|drew\b|cop(?:y|ied|ies)|gains? control|extra turns?/gi,
    className: "hl-advantage",
  },
  {
    pattern:
      /Treasure tokens?|\{[CWUBRGXE2-9]\}(?:\{[CWUBRGXE2-9]\})*|\bcreate[ds]?\b[^.]*?\btokens?\b/gi,
    className: "hl-mana",
  },
];

interface Segment {
  start: number;
  end: number;
  className: string;
}

export function highlightCardText(text: string): ReactNode {
  const segments: Segment[] = [];

  for (const { pattern, className } of highlights) {
    const re = new RegExp(pattern.source, pattern.flags);
    for (const m of text.matchAll(re)) {
      const start = m.index!;
      const end = start + m[0].length;
      const overlaps = segments.some(
        (s) => start < s.end && end > s.start
      );
      if (!overlaps) {
        segments.push({ start, end, className });
      }
    }
  }

  if (segments.length === 0) return text;

  segments.sort((a, b) => a.start - b.start);

  const parts: ReactNode[] = [];
  let cursor = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.start > cursor) {
      parts.push(text.slice(cursor, seg.start));
    }
    parts.push(
      <span key={i} className={seg.className}>
        {text.slice(seg.start, seg.end)}
      </span>
    );
    cursor = seg.end;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <>{parts}</>;
}
