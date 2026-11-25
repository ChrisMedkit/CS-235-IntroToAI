// Slot machine rules: 3 reels, 1 payline, tennis-themed symbols.
// Each reel lands on a symbol with probability weight / total weight.
// The pay table is set so the machine returns a bit less than it takes in.

export const SYMBOLS = [
  { id: 'ball', label: 'Tennis ball', emoji: '🎾', weight: 6 },
  { id: 'berry', label: 'Strawberries', emoji: '🍓', weight: 5 },
  { id: 'shoe', label: 'Shoe', emoji: '👟', weight: 4 },
  { id: 'net', label: 'Net', emoji: '🥅', weight: 3 },
  { id: 'trophy', label: 'Trophy', emoji: '🏆', weight: 2 },
];

// Multipliers are the total paid back per credit bet (stake included).
export const PAYTABLE = {
  three: { ball: 5, berry: 10, shoe: 15, net: 25, trophy: 50 },
  twoBalls: 2, // exactly two balls anywhere on the line
};

const TOTAL = SYMBOLS.reduce((s, x) => s + x.weight, 0);

function pickSymbol(r) {
  let edge = 0;
  for (const s of SYMBOLS) {
    edge += s.weight / TOTAL;
    if (r < edge) return s.id;
  }
  return SYMBOLS.at(-1).id;
}

export function spin(rng = Math.random) {
  return [pickSymbol(rng()), pickSymbol(rng()), pickSymbol(rng())];
}

export function payout(reels, stake) {
  const [a, b, c] = reels;
  if (a === b && b === c) return stake * PAYTABLE.three[a];
  const balls = reels.filter((r) => r === 'ball').length;
  if (balls === 2) return stake * PAYTABLE.twoBalls;
  return 0;
}

/** Exact long-run return per credit, by checking every weighted outcome. */
export function expectedReturn() {
  let total = 0;
  for (const a of SYMBOLS) for (const b of SYMBOLS) for (const c of SYMBOLS) {
    const p = (a.weight * b.weight * c.weight) / TOTAL ** 3;
    total += p * payout([a.id, b.id, c.id], 1);
  }
  return total;
}
