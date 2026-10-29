/**
 * Crop — a window onto a replayed tab: shows page region `region` (page px)
 * scaled by `scale`, as a rounded card. Several crops of the same moment can
 * sit side by side (e.g. the action and a lens on web-mcp's pill); each is the
 * same real recording, just framed differently.
 */
import type { CSSProperties } from "react";
import { DomReplay } from "./DomReplay";

export type Region = { x: number; y: number; w: number; h: number };

export const Crop: React.FC<{
  take: string; tab: string; wall: number; viewport: { w: number; h: number };
  region: Region; scale: number; left: number; top: number; radius?: number; style?: CSSProperties;
}> = ({ take, tab, wall, viewport, region, scale, left, top, radius = 28, style }) => (
  <div style={{ position: "absolute", left, top, width: region.w * scale, height: region.h * scale, borderRadius: radius, overflow: "hidden", ...style }}>
    <div style={{ position: "absolute", left: -region.x * scale, top: -region.y * scale, transformOrigin: "0 0", transform: `scale(${scale})` }}>
      <DomReplay take={take} tab={tab} wall={wall} width={viewport.w} height={viewport.h} />
    </div>
  </div>
);
