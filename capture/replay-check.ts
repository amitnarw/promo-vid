/**
 * capture/replay-check.ts — replay a tab's DOM recording at high DPR at the
 * moments its 1 fps pixel references were taken, and write side-by-side pairs
 * (live reference | replay) so fidelity can be judged by eye.
 *
 *   npx tsx capture/replay-check.ts takes/<id>/<tab-dir> [count=6] [dpr=2.5]
 */
import { spawn } from "child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs";
import { createServer } from "http";
import { homedir, tmpdir } from "os";
import { join, resolve } from "path";
import puppeteer from "puppeteer-core";

const CHROME = join(homedir(), ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe");
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const tabDir = resolve(process.argv[2]);
const count = Number(process.argv[3] ?? 6);
const dpr = Number(process.argv[4] ?? 2.5);

const events = readFileSync(join(tabDir, "dom.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).sort((a, b) => a.timestamp - b.timestamp);
const t0 = events[0].timestamp;
const meta = events.find((e) => e.type === 4).data as { width: number; height: number };
// only moments after the tab reached a real page (before that the agent is still starting up)
const firstReal = events.find((e) => e.type === 4 && /^https?:/.test(e.data.href))?.timestamp ?? t0;
const refs = readdirSync(join(tabDir, "ref")).map((f) => Number(f.replace(".jpg", ""))).filter((t) => t >= firstReal).sort((a, b) => a - b);
const picks = Array.from({ length: Math.min(count, refs.length) }, (_, i) => refs[Math.floor(((i + 0.5) * refs.length) / Math.min(count, refs.length))]);

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/rrweb.css">
<style>html,body{margin:0;background:#000} #root{width:${meta.width}px;height:${meta.height}px;overflow:hidden;position:relative}
.replayer-wrapper{transform:none!important} .replayer-mouse,.replayer-mouse-tail{display:none!important}</style>
</head><body><div id="root"></div><script src="/rrweb.js"></script><script>
fetch('/events.json').then(r => r.json()).then(events => {
  const replayer = new rrweb.Replayer(events, { root: document.getElementById('root'), skipInactive: false, showWarning: false, mouseTail: false, UNSAFE_replayCanvas: true, triggerFocus: false });
  // when each replayed node last appeared or changed (wall ms), rebuilt on every pause(t)
  let changed = new WeakMap(), snapAt = 0;
  replayer.on('event-cast', (e) => {
    const mirror = replayer.getMirror();
    if (e.type === 2) { changed = new WeakMap(); snapAt = e.timestamp; }
    if (e.type === 3 && e.data.source === 0) {
      for (const a of e.data.adds) { const n = mirror.getNode(a.node.id); if (n) changed.set(n, e.timestamp); }
      for (const a of e.data.attributes) { const n = mirror.getNode(a.id); if (n) changed.set(n, e.timestamp); }
    }
  });
  // show the frame at wall-clock time t exactly: DOM state from rrweb, CSS animations seeked by hand
  window.showAt = (t) => {
    replayer.pause(t - events[0].timestamp);
    const doc = replayer.iframe.contentDocument;
    doc.documentElement.classList.remove('rrweb-paused');
    if (!doc.getElementById('promo-scrollbar')) {
      const s = doc.createElement('style'); s.id = 'promo-scrollbar';
      // headless hides native scrollbars; a styled one takes layout width like the live window's
      s.textContent = '::-webkit-scrollbar{width:15px;height:15px}::-webkit-scrollbar-track{background:#f1f1f1}::-webkit-scrollbar-thumb{background:#c1c1c1;border:3px solid #f1f1f1;border-radius:8px}';
      doc.head.appendChild(s);
    }
    for (const anim of doc.getAnimations()) {
      let el = anim.effect && anim.effect.target, start = snapAt;
      for (; el; el = el.parentNode) { const c = changed.get(el); if (c !== undefined && c > start) start = c; }
      anim.pause();
      anim.currentTime = Math.max(0, t - start);
    }
    return doc.getAnimations().length;
  };
  window.ready = true;
});
</script></body></html>`;
const files: Record<string, [string, string | Buffer]> = {
  "/": ["text/html", html],
  "/rrweb.js": ["text/javascript", readFileSync("node_modules/rrweb/dist/rrweb.umd.min.cjs")],
  "/rrweb.css": ["text/css", readFileSync("node_modules/rrweb/dist/style.min.css")],
  "/events.json": ["application/json", JSON.stringify(events)],
};
const server = createServer((req, res) => {
  const f = files[(req.url ?? "/").split("?")[0]];
  if (!f) return void res.writeHead(404).end();
  res.writeHead(200, { "Content-Type": f[0] }).end(f[1]);
}).listen(3092, "127.0.0.1");

const dir = mkdtempSync(join(tmpdir(), "replay-"));
const proc = spawn(CHROME, ["--headless=new", "--remote-debugging-port=9560", `--user-data-dir=${dir}`, "--no-first-run", `--force-device-scale-factor=${dpr}`, `--window-size=${meta.width},${meta.height}`, "about:blank"], { stdio: "ignore" });
for (let i = 0; i < 60; i++) { if (await fetch("http://127.0.0.1:9560/json/version").then((r) => r.ok).catch(() => false)) break; await wait(250); }
const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9560", defaultViewport: null, protocolTimeout: 60000 });
const [page] = await browser.pages();
await page.setViewport({ width: meta.width, height: meta.height, deviceScaleFactor: dpr });
await page.goto("http://127.0.0.1:3092/");
await page.waitForFunction("window.ready === true");

const out = join(tabDir, "replay-check");
mkdirSync(out, { recursive: true });
for (const t of picks) {
  const anims = await page.evaluate((at) => (window as unknown as { showAt(t: number): number }).showAt(at), t);
  // let images, fonts and stylesheets inside the replay iframe settle
  await page.evaluate(async () => {
    const doc = (document.querySelector("iframe") as HTMLIFrameElement).contentDocument!;
    await doc.fonts.ready;
    await Promise.all([...doc.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 4000); })));
  });
  await wait(400);
  const shot = await page.screenshot({ type: "jpeg", quality: 90, clip: { x: 0, y: 0, width: meta.width, height: meta.height } });
  writeFileSync(join(out, `${t}-replay.jpg`), shot);
  // side-by-side page: live reference (left) | replay (right), both scaled to the same height
  const ref = readFileSync(join(tabDir, "ref", `${t}.jpg`)).toString("base64");
  const pair = await browser.newPage();
  await pair.setViewport({ width: 1800, height: 1200, deviceScaleFactor: 1 });
  await pair.setContent(`<body style="margin:0;background:#222;display:flex;gap:16px;padding:8px">
    <figure style="margin:0;color:#fff;font:14px sans-serif"><img src="data:image/jpeg;base64,${ref}" style="height:1150px"><figcaption>live reference</figcaption></figure>
    <figure style="margin:0;color:#fff;font:14px sans-serif"><img src="data:image/jpeg;base64,${shot.toString("base64")}" style="height:1150px"><figcaption>DOM replay @${dpr}x</figcaption></figure></body>`);
  await wait(300);
  writeFileSync(join(out, `${t}-pair.jpg`), await pair.screenshot({ type: "jpeg", quality: 80 }));
  await pair.close();
  console.log(`t+${((t - t0) / 1000).toFixed(1)}s → ${t}-pair.jpg (${anims} animations seeked)`);
}
await browser.disconnect(); proc.kill(); server.close(); await wait(500);
try { rmSync(dir, { recursive: true, force: true }); } catch {}
process.exit(0);
