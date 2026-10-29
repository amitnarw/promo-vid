/**
 * DomReplay — shows a tab recorded by capture/take.ts exactly as it was at a
 * given wall-clock moment. The DOM state comes from rrweb; CSS animations
 * (web-mcp's pill, glow, tooltips) are seeked by hand to where they were at
 * that moment, so every rendered frame is deterministic. Because it is real
 * DOM, a camera can scale it as far as it likes and text stays sharp.
 *
 * only: a CSS selector; when set, everything else is hidden and the page is
 * transparent (e.g. just web-mcp's pill and tooltip, floating).
 */
import { useEffect, useRef, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { Replayer } from "rrweb";

type Handle = { showAt: (wall: number) => Promise<void> };
type Ev = { type: number; timestamp: number; data: any; promoNew?: boolean };

// the take's frozen events, cached per tab so a render tab parses them once
const cache = new Map<string, Promise<{ events: Ev[] }>>();
function loadTab(take: string, tab: string) {
  const key = `${take}/${tab}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(staticFile(`takes/${take}/${tab}.json`))
        .then((r) => r.text())
        // asset URLs must be absolute: the replay document carries the original page's <base>
        .then((text) => ({ events: JSON.parse(text.replaceAll("promo-asset://", `${window.location.origin}${staticFile(`takes/${take}/assets/`)}`)) })),
    );
  }
  return cache.get(key)!;
}

/**
 * When each node was inserted, per recorder instance. rrweb's periodic checkouts
 * re-snapshot the same nodes with the same ids, which must not count as new
 * insertions (that would restart web-mcp's entrance animations every 10 s).
 */
function insertionTimes(events: Ev[]) {
  const starts: number[] = [];
  const added = new Map<string, number[]>();
  const push = (inst: number, id: number, t: number, onlyIfNew: boolean) => {
    const k = `${inst}:${id}`;
    const list = added.get(k);
    if (list) { if (!onlyIfNew) list.push(t); } else added.set(k, [t]);
  };
  const walk = (inst: number, n: any, t: number, onlyIfNew: boolean) => {
    if (!n) return;
    if (typeof n.id === "number") push(inst, n.id, t, onlyIfNew);
    for (const c of n.childNodes ?? []) walk(inst, c, t, onlyIfNew);
  };
  for (const e of events) {
    if (e.type === 2) {
      if (e.promoNew || starts.length === 0) starts.push(e.timestamp);
      walk(starts.length - 1, e.data.node, e.timestamp, true);
    } else if (e.type === 3 && e.data.source === 0 && starts.length) {
      for (const a of e.data.adds ?? []) walk(starts.length - 1, a.node, e.timestamp, false);
    }
  }
  const instanceAt = (wall: number) => Math.max(0, starts.filter((s) => s <= wall).length - 1);
  const bornAt = (inst: number, id: number, wall: number) => {
    const list = added.get(`${inst}:${id}`);
    if (!list) return undefined;
    let best: number | undefined;
    for (const t of list) if (t <= wall && (best === undefined || t > best)) best = t;
    return best;
  };
  return { instanceAt, bornAt, startOf: (inst: number) => starts[inst] ?? events[0].timestamp };
}

/**
 * Class and inline-style history per node, so the replay can run the page's own
 * CSS transitions (a rebuilt DOM has none): web-mcp fades its status text out,
 * swaps it and fades it back in, and slides its tooltip in, all with transitions.
 */
type Change = { t: number; key: string; kind: "class" | "style"; prop: string; v: string | null };
function attributeHistory(events: Ev[]) {
  const starts: number[] = [];
  const hist = new Map<string, { t: number; v: string | null }[]>(); // `${inst}:${id}|class` or `${inst}:${id}|style:${prop}`
  const changes: Change[] = [];
  const parseStyle = (s: string) => Object.fromEntries(s.split(";").map((d) => d.split(":")).filter((p) => p.length >= 2).map(([k, ...v]) => [k.trim(), v.join(":").trim()]));
  const record = (inst: number, id: number, t: number, kind: "class" | "style", prop: string, v: string | null, initial: boolean) => {
    const key = `${inst}:${id}|${kind === "class" ? "class" : `style:${prop}`}`;
    const list = hist.get(key);
    if (initial && list) return;
    if (list) list.push({ t, v }); else hist.set(key, [{ t, v }]);
    if (!initial) changes.push({ t, key: `${inst}:${id}`, kind, prop, v });
  };
  const initialAttrs = (inst: number, n: any, t: number, onlyIfNew: boolean) => {
    if (!n) return;
    if (typeof n.id === "number" && n.attributes) {
      record(inst, n.id, t, "class", "", n.attributes.class ?? null, onlyIfNew);
      if (typeof n.attributes.style === "string") for (const [k, v] of Object.entries(parseStyle(n.attributes.style))) record(inst, n.id, t, "style", k, v as string, onlyIfNew);
    }
    for (const c of n.childNodes ?? []) initialAttrs(inst, c, t, onlyIfNew);
  };
  for (const e of events) {
    if (e.type === 2) {
      if (e.promoNew || starts.length === 0) starts.push(e.timestamp);
      initialAttrs(starts.length - 1, e.data.node, e.timestamp, true);
    } else if (e.type === 3 && e.data.source === 0 && starts.length) {
      const inst = starts.length - 1;
      for (const a of e.data.adds ?? []) initialAttrs(inst, a.node, e.timestamp, true);
      for (const a of e.data.attributes ?? []) {
        const at = a.attributes ?? {};
        if ("class" in at) record(inst, a.id, e.timestamp, "class", "", at.class ?? null, false);
        if (typeof at.style === "string") for (const [k, v] of Object.entries(parseStyle(at.style))) record(inst, a.id, e.timestamp, "style", k, v as string, false);
        else if (at.style && typeof at.style === "object") for (const [k, v] of Object.entries(at.style)) record(inst, a.id, e.timestamp, "style", k, v === false ? null : Array.isArray(v) ? v[0] : (v as string), false);
      }
    }
  }
  changes.sort((x, y) => x.t - y.t);
  /** the latest change per node attribute in (wall - span, wall], with the value before it */
  const recent = (inst: number, wall: number, span: number) => {
    const latest = new Map<string, Change>();
    for (const c of changes) {
      if (c.t > wall) break;
      if (c.t > wall - span && c.key.startsWith(`${inst}:`)) latest.set(`${c.key}|${c.kind}|${c.prop}`, c);
    }
    return [...latest.values()].map((c) => {
      const list = hist.get(`${c.key}|${c.kind === "class" ? "class" : `style:${c.prop}`}`) ?? [];
      const before = list.filter((h) => h.t < c.t).at(-1);
      return { ...c, id: Number(c.key.split(":")[1]), prev: before ? before.v : null };
    });
  };
  return { recent };
}

function settle(doc: Document) {
  const images = [...doc.images].filter((i) => !i.complete);
  return Promise.race([
    Promise.all([doc.fonts.ready, ...images.map((i) => new Promise((r) => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); }))]),
    new Promise((r) => setTimeout(r, 4000)),
  ]);
}

function makeHandle(root: HTMLDivElement, events: Ev[], only?: string): Handle {
  const replayer = new Replayer(events as any, { root, skipInactive: false, showWarning: false, showDebug: false, mouseTail: false, UNSAFE_replayCanvas: true, triggerFocus: false });
  // rrweb's iframe can't scroll; the live window had a scrollbar taking 15px of layout
  replayer.iframe.setAttribute("scrolling", "yes");
  if (only) replayer.iframe.setAttribute("allowtransparency", "true");
  const born = insertionTimes(events);
  const attrs = attributeHistory(events);
  const start = events[0].timestamp;
  return {
    async showAt(wall: number) {
      replayer.pause(Math.max(0, wall - start));
      const doc = replayer.iframe.contentDocument!;
      doc.documentElement.classList.remove("rrweb-paused");
      if (only) {
        const s = doc.createElement("style");
        s.textContent = `:root{color-scheme:normal!important}html,body{background:transparent!important}
          body *{visibility:hidden!important} ${only.split(",").map((x) => `${x.trim()},${x.trim()} *`).join(",")}{visibility:visible!important}
          ::-webkit-scrollbar{width:15px;background:transparent}::-webkit-scrollbar-thumb{background:transparent}`;
        doc.head.appendChild(s);
      }
      const mirror = replayer.getMirror();
      const inst = born.instanceAt(wall);
      // run the page's own CSS transitions for what changed in the last moment: put each
      // changed class/style back to its previous value, let the browser compute that style,
      // then restore it so the browser starts the real transition, seeked below
      const changedAt = new Map<Node, number>();
      const restore: (() => void)[] = [];
      for (const c of attrs.recent(inst, wall, 800)) {
        const el = mirror.getNode(c.id) as HTMLElement | null;
        if (!el || el.nodeType !== 1 || !el.style) continue;
        if (c.kind === "class") {
          const cur = el.getAttribute("class");
          restore.push(() => (cur === null ? el.removeAttribute("class") : el.setAttribute("class", cur)));
          if (c.prev === null) el.removeAttribute("class"); else el.setAttribute("class", c.prev);
        } else {
          const cur = el.style.getPropertyValue(c.prop), pri = el.style.getPropertyPriority(c.prop);
          restore.push(() => (cur ? el.style.setProperty(c.prop, cur, pri) : el.style.removeProperty(c.prop)));
          if (c.prev === null) el.style.removeProperty(c.prop); else el.style.setProperty(c.prop, c.prev);
        }
        changedAt.set(el, Math.max(changedAt.get(el) ?? 0, c.t));
      }
      if (restore.length) {
        doc.defaultView!.getComputedStyle(doc.documentElement).opacity; // flush the "before" style
        for (const r of restore) r();
      }
      for (const anim of doc.getAnimations()) {
        const target = (anim.effect as KeyframeEffect | null)?.target as Node | null;
        if ("transitionProperty" in anim) {
          // a transition we just started: seek it to (wall - when its element, or an ancestor, changed)
          let at: number | undefined;
          for (let n = target; n && at === undefined; n = n.parentNode) at = changedAt.get(n);
          anim.pause();
          anim.currentTime = at === undefined ? 1e6 : Math.max(0, wall - at);
          continue;
        }
        // seek each CSS animation to (wall - when its element, or an ancestor, was really inserted)
        let at = born.startOf(inst);
        for (let n = (anim.effect as KeyframeEffect | null)?.target as Node | null; n; n = n.parentNode) {
          const b = born.bornAt(inst, mirror.getId(n), wall);
          if (b !== undefined && b > at) at = b;
        }
        anim.pause();
        anim.currentTime = Math.max(0, wall - at);
      }
      await settle(doc);
    },
  };
}

export const DomReplay: React.FC<{ take: string; tab: string; wall: number; width: number; height: number; only?: string }> = ({ take, tab, wall, width, height, only }) => {
  const root = useRef<HTMLDivElement>(null);
  const [handle, setHandle] = useState<Handle | null>(null);
  const [loading] = useState(() => delayRender(`replay ${take}/${tab}`));

  useEffect(() => {
    let alive = true;
    loadTab(take, tab)
      .then(({ events }) => {
        if (!alive || !root.current) return;
        setHandle(makeHandle(root.current, events, only));
        continueRender(loading);
      })
      .catch((e) => cancelRender(e));
    return () => { alive = false; };
  }, [take, tab, loading, only]);

  useEffect(() => {
    if (!handle) return;
    const frame = delayRender(`replay ${take}/${tab} @${wall}`);
    handle.showAt(wall).then(() => continueRender(frame)).catch((e) => cancelRender(e));
  }, [handle, wall, take, tab]);

  return (
    <div ref={root} className="dom-replay" style={{ width, height, position: "relative", overflow: "hidden", background: only ? "transparent" : "#fff" }}>
      {/* rrweb draws its own pointer and wrapper chrome; the product's own click markers are what we show */}
      <style>{`.dom-replay .replayer-mouse,.dom-replay .replayer-mouse-tail{display:none!important}.dom-replay .replayer-wrapper{position:relative}.dom-replay iframe{border:0;display:block;background:transparent}`}</style>
    </div>
  );
};
