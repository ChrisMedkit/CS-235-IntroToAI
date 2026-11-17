// Bet rules for the match replay: checking stakes, what a bet is on, and settling it.
// "idx" always means: points[0 .. idx-1] have been played; points[idx] is next.

/** Check a stake typed by the visitor. */
export function validateStake(raw, balance) {
  const text = String(raw ?? '').trim();
  if (text === '') return { ok: false, error: 'Enter a stake.' };
  if (!/^\d+$/.test(text)) return { ok: false, error: 'Stake must be a whole number of credits.' };
  const stake = Number(text);
  if (stake < 1) return { ok: false, error: 'Stake must be at least 1 credit.' };
  if (stake > balance) return { ok: false, error: `You only have ${balance} credits.` };
  return { ok: true, stake };
}

const sameGame = (a, b) => a.set === b.set && a.game === b.game;
const isGameStart = (points, i) => i === 0 || !sameGame(points[i], points[i - 1]);

/** The next game that hasn't started yet, as {set, game}, or null if none is left. */
function nextUnstartedGame(points, idx) {
  if (idx >= points.length) return null;
  if (isGameStart(points, idx)) return { set: points[idx].set, game: points[idx].game };
  for (let i = idx + 1; i < points.length; i++) {
    if (!sameGame(points[i], points[idx])) return { set: points[i].set, game: points[i].game };
  }
  return null;
}

/** Model chance that `pick` (1 or 2) wins the bet for this mode, before points[idx]. */
export function betProbability(mode, pick, points, idx) {
  const p = points[idx];
  const i = pick - 1;
  if (mode === 'point') return p.p_point[i];
  if (mode === 'game') return isGameStart(points, idx) ? p.p_game[i] : p.p_next_game[i];
  return p.p_match[i];
}

let nextId = 1;

/** Create a bet, or return null if there's nothing left to bet on in this mode. */
export function makeBet({ mode, pick, stake, odds, points, idx }) {
  let target;
  if (mode === 'point') target = idx < points.length ? idx : null;
  else if (mode === 'game') target = nextUnstartedGame(points, idx);
  else target = idx < points.length ? 'match' : null;
  if (target === null) return null;
  return { id: nextId++, mode, pick, stake, odds, target };
}

/** null while the bet is still open, otherwise {won, payout}. */
export function settle(bet, points, idx, matchWinner) {
  let winner = null;
  if (bet.mode === 'point') {
    if (idx > bet.target) winner = points[bet.target].winner;
  } else if (bet.mode === 'game') {
    // The player who wins a game's last point wins the game.
    let last = -1;
    points.forEach((p, i) => { if (sameGame(p, bet.target)) last = i; });
    if (last >= 0 && idx > last) winner = points[last].winner;
  } else if (idx >= points.length) {
    winner = matchWinner;
  }
  if (winner === null) return null;
  const won = winner === bet.pick;
  return { won, payout: won ? Math.floor(bet.stake * bet.odds) : 0 };
}

/** Match-winner betting closes once both players have 2 sets (final set under way). */
export function matchBettingOpen(point) {
  return !(point.sets[0] === 2 && point.sets[1] === 2);
}
