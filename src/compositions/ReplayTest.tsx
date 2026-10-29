/**
 * ReplayTest — proof shot for the capture pipeline: the real Wikipedia take,
 * replayed from its DOM recording inside a 1080x1920 frame, with a slow camera
 * push onto the search box while Claude Code types into it.
 */
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-mono/400.css";
import { DomReplay } from "../replay/DomReplay";
import take from "../takes/spike-wiki-06.json";

const TAB = "page-96CBCD9F";
const T0 = take.tabs[TAB].start;
const VW = take.viewport.w;
const VH = take.viewport.h;
const CARD_W = 1000;
const BAR_H = 60;
const S0 = CARD_W / VW;

// composition seconds -> take seconds (from T0): real time while it acts, a quick skip while it thinks
const TIME: [number, number][] = [[0, 32.6], [5, 37.6], [5.6, 43.6], [9.5, 47.5]];
const takeSeconds = (s: number) => {
  const i = Math.min(TIME.length - 2, Math.max(0, TIME.findIndex(([c], j) => s >= c && s < (TIME[j + 1]?.[0] ?? Infinity))));
  const [c0, t0] = TIME[i], [c1, t1] = TIME[i + 1];
  return t0 + ((s - c0) / (c1 - c0)) * (t1 - t0);
};

// camera keys: composition second -> page-space focus point and zoom
const KEYS = [
  { s: 0, x: 480, y: 600, z: 1 },
  { s: 1.2, x: 480, y: 600, z: 1 },
  { s: 3.0, x: 466, y: 494, z: 2.05 }, // search box (focus rect 255,472,394,44)
  { s: 5.6, x: 470, y: 520, z: 2.05 },
  { s: 6.4, x: 480, y: 540, z: 1.7 }, // suggestion it picks (341,553)
  { s: 7.4, x: 480, y: 540, z: 1.7 },
  { s: 9.5, x: 480, y: 470, z: 1.15 }, // article arrives
];
const ease = Easing.bezier(0.45, 0, 0.2, 1);
function camera(s: number) {
  const i = Math.max(0, KEYS.findIndex((k, j) => s >= k.s && (j === KEYS.length - 1 || s < KEYS[j + 1].s)));
  const a = KEYS[i], b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  const p = b.s === a.s ? 0 : interpolate(s, [a.s, b.s], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, z: a.z + (b.z - a.z) * p };
}

export const ReplayTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = frame / fps;
  const wall = T0 + takeSeconds(s) * 1000;
  const cam = camera(s);
  const S = S0 * cam.z;
  // page point (cam.x, cam.y) lands at screen (540, 960); the bar sits just above page y=0
  const left = 540 - cam.x * S;
  const top = 960 - cam.y * S;
  const page = [...take.tabs[TAB].pages].reverse().find((p) => p.shown <= wall);
  const url = page ? page.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : "";

  return (
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 30%, #1c2333 0%, #131315 60%)" }}>
      <div style={{ position: "absolute", left, top: top - BAR_H * S, transformOrigin: "0 0", transform: `scale(${S})`, width: VW }}>
        <div style={{ height: BAR_H, display: "flex", alignItems: "center", gap: 12, padding: "0 18px", background: "#1d1d20", borderRadius: "18px 18px 0 0", color: "#9ca3af", fontFamily: "Geist Mono", fontSize: 18 }}>
          <span style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2].map((i) => <span key={i} style={{ width: 11, height: 11, borderRadius: 6, background: "#3a3a40" }} />)}
          </span>
          <span style={{ flex: 1, textAlign: "center", background: "#131315", borderRadius: 10, padding: "8px 14px", color: "#adc6ff" }}>{url}</span>
        </div>
        <div style={{ borderRadius: "0 0 18px 18px", overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,0.55)" }}>
          <DomReplay take={take.id} tab={TAB} wall={wall} width={VW} height={VH} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
