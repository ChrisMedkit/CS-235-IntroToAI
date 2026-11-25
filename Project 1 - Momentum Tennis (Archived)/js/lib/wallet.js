// Play-money wallet shared by every page.
// The balance is a whole number of credits saved under one localStorage key.
// If storage is missing, blocked or holds junk, the wallet still works in memory.

export const START_BALANCE = 1000;
const KEY = 'mt_wallet';

const isWholePositive = (n) => Number.isInteger(n) && n > 0;

/**
 * @param {Storage|null} storage  localStorage (or a stand-in), or null for memory only
 */
export function createWallet(storage) {
  const listeners = [];

  // Start fresh unless storage holds a valid whole number.
  let balance = START_BALANCE;

  // Re-read the saved balance before every use, so another tab or a page restored
  // with the Back button can't overwrite newer credits with an old number.
  // Junk or blocked storage keeps the current in-memory balance.
  function sync() {
    try {
      const raw = storage?.getItem(KEY);
      if (raw !== null && raw !== undefined && /^\d+$/.test(raw)) balance = Number(raw);
    } catch { /* storage blocked: keep the in-memory value */ }
  }

  sync();

  function save() {
    try { storage?.setItem(KEY, String(balance)); } catch { /* keep the in-memory value */ }
    listeners.forEach((fn) => fn(balance));
  }

  return {
    getBalance() { sync(); return balance; },
    canAfford(n) { sync(); return isWholePositive(n) && n <= balance; },
    /** Take credits out. Returns false (and changes nothing) for a bad amount. */
    debit(n) {
      sync();
      if (!isWholePositive(n) || n > balance) return false;
      balance -= n;
      save();
      return true;
    },
    /** Pay credits in (winnings or refunds). */
    credit(n) {
      if (!isWholePositive(n)) return;
      sync();
      balance += n;
      save();
    },
    reset() {
      balance = START_BALANCE;
      save();
    },
    onChange(fn) { listeners.push(fn); },
  };
}
