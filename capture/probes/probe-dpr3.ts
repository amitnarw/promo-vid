/**
 * capture/probe-dpr3.ts — can screenshot throughput reach usable fps?
 * Varies DPR, JPEG quality, concurrency, and GPU flags for headless.
 */
import { spawn } from "child_process";
import { mkdtempSync, rmSync } from "fs";
import { homedir, tmpdir } from "os";
import { join } from "path";
import puppeteer, { type CDPSession } from "puppeteer-core";

const CHROME = join(homedir(), ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe");
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ANIM = `document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;left:40px;top:40px;width:80px;height:80px;background:#07f;animation:s 1s linear infinite"></div><style>@keyframes s{to{transform:rotate(360deg)}}</style>')`;

async function open(flags: string[]) {
  const dir = mkdtempSync(join(tmpdir(), "dpr-"));
  const port = 9400 + Math.floor(Math.random() * 400);
  const proc = spawn(CHROME, [`--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, "--no-first-run", ...flags, "about:blank"], { stdio: "ignore" });
  for (let i = 0; i < 60; i++) {
    if (await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.ok).catch(() => false)) break;
    await wait(250);
  }
  const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${port}`, defaultViewport: null });
  const [page] = await browser.pages();
  const close = async () => { await browser.disconnect(); proc.kill(); await wait(600); try { rmSync(dir, { recursive: true, force: true }); } catch {} };
  return { page, close };
}

async function loop(s: CDPSession, conc: number, quality: number, ms = 4000) {
  const t0 = Date.now(); let n = 0;
  const worker = async () => { while (Date.now() - t0 < ms) { await s.send("Page.captureScreenshot", { format: "jpeg", quality, optimizeForSpeed: true }); n++; } };
  await Promise.all(Array.from({ length: conc }, worker));
  return (n / (ms / 1000)).toFixed(1);
}

for (const [label, flags] of [
  ["headful", ["--window-size=1000,800"]],
  ["headless swiftshader", ["--headless=new", "--window-size=960,1280"]],
  ["headless gpu(d3d11)", ["--headless=new", "--window-size=960,1280", "--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-gpu-rasterization"]],
] as const) {
  const { page, close } = await open([...flags]);
  const s = await page.target().createCDPSession();
  await page.goto("https://en.wikipedia.org/wiki/Eiffel_Tower");
  await page.evaluate(ANIM);
  const gpu = await page.evaluate(() => { const c = document.createElement("canvas").getContext("webgl"); const d = c?.getExtension("WEBGL_debug_renderer_info"); return d ? String(c!.getParameter(d.UNMASKED_RENDERER_WEBGL)).slice(0, 50) : "none"; });
  const rows: string[] = [];
  for (const dpr of [2.25, 1.75]) {
    await s.send("Emulation.setDeviceMetricsOverride", { width: 960, height: 1280, deviceScaleFactor: dpr, mobile: false });
    await wait(300);
    rows.push(`dpr${dpr}: q85 x1=${await loop(s, 1, 85)} x3=${await loop(s, 3, 85)} | q70 x3=${await loop(s, 3, 70)}`);
  }
  // screencast rate at 2.25 for comparison
  let n = 0;
  s.on("Page.screencastFrame", (f) => { n++; s.send("Page.screencastAck", { sessionId: f.sessionId }).catch(() => {}); });
  await s.send("Emulation.setDeviceMetricsOverride", { width: 960, height: 1280, deviceScaleFactor: 2.25, mobile: false });
  await s.send("Page.startScreencast", { format: "jpeg", quality: 85, maxWidth: 4000, maxHeight: 4000 });
  await wait(3000);
  await s.send("Page.stopScreencast");
  console.log(`${label} [${gpu}] fps — ${rows.join(" ; ")} ; screencast=${(n / 3).toFixed(1)}`);
  await close();
}
process.exit(0);
