// Builds demo/index.html: the app page as a standalone web demo.
// It loads fonts from Google Fonts, keeps its data under separate browser keys,
// starts with sample data, and shows a banner with a "Reset demo" button.
// Run after changing www/index.html: npm run demo
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "..", "demo");
let html = readFileSync(join(root, "www", "index.html"), "utf8");

function swap(from, to) {
  if (!html.includes(from)) throw new Error(`make-demo: expected to find ${JSON.stringify(from)} in www/index.html`);
  html = html.replace(from, to);
}

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
  + '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap">';

// Sample record, generated relative to today so the demo always looks current.
const SEED = `<script>
(() => {
  const KEY = "milk-record-demo";
  try { if (localStorage.getItem(KEY)) return; } catch { return; }
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const start = new Date(today); start.setDate(start.getDate() - 80);
  const months = {}, notes = {}, payments = [];
  const special = { 9: [0.75, "Seller was short, gave three quarters"], 23: [0, "Not delivered, seller on leave"], 37: [1.5, "Extra half litre for guests"], 52: [0.75, ""], 66: [0, "Not delivered, festival"], 74: [1.5, ""] };
  let litres = 0, i = 0;
  for (const d = new Date(start); d < today; d.setDate(d.getDate() + 1), i++) {
    const [q, note] = special[i] || [1, ""];
    const s = ymd(d), key = s.slice(0, 7);
    if (q) { (months[key] ||= {})[d.getDate()] = q; litres += q; }
    if (note) notes[s] = note;
    // pay at the end of every 30 days, the way a monthly milk bill usually goes
    if (i % 30 === 29) { payments.push({ id: "demo" + i, date: s, amount: litres * 50, note: i < 40 ? "Cash" : "UPI", rate: 50 }); litres = 0; }
  }
  localStorage.setItem(KEY, JSON.stringify({ app: "milk-record", version: 1, rate: 50, profile: { customer: "Asha Verma", seller: "Gopal Dairy" }, months, notes, payments }));
})();
</script>`;

const BANNER_CSS = `<style>
.demo-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  padding: 10px 14px; border-radius: 14px; background: var(--accent-soft); color: var(--ink); font-size: 14px; }
.demo-bar b { color: var(--accent); }
.demo-bar span { color: var(--muted); }
.demo-bar button { border: 1px solid var(--line); background: var(--surface); color: var(--accent); border-radius: 999px; padding: 6px 14px; font-weight: 700; }
</style>`;

const BANNER = `<div class="demo-bar" role="note">
    <div><b>Demo</b> <span>Sample data, saved only in this browser. Tap any day, open a bill, try the settings.</span></div>
    <button type="button" id="demoReset">Reset demo</button>
  </div>`;

const RESET = `<script>
document.getElementById("demoReset").addEventListener("click", (e) => {
  const b = e.currentTarget;
  if (!b.dataset.armed) { b.dataset.armed = "1"; b.textContent = "Tap again to reset"; setTimeout(() => { delete b.dataset.armed; b.textContent = "Reset demo"; }, 4000); return; }
  try { localStorage.removeItem("milk-record-demo"); localStorage.removeItem("milk-record-demo-settings"); } catch {}
  location.reload();
});
</script>`;

swap("<title>Milk Record</title>", '<title>Milk Record Demo</title>\n<meta name="description" content="Try Milk Record in your browser: log daily milk in fractional litres, see what you owe, and make bills for your milk seller.">');
swap('<link rel="stylesheet" href="fonts/fonts.css">', FONTS + "\n" + SEED + "\n" + BANNER_CSS);
swap('<div class="wrap">', '<div class="wrap">\n  ' + BANNER);
swap('const STORE_KEY = "milk-record";', 'const STORE_KEY = "milk-record-demo";');
swap('const SETTINGS_KEY = "milk-record-settings";', 'const SETTINGS_KEY = "milk-record-demo-settings";');
swap("</body>", RESET + "\n</body>");

mkdirSync(out, { recursive: true });
writeFileSync(join(out, "index.html"), html);
console.log("Wrote demo/index.html");
