/**
 * track — where things happen on screen, so the host can look at them.
 * touchTarget maps a take's logged touches (focus/click/typing) through a
 * ReplayWindow's camera to screen coordinates at any frame.
 */
import { keyed, remap } from "./grid";
import type { Cam, TakeTimeline, Win } from "./ReplayWindow";

type Touch = { tab: string; k: string; t: number; r?: number[] | null };

export function toScreen(cams: Cam[], wins: Win[], f: number, px: number, py: number) {
  const c = keyed(cams, f), w = keyed(wins, f);
  return { x: w.x + (px - c.x) * c.s, y: w.y + (py - c.y) * c.s };
}

/** screen point of the most recent touch at frame f (null before the first one) */
export function touchTarget(take: TakeTimeline & { touches: Touch[] }, tab: string, time: [number, number][], cams: Cam[], wins: Win[]) {
  const t0 = take.tabs[tab].start;
  const touches = take.touches.filter((e) => e.tab === tab && e.r && ["focus", "click", "input", "down"].includes(e.k)).sort((a, b) => a.t - b.t);
  return (f: number) => {
    const wall = t0 + remap(time, f) * 1000;
    const last = [...touches].reverse().find((e) => e.t <= wall);
    if (!last || !last.r) return null;
    const [x, y, w, h] = last.r;
    return toScreen(cams, wins, f, x + Math.min(w, 220) / 2, y + h / 2);
  };
}
