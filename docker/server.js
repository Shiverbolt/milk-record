// Milk Delivery Record: a tiny dependency-free server.
// Serves public/index.html and keeps all data in one JSON file under /data.
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT) || 8080;
const DATA_DIR = process.env.DATA_DIR || "/data";
const DB_FILE = path.join(DATA_DIR, "db.json");
const SEED_FILE = path.join(__dirname, "seed.json");
const INDEX = path.join(__dirname, "public", "index.html");

function load() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); } catch {}
  let seed = { months: {}, payments: [], rate: 50 };
  try { seed = JSON.parse(fs.readFileSync(SEED_FILE, "utf8")); } catch {}
  fs.mkdirSync(DATA_DIR, { recursive: true });
  save(seed);
  return seed;
}
function save(state) {
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

let db = load();

const isDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isMonth = (s) => /^\d{4}-\d{2}$/.test(s);

function send(res, code, body, type = "application/json") {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const p = url.pathname;
  try {
    if (req.method === "GET" && (p === "/" || p === "/index.html")) {
      return send(res, 200, fs.readFileSync(INDEX), "text/html; charset=utf-8");
    }
    if (req.method === "GET" && p === "/api/state") return send(res, 200, db);

    let m;
    if (req.method === "PUT" && (m = p.match(/^\/api\/months\/([\d-]+)$/)) && isMonth(m[1])) {
      const { days } = await readBody(req);
      const clean = {};
      for (const [d, q] of Object.entries(days || {})) {
        const n = Number(d), v = Number(q);
        if (n >= 1 && n <= 31 && v > 0 && v <= 20) clean[n] = Math.round(v * 100) / 100;
      }
      if (Object.keys(clean).length) db.months[m[1]] = clean; else delete db.months[m[1]];
      save(db);
      return send(res, 200, { ok: true });
    }
    if (req.method === "POST" && p === "/api/payments") {
      const { date, amount, note } = await readBody(req);
      if (!isDate(date) || !(Number(amount) > 0)) return send(res, 400, { error: "A payment needs a date and an amount above zero." });
      const pay = { id: crypto.randomUUID(), date, amount: Number(amount), note: String(note || "").slice(0, 80) };
      db.payments.push(pay);
      save(db);
      return send(res, 201, pay);
    }
    if (req.method === "DELETE" && (m = p.match(/^\/api\/payments\/([\w-]+)$/))) {
      db.payments = db.payments.filter((x) => x.id !== m[1]);
      save(db);
      return send(res, 200, { ok: true });
    }
    if (req.method === "PUT" && p === "/api/settings") {
      const { rate } = await readBody(req);
      if (!(Number(rate) >= 0)) return send(res, 400, { error: "Rate must be a number." });
      db.rate = Number(rate);
      save(db);
      return send(res, 200, { ok: true });
    }
    send(res, 404, { error: "Not found" });
  } catch (e) {
    console.error(e);
    send(res, 400, { error: "Bad request" });
  }
});

server.listen(PORT, "0.0.0.0", () => console.log(`Milk Delivery Record on :${PORT}, data in ${DB_FILE}`));
