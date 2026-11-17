// Shared JavaScript for every page: wallet display, mobile menu, data loading.
// Page-specific features (replay, blackjack, slots) import from this file.

import { createWallet } from './lib/wallet.js';

// ---------- Wallet ----------
// localStorage can throw (privacy modes), so test it before using it.
function getStorage() {
  try {
    const probe = '__mt_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return null;
  }
}

export const wallet = createWallet(getStorage());

// ---------- Data loading ----------
// One place decides where data comes from. A future server only changes DATA_BASE.
export const DATA_BASE = 'data';

export async function loadData(sport, path) {
  const message = 'Could not load data. Open the site with Live Server or reload.';
  let response;
  try {
    response = await fetch(`${DATA_BASE}/${sport}/${path}`);
  } catch {
    throw new Error(message); // network error, or the page was opened as file://
  }
  if (!response.ok) throw new Error(message);
  try {
    return await response.json();
  } catch {
    throw new Error(message); // malformed JSON
  }
}

// ---------- Page setup ----------
function renderWallet(balance) {
  const amount = document.getElementById('wallet-balance');
  const empty = document.getElementById('wallet-empty');
  if (amount) amount.textContent = balance.toLocaleString();
  if (empty) empty.hidden = balance > 0;
}

function setUpWallet() {
  renderWallet(wallet.getBalance());
  wallet.onChange(renderWallet);
  document.getElementById('wallet-reset')?.addEventListener('click', () => {
    if (confirm('Reset credits to 1000?')) wallet.reset();
  });
}

function setUpNavToggle() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Module scripts run after the HTML is parsed, so the DOM is ready here.
setUpWallet();
setUpNavToggle();
