// Copies the two typefaces into www/fonts so the app works fully offline.
import { mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "www", "fonts");
mkdirSync(out, { recursive: true });

const faces = [
  { pkg: "bricolage-grotesque", family: "Bricolage Grotesque", weights: [500, 700, 800] },
  { pkg: "figtree", family: "Figtree", weights: [400, 500, 600, 700] },
];

let css = "";
for (const { pkg, family, weights } of faces) {
  for (const w of weights) {
    const file = `${pkg}-latin-${w}-normal.woff2`;
    copyFileSync(join(root, "node_modules", "@fontsource", pkg, "files", file), join(out, file));
    css += `@font-face{font-family:"${family}";font-style:normal;font-weight:${w};font-display:swap;src:url(./${file}) format("woff2")}\n`;
  }
}
writeFileSync(join(out, "fonts.css"), css);
console.log(`Copied ${faces.reduce((n, f) => n + f.weights.length, 0)} font files to www/fonts`);
