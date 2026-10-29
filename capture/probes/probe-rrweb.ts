/**
 * capture/probe-rrweb.ts — install the rrweb recorder without runImmediately
 * (that hangs the session) and see what it emits on a static page.
 */
import { spawn } from "child_process";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import { homedir, tmpdir } from "os";
import { join } from "path";
import puppeteer from "puppeteer-core";

const CHROME = join(homedir(), ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe");
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const UMD = readFileSync("node_modules/rrweb/dist/rrweb.umd.min.cjs", "utf8").replace(/\/\/# sourceMappingURL=.*$/m, "");
const REC = `(() => { if (window.__promoDomRec) return; window.__promoDomRec = true; const holder = {};
  (function (define, exports, module) { ${UMD} }).call(holder);
  holder.rrweb.record({ emit(e) { try { window.__promoRrweb(JSON.stringify(e)); } catch {} }, recordAfter: 'DOMContentLoaded', inlineStylesheet: true });
})();`;

const dir = mkdtempSync(join(tmpdir(), "rr-"));
const proc = spawn(CHROME, ["--headless=new", "--remote-debugging-port=9555", `--user-data-dir=${dir}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
for (let i = 0; i < 60; i++) { if (await fetch("http://127.0.0.1:9555/json/version").then((r) => r.ok).catch(() => false)) break; await wait(250); }
const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9555", defaultViewport: null, protocolTimeout: 20000 });
const [page] = await browser.pages();
await page.goto("https://en.wikipedia.org/wiki/Eiffel_Tower");
const s = await page.target().createCDPSession();
let n = 0;
const types: Record<string, number> = {};
const tally = () => JSON.stringify(types);
s.on("Runtime.bindingCalled", (e) => {
  n++;
  const j = JSON.parse(e.payload);
  const k = j.type + (j.data?.source !== undefined ? "/" + j.data.source : "");
  types[k] = (types[k] ?? 0) + 1;
});
await s.send("Runtime.enable");
await s.send("Page.enable");
await s.send("Runtime.addBinding", { name: "__promoRrweb" });
let t = Date.now();
await s.send("Page.addScriptToEvaluateOnNewDocument", { source: REC });
console.log(`addScript ok in ${Date.now() - t}ms`);
t = Date.now();
const r = await s.send("Runtime.evaluate", { expression: REC });
console.log(`evaluate ok in ${Date.now() - t}ms`, r.exceptionDetails?.text ?? "");
await wait(3000);
console.log(`3s on static page: events=${n}`, tally());
await page.goto("https://www.wikipedia.org/");
await wait(3000);
console.log(`after navigation: events=${n}`, tally());
await browser.disconnect(); proc.kill(); await wait(500); try { rmSync(dir, { recursive: true, force: true }); } catch {}
process.exit(0);
