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

  // Read the saved balance; anything that isn't a whole number >= 0 means "start fresh".
  function load() {
    try {
      const raw = storage?.getItem(KEY);
      if (raw !== null && raw !== undefined && /^\d+$/.test(raw)) return Number(raw);
    } catch { /* storage blocked: fall through */ }
    return START_BALANCE;
  }

  let balance = load();

  function save() {
    try { storage?.setItem(KEY, String(balance)); } catch { /* keep the in-memory value */ }
    listeners.forEach((fn) => fn(balance));
  }

  return {
    getBalance: () => balance,
    canAfford: (n) => isWholePositive(n) && n <= balance,
    /** Take credits out. Returns false (and changes nothing) for a bad amount. */
    debit(n) {
      if (!isWholePositive(n) || n > balance) return false;
      balance -= n;
      save();
      return true;
    },
    /** Pay credits in (winnings or refunds). */
    credit(n) {
      if (!isWholePositive(n)) return;
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
