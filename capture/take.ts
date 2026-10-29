/**
 * capture/take.ts — record one real take.
 *
 *   npx tsx capture/take.ts --id wiki-01 --prompt "Open Wikipedia and ..."
 *
 * 1. Launches web-mcp's own Chromium (same binary, profile, extension and
 *    flags as `web-mcp browser`) plus flags that keep a covered window painting.
 * 2. Attaches over CDP: lays every tab out at a fixed portrait viewport, records
 *    its DOM with rrweb (page + extension overlays, wall-clock stamped) so it
 *    can be replayed sharp at any zoom, logs pointer/keyboard/scroll events from
 *    an isolated world, and keeps a 1 fps pixel reference to check replays
 *    against. None of it changes what the page shows.
 *    (Pixel capture can't do it here: a visible window's screencast is capped at
 *    screen size and stalls under emulation, and high-DPR screenshots top out at
 *    ~2–5 fps on this CPU.)
 * 3. Opens the real sidepanel.html in a hidden headless Chromium, fed by the
 *    same live event stream, and records it the same way as its own layer.
 * 4. Runs headless Claude Code with web-mcp as its only MCP server and the
 *    user's plain-English prompt. Nothing about the clicks is scripted.
 *
 * Output: takes/<id>/ with <tab>/dom.jsonl, events.jsonl, ref/*.jpg, agent.jsonl, sse.jsonl, take.json
 */
import { spawn, execSync, type ChildProcess } from "child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync, appendFileSync, readFileSync, readdirSync } from "fs";
import { createServer } from "http";
import { homedir, tmpdir } from "os";
import { join, extname } from "path";
import puppeteer, { type Browser, type CDPSession, type Target } from "puppeteer-core";

const HOME = homedir();
const PKG = join(HOME, "AppData/Local/Author Software/nvm/installs/v22.23.2/node_modules/@amitnarw/web-mcp");
const CHROME = join(HOME, ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe");
const WEB_MCP_DIR = join(HOME, ".web-mcp");
const PROFILE = join(WEB_MCP_DIR, "chromium-profile-v2");
const EXT = join(WEB_MCP_DIR, "extension");
const CLAUDE = join(HOME, ".vscode/extensions/anthropic.claude-code-2.1.312-win32-x64/resources/native-binary/claude.exe");
const CDP_PORT = 9222;
const PANEL_CDP_PORT = 9333;
const PANEL_HTTP_PORT = 3091;
const WEB_MCP_PORT = 3026;

const arg = (name: string, fallback?: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const id = arg("id") ?? `take-${Date.now()}`;
const prompt = arg("prompt");
if (!prompt) throw new Error("--prompt is required");
const VW = Number(arg("vw", "960"));
const VH = Number(arg("vh", "1280"));
const PANEL_W = 420;
const model = arg("model");
const startUrl = arg("start", "about:blank")!;

const OUT = join(process.cwd(), "takes", id);
if (existsSync(OUT)) throw new Error(`take ${id} already exists`);
mkdirSync(OUT, { recursive: true });
const log = (file: string, o: object) => appendFileSync(join(OUT, file), JSON.stringify({ t: Date.now(), ...o }) + "\n");
const say = (s: string) => console.log(`[take ${id}] ${s}`);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function until(check: () => Promise<boolean>, ms: number, what: string) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await check().catch(() => false)) return;
    await wait(250);
  }
  throw new Error(`timed out waiting for ${what}`);
}
const cdpUp = (port: number) => () => fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.ok);

// ---- 1. web-mcp's Chromium, launched the way `web-mcp browser` does it ----
function launchWebMcpChrome(): ChildProcess {
  cpSync(join(PKG, "extension"), EXT, { recursive: true, force: true });
  writeFileSync(join(EXT, "env.js"), `globalThis.WEB_MCP_PORT = ${WEB_MCP_PORT};\n`);
  for (const d of [join(PROFILE, "Default", "Extensions"), join(PROFILE, "extensions_crx_cache")]) rmSync(d, { recursive: true, force: true });
  try {
    execSync(
      `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='chrome.exe'\\" | Where-Object { $_.CommandLine -like '*chromium-profile-v2*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`,
      { stdio: "ignore" },
    );
  } catch {}
  const args = [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${PROFILE}`,
    `--load-extension=${EXT}`,
    "--disable-blink-features=AutomationControlled",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-popup-blocking",
    "--disable-translate",
    "--disable-fre",
    "--disable-features=DisableLoadExtensionCommandLineSwitch,ExtensionDisableUnsupportedDeveloper,CalculateNativeWinOcclusion",
    // capture-only: keep painting when the window is covered or unfocused
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-background-timer-throttling",
    "--window-position=0,0",
    "--window-size=1100,820",
    startUrl,
  ];
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(ELECTRON_|OPENCODE_|VSCODE_|CLAUDE)/i.test(k)));
  return spawn(CHROME, args, { detached: true, stdio: "ignore", env });
}

// ---- 2. per-tab recorder ----
const INSTRUMENT = `(() => {
  if (window.__promoRecInstalled) return; window.__promoRecInstalled = true;
  const send = (o) => { try { __promoRec(JSON.stringify({ ...o, t: Date.now(), url: location.href })); } catch {} };
  const rect = (el) => { if (!el || !el.getBoundingClientRect) return null; const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); };
  const label = (el) => el ? ((el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('name') || el.getAttribute('placeholder'))) || (el.innerText || '').trim().slice(0, 60)) : '';
  addEventListener('pointerdown', (e) => send({ k: 'down', x: e.clientX, y: e.clientY, r: rect(e.target), tag: e.target.tagName, label: label(e.target) }), true);
  addEventListener('click', (e) => send({ k: 'click', x: e.clientX, y: e.clientY, r: rect(e.target), tag: e.target.tagName, label: label(e.target) }), true);
  addEventListener('focusin', (e) => send({ k: 'focus', r: rect(e.target), tag: e.target.tagName, label: label(e.target) }), true);
  addEventListener('input', (e) => send({ k: 'input', r: rect(e.target), len: String(e.target.value ?? '').length }), true);
  addEventListener('keydown', (e) => send({ k: 'key', key: e.key.length === 1 ? 'char' : e.key }), true);
  let last = 0;
  addEventListener('scroll', () => { const n = Date.now(); if (n - last > 80) { last = n; send({ k: 'scroll', y: Math.round(scrollY) }); } }, true);
  document.addEventListener('visibilitychange', () => send({ k: 'vis', v: document.visibilityState }));
  send({ k: 'ctx', title: document.title, vis: document.visibilityState });
})();`;

// rrweb's UMD bundle, called with a private `this` so it never touches the page's
// globals or AMD loader; records the DOM (page + extension overlays) as events.
const RRWEB_UMD = readFileSync(join(process.cwd(), "node_modules/rrweb/dist/rrweb.umd.min.cjs"), "utf8").replace(/\/\/# sourceMappingURL=.*$/m, "");
// Top frame only: rrweb makes a hidden iframe for untainted prototypes, and a
// recorder injected into every new document would recurse into it forever.
// Events are batched and flushed asynchronously in <=400 KB chunks.
const DOM_RECORDER = `(() => {
  if (window.top !== window || window.__promoDomRec) return; window.__promoDomRec = true;
  const holder = {};
  (function (define, exports, module) { ${RRWEB_UMD} }).call(holder);
  const send = window.__promoRrweb;
  let q = [], timer = 0;
  const flush = () => {
    timer = 0;
    const batch = q; q = [];
    if (!batch.length) return;
    const s = JSON.stringify(batch), CH = 400000;
    try {
      if (s.length <= CH) return send('1/1|' + s);
      const id = Math.random().toString(36).slice(2), n = Math.ceil(s.length / CH);
      for (let i = 0; i < n; i++) send(id + ':' + (i + 1) + '/' + n + '|' + s.slice(i * CH, (i + 1) * CH));
    } catch {}
  };
  addEventListener('pagehide', flush);
  holder.rrweb.record({
    emit(e) { e.wall = Date.now(); q.push(e); if (!timer) timer = setTimeout(flush, 100); },
    recordAfter: 'DOMContentLoaded',
    recordCanvas: true,
    sampling: { canvas: 6, scroll: 50, input: 'last', mousemove: false },
    collectFonts: true,
    inlineStylesheet: true,
    checkoutEveryNms: 10000,
    maskAllInputs: false,
    maskInputOptions: { password: true },
  });
})();`;

type Tab = { dir: string; session: CDPSession; refs: number; timer?: NodeJS.Timeout };
const tabs = new Map<string, Tab>();

async function recordTab(target: Target, name: string, opts: { width: number; height: number; instrument: boolean; reference: boolean }) {
  const short = (target as unknown as { _targetId: string })._targetId.slice(0, 8);
  const dir = join(OUT, `${name}-${short}`);
  mkdirSync(join(dir, "ref"), { recursive: true });
  const session = await target.createCDPSession();
  const tab: Tab = { dir, session, refs: 0 };
  tabs.set(short, tab);
  // portrait layout; DPR stays native because sharpness now comes from the DOM replay
  const metrics = { width: opts.width, height: opts.height, deviceScaleFactor: 0, mobile: false };
  await session.send("Emulation.setDeviceMetricsOverride", metrics);
  await session.send("Runtime.enable");
  await session.send("Page.enable");
  await session.send("Runtime.addBinding", { name: "__promoRrweb" });
  const chunks = new Map<string, string[]>();
  session.on("Runtime.bindingCalled", (e) => {
    if (e.name === "__promoRec") appendFileSync(join(dir, "events.jsonl"), e.payload + "\n");
    if (e.name !== "__promoRrweb") return;
    const bar = e.payload.indexOf("|");
    const head = e.payload.slice(0, bar), body = e.payload.slice(bar + 1);
    let json = body;
    if (head !== "1/1") {
      const [cid, frac] = head.split(":");
      const [i, n] = frac.split("/").map(Number);
      const parts = chunks.get(cid) ?? [];
      parts[i - 1] = body;
      chunks.set(cid, parts);
      if (parts.filter((p) => p !== undefined).length < n) return;
      json = parts.join("");
      chunks.delete(cid);
    }
    for (const ev of JSON.parse(json)) appendFileSync(join(dir, "dom.jsonl"), JSON.stringify(ev) + "\n");
  });
  await session.send("Page.addScriptToEvaluateOnNewDocument", { source: DOM_RECORDER, runImmediately: true });
  if (opts.instrument) {
    await session.send("Runtime.addBinding", { name: "__promoRec", executionContextName: "promo-rec" });
    await session.send("Page.addScriptToEvaluateOnNewDocument", { source: INSTRUMENT, worldName: "promo-rec", runImmediately: true });
    session.on("Page.frameNavigated", (e) => {
      if (!e.frame.parentId) appendFileSync(join(dir, "events.jsonl"), JSON.stringify({ k: "nav", t: Date.now(), url: e.frame.url }) + "\n");
    });
  }
  // once a second: a pixel reference of the live tab (to check replays against) and a viewport watchdog
  if (opts.reference) {
    let busy = false;
    tab.timer = setInterval(async () => {
      if (busy) return;
      busy = true;
      try {
        const { result } = await session.send("Runtime.evaluate", { expression: "innerWidth + 'x' + innerHeight + ' ' + document.visibilityState" });
        const [size, vis] = String(result.value).split(" ");
        if (size !== `${opts.width}x${opts.height}`) {
          appendFileSync(join(dir, "events.jsonl"), JSON.stringify({ k: "viewport-reset", t: Date.now(), was: size }) + "\n");
          await session.send("Emulation.setDeviceMetricsOverride", metrics);
        }
        if (vis === "visible") {
          const t = Date.now();
          const shot = await session.send("Page.captureScreenshot", { format: "jpeg", quality: 70, optimizeForSpeed: true });
          writeFileSync(join(dir, "ref", `${t}.jpg`), Buffer.from(shot.data, "base64"));
          tab.refs++;
        }
      } catch {}
      busy = false;
    }, 1000);
  }
  say(`recording ${name} ${short} at ${opts.width}x${opts.height}`);
}

// ---- 3. the real side panel page, served as-is ----
function servePanel() {
  const types: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".woff": "font/woff", ".png": "image/png", ".json": "application/json" };
  const server = createServer((req, res) => {
    const p = join(EXT, decodeURIComponent((req.url ?? "/").split("?")[0]));
    if (!p.startsWith(EXT) || !existsSync(p)) return void res.writeHead(404).end();
    res.writeHead(200, { "Content-Type": types[extname(p)] ?? "application/octet-stream" }).end(readFileSync(p));
  });
  server.listen(PANEL_HTTP_PORT, "127.0.0.1");
  return server;
}

// ---- log the live side-panel stream too ----
async function tapEvents(stop: AbortSignal) {
  while (!stop.aborted) {
    try {
      const res = await fetch(`http://127.0.0.1:${WEB_MCP_PORT}/events`, { signal: stop });
      const reader = res.body!.getReader();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += new TextDecoder().decode(value);
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const p of parts) log("sse.jsonl", { raw: p });
      }
    } catch {
      await wait(500);
    }
  }
}

// ---- 4. the agent ----
function runAgent(): Promise<number> {
  // an empty folder outside the project, so the agent has nothing to read but the web
  const cwd = mkdtempSync(join(tmpdir(), `web-mcp-take-`));
  const mcp = join(OUT, "mcp.json");
  const launcher = join(process.cwd(), "capture", "web-mcp-launch.mjs");
  writeFileSync(mcp, JSON.stringify({ mcpServers: { "web-mcp": { type: "stdio", command: process.execPath, args: [launcher, PKG] } } }, null, 2));
  const args = ["-p", prompt!, "--mcp-config", mcp, "--strict-mcp-config", "--allowedTools", "mcp__web-mcp", "--disallowedTools", "Bash,Edit,Write,NotebookEdit,WebFetch,WebSearch,Task,Agent,Read,Grep,Glob", "--output-format", "stream-json", "--verbose"];
  if (model) args.push("--model", model);
  // ANTHROPIC_API_KEY removed so the run bills the logged-in Claude plan, not API credits
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== "ANTHROPIC_API_KEY" && !/^(CLAUDECODE|CLAUDE_CODE_|CLAUDE_AGENT_SDK|VSCODE_)/.test(k)));
  log("agent.jsonl", { start: true, prompt, args });
  return new Promise((resolve) => {
    const child = spawn(CLAUDE, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    let partial = "";
    child.stdout.on("data", (d) => {
      const lines = (partial + d.toString()).split(/\r?\n/);
      partial = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        let msg: unknown = line;
        try { msg = JSON.parse(line); } catch {}
        log("agent.jsonl", { msg });
        const m = msg as { type?: string; message?: { content?: { type: string; name?: string; text?: string; input?: unknown }[] }; result?: string };
        for (const c of m.message?.content ?? []) {
          if (c.type === "tool_use") say(`tool ${c.name} ${JSON.stringify(c.input).slice(0, 140)}`);
          if (c.type === "text" && c.text) say(`says: ${c.text.slice(0, 200)}`);
        }
        if (m.type === "result") say(`result: ${String(m.result).slice(0, 300)}`);
      }
    });
    child.stderr.on("data", (d) => log("agent.jsonl", { stderr: d.toString() }));
    child.on("close", (code) => resolve(code ?? -1));
  });
}

async function main() {
  const started = Date.now();
  say(`launching web-mcp Chromium`);
  launchWebMcpChrome();
  await until(cdpUp(CDP_PORT), 30000, "Chromium CDP");
  const browser: Browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${CDP_PORT}`, defaultViewport: null });
  const pageOpts = { width: VW, height: VH, instrument: true, reference: true };
  const seen = new Set<string>();
  const onTarget = async (t: Target) => {
    const tid = (t as unknown as { _targetId: string })._targetId;
    if (t.type() !== "page" || seen.has(tid) || t.url().startsWith("chrome-extension://") || t.url().startsWith("devtools://")) return;
    seen.add(tid);
    await recordTab(t, "page", pageOpts).catch((e) => say(`tab attach failed: ${e.message}`));
  };
  browser.on("targetcreated", onTarget);
  for (const t of browser.targets()) await onTarget(t);

  say(`starting side panel capture`);
  const server = servePanel();
  const panelDir = mkdtempSync(join(tmpdir(), "web-mcp-panel-"));
  const panelChrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PANEL_CDP_PORT}`, `--user-data-dir=${panelDir}`, "--no-first-run", `--window-size=${PANEL_W},${VH}`, "about:blank"], { stdio: "ignore" });
  await until(cdpUp(PANEL_CDP_PORT), 30000, "panel Chromium");
  const panelBrowser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${PANEL_CDP_PORT}`, defaultViewport: null });
  const [panelPage] = await panelBrowser.pages();
  await recordTab(panelPage.target(), "panel", { width: PANEL_W, height: VH, instrument: false, reference: true });
  await panelPage.goto(`http://127.0.0.1:${PANEL_HTTP_PORT}/sidepanel.html`);

  const stopTap = new AbortController();
  void tapEvents(stopTap.signal);

  say(`agent: ${prompt}`);
  const code = await runAgent();
  say(`agent exited ${code}; holding 3s for the last frames`);
  await wait(3000);

  stopTap.abort();
  for (const tab of tabs.values()) clearInterval(tab.timer);
  await panelBrowser.close().catch(() => {});
  panelChrome.kill();
  server.close();
  await browser.disconnect();
  await wait(800);
  try { rmSync(panelDir, { recursive: true, force: true }); } catch {}

  const summary = {
    id, prompt, model: model ?? "default", viewport: { w: VW, h: VH }, panel: { w: PANEL_W, h: VH },
    started, ended: Date.now(), agentExit: code,
    tabs: [...tabs.entries()].map(([k, t]) => {
      const dom = join(t.dir, "dom.jsonl");
      return { id: k, dir: t.dir.slice(OUT.length + 1), domEvents: existsSync(dom) ? readFileSync(dom, "utf8").split("\n").filter(Boolean).length : 0, refs: t.refs };
    }),
    webMcpSessions: readdirSync(join(WEB_MCP_DIR, "recordings")).filter((d) => d >= `session-${new Date(started).toISOString().replace(/[:.]/g, "-")}`),
  };
  writeFileSync(join(OUT, "take.json"), JSON.stringify(summary, null, 2));
  say(`done: ${JSON.stringify(summary.tabs)}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
