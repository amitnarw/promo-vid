/**
 * Cards — the request and the answer, both real text from the take:
 *  RequestCard: the plain-English request the AI agent was given, typed out
 *  AnswerCard:  the agent's own final reply (an excerpt, never reworded)
 */
import { interpolate, useCurrentFrame } from "remotion";
import { out } from "./grid";

const shell = { background: "rgba(24,24,28,0.92)", border: "1px solid rgba(173,198,255,0.16)", borderRadius: 28, boxShadow: "0 40px 100px rgba(0,0,0,0.55)", backdropFilter: "blur(12px)" } as const;

export const RequestCard: React.FC<{ text: string; from: number; to: number; x: number; y: number; w: number; cps?: number; who?: string }> = ({ text, from, to, x, y, w, cps = 38, who = "You → your AI" }) => {
  const f = useCurrentFrame();
  if (f < from || f > to + 12) return null;
  const p = interpolate(f, [from, from + 14], [0, 1], { easing: out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const e = interpolate(f, [to, to + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shown = Math.floor(Math.max(0, f - from - 8) * (cps / 30));
  const caret = Math.floor(f / 15) % 2 === 0 || shown < text.length;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, padding: "26px 30px", opacity: p * e, transform: `translateY(${(1 - p) * 24}px)`, ...shell }}>
      <div style={{ fontFamily: "Geist Mono", fontSize: 22, color: "#9ca3af", marginBottom: 12 }}>{who}</div>
      <div style={{ fontFamily: "Geist Mono", fontSize: 32, lineHeight: 1.35, color: "#ffffff" }}>
        <span style={{ color: "#00a2ff" }}>&gt; </span>
        {text.slice(0, shown)}
        {caret && <span style={{ display: "inline-block", width: 16, height: 34, marginLeft: 3, verticalAlign: "-6px", background: "#adc6ff" }} />}
      </div>
    </div>
  );
};

export const AnswerCard: React.FC<{ text: string; from: number; to: number; x: number; y: number; w: number; who?: string; size?: number }> = ({ text, from, to, x, y, w, who = "Your AI", size = 36 }) => {
  const f = useCurrentFrame();
  if (f < from || f > to + 12) return null;
  const p = interpolate(f, [from, from + 16], [0, 1], { easing: out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const e = interpolate(f, [to, to + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // **bold** spans from the agent's markdown keep their emphasis
  // the answer itself: the reply's first sentence, never reworded
  const first = text.split(/\n/)[0].match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text.split(/\n/)[0];
  const parts = first.split(/(\*\*[^*]+\*\*)/g);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, padding: "26px 30px", opacity: p * e, transform: `translateY(${(1 - p) * 24}px) scale(${0.97 + 0.03 * p})`, ...shell }}>
      <div style={{ fontFamily: "Geist Mono", fontSize: 22, color: "#9ca3af", marginBottom: 12 }}>{who}</div>
      <div style={{ fontFamily: "Geist Sans", fontSize: size, lineHeight: 1.3, color: "#e8eeff", letterSpacing: "-0.01em" }}>
        {parts.map((s, i) => (s.startsWith("**") ? <b key={i} style={{ color: "#ffffff", fontWeight: 600 }}>{s.slice(2, -2)}</b> : <span key={i}>{s}</span>))}
      </div>
    </div>
  );
};
