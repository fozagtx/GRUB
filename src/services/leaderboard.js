// src/services/leaderboard.js
import { getEntryPayment, hasFreshEntry, clearEntryPayment } from "/src/runEntry.js";

const API_BASE = "https://kgr-leaderboard-api.onrender.com";

/**
 * Submit the current run's score using the most recent on-chain entry fee.
 * Throws with a readable message if the API rejects it.
 */
export async function submitScoreNow(score) {
  // Client-side sanity (server still enforces freshness and tx rules)
  if (!hasFreshEntry()) {
    throw new Error("No fresh entry. Pay 1 KALE before the run.");
  }

  const entry = getEntryPayment();
  if (!entry?.txHash || !entry?.address) {
    throw new Error("Missing entry payment. Please pay 1 KALE and try again.");
  }

  const payload = {
    txHash: entry.txHash,
    address: entry.address,
    score: Number(score) || 0,
  };

  const res = await fetch(`${API_BASE}/submitScore`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Read response body always, so we can show detailed errors
  const text = await res.text();

  if (!res.ok) {
    // Common messages your server returns include:
    // "tx not successful", "memos not allowed", "tx too old",
    // "no valid KALE payment op to treasury from address", "tx already used"
    throw new Error(`API ${res.status}: ${text || "unknown error"}`);
  }

  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  // Success → prevent re-use from client side too
  clearEntryPayment();

  return data; // { ok: true, top10: [...] }
}
