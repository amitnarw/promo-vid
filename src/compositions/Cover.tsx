/**
 * Cover — the post's cover still: the host looking at the viewer over the
 * opening line, a real crop of Claude Code typing into a login, a lens on
 * web-mcp's own pill, and the install line. Key content sits in the centre
 * band so feed crops and platform overlays don't cut it.
 */
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill } from "remotion";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-mono/400.css";
import { Orb } from "../mascot/Orb";
import { Crop } from "../replay/Crop";
import checkout from "../takes/checkout-01.json";

const TAB = "page-080967F6";
const T0 = checkout.tabs[TAB].start;
const PX = 1920 / (2 * 20 * Math.tan((10 * Math.PI) / 180));
const toWorld = (x: number, y: number) => [(x - 540) / PX, (960 - y) / PX, 0] as const;

export const Cover: React.FC = () => {
  const wall = T0 + 30_150; // "standard_user" just typed, pill still "filling…"
  const common = { take: checkout.id, tab: TAB, wall, viewport: checkout.viewport };
  return (
    <AbsoluteFill style={{ background: "#131315", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(70% 36% at 50% 40%, rgba(0,122,255,0.30) 0%, rgba(0,91,193,0.10) 50%, rgba(19,19,21,0) 80%)" }} />
      <div style={{ position: "absolute", top: 300, left: 60, right: 60, textAlign: "center", fontFamily: "Geist Sans", fontWeight: 600, fontSize: 104, lineHeight: 1.0, letterSpacing: "-0.045em", color: "#fff" }}>
        Your AI can use a <span style={{ color: "#adc6ff" }}>real browser</span> now.
      </div>
      <Crop {...common} region={{ x: 300, y: 140, w: 360, h: 120 }} scale={2.55} left={81} top={980} radius={30}
        style={{ boxShadow: "0 0 0 1px rgba(173,198,255,0.12), 0 50px 120px rgba(0,0,0,0.6)" }} />
      <Crop {...common} region={{ x: 300, y: 1126, w: 312, h: 112 }} scale={2.2} left={197} top={1230} radius={26}
        style={{ boxShadow: "0 0 0 1.5px rgba(173,198,255,0.45), 0 0 60px rgba(0,122,255,0.35), 0 30px 80px rgba(0,0,0,0.7)" }} />
      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ position: [0, 0, 20], fov: 20 }} gl={{ antialias: true }}>
          <group position={toWorld(540, 770)} scale={160 / PX}>
            <Orb pose={{ gaze: { x: 0, y: -0.05 }, blink: 0, wink: 0, glow: 0.8, squash: 0 }} />
          </group>
          <EffectComposer>
            <Bloom intensity={1.0} luminanceThreshold={1.0} luminanceSmoothing={0.2} mipmapBlur radius={0.55} />
          </EffectComposer>
        </ThreeCanvas>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 1530, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ padding: "20px 30px", borderRadius: 20, background: "linear-gradient(135deg, #005bc1 0%, #007aff 100%)", boxShadow: "0 24px 70px rgba(0,122,255,0.35)", fontFamily: "Geist Mono", fontSize: 34, color: "#fff" }}>
          npm install -g @amitnarw/web-mcp
        </div>
      </div>
    </AbsoluteFill>
  );
};
