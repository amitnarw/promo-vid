/**
 * Orb — Web MCP's mascot in 3D: the glossy blue sphere from the extension icon
 * with the extension's #adc6ff dot eyes. Everything is a pure function of its
 * props (no clocks), so Remotion frames are deterministic.
 *
 * gaze: where the eyes look, -1..1 on each axis (eyes slide over the surface the
 *       way the CSS orb translates them, and the body turns slightly with them)
 * blink: 0 open … 1 shut (both eyes); wink: 0 … 1 (viewer's right eye only)
 * glow: eye brightness, for "speaking" pulses; squash: -1..1 for anticipation
 */
import { useMemo } from "react";
import * as THREE from "three";

export type OrbPose = { gaze: { x: number; y: number }; blink: number; wink: number; glow: number; squash: number };

// The gloss is drawn here rather than reflected from an environment, so every
// highlight is placed on purpose: a soft window highlight up-left, a small hot
// specular, a thin cool rim, and a deep core.
const vertex = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const fragment = /* glsl */ `
  uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uDeep; uniform vec3 uRim;
  varying vec3 vN; varying vec3 vV;
  void main() {
    vec3 n = normalize(vN), v = normalize(vV);
    vec3 key = normalize(vec3(-0.55, 0.7, 0.65));
    float lit = dot(n, key) * 0.5 + 0.5;
    vec3 col = mix(uDeep, uMid, smoothstep(0.12, 0.62, lit));
    col = mix(col, uTop, smoothstep(0.62, 0.98, lit) * 0.85);
    // inner glow from below, like light passing through blue glass
    float under = smoothstep(0.2, -0.9, n.y) * smoothstep(0.0, 0.6, dot(n, v));
    col += uRim * under * 0.22;
    // soft window highlight (broad lobe) + small hot specular
    vec3 h = normalize(key + v);
    float broad = pow(max(dot(n, h), 0.0), 14.0);
    float hot = pow(max(dot(n, h), 0.0), 600.0);
    col += vec3(0.72, 0.84, 1.0) * broad * 0.42 + vec3(0.9, 0.95, 1.0) * hot * 0.32;
    // thin cool rim
    float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);
    col += uRim * fres * 0.55;
    gl_FragColor = vec4(col, 1.0);
  }`;

function Body() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uTop: { value: new THREE.Color("#4f9dff") },
          uMid: { value: new THREE.Color("#0b57c4") },
          uDeep: { value: new THREE.Color("#04183f") },
          uRim: { value: new THREE.Color("#00a2ff") },
        },
      }),
    [],
  );
  return (
    <mesh material={mat}>
      <sphereGeometry args={[1, 160, 160]} />
    </mesh>
  );
}

/** An eye: a glowing dot lying on the sphere surface at `dir` (bloom gives it its glow). */
function Eye({ dir, open, glow }: { dir: THREE.Vector3; open: number; glow: number }) {
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir), [dir]);
  const color = useMemo(() => new THREE.Color("#c4d6ff").multiplyScalar(1.15 + 0.6 * glow), [glow]);
  return (
    <group position={dir.clone().multiplyScalar(1.004)} quaternion={q}>
      <mesh scale={[1, Math.max(0.08, open), 1]}>
        <circleGeometry args={[0.118, 64]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

export const Orb: React.FC<{ pose: OrbPose }> = ({ pose }) => {
  const { gaze, blink, wink, glow, squash } = pose;
  // eyes sit centred on the gaze direction, a little above the equator, like the icon
  const eyes = useMemo(() => {
    const yaw = gaze.x * 0.5, pitch = 0.1 + gaze.y * 0.42;
    const centre = new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).normalize();
    const side = new THREE.Vector3(0, 1, 0).cross(centre).normalize();
    return [centre.clone().addScaledVector(side, -0.19).normalize(), centre.clone().addScaledVector(side, 0.19).normalize()];
  }, [gaze.x, gaze.y]);
  const open = 1 - blink;
  return (
    <group rotation={[-gaze.y * 0.1, gaze.x * 0.16, 0]} scale={[1 + squash * 0.06, 1 - squash * 0.06, 1 + squash * 0.06]}>
      <Body />
      <Eye dir={eyes[0]} open={open} glow={glow} />
      <Eye dir={eyes[1]} open={open * (1 - wink)} glow={glow} />
    </group>
  );
};
