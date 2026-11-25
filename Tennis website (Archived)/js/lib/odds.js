// Turn a model probability into decimal odds (what a 1-credit bet pays back in total).
// The house margin shortens every price so the site keeps an edge, like a real book.

export const HOUSE_MARGIN = 0.05;

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export function toDecimalOdds(p) {
  const fair = clamp(p, 0.02, 0.98);
  const odds = 1 / (fair * (1 + HOUSE_MARGIN));
  return Math.max(1.01, Math.round(odds * 100) / 100);
}
