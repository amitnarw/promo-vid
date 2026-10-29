/**
 * DomReplay — shows a tab recorded by capture/take.ts exactly as it was at a
 * given wall-clock moment. The DOM state comes from rrweb; CSS animations
 * (web-mcp's pill, glow, tooltips) are seeked by hand to where they were at
 * that moment, so every rendered frame is deterministic. Because it is real
 * DOM, a camera can scale it as far as it likes and text stays sharp.
 */
import { useEffect, useRef, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { Replayer } from "rrweb";

type Handle = { showAt: (wall: number) => Promise<void>; start: number };

// the take's frozen events, cached per tab so a render tab parses them once
const cache = new Map<string, Promise<{ events: any[] }>>();
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

function settle(doc: Document) {
  const images = [...doc.images].filter((i) => !i.complete);
  return Promise.race([
    Promise.all([doc.fonts.ready, ...images.map((i) => new Promise((r) => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); }))]),
    new Promise((r) => setTimeout(r, 4000)),
  ]);
}

function makeHandle(root: HTMLDivElement, events: any[]): Handle {
  const replayer = new Replayer(events, { root, skipInactive: false, showWarning: false, showDebug: false, mouseTail: false, UNSAFE_replayCanvas: true, triggerFocus: false });
  // rrweb's iframe can't scroll; the live window had a scrollbar taking 15px of layout
  replayer.iframe.setAttribute("scrolling", "yes");
  // when each replayed node last appeared or changed, rebuilt on every pause(t)
  let changed = new WeakMap<Node, number>();
  let snapAt = events[0].timestamp;
  replayer.on("event-cast", (e: any) => {
    const mirror = replayer.getMirror();
    if (e.type === 2) { changed = new WeakMap(); snapAt = e.timestamp; }
    if (e.type === 3 && e.data.source === 0) {
      for (const a of e.data.adds) { const n = mirror.getNode(a.node.id); if (n) changed.set(n, e.timestamp); }
      for (const a of e.data.attributes) { const n = mirror.getNode(a.id); if (n) changed.set(n, e.timestamp); }
    }
  });
  const start = events[0].timestamp;
  return {
    start,
    async showAt(wall: number) {
      replayer.pause(Math.max(0, wall - start));
      const doc = replayer.iframe.contentDocument!;
      doc.documentElement.classList.remove("rrweb-paused");
      for (const anim of doc.getAnimations()) {
        let el = (anim.effect as KeyframeEffect | null)?.target as Node | null;
        let born = snapAt;
        for (; el; el = el.parentNode) { const c = changed.get(el); if (c !== undefined && c > born) born = c; }
        anim.pause();
        anim.currentTime = Math.max(0, wall - born);
      }
      await settle(doc);
    },
  };
}

export const DomReplay: React.FC<{ take: string; tab: string; wall: number; width: number; height: number }> = ({ take, tab, wall, width, height }) => {
  const root = useRef<HTMLDivElement>(null);
  const [handle, setHandle] = useState<Handle | null>(null);
  const [loading] = useState(() => delayRender(`replay ${take}/${tab}`));

  useEffect(() => {
    let alive = true;
    loadTab(take, tab)
      .then(({ events }) => {
        if (!alive || !root.current) return;
        setHandle(makeHandle(root.current, events));
        continueRender(loading);
      })
      .catch((e) => cancelRender(e));
    return () => { alive = false; };
  }, [take, tab, loading]);

  useEffect(() => {
    if (!handle) return;
    const frame = delayRender(`replay ${take}/${tab} @${wall}`);
    handle.showAt(wall).then(() => continueRender(frame)).catch((e) => cancelRender(e));
  }, [handle, wall, take, tab]);

  return (
    <div ref={root} className="dom-replay" style={{ width, height, position: "relative", overflow: "hidden", background: "#fff" }}>
      {/* rrweb draws its own pointer and wrapper chrome; the product's own click markers are what we show */}
      <style>{`.dom-replay .replayer-mouse,.dom-replay .replayer-mouse-tail{display:none!important}.dom-replay .replayer-wrapper{position:relative}.dom-replay iframe{border:0;display:block}`}</style>
    </div>
  );
};
