/**
 * Panels — the hero table (the agent's real result rows), the terminal (real
 * recorded install output) and the closing card.
 */
import { interpolate, useCurrentFrame } from "remotion";
import { out } from "./grid";

const shell = { background: "rgba(24,24,28,0.94)", border: "1px solid rgba(173,198,255,0.16)", borderRadius: 30, boxShadow: "0 50px 120px rgba(0,0,0,0.6)" } as const;
const rise = (f: number, at: number, d = 16) => interpolate(f, [at, at + d], [0, 1], { easing: out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** rows parsed from the agent's markdown table: "| # | Book | Price |" */
export function tableRows(markdown: string) {
  return markdown.split("\n").filter((l) => /^\|\s*\d+\s*\|/.test(l)).map((l) => l.split("|").map((c) => c.trim()).filter(Boolean)).map(([n, name, price]) => ({ n, name, price }));
}

export const TableCard: React.FC<{ rows: { n: string; name: string; price: string }[]; from: number; to: number; step: number; x: number; y: number; w: number; title: string; note: string }> = ({ rows, from, to, step, x, y, w, title, note }) => {
  const f = useCurrentFrame();
  if (f < from || f > to + 12) return null;
  const p = rise(f, from), e = interpolate(f, [to, to + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, padding: "28px 30px 22px", opacity: p * e, transform: `translateY(${(1 - p) * 40}px)`, ...shell }}>
      <div style={{ fontFamily: "Geist Mono", fontSize: 22, color: "#9ca3af", marginBottom: 14 }}>{title}</div>
      {rows.map((r, i) => {
        const q = rise(f, from + 10 + i * step, 14);
        return (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 20, padding: "14px 0", borderTop: i ? "1px solid rgba(173,198,255,0.10)" : "none", opacity: q, transform: `translateX(${(1 - q) * -28}px)` }}>
            <span style={{ fontFamily: "Geist Mono", fontSize: 26, color: "#00a2ff", width: 30 }}>{r.n}</span>
            <span style={{ flex: 1, fontFamily: "Geist Sans", fontSize: 36, color: "#e8eeff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em" }}>{r.name}</span>
            <span style={{ fontFamily: "Geist Sans", fontWeight: 600, fontSize: 40, color: "#ffffff", fontVariantNumeric: "tabular-nums" }}>{r.price}</span>
          </div>
        );
      })}
      <div style={{ fontFamily: "Geist Sans", fontSize: 22, color: "#9ca3af", marginTop: 10 }}>{note}</div>
    </div>
  );
};

type Chunk = { t: number; cmd: string; stream: string; text: string };
/** a terminal replaying recorded commands: each command typed, then its real output at its real pace (compressed by `speed`) */
export const TermCard: React.FC<{ chunks: Chunk[]; start: number; from: number; to: number; x: number; y: number; w: number; h: number; speed?: number; keep?: (cmd: string, line: string) => boolean }> = ({ chunks, start, from, to, x, y, w, h, speed = 8, keep = () => true }) => {
  const f = useCurrentFrame();
  if (f < from || f > to + 12) return null;
  const p = rise(f, from), e = interpolate(f, [to, to + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // timeline: typing each command takes ~1 s of screen time, output follows at `speed`x real time
  const lines: { text: string; dim?: boolean }[] = [];
  let screen = from + 8; // frame when the current item starts
  let last = start;
  for (const c of chunks) {
    const real = Math.max(0, c.t - last) / 1000;
    last = c.t;
    if (c.stream === "start") {
      screen += Math.min(real * 30 / speed, 12);
      const typed = Math.max(0, Math.min(c.text.length, Math.floor((f - screen) * 1.4)));
      if (f >= screen) lines.push({ text: `$ ${c.text.slice(0, typed)}` });
      screen += c.text.length / 1.4 + 6;
    } else if (c.stream === "out" || c.stream === "err") {
      screen += Math.min(real * 30 / speed, 30);
      if (f >= screen) for (const l of c.text.split(/\r?\n/)) if (l.trim() && keep(c.cmd, l)) lines.push({ text: l, dim: true });
    }
  }
  const visible = lines.slice(-Math.floor((h - 90) / 44));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, padding: "26px 30px", opacity: p * e, transform: `translateY(${(1 - p) * 30}px)`, overflow: "hidden", ...shell }}>
      <div style={{ display: "flex", gap: 9, marginBottom: 18 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 13, height: 13, borderRadius: 7, background: "#3a3a40" }} />)}</div>
      {visible.map((l, i) => (
        <div key={i} style={{ fontFamily: "Geist Mono", fontSize: l.dim ? 26 : 31, lineHeight: "44px", color: l.dim ? "#9ca3af" : "#ffffff", whiteSpace: "pre", overflow: "hidden", textOverflow: "ellipsis" }}>
          {l.dim ? l.text : <><span style={{ color: "#00a2ff" }}>$</span>{l.text.slice(1)}</>}
        </div>
      ))}
    </div>
  );
};

export const EndCard: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  if (f < from) return null;
  const a = rise(f, from), b = rise(f, from + 10), c = rise(f, from + 20);
  return (
    <>
      <div style={{ position: "absolute", top: 800, left: 60, right: 60, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
        <div style={{ padding: "26px 34px", borderRadius: 24, background: "linear-gradient(135deg, #005bc1 0%, #007aff 100%)", boxShadow: "0 30px 90px rgba(0,122,255,0.35)", fontFamily: "Geist Mono", fontSize: 38, color: "#fff", letterSpacing: "-0.01em" }}>
          npm install -g @amitnarw/web-mcp
        </div>
      </div>
      <div style={{ position: "absolute", top: 930, left: 60, right: 60, textAlign: "center", opacity: b, fontFamily: "Geist Sans", fontSize: 34, color: "#9ca3af" }}>
        then run <span style={{ fontFamily: "Geist Mono", color: "#adc6ff" }}>web-mcp</span> to connect your AI
      </div>
      <div style={{ position: "absolute", top: 1030, left: 80, right: 80, textAlign: "center", opacity: b, fontFamily: "Geist Sans", fontSize: 30, lineHeight: 1.5, color: "#e8eeff" }}>
        Works with Claude Code · Cursor · OpenCode · Windsurf · Zed · Codex · Cline
      </div>
      <div style={{ position: "absolute", top: 1200, left: 60, right: 60, textAlign: "center", opacity: c, fontFamily: "Geist Mono", fontSize: 30, color: "#adc6ff", lineHeight: 1.6 }}>
        github.com/amitnarw/web-mcp<br />amitnarwal.com
      </div>
    </>
  );
};
