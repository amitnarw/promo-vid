/**
 * Stage — the brand surface with a slow light field in the accent blues.
 * `energy` (0..1+) brightens it for the hero beat; motion is a pure function of
 * the frame, slow enough to read as calm.
 */
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const Stage: React.FC<{ energy?: number; focusY?: number }> = ({ energy = 0.5, focusY = 0.4 }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const a = 0.16 + 0.14 * energy;
  const b1 = { x: 50 + 14 * Math.sin(t * 0.13), y: focusY * 100 + 6 * Math.sin(t * 0.17 + 1) };
  const b2 = { x: 30 + 10 * Math.sin(t * 0.11 + 2), y: 78 + 5 * Math.cos(t * 0.09) };
  const b3 = { x: 78 + 8 * Math.cos(t * 0.1 + 0.5), y: 18 + 6 * Math.sin(t * 0.12) };
  return (
    <AbsoluteFill style={{ background: "#131315" }}>
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(60% 34% at ${b1.x}% ${b1.y}%, rgba(0,122,255,${a}) 0%, rgba(0,91,193,${a * 0.35}) 45%, rgba(19,19,21,0) 75%)`,
            `radial-gradient(45% 25% at ${b2.x}% ${b2.y}%, rgba(0,91,193,${a * 0.55}) 0%, rgba(19,19,21,0) 70%)`,
            `radial-gradient(35% 20% at ${b3.x}% ${b3.y}%, rgba(0,162,255,${a * 0.4}) 0%, rgba(19,19,21,0) 70%)`,
          ].join(","),
        }}
      />
      {/* fine vignette so edges settle into the surface */}
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};
