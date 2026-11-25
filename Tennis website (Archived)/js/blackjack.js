// Blackjack table on the Mini Games page. Rules live in lib/blackjack-rules.js.

import { wallet } from './script.js';
import { validateStake } from './lib/bets.js';
import { newDeck, handValue, isBlackjack, dealerShouldHit, settleHand } from './lib/blackjack-rules.js';

const $ = (id) => document.getElementById(id);
const els = {
  dealer: $('bj-dealer'), player: $('bj-player'), dealerTotal: $('bj-dealer-total'), playerTotal: $('bj-player-total'),
  stake: $('bj-stake'), deal: $('bj-deal'), hit: $('bj-hit'), stand: $('bj-stand'), double: $('bj-double'), status: $('bj-status'),
};

const SUIT_NAMES = { '♠': 'spades', '♥': 'hearts', '♦': 'diamonds', '♣': 'clubs' };
const RANK_NAMES = { A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' };

let deck = [];
let player = [];
let dealer = [];
let stake = 0;
let doubled = false;
let inHand = false;

function cardEl(card, hidden = false) {
  const el = document.createElement('div');
  el.className = 'card';
  if (hidden) {
    el.classList.add('is-hidden');
    el.setAttribute('aria-label', 'Face-down card');
    return el;
  }
  if (card.suit === '♥' || card.suit === '♦') el.classList.add('is-red');
  el.textContent = `${card.rank}${card.suit}`;
  el.setAttribute('aria-label', `${RANK_NAMES[card.rank] ?? card.rank} of ${SUIT_NAMES[card.suit]}`);
  return el;
}

function render() {
  els.player.replaceChildren(...player.map((c) => cardEl(c)));
  // The dealer's second card stays face down until the player is done.
  els.dealer.replaceChildren(...dealer.map((c, i) => cardEl(c, inHand && i === 1)));
  els.playerTotal.textContent = player.length ? `(${handValue(player).total})` : '';
  els.dealerTotal.textContent = dealer.length && !inHand ? `(${handValue(dealer).total})` : '';
  els.hit.disabled = !inHand;
  els.stand.disabled = !inHand;
  els.double.disabled = !inHand || player.length !== 2 || !wallet.canAfford(stake);
  els.deal.disabled = inHand;
  els.stake.disabled = inHand;
}

function say(text, tone = '') {
  els.status.textContent = text;
  els.status.className = `replay-status${tone ? ` is-${tone}` : ''}`;
}

function finish() {
  inHand = false;
  const { result, returned } = settleHand(player, dealer, stake, doubled);
  if (returned > 0) wallet.credit(returned);
  const bet = doubled ? stake * 2 : stake;
  const messages = {
    blackjack: [`Blackjack! You get ${returned} credits back.`, 'win'],
    win: [`You win! ${returned} credits back on a ${bet}-credit bet.`, 'win'],
    push: [`Push. Your ${returned} credits are returned.`, ''],
    lose: [handValue(player).total > 21 ? `Bust. You lose ${bet} credits.` : `Dealer wins. You lose ${bet} credits.`, 'loss'],
  };
  say(...messages[result]);
  render();
}

function dealerPlays() {
  while (dealerShouldHit(dealer)) dealer.push(deck.pop());
  finish();
}

function deal() {
  const check = validateStake(els.stake.value, wallet.getBalance());
  if (!check.ok) { say(check.error, 'loss'); return; }
  wallet.debit(check.stake);
  stake = check.stake;
  doubled = false;
  deck = newDeck();
  player = [deck.pop(), deck.pop()];
  dealer = [deck.pop(), deck.pop()];
  inHand = true;
  say('Hit or stand?');
  if (isBlackjack(player) || isBlackjack(dealer)) { finish(); return; }
  render();
}

function hit() {
  player.push(deck.pop());
  if (handValue(player).total > 21) { finish(); return; }
  render();
}

function doubleDown() {
  if (!wallet.debit(stake)) return;
  doubled = true;
  player.push(deck.pop());
  if (handValue(player).total > 21) { finish(); return; }
  dealerPlays();
}

if (els.deal) {
  els.deal.addEventListener('click', deal);
  els.hit.addEventListener('click', hit);
  els.stand.addEventListener('click', dealerPlays);
  els.double.addEventListener('click', doubleDown);
  render();
}
