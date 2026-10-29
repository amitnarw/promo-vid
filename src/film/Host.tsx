/**
 * Host — the orb as the film's presenter, on one 3D canvas over everything.
 * Its pose is a pure function of the frame:
 *  - position/size from keys (screen px), with a slow idle float and breathing
 *  - eyes follow a screen target with a short lag (eyes lead, body follows)
 *  - blinks: a natural cadence plus scripted ones; a wink; brighter eyes while speaking
 */
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Orb } from "../mascot/Orb";
import { keyed } from "./grid";

// perspective camera at z=20, fov 20° → 1 world unit ≈ 272 px on a 1920-tall frame
const PX = 1920 / (2 * 20 * Math.tan((10 * Math.PI) / 180));

export type HostKey = { f: number; x: number; y: number; r: number; o: number };
export type Target = (f: number) => { x: number; y: number } | null;

const clamp = (v: number, a = -1, b = 1) => Math.max(a, Math.min(b, v));

function blinkAt(f: number, scripted: number[]) {
  // natural blinks every ~3.4 s with a little variation, plus scripted ones
  const natural: number[] = [];
  for (let b = 40; b < f + 10; b += 98 + ((b * 37) % 23)) natural.push(b);
  let v = 0;
  for (const b of [...natural, ...scripted]) {
    const d = f - b;
    if (d >= 0 && d <= 6) v = Math.max(v, d <= 2 ? d / 2 : 1 - (d - 2) / 4);
  }
  return v;
}

export const Host: React.FC<{
  keys: HostKey[]; target: Target; blinks?: number[]; winkAt?: number; speaking?: (f: number) => number; wakeAt?: number;
}> = ({ keys, target, blinks = [], winkAt, speaking, wakeAt }) => {
  const f = useCurrentFrame();
  const k = keyed(keys, f);
  if (k.o <= 0.001) return null;
  const t = f / 30;
  const bob = Math.sin(t * 1.5) * k.r * 0.035;
  const pos = { x: k.x, y: k.y + bob };
  // gaze: average the raw direction over the last few frames (lag), normalised by distance
  const raw = (ff: number) => {
    const kk = keyed(keys, ff);
    const tg = target(ff);
    if (!tg) return { x: 0, y: 0 };
    const dx = tg.x - kk.x, dy = tg.y - kk.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    const reach = Math.min(1, d / (kk.r * 2.2));
    return { x: clamp((dx / d) * reach), y: clamp((-dy / d) * reach) };
  };
  let gx = 0, gy = 0, wsum = 0;
  for (let i = 0; i < 6; i++) { const w = 6 - i; const g = raw(f - i); gx += g.x * w; gy += g.y * w; wsum += w; }
  const gaze = { x: gx / wsum, y: gy / wsum };
  const wink = winkAt === undefined ? 0 : (() => { const d = f - winkAt; return d < 0 || d > 22 ? 0 : d < 4 ? d / 4 : d > 16 ? 1 - (d - 16) / 6 : 1; })();
  const glow = 0.45 + 0.6 * (speaking?.(f) ?? 0);
  const squash = Math.sin(t * 1.5 + 0.8) * 0.12;
  return (
    <AbsoluteFill style={{ opacity: k.o }}>
      <ThreeCanvas width={1080} height={1920} camera={{ position: [0, 0, 20], fov: 20 }} gl={{ antialias: true }}>
        <group position={[(pos.x - 540) / PX, (960 - pos.y) / PX, 0]} scale={k.r / PX}>
          <Orb pose={{ gaze, blink: wakeAt !== undefined && f < wakeAt + 8 ? Math.min(1, Math.max(0, (wakeAt + 8 - f) / 8)) : blinkAt(f, blinks), wink, glow, squash }} />
        </group>
        <EffectComposer>
          <Bloom intensity={0.9} luminanceThreshold={1.0} luminanceSmoothing={0.2} mipmapBlur radius={0.55} />
        </EffectComposer>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
