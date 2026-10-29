/**
 * scripts/sheet.ts — tile one region of several stills into a contact sheet,
 * to spot frame-to-frame jumps (flicker) without watching the video.
 *   npx tsx scripts/sheet.ts <out.jpg> <x,y,w,h> <cols> <still.jpg ...>
 */
import { readFileSync, writeFileSync } from "fs";
import { basename } from "path";
import puppeteer from "puppeteer-core";
import { homedir } from "os";
import { join } from "path";

const [out, rect, colsArg, ...files] = process.argv.slice(2);
const [x, y, w, h] = rect.split(",").map(Number);
const cols = Number(colsArg);
const scale = Math.min(1, 1800 / (cols * w));
const cells = files.map((f) => `<figure style="margin:0;width:${w * scale}px;height:${h * scale + 22}px;overflow:hidden;position:relative;color:#ccc;font:14px monospace">
  <div style="width:${w * scale}px;height:${h * scale}px;overflow:hidden;position:relative"><img src="data:image/jpeg;base64,${readFileSync(f).toString("base64")}" style="position:absolute;left:${-x * scale}px;top:${-y * scale}px;width:${1080 * scale}px"></div>
  <figcaption>${basename(f)}</figcaption></figure>`);
const browser = await puppeteer.launch({ executablePath: join(homedir(), ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe"), headless: true });
const page = await browser.newPage();
const width = Math.ceil(cols * (w * scale + 8) + 16);
await page.setViewport({ width, height: 400 });
await page.setContent(`<body style="margin:8px;background:#222;display:grid;grid-template-columns:repeat(${cols},${w * scale}px);gap:8px">${cells.join("")}</body>`);
await new Promise((r) => setTimeout(r, 300));
writeFileSync(out, await page.screenshot({ type: "jpeg", quality: 85, fullPage: true }));
await browser.close();
console.log(`sheet: ${out}`);
