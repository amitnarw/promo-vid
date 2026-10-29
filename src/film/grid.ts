/**
 * The film's tempo grid. Picture is cut first, on bars, so any track at this
 * tempo locks to the cuts; to use a different track, set BPM to its tempo
 * (cuts move proportionally) and re-check the beats that land on accents.
 */
import { Easing, interpolate } from "remotion";

export const FPS = 30;
export const BPM = 121.75; // provisional: Living Voyage
export const BEAT_S = 60 / BPM;
export const BAR_S = BEAT_S * 4;
/** frames at bar n (fractions allowed: 0.25 = one beat) */
export const bars = (n: number) => Math.round(n * BAR_S * FPS);

export const calm = Easing.bezier(0.45, 0, 0.2, 1);
export const out = Easing.bezier(0.16, 1, 0.3, 1);

type Keyed = { f: number } & Record<string, number>;
/** interpolate every numeric field between the keys around frame f */
export function keyed<K extends Keyed>(keys: K[], f: number, ease = calm): Omit<K, "f"> {
  if (f <= keys[0].f) return keys[0];
  const last = keys[keys.length - 1];
  if (f >= last.f) return last;
  const i = keys.findIndex((k, j) => f >= k.f && f < keys[j + 1].f);
  const a = keys[i], b = keys[i + 1];
  const p = interpolate(f, [a.f, b.f], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outv: Record<string, number> = {};
  for (const k of Object.keys(a)) if (k !== "f") outv[k] = (a[k] as number) + ((b[k] as number) - (a[k] as number)) * p;
  return outv as Omit<K, "f">;
}

/** piecewise-linear map from composition frame to take seconds: [[frame, takeSeconds], ...] */
export function remap(map: [number, number][], f: number) {
  if (f <= map[0][0]) return map[0][1] + (f - map[0][0]) / FPS;
  for (let i = 0; i < map.length - 1; i++) {
    const [f0, t0] = map[i], [f1, t1] = map[i + 1];
    if (f < f1) return t0 + ((f - f0) / (f1 - f0)) * (t1 - t0);
  }
  const [fl, tl] = map[map.length - 1];
  return tl + (f - fl) / FPS;
}
