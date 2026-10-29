/**
 * capture/freeze.ts — make a take's DOM recordings self-contained.
 *
 *   npx tsx capture/freeze.ts <take-id>
 *
 * Points every asset reference in the recordings (img src/srcset, stylesheets
 * rrweb couldn't inline, url() targets in CSS, fonts) at the bytes the live
 * page actually loaded during the take (takes/<id>/net, saved by take.ts), as
 * `promo-asset://<file>`. The replay component swaps that scheme for the served
 * path. Nothing is refetched; anything the page never loaded stays remote.
 *
 * Output: public/takes/<id>/<tab>.json (sorted events), assets/, manifest.json
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const id = process.argv[2];
if (!id) throw new Error("usage: freeze.ts <take-id>");
const TAKE = join(process.cwd(), "takes", id);
const OUT = join(process.cwd(), "public", "takes", id);
const ASSETS = join(OUT, "assets");
mkdirSync(ASSETS, { recursive: true });

const EXT: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp", "image/avif": "avif", "image/svg+xml": "svg",
  "image/x-icon": "ico", "image/vnd.microsoft.icon": "ico", "text/css": "css", "font/woff2": "woff2", "font/woff": "woff",
  "font/ttf": "ttf", "font/otf": "otf", "application/font-woff2": "woff2", "application/font-woff": "woff", "application/x-font-woff": "woff",
};
const CSS_URL = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
const abs = (u: string, base: string) => { try { return new URL(u, base).href; } catch { return u; } };

// url -> served file name, from what the live page loaded
type Net = { url: string; file: string; mime: string; type: string };
const net: Net[] = existsSync(join(TAKE, "net.jsonl")) ? readFileSync(join(TAKE, "net.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
const local = new Map<string, string>();
for (const n of net) local.set(n.url, `${n.file}.${EXT[n.mime] ?? n.url.match(/\.([a-z0-9]{2,5})(?:[?#]|$)/i)?.[1]?.toLowerCase() ?? "bin"}`);
const used = new Set<string>();
const swap = (u: string, base: string) => {
  const name = local.get(abs(u, base));
  if (!name) return null;
  used.add(name);
  return `promo-asset://${name}`;
};
const swapCss = (css: string, base: string) => css.replace(CSS_URL, (whole, q, u) => { const s = swap(u, base); return s ? `url(${q}${s}${q})` : whole; });

// stylesheets fetched as files: their url()s are relative to the sheet itself
for (const n of net) {
  const name = local.get(n.url)!;
  const src = join(TAKE, "net", n.file);
  // inside a saved stylesheet, plain file names: its fonts and images sit beside it
  if (n.mime === "text/css") writeFileSync(join(ASSETS, name), swapCss(readFileSync(src, "utf8"), n.url).replaceAll("promo-asset://", ""));
  else copyFileSync(src, join(ASSETS, name));
}

type Node = { tagName?: string; attributes?: Record<string, unknown>; childNodes?: Node[]; textContent?: string; isStyle?: boolean };
const ASSET_ATTRS = ["src", "poster", "data-src", "xlink:href"];
const linkIsAsset = (n: Node) => n.tagName === "link" && /icon|stylesheet|preload|apple-touch/i.test(String(n.attributes?.rel ?? ""));
function rewriteNode(n: Node, page: string) {
  const a = n.attributes;
  if (a) {
    for (const k of ASSET_ATTRS) if (typeof a[k] === "string") a[k] = swap(a[k] as string, page) ?? a[k];
    if (typeof a.srcset === "string") {
      // keep only the candidates the page actually loaded, so the replay can't pick a missing one
      const have = a.srcset.split(",").map((s) => s.trim().split(/\s+/)).map(([u, ...d]) => [swap(u, page), ...d]).filter(([u]) => u);
      if (have.length) a.srcset = have.map((p) => p.join(" ")).join(", ");
    }
    if (linkIsAsset(n) && typeof a.href === "string" && typeof a._cssText !== "string") a.href = swap(a.href, page) ?? a.href;
    if (typeof a._cssText === "string") a._cssText = swapCss(a._cssText, page);
    if (typeof a.style === "string") a.style = swapCss(a.style, page);
  }
  if (n.isStyle && typeof n.textContent === "string") n.textContent = swapCss(n.textContent, page);
  for (const c of n.childNodes ?? []) rewriteNode(c, page);
}

type Ev = { type: number; timestamp: number; data: Record<string, any>; promoNew?: boolean };
const manifest: Record<string, unknown> = {};
for (const tab of readdirSync(TAKE).filter((d) => existsSync(join(TAKE, d, "dom.jsonl")))) {
  const events: Ev[] = readFileSync(join(TAKE, tab, "dom.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).sort((x: Ev, y: Ev) => x.timestamp - y.timestamp);
  // Mark full snapshots that start a new recorder (a real navigation) apart from rrweb's
  // periodic checkouts of the same page: node ids only carry over across checkouts, which
  // is what the replay needs to know when an element was really inserted.
  const navs = existsSync(join(TAKE, tab, "events.jsonl"))
    ? readFileSync(join(TAKE, tab, "events.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((e) => e.k === "nav").map((e) => e.t as number)
    : [];
  let lastFull = -Infinity;
  for (const e of events) {
    if (e.type !== 2) continue;
    e.promoNew = lastFull === -Infinity || navs.some((t) => t > lastFull && t <= e.timestamp);
    lastFull = e.timestamp;
  }
  let page = "about:blank";
  for (const e of events) {
    if (e.type === 4) page = e.data.href;
    if (e.type === 2) rewriteNode(e.data.node, page);
    if (e.type === 3 && e.data.source === 0) {
      for (const add of e.data.adds ?? []) rewriteNode(add.node, page);
      for (const at of e.data.attributes ?? []) rewriteNode({ attributes: at.attributes }, page);
    }
    if (e.type === 3 && e.data.source === 8) for (const r of e.data.adds ?? []) if (typeof r.rule === "string") r.rule = swapCss(r.rule, page);
  }
  writeFileSync(join(OUT, `${tab}.json`), JSON.stringify(events));
  const pages = events.filter((e) => e.type === 4).map((e) => ({ t: e.timestamp, href: e.data.href, w: e.data.width, h: e.data.height }));
  manifest[tab] = { events: events.length, start: events[0]?.timestamp, end: events.at(-1)?.timestamp, pages };
  console.log(`${tab}: ${events.length} events, ${pages.map((p) => p.href).join(" → ")}`);
}
writeFileSync(join(OUT, "manifest.json"), JSON.stringify({ id, tabs: manifest, assetsLoaded: net.length, assetsReferenced: used.size }, null, 2));
console.log(`assets: ${net.length} loaded live, ${used.size} referenced by the recordings`);

// ---- timeline for the edit (imported by compositions): when pages appeared, what the
// agent did and said, where the page was touched, what the side panel showed ----
const jsonl = (f: string) => (existsSync(f) ? readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : []);
const take = JSON.parse(readFileSync(join(TAKE, "take.json"), "utf8"));
const timeline = {
  id, prompt: take.prompt, viewport: take.viewport, panel: take.panel,
  tabs: Object.fromEntries(Object.entries(manifest).map(([tab, m]) => {
    const events: Ev[] = JSON.parse(readFileSync(join(OUT, `${tab}.json`), "utf8"));
    // a page is on screen from its full snapshot, not its meta event (the old page stays until then)
    const pages = events.flatMap((e, i) => (e.type === 4 ? [{ href: e.data.href as string, shown: events.slice(i).find((x) => x.type === 2)?.timestamp ?? e.timestamp }] : []))
      .filter((p, i, all) => i === 0 || p.href !== all[i - 1].href);
    return [tab, { start: (m as { start: number }).start, pages }];
  })),
  touches: readdirSync(TAKE).filter((d) => existsSync(join(TAKE, d, "events.jsonl"))).flatMap((tab) =>
    jsonl(join(TAKE, tab, "events.jsonl")).filter((e) => e.k !== "ctx" && e.k !== "vis" && !(e.url ?? "").startsWith("about:")).map((e) => ({ tab, ...e }))),
  tools: jsonl(join(TAKE, "agent.jsonl")).flatMap((a) => (a.msg?.message?.content ?? []).filter((c: any) => c.type === "tool_use").map((c: any) => ({ t: a.t, name: String(c.name).replace("mcp__web-mcp__", ""), input: c.input }))),
  says: jsonl(join(TAKE, "agent.jsonl")).flatMap((a) => (a.msg?.type === "assistant" ? (a.msg.message?.content ?? []).filter((c: any) => c.type === "text").map((c: any) => ({ t: a.t, text: c.text })) : [])),
  result: jsonl(join(TAKE, "agent.jsonl")).filter((a) => a.msg?.type === "result").map((a) => ({ t: a.t, text: a.msg.result }))[0] ?? null,
  sidebar: jsonl(join(TAKE, "sse.jsonl")).flatMap((s) => {
    const data = String(s.raw).split("\n").find((l: string) => l.startsWith("data: "));
    try { const st = JSON.parse(data!.slice(6)); return [{ t: s.t, active: st.active, task: st.taskName, last: st.actions?.at(-1)?.text ?? null, count: st.actions?.length ?? 0 }]; } catch { return []; }
  }).filter((s, i, all) => i === 0 || s.last !== all[i - 1].last || s.active !== all[i - 1].active),
};
mkdirSync(join(process.cwd(), "src", "takes"), { recursive: true });
writeFileSync(join(process.cwd(), "src", "takes", `${id}.json`), JSON.stringify(timeline, null, 1));
console.log(`timeline: ${timeline.touches.length} touches, ${timeline.tools.length} tool calls, ${timeline.sidebar.length} side-panel states → src/takes/${id}.json`);
