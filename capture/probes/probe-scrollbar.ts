/** capture/probe-scrollbar.ts — why no scrollbar inside the rrweb replay iframe? */
import { spawn } from "child_process";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import { createServer } from "http";
import { homedir, tmpdir } from "os";
import { join } from "path";
import puppeteer from "puppeteer-core";
const CHROME = join(homedir(), ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe");
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const tab = "takes/spike-wiki-04/page-94EC4A8D";
const events = readFileSync(join(tab, "dom.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).sort((a, b) => a.timestamp - b.timestamp);
const files: Record<string, [string, string | Buffer]> = {
  "/": ["text/html", `<!doctype html><link rel=stylesheet href=/rrweb.css><div id=root></div><script src=/rrweb.js></script><script>fetch('/e.json').then(r=>r.json()).then(ev=>{window.R=new rrweb.Replayer(ev,{root:root,showWarning:false,mouseTail:false});window.ready=1})</script>`],
  "/rrweb.js": ["text/javascript", readFileSync("node_modules/rrweb/dist/rrweb.umd.min.cjs")],
  "/rrweb.css": ["text/css", readFileSync("node_modules/rrweb/dist/style.min.css")],
  "/e.json": ["application/json", JSON.stringify(events)],
};
const server = createServer((q, s) => { const f = files[q.url!]; if (!f) return void s.writeHead(404).end(); s.writeHead(200, { "Content-Type": f[0] }).end(f[1]); }).listen(3093);
const dir = mkdtempSync(join(tmpdir(), "sb-"));
const proc = spawn(CHROME, ["--headless=new", "--remote-debugging-port=9561", `--user-data-dir=${dir}`, "about:blank"], { stdio: "ignore" });
for (let i = 0; i < 60; i++) { if (await fetch("http://127.0.0.1:9561/json/version").then((r) => r.ok).catch(() => false)) break; await wait(250); }
const b = await puppeteer.connect({ browserURL: "http://127.0.0.1:9561", defaultViewport: { width: 1000, height: 1300 } });
const [p] = await b.pages();
await p.goto("http://127.0.0.1:3093/"); await p.waitForFunction("window.ready");
const t = events.find((e) => e.type === 4 && /Eiffel/.test(e.data.href)).timestamp + 5000;
console.log(await p.evaluate((off) => {
  const R = (window as any).R; R.iframe.setAttribute("scrolling", "yes"); R.pause(off);
  const f = R.iframe as HTMLIFrameElement, d = f.contentDocument!, h = d.documentElement;
  const before = { iframeScrollingAttr: f.getAttribute("scrolling"), iframeSandbox: f.getAttribute("sandbox"), htmlOverflow: getComputedStyle(h).overflowY, bodyOverflow: getComputedStyle(d.body).overflowY, clientW: h.clientWidth, innerW: f.contentWindow!.innerWidth, scrollH: h.scrollHeight };
  const s = d.createElement("style"); s.textContent = "::-webkit-scrollbar{width:15px}::-webkit-scrollbar-thumb{background:#c1c1c1}"; d.head.appendChild(s);
  const after = { clientW: h.clientWidth };
  return JSON.stringify({ before, after });
}, t - events[0].timestamp));
await b.disconnect(); proc.kill(); server.close(); await wait(400); try { rmSync(dir, { recursive: true, force: true }); } catch {}
process.exit(0);
