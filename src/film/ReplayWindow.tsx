/**
 * ReplayWindow — a card on screen showing a real take through a moving camera.
 *
 * time: [[frame, takeSeconds], ...] — which moment of the take each frame shows
 *       (real time while it acts, skips while the agent thinks)
 * cams: page point at the window centre (x, y) and screen px per page px (s)
 * wins: the card's screen rect over time (x, y = centre)
 * The REAL RUN clock shows the take's true elapsed time, so skips stay visible.
 */
import type { CSSProperties } from "react";
import { DomReplay } from "../replay/DomReplay";
import { keyed, remap } from "./grid";

export type TakeTimeline = { id: string; prompt: string; viewport: { w: number; h: number }; tabs: Record<string, { start: number; pages: { href: string; shown: number }[] }> };
export type Cam = { f: number; x: number; y: number; s: number };
export type Win = { f: number; x: number; y: number; w: number; h: number; o: number };

/** how many times real speed the take plays at around frame f (averaged over a few frames) */
const speedAt = (time: [number, number][], f: number) => Math.abs(remap(time, f + 3) - remap(time, f - 3)) / (6 / 30);

export const ReplayWindow: React.FC<{
  take: TakeTimeline; tab: string; frame: number; time: [number, number][]; cams: Cam[]; wins: Win[];
  clock?: boolean; url?: boolean; radius?: number; style?: CSSProperties; requestAt?: number;
  /** show only these elements, floating (no page, no card): web-mcp's own pill and tooltip */
  only?: string;
  /** fade out while the take is fast-forwarded, where quick real state changes would read as flicker */
  calmOnly?: boolean;
}> = ({ take, tab, frame, time, cams, wins, clock = true, url = false, radius = 30, style, requestAt, only, calmOnly = false }) => {
  const t0 = take.tabs[tab].start;
  const takeS = remap(time, frame);
  const wall = t0 + takeS * 1000;
  const cam = keyed(cams, frame);
  const win = keyed(wins, frame);
  // fully visible up to 3x real speed, gone by 4.5x
  const calm = calmOnly ? Math.max(0, Math.min(1, (4.5 - speedAt(time, frame)) / 1.5)) : 1;
  if (win.o * calm <= 0.001) return null;
  if (only) {
    return (
      <div style={{ position: "absolute", left: win.x - win.w / 2, top: win.y - win.h / 2, width: win.w, height: win.h, opacity: win.o * calm, overflow: "hidden", filter: "drop-shadow(0 18px 36px rgba(0,0,0,0.55)) drop-shadow(0 0 28px rgba(0,122,255,0.25))", ...style }}>
        <div style={{ position: "absolute", left: win.w / 2 - cam.x * cam.s, top: win.h / 2 - cam.y * cam.s, transformOrigin: "0 0", transform: `scale(${cam.s})` }}>
          <DomReplay take={take.id} tab={tab} wall={wall} width={take.viewport.w} height={take.viewport.h} only={only} />
        </div>
      </div>
    );
  }
  const page = [...take.tabs[tab].pages].reverse().find((p) => p.shown <= wall);
  const host = page && /^https?:/.test(page.href) ? new URL(page.href).hostname.replace(/^www\./, "") : "";
  // elapsed since the request was sent (agent start), in the real run
  const since = Math.max(0, (wall - (requestAt ?? t0)) / 1000);
  const mm = String(Math.floor(since / 60)).padStart(2, "0");
  const ss = String(Math.floor(since % 60)).padStart(2, "0");
  return (
    <div style={{ position: "absolute", left: win.x - win.w / 2, top: win.y - win.h / 2, width: win.w, height: win.h, opacity: win.o, borderRadius: radius, overflow: "hidden", background: "#fff", boxShadow: "0 0 0 1px rgba(173,198,255,0.12), 0 50px 120px rgba(0,0,0,0.6)", ...style }}>
      <div style={{ position: "absolute", left: win.w / 2 - cam.x * cam.s, top: win.h / 2 - cam.y * cam.s, transformOrigin: "0 0", transform: `scale(${cam.s})` }}>
        <DomReplay take={take.id} tab={tab} wall={wall} width={take.viewport.w} height={take.viewport.h} />
      </div>
      {(clock || url) && (
        <div style={{ position: "absolute", left: 18, top: 16, right: 18, display: "flex", gap: 10, alignItems: "center", fontFamily: "Geist Mono", fontSize: 22, letterSpacing: "0.02em" }}>
          {clock && (
            <span style={{ background: "rgba(19,19,21,0.82)", color: "#adc6ff", padding: "7px 13px", borderRadius: 999, display: "flex", gap: 9, alignItems: "center" }}>
              <span style={{ width: 9, height: 9, borderRadius: 5, background: "#00a2ff", boxShadow: "0 0 10px #00a2ff" }} />
              REAL RUN · {mm}:{ss}
            </span>
          )}
          {url && host && <span style={{ background: "rgba(19,19,21,0.82)", color: "#e6ecff", padding: "7px 13px", borderRadius: 999 }}>{host}</span>}
        </div>
      )}
    </div>
  );
};
