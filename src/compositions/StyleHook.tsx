/**
 * StyleHook — style frame for beat 1: the host orb watches a real browser that
 * is typing on its own (Claude Code filling Wikipedia's search). Two crops of
 * the same recorded moment: the action, and a lens on web-mcp's own pill.
 */
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill } from "remotion";
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/600.css";
import { Orb } from "../mascot/Orb";
import { Crop } from "../replay/Crop";
import take from "../takes/spike-wiki-06.json";

const TAB = "page-96CBCD9F";
const T0 = take.tabs[TAB].start;

// perspective camera at z=20, fov 20° → 1 world unit ≈ 272 px on a 1920-tall frame
const PX = 1920 / (2 * 20 * Math.tan((10 * Math.PI) / 180));
const toWorld = (x: number, y: number) => [(x - 540) / PX, (960 - y) / PX, 0] as const;

const cardShadow = "0 0 0 1px rgba(173,198,255,0.10), 0 50px 120px rgba(0,0,0,0.65)";

export const StyleHook: React.FC = () => {
  const wall = T0 + 35_350; // mid-typing: "Eiffel…"
  const common = { take: take.id, tab: TAB, wall, viewport: take.viewport };
  return (
    <AbsoluteFill style={{ background: "#131315", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(70% 30% at 50% 34%, rgba(0,122,255,0.22) 0%, rgba(0,91,193,0.07) 50%, rgba(19,19,21,0) 80%)" }} />

      {/* the action: Wikipedia's search box as Claude Code types into it */}
      <Crop {...common} region={{ x: 228, y: 446, w: 504, h: 250 }} scale={1.9} left={61} top={760} style={{ boxShadow: cardShadow }} />

      {/* lens: web-mcp's own pill and tooltip at the same instant */}
      <Crop {...common} region={{ x: 312, y: 1128, w: 312, h: 112 }} scale={2.3} left={181} top={1190} radius={26}
        style={{ boxShadow: "0 0 0 1.5px rgba(173,198,255,0.45), 0 0 60px rgba(0,122,255,0.35), 0 30px 80px rgba(0,0,0,0.7)" }} />

      <AbsoluteFill>
        <ThreeCanvas width={1080} height={1920} camera={{ position: [0, 0, 20], fov: 20 }} gl={{ antialias: true }}>
          <group position={toWorld(540, 590)} scale={135 / PX}>
            <Orb pose={{ gaze: { x: -0.22, y: -0.7 }, blink: 0, wink: 0, glow: 0.5, squash: 0 }} />
          </group>
          <EffectComposer>
            <Bloom intensity={0.9} luminanceThreshold={1.0} luminanceSmoothing={0.2} mipmapBlur radius={0.55} />
          </EffectComposer>
        </ThreeCanvas>
      </AbsoluteFill>

      <div style={{ position: "absolute", top: 228, left: 70, right: 70, textAlign: "center", fontFamily: "Geist Sans", fontWeight: 600, fontSize: 84, lineHeight: 1.04, letterSpacing: "-0.04em", color: "#ffffff" }}>
        Your AI can use a <span style={{ color: "#adc6ff" }}>real browser</span> now.
      </div>
    </AbsoluteFill>
  );
};
