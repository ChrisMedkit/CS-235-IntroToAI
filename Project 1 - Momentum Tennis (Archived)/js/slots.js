// Slot machine on the Mini Games page. Rules and odds live in lib/slots-rules.js.

import { wallet } from './script.js';
import { validateStake } from './lib/bets.js';
import { SYMBOLS, PAYTABLE, spin, payout, expectedReturn } from './lib/slots-rules.js';

const $ = (id) => document.getElementById(id);
const els = {
  reels: $('slot-reels'), stake: $('slots-stake'), spin: $('slots-spin'), status: $('slots-status'),
  paytable: $('slots-paytable'), rtpText: $('slots-rtp-text'), rtpCard: $('rtp-slots'),
};

const SPIN_MS = 700;
const byId = Object.fromEntries(SYMBOLS.map((s) => [s.id, s]));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function say(text, tone = '') {
  els.status.textContent = text;
  els.status.className = `replay-status${tone ? ` is-${tone}` : ''}`;
}

function showReels(ids) {
  [...els.reels.children].forEach((reel, i) => {
    reel.textContent = byId[ids[i]].emoji;
    reel.setAttribute('aria-label', byId[ids[i]].label);
  });
}

function fillPaytable() {
  const rows = SYMBOLS.map((s) => [`${s.emoji} ${s.emoji} ${s.emoji}`, `${PAYTABLE.three[s.id]}×`]);
  rows.push(['🎾 🎾 + any other', `${PAYTABLE.twoBalls}×`]);
  els.paytable.replaceChildren(...rows.map(([line, pays]) => {
    const tr = document.createElement('tr');
    const a = document.createElement('td');
    const b = document.createElement('td');
    a.textContent = line;
    b.textContent = pays;
    tr.append(a, b);
    return tr;
  }));
  const rtp = (expectedReturn() * 100).toFixed(1);
  els.rtpText.textContent = rtp;
  if (els.rtpCard) els.rtpCard.textContent = rtp;
}

function onSpin() {
  const check = validateStake(els.stake.value, wallet.getBalance());
  if (!check.ok) { say(check.error, 'loss'); return; }
  wallet.debit(check.stake);
  const result = spin();
  const won = payout(result, check.stake);

  const reveal = () => {
    els.reels.classList.remove('is-spinning');
    showReels(result);
    if (won > 0) {
      wallet.credit(won);
      say(`You win ${won} credits!`, 'win');
    } else {
      say(`No win. You lose ${check.stake} credits.`, 'loss');
    }
    els.spin.disabled = false;
  };

  els.spin.disabled = true;
  if (reduceMotion) { reveal(); return; }
  els.reels.classList.add('is-spinning');
  setTimeout(reveal, SPIN_MS);
}

if (els.spin) {
  fillPaytable();
  els.spin.addEventListener('click', onSpin);
}
