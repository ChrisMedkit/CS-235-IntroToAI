// Shared JavaScript for every page: wallet display, mobile menu, data loading.
// Page-specific features (replay, blackjack, slots) import from this file.

import { createWallet } from './lib/wallet.js';
import { nextIndex } from './lib/carousel.js';

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

// ---------- Banner carousel (home page only) ----------
const SLIDE_MS = 6000;

function setUpBanner() {
  const banner = document.getElementById('banner');
  if (!banner) return;
  const slides = [...banner.querySelectorAll('.banner-slide')];
  const pauseBtn = banner.querySelector('.banner-pause');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let paused = reduceMotion;   // no auto-advance when the visitor asked for less motion
  let hovering = false;
  let timer = null;

  function show(i) {
    slides[index].classList.remove('is-active');
    index = i;
    slides[index].classList.add('is-active');
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!paused && !hovering) show(nextIndex(index, slides.length, 1));
    }, SLIDE_MS);
  }

  function setPaused(p) {
    paused = p;
    pauseBtn.textContent = p ? 'Play' : 'Pause';
    pauseBtn.setAttribute('aria-pressed', String(p));
  }

  banner.querySelector('.banner-prev').addEventListener('click', () => { show(nextIndex(index, slides.length, -1)); restart(); });
  banner.querySelector('.banner-next').addEventListener('click', () => { show(nextIndex(index, slides.length, 1)); restart(); });
  pauseBtn.addEventListener('click', () => setPaused(!paused));

  // Hold still while the visitor is reading or using the banner.
  banner.addEventListener('mouseenter', () => { hovering = true; });
  banner.addEventListener('mouseleave', () => { hovering = false; });
  banner.addEventListener('focusin', () => { hovering = true; });
  banner.addEventListener('focusout', () => { hovering = false; });

  setPaused(paused);
  restart();
}

// ---------- FAQ accordion (Play Safe page) ----------
// <details> already opens and closes without JavaScript; this keeps only one open at a time.
function setUpFaq() {
  const items = [...document.querySelectorAll('#faq details')];
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) items.forEach((other) => { if (other !== item) other.open = false; });
    });
  });
}

// Module scripts run after the HTML is parsed, so the DOM is ready here.
setUpWallet();
setUpNavToggle();
setUpBanner();
setUpFaq();
