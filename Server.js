// KGR Global Leaderboard API (Public Net, Postgres-backed)

const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Pool } = require("pg");

// ---------- Config ----------
const HORIZON     = "https://horizon.stellar.org";
const KALE_CODE   = "KALE";
const KALE_ISSUER = "GBDVX4VELCDSQ54KQJYTNHXAHFLBCA77ZY2USQBM4CSHTTV7DME7KALE";
const TREASURY    = "GDIH6XE3UZ5CW37X3OKVS3SYKHG32PRPXPT3722NJ2AY3MOLCQNMUUTT";

// Env vars:
// DATABASE_URL  (required)
// KGR_CORS      (comma-separated allowed origins; empty = open for dev)
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// ---------- Boot ----------
async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS scores (
      id SERIAL PRIMARY KEY,
      address TEXT NOT NULL,
      score BIGINT NOT NULL,
      tx_hash TEXT NOT NULL UNIQUE,
      paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS scores_score_desc_idx ON scores(score DESC);`);
}
ensureSchema().catch(err => {
  console.error("Failed to init DB:", err);
  process.exit(1);
});

// ---------- Helpers ----------
function clampScore(raw) {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 1_000_000_000);
}
async function getJson(url){
  const r = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!r.ok) throw new Error(`Horizon error ${r.status}`);
  return r.json();
}
function isRecent(iso, minutes=30){
  try { return (Date.now() - new Date(iso).getTime()) <= minutes*60*1000; }
  catch { return false; }
}
async function txAlreadyUsed(txHash) {
  const { rows } = await pool.query(`SELECT 1 FROM scores WHERE tx_hash=$1 LIMIT 1`, [txHash]);
  return rows.length > 0;
}

// ---------- App ----------
const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "100kb" }));

const ALLOWED = (process.env.KGR_CORS || "").split(",").map(s=>s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!ALLOWED.length) return cb(null, true); // open during dev
    if (!origin) return cb(null, true); // allow curl/postman
    cb(null, ALLOWED.includes(origin));
  }
}));

app.use(rateLimit({
  windowMs: 30 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
}));

// POST /submitScore { txHash, address, score }
app.post("/submitScore", async (req, res) => {
  try {
    const { txHash, address, score } = req.body || {};
    if (!txHash || !address || typeof score !== "number") {
      return res.status(400).send("txHash, address, score required");
    }
    if (await txAlreadyUsed(txHash)) {
      return res.status(409).send("tx already used");
    }
    const normScore = clampScore(score);

    // 1) Fetch tx + verify success, recency
    const tx = await getJson(`${HORIZON}/transactions/${txHash}`);
    if (tx.successful !== true) return res.status(400).send("tx not successful");
    if (!isRecent(tx.created_at, 30)) return res.status(400).send("tx too old");

    // 2) Get ops & validate payment
    const opsPage = await getJson(`${HORIZON}/transactions/${txHash}/operations`);
    const ops = opsPage?._embedded?.records || [];
    const pay = ops.find(o => o.type === "payment"
      && o.to === TREASURY
      && (o.asset_type === "credit_alphanum4" || o.asset_type === "credit_alphanum12")
      && o.asset_code === KALE_CODE
      && o.asset_issuer === KALE_ISSUER
      && o.amount === "1.0000000"
      && o.from === address
    );
    if (!pay) return res.status(400).send("no valid KALE payment to treasury from address");

    // 3) Insert (uniqueness on tx_hash prevents replay)
    await pool.query(
      `INSERT INTO scores (address, score, tx_hash, paid_at) VALUES ($1,$2,$3,$4)`,
      [address, normScore, txHash, tx.created_at]
    );

    // Return updated top10
    const { rows } = await pool.query(
      `SELECT address, score, tx_hash as "txHash", paid_at as "paidAtISO"
       FROM scores ORDER BY score DESC, created_at ASC LIMIT 10`
    );
    return res.json({ ok: true, top10: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).send(e.message || "server error");
  }
});

// GET /leaderboard?limit=100
app.get("/leaderboard", async (req, res) => {
  const lim = Math.max(1, Math.min(Number(req.query.limit) || 50, 100));
  const { rows } = await pool.query(
    `SELECT address, score, tx_hash as "txHash", paid_at as "paidAtISO"
     FROM scores ORDER BY score DESC, created_at ASC LIMIT $1`, [lim]
  );
  res.json({ top: rows });
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`KGR leaderboard API on :${PORT}`));
