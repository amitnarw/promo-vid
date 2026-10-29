/**
 * capture/probe-dpr.ts — which launch/emulation combo gives high-DPR screencast frames?
 *   npx tsx capture/probe-dpr.ts
 */
import { spawn } from "child_process";
import { mkdtempSync, rmSync } from "fs";
import { homedir, tmpdir } from "os";
import { join } from "path";
import puppeteer from "puppeteer-core";

const CHROME = join(homedir(), ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe");
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function probe(name: string, flags: string[], override: { width: number; height: number; deviceScaleFactor: number } | null) {
  const dir = mkdtempSync(join(tmpdir(), "dpr-"));
  const port = 9400 + Math.floor(Math.random() * 400);
  const proc = spawn(CHROME, [`--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, "--no-first-run", "--window-size=1000,800", ...flags, "about:blank"], { stdio: "ignore" });
  try {
    for (let i = 0; i < 60; i++) {
      if (await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.ok).catch(() => false)) break;
      await wait(250);
    }
    const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${port}`, defaultViewport: null });
    const [page] = await browser.pages();
    const s = await page.target().createCDPSession();
    if (override) await s.send("Emulation.setDeviceMetricsOverride", { ...override, mobile: false });
    await page.goto("https://example.com");
    const sizes: string[] = [];
    s.on("Page.screencastFrame", (f) => {
      const buf = Buffer.from(f.data, "base64");
      // JPEG SOF0/SOF2 dimensions
      let i = 2, dims = "?";
      while (i < buf.length) {
        const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
        if (m === 0xc0 || m === 0xc2) { dims = `${buf.readUInt16BE(i + 7)}x${buf.readUInt16BE(i + 5)}`; break; }
        i += 2 + len;
      }
      sizes.push(`${dims} (meta ${Math.round(f.metadata.deviceWidth!)}x${Math.round(f.metadata.deviceHeight!)})`);
      s.send("Page.screencastAck", { sessionId: f.sessionId }).catch(() => {});
    });
    await s.send("Page.startScreencast", { format: "jpeg", quality: 80, maxWidth: 4000, maxHeight: 4000 });
    await page.evaluate(() => { document.body.style.background = "#eef"; });
    await wait(800);
    const dpr = await page.evaluate(() => `${innerWidth}x${innerHeight}@${devicePixelRatio}`);
    console.log(`${name.padEnd(34)} page=${dpr.padEnd(16)} frames: ${[...new Set(sizes)].join(", ")}`);
    await browser.disconnect();
  } finally {
    proc.kill();
    await wait(500);
    try { rmSync(dir, { recursive: true, force: true }); } catch {}
  }
}

const ov = { width: 960, height: 1280, deviceScaleFactor: 2.25 };
await probe("headful, override 2.25", [], ov);
await probe("headful, force-dsf 2.25, override wh", ["--force-device-scale-factor=2.25"], { ...ov, deviceScaleFactor: 0 });
await probe("headful, force-dsf 2.25, override all", ["--force-device-scale-factor=2.25"], ov);
await probe("headless, override 3", ["--headless=new"], { width: 420, height: 1280, deviceScaleFactor: 3 });
await probe("headless, force-dsf 3, override wh", ["--headless=new", "--force-device-scale-factor=3"], { width: 420, height: 1280, deviceScaleFactor: 0 });
process.exit(0);
