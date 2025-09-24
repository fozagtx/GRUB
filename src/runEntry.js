// src/runEntry.js
// Keeps the most recent entry-fee payment (txHash + address + paidAtMs)
// so the client can submit the score right after a run.

let entry = null; // { txHash, address, paidAtMs }

export function setEntryPayment({ txHash, address, paidAtMs }) {
  entry = { txHash, address, paidAtMs: paidAtMs ?? Date.now() };
}

export function getEntryPayment() {
  return entry;
}

export function clearEntryPayment() {
  entry = null;
}

// Client-side freshness hint (server also enforces ~30 min)
export function hasFreshEntry(maxMinutes = 30) {
  if (!entry) return false;
  const age = Date.now() - (entry.paidAtMs ?? 0);
  return age >= 0 && age <= maxMinutes * 60 * 1000;
}

// 🔗 Expose to window so non-module wallet code (index.html) can set it
if (typeof window !== "undefined") {
  window.kgrSetEntryPayment   = setEntryPayment;
  window.kgrClearEntryPayment = clearEntryPayment;
  window.kgrHasFreshEntry     = hasFreshEntry;
  window.kgrGetEntryPayment   = getEntryPayment;
}
