/**
 * TakeFrame — inspection tool: a take's tab at full viewport, at take second `t`
 * (seconds from the tab's first event). Used to plan framing.
 *   npx remotion still src/index.ts TakeFrame out/x.jpg --props='{"take":"checkout-01","tab":"page-…","t":30}'
 */
import { AbsoluteFill } from "remotion";
import { DomReplay } from "../replay/DomReplay";

export const TakeFrame: React.FC<{ take: string; tab: string; t: number; start: number; w: number; h: number }> = ({ take, tab, t, start, w, h }) => (
  <AbsoluteFill style={{ background: "#222" }}>
    <DomReplay take={take} tab={tab} wall={start + t * 1000} width={w} height={h} />
  </AbsoluteFill>
);
