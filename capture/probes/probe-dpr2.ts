/**
 * capture/probe-dpr2.ts — throughput of captureScreenshot at high DPR (headful),
 * and whether headless screencast honours force-device-scale-factor.
 */
import { spawn } from "child_process";
import { mkdtempSync, rmSync } from "fs";
import { homedir, tmpdir } from "os";
import { join } from "path";
import puppeteer from "puppeteer-core";

const CHROME = join(homedir(), ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe");
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jpegDims = (buf: Buffer) => {
  let i = 2;
  while (i < buf.length) {
    const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (m === 0xc0 || m === 0xc2) return `${buf.readUInt16BE(i + 7)}x${buf.readUInt16BE(i + 5)}`;
    i += 2 + len;
  }
  return "?";
};

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
  const close = async () => { await browser.disconnect(); proc.kill(); await wait(500); try { rmSync(dir, { recursive: true, force: true }); } catch {} };
  return { page, close };
}

const ANIM = `document.body.insertAdjacentHTML('beforeend','<div id=spin style="position:fixed;left:40px;top:40px;width:80px;height:80px;background:#07f;animation:s 1s linear infinite"></div><style>@keyframes s{to{transform:rotate(360deg)}}</style>')`;

{ // A. headful + override, screenshot loop
  const { page, close } = await open(["--window-size=1000,800"]);
  const s = await page.target().createCDPSession();
  await s.send("Emulation.setDeviceMetricsOverride", { width: 960, height: 1280, deviceScaleFactor: 2.25, mobile: false });
  await page.goto("https://en.wikipedia.org/wiki/Eiffel_Tower");
  await page.evaluate(ANIM);
  const t0 = Date.now(); let n = 0, dims = "";
  while (Date.now() - t0 < 4000) {
    const r = await s.send("Page.captureScreenshot", { format: "jpeg", quality: 90, optimizeForSpeed: true });
    dims = jpegDims(Buffer.from(r.data, "base64")); n++;
  }
  console.log(`A headful screenshot loop: ${(n / 4).toFixed(1)} fps at ${dims}`);
  await close();
}

for (const [name, flags, ov] of [
  ["B headless, force-dsf 2.25, window 960x1280", ["--headless=new", "--force-device-scale-factor=2.25", "--window-size=960,1280"], null],
  ["C headless, override 960x1280@2.25", ["--headless=new", "--window-size=960,1280"], { width: 960, height: 1280, deviceScaleFactor: 2.25 }],
] as const) {
  const { page, close } = await open([...flags]);
  const s = await page.target().createCDPSession();
  if (ov) await s.send("Emulation.setDeviceMetricsOverride", { ...ov, mobile: false });
  await page.goto("https://en.wikipedia.org/wiki/Eiffel_Tower");
  await page.evaluate(ANIM);
  let n = 0; const dims = new Set<string>();
  s.on("Page.screencastFrame", (f) => { n++; dims.add(jpegDims(Buffer.from(f.data, "base64"))); s.send("Page.screencastAck", { sessionId: f.sessionId }).catch(() => {}); });
  await s.send("Page.startScreencast", { format: "jpeg", quality: 90, maxWidth: 4000, maxHeight: 4000 });
  await wait(4000);
  const ua = await page.evaluate(() => navigator.userAgent);
  console.log(`${name}: ${(n / 4).toFixed(1)} fps at ${[...dims].join(",")} ua=${ua.includes("Headless") ? "HEADLESS-UA" : "normal"}`);
  await close();
}
process.exit(0);
