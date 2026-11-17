// Match Replay (home page): replays a real match point by point, shows the model's
// win chances and momentum, and lets the visitor place play-money bets.
// The replay keeps playing while the bet slip is open; odds lock when "Place bet" is clicked.

import { wallet, loadData } from './script.js';
import { toDecimalOdds } from './lib/odds.js';
import { validateStake, makeBet, settle, matchBettingOpen, betProbability } from './lib/bets.js';

const BASE_TICK_MS = 2500;       // one point every 2.5 s at 1× speed
const MODE_LABELS = { point: 'Next point', game: 'Next game', match: 'Match winner' };

const $ = (id) => document.getElementById(id);
const els = {
  select: $('match-select'), scoreBody: document.querySelector('#scoreboard tbody'),
  play: $('replay-play'), step: $('replay-step'), speed: $('replay-speed'), jump: $('replay-jump'),
  chart: $('momentum-chart'), m1: $('momentum-p1'), m2: $('momentum-p2'),
  modeLabel: $('slip-mode-label'), picks: $('slip-picks'), stake: $('slip-stake'),
  place: $('slip-place'), openBets: $('open-bets'), status: $('replay-status'),
};

const state = {
  matches: [], match: null, idx: 0,        // points[0..idx-1] have been played
  timer: null, speed: 1, mode: 'point', pick: 1, openBets: [], loading: false,
};

// ---------- Helpers ----------
const points = () => state.match.points;
const isOver = () => state.idx >= points().length;
const playerName = (n) => state.match.players[n - 1];

function say(text, tone = '') {
  els.status.textContent = text;
  els.status.className = `replay-status${tone ? ` is-${tone}` : ''}`;
}

/** The score to show: the state before the next point, or the final state at the end. */
function currentView() {
  const pts = points();
  if (!isOver()) return pts[state.idx];
  const last = pts[pts.length - 1];
  // The last point wins the last game and the last set.
  const sets = [...last.sets];
  const games = [...last.games];
  sets[state.match.winner - 1] += 1;
  games[state.match.winner - 1] += 1;
  const pm = state.match.winner === 1 ? [1, 0] : [0, 1];
  return { ...last, sets, games, score: ['–', '–'], server: 0, p_match: pm };
}

// ---------- Rendering ----------
function renderScoreboard() {
  const v = currentView();
  els.scoreBody.replaceChildren(...[1, 2].map((n) => {
    const row = document.createElement('tr');
    const name = document.createElement('th');
    name.scope = 'row';
    name.textContent = playerName(n);
    if (v.server === n) name.classList.add('is-serving');
    const pct = Math.round(v.p_match[n - 1] * 100);
    const cells = [v.sets[n - 1], v.games[n - 1], v.score[n - 1]].map((t) => {
      const td = document.createElement('td');
      td.textContent = t;
      return td;
    });
    const win = document.createElement('td');
    win.textContent = `${pct}%`;
    const bar = document.createElement('span');
    bar.className = 'win-bar';
    bar.setAttribute('aria-hidden', 'true');
    bar.dataset.width = pct;
    win.append(bar);
    row.append(name, ...cells, win);
    return row;
  }));
  // Width set through the CSSOM (not a style="" attribute) so the HTML stays free of inline styles.
  els.scoreBody.querySelectorAll('.win-bar').forEach((b) => { b.style.width = `${b.dataset.width}%`; });
}

function renderChart() {
  const pts = points();
  const W = 600, H = 160, MID = H / 2;
  const maxAbs = Math.max(0.1, ...pts.map((p) => Math.abs(p.momentum)));
  const x = (i) => (pts.length > 1 ? (i / (pts.length - 1)) * W : 0);
  const y = (m) => MID - (m / maxAbs) * (MID - 8);
  const shown = pts.slice(0, Math.max(1, state.idx));
  const line = shown.map((p, i) => `${x(i).toFixed(1)},${y(p.momentum).toFixed(1)}`).join(' ');
  els.chart.innerHTML =
    `<line class="momentum-axis" x1="0" y1="${MID}" x2="${W}" y2="${MID}"></line>` +
    `<polyline class="momentum-line" points="${line}"></polyline>`;
}

function renderSlip() {
  els.modeLabel.textContent = MODE_LABELS[state.mode];
  document.querySelectorAll('#mode-picker [data-mode]').forEach((b) => {
    const active = b.dataset.mode === state.mode;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', String(active));
  });

  const closed = closedReason();
  els.picks.replaceChildren(...[1, 2].map((n) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'odds-btn';
    btn.setAttribute('aria-pressed', String(state.pick === n));
    const label = document.createElement('span');
    label.textContent = playerName(n);
    const odds = document.createElement('span');
    odds.className = 'odds-value';
    odds.textContent = closed ? '—' : toDecimalOdds(betProbability(state.mode, n, points(), state.idx)).toFixed(2);
    btn.append(label, odds);
    btn.disabled = Boolean(closed);
    btn.addEventListener('click', () => { state.pick = n; renderSlip(); });
    return btn;
  }));
  els.place.disabled = Boolean(closed);
  els.place.title = closed || '';
}

/** Why betting is closed for the current mode right now, or '' if it's open. */
function closedReason() {
  if (isOver()) return 'The match is over.';
  if (state.openBets.some((b) => b.mode === state.mode)) return `You already have an open ${MODE_LABELS[state.mode].toLowerCase()} bet.`;
  if (state.mode === 'match' && !matchBettingOpen(points()[state.idx])) return 'Match betting closed when the final set began.';
  if (state.mode === 'game' && !makeBet({ mode: 'game', pick: 1, stake: 1, odds: 1, points: points(), idx: state.idx })) return 'No games left to bet on.';
  return '';
}

function renderOpenBets() {
  if (state.openBets.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No open bets.';
    els.openBets.replaceChildren(li);
    return;
  }
  els.openBets.replaceChildren(...state.openBets.map((b) => {
    const li = document.createElement('li');
    li.textContent = `${MODE_LABELS[b.mode]}: ${playerName(b.pick)} · ${b.stake} @ ${b.odds.toFixed(2)}`;
    return li;
  }));
}

/** Turn every replay and bet-slip control on or off. */
function setControlsEnabled(on) {
  const controls = [els.play, els.step, els.speed, els.jump, els.stake, els.place,
    ...els.picks.querySelectorAll('button'), ...document.querySelectorAll('#mode-picker [data-mode]')];
  controls.forEach((c) => { c.disabled = !on; });
}

function render() {
  if (!state.match || state.loading) { setControlsEnabled(false); return; }
  setControlsEnabled(true);
  renderScoreboard();
  renderChart();
  renderSlip();
  renderOpenBets();
  els.step.disabled = isOver();
  els.play.disabled = isOver();
}

// ---------- Bets ----------
/** Settle every bet that can be decided now. Returns one message per settled bet. */
function settleOpenBets() {
  const stillOpen = [];
  const results = [];
  for (const bet of state.openBets) {
    const result = settle(bet, points(), state.idx, state.match.winner);
    if (!result) { stillOpen.push(bet); continue; }
    const what = `${MODE_LABELS[bet.mode].toLowerCase()} (${playerName(bet.pick)})`;
    if (result.won) {
      wallet.credit(result.payout);
      results.push({ won: true, text: `Won ${result.payout} credits on ${what}!` });
    } else {
      results.push({ won: false, text: `Lost ${bet.stake} credits on ${what}.` });
    }
  }
  state.openBets = stillOpen;
  return results;
}

/** Give back the stakes of every open bet (switching match, jumping, leaving the page). */
function refundOpenBets() {
  const total = state.openBets.reduce((sum, b) => sum + b.stake, 0);
  if (total > 0) wallet.credit(total);
  state.openBets = [];
  return total;
}

function placeBet() {
  const closed = closedReason();
  if (closed) { say(closed, 'loss'); return; }
  const check = validateStake(els.stake.value, wallet.getBalance());
  if (!check.ok) { say(check.error, 'loss'); return; }
  // Lock the odds exactly as shown at the moment of the click.
  const odds = toDecimalOdds(betProbability(state.mode, state.pick, points(), state.idx));
  const bet = makeBet({ mode: state.mode, pick: state.pick, stake: check.stake, odds, points: points(), idx: state.idx });
  if (!bet || !wallet.debit(check.stake)) { say('That bet could not be placed.', 'loss'); return; }
  state.openBets.push(bet);
  say(`Bet placed: ${check.stake} credits on ${playerName(bet.pick)} (${MODE_LABELS[bet.mode].toLowerCase()}) at ${odds.toFixed(2)}.`);
  render();
}

// ---------- Replay control ----------
function advance() {
  if (isOver()) return;
  state.idx += 1;
  const results = settleOpenBets();
  const lines = results.map((r) => r.text);
  if (isOver()) {
    stop();
    const refunded = refundOpenBets(); // anything settle couldn't resolve
    lines.unshift(`${playerName(state.match.winner)} wins the match!`);
    if (refunded) lines.push(`${refunded} credits refunded.`);
  }
  if (lines.length) {
    const anyWin = results.some((r) => r.won);
    const allLost = results.length > 0 && results.every((r) => !r.won);
    say(lines.join(' '), anyWin ? 'win' : allLost ? 'loss' : '');
  }
  render();
}

function stop() {
  clearInterval(state.timer);
  state.timer = null;
  els.play.textContent = 'Play';
}

function start() {
  if (isOver()) return;
  clearInterval(state.timer);
  state.timer = setInterval(advance, BASE_TICK_MS / state.speed);
  els.play.textContent = 'Pause';
}

function confirmRefund(action) {
  if (state.openBets.length === 0) return true;
  return confirm(`${action} will cancel your open bets and refund their stakes. Continue?`);
}

/** Load and show a match. Returns true on success. On failure the previous match (if any) stays. */
async function showMatch(id) {
  const entry = state.matches.find((m) => m.id === id);
  stop();
  state.loading = true;
  render();
  let match;
  try {
    match = await loadData('tennis', entry.file);
  } catch (err) {
    state.loading = false;
    if (state.match) els.select.value = state.match.id; // put the dropdown back
    render();
    say(err.message, 'loss');
    return false;
  }
  state.loading = false;
  state.match = match;
  state.idx = 0;
  els.m1.textContent = state.match.players[0];
  els.m2.textContent = state.match.players[1];
  // "Jump to set" options: the first point of each set.
  const firsts = [];
  points().forEach((p, i) => { if (!firsts.some((f) => f.set === p.set)) firsts.push({ set: p.set, i }); });
  els.jump.replaceChildren(...firsts.map((f) => new Option(`Set ${f.set}`, f.i)));
  say(`Replay ready: ${state.match.players[0]} vs ${state.match.players[1]} (${entry.round}). Press Play.`);
  render();
  return true;
}

// ---------- Wire up ----------
function wire() {
  els.play.addEventListener('click', () => (state.timer ? stop() : start()));
  els.step.addEventListener('click', () => { stop(); advance(); });
  els.speed.addEventListener('change', () => {
    state.speed = Number(els.speed.value);
    if (state.timer) start();
  });
  els.jump.addEventListener('change', () => {
    if (!confirmRefund('Jumping')) { els.jump.selectedIndex = -1; return; }
    const refunded = refundOpenBets();
    state.idx = Number(els.jump.value);
    if (refunded) say(`${refunded} credits refunded.`);
    render();
  });
  els.select.addEventListener('change', () => {
    if (!confirmRefund('Switching match')) { if (state.match) els.select.value = state.match.id; return; }
    const refunded = refundOpenBets();
    showMatch(els.select.value).then((ok) => { if (ok && refunded) say(`${refunded} credits refunded. New replay ready.`); });
  });
  document.querySelectorAll('#mode-picker [data-mode]').forEach((b) => {
    b.addEventListener('click', () => { state.mode = b.dataset.mode; renderSlip(); });
  });
  els.place.addEventListener('click', placeBet);
  // Stakes leave the wallet when a bet is placed, so give them back if the visitor leaves.
  window.addEventListener('pagehide', refundOpenBets);
}

async function init() {
  if (!els.select) return;
  try {
    const index = await loadData('tennis', 'index.json');
    state.matches = index.matches;
  } catch (err) {
    say(err.message, 'loss');
    return;
  }
  els.select.replaceChildren(...state.matches.map((m) =>
    new Option(`${m.round}: ${m.players[0]} vs ${m.players[1]}`, m.id)));
  wire();
  await showMatch(state.matches[0].id);
}

init();
