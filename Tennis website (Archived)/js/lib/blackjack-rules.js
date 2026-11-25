// Blackjack rules: one 52-card deck reshuffled every hand, dealer stands on all 17s,
// blackjack pays 3:2, double down allowed on the first two cards, no splits or insurance.

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠', '♥', '♦', '♣'];

/** A fresh, shuffled deck (Fisher–Yates). */
export function newDeck(rng = Math.random) {
  const deck = SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Best total for a hand; "soft" means an ace is still counted as 11. */
export function handValue(cards) {
  let total = 0;
  let aces = 0;
  for (const { rank } of cards) {
    if (rank === 'A') { total += 11; aces += 1; }
    else if (['J', 'Q', 'K'].includes(rank)) total += 10;
    else total += Number(rank);
  }
  while (total > 21 && aces > 0) { total -= 10; aces -= 1; }
  return { total, soft: aces > 0 };
}

export const isBlackjack = (cards) => cards.length === 2 && handValue(cards).total === 21;

export const dealerShouldHit = (cards) => handValue(cards).total < 17;

/** Total credits handed back (stake included). `doubled` means the stake was doubled. */
export function settleHand(player, dealer, stake, doubled) {
  const bet = doubled ? stake * 2 : stake;
  const pBJ = isBlackjack(player);
  const dBJ = isBlackjack(dealer);
  if (pBJ && dBJ) return { result: 'push', returned: stake };
  if (pBJ) return { result: 'blackjack', returned: Math.floor(stake * 2.5) };
  if (dBJ) return { result: 'lose', returned: 0 };
  const p = handValue(player).total;
  const d = handValue(dealer).total;
  if (p > 21) return { result: 'lose', returned: 0 };
  if (d > 21 || p > d) return { result: 'win', returned: bet * 2 };
  if (p === d) return { result: 'push', returned: bet };
  return { result: 'lose', returned: 0 };
}
