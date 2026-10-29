/**
 * Film — Web MCP launch film v1 (picture first; music and voice are fitted to
 * the bar grid and caption slots afterwards).
 *
 * Every product shot is a real run: headless Claude Code driving web-mcp's
 * Chromium from a plain-English request, replayed from its DOM recording.
 * Time is only skipped while the agent thinks, and the REAL RUN clock shows it.
 */
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-mono/400.css";
import checkout from "../takes/checkout-01.json";
import form from "../takes/form-01.json";
import prices from "../takes/prices-01.json";
import status from "../takes/status-01.json";
import terminal from "../takes/terminal-01.json";
import wiki from "../takes/spike-wiki-06.json";
import { AnswerCard, RequestCard } from "./Cards";
import { bars, keyed } from "./grid";
import { Host, type HostKey } from "./Host";
import { Label, Line } from "./Line";
import { EndCard, TableCard, TermCard, tableRows } from "./Panels";
import { type Cam, ReplayWindow, type TakeTimeline, type Win } from "./ReplayWindow";
import { Stage } from "./Stage";
import { toScreen, touchTarget } from "./track";

type T = TakeTimeline & { touches: any[]; result: { t: number; text: string } | null; tools: { t: number; name: string }[] };
const CO = checkout as unknown as T, WK = wiki as unknown as T, FM = form as unknown as T, PR = prices as unknown as T, ST = status as unknown as T;
const CO_TAB = "page-080967F6", CO_PANEL = "panel-0645E2D2", WK_TAB = "page-96CBCD9F", FM_TAB = "page-6581D2AE", PR_TAB = "page-B3F8259B", ST_TAB = "page-6402F78E";
// the request reaches the agent when its first tool call goes out: the REAL RUN clock counts from there
const asked = (t: T) => t.tools[0]?.t;

// beat boundaries on the bar grid
const B = { hook: 0, ask: bars(2), search: bars(4), form: bars(8), hero: bars(11), chores: bars(16), test: bars(19), privacy: bars(22), install: bars(24), end: bars(28) };
export const FILM_FRAMES = B.end;

// shared layout for the use-case beats
const WIN = { x: 540, y: 1000, w: 960, h: 860 };
const win = (from: number, to: number, w = WIN): Win[] => [
  { f: from - 8, ...w, y: w.y + 40, o: 0 }, { f: from + 6, ...w, o: 1 }, { f: to - 6, ...w, o: 1 }, { f: to + 6, ...w, y: w.y - 30, o: 0 },
];
const LENS = { x: 400, y: 1360, w: 600, h: 230 };
const lensCam: Cam[] = [{ f: 0, x: 452, y: 1190, s: 1.9 }];
const PERCH = { x: 950, y: 548, r: 70 };

// ---- beat 1: the hook — real login typing (checkout take) ----
const hookTime: [number, number][] = [[20, 29.35], [64, 30.15], [96, 30.5], [B.ask, 31.0]];
const hookCams: Cam[] = [{ f: 20, x: 480, y: 245, s: 2.3 }, { f: B.ask, x: 480, y: 240, s: 2.45 }];
const hookWins: Win[] = [{ f: 16, x: 540, y: 1140, w: 940, h: 540, o: 0 }, { f: 34, x: 540, y: 1040, w: 940, h: 540, o: 1 }, { f: 110, x: 540, y: 1040, w: 940, h: 540, o: 1 }, { f: 124, x: 540, y: 1000, w: 940, h: 540, o: 0 }];
const hookLens: Win[] = [{ f: 40, ...LENS, x: 540, y: 1420, o: 0 }, { f: 54, ...LENS, x: 540, y: 1395, o: 1 }, { f: 110, ...LENS, x: 540, y: 1395, o: 1 }, { f: 122, ...LENS, x: 540, y: 1370, o: 0 }];

// ---- beat 3: look things up (wiki take) ----
const wkTime: [number, number][] = [[B.search - 15, 34.2], [264, 35.0], [300, 35.75], [318, 36.75], [326, 44.3], [346, 44.7], [372, 46.4], [B.form, 50.6]];
const wkCams: Cam[] = [{ f: 222, x: 480, y: 500, s: 1.95 }, { f: 318, x: 480, y: 520, s: 1.95 }, { f: 330, x: 480, y: 580, s: 1.6 }, { f: 352, x: 480, y: 580, s: 1.6 }, { f: 378, x: 480, y: 420, s: 1.12 }, { f: 410, x: 317, y: 700, s: 1.58 }, { f: B.form, x: 317, y: 698, s: 1.62 }];
const wkWins = win(B.search, B.form);
const wkLens: Win[] = [{ f: 228, ...LENS, o: 0 }, { f: 240, ...LENS, o: 1 }, { f: 364, ...LENS, o: 1 }, { f: 374, ...LENS, y: 1380, o: 0 }];
// where the tiny orb sits inside web-mcp's pill ("reading page…" state), as seen through the lens: the dive target
const pillOrb = toScreen(lensCam, wkLens, 244, 376, 1207);

// ---- beat 4: fill forms ----
const fmTime: [number, number][] = [[B.form - 8, 20.6], [530, 29.6], [560, 37.4], [572, 57.8], [600, 59.4], [B.hero, 61.0]];
const fmCams: Cam[] = [{ f: B.form - 8, x: 470, y: 250, s: 1.36 }, { f: 560, x: 470, y: 250, s: 1.36 }, { f: 574, x: 420, y: 260, s: 1.8 }, { f: 598, x: 360, y: 90, s: 2.4 }, { f: B.hero, x: 360, y: 90, s: 2.5 }];
const fmWins = win(B.form, B.hero);
const fmLens: Win[] = [{ f: B.form, ...LENS, o: 0 }, { f: B.form + 12, ...LENS, o: 1 }, { f: 590, ...LENS, o: 1 }, { f: 600, ...LENS, y: 1380, o: 0 }];

// ---- beat 5: the hero — grab the info (prices take) ----
const prTime: [number, number][] = [[B.hero - 8, 13.0], [700, 15.0], [760, 17.6], [810, 21.5], [B.chores, 23.0]];
const prCams: Cam[] = [{ f: B.hero - 8, x: 480, y: 600, s: 1.0 }, { f: 690, x: 480, y: 600, s: 1.0 }, { f: 740, x: 640, y: 720, s: 1.55 }, { f: 800, x: 640, y: 1100, s: 1.55 }, { f: B.chores, x: 640, y: 1100, s: 1.55 }];
const prWins: Win[] = [{ f: B.hero - 8, ...WIN, y: WIN.y + 40, o: 0 }, { f: B.hero + 6, ...WIN, o: 1 }, { f: 812, ...WIN, o: 1 }, { f: 850, x: 540, y: 820, w: 860, h: 640, o: 0.32 }, { f: B.chores - 6, x: 540, y: 820, w: 860, h: 640, o: 0.32 }, { f: B.chores + 6, x: 540, y: 800, w: 860, h: 640, o: 0 }];
const prRows = tableRows(PR.result?.text ?? "");
const TABLE = { from: 820, step: bars(0.25), y: 760 };

// ---- beat 6: the boring stuff (status page) ----
const stTime: [number, number][] = [[B.chores - 8, 32.0], [990, 34.0], [1010, 40.5], [1060, 49.5], [B.test, 58.0]];
const stCams: Cam[] = [{ f: B.chores - 8, x: 480, y: 330, s: 1.15 }, { f: 1000, x: 480, y: 330, s: 1.15 }, { f: 1040, x: 380, y: 285, s: 1.6 }, { f: B.test, x: 380, y: 288, s: 1.68 }];
const stWins = win(B.chores, B.test);

// ---- beat 7: test your site (checkout take, start to "Thank you for your order!") ----
const coTime: [number, number][] = [[B.test - 8, 29.0], [1140, 31.4], [1150, 35.8], [1160, 45.6], [1178, 58.7], [1190, 61.9], [1200, 69.3], [1226, 78.4], [1236, 84.6], [1262, 87.0], [B.privacy, 92.0]];
const coCams: Cam[] = [{ f: B.test - 8, x: 480, y: 230, s: 1.9 }, { f: 1150, x: 480, y: 230, s: 1.9 }, { f: 1160, x: 480, y: 330, s: 1.35 }, { f: 1178, x: 480, y: 330, s: 1.35 }, { f: 1188, x: 471, y: 396, s: 1.9 }, { f: 1200, x: 480, y: 320, s: 1.6 }, { f: 1230, x: 480, y: 330, s: 1.6 }, { f: 1244, x: 480, y: 300, s: 1.6 }, { f: B.privacy, x: 480, y: 290, s: 1.8 }];
const coWins = win(B.test, B.privacy);

// ---- beat 8: private (the real side panel) ----
const pnTime: [number, number][] = [[B.privacy - 8, 82.0], [B.install, 87.5]];
const pnCams: Cam[] = [{ f: B.privacy - 8, x: 210, y: 300, s: 1.45 }, { f: B.install, x: 210, y: 330, s: 1.5 }];
const pnWins: Win[] = [{ f: B.privacy - 8, x: 540, y: 1060, w: 620, h: 820, o: 0 }, { f: B.privacy + 8, x: 540, y: 1020, w: 620, h: 820, o: 1 }, { f: B.install - 8, x: 540, y: 1020, w: 620, h: 820, o: 1 }, { f: B.install + 6, x: 540, y: 980, w: 620, h: 820, o: 0 }];

// ---- the host ----
const hostKeys: HostKey[] = [
  { f: 0, x: 540, y: 820, r: 250, o: 0 }, { f: 6, x: 540, y: 820, r: 250, o: 1 }, { f: 30, x: 540, y: 800, r: 250, o: 1 }, { f: 62, x: 540, y: 560, r: 150, o: 1 },
  { f: B.ask, x: 540, y: 560, r: 150, o: 1 }, { f: 150, x: 540, y: 600, r: 170, o: 1 }, { f: 204, x: 540, y: 600, r: 170, o: 1 },
  // the dive: into web-mcp's own pill
  { f: 242, x: pillOrb.x, y: pillOrb.y, r: 20, o: 1 }, { f: 248, x: pillOrb.x, y: pillOrb.y, r: 18, o: 0 },
  // pops back out and perches on the window for the use cases
  { f: 392, x: pillOrb.x, y: pillOrb.y, r: 18, o: 0 }, { f: 396, x: pillOrb.x, y: pillOrb.y, r: 22, o: 1 }, { f: 424, ...PERCH, o: 1 },
  { f: B.privacy - 6, ...PERCH, o: 1 }, { f: B.privacy + 24, x: 540, y: 515, r: 92, o: 1 },
  { f: B.install, x: 540, y: 515, r: 92, o: 1 }, { f: B.install + 30, x: 540, y: 520, r: 150, o: 1 }, { f: B.end, x: 540, y: 560, r: 165, o: 1 },
];
const look = {
  hook: touchTarget(CO, CO_TAB, hookTime, hookCams, hookWins),
  wiki: touchTarget(WK, WK_TAB, wkTime, wkCams, wkWins),
  form: touchTarget(FM, FM_TAB, fmTime, fmCams, fmWins),
  test: touchTarget(CO, CO_TAB, coTime, coCams, coWins),
};
function target(f: number) {
  if (f < 34) return null;
  if (f < B.ask) return f > 78 && f < 94 ? toScreen(lensCam, hookLens, f, 401, 1207) : look.hook(f);
  if (f < 204) return { x: 200 + Math.min(1, (f - 134) / 60) * 640, y: 880 };
  if (f < 248) return pillOrb;
  if (f < B.form) return f > 420 ? { x: 540, y: 1250 } : look.wiki(f);
  if (f < B.hero) return look.form(f) ?? { x: 540, y: 900 };
  if (f < B.chores) {
    if (f < TABLE.from) { const k = keyed(prWins, f); return { x: k.x - 100, y: k.y }; }
    const row = Math.min(prRows.length - 1, Math.max(0, Math.floor((f - TABLE.from - 10) / TABLE.step)));
    return { x: 420, y: TABLE.y + 110 + row * 82 };
  }
  if (f < B.test) return { x: 520, y: f < 1040 ? 900 : 880 };
  if (f < B.privacy) return look.test(f) ?? { x: 540, y: 900 };
  if (f < B.install) return { x: 540, y: 1000 };
  return f < B.install + 140 ? { x: 540, y: 900 } : { x: 540, y: 840 };
}

// lines the host "says" (and the muted-feed subtitles); a voice is fitted to these slots later
const LINES = [
  { text: "Your AI can use a real browser now.", from: 14, to: B.ask - 8, accent: ["real", "browser"] },
  { text: "Hi, I'm Web MCP. Just ask, and watch it happen.", from: B.ask + 10, to: B.search - 8, accent: ["web", "mcp"] },
  { text: "It searches and reads, like you would.", from: B.search + 16, to: B.form - 8, accent: ["searches", "reads"], small: true },
  { text: "Fills in forms. Clicks the buttons.", from: B.form + 10, to: B.hero - 8, accent: ["forms", "buttons"], small: true },
  { text: "Pulls what you need, straight off the page.", from: B.hero + 10, to: B.chores - 8, accent: ["pulls"], small: true },
  { text: "Even the boring, everyday checks.", from: B.chores + 10, to: B.test - 8, accent: ["boring"], small: true },
  { text: "And tests your site like a real customer.", from: B.test + 10, to: B.privacy - 8, accent: ["tests", "customer"], small: true },
  { text: "Everything stays on your computer.", from: B.privacy + 10, to: B.install - 8, accent: ["your", "computer"] },
  { text: "One line to install.", from: B.install + 10, to: B.install + 128, accent: ["one", "line"] },
  { text: "Give your AI a browser.", from: B.install + 136, to: B.end - 4, accent: ["browser"] },
];
const speaking = (f: number) => {
  for (const l of LINES) { const end = l.from + l.text.split(" ").length * 3 + 18; if (f >= l.from && f <= end) return 0.6 + 0.4 * Math.sin((f - l.from) * 0.9); }
  return 0;
};

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const near = (a: number, b: number) => f >= a - 12 && f <= b + 12;
  const energy = f >= TABLE.from && f < B.chores ? 0.95 : f >= B.privacy && f < B.install ? 0.25 : 0.55;
  const lineAt = LINES.find((l) => f >= l.from - 1 && f <= l.to + 12);
  return (
    <AbsoluteFill style={{ background: "#131315" }}>
      <Stage energy={energy} focusY={f < B.search ? 0.35 : 0.5} />

      {/* beat 1 */}
      {near(20, B.ask) && <>
        <ReplayWindow take={CO} tab={CO_TAB} frame={f} time={hookTime} cams={hookCams} wins={hookWins} clock={false} />
        <ReplayWindow take={CO} tab={CO_TAB} frame={f} time={hookTime} cams={lensCam} wins={hookLens} clock={false} radius={26} style={{ boxShadow: "0 0 0 1.5px rgba(173,198,255,0.45), 0 0 60px rgba(0,122,255,0.35), 0 30px 80px rgba(0,0,0,0.7)" }} />
      </>}

      {/* beat 2 */}
      <RequestCard text={WK.prompt} from={B.ask + 8} to={B.search - 26} x={70} y={790} w={940} />

      {/* beat 3 */}
      {near(B.search - 15, B.form) && <>
        <ReplayWindow take={WK} tab={WK_TAB} frame={f} time={wkTime} cams={wkCams} wins={wkWins} requestAt={asked(WK)} url />
        <ReplayWindow take={WK} tab={WK_TAB} frame={f} time={wkTime} cams={lensCam} wins={wkLens} clock={false} radius={26} style={{ boxShadow: "0 0 0 1.5px rgba(173,198,255,0.45), 0 0 60px rgba(0,122,255,0.35), 0 30px 80px rgba(0,0,0,0.7)" }} />
      </>}
      <Label n="01" text="Look things up" from={B.search + 6} to={B.form - 8} y={232} />
      <AnswerCard text={WK.result?.text ?? ""} from={426} to={B.form - 6} x={90} y={1190} w={900} size={34} />

      {/* beat 4 */}
      {near(B.form - 8, B.hero) && <>
        <ReplayWindow take={FM} tab={FM_TAB} frame={f} time={fmTime} cams={fmCams} wins={fmWins} requestAt={asked(FM)} url />
        <ReplayWindow take={FM} tab={FM_TAB} frame={f} time={fmTime} cams={lensCam} wins={fmLens} clock={false} radius={26} style={{ boxShadow: "0 0 0 1.5px rgba(173,198,255,0.45), 0 0 60px rgba(0,122,255,0.35), 0 30px 80px rgba(0,0,0,0.7)" }} />
      </>}
      <Label n="02" text="Fill in forms" from={B.form + 4} to={B.hero - 8} y={232} />

      {/* beat 5 */}
      {near(B.hero - 8, B.chores) && <ReplayWindow take={PR} tab={PR_TAB} frame={f} time={prTime} cams={prCams} wins={prWins} requestAt={asked(PR)} url />}
      <Label n="03" text="Grab the info" from={B.hero + 4} to={B.chores - 8} y={232} />
      <TableCard rows={prRows} from={TABLE.from} to={B.chores - 6} step={TABLE.step} x={60} y={TABLE.y} w={960} title="Your AI · the five cheapest books on the page" note="books.toscrape.com is a practice store; its prices are sample data." />

      {/* beat 6 */}
      {near(B.chores - 8, B.test) && <ReplayWindow take={ST} tab={ST_TAB} frame={f} time={stTime} cams={stCams} wins={stWins} requestAt={asked(ST)} url />}
      <Label n="04" text="Check on things" from={B.chores + 4} to={B.test - 8} y={232} />
      <AnswerCard text={ST.result?.text ?? ""} from={1070} to={B.test - 6} x={90} y={1200} w={900} size={34} />

      {/* beat 7 */}
      {near(B.test - 8, B.privacy) && <ReplayWindow take={CO} tab={CO_TAB} frame={f} time={coTime} cams={coCams} wins={coWins} requestAt={asked(CO)} url />}
      <Label n="05" text="Test your site" from={B.test + 4} to={B.privacy - 8} y={232} />
      {f >= B.test && f < B.privacy && <div style={{ position: "absolute", top: 1446, left: 0, right: 0, textAlign: "center", fontFamily: "Geist Sans", fontSize: 24, color: "#9ca3af", opacity: interpolate(f, [B.test + 20, B.test + 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>saucedemo.com is a demo store built for testing</div>}

      {/* beat 8 */}
      {near(B.privacy - 8, B.install) && <ReplayWindow take={CO} tab={CO_PANEL} frame={f} time={pnTime} cams={pnCams} wins={pnWins} clock={false} style={{ background: "#131315" }} />}
      {f >= B.privacy + 14 && f < B.install && (
        <div style={{ position: "absolute", top: 1450, left: 0, right: 0, textAlign: "center", fontFamily: "Geist Sans", fontSize: 30, color: "#9ca3af", opacity: interpolate(f, [B.privacy + 14, B.privacy + 30, B.install - 10, B.install], [0, 1, 1, 0]) }}>
          Runs on your machine · No telemetry · Nothing sent anywhere
        </div>
      )}

      {/* beat 9 */}
      <TermCard chunks={terminal.chunks} start={terminal.start} from={B.install + 6} to={B.install + 150} x={60} y={700} w={960} h={420} speed={10}
        keep={(cmd, l) => cmd.startsWith("npm") ? /added|changed/.test(l) : cmd.includes("--version")} />
      <EndCard from={B.install + 156} />

      <Host keys={hostKeys} target={target} wakeAt={8} blinks={[150, 470, 700, 1000, 1330]} winkAt={B.end - 40} speaking={speaking} />

      {/* the host's line sits on top of everything */}
      {lineAt && <Line key={lineAt.from} text={lineAt.text} from={lineAt.from} to={lineAt.to} accent={lineAt.accent} y={lineAt.small ? 316 : 236} size={lineAt.small ? 68 : lineAt.text.length > 40 ? 72 : 84} />}
    </AbsoluteFill>
  );
};
