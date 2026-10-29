/** capture/probe-rrweb3.ts — rrweb with buffered, async, chunked flush through a CDP binding */
import { spawn } from "child_process";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import { homedir, tmpdir } from "os";
import { join } from "path";
import puppeteer from "puppeteer-core";

const CHROME = join(homedir(), ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe");
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const UMD = readFileSync("node_modules/rrweb/dist/rrweb.umd.min.cjs", "utf8").replace(/\/\/# sourceMappingURL=.*$/m, "");
const REC = `(() => { if (window.__promoDomRec) return; window.__promoDomRec = true;
  const holder = {}; (function (define, exports, module) { ${UMD} }).call(holder);
  const send = window.__promoRrweb; let q = []; let timer = 0;
  const flush = () => { timer = 0; const batch = q; q = []; if (!batch.length) return;
    const s = JSON.stringify(batch); const CH = 400000;
    if (s.length <= CH) { send('1/1|' + s); return; }
    const id = Math.random().toString(36).slice(2), n = Math.ceil(s.length / CH);
    for (let i = 0; i < n; i++) send(id + ':' + (i + 1) + '/' + n + '|' + s.slice(i * CH, (i + 1) * CH)); };
  addEventListener('pagehide', flush);
  holder.rrweb.record({ emit(e) { e.wall = Date.now(); q.push(e); if (!timer) timer = setTimeout(flush, 120); },
    recordAfter: 'DOMContentLoaded', inlineStylesheet: true, collectFonts: true, recordCanvas: true, sampling: { canvas: 6, scroll: 50, input: 'last', mousemove: false } });
})();`;

const dir = mkdtempSync(join(tmpdir(), "rr-"));
const proc = spawn(CHROME, ["--headless=new", "--remote-debugging-port=9557", `--user-data-dir=${dir}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
for (let i = 0; i < 60; i++) { if (await fetch("http://127.0.0.1:9557/json/version").then((r) => r.ok).catch(() => false)) break; await wait(250); }
const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9557", defaultViewport: null, protocolTimeout: 15000 });
try {
  const [page] = await browser.pages();
  await page.goto("https://en.wikipedia.org/wiki/Eiffel_Tower");
  const s = await page.target().createCDPSession();
  const parts = new Map<string, string[]>(); let events = 0, bytes = 0; const types: Record<string, number> = {};
  s.on("Runtime.bindingCalled", (e) => {
    if (e.name !== "__promoRrweb") return;
    const bar = e.payload.indexOf("|"); const head = e.payload.slice(0, bar); const body = e.payload.slice(bar + 1);
    let json: string | null = null;
    if (head === "1/1") json = body;
    else { const [id, frac] = head.split(":"); const [i, n] = frac.split("/").map(Number); const arr = parts.get(id) ?? []; arr[i - 1] = body; parts.set(id, arr); if (arr.filter(Boolean).length === n) { json = arr.join(""); parts.delete(id); } }
    if (!json) return;
    bytes += json.length;
    for (const ev of JSON.parse(json)) { events++; const k = ev.type + (ev.data?.source !== undefined ? "/" + ev.data.source : ""); types[k] = (types[k] ?? 0) + 1; }
  });
  await s.send("Runtime.enable"); await s.send("Page.enable");
  await s.send("Runtime.addBinding", { name: "__promoRrweb" });
  let t = Date.now(); await s.send("Page.addScriptToEvaluateOnNewDocument", { source: REC }); console.log(`addScript ${Date.now() - t}ms`);
  t = Date.now(); await s.send("Runtime.evaluate", { expression: REC }); console.log(`evaluate ${Date.now() - t}ms`);
  await wait(2500); console.log(`static 2.5s: events=${events} bytes=${(bytes / 1e6).toFixed(2)}MB`, JSON.stringify(types));
  await page.goto("https://www.wikipedia.org/"); await page.type("#searchInput", "Eiffel"); await wait(2500);
  console.log(`after nav+typing: events=${events} bytes=${(bytes / 1e6).toFixed(2)}MB`, JSON.stringify(types));
} catch (e) { console.log("FAILED:", (e as Error).message.slice(0, 100)); }
await browser.disconnect(); proc.kill(); await wait(500); try { rmSync(dir, { recursive: true, force: true }); } catch {}
process.exit(0);
