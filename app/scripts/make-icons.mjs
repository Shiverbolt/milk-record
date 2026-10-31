// Draws the app icon and splash screens into assets/, which
// `npx capacitor-assets generate --android` turns into Android resources.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
mkdirSync(out, { recursive: true });

const BUTTER = "#F6C445", BUTTER_LIGHT = "#FFE38A", INK = "#3A2A12", MILK = "#FFFDF6", AMBER = "#B95E14";

// A milk bottle drawn inside a 1024 box, centred on (512, 512); `s` scales it.
const bottle = (s = 1) => `
  <g transform="translate(512 512) scale(${s}) translate(-512 -512)">
    <path d="M430 250 h164 v70 l58 86 v330 a48 48 0 0 1 -48 48 h-184 a48 48 0 0 1 -48 -48 v-330 l58 -86 z" fill="${MILK}"/>
    <path d="M372 560 q35 -26 70 0 t70 0 t70 0 t70 0 v176 a48 48 0 0 1 -48 48 h-184 a48 48 0 0 1 -48 -48 z" fill="${BUTTER_LIGHT}"/>
    <rect x="418" y="214" width="188" height="62" rx="20" fill="${AMBER}"/>
    <path d="M410 430 v250" stroke="${BUTTER}" stroke-width="22" stroke-linecap="round" opacity=".55"/>
  </g>`;
const bg = `<defs><radialGradient id="g" cx="30%" cy="20%" r="90%"><stop offset="0" stop-color="${BUTTER_LIGHT}"/><stop offset="1" stop-color="${BUTTER}"/></radialGradient></defs>`;
const svg = (body, w = 1024, h = 1024) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);

const files = {
  "icon-only.png": svg(`${bg}<rect width="1024" height="1024" fill="url(#g)"/>${bottle(0.9)}`),
  "icon-foreground.png": svg(bottle(0.62)),
  "icon-background.png": svg(`${bg}<rect width="1024" height="1024" fill="url(#g)"/>`),
  "splash.png": svg(`<rect width="2732" height="2732" fill="#FFF9EC"/><g transform="translate(854 854) scale(1)">${bottle(0.7).replace(/#FFFDF6/g, BUTTER).replace(/#FFE38A/g, MILK)}</g>`, 2732, 2732),
  "splash-dark.png": svg(`<rect width="2732" height="2732" fill="#16110A"/><g transform="translate(854 854) scale(1)">${bottle(0.7)}</g>`, 2732, 2732),
  "play-store-icon-512.png": svg(`${bg}<rect width="1024" height="1024" fill="url(#g)"/>${bottle(0.9)}`),
  "play-store-feature-1024x500.png": svg(`${bg}<rect width="1024" height="500" fill="url(#g)"/>
    <g transform="translate(-190 -262)">${bottle(0.62)}</g>
    <text x="470" y="235" font-family="Segoe UI, Arial, sans-serif" font-weight="800" font-size="76" fill="${INK}">Milk Record</text>
    <text x="472" y="295" font-family="Segoe UI, Arial, sans-serif" font-weight="500" font-size="32" fill="${INK}" opacity=".8">Daily litres, fair bills.</text>`, 1024, 500),
};

for (const [name, buf] of Object.entries(files)) {
  let img = sharp(buf).png();
  if (name === "play-store-icon-512.png") img = img.resize(512, 512);
  await img.toFile(join(out, name));
}
console.log("Wrote", Object.keys(files).join(", "));
