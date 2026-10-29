/**
 * Line — a caption the orb "says": words rise in one by one (they are also the
 * subtitles when the feed is muted), accent words in #adc6ff, then the line
 * eases out. Timing is in composition frames; a voice added later is fitted to
 * these slots.
 */
import { interpolate, useCurrentFrame } from "remotion";
import { out } from "./grid";

export const Line: React.FC<{
  text: string; from: number; to: number; accent?: string[]; y: number; size?: number; stagger?: number; align?: "center" | "left"; x?: number; width?: number; weight?: number;
}> = ({ text, from, to, accent = [], y, size = 84, stagger = 3, align = "center", x = 70, width = 940, weight = 600 }) => {
  const f = useCurrentFrame();
  if (f < from - 1 || f > to + 12) return null;
  const words = text.split(" ");
  const exit = interpolate(f, [to, to + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: y, left: x, width, textAlign: align, fontFamily: "Geist Sans", fontWeight: weight, fontSize: size, lineHeight: 1.06, letterSpacing: "-0.04em", color: "#fff", opacity: exit }}>
      {words.map((w, i) => {
        const p = interpolate(f, [from + i * stagger, from + i * stagger + 14], [0, 1], { easing: out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const clean = w.replace(/[.,!?]/g, "").toLowerCase();
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: p, transform: `translateY(${(1 - p) * 0.32 * size}px)`, filter: `blur(${(1 - p) * 8}px)`, color: accent.includes(clean) ? "#adc6ff" : undefined }}>
            {w}{i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
};

/** small label above a beat: "01  Look things up" */
export const Label: React.FC<{ n: string; text: string; from: number; to: number; y: number }> = ({ n, text, from, to, y }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + 16], [0, 1], { easing: out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const e = interpolate(f, [to, to + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (f < from || f > to + 10) return null;
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: p * e, transform: `translateY(${(1 - p) * 14}px)` }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "12px 24px", borderRadius: 999, background: "rgba(173,198,255,0.08)", border: "1px solid rgba(173,198,255,0.22)", fontFamily: "Geist Sans", fontWeight: 500, fontSize: 34, color: "#e8eeff", letterSpacing: "-0.01em" }}>
        <span style={{ fontFamily: "Geist Mono", fontSize: 26, color: "#00a2ff" }}>{n}</span>
        {text}
      </div>
    </div>
  );
};
