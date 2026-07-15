import { Mode, type Summary } from "../types";

export type CardCategory = "active" | "supporting";

export interface CardConstraints {
  numCoins?: number;
  mode?: Mode;
  maxFlips?: number;
}

export interface CardEffect {
  category: CardCategory;
  effect: string;
  evaluate: (s: Summary) => string;
  constraints?: CardConstraints;
  supportEvaluate?: (s: Summary) => string;
}

function binary(winText: string, loseText: string): (s: Summary) => string {
  return (s) =>
    s.roundsWon > 0
      ? `${winText} (${s.roundsWon}/${s.totalFlips} flips won)`
      : `${loseText} (0/${s.totalFlips} flips won)`;
}

function perWin(template: string): (s: Summary) => string {
  return (s) => template.replace(/\{n\}/g, String(s.roundsWon)).replace(/\{total\}/g, String(s.totalFlips));
}

function perCoin(template: string): (s: Summary) => string {
  return (s) => template.replace(/\{n\}/g, String(s.totalMatches)).replace(/\{total\}/g, String(s.totalCoins));
}

const SINGLE: CardConstraints = { numCoins: 1, mode: Mode.FIXED, maxFlips: 1 };
const RECURRING: CardConstraints = { numCoins: 1, mode: Mode.FIXED };
const PERSISTENT_1: CardConstraints = { numCoins: 1, mode: Mode.PERSISTENT };

const cardEffects: Record<string, CardEffect> = {

  // ── Supporting cards ──────────────────────────────────────────────

  "Krark's Thumb": {
    category: "supporting",
    effect: "If you would flip a coin, flip two instead and ignore one.",
    evaluate: (s) =>
      `With Krark's Thumb, each of your ${s.totalFlips} flips would be the best of two. You'd win more often than the ${((s.roundsWon / s.totalFlips) * 100).toFixed(0)}% you got.`,
  },
  "Karplusan Minotaur": {
    category: "supporting",
    effect: "Whenever you win a coin flip, Karplusan Minotaur deals 1 damage to any target. Whenever you lose a coin flip, it deals 1 damage to any target of an opponent's choice.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `Won ${s.roundsWon}/${s.totalFlips}: you direct ${s.roundsWon} damage, opponent directs ${losses} damage.`;
    },
    supportEvaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `Karplusan Minotaur: you direct ${s.roundsWon} damage, opponent directs ${losses}.`;
    },
  },
  "Tavern Scoundrel": {
    category: "supporting",
    effect: "Whenever you win a coin flip, create two Treasure tokens. {1}, {T}, Sacrifice another permanent: Flip a coin.",
    evaluate: (s) =>
      `${s.roundsWon} of ${s.totalFlips} flips won: created ${s.roundsWon * 2} Treasure tokens.`,
    supportEvaluate: (s) =>
      `Tavern Scoundrel: created ${s.roundsWon * 2} Treasures from ${s.roundsWon} win(s).`,
  },
  "Zndrsplt, Eye of Wisdom": {
    category: "supporting",
    effect: "At the beginning of combat on your turn, flip a coin until you lose a flip. Whenever a player wins a coin flip, draw a card.",
    evaluate: perWin("Won {n} flips before losing: drew {n} card(s)! Zndrsplt sees all."),
    supportEvaluate: (s) =>
      `Zndrsplt: drew ${s.roundsWon} card(s) from winning flips.`,
  },

  // ── Active cards ──────────────────────────────────────────────────

  "Aleatory": {
    category: "active",
    effect: "Flip a coin. If you win the flip, target creature gets +1/+1 until end of turn. Draw a card at the beginning of the next turn's upkeep.",
    evaluate: perWin("{n} of {total} flips won: creature gets +{n}/+{n}. Drew {total} card(s) on the following upkeep(s)."),
    constraints: RECURRING,
  },
  "Amulet of Quoz": {
    category: "active",
    effect: "Sacrifice and flip a coin. If you win, the opposing player loses the game.",
    evaluate: binary("You win the flip -- opponent loses the game!", "You lose the flip -- you lose the game."),
    constraints: { numCoins: 1, mode: Mode.FIXED, maxFlips: 1 },
  },
  "Boompile": {
    category: "active",
    effect: "Flip a coin. If you win, destroy all nonland permanents.",
    evaluate: perWin("{n} of {total} flips won: the board is wiped {n} time(s)."),
    constraints: RECURRING,
  },
  "Bottle of Suleiman": {
    category: "active",
    effect: "Flip a coin. If you win, create a 5/5 Djinn token with flying. If you lose, take 5 damage.",
    evaluate: (s) => s.roundsWon > 0
      ? `Won ${s.roundsWon}/${s.totalFlips}: created ${s.roundsWon} Djinn token(s), took ${(s.totalFlips - s.roundsWon) * 5} damage.`
      : `Lost all ${s.totalFlips} flips: took ${s.totalFlips * 5} damage. No Djinn for you.`,
    constraints: SINGLE,
  },
  "Breeches, the Blastmaker": {
    category: "active",
    effect: "Whenever you cast your second spell each turn, you may sacrifice an artifact. If you do, flip a coin. Win: copy that spell. Lose: Breeches deals damage equal to that spell's mana value to any target.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `Won ${s.roundsWon}/${s.totalFlips}: copied ${s.roundsWon} spell(s). Breeches dealt damage ${losses} time(s) instead.`;
    },
    constraints: RECURRING,
  },
  "Chaotic Goo": {
    category: "active",
    effect: "At the beginning of your upkeep, flip a coin. If you win, put a +1/+1 counter on Chaotic Goo. If you lose, remove a counter.",
    evaluate: (s) => {
      const net = s.roundsWon - (s.totalFlips - s.roundsWon);
      return net >= 0
        ? `Won ${s.roundsWon}/${s.totalFlips}: net +${net} counters on Chaotic Goo.`
        : `Won ${s.roundsWon}/${s.totalFlips}: net ${net} counters on Chaotic Goo.`;
    },
    constraints: RECURRING,
  },
  "Chaotic Strike": {
    category: "active",
    effect: "Flip a coin. If you win the flip, target creature gets +1/+1 until end of turn. Draw a card.",
    evaluate: perWin("{n} of {total} flips won: creature gets +{n}/+{n}. Drew {total} card(s) regardless."),
    constraints: RECURRING,
  },
  "Crazed Firecat": {
    category: "active",
    effect: "When Crazed Firecat enters, flip coins until you lose. Put a +1/+1 counter for each win.",
    evaluate: perWin("Won {n} flips before losing: Crazed Firecat enters as a {n}/+{n} creature (plus base 4/4)."),
    constraints: PERSISTENT_1,
  },
  "Creepy Doll": {
    category: "active",
    effect: "Whenever Creepy Doll deals combat damage, flip a coin. If you win, destroy the damaged creature.",
    evaluate: perWin("{n} of {total} flips won: destroyed {n} creature(s)."),
    constraints: RECURRING,
  },
  "Crooked Scales": {
    category: "active",
    effect: "Flip a coin. If you win, destroy target creature an opponent controls. If you lose, destroy a creature you control unless you pay 3 and repeat.",
    evaluate: binary("You win -- destroy target opponent's creature!", "You lose -- destroy one of your own creatures or pay {3} to try again."),
    constraints: SINGLE,
  },
  "Desperate Gambit": {
    category: "active",
    effect: "Choose a source you control and flip a coin. If you win the flip, the next time that source would deal damage this turn, it deals double instead. If you lose the flip, prevent that damage.",
    evaluate: binary("You win -- the source deals double damage!", "You lose the gambit -- damage is prevented."),
    constraints: SINGLE,
  },
  "Dumb Ass": {
    category: "active",
    effect: "At the beginning of your upkeep, flip a coin. If you lose the flip, target opponent chooses whether Dumb Ass attacks this turn.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return losses > 0
        ? `Lost ${losses}/${s.totalFlips} flips: opponent controls Dumb Ass's attack decision ${losses} time(s).`
        : `Won all ${s.totalFlips} flips: Dumb Ass attacks on your terms!`;
    },
    constraints: RECURRING,
  },
  "Everythingamajig": {
    category: "active",
    effect: "{1}: Flip a coin. If you win the flip, add {C}{C}.",
    evaluate: perWin("{n} of {total} flips won: generated {n} colorless mana ({n} x {C}{C} = {n}x2 mana)."),
    constraints: RECURRING,
  },
  "Fickle Efreet": {
    category: "active",
    effect: "Whenever Fickle Efreet attacks or blocks, flip a coin at end of combat. If you lose the flip, an opponent gains control of Fickle Efreet.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return losses > 0
        ? `Lost ${losses}/${s.totalFlips} flips: your opponent would steal Fickle Efreet.`
        : `Won all ${s.totalFlips} flips: Fickle Efreet stays loyal!`;
    },
    constraints: RECURRING,
  },
  "Fiery Gambit": {
    category: "active",
    effect: "Flip a coin until you lose a flip or choose to stop. 1+ wins: deal 3 damage to target creature. 2+ wins: deal 6 damage to each opponent. 3+ wins: draw nine cards and untap all lands you control.",
    evaluate: (s) => {
      if (s.roundsWon >= 3) return `Won ${s.roundsWon} flips: full gambit! 3 creature damage, 6 to each opponent, drew 9 cards, untapped all lands!`;
      if (s.roundsWon === 2) return `Won 2 flips: 3 damage to a creature and 6 damage to each opponent.`;
      if (s.roundsWon === 1) return `Won 1 flip: 3 damage to target creature.`;
      return `Won 0 flips: the gambit fizzles completely.`;
    },
    constraints: PERSISTENT_1,
  },
  "Fighting Chance": {
    category: "active",
    effect: "For each blocking creature, flip a coin. If you win the flip, prevent all combat damage that would be dealt by that creature this turn.",
    evaluate: perWin("{n} of {total} flips won: combat damage from {n} blocker(s) prevented!"),
    constraints: { mode: Mode.FIXED, maxFlips: 1 },
  },
  "Frenetic Efreet": {
    category: "active",
    effect: "Flip a coin. If you win, Frenetic Efreet phases out. If you lose, sacrifice it.",
    evaluate: binary("Frenetic Efreet phases out safely!", "You lose -- sacrifice Frenetic Efreet."),
    constraints: SINGLE,
  },
  "Frenetic Sliver": {
    category: "active",
    effect: "Flip a coin. If you win, this Sliver phases out. If you lose, sacrifice it.",
    evaluate: binary("The Sliver phases out safely!", "You lose -- sacrifice the Sliver."),
    constraints: SINGLE,
  },
  "Game of Chaos": {
    category: "active",
    effect: "Flip a coin. Loser loses 1 life. Winner may flip again, doubling the stakes each time.",
    evaluate: (s) => {
      const damage = Math.pow(2, s.roundsWon) - 1;
      return `Won ${s.roundsWon} flips in a row: stakes doubled ${s.roundsWon} time(s). Opponent loses ${damage} life if you keep going!`;
    },
    constraints: PERSISTENT_1,
  },
  "Goblin Archaeologist": {
    category: "active",
    effect: "{R}, {T}: Flip a coin. If you win the flip, destroy target artifact and untap Goblin Archaeologist. If you lose the flip, sacrifice it.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return losses > 0
        ? `Won ${s.roundsWon}/${s.totalFlips}: destroyed ${s.roundsWon} artifact(s), then lost and sacrificed the Archaeologist.`
        : `Won all ${s.totalFlips} flips: destroyed ${s.roundsWon} artifact(s) and kept going!`;
    },
    constraints: RECURRING,
  },
  "Goblin Artisans": {
    category: "active",
    effect: "Flip a coin. If you win, draw a card. If you lose, counter target artifact spell.",
    evaluate: perWin("{n} of {total} flips won: drew {n} card(s) instead of countering."),
    constraints: RECURRING,
  },
  "Goblin Bangchuckers": {
    category: "active",
    effect: "Flip a coin. If you win, deal 2 damage to any target. If you lose, Goblin Bangchuckers deals 2 damage to itself.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `Won ${s.roundsWon}/${s.totalFlips}: dealt ${s.roundsWon * 2} damage to targets, took ${losses * 2} self-damage.`;
    },
    constraints: RECURRING,
  },
  "Goblin Bomb": {
    category: "active",
    effect: "Each upkeep, flip a coin. Win: add a fuse counter. Lose: remove one. At 5 counters, sacrifice and deal 20 damage.",
    evaluate: (s) => {
      let counters = 0;
      let exploded = false;
      for (let i = 0; i < s.totalFlips; i++) {
        counters += i < s.roundsWon ? 1 : -1;
        if (counters < 0) counters = 0;
        if (counters >= 5) { exploded = true; break; }
      }
      return exploded
        ? `Reached 5 fuse counters! Goblin Bomb explodes for 20 damage!`
        : `After ${s.totalFlips} flips (${s.roundsWon} wins), ended with ${counters} fuse counter(s). Not enough to explode.`;
    },
    constraints: RECURRING,
  },
  "Goblin Festival": {
    category: "active",
    effect: "{2}: Goblin Festival deals 1 damage to any target. Flip a coin. If you lose the flip, an opponent gains control of Goblin Festival.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return losses > 0
        ? `${s.totalFlips} activation(s), dealt ${s.totalFlips} damage. Lost ${losses} flip(s) -- opponent steals the Festival!`
        : `${s.totalFlips} activation(s), dealt ${s.totalFlips} damage. Won all flips -- you keep the Festival!`;
    },
    constraints: RECURRING,
  },
  "Goblin Kaboomist": {
    category: "active",
    effect: "Each upkeep, create a Land Mine artifact and flip a coin. If you lose, Goblin Kaboomist deals 2 damage to itself.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `${s.totalFlips} Land Mines created. Lost ${losses} flips: ${losses * 2} self-damage to Kaboomist.`;
    },
    constraints: RECURRING,
  },
  "Goblin Kites": {
    category: "active",
    effect: "Give target creature flying until end of turn, then flip a coin. If you lose, sacrifice that creature.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return losses > 0
        ? `Lost ${losses}/${s.totalFlips} flips: ${losses} creature(s) sacrificed after a brief flight.`
        : `Won all ${s.totalFlips} flips: safe flights every time!`;
    },
    constraints: RECURRING,
  },
  "Goblin Lyre": {
    category: "active",
    effect: "Sacrifice Goblin Lyre and flip a coin. If you win, deal damage equal to your creature count. If you lose, take that much damage.",
    evaluate: binary("You win -- deal damage equal to your creature count!", "You lose -- take damage equal to your creature count!"),
    constraints: { numCoins: 1, mode: Mode.FIXED, maxFlips: 1 },
  },
  "Goblin Psychopath": {
    category: "active",
    effect: "Whenever Goblin Psychopath attacks or blocks, flip a coin. If you lose the flip, the next time it would deal combat damage this turn, it deals that damage to you instead.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return losses > 0
        ? `Lost ${losses}/${s.totalFlips} flips: Goblin Psychopath's 5 damage hits you ${losses} time(s) for ${losses * 5} total.`
        : `Won all ${s.totalFlips} flips: full damage to the opponent every time!`;
    },
    constraints: RECURRING,
  },
  "Impulsive Maneuvers": {
    category: "active",
    effect: "Whenever a creature attacks, flip a coin. If you win the flip, that creature deals double combat damage. If you lose the flip, prevent all combat damage from that creature.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `Won ${s.roundsWon}/${s.totalFlips}: ${s.roundsWon} attacker(s) deal double damage. ${losses} attacker(s) deal none.`;
    },
    constraints: RECURRING,
  },
  "Invert Polarity": {
    category: "active",
    effect: "Choose target spell, then flip a coin. If you win the flip, gain control of that spell and you may choose new targets for it. If you lose the flip, counter that spell.",
    evaluate: binary("You win -- gain control of the target spell and choose new targets!", "You lose -- the target spell is countered."),
    constraints: SINGLE,
  },
  "Krark, the Thumbless": {
    category: "active",
    effect: "Whenever you cast an instant or sorcery, flip a coin. If you win, copy the spell. If you lose, return it to your hand.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `Won ${s.roundsWon}/${s.totalFlips}: copied ${s.roundsWon} spell(s). Returned ${losses} to hand.`;
    },
    constraints: RECURRING,
  },
  "Mana Clash": {
    category: "active",
    effect: "You and target opponent each flip a coin. Mana Clash deals 1 damage to each player whose coin comes up tails. Repeat until both coins come up heads on the same flip.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `${s.totalFlips} rounds of flipping. You took ${losses} damage (tails), opponent took roughly the same.`;
    },
    constraints: PERSISTENT_1,
  },
  "Mana Crypt": {
    category: "active",
    effect: "At the beginning of your upkeep, flip a coin. If you lose, Mana Crypt deals 3 damage to you.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `Lost ${losses}/${s.totalFlips} flips: Mana Crypt deals ${losses * 3} total damage to you for its free mana.`;
    },
    constraints: RECURRING,
  },
  "Mana Screw": {
    category: "active",
    effect: "{1}: Flip a coin. If you win the flip, add {C}{C}. Activate only as an instant.",
    evaluate: perWin("{n} of {total} flips won: generated {n} colorless mana (added {C}{C} {n} time(s))."),
    constraints: RECURRING,
  },
  "Mijae Djinn": {
    category: "active",
    effect: "When Mijae Djinn attacks, flip a coin. If you lose, remove Mijae Djinn from combat.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return losses > 0
        ? `Lost ${losses}/${s.totalFlips} flips: Mijae Djinn was pulled from combat ${losses} time(s).`
        : `Won all ${s.totalFlips} flips: Mijae Djinn attacks unimpeded!`;
    },
    constraints: RECURRING,
  },
  "Mirror March": {
    category: "active",
    effect: "When a nontoken creature enters, flip coins until you lose a flip. For each win, create a token copy with haste.",
    evaluate: perWin("Won {n} flips before losing: created {n} hasty token copy/copies!"),
    constraints: PERSISTENT_1,
  },
  "Mogg Assassin": {
    category: "active",
    effect: "{T}: You choose target creature an opponent controls, and that opponent chooses target creature. Flip a coin. If you win the flip, destroy the creature you chose. If you lose the flip, destroy the creature your opponent chose.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `Won ${s.roundsWon}/${s.totalFlips}: destroyed ${s.roundsWon} of your chosen target(s). Opponent destroyed ${losses} of theirs.`;
    },
    constraints: RECURRING,
  },
  "Molten Birth": {
    category: "active",
    effect: "Create two 1/1 Elemental tokens. Flip a coin -- if you win, return Molten Birth to your hand.",
    evaluate: (s) =>
      `Won ${s.roundsWon}/${s.totalFlips}: created ${s.totalFlips * 2} Elementals total, returned to hand ${s.roundsWon} time(s) for re-casting.`,
    constraints: RECURRING,
  },
  "Molten Sentry": {
    category: "active",
    effect: "As Molten Sentry enters, flip a coin. Heads: it enters as a 5/2 with haste. Tails: it enters as a 2/5 with defender.",
    evaluate: binary("Heads -- Molten Sentry enters as an aggressive 5/2 with haste!", "Tails -- Molten Sentry enters as a defensive 2/5 with defender."),
    constraints: SINGLE,
  },
  "Mutalith Vortex Beast": {
    category: "active",
    effect: "When this creature enters, flip a coin for each opponent. For each flip you win, draw a card. For each flip you lose, this creature deals 3 damage to that player.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `Won ${s.roundsWon}/${s.totalFlips}: drew ${s.roundsWon} card(s), dealt ${losses * 3} damage to opponent(s).`;
    },
    constraints: { mode: Mode.FIXED, maxFlips: 1 },
  },
  "Negative Zone Portal": {
    category: "active",
    effect: "At the beginning of your upkeep, if four or more creature cards are exiled with this artifact, flip a coin. If you lose the flip, sacrifice it and return a card exiled with it at random to its owner's hand.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return losses > 0
        ? `Lost ${losses}/${s.totalFlips} flips: the Portal collapses -- sacrificed and a card is returned.`
        : `Won all ${s.totalFlips} flips: the Negative Zone Portal holds steady!`;
    },
    constraints: RECURRING,
  },
  "Odds // Ends": {
    category: "active",
    effect: "Odds: Flip a coin. If it comes up heads, counter target instant or sorcery spell. If it comes up tails, copy that spell and you may choose new targets for the copy.",
    evaluate: binary("Heads -- target spell is countered!", "Tails -- you copy the spell and may choose new targets!"),
    constraints: SINGLE,
  },
  "Okaun, Eye of Chaos": {
    category: "supporting",
    effect: "At the beginning of combat on your turn, flip a coin until you lose a flip. Whenever a player wins a coin flip, double Okaun's power and toughness until end of turn.",
    evaluate: (s) => {
      const mult = Math.pow(2, s.roundsWon);
      return `Won ${s.roundsWon}/${s.totalFlips} flips: Okaun's power/toughness doubled ${s.roundsWon} time(s) -- now multiplied by ${mult}x (base 3/3 becomes ${3 * mult}/${3 * mult})!`;
    },
    supportEvaluate: (s) => {
      const mult = Math.pow(2, s.roundsWon);
      return `Okaun: doubled ${s.roundsWon} time(s) -- ${mult}x multiplier (base 3/3 becomes ${3 * mult}/${3 * mult}).`;
    },
  },
  "Orcish Captain": {
    category: "active",
    effect: "Flip a coin. If you win, target Orc gets +2/+0. If you lose, it gets -0/-2.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `Won ${s.roundsWon}/${s.totalFlips}: +${s.roundsWon * 2}/+0 from wins, -0/-${losses * 2} from losses.`;
    },
    constraints: RECURRING,
  },
  "Planar Chaos": {
    category: "active",
    effect: "At the beginning of your upkeep, flip a coin. If you lose the flip, sacrifice Planar Chaos. Whenever a player casts a spell, that player flips a coin. If they lose the flip, counter that spell.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `Lost ${losses}/${s.totalFlips} flips: ${losses} spell(s) countered by chaos!`;
    },
    constraints: RECURRING,
  },
  "Plasma Caster": {
    category: "active",
    effect: "Pay {E}{E}: Choose target creature blocking equipped creature. Flip a coin. If you win the flip, exile the chosen creature. Otherwise, this Equipment deals 1 damage to it.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `Won ${s.roundsWon}/${s.totalFlips}: exiled ${s.roundsWon} blocker(s). Dealt 1 damage to ${losses} other(s).`;
    },
    constraints: RECURRING,
  },
  "Puppet's Verdict": {
    category: "active",
    effect: "Flip a coin. If you win, destroy all creatures with power 2 or less. If you lose, destroy all creatures with power 3 or more.",
    evaluate: binary("Small creatures are destroyed (power 2 or less)!", "Large creatures are destroyed (power 3 or more)!"),
    constraints: SINGLE,
  },
  "Rakdos, the Showstopper": {
    category: "active",
    effect: "When Rakdos enters, flip a coin for each creature that isn't a Demon, Devil, or Imp. Destroy each creature whose coin comes up tails.",
    evaluate: perCoin("{n} of {total} coins won: {n} creature(s) survive the show. The rest are destroyed!"),
    constraints: { mode: Mode.FIXED, maxFlips: 1 },
  },
  "Ral, Monsoon Mage": {
    category: "active",
    effect: "Whenever you cast an instant or sorcery during your turn, flip a coin. If you lose the flip, Ral deals 1 damage to you. If you win the flip, you may exile Ral and return him transformed.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return s.roundsWon > 0
        ? `Won ${s.roundsWon}/${s.totalFlips}: Ral can transform! Took ${losses} damage from lost flips.`
        : `Lost all ${s.totalFlips} flips: took ${losses} damage. Ral stays untransformed.`;
    },
    constraints: RECURRING,
  },
  "Risky Move": {
    category: "active",
    effect: "When you gain control of Risky Move from another player, choose a creature you control and an opponent. Flip a coin. If you lose the flip, that opponent gains control of that creature.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return losses > 0
        ? `Lost ${losses}/${s.totalFlips} flips: gave away ${losses} creature(s)!`
        : `Won all ${s.totalFlips} flips: kept control of everything!`;
    },
    constraints: RECURRING,
  },
  "Scoria Wurm": {
    category: "active",
    effect: "At the beginning of your upkeep, flip a coin. If you lose, return Scoria Wurm to its owner's hand.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return losses > 0
        ? `Lost ${losses}/${s.totalFlips} flips: Scoria Wurm bounced to hand ${losses} time(s).`
        : `Won all ${s.totalFlips} flips: Scoria Wurm stays on the battlefield!`;
    },
    constraints: RECURRING,
  },
  "Setzer, Wandering Gambler": {
    category: "supporting",
    effect: "Whenever a Vehicle you control deals combat damage to a player, flip a coin. Whenever you win a coin flip, create two tapped Treasure tokens.",
    evaluate: (s) =>
      `Won ${s.roundsWon}/${s.totalFlips}: created ${s.roundsWon * 2} tapped Treasure tokens.`,
    supportEvaluate: (s) =>
      `Setzer: created ${s.roundsWon * 2} tapped Treasure tokens from ${s.roundsWon} win(s).`,
  },
  "Skittish Valesk": {
    category: "active",
    effect: "At the beginning of your upkeep, flip a coin. If you lose the flip, turn Skittish Valesk face down.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return losses > 0
        ? `Lost ${losses}/${s.totalFlips} flips: Skittish Valesk hides face-down.`
        : `Won all ${s.totalFlips} flips: Valesk stays face-up and fighting!`;
    },
    constraints: RECURRING,
  },
  "Skyclaw Thrash": {
    category: "active",
    effect: "When Skyclaw Thrash attacks, flip a coin. If you win, it gets +1/+1 and flying until end of turn.",
    evaluate: perWin("{n} of {total} flips won: Skyclaw Thrash flies and gets +{n}/+{n}!"),
    constraints: RECURRING,
  },
  "Sorcerer's Strongbox": {
    category: "active",
    effect: "{2}, {T}: Flip a coin. If you win the flip, sacrifice Sorcerer's Strongbox and draw three cards.",
    evaluate: (s) =>
      s.roundsWon > 0
        ? `Won on flip #${s.totalFlips - s.roundsWon + 1} (of ${s.totalFlips}): Strongbox cracks open -- draw 3 cards!`
        : `Lost all ${s.totalFlips} flips: the Strongbox remains stubbornly locked.`,
    constraints: RECURRING,
  },
  "Squee's Revenge": {
    category: "active",
    effect: "Choose a number. Flip a coin that many times or until you lose a flip, whichever comes first. If you win all the flips, draw two cards for each flip.",
    evaluate: (s) => {
      const allWins = s.roundsWon === s.totalFlips;
      return allWins
        ? `Won all ${s.totalFlips} flips: drew ${s.totalFlips * 2} cards! Squee would be proud.`
        : `Lost on flip ${s.roundsWon + 1} of ${s.totalFlips}: drew nothing. Squee is disappointed.`;
    },
    constraints: PERSISTENT_1,
  },
  "Stitch in Time": {
    category: "active",
    effect: "Flip a coin. If you win, take an extra turn.",
    evaluate: perWin("{n} of {total} flips won: that's {n} extra turn(s)!"),
    constraints: RECURRING,
  },
  "Tavern Swindler": {
    category: "active",
    effect: "Pay 3 life and flip a coin. If you win, gain 6 life.",
    evaluate: (s) => {
      const spent = s.totalFlips * 3;
      const gained = s.roundsWon * 6;
      const net = gained - spent;
      return net >= 0
        ? `Won ${s.roundsWon}/${s.totalFlips}: paid ${spent} life, gained ${gained}. Net +${net} life!`
        : `Won ${s.roundsWon}/${s.totalFlips}: paid ${spent} life, gained ${gained}. Net ${net} life.`;
    },
    constraints: RECURRING,
  },
  "The Gold Saucer": {
    category: "active",
    effect: "{2}, {T}: Flip a coin. If you win the flip, create a Treasure token.",
    evaluate: perWin("{n} of {total} flips won: created {n} Treasure token(s)."),
    constraints: RECURRING,
  },
  "Two-Headed Giant": {
    category: "active",
    effect: "Whenever Two-Headed Giant attacks, flip two coins. If both are heads, it gains double strike until end of turn. If both are tails, it gains menace until end of turn.",
    evaluate: (s) => {
      const bothHeads = s.totalMatches === s.totalCoins;
      const bothTails = s.totalMatches === 0;
      if (bothHeads) return `Both heads! Two-Headed Giant gains double strike!`;
      if (bothTails) return `Both tails! Two-Headed Giant gains menace!`;
      return `Mixed result (${s.totalMatches}/${s.totalCoins} heads): no bonus ability this attack.`;
    },
    constraints: { numCoins: 2, mode: Mode.FIXED, maxFlips: 1 },
  },
  "Tide of War": {
    category: "active",
    effect: "Whenever one or more creatures block, flip a coin. If you win the flip, each blocking creature is sacrificed. If you lose the flip, each blocked creature is sacrificed.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `Won ${s.roundsWon}/${s.totalFlips}: blockers sacrificed ${s.roundsWon} time(s). Attackers sacrificed ${losses} time(s).`;
    },
    constraints: RECURRING,
  },
  "Viashino Sandswimmer": {
    category: "active",
    effect: "Flip a coin. If you win, return Viashino Sandswimmer to its owner's hand. If you lose, sacrifice it.",
    evaluate: binary("Safe! Sandswimmer returns to hand.", "Sandswimmer is sacrificed -- lost beneath the sands."),
    constraints: SINGLE,
  },
  "Volatile Rig": {
    category: "active",
    effect: "Whenever Volatile Rig is dealt damage, flip a coin. If you lose the flip, sacrifice it. When it dies, flip a coin. If you lose the flip, it deals 4 damage to each creature and each player.",
    evaluate: binary("The rig survives and dies quietly.", "BOOM! 4 damage to everything and everyone!"),
    constraints: SINGLE,
  },
  "Wild Wurm": {
    category: "active",
    effect: "When Wild Wurm enters, flip a coin. If you lose, return it to its owner's hand.",
    evaluate: binary("Wild Wurm enters the battlefield!", "Wild Wurm bounces back to hand -- too wild to stay."),
    constraints: SINGLE,
  },
  "Winter Sky": {
    category: "active",
    effect: "Flip a coin. If you win the flip, Winter Sky deals 1 damage to each creature and each player. If you lose the flip, each player draws a card.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return `Won ${s.roundsWon}/${s.totalFlips}: dealt 1 damage to everything ${s.roundsWon} time(s). Each player drew ${losses} card(s).`;
    },
    constraints: RECURRING,
  },
  "Wirefly Hive": {
    category: "active",
    effect: "Flip a coin. If you win, create a 2/2 Wirefly token with flying. If you lose, destroy all Wireflies.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return losses > 0
        ? `Won ${s.roundsWon}/${s.totalFlips} but lost ${losses} time(s) -- all Wireflies are destroyed on each loss.`
        : `Won all ${s.totalFlips} flips: ${s.roundsWon} Wirefly tokens created and none destroyed!`;
    },
    constraints: RECURRING,
  },
  "Ydwen Efreet": {
    category: "active",
    effect: "When Ydwen Efreet blocks, flip a coin. If you lose, remove it from combat and it can't block this turn.",
    evaluate: (s) => {
      const losses = s.totalFlips - s.roundsWon;
      return losses > 0
        ? `Lost ${losses}/${s.totalFlips} flips: Ydwen Efreet pulled from blocking ${losses} time(s).`
        : `Won all ${s.totalFlips} flips: Ydwen Efreet blocks perfectly!`;
    },
    constraints: RECURRING,
  },
};

export function getCardEffect(cardName: string): CardEffect | null {
  return cardEffects[cardName] ?? null;
}

export function getCardConstraints(cardName: string): CardConstraints | undefined {
  return cardEffects[cardName]?.constraints;
}

export function getCardCategory(cardName: string): CardCategory | null {
  return cardEffects[cardName]?.category ?? null;
}

export function evaluateOutcome(cardName: string, summary: Summary): string | null {
  const effect = cardEffects[cardName];
  if (!effect) return null;
  return effect.evaluate(summary);
}

export function evaluateSupport(cardName: string, summary: Summary): string | null {
  const effect = cardEffects[cardName];
  if (!effect?.supportEvaluate) return null;
  return effect.supportEvaluate(summary);
}

export function getCardEffectText(cardName: string): string | null {
  return cardEffects[cardName]?.effect ?? null;
}
