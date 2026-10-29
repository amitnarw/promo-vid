/** capture/probe-rrweb2.ts — rrweb recorder buffering in-page (no binding): does record() return? */
import { spawn } from "child_process";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import { homedir, tmpdir } from "os";
import { join } from "path";
import puppeteer from "puppeteer-core";

const CHROME = join(homedir(), ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe");
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const UMD = readFileSync("node_modules/rrweb/dist/rrweb.umd.min.cjs", "utf8").replace(/\/\/# sourceMappingURL=.*$/m, "");
const variant = process.argv[2] ?? "holder";
const REC = variant === "holder"
  ? `(() => { const holder = {}; (function (define, exports, module) { ${UMD} }).call(holder);
      window.__ev = []; const t0 = performance.now();
      holder.rrweb.record({ emit(e) { window.__ev.push(e.type + (e.data && e.data.source !== undefined ? '/' + e.data.source : '')); } });
      return 'returned in ' + Math.round(performance.now() - t0) + 'ms'; })()`
  : `(() => { (function () { ${UMD} }).call(window); window.__ev = []; const t0 = performance.now();
      window.rrweb.record({ ...${process.argv[4] ?? '{}'}, emit(e) { window.__ev.push(e.type + (e.data && e.data.source !== undefined ? '/' + e.data.source : '')); } });
      return 'returned in ' + Math.round(performance.now() - t0) + 'ms'; })()`;

const dir = mkdtempSync(join(tmpdir(), "rr-"));
const proc = spawn(CHROME, ["--headless=new", "--remote-debugging-port=9556", `--user-data-dir=${dir}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
for (let i = 0; i < 60; i++) { if (await fetch("http://127.0.0.1:9556/json/version").then((r) => r.ok).catch(() => false)) break; await wait(250); }
const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9556", defaultViewport: null, protocolTimeout: 15000 });
try {
  const [page] = await browser.pages();
  await page.goto(process.argv[3] ?? "https://example.com");
  const s = await page.target().createCDPSession();
  const steps = (process.argv[5] ?? "").split(",");
  if (steps.includes("rt")) await s.send("Runtime.enable");
  if (steps.includes("pg")) await s.send("Page.enable");
  if (steps.includes("bind")) await s.send("Runtime.addBinding", { name: "__promoRrweb" });
  const r = await s.send("Runtime.evaluate", { expression: REC, returnByValue: true });
  console.log(variant, "record():", r.result.value ?? r.exceptionDetails?.exception?.description?.slice(0, 200));
  await wait(2000);
  const ev = await s.send("Runtime.evaluate", { expression: "JSON.stringify(window.__ev.reduce((a,k)=>(a[k]=(a[k]||0)+1,a),{}))", returnByValue: true });
  console.log("events after 2s:", ev.result.value);
} catch (e) { console.log("FAILED:", (e as Error).message.slice(0, 100)); }
await browser.disconnect(); proc.kill(); await wait(500); try { rmSync(dir, { recursive: true, force: true }); } catch {}
process.exit(0);
