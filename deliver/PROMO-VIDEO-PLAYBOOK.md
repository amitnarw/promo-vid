# Promo Video Playbook: premium launch films from real product footage

You are an AI agent asked to make a promo or launch video. This file is the complete method behind a real production: a 55-second vertical launch film for `@amitnarw/web-mcp`, a browser-automation MCP server. It covers the quality bar, the process, the capture technique, the edit system, the code that took the most debugging, every pitfall we hit, and how to adapt all of it to other products and formats. Read it all before you start; the order of sections is the order of work.

---

## 0. How to use this playbook

1. Read §1 (the bar) and §2 (the process) completely.
2. Do §3 discovery with the human before writing code.
3. Use §5–§10 as the build manual. Its code is TypeScript for Remotion + React Three Fiber + rrweb, but the ideas carry over.
4. Use §11 (QA) after every render, and §16 (pitfalls) as a checklist.
5. If the product isn't a web UI, start with §15 (adapting) to choose a capture strategy.

Stack used here (exact versions; pin yours too): Node 22, Remotion 4.0.536 (`remotion`, `@remotion/cli`, `@remotion/renderer`, `@remotion/bundler`, `@remotion/three`), React 19.2.3, three 0.178.0, @react-three/fiber 9.2.0, @react-three/postprocessing 3.0.4, postprocessing 6.39.5, rrweb 2.1.7, puppeteer-core 25.x, Chrome for Testing 152, fonts via @fontsource (Geist Sans, Geist Mono, Inter), TTS: KittenTTS 2 (local, CPU). Machine: Windows 10 laptop, i7-10850H, Intel UHD graphics, 1536×864 display (125% scaling). Every technical choice below was forced by these limits, and they're common.

---

## 1. The quality bar

The brief's bar, which is the right bar for any premium promo:

- **The viewer gets it in the first 3 seconds** and wants to keep watching.
- **Feels like a premium launch film** (Linear / Vercel / Stripe craft), not a screen recording with captions.
- **A host or mascot narrates in plain human words.** No jargon. It covers what the product is, what it does (every use case), why it's safe or private, and exactly how to get it.
- **The real product, captured in action.** Nothing staged or faked; every claim is true (don't show an order "completed" unless it really completed).
- **Calm, confident camera and pacing.** No whips or chaos, and no slideshow either.
- **Real, legally usable sound** (licensed track or designed audio), and the story still works muted (captions carry it).
- **Readable on a phone**, with each platform's UI overlays in mind.
- **An honest closing card:** what to type or do, plus links.

### Failure modes seen before (learn from them)
- **3.5/10:** cheesy synth drum-loop audio; camera constantly jumping and whipping; empty, cheap-looking dark environment; fake look-alike UI instead of the real thing; jargon-heavy copy; only one use case shown.
- **5/10:** better audio, calm camera, nicer environment, real mascot, real footage. But it played like a slideshow: **real UI too small to read inside big empty frames**, mascot barely alive, no single memorable hero moment, typography without punch, music not connected to the picture.
- **Lessons from this production** (each cost a revision): a grey box behind a magnified UI element looked cheap; replayed UI animations **flickered**; a UI element **vanished and popped back** at every time-skip. All three are fixed in this playbook (§7.4, §7.5, §8.3).

### What "8/10+" means in practice (operational checklist)
- At every moment there is **one** thing to look at, and it is readable at phone size. Body-size UI text is **≥ ~30 px on a 1080-wide frame** (that means ≥ 2× crops of real UI, never full-window shots).
- The mascot **reacts** to what happens: its eyes follow the real clicks, it blinks, it winks at the end.
- There is a **signature device** native to the product (here: the 3D host orb dives into the product's own tiny orb inside its status pill).
- There is a **hero moment** placed on the music's lift.
- **Every cut lands on the bar grid**, so the music is visibly connected to the picture.
- **Honesty is visible:** a "REAL RUN · mm:ss" clock on product shots, labels for demo or test sites, the agent's own words shown unreworded.

---

## 2. The process (phases and gates)

| Phase | Output | Gate before moving on |
|---|---|---|
| 1. Discovery | resources, brand, constraints, decisions list | the human answers the decisions only they can make (§3) |
| 2. **Verify the product works** | a real end-to-end run | it works on a *fresh install* (§4); bugs reported upstream |
| 3. Capture research | measured capture method | numbers prove the method can deliver readable close-ups (§5) |
| 4. Concept + storyboard | beats on a bar grid, script, hero, signature device | human OK (or proceed on stated defaults) |
| 5. Shoot takes | real runs, recorded | each take's result is true and useful |
| 6. Freeze takes | self-contained recordings + timelines | replays match the 1 fps pixel references |
| 7. Style frames | 3 stills (hook, hero, end) | self-critique passes §11 |
| 8. Picture v1 | full render, silent | §11 QA over every beat, contact-sheet flicker scan |
| 9. Feedback loops | fixes | human's issues fixed *at the root*, re-verified frame by frame |
| 10. Sound pass | music cut to the grid, SFX, optional voice | human auditions (never decide audio by assumption) |
| 11. Deliverables | MP4, cover still, captions, credits | specs (§13), caption limits, honesty notes |
| 12. Before posting | re-shoot on the release users will install | product fix published; final re-render |

**Picture first, sound second.** The user preferred this, and it works if the picture is built for sound to drop in: cut on a tempo grid (§8.1), give voice lines caption slots (§8.6), and keep the film working muted.

---

## 3. Discovery (ask once, then work)

Gather, preferably from files rather than questions:
- **The product:** how to install and run it, what it does, every use case to show, what makes it trustworthy (privacy, local-only…), how users get it (command, link).
- **Brand:** colors (hex), fonts, logo/mascot assets, existing UI source (find it inside the installed package or repo; here the extension's CSS defined the mascot exactly).
- **Platforms:** where it's posted (here X + LinkedIn), aspect (9:16 here), duration (45–60 s), captions needed (yes), cover still.
- **Music licensing source** (here incompetech, CC BY 4.0, which needs a credit line in the post).
- **Machine constraints:** screen size, GPU, CPU, what's installed (ffmpeg build, OBS, TTS engines, AI CLIs).

Decisions only a human can make (ask concisely, offer a default):
- Which AI or agent drives the product in the takes, and who pays for it (subscription vs API key).
- Voice: none, TTS (which voice), or a human recording.
- Music track (they must **listen**; you can measure but not judge taste).
- Real sites or accounts that may appear on screen (never personal data; throwaway accounts only).
- Anything that needs their accounts (e.g., a Google Form they create).

If they say "go ahead", proceed on the stated defaults and keep everything swappable.

---

## 4. Verify the product before filming (non-negotiable)

Run the product the way a *new user* would, end to end, before writing any film code.

What happened here: the first real run failed. Every page-level tool returned `pageId: Invalid input: expected number, received undefined`. Root cause: web-mcp spawned `npx chrome-devtools-mcp` **unpinned**, and chrome-devtools-mcp ≥ 1.8.0 turned `pageIdRouting` on by default, which web-mcp never satisfies. *Every fresh install had been broken for two months.* Even the bundled dependency (`^1.0.0` resolved to 1.8.0) was affected.

How it was handled (copy this pattern):
1. **Bisect versions:** download old tarballs (`npm pack pkg@x.y.z`), grep for the option and its default, and find the last compatible version (1.7.0).
2. **Film with a faithful workaround that doesn't modify the product:** run the unmodified package from a folder whose `node_modules` supplies the pinned dependency, so `npx` resolves locally (§6.2).
3. **Write a precise upstream bug report:** symptom, root cause with version numbers, a one-line fix (pin + `--no-page-id-routing`), and how it was verified.
4. **Tell the human: don't post until a fixed release is on the registry.** A promo that drives installs of a broken tool is worse than no promo. Plan to re-shoot on the fixed release.

General rule: if the product fails, *say so plainly*, find the cause, and never hide it with staged footage.

---

## 5. Capture: why "screen recording" fails and what to do instead

### 5.1 Measure before choosing
Vertical video needs readable close-ups of UI, so you need roughly 2–3 device pixels per CSS pixel at 30 fps. Measured on this laptop:

| Method | Result |
|---|---|
| Visible window, CDP `Page.startScreencast` | capped at the **physical screen size**; with emulation it **stalls** (0–3 frames per take) |
| Visible window, `--force-device-scale-factor` | Chrome **clamps the window to the screen** |
| `Page.captureScreenshot` loop at DPR 2.25 (2160×2880) | **~2 fps** |
| Headless, DPR 2.25, 3 parallel shots | ~4–5 fps |
| Headless + GPU, DPR 1.75, 3 parallel | ~10 fps |
| OBS / OS screen recording | limited to the 1536×864 logical screen |

None reaches readable, smooth 30 fps close-ups. Attempt 2's "UI too small to read" was this limit.

### 5.2 The solution: record the DOM, replay it sharp at any zoom
Record the **page's DOM** during the real run with **rrweb** (open-source session replay), then replay it **inside the video renderer** (Remotion runs Chrome) at the exact wall-clock moment of every frame. The replay *is* real DOM, so a CSS-scaled camera re-rasterizes text sharply at any zoom (verified sharp at 2.5×). It's also 30 fps by construction, deterministic, and offline once assets are frozen (§6.4).

Honesty: every pixel comes from the real page's DOM and CSS, as recorded at that real moment. Keep a **1 fps pixel reference** (real screenshots) during each take, and compare replay frames against it before trusting a take. Tell the human this is a DOM recording rather than a pixel recording; they may veto it.

### 5.3 Driving the product: a real agent, not a script
For an AI-agent tool, the "user's AI" must really perform the task. Here: **headless Claude Code** (`claude -p "<plain-English request>"`) with web-mcp as its only MCP server. Nothing about the clicks is scripted. Each take's final answer is ground truth for captions.

Rules that kept takes honest and clean:
- Plain user-style prompts ("Go to wikipedia.org, search for the Eiffel Tower and tell me how tall it is.").
- Fresh empty working directory outside the project (the agent once `Grep`ped the film project from inside it).
- `--strict-mcp-config --mcp-config <file>` (only the product); `--allowedTools mcp__<server>`; `--disallowedTools "Bash,Edit,Write,NotebookEdit,WebFetch,WebSearch,Task,Agent,Read,Grep,Glob"`.
- `--output-format stream-json --verbose`, timestamping every line on receipt.
- **Billing:** if `ANTHROPIC_API_KEY` is set, Claude Code uses it over the logged-in subscription. Strip it from the child env to use the subscription, after asking the human which they want. Also strip `CLAUDECODE` / `CLAUDE_CODE_*` and `VSCODE_*` vars inherited from a parent session.
- Several takes per use case; failures are discarded, never patched.
- Pick sites that allow automation; label practice or demo sites on screen ("saucedemo.com is a demo store built for testing", "books.toscrape.com is a practice store; its prices are sample data"). No personal accounts on screen.
- If a result is unflattering (here: "very little use so far" for npm downloads), don't put it in a launch film. Pick a different real task.

---

## 6. The take recorder (one take = one real run)

### 6.1 Architecture
```
launch the product's own browser (same binary/profile/extension/flags as the product)
  + flags that keep a covered window painting
attach over CDP (puppeteer.connect, defaultViewport:null)
for every page target (existing + new):
   Emulation.setDeviceMetricsOverride  (fixed portrait layout, DPR 0 = native)
   Emulation.setEmulatedMedia prefers-color-scheme: light   (must match the replay browser)
   Network capture of images/fonts/stylesheets (bytes the page actually loaded)
   rrweb recorder injected into the TOP frame only (main world), batched binding flush
   instrumentation in an isolated world: pointerdown/click/focus/input/keydown/scroll + rects
   Page.frameNavigated → "nav" events (used later to tell new pages from snapshots)
   1 fps pixel reference + viewport watchdog (re-apply override if something resets it)
side panel / secondary UI: serve its real HTML from the extension folder in a hidden
   headless browser fed by the same live data stream; record it the same way
tap the product's live event stream (SSE) to a log
run the agent; on exit hold 3 s; write take.json
```

### 6.2 Launching the product's browser faithfully
Copy the product's own launcher arguments exactly, then add capture-only flags:
```
--disable-backgrounding-occluded-windows --disable-renderer-backgrounding
--disable-background-timer-throttling
--disable-features=...,CalculateNativeWinOcclusion
--window-position=0,0 --window-size=1100,820
```
- **Kill stale instances and wait until they're gone** before relaunching. A new Chrome on the same `--user-data-dir` hands itself to the dying instance and never opens the CDP port. Poll the process list until the count is 0.
- To pin a dependency without touching the product, use a launcher that `chdir`s into a folder with the pinned package, then imports the product's bin:
```js
// web-mcp-launch.mjs: run the unmodified product so its `npx chrome-devtools-mcp` resolves to cdm-pin/node_modules (1.7.0)
process.chdir(join(dirname(fileURLToPath(import.meta.url)), "cdm-pin"));
process.argv = [process.argv[0], bin, "mcp"];
await import(pathToFileURL(bin).href);
```

### 6.3 The rrweb recorder (pitfalls are in the comments)
```ts
// UMD bundle evaluated with a private `this`, so it never touches page globals or AMD loaders
const RRWEB_UMD = readFileSync("node_modules/rrweb/dist/rrweb.umd.min.cjs", "utf8").replace(/\/\/# sourceMappingURL=.*$/m, "");
const DOM_RECORDER = `(() => {
  // TOP FRAME ONLY: rrweb creates a hidden iframe for untainted prototypes; a recorder injected into
  // every new document recurses into it forever (hung CDP, thousands of events)
  if (window.top !== window || window.__promoDomRec) return; window.__promoDomRec = true;
  const holder = {}; (function (define, exports, module) { ${RRWEB_UMD} }).call(holder);
  const send = window.__promoRrweb; let q = [], timer = 0;
  // batch + async + chunk (<=400 KB): never call the binding synchronously with MB snapshots
  const flush = () => { timer = 0; const b = q; q = []; if (!b.length) return; const s = JSON.stringify(b), CH = 400000;
    try { if (s.length <= CH) return send('1/1|' + s);
      const id = Math.random().toString(36).slice(2), n = Math.ceil(s.length / CH);
      for (let i = 0; i < n; i++) send(id + ':' + (i + 1) + '/' + n + '|' + s.slice(i * CH, (i + 1) * CH)); } catch {} };
  addEventListener('pagehide', flush);
  holder.rrweb.record({
    emit(e) { e.wall = Date.now(); q.push(e); if (!timer) timer = setTimeout(flush, 100); },
    recordAfter: 'DOMContentLoaded', recordCanvas: true, collectFonts: true, inlineStylesheet: true,
    sampling: { canvas: 6, scroll: 50, input: 'all', mousemove: false },  // 'all' = per-keystroke typing
    checkoutEveryNms: 10000, maskAllInputs: false, maskInputOptions: { password: true },
  });
})();`;
// per page session:
await session.send("Runtime.addBinding", { name: "__promoRrweb" });
await session.send("Page.addScriptToEvaluateOnNewDocument", { source: DOM_RECORDER, runImmediately: true });
// reassemble chunks in Runtime.bindingCalled, append each event as one JSON line to dom.jsonl
```
- `input: 'last'` drops intermediate values. Use `'all'` to get real per-keystroke typing (E → Ei → Eif…).
- Record **light** colour scheme in the live browser (emulated media). The replay browser defaults to light; Windows dark mode made live pages dark and replays light.
- `checkoutEveryNms` creates periodic full snapshots. Your replay must not treat them as new elements (§7.4).

### 6.4 Network capture (assets for offline, faithful replays)
Don't re-download assets afterwards: bursts get rate-limited (HTTP 429), and grabbing all `srcset` candidates ballooned one take to 556 MB. Save what the page actually loaded:
```ts
await session.send("Network.enable", { maxResourceBufferSize: 30e6, maxTotalBufferSize: 200e6 });
session.on("Network.responseReceived", e => { if (["Image","Font","Stylesheet","Media"].includes(e.type)) pending.set(e.requestId, {...}); });
session.on("Network.loadingFinished", async e => { const body = await session.send("Network.getResponseBody", { requestId: e.requestId }); /* save by sha1(url) */ });
```

### 6.5 Shooting
- One take at a time (the product's browser profile is a singleton). A shell script runs all takes sequentially in the background, then freezes each.
- After each take, read its timeline: pages shown, touches, tool calls, side-panel states, result. Render a few `TakeFrame` stills (§10.2) to plan framing.

---

## 7. Freeze + replay (the hard-won core)

### 7.1 Freeze (`capture/freeze.ts`)
- Sort events by timestamp. Rewrite every asset reference (img `src`/`srcset`/`poster`, link stylesheets rrweb couldn't inline, `url()` in inline CSS / `_cssText` / style text nodes / CSSOM rule events) to `promo-asset://<sha>.<ext>` when the bytes were captured. Keep only `srcset` candidates the page actually loaded.
- Saved **stylesheet files** must use **plain relative names** (their fonts and images sit beside them). `promo-asset://` inside files is never rewritten at render time, which broke fonts with a CORS error.
- Mark each full snapshot `promoNew = true` if a navigation happened since the previous full snapshot (or it's the first); otherwise it's a checkout of the same page (needed by §7.4).
- Export a small **timeline JSON** imported by the edit: `{prompt, viewport, tabs: {start, pages:[{href, shown}]}, touches, tools, says, result, sidebar}`. A page counts as "shown" at its full snapshot, not its meta event (the old page stays visible until then).
- At render time, the replay swaps `promo-asset://` for an **absolute** URL (`location.origin + staticFile(...)`), because replayed documents carry the original `<base>`.

### 7.2 Replay component essentials (`DomReplay`)
```ts
const replayer = new Replayer(events, { root, skipInactive:false, showWarning:false, mouseTail:false, UNSAFE_replayCanvas:true, triggerFocus:false });
replayer.iframe.setAttribute("scrolling", "yes"); // rrweb sets "no": the live window's 15px scrollbar changed line wrapping
// each frame (inside delayRender/continueRender):
replayer.pause(wall - events[0].timestamp);        // rebuilds from the nearest full snapshot, applies events up to t
doc.documentElement.classList.remove("rrweb-paused"); // rrweb freezes every CSS animation while paused
// ...seek animations (7.4), run transitions (7.5), then wait for fonts + images (≤4 s)
```
Also hide rrweb's fake cursor (`.replayer-mouse{display:none}`); the product's own click markers are what you show.

### 7.3 Verify replays against reality
`capture/replay-check.ts` replays a tab at high DPR at the moments of its 1 fps pixel references and writes side-by-side pairs. Check layout, text, overlays, theme and scrollbar. Differences found this way, and fixed: missing scrollbar width, dark vs light scheme, a map image blocked by referrer (fixed by network capture), overlays invisible (animations frozen).

### 7.4 Animations: seek from the element's real insertion time (fixes flicker)
CSS animations restart when an element is **inserted**, not when its attributes change. For each animation at time `wall`, set `currentTime = wall − insertionTime`, where insertion time is the latest real insert of the element or any ancestor, tracked **by rrweb node id per recorder instance**:
- Full snapshot with `promoNew`: a new instance; record the insert time of every node id in it.
- Checkout snapshot (same instance): record only ids never seen. *This is the flicker bug:* treating checkouts or attribute changes as births restarted the product's 0.6 s slide-up entrance every 10 s and on every status update.
- Mutation `adds`: push a new insert time (re-inserts restart animations, as in a browser).
```ts
for (const anim of doc.getAnimations()) {
  if ("transitionProperty" in anim) { /* §7.5 */ continue; }
  let at = instanceStart;
  for (let n = anim.effect.target; n; n = n.parentNode) { const b = bornAt(inst, mirror.getId(n), wall); if (b !== undefined && b > at) at = b; }
  anim.pause(); anim.currentTime = Math.max(0, wall - at);
}
```

### 7.5 Transitions: let Chrome run the product's real CSS transitions
A rebuilt DOM runs **no** transitions. Status text that the product fades out, swaps and fades in (0.2 s each) instead blanked and popped. Fix: keep each node's **class and inline-style history** (initial values from snapshots and adds; changes from attribute mutations; rrweb gives style as a string or a per-property diff object, where `false` means removed). Each frame, for changes in the last 800 ms:
1. Set the element's class or style property **back to its previous value**.
2. Flush style once (`getComputedStyle(doc.documentElement).opacity`).
3. **Restore** the current values, so Chrome starts the real transitions.
4. For each `CSSTransition` in `doc.getAnimations()`: `pause()` and `currentTime = wall − changeTime` (the element's or nearest ancestor's change).

This reproduces every fade and slide exactly as the product's CSS defines it, with no hand-written animation.

### 7.6 Overlay-only replays (the product's own widget, floating)
To magnify just the product's indicator (here web-mcp's status pill and tooltip) without the page behind it (the "grey box" complaint), add a style element after each pause:
```css
:root{color-scheme:normal!important} html,body{background:transparent!important}
body *{visibility:hidden!important}
.bp-action-bar-root,.bp-action-bar-root *,.bp-chat-bubble,.bp-chat-bubble *{visibility:visible!important}
::-webkit-scrollbar{width:15px;background:transparent}::-webkit-scrollbar-thumb{background:transparent}
```
(`visibility` can be re-enabled on descendants; `display`/`opacity` can't.) Keep the transparent scrollbar so layout width, and therefore the widget's position, stays identical. Make the container and iframe backgrounds transparent, and add `filter: drop-shadow(...)` so the widget gets a shadow shaped like itself. **Glass/blur widgets must float over the plain stage, not over another page**, or that page shows through the glass.

---

## 8. The edit system (Remotion)

### 8.1 Tempo grid: picture locked to music
```ts
export const FPS = 30; export const BPM = 121.75;          // set to the chosen track's measured tempo
export const BAR_S = 4 * 60 / BPM;
export const bars = (n: number) => Math.round(n * BAR_S * FPS); // frames at bar n (0.25 = one beat)
```
Every beat boundary is `bars(n)`. Here: hook 0–2, ask 2–4, search 4–8, forms 8–11, hero 11–16, chores 16–19, test 19–22, privacy 22–24, install/end 24–28 → 1656 frames = 55.2 s. To change track: set BPM, check that accents still land, and nudge the music start offset so the track's lift lands on the hero bar.

### 8.2 Keyframes and time maps
```ts
// interpolate all numeric fields between keyframes with a calm ease
export const calm = Easing.bezier(0.45, 0, 0.2, 1);
export function keyed(keys, f, ease = calm) { /* find surrounding keys, interpolate each field */ }
// composition frame -> take seconds, piecewise linear: real time while acting, skips while thinking
export function remap(map: [frame, takeSeconds][], f) { /* … */ }
```
Example time map: `[[222,34.2],[264,35.0],[300,35.75],[318,36.75],[326,44.3],[346,44.7],[372,46.4],[473,50.6]]` (real-time typing, a 7.5 s skip over the agent thinking in 8 frames, then real time again).

### 8.3 `ReplayWindow`: camera, card, honesty clock
- `cams`: page point at the window centre `(x, y)` and screen px per page px `s`. `wins`: screen rect and opacity over time. Inner transform: `left = w/2 − x·s`, `top = h/2 − y·s`, `scale(s)`.
- **REAL RUN · mm:ss clock:** elapsed real time since the request (first tool call). Skips stay visible, because the clock jumps.
- **URL chip:** hostname only (SPAs change routes without new snapshots).
- **Hold through skips** for magnified overlays: if the step to the next frame is faster than 3× real time, keep showing the state from the start of the fast run, and update once at its end. *Don't fade overlays during skips* (that caused "it vanishes and suddenly appears").
```ts
const fastStep = (time, f) => Math.abs(remap(time, f + 1) - remap(time, f)) * 30 > 3;
function heldSeconds(time, f) { if (!fastStep(time, f)) return remap(time, f); let g = f; while (g > f - 240 && fastStep(time, g - 1)) g--; return remap(time, g); }
```
- Ease magnified overlays **out just before a page navigation** (the real widget is removed and re-injected on the new page, which reads as a glitch).

### 8.4 Layout rules (9:16, 1080×1920)
- Working safe zones (assumptions; check current platform specs): keep key content out of the **top ~220 px**, **bottom ~420 px** and the **right ~140 px** in the lower half (platform buttons, captions, usernames).
- Per use-case beat: label pill at y≈232 · host's line at y≈316 (68–84 px, max 2 lines; shrink to 72 px if over ~40 chars) · main window centred y≈980, 960×790 · magnified overlay ("lens") floating on the stage just below the window · host perched on the window's top-right corner (r≈70).
- **Readability rule:** frame real UI at s ≥ ~1.6–2.5. Full-page shots are context only. Crop to the action, frame whole lines of text (never cut a sentence's start), and verify on a phone-sized view.
- Camera language: one move per shot, eased (`bezier(0.45,0,0.2,1)`), slow push-ins to the action, pull back when the page changes. Never whip.

### 8.5 The host (mascot) animation model
All a pure function of the frame (deterministic renders):
- Position and size from keyframes; idle bob `sin(t·1.5)·0.035r`; breathing squash.
- **Gaze:** a target screen point (latest real touch mapped through the window camera, or a card or table row). Direction = normalised `(dx, −dy)`, reach = `min(1, distance / 2.2r)`, averaged over the last 6 frames (eyes lead with a lag). The body rotates slightly with the gaze.
- **Blinks:** natural cadence (~every 3.3 s, varied) plus scripted ones; a 6-frame blink (2 closing, 4 opening); a **wake** (eyes open over 8 frames at the start); a **wink** (one eye, ~22 frames) on the end card.
- **Speaking:** eye glow pulses while a caption line is being revealed.
- **Signature move:** the host dives into the product's own tiny mascot (inside the status pill), landing exactly on its screen position (computed through the lens camera from the measured page position of that tiny orb in that UI state). It's hidden while "inside" the product, then pops back out and perches.
- **Touch targets:** map logged touch rects through the window camera: `screen = win.centre + (page − cam.centre) · s`.

### 8.6 Typography and captions
- One statement per beat, Geist Sans 600, −0.04em tracking, white with **accent words** in the brand light colour.
- Words rise in one by one (14-frame ease-out, 3-frame stagger, slight blur-in), then ease out. These lines **are** the subtitles for muted autoplay, and the **voice slots** if a voice is added later.
- Copy: plain words, no jargon ("It searches and reads, like you would." / "Fills in forms. Clicks the buttons." / "Pulls what you need, straight off the page." / "Even the boring, everyday checks." / "And tests your site like a real customer." / "Everything stays on your computer." / "One line to install." / "Give your AI a browser.").

### 8.7 Cards built from real data
- **Request card:** the take's real prompt, typed out (mono, caret).
- **Answer card:** the agent's real final answer, **first sentence only** (excerpt, never reworded); markdown `**bold**` preserved.
- **Table card (hero):** rows parsed from the agent's real markdown table, staggered by a beat; a small honesty note under it.
- **Terminal card:** the real recorded install output (spawned with `NO_COLOR`, chunk timestamps kept), each command typed, output at compressed real pace, filtered to meaningful lines.
- **End card:** the install command in a gradient chip, the next step ("then run `web-mcp`"), supported tools, links.

### 8.8 Stage
Brand surface colour with 2–3 slow drifting radial light blobs in the accent blues, plus a vignette. `energy` brightens it on the hero beat and dims it on the privacy beat. Slow enough to read as calm; never an empty flat void.

---

## 9. The mascot in 3D (from brand assets)

- Build it from the **product's own definition** (here the extension's CSS orb plus the icon PNG): colours, eye size and spacing, blink timing, eye-dart behaviour.
- **Don't use environment-map reflections for gloss on a character.** A bottom light panel reflected as a "smile", a second one as a "third eye", and the halo discs read as goggles. Draw the gloss in a custom shader instead: a gradient body (light top-left, mid, deep shadow), an inner under-glow, a **soft broad highlight** (Blinn exponent ~14), a **tiny, dim** hot spec (exponent ~600, intensity ~0.3; bigger reads as a third eye), and a thin fresnel rim in the accent colour.
- Eyes: flat emissive discs on the sphere surface, oriented to the normal; blink = scale-Y. Glow via postprocessing Bloom (`luminanceThreshold 1.0`, eye colour > 1, `toneMapped=false`).
- One `ThreeCanvas` (one WebGL context) for the whole film; perspective camera `z=20, fov 20°` → 1 world unit ≈ 272 px on a 1920-tall frame; place by converting screen px to world.
- Remotion config: `Config.setChromiumOpenGlRenderer("angle")` for WebGL on Intel GPUs.

---

## 10. Rendering, tooling and speed

### 10.1 Commands
- Full render: `npx remotion render src/index.ts Film out/film.mp4 --concurrency=6` → 1656 frames in **~6.5 min** on this laptop.
- **Review stills: bundle once, one browser, several frames in flight** (`scripts/stills.ts` using `@remotion/bundler` `bundle()` + `@remotion/renderer` `openBrowser`/`selectComposition`/`renderStill`) → 11 stills in **24 s**, versus ~1 min each with `remotion still`, which re-bundles every call.
- **Contact sheets** (`scripts/sheet.ts`): crop one region from many stills into a grid. Use it to find flicker or popping over consecutive frames without watching video.

### 10.2 Inspection composition
`TakeFrame` renders any take's tab at full viewport at take second `t` (props: take, tab, t, start). Use it to plan framing: where is the sentence, the button, the widget at that moment?

### 10.3 Environment pitfalls
- Remotion's bundled ffmpeg is minimal: no raw `f32le` output and no PNG/JPEG encoders. Decode audio to `pcm_s16le` WAV on a pipe and parse the `data` chunk; build image grids in a browser instead.
- Git Bash paths (`/c/...`) don't work when passed to native Windows executables from Node. Use `C:/...`.
- Never put `python3 -` before a heredoc in a shell chain; it waits on stdin forever. Write edit scripts to files.
- CPU-heavy jobs (TTS, renders, browser takes) slow each other. Sequence them, and tell any other agent sessions on the machine.
- Remotion's browser may time out on launch under heavy CPU load; retry.

---

## 11. QA: how to review like a director

After every render, review stills at each beat **and** at transitions (dive, pop-out, beat boundaries, the final frame). Look for:
- [ ] Anything unreadable at phone size (text < ~30 px), or sentences cut at window edges.
- [ ] Collisions: headline vs mascot, cards vs widgets, chips covered by the perched mascot.
- [ ] Empty states: a form still blank at the hook (start typing at once), a lens over the button it explains.
- [ ] Mascot artifacts (third-eye highlight, smile reflection, eyes misplaced in the dive).
- [ ] Framing that cuts the key line ("…perational" instead of "All Systems Operational").
- [ ] Overlapping fades (request card fading out over the incoming page): give each moment its own beat.
- [ ] **Temporal checks with contact sheets:** every 2–4 frames across each beat with overlays. Look for blinking, popping, re-entrances and states that jump.
- [ ] Honesty: clock present on product shots; demo-site labels; answers unreworded; no claim beyond the agent's result.

Score yourself honestly and name the weak spots (repeated layouts, plain fades, empty bottom band). Then fix the root cause in the system (renderer or layout), not the symptom in one frame.

---

## 12. The sound pass

### 12.1 Choosing music when you can't listen
Some setups (and some users' explicit wishes) mean the agent never plays audio. **Measure**, shortlist, and let the human **listen and choose**.
1. Filter the catalogue (here incompetech `pieces.json`) by BPM 88–128, feel words (calm, bright, uplifting, driving, mysterious), modern instruments; exclude novelty genres.
2. Analyse each candidate: decode to mono 22.05 kHz s16 WAV; STFT (N=1024, hop 512); per-second RMS dB, low/high band energy, spectral-flux onsets; tempo by onset autocorrelation (70–160 BPM); first-beat phase. Print sparklines per second to see intro, drum entry, lift and breakdown.
3. Shortlist 3 with **useful structure** (here: Living Voyage 121.75 BPM with drums from ~2 s and a big lift at ~37.7 s; Hypnothis 104.5 BPM with an ambient intro and the beat at ~18 s; Killing Time 98.5 BPM with clean breaks at ~20 s and ~48 s). Note which are overused.
4. Align: choose the track's start offset (on its bar grid) so its lift lands on the hero bar. Here, starting the track ~10.1 s in puts the lift on the table reveal. End on a real musical boundary (or a 1–2 bar fade); never a mid-phrase cut.
5. Credit line (CC BY 4.0): `Music: "<Title>" by Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0`.

### 12.2 SFX
Quiet CC0 UI clicks (e.g., Kenney interface sounds) on the **real logged clicks and keystrokes** (from `events.jsonl` mapped through the time map), a soft rise on the signature dive, and nothing cheesy.

### 12.3 Voice (optional; the human decides)
- Options ranked: human read > premium TTS (paid, licence check) > local TTS. A synthetic narrator is the most common cause of a "cheap" feel; a mascot voice should sound like a character.
- Local KittenTTS 2 on CPU: ~4 min per line on this laptop, so batch in the background.
- Shortlist voices by measurement: median F0, F0 range in semitones (expressiveness), voiced ratio. Here Hugo (160 Hz, 14.7 st) and Leo (198 Hz, 13.8 st) were the most expressive. Render the same opening line in 5–7 voices and let the human pick.
- Fit lines to the caption slots; word-level timestamps (e.g., Whisper) drive word-synced captions; pulse the mascot's eye glow with the voice envelope; duck the music under the voice.

### 12.4 Mix
Common social target around −14 LUFS integrated, true peak below −1 dBTP; music ducked ~6–9 dB under the voice; SFX subtle. Verify by measurement.

---

## 13. Deliverables

- **Film:** H.264 MP4, 1080×1920, 30 fps, ~55 s, AAC audio once the sound is in. Keep a silent "picture" version too.
- **Cover still:** the hero line, the mascot looking at the viewer, a real UI crop plus the magnified product widget, the install command; key content in the centre band.
- **Captions:** X ≤ 280 characters (URLs count as 23); put the music credit in the **first reply** if space is tight. LinkedIn longer: what it is, the use cases as bullets, privacy, "everything in the video is a real run" + which sites are demo/test sites, install steps, links, music credit, 2–3 hashtags.
- **Before posting:** product fix released; re-shoot takes on the released version (one command), re-freeze, re-render.

---

## 14. What was built here (iteration log)

1. Discovery: package, extension CSS (the mascot's exact definition), side-panel data feed (`EventSource` on localhost with open CORS, so the real panel page can run in a hidden browser).
2. Music shortlist by measurement; Kitten voice shortlist by measurement.
3. First real run → product broken → root cause → version bisect → pinned launcher → upstream bug doc.
4. Capture probes → screencast and screenshot limits measured → DOM recording chosen.
5. rrweb integration: runImmediately/evaluate hang → infinite iframe recursion found by bisecting options and setup → top-frame guard + batched async chunked flush.
6. Replay check vs pixel references → scrollbar, colour scheme, paused animations, missing images → fixed (scrolling=yes, light scheme, animation seeking, network capture).
7. Remotion replay component; first test clip; per-keystroke typing; freeze + timelines.
8. Mascot v1 (environment reflections: smile, goggles, third blob) → v2 (shader gloss) → v3 (dimmer specular).
9. Style frames: full-width card unreadable → crops at ≥2× + lens on the product widget.
10. Takes: checkout (completed order on a demo store), Wikipedia search, form submit, price table, GitHub status, terminal install; dropped an unflattering stats take.
11. Film v1 on the bar grid; review stills → fixes (empty hook form, lens over the button, headline collisions, answer excerpt, framing of key lines, status framing, mascot overlap).
12. Speed: bundle-once parallel stills (11 in 24 s); full render ~6.5 min.
13. Human feedback 1: grey box behind the widget + flicker → overlay-only transparent lens; flicker root cause = animation restarts from checkouts/attribute changes → insertion-time tracking per instance.
14. Human feedback 2: widget vanishes and pops at skips → hold through skips; status text blanking → real CSS transitions replayed (restore-previous / flush / restore-current / seek); lens eases out before navigations.

---

## 15. Adapting to other products and formats

| Product type | Capture strategy | Notes |
|---|---|---|
| Web app / SaaS / browser extension | **DOM recording + replay** (this playbook) | Drive with a real user, a scripted user flow (labelled as such) or a real agent. Freeze assets. |
| Desktop app (Electron) | It's Chromium: inject rrweb via remote debugging, same as web | Native (non-web) apps: OS capture at native resolution on a large virtual display, or a high-DPI machine; plan crops around capture resolution. |
| CLI / dev tool | **Record the PTY stream with timing** (node-pty, or child process with `NO_COLOR` for non-interactive output); re-typeset with a terminal renderer (xterm.js) in the composition | Sharp at any zoom, real output. Interactive TUIs need a real PTY. |
| API / SDK / library | Real code + real responses: run it, record request/response with timestamps, animate code typing and real JSON results | Show a real consumer app if one exists. |
| Mobile app | Simulator/emulator capture at device resolution (`xcrun simctl io recordVideo`, `adb shell screenrecord`), or a React Native/Flutter web build with DOM capture | Device frames optional; keep crops readable. |
| AI agent / automation | Real runs from plain prompts; agent logs as ground truth; REAL RUN clock; skip only thinking time | Disallow tools outside the product; empty working directory; several takes. |
| Hardware / physical | Real footage (phone 4K, 60 fps) + 3D model if CAD exists | Same grid/camera/type rules; never render a "fake" product state. |
| Games | Engine capture at target resolution (or deterministic replay of recorded inputs) | Same honesty rules about gameplay. |
| Non-visual service | A metaphor host (mascot) + real artefacts (emails sent, receipts, dashboards) | Show real outputs, not stock footage. |

Formats: 9:16 (Shorts/Reels/TikTok/X/LinkedIn mobile), 4:5 (feeds), 1:1, 16:9 (YouTube/web). Redefine the safe zones and layout constants per format; keep the grid, keyframe, time-map and replay systems unchanged.

Durations: hook ≤ 3 s; ~6–9 s per use case; one hero; ≤ 6 s end card. For 15–30 s cuts, keep the hook, one or two use cases, the hero and the end card.

---

## 16. Pitfalls checklist (each one cost real time)

- [ ] Product not verified on a fresh install → broken tool promoted. Verify first; pin dependencies; report upstream; don't post until fixed.
- [ ] Unpinned `npx <dep>` in tools → silent breakage when the dependency changes defaults.
- [ ] Screen recording on a small display → unreadable UI. Measure the capture ceiling first.
- [ ] Headful screencast + emulation → stalls; `--force-device-scale-factor` → window clamped to the screen.
- [ ] rrweb injected into every document → infinite recursion through its own hidden iframe → hung CDP. Guard `window.top === window`.
- [ ] Synchronous CDP binding calls with MB payloads → batch, async, chunk.
- [ ] rrweb `input:'last'` → no per-keystroke typing.
- [ ] Live dark mode vs replay light mode → force the scheme during capture.
- [ ] rrweb iframe `scrolling="no"` → line wrapping differs from live.
- [ ] rrweb paused = all animations frozen → overlays invisible.
- [ ] Animation "birth" from attribute changes or checkout snapshots → flicker. Use real insertion time per instance.
- [ ] Rebuilt DOM has no transitions → fades blank and pop. Replay real transitions.
- [ ] Overlays faded during skips → vanish/pop. Hold state through skips.
- [ ] Magnified glass widget over another page → page shows through. Float it on the stage.
- [ ] Re-downloading assets → 429s and huge folders. Capture network bytes during the take.
- [ ] `promo-asset://` inside saved CSS files → fonts blocked. Use relative names.
- [ ] Stale browser instance holding the profile → no CDP port. Kill and wait.
- [ ] Agent run inside the project folder → it reads your files. Use an empty temp directory and disallow file tools.
- [ ] `ANTHROPIC_API_KEY` in env → bills the API, not the subscription. Ask; strip if needed.
- [ ] Mascot gloss from environment maps → accidental faces. Shader gloss.
- [ ] Specular as big as an eye → "third eye".
- [ ] Long headlines → collide with the mascot. Size by length.
- [ ] Showing whole agent answers → walls of text. First sentence only.
- [ ] Re-bundling per still → slow reviews. Bundle once.
- [ ] Deciding music or voice without the human listening → don't.

---

## 17. Working style that made the difference

- **Research before building:** check what already exists (the product's own files, packages, assets); propose adopt/borrow/build.
- **Measure, don't guess:** capture limits, render speed, audio structure, voice expressiveness.
- **Look at your own output** after every change (stills, pairs, contact sheets), critique it harshly, and fix systems, not frames.
- **Fix root causes** (animation timing model, transition replay), then verify over ranges of frames, not one frame.
- **Be honest with the human:** product bugs, trade-offs, your own score, what's real and what's presentation.
- **Parallelise what can be parallel** (stills in flight, writing captions during renders); keep CPU-heavy jobs sequential.
- **Ask only for decisions that are the human's**; otherwise proceed on stated defaults and keep them swappable.
- **Commit locally** with clear messages; never push or publish without being asked.

---

## Appendix A: project layout used here

```
capture/
  take.ts             one real take: product browser + CDP recorder + side panel + agent run
  shoot.sh            prompts per take id; runs takes sequentially, then freeze
  freeze.ts           assets → promo-asset://, snapshot instance marks, timeline export
  terminal.ts         real install/CLI output with timing
  replay-check.ts     replay vs 1 fps pixel reference pairs
  web-mcp-launch.mjs  run the unmodified product with a pinned dependency (cdm-pin/)
  probes/             measurements behind each technical choice
src/
  replay/DomReplay.tsx   rrweb replay: insertion-time animation seeking, transition replay, overlay-only mode
  replay/Crop.tsx        static crop helper for style frames
  film/grid.ts           FPS, BPM, bars(), keyed(), remap(), easings
  film/ReplayWindow.tsx  camera + card + REAL RUN clock + URL chip + overlay lens + hold-through-skips
  film/Host.tsx          mascot on one 3D canvas: keys, gaze lag, blinks, wake, wink, speaking glow
  film/track.ts          touch → screen mapping through a window camera
  film/Line.tsx          word-by-word captions + label pills
  film/Cards.tsx         request card (real prompt), answer card (first sentence of the real answer)
  film/Panels.tsx        hero table (real rows), terminal (real output), end card
  film/Stage.tsx         animated brand stage
  film/Film.tsx          the whole film in global frames on the bar grid
  mascot/Orb.tsx         shader-gloss orb with emissive dot eyes
  compositions/          TakeFrame (inspection), Cover, style frames
  takes/<id>.json        exported timelines (imported by the film)
scripts/stills.ts        bundle once, render stills in parallel
scripts/sheet.ts         contact sheets for temporal QA
public/takes/<id>/       frozen recordings + assets (render-ready, not in git)
takes/<id>/              raw takes (not in git)
docs/                    storyboard, captions, upstream bug report, this playbook
deliver/                 final MP4, cover, captions
```

## Appendix B: minimal "first day" plan for a new product
1. Discovery questions (§3) → defaults → go.
2. Fresh-install run of the product; fix or report what breaks.
3. Capture probe: can you get readable 2× crops at 30 fps? If not, choose DOM/PTY/simulator capture (§15).
4. One spike take → freeze → replay-check pairs → a 9 s test clip with a camera push.
5. Storyboard on a bar grid with one hero and one signature device native to the product.
6. Style frames for hook, hero and end; self-critique; fix.
7. Shoot all takes; build the film; review stills + contact sheets; render v1; ask for the human's audio choices.

---

## Appendix C: complete source of the working system

Copied verbatim from the project. Paths are Windows paths for one machine (product install dir, Chrome for Testing, Claude Code binary): adapt the constants at the top of each file. `src/film/Film.tsx` is project-specific; treat it as a worked example of how beats, cameras and time maps are laid out on the bar grid.

### package.json: Dependencies (pinned versions)

```json
{
  "name": "web-mcp-promo",
  "version": "0.1.0",
  "private": true,
  "description": "Launch film for @amitnarw/web-mcp, built from real captured runs",
  "type": "module",
  "scripts": {
    "studio": "remotion studio",
    "render": "remotion render",
    "still": "remotion still",
    "typecheck": "tsc",
    "take": "tsx capture/take.ts"
  },
  "dependencies": {
    "@fontsource/geist-mono": "^5.2.5",
    "@fontsource/geist-sans": "^5.2.5",
    "@fontsource/inter": "^5.2.8",
    "@react-three/drei": "10.7.9",
    "@react-three/fiber": "9.2.0",
    "@react-three/postprocessing": "3.0.4",
    "@remotion/cli": "4.0.536",
    "@remotion/fonts": "4.0.536",
    "@remotion/media": "4.0.536",
    "@remotion/media-utils": "4.0.536",
    "@remotion/openai-whisper": "4.0.536",
    "@remotion/renderer": "4.0.536",
    "@remotion/three": "4.0.536",
    "postprocessing": "6.39.5",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "remotion": "4.0.536",
    "rrweb": "2.1.7",
    "three": "0.178.0",
    "zod": "4.5.4"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "19.2.7",
    "@types/three": "0.170.0",
    "puppeteer-core": "^25.1.0",
    "tsx": "4.23.15",
    "typescript": "5.9.3"
  }
}
```

### remotion.config.ts: Remotion config

```ts
import { Config } from "@remotion/cli/config";

// ANGLE gives the 3D mascot real WebGL on this Intel GPU
Config.setChromiumOpenGlRenderer("angle");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
```

### capture/take.ts: Take recorder: product browser + CDP DOM recorder + side panel + agent run

```ts
/**
 * capture/take.ts — record one real take.
 *
 *   npx tsx capture/take.ts --id wiki-01 --prompt "Open Wikipedia and ..."
 *
 * 1. Launches web-mcp's own Chromium (same binary, profile, extension and
 *    flags as `web-mcp browser`) plus flags that keep a covered window painting.
 * 2. Attaches over CDP: lays every tab out at a fixed portrait viewport, records
 *    its DOM with rrweb (page + extension overlays, wall-clock stamped) so it
 *    can be replayed sharp at any zoom, logs pointer/keyboard/scroll events from
 *    an isolated world, and keeps a 1 fps pixel reference to check replays
 *    against. None of it changes what the page shows.
 *    (Pixel capture can't do it here: a visible window's screencast is capped at
 *    screen size and stalls under emulation, and high-DPR screenshots top out at
 *    ~2–5 fps on this CPU.)
 * 3. Opens the real sidepanel.html in a hidden headless Chromium, fed by the
 *    same live event stream, and records it the same way as its own layer.
 * 4. Runs headless Claude Code with web-mcp as its only MCP server and the
 *    user's plain-English prompt. Nothing about the clicks is scripted.
 *
 * Output: takes/<id>/ with <tab>/dom.jsonl, events.jsonl, ref/*.jpg, agent.jsonl, sse.jsonl, take.json
 */
import { spawn, execSync, type ChildProcess } from "child_process";
import { createHash } from "crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync, appendFileSync, readFileSync, readdirSync } from "fs";
import { createServer } from "http";
import { homedir, tmpdir } from "os";
import { join, extname } from "path";
import puppeteer, { type Browser, type CDPSession, type Target } from "puppeteer-core";

const HOME = homedir();
const PKG = join(HOME, "AppData/Local/Author Software/nvm/installs/v22.23.2/node_modules/@amitnarw/web-mcp");
const CHROME = join(HOME, ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe");
const WEB_MCP_DIR = join(HOME, ".web-mcp");
const PROFILE = join(WEB_MCP_DIR, "chromium-profile-v2");
const EXT = join(WEB_MCP_DIR, "extension");
const CLAUDE = join(HOME, ".vscode/extensions/anthropic.claude-code-2.1.312-win32-x64/resources/native-binary/claude.exe");
const CDP_PORT = 9222;
const PANEL_CDP_PORT = 9333;
const PANEL_HTTP_PORT = 3091;
const WEB_MCP_PORT = 3026;

const arg = (name: string, fallback?: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const id = arg("id") ?? `take-${Date.now()}`;
const prompt = arg("prompt");
if (!prompt) throw new Error("--prompt is required");
const VW = Number(arg("vw", "960"));
const VH = Number(arg("vh", "1280"));
const PANEL_W = 420;
const model = arg("model");
const startUrl = arg("start", "about:blank")!;

const OUT = join(process.cwd(), "takes", id);
if (existsSync(OUT)) throw new Error(`take ${id} already exists`);
mkdirSync(OUT, { recursive: true });
const log = (file: string, o: object) => appendFileSync(join(OUT, file), JSON.stringify({ t: Date.now(), ...o }) + "\n");
const say = (s: string) => console.log(`[take ${id}] ${s}`);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function until(check: () => Promise<boolean>, ms: number, what: string) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await check().catch(() => false)) return;
    await wait(250);
  }
  throw new Error(`timed out waiting for ${what}`);
}
const cdpUp = (port: number) => () => fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.ok);

// ---- 1. web-mcp's Chromium, launched the way `web-mcp browser` does it ----
function launchWebMcpChrome(): ChildProcess {
  cpSync(join(PKG, "extension"), EXT, { recursive: true, force: true });
  writeFileSync(join(EXT, "env.js"), `globalThis.WEB_MCP_PORT = ${WEB_MCP_PORT};\n`);
  for (const d of [join(PROFILE, "Default", "Extensions"), join(PROFILE, "extensions_crx_cache")]) rmSync(d, { recursive: true, force: true });
  // stop any earlier instance on this profile and wait until it has really exited,
  // or the new process hands itself to the dying one and never opens the CDP port
  const ps = (cmd: string) => execSync(`powershell -NoProfile -Command "${cmd}"`, { encoding: "utf8" }).trim();
  const alive = `(Get-CimInstance Win32_Process -Filter \\"Name='chrome.exe'\\" | Where-Object { $_.CommandLine -like '*chromium-profile-v2*' })`;
  for (let i = 0; i < 20; i++) {
    try {
      if (ps(`${alive}.Count`) === "0") break;
      ps(`${alive} | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`);
    } catch {}
    execSync("powershell -NoProfile -Command Start-Sleep -Milliseconds 500");
  }
  const args = [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${PROFILE}`,
    `--load-extension=${EXT}`,
    "--disable-blink-features=AutomationControlled",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-popup-blocking",
    "--disable-translate",
    "--disable-fre",
    "--disable-features=DisableLoadExtensionCommandLineSwitch,ExtensionDisableUnsupportedDeveloper,CalculateNativeWinOcclusion",
    // capture-only: keep painting when the window is covered or unfocused
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-background-timer-throttling",
    "--window-position=0,0",
    "--window-size=1100,820",
    startUrl,
  ];
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(ELECTRON_|OPENCODE_|VSCODE_|CLAUDE)/i.test(k)));
  return spawn(CHROME, args, { detached: true, stdio: "ignore", env });
}

// ---- 2. per-tab recorder ----
const INSTRUMENT = `(() => {
  if (window.__promoRecInstalled) return; window.__promoRecInstalled = true;
  const send = (o) => { try { __promoRec(JSON.stringify({ ...o, t: Date.now(), url: location.href })); } catch {} };
  const rect = (el) => { if (!el || !el.getBoundingClientRect) return null; const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); };
  const label = (el) => el ? ((el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('name') || el.getAttribute('placeholder'))) || (el.innerText || '').trim().slice(0, 60)) : '';
  addEventListener('pointerdown', (e) => send({ k: 'down', x: e.clientX, y: e.clientY, r: rect(e.target), tag: e.target.tagName, label: label(e.target) }), true);
  addEventListener('click', (e) => send({ k: 'click', x: e.clientX, y: e.clientY, r: rect(e.target), tag: e.target.tagName, label: label(e.target) }), true);
  addEventListener('focusin', (e) => send({ k: 'focus', r: rect(e.target), tag: e.target.tagName, label: label(e.target) }), true);
  addEventListener('input', (e) => send({ k: 'input', r: rect(e.target), len: String(e.target.value ?? '').length }), true);
  addEventListener('keydown', (e) => send({ k: 'key', key: e.key.length === 1 ? 'char' : e.key }), true);
  let last = 0;
  addEventListener('scroll', () => { const n = Date.now(); if (n - last > 80) { last = n; send({ k: 'scroll', y: Math.round(scrollY) }); } }, true);
  document.addEventListener('visibilitychange', () => send({ k: 'vis', v: document.visibilityState }));
  send({ k: 'ctx', title: document.title, vis: document.visibilityState });
})();`;

// rrweb's UMD bundle, called with a private `this` so it never touches the page's
// globals or AMD loader; records the DOM (page + extension overlays) as events.
const RRWEB_UMD = readFileSync(join(process.cwd(), "node_modules/rrweb/dist/rrweb.umd.min.cjs"), "utf8").replace(/\/\/# sourceMappingURL=.*$/m, "");
// Top frame only: rrweb makes a hidden iframe for untainted prototypes, and a
// recorder injected into every new document would recurse into it forever.
// Events are batched and flushed asynchronously in <=400 KB chunks.
const DOM_RECORDER = `(() => {
  if (window.top !== window || window.__promoDomRec) return; window.__promoDomRec = true;
  const holder = {};
  (function (define, exports, module) { ${RRWEB_UMD} }).call(holder);
  const send = window.__promoRrweb;
  let q = [], timer = 0;
  const flush = () => {
    timer = 0;
    const batch = q; q = [];
    if (!batch.length) return;
    const s = JSON.stringify(batch), CH = 400000;
    try {
      if (s.length <= CH) return send('1/1|' + s);
      const id = Math.random().toString(36).slice(2), n = Math.ceil(s.length / CH);
      for (let i = 0; i < n; i++) send(id + ':' + (i + 1) + '/' + n + '|' + s.slice(i * CH, (i + 1) * CH));
    } catch {}
  };
  addEventListener('pagehide', flush);
  holder.rrweb.record({
    emit(e) { e.wall = Date.now(); q.push(e); if (!timer) timer = setTimeout(flush, 100); },
    recordAfter: 'DOMContentLoaded',
    recordCanvas: true,
    sampling: { canvas: 6, scroll: 50, input: 'all', mousemove: false },
    collectFonts: true,
    inlineStylesheet: true,
    checkoutEveryNms: 10000,
    maskAllInputs: false,
    maskInputOptions: { password: true },
  });
})();`;

type Tab = { dir: string; session: CDPSession; refs: number; timer?: NodeJS.Timeout };
const tabs = new Map<string, Tab>();

// Keep the bytes of every image, font and stylesheet the live page actually
// loaded, so replays show exactly what was on screen without refetching.
const NET = join(OUT, "net");
const netSaved = new Set<string>();
async function captureNetwork(session: CDPSession) {
  mkdirSync(NET, { recursive: true });
  const pending = new Map<string, { url: string; type: string; mime: string }>();
  await session.send("Network.enable", { maxResourceBufferSize: 30e6, maxTotalBufferSize: 200e6 });
  session.on("Network.responseReceived", (e) => {
    if (["Image", "Font", "Stylesheet", "Media"].includes(e.type) && /^https?:/.test(e.response.url)) pending.set(e.requestId, { url: e.response.url, type: e.type, mime: e.response.mimeType });
  });
  session.on("Network.loadingFinished", async (e) => {
    const r = pending.get(e.requestId);
    pending.delete(e.requestId);
    if (!r || netSaved.has(r.url) || e.encodedDataLength > 15e6) return;
    netSaved.add(r.url);
    try {
      const body = await session.send("Network.getResponseBody", { requestId: e.requestId });
      const file = createHash("sha1").update(r.url).digest("hex").slice(0, 16);
      writeFileSync(join(NET, file), Buffer.from(body.body, body.base64Encoded ? "base64" : "utf8"));
      appendFileSync(join(OUT, "net.jsonl"), JSON.stringify({ url: r.url, file, mime: r.mime, type: r.type, t: Date.now() }) + "\n");
    } catch {
      netSaved.delete(r.url);
    }
  });
}

async function recordTab(target: Target, name: string, opts: { width: number; height: number; instrument: boolean; reference: boolean }) {
  const short = (target as unknown as { _targetId: string })._targetId.slice(0, 8);
  const dir = join(OUT, `${name}-${short}`);
  mkdirSync(join(dir, "ref"), { recursive: true });
  const session = await target.createCDPSession();
  const tab: Tab = { dir, session, refs: 0 };
  tabs.set(short, tab);
  // portrait layout; DPR stays native because sharpness now comes from the DOM replay
  const metrics = { width: opts.width, height: opts.height, deviceScaleFactor: 0, mobile: false };
  await session.send("Emulation.setDeviceMetricsOverride", metrics);
  // light scheme, so pages render the same live and in the (light-default) replay browser
  await session.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  await session.send("Runtime.enable");
  await session.send("Page.enable");
  await captureNetwork(session);
  await session.send("Runtime.addBinding", { name: "__promoRrweb" });
  const chunks = new Map<string, string[]>();
  session.on("Runtime.bindingCalled", (e) => {
    if (e.name === "__promoRec") appendFileSync(join(dir, "events.jsonl"), e.payload + "\n");
    if (e.name !== "__promoRrweb") return;
    const bar = e.payload.indexOf("|");
    const head = e.payload.slice(0, bar), body = e.payload.slice(bar + 1);
    let json = body;
    if (head !== "1/1") {
      const [cid, frac] = head.split(":");
      const [i, n] = frac.split("/").map(Number);
      const parts = chunks.get(cid) ?? [];
      parts[i - 1] = body;
      chunks.set(cid, parts);
      if (parts.filter((p) => p !== undefined).length < n) return;
      json = parts.join("");
      chunks.delete(cid);
    }
    for (const ev of JSON.parse(json)) appendFileSync(join(dir, "dom.jsonl"), JSON.stringify(ev) + "\n");
  });
  await session.send("Page.addScriptToEvaluateOnNewDocument", { source: DOM_RECORDER, runImmediately: true });
  if (opts.instrument) {
    await session.send("Runtime.addBinding", { name: "__promoRec", executionContextName: "promo-rec" });
    await session.send("Page.addScriptToEvaluateOnNewDocument", { source: INSTRUMENT, worldName: "promo-rec", runImmediately: true });
    session.on("Page.frameNavigated", (e) => {
      if (!e.frame.parentId) appendFileSync(join(dir, "events.jsonl"), JSON.stringify({ k: "nav", t: Date.now(), url: e.frame.url }) + "\n");
    });
  }
  // once a second: a pixel reference of the live tab (to check replays against) and a viewport watchdog
  if (opts.reference) {
    let busy = false;
    tab.timer = setInterval(async () => {
      if (busy) return;
      busy = true;
      try {
        const { result } = await session.send("Runtime.evaluate", { expression: "innerWidth + 'x' + innerHeight + ' ' + document.visibilityState" });
        const [size, vis] = String(result.value).split(" ");
        if (size !== `${opts.width}x${opts.height}`) {
          appendFileSync(join(dir, "events.jsonl"), JSON.stringify({ k: "viewport-reset", t: Date.now(), was: size }) + "\n");
          await session.send("Emulation.setDeviceMetricsOverride", metrics);
        }
        if (vis === "visible") {
          const t = Date.now();
          const shot = await session.send("Page.captureScreenshot", { format: "jpeg", quality: 70, optimizeForSpeed: true });
          writeFileSync(join(dir, "ref", `${t}.jpg`), Buffer.from(shot.data, "base64"));
          tab.refs++;
        }
      } catch {}
      busy = false;
    }, 1000);
  }
  say(`recording ${name} ${short} at ${opts.width}x${opts.height}`);
}

// ---- 3. the real side panel page, served as-is ----
function servePanel() {
  const types: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".woff": "font/woff", ".png": "image/png", ".json": "application/json" };
  const server = createServer((req, res) => {
    const p = join(EXT, decodeURIComponent((req.url ?? "/").split("?")[0]));
    if (!p.startsWith(EXT) || !existsSync(p)) return void res.writeHead(404).end();
    res.writeHead(200, { "Content-Type": types[extname(p)] ?? "application/octet-stream" }).end(readFileSync(p));
  });
  server.listen(PANEL_HTTP_PORT, "127.0.0.1");
  return server;
}

// ---- log the live side-panel stream too ----
async function tapEvents(stop: AbortSignal) {
  while (!stop.aborted) {
    try {
      const res = await fetch(`http://127.0.0.1:${WEB_MCP_PORT}/events`, { signal: stop });
      const reader = res.body!.getReader();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += new TextDecoder().decode(value);
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const p of parts) log("sse.jsonl", { raw: p });
      }
    } catch {
      await wait(500);
    }
  }
}

// ---- 4. the agent ----
function runAgent(): Promise<number> {
  // an empty folder outside the project, so the agent has nothing to read but the web
  const cwd = mkdtempSync(join(tmpdir(), `web-mcp-take-`));
  const mcp = join(OUT, "mcp.json");
  const launcher = join(process.cwd(), "capture", "web-mcp-launch.mjs");
  writeFileSync(mcp, JSON.stringify({ mcpServers: { "web-mcp": { type: "stdio", command: process.execPath, args: [launcher, PKG] } } }, null, 2));
  const args = ["-p", prompt!, "--mcp-config", mcp, "--strict-mcp-config", "--allowedTools", "mcp__web-mcp", "--disallowedTools", "Bash,Edit,Write,NotebookEdit,WebFetch,WebSearch,Task,Agent,Read,Grep,Glob", "--output-format", "stream-json", "--verbose"];
  if (model) args.push("--model", model);
  // ANTHROPIC_API_KEY removed so the run bills the logged-in Claude plan, not API credits
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== "ANTHROPIC_API_KEY" && !/^(CLAUDECODE|CLAUDE_CODE_|CLAUDE_AGENT_SDK|VSCODE_)/.test(k)));
  log("agent.jsonl", { start: true, prompt, args });
  return new Promise((resolve) => {
    const child = spawn(CLAUDE, args, { cwd, env, stdio: ["ignore", "pipe", "pipe"] });
    let partial = "";
    child.stdout.on("data", (d) => {
      const lines = (partial + d.toString()).split(/\r?\n/);
      partial = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        let msg: unknown = line;
        try { msg = JSON.parse(line); } catch {}
        log("agent.jsonl", { msg });
        const m = msg as { type?: string; message?: { content?: { type: string; name?: string; text?: string; input?: unknown }[] }; result?: string };
        for (const c of m.message?.content ?? []) {
          if (c.type === "tool_use") say(`tool ${c.name} ${JSON.stringify(c.input).slice(0, 140)}`);
          if (c.type === "text" && c.text) say(`says: ${c.text.slice(0, 200)}`);
        }
        if (m.type === "result") say(`result: ${String(m.result).slice(0, 300)}`);
      }
    });
    child.stderr.on("data", (d) => log("agent.jsonl", { stderr: d.toString() }));
    child.on("close", (code) => resolve(code ?? -1));
  });
}

async function main() {
  const started = Date.now();
  say(`launching web-mcp Chromium`);
  launchWebMcpChrome();
  await until(cdpUp(CDP_PORT), 30000, "Chromium CDP");
  const browser: Browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${CDP_PORT}`, defaultViewport: null });
  const pageOpts = { width: VW, height: VH, instrument: true, reference: true };
  const seen = new Set<string>();
  const onTarget = async (t: Target) => {
    const tid = (t as unknown as { _targetId: string })._targetId;
    if (t.type() !== "page" || seen.has(tid) || t.url().startsWith("chrome-extension://") || t.url().startsWith("devtools://")) return;
    seen.add(tid);
    await recordTab(t, "page", pageOpts).catch((e) => say(`tab attach failed: ${e.message}`));
  };
  browser.on("targetcreated", onTarget);
  for (const t of browser.targets()) await onTarget(t);

  say(`starting side panel capture`);
  const server = servePanel();
  const panelDir = mkdtempSync(join(tmpdir(), "web-mcp-panel-"));
  const panelChrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PANEL_CDP_PORT}`, `--user-data-dir=${panelDir}`, "--no-first-run", `--window-size=${PANEL_W},${VH}`, "about:blank"], { stdio: "ignore" });
  await until(cdpUp(PANEL_CDP_PORT), 30000, "panel Chromium");
  const panelBrowser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${PANEL_CDP_PORT}`, defaultViewport: null });
  const [panelPage] = await panelBrowser.pages();
  await recordTab(panelPage.target(), "panel", { width: PANEL_W, height: VH, instrument: false, reference: true });
  await panelPage.goto(`http://127.0.0.1:${PANEL_HTTP_PORT}/sidepanel.html`);

  const stopTap = new AbortController();
  void tapEvents(stopTap.signal);

  say(`agent: ${prompt}`);
  const code = await runAgent();
  say(`agent exited ${code}; holding 3s for the last frames`);
  await wait(3000);

  stopTap.abort();
  for (const tab of tabs.values()) clearInterval(tab.timer);
  await panelBrowser.close().catch(() => {});
  panelChrome.kill();
  server.close();
  await browser.disconnect();
  await wait(800);
  try { rmSync(panelDir, { recursive: true, force: true }); } catch {}

  const summary = {
    id, prompt, model: model ?? "default", viewport: { w: VW, h: VH }, panel: { w: PANEL_W, h: VH }, colorScheme: "light",
    started, ended: Date.now(), agentExit: code,
    tabs: [...tabs.entries()].map(([k, t]) => {
      const dom = join(t.dir, "dom.jsonl");
      return { id: k, dir: t.dir.slice(OUT.length + 1), domEvents: existsSync(dom) ? readFileSync(dom, "utf8").split("\n").filter(Boolean).length : 0, refs: t.refs };
    }),
    webMcpSessions: readdirSync(join(WEB_MCP_DIR, "recordings")).filter((d) => d >= `session-${new Date(started).toISOString().replace(/[:.]/g, "-")}`),
  };
  writeFileSync(join(OUT, "take.json"), JSON.stringify(summary, null, 2));
  say(`done: ${JSON.stringify(summary.tabs)}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

### capture/web-mcp-launch.mjs: Run the unmodified product with a pinned dependency

```js
// Runs the installed web-mcp unmodified, but from capture/cdm-pin, so the
// `npx chrome-devtools-mcp` it spawns resolves to 1.7.0 — the last version it
// works with. chrome-devtools-mcp 1.8.0 (Aug 2026) turned pageIdRouting on by
// default; web-mcp 0.1.6 never sends pageId, so on any install since then every
// page tool fails. This mirrors the upstream fix until a fixed web-mcp ships.
//   node web-mcp-launch.mjs <web-mcp package dir>
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const pkg = process.argv[2];
process.chdir(join(dirname(fileURLToPath(import.meta.url)), "cdm-pin"));
const bin = join(pkg, "bin", "web-mcp.js");
process.argv = [process.argv[0], bin, "mcp"];
await import(pathToFileURL(bin).href);
```

### capture/shoot.sh: Shoot takes sequentially, then freeze

```bash
#!/usr/bin/env bash
# capture/shoot.sh — shoot the film's takes one after another, then freeze each.
# Every take is a plain-English request to headless Claude Code driving web-mcp.
#   bash capture/shoot.sh [take-id ...]   (no args = all)
cd "$(dirname "$0")/.."

declare -A PROMPT=(
  [checkout-01]="Go to saucedemo.com and test the checkout like a customer would: log in as standard_user with the password secret_sauce, add the Sauce Labs Backpack to the cart, check out with any test name and postcode, and tell me whether the order goes through."
  [prices-01]="Go to books.toscrape.com and tell me the five cheapest books on the first page, with their prices."
  [stats-01]="How popular is the @amitnarw/web-mcp package? Check its weekly downloads on npmjs.com and its stars on its GitHub page."
  [status-01]="Check githubstatus.com and tell me whether all GitHub services are working normally right now."
  [form-01]="Go to https://www.selenium.dev/selenium/web/web-form.html, fill in the form with some sample data, and submit it."
)
ORDER=(checkout-01 prices-01 stats-01 form-01)
[ $# -gt 0 ] && ORDER=("$@")

for id in "${ORDER[@]}"; do
  if [ -d "takes/$id" ]; then echo "== $id exists, skipping"; continue; fi
  echo "== $id: ${PROMPT[$id]}"
  timeout 900 npx tsx capture/take.ts --id "$id" --prompt "${PROMPT[$id]}" 2>&1 | grep -E "result:|done:|Error|failed" | cut -c1-400
  npx tsx capture/freeze.ts "$id" 2>&1 | tail -2
done
echo "== all takes done"
```

### capture/freeze.ts: Freeze: assets, snapshot instances, timeline export

```ts
/**
 * capture/freeze.ts — make a take's DOM recordings self-contained.
 *
 *   npx tsx capture/freeze.ts <take-id>
 *
 * Points every asset reference in the recordings (img src/srcset, stylesheets
 * rrweb couldn't inline, url() targets in CSS, fonts) at the bytes the live
 * page actually loaded during the take (takes/<id>/net, saved by take.ts), as
 * `promo-asset://<file>`. The replay component swaps that scheme for the served
 * path. Nothing is refetched; anything the page never loaded stays remote.
 *
 * Output: public/takes/<id>/<tab>.json (sorted events), assets/, manifest.json
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const id = process.argv[2];
if (!id) throw new Error("usage: freeze.ts <take-id>");
const TAKE = join(process.cwd(), "takes", id);
const OUT = join(process.cwd(), "public", "takes", id);
const ASSETS = join(OUT, "assets");
mkdirSync(ASSETS, { recursive: true });

const EXT: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp", "image/avif": "avif", "image/svg+xml": "svg",
  "image/x-icon": "ico", "image/vnd.microsoft.icon": "ico", "text/css": "css", "font/woff2": "woff2", "font/woff": "woff",
  "font/ttf": "ttf", "font/otf": "otf", "application/font-woff2": "woff2", "application/font-woff": "woff", "application/x-font-woff": "woff",
};
const CSS_URL = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
const abs = (u: string, base: string) => { try { return new URL(u, base).href; } catch { return u; } };

// url -> served file name, from what the live page loaded
type Net = { url: string; file: string; mime: string; type: string };
const net: Net[] = existsSync(join(TAKE, "net.jsonl")) ? readFileSync(join(TAKE, "net.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
const local = new Map<string, string>();
for (const n of net) local.set(n.url, `${n.file}.${EXT[n.mime] ?? n.url.match(/\.([a-z0-9]{2,5})(?:[?#]|$)/i)?.[1]?.toLowerCase() ?? "bin"}`);
const used = new Set<string>();
const swap = (u: string, base: string) => {
  const name = local.get(abs(u, base));
  if (!name) return null;
  used.add(name);
  return `promo-asset://${name}`;
};
const swapCss = (css: string, base: string) => css.replace(CSS_URL, (whole, q, u) => { const s = swap(u, base); return s ? `url(${q}${s}${q})` : whole; });

// stylesheets fetched as files: their url()s are relative to the sheet itself
for (const n of net) {
  const name = local.get(n.url)!;
  const src = join(TAKE, "net", n.file);
  // inside a saved stylesheet, plain file names: its fonts and images sit beside it
  if (n.mime === "text/css") writeFileSync(join(ASSETS, name), swapCss(readFileSync(src, "utf8"), n.url).replaceAll("promo-asset://", ""));
  else copyFileSync(src, join(ASSETS, name));
}

type Node = { tagName?: string; attributes?: Record<string, unknown>; childNodes?: Node[]; textContent?: string; isStyle?: boolean };
const ASSET_ATTRS = ["src", "poster", "data-src", "xlink:href"];
const linkIsAsset = (n: Node) => n.tagName === "link" && /icon|stylesheet|preload|apple-touch/i.test(String(n.attributes?.rel ?? ""));
function rewriteNode(n: Node, page: string) {
  const a = n.attributes;
  if (a) {
    for (const k of ASSET_ATTRS) if (typeof a[k] === "string") a[k] = swap(a[k] as string, page) ?? a[k];
    if (typeof a.srcset === "string") {
      // keep only the candidates the page actually loaded, so the replay can't pick a missing one
      const have = a.srcset.split(",").map((s) => s.trim().split(/\s+/)).map(([u, ...d]) => [swap(u, page), ...d]).filter(([u]) => u);
      if (have.length) a.srcset = have.map((p) => p.join(" ")).join(", ");
    }
    if (linkIsAsset(n) && typeof a.href === "string" && typeof a._cssText !== "string") a.href = swap(a.href, page) ?? a.href;
    if (typeof a._cssText === "string") a._cssText = swapCss(a._cssText, page);
    if (typeof a.style === "string") a.style = swapCss(a.style, page);
  }
  if (n.isStyle && typeof n.textContent === "string") n.textContent = swapCss(n.textContent, page);
  for (const c of n.childNodes ?? []) rewriteNode(c, page);
}

type Ev = { type: number; timestamp: number; data: Record<string, any>; promoNew?: boolean };
const manifest: Record<string, unknown> = {};
for (const tab of readdirSync(TAKE).filter((d) => existsSync(join(TAKE, d, "dom.jsonl")))) {
  const events: Ev[] = readFileSync(join(TAKE, tab, "dom.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).sort((x: Ev, y: Ev) => x.timestamp - y.timestamp);
  // Mark full snapshots that start a new recorder (a real navigation) apart from rrweb's
  // periodic checkouts of the same page: node ids only carry over across checkouts, which
  // is what the replay needs to know when an element was really inserted.
  const navs = existsSync(join(TAKE, tab, "events.jsonl"))
    ? readFileSync(join(TAKE, tab, "events.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((e) => e.k === "nav").map((e) => e.t as number)
    : [];
  let lastFull = -Infinity;
  for (const e of events) {
    if (e.type !== 2) continue;
    e.promoNew = lastFull === -Infinity || navs.some((t) => t > lastFull && t <= e.timestamp);
    lastFull = e.timestamp;
  }
  let page = "about:blank";
  for (const e of events) {
    if (e.type === 4) page = e.data.href;
    if (e.type === 2) rewriteNode(e.data.node, page);
    if (e.type === 3 && e.data.source === 0) {
      for (const add of e.data.adds ?? []) rewriteNode(add.node, page);
      for (const at of e.data.attributes ?? []) rewriteNode({ attributes: at.attributes }, page);
    }
    if (e.type === 3 && e.data.source === 8) for (const r of e.data.adds ?? []) if (typeof r.rule === "string") r.rule = swapCss(r.rule, page);
  }
  writeFileSync(join(OUT, `${tab}.json`), JSON.stringify(events));
  const pages = events.filter((e) => e.type === 4).map((e) => ({ t: e.timestamp, href: e.data.href, w: e.data.width, h: e.data.height }));
  manifest[tab] = { events: events.length, start: events[0]?.timestamp, end: events.at(-1)?.timestamp, pages };
  console.log(`${tab}: ${events.length} events, ${pages.map((p) => p.href).join(" → ")}`);
}
writeFileSync(join(OUT, "manifest.json"), JSON.stringify({ id, tabs: manifest, assetsLoaded: net.length, assetsReferenced: used.size }, null, 2));
console.log(`assets: ${net.length} loaded live, ${used.size} referenced by the recordings`);

// ---- timeline for the edit (imported by compositions): when pages appeared, what the
// agent did and said, where the page was touched, what the side panel showed ----
const jsonl = (f: string) => (existsSync(f) ? readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : []);
const take = JSON.parse(readFileSync(join(TAKE, "take.json"), "utf8"));
const timeline = {
  id, prompt: take.prompt, viewport: take.viewport, panel: take.panel,
  tabs: Object.fromEntries(Object.entries(manifest).map(([tab, m]) => {
    const events: Ev[] = JSON.parse(readFileSync(join(OUT, `${tab}.json`), "utf8"));
    // a page is on screen from its full snapshot, not its meta event (the old page stays until then)
    const pages = events.flatMap((e, i) => (e.type === 4 ? [{ href: e.data.href as string, shown: events.slice(i).find((x) => x.type === 2)?.timestamp ?? e.timestamp }] : []))
      .filter((p, i, all) => i === 0 || p.href !== all[i - 1].href);
    return [tab, { start: (m as { start: number }).start, pages }];
  })),
  touches: readdirSync(TAKE).filter((d) => existsSync(join(TAKE, d, "events.jsonl"))).flatMap((tab) =>
    jsonl(join(TAKE, tab, "events.jsonl")).filter((e) => e.k !== "ctx" && e.k !== "vis" && !(e.url ?? "").startsWith("about:")).map((e) => ({ tab, ...e }))),
  tools: jsonl(join(TAKE, "agent.jsonl")).flatMap((a) => (a.msg?.message?.content ?? []).filter((c: any) => c.type === "tool_use").map((c: any) => ({ t: a.t, name: String(c.name).replace("mcp__web-mcp__", ""), input: c.input }))),
  says: jsonl(join(TAKE, "agent.jsonl")).flatMap((a) => (a.msg?.type === "assistant" ? (a.msg.message?.content ?? []).filter((c: any) => c.type === "text").map((c: any) => ({ t: a.t, text: c.text })) : [])),
  result: jsonl(join(TAKE, "agent.jsonl")).filter((a) => a.msg?.type === "result").map((a) => ({ t: a.t, text: a.msg.result }))[0] ?? null,
  sidebar: jsonl(join(TAKE, "sse.jsonl")).flatMap((s) => {
    const data = String(s.raw).split("\n").find((l: string) => l.startsWith("data: "));
    try { const st = JSON.parse(data!.slice(6)); return [{ t: s.t, active: st.active, task: st.taskName, last: st.actions?.at(-1)?.text ?? null, count: st.actions?.length ?? 0 }]; } catch { return []; }
  }).filter((s, i, all) => i === 0 || s.last !== all[i - 1].last || s.active !== all[i - 1].active),
};
mkdirSync(join(process.cwd(), "src", "takes"), { recursive: true });
writeFileSync(join(process.cwd(), "src", "takes", `${id}.json`), JSON.stringify(timeline, null, 1));
console.log(`timeline: ${timeline.touches.length} touches, ${timeline.tools.length} tool calls, ${timeline.sidebar.length} side-panel states → src/takes/${id}.json`);
```

### capture/terminal.ts: Record real CLI output with timing

```ts
/**
 * capture/terminal.ts — record the real install and CLI output, with timing,
 * so the film's terminal shows exactly what a user sees (re-typeset sharp).
 *
 *   npx tsx capture/terminal.ts <take-id>
 * Output: takes/<id>/term.jsonl and src/takes/<id>.json
 */
import { spawn } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const id = process.argv[2] ?? "terminal-01";
const OUT = join(process.cwd(), "takes", id);
mkdirSync(OUT, { recursive: true });
const COMMANDS = ["npm install -g @amitnarw/web-mcp", "web-mcp --version", "web-mcp help"];

type Chunk = { t: number; cmd: string; stream: "out" | "err" | "start" | "exit"; text: string };
const chunks: Chunk[] = [];
const run = (cmd: string) =>
  new Promise<void>((resolve) => {
    chunks.push({ t: Date.now(), cmd, stream: "start", text: cmd });
    const child = spawn(cmd, { shell: true, env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" } });
    child.stdout.on("data", (d) => chunks.push({ t: Date.now(), cmd, stream: "out", text: d.toString() }));
    child.stderr.on("data", (d) => chunks.push({ t: Date.now(), cmd, stream: "err", text: d.toString() }));
    child.on("close", (code) => { chunks.push({ t: Date.now(), cmd, stream: "exit", text: String(code) }); resolve(); });
  });

for (const c of COMMANDS) {
  console.log(`$ ${c}`);
  await run(c);
}
writeFileSync(join(OUT, "term.jsonl"), chunks.map((c) => JSON.stringify(c)).join("\n") + "\n");
// strip ANSI for the timeline the film imports
const plain = chunks.map((c) => ({ ...c, text: c.text.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "") }));
mkdirSync(join(process.cwd(), "src", "takes"), { recursive: true });
writeFileSync(join(process.cwd(), "src", "takes", `${id}.json`), JSON.stringify({ id, start: chunks[0].t, chunks: plain }, null, 1));
for (const c of plain) if (c.stream === "out" || c.stream === "err") process.stdout.write(c.text);
```

### capture/replay-check.ts: Replay vs pixel-reference pairs

```ts
/**
 * capture/replay-check.ts — replay a tab's DOM recording at high DPR at the
 * moments its 1 fps pixel references were taken, and write side-by-side pairs
 * (live reference | replay) so fidelity can be judged by eye.
 *
 *   npx tsx capture/replay-check.ts takes/<id>/<tab-dir> [count=6] [dpr=2.5]
 */
import { spawn } from "child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs";
import { createServer } from "http";
import { homedir, tmpdir } from "os";
import { join, resolve } from "path";
import puppeteer from "puppeteer-core";

const CHROME = join(homedir(), ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe");
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const tabDir = resolve(process.argv[2]);
const count = Number(process.argv[3] ?? 6);
const dpr = Number(process.argv[4] ?? 2.5);

const events = readFileSync(join(tabDir, "dom.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).sort((a, b) => a.timestamp - b.timestamp);
const t0 = events[0].timestamp;
const meta = events.find((e) => e.type === 4).data as { width: number; height: number };
// only moments after the tab reached a real page (before that the agent is still starting up)
const firstReal = events.find((e) => e.type === 4 && /^https?:/.test(e.data.href))?.timestamp ?? t0;
const refs = readdirSync(join(tabDir, "ref")).map((f) => Number(f.replace(".jpg", ""))).filter((t) => t >= firstReal).sort((a, b) => a - b);
const picks = Array.from({ length: Math.min(count, refs.length) }, (_, i) => refs[Math.floor(((i + 0.5) * refs.length) / Math.min(count, refs.length))]);

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/rrweb.css">
<style>html,body{margin:0;background:#000} #root{width:${meta.width}px;height:${meta.height}px;overflow:hidden;position:relative}
.replayer-wrapper{transform:none!important} .replayer-mouse,.replayer-mouse-tail{display:none!important}</style>
</head><body><div id="root"></div><script src="/rrweb.js"></script><script>
fetch('/events.json').then(r => r.json()).then(events => {
  const replayer = new rrweb.Replayer(events, { root: document.getElementById('root'), skipInactive: false, showWarning: false, mouseTail: false, UNSAFE_replayCanvas: true, triggerFocus: false });
  // when each replayed node last appeared or changed (wall ms), rebuilt on every pause(t)
  let changed = new WeakMap(), snapAt = 0;
  replayer.on('event-cast', (e) => {
    const mirror = replayer.getMirror();
    if (e.type === 2) { changed = new WeakMap(); snapAt = e.timestamp; }
    if (e.type === 3 && e.data.source === 0) {
      for (const a of e.data.adds) { const n = mirror.getNode(a.node.id); if (n) changed.set(n, e.timestamp); }
      for (const a of e.data.attributes) { const n = mirror.getNode(a.id); if (n) changed.set(n, e.timestamp); }
    }
  });
  // show the frame at wall-clock time t exactly: DOM state from rrweb, CSS animations seeked by hand
  window.showAt = (t) => {
    replayer.pause(t - events[0].timestamp);
    const doc = replayer.iframe.contentDocument;
    doc.documentElement.classList.remove('rrweb-paused');
    if (!doc.getElementById('promo-scrollbar')) {
      const s = doc.createElement('style'); s.id = 'promo-scrollbar';
      // headless hides native scrollbars; a styled one takes layout width like the live window's
      s.textContent = '::-webkit-scrollbar{width:15px;height:15px}::-webkit-scrollbar-track{background:#f1f1f1}::-webkit-scrollbar-thumb{background:#c1c1c1;border:3px solid #f1f1f1;border-radius:8px}';
      doc.head.appendChild(s);
    }
    for (const anim of doc.getAnimations()) {
      let el = anim.effect && anim.effect.target, start = snapAt;
      for (; el; el = el.parentNode) { const c = changed.get(el); if (c !== undefined && c > start) start = c; }
      anim.pause();
      anim.currentTime = Math.max(0, t - start);
    }
    return doc.getAnimations().length;
  };
  window.ready = true;
});
</script></body></html>`;
const files: Record<string, [string, string | Buffer]> = {
  "/": ["text/html", html],
  "/rrweb.js": ["text/javascript", readFileSync("node_modules/rrweb/dist/rrweb.umd.min.cjs")],
  "/rrweb.css": ["text/css", readFileSync("node_modules/rrweb/dist/style.min.css")],
  "/events.json": ["application/json", JSON.stringify(events)],
};
const server = createServer((req, res) => {
  const f = files[(req.url ?? "/").split("?")[0]];
  if (!f) return void res.writeHead(404).end();
  res.writeHead(200, { "Content-Type": f[0] }).end(f[1]);
}).listen(3092, "127.0.0.1");

const dir = mkdtempSync(join(tmpdir(), "replay-"));
const proc = spawn(CHROME, ["--headless=new", "--remote-debugging-port=9560", `--user-data-dir=${dir}`, "--no-first-run", `--force-device-scale-factor=${dpr}`, `--window-size=${meta.width},${meta.height}`, "about:blank"], { stdio: "ignore" });
for (let i = 0; i < 60; i++) { if (await fetch("http://127.0.0.1:9560/json/version").then((r) => r.ok).catch(() => false)) break; await wait(250); }
const browser = await puppeteer.connect({ browserURL: "http://127.0.0.1:9560", defaultViewport: null, protocolTimeout: 60000 });
const [page] = await browser.pages();
await page.setViewport({ width: meta.width, height: meta.height, deviceScaleFactor: dpr });
await page.goto("http://127.0.0.1:3092/");
await page.waitForFunction("window.ready === true");

const out = join(tabDir, "replay-check");
mkdirSync(out, { recursive: true });
for (const t of picks) {
  const anims = await page.evaluate((at) => (window as unknown as { showAt(t: number): number }).showAt(at), t);
  // let images, fonts and stylesheets inside the replay iframe settle
  await page.evaluate(async () => {
    const doc = (document.querySelector("iframe") as HTMLIFrameElement).contentDocument!;
    await doc.fonts.ready;
    await Promise.all([...doc.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 4000); })));
  });
  await wait(400);
  const shot = await page.screenshot({ type: "jpeg", quality: 90, clip: { x: 0, y: 0, width: meta.width, height: meta.height } });
  writeFileSync(join(out, `${t}-replay.jpg`), shot);
  // side-by-side page: live reference (left) | replay (right), both scaled to the same height
  const ref = readFileSync(join(tabDir, "ref", `${t}.jpg`)).toString("base64");
  const pair = await browser.newPage();
  await pair.setViewport({ width: 1800, height: 1200, deviceScaleFactor: 1 });
  await pair.setContent(`<body style="margin:0;background:#222;display:flex;gap:16px;padding:8px">
    <figure style="margin:0;color:#fff;font:14px sans-serif"><img src="data:image/jpeg;base64,${ref}" style="height:1150px"><figcaption>live reference</figcaption></figure>
    <figure style="margin:0;color:#fff;font:14px sans-serif"><img src="data:image/jpeg;base64,${Buffer.from(shot).toString("base64")}" style="height:1150px"><figcaption>DOM replay @${dpr}x</figcaption></figure></body>`);
  await wait(300);
  writeFileSync(join(out, `${t}-pair.jpg`), await pair.screenshot({ type: "jpeg", quality: 80 }));
  await pair.close();
  console.log(`t+${((t - t0) / 1000).toFixed(1)}s → ${t}-pair.jpg (${anims} animations seeked)`);
}
await browser.disconnect(); proc.kill(); server.close(); await wait(500);
try { rmSync(dir, { recursive: true, force: true }); } catch {}
process.exit(0);
```

### src/replay/DomReplay.tsx: Replay renderer (animation seeking, transition replay, overlay-only mode)

```tsx
/**
 * DomReplay — shows a tab recorded by capture/take.ts exactly as it was at a
 * given wall-clock moment. The DOM state comes from rrweb; CSS animations
 * (web-mcp's pill, glow, tooltips) are seeked by hand to where they were at
 * that moment, so every rendered frame is deterministic. Because it is real
 * DOM, a camera can scale it as far as it likes and text stays sharp.
 *
 * only: a CSS selector; when set, everything else is hidden and the page is
 * transparent (e.g. just web-mcp's pill and tooltip, floating).
 */
import { useEffect, useRef, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { Replayer } from "rrweb";

type Handle = { showAt: (wall: number) => Promise<void> };
type Ev = { type: number; timestamp: number; data: any; promoNew?: boolean };

// the take's frozen events, cached per tab so a render tab parses them once
const cache = new Map<string, Promise<{ events: Ev[] }>>();
function loadTab(take: string, tab: string) {
  const key = `${take}/${tab}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(staticFile(`takes/${take}/${tab}.json`))
        .then((r) => r.text())
        // asset URLs must be absolute: the replay document carries the original page's <base>
        .then((text) => ({ events: JSON.parse(text.replaceAll("promo-asset://", `${window.location.origin}${staticFile(`takes/${take}/assets/`)}`)) })),
    );
  }
  return cache.get(key)!;
}

/**
 * When each node was inserted, per recorder instance. rrweb's periodic checkouts
 * re-snapshot the same nodes with the same ids, which must not count as new
 * insertions (that would restart web-mcp's entrance animations every 10 s).
 */
function insertionTimes(events: Ev[]) {
  const starts: number[] = [];
  const added = new Map<string, number[]>();
  const push = (inst: number, id: number, t: number, onlyIfNew: boolean) => {
    const k = `${inst}:${id}`;
    const list = added.get(k);
    if (list) { if (!onlyIfNew) list.push(t); } else added.set(k, [t]);
  };
  const walk = (inst: number, n: any, t: number, onlyIfNew: boolean) => {
    if (!n) return;
    if (typeof n.id === "number") push(inst, n.id, t, onlyIfNew);
    for (const c of n.childNodes ?? []) walk(inst, c, t, onlyIfNew);
  };
  for (const e of events) {
    if (e.type === 2) {
      if (e.promoNew || starts.length === 0) starts.push(e.timestamp);
      walk(starts.length - 1, e.data.node, e.timestamp, true);
    } else if (e.type === 3 && e.data.source === 0 && starts.length) {
      for (const a of e.data.adds ?? []) walk(starts.length - 1, a.node, e.timestamp, false);
    }
  }
  const instanceAt = (wall: number) => Math.max(0, starts.filter((s) => s <= wall).length - 1);
  const bornAt = (inst: number, id: number, wall: number) => {
    const list = added.get(`${inst}:${id}`);
    if (!list) return undefined;
    let best: number | undefined;
    for (const t of list) if (t <= wall && (best === undefined || t > best)) best = t;
    return best;
  };
  return { instanceAt, bornAt, startOf: (inst: number) => starts[inst] ?? events[0].timestamp };
}

/**
 * Class and inline-style history per node, so the replay can run the page's own
 * CSS transitions (a rebuilt DOM has none): web-mcp fades its status text out,
 * swaps it and fades it back in, and slides its tooltip in, all with transitions.
 */
type Change = { t: number; key: string; kind: "class" | "style"; prop: string; v: string | null };
function attributeHistory(events: Ev[]) {
  const starts: number[] = [];
  const hist = new Map<string, { t: number; v: string | null }[]>(); // `${inst}:${id}|class` or `${inst}:${id}|style:${prop}`
  const changes: Change[] = [];
  const parseStyle = (s: string) => Object.fromEntries(s.split(";").map((d) => d.split(":")).filter((p) => p.length >= 2).map(([k, ...v]) => [k.trim(), v.join(":").trim()]));
  const record = (inst: number, id: number, t: number, kind: "class" | "style", prop: string, v: string | null, initial: boolean) => {
    const key = `${inst}:${id}|${kind === "class" ? "class" : `style:${prop}`}`;
    const list = hist.get(key);
    if (initial && list) return;
    if (list) list.push({ t, v }); else hist.set(key, [{ t, v }]);
    if (!initial) changes.push({ t, key: `${inst}:${id}`, kind, prop, v });
  };
  const initialAttrs = (inst: number, n: any, t: number, onlyIfNew: boolean) => {
    if (!n) return;
    if (typeof n.id === "number" && n.attributes) {
      record(inst, n.id, t, "class", "", n.attributes.class ?? null, onlyIfNew);
      if (typeof n.attributes.style === "string") for (const [k, v] of Object.entries(parseStyle(n.attributes.style))) record(inst, n.id, t, "style", k, v as string, onlyIfNew);
    }
    for (const c of n.childNodes ?? []) initialAttrs(inst, c, t, onlyIfNew);
  };
  for (const e of events) {
    if (e.type === 2) {
      if (e.promoNew || starts.length === 0) starts.push(e.timestamp);
      initialAttrs(starts.length - 1, e.data.node, e.timestamp, true);
    } else if (e.type === 3 && e.data.source === 0 && starts.length) {
      const inst = starts.length - 1;
      for (const a of e.data.adds ?? []) initialAttrs(inst, a.node, e.timestamp, true);
      for (const a of e.data.attributes ?? []) {
        const at = a.attributes ?? {};
        if ("class" in at) record(inst, a.id, e.timestamp, "class", "", at.class ?? null, false);
        if (typeof at.style === "string") for (const [k, v] of Object.entries(parseStyle(at.style))) record(inst, a.id, e.timestamp, "style", k, v as string, false);
        else if (at.style && typeof at.style === "object") for (const [k, v] of Object.entries(at.style)) record(inst, a.id, e.timestamp, "style", k, v === false ? null : Array.isArray(v) ? v[0] : (v as string), false);
      }
    }
  }
  changes.sort((x, y) => x.t - y.t);
  /** the latest change per node attribute in (wall - span, wall], with the value before it */
  const recent = (inst: number, wall: number, span: number) => {
    const latest = new Map<string, Change>();
    for (const c of changes) {
      if (c.t > wall) break;
      if (c.t > wall - span && c.key.startsWith(`${inst}:`)) latest.set(`${c.key}|${c.kind}|${c.prop}`, c);
    }
    return [...latest.values()].map((c) => {
      const list = hist.get(`${c.key}|${c.kind === "class" ? "class" : `style:${c.prop}`}`) ?? [];
      const before = list.filter((h) => h.t < c.t).at(-1);
      return { ...c, id: Number(c.key.split(":")[1]), prev: before ? before.v : null };
    });
  };
  return { recent };
}

function settle(doc: Document) {
  const images = [...doc.images].filter((i) => !i.complete);
  return Promise.race([
    Promise.all([doc.fonts.ready, ...images.map((i) => new Promise((r) => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); }))]),
    new Promise((r) => setTimeout(r, 4000)),
  ]);
}

function makeHandle(root: HTMLDivElement, events: Ev[], only?: string): Handle {
  const replayer = new Replayer(events as any, { root, skipInactive: false, showWarning: false, showDebug: false, mouseTail: false, UNSAFE_replayCanvas: true, triggerFocus: false });
  // rrweb's iframe can't scroll; the live window had a scrollbar taking 15px of layout
  replayer.iframe.setAttribute("scrolling", "yes");
  if (only) replayer.iframe.setAttribute("allowtransparency", "true");
  const born = insertionTimes(events);
  const attrs = attributeHistory(events);
  const start = events[0].timestamp;
  return {
    async showAt(wall: number) {
      replayer.pause(Math.max(0, wall - start));
      const doc = replayer.iframe.contentDocument!;
      doc.documentElement.classList.remove("rrweb-paused");
      if (only) {
        const s = doc.createElement("style");
        s.textContent = `:root{color-scheme:normal!important}html,body{background:transparent!important}
          body *{visibility:hidden!important} ${only.split(",").map((x) => `${x.trim()},${x.trim()} *`).join(",")}{visibility:visible!important}
          ::-webkit-scrollbar{width:15px;background:transparent}::-webkit-scrollbar-thumb{background:transparent}`;
        doc.head.appendChild(s);
      }
      const mirror = replayer.getMirror();
      const inst = born.instanceAt(wall);
      // run the page's own CSS transitions for what changed in the last moment: put each
      // changed class/style back to its previous value, let the browser compute that style,
      // then restore it so the browser starts the real transition, seeked below
      const changedAt = new Map<Node, number>();
      const restore: (() => void)[] = [];
      for (const c of attrs.recent(inst, wall, 800)) {
        const el = mirror.getNode(c.id) as HTMLElement | null;
        if (!el || el.nodeType !== 1 || !el.style) continue;
        if (c.kind === "class") {
          const cur = el.getAttribute("class");
          restore.push(() => (cur === null ? el.removeAttribute("class") : el.setAttribute("class", cur)));
          if (c.prev === null) el.removeAttribute("class"); else el.setAttribute("class", c.prev);
        } else {
          const cur = el.style.getPropertyValue(c.prop), pri = el.style.getPropertyPriority(c.prop);
          restore.push(() => (cur ? el.style.setProperty(c.prop, cur, pri) : el.style.removeProperty(c.prop)));
          if (c.prev === null) el.style.removeProperty(c.prop); else el.style.setProperty(c.prop, c.prev);
        }
        changedAt.set(el, Math.max(changedAt.get(el) ?? 0, c.t));
      }
      if (restore.length) {
        doc.defaultView!.getComputedStyle(doc.documentElement).opacity; // flush the "before" style
        for (const r of restore) r();
      }
      for (const anim of doc.getAnimations()) {
        const target = (anim.effect as KeyframeEffect | null)?.target as Node | null;
        if ("transitionProperty" in anim) {
          // a transition we just started: seek it to (wall - when its element, or an ancestor, changed)
          let at: number | undefined;
          for (let n = target; n && at === undefined; n = n.parentNode) at = changedAt.get(n);
          anim.pause();
          anim.currentTime = at === undefined ? 1e6 : Math.max(0, wall - at);
          continue;
        }
        // seek each CSS animation to (wall - when its element, or an ancestor, was really inserted)
        let at = born.startOf(inst);
        for (let n = (anim.effect as KeyframeEffect | null)?.target as Node | null; n; n = n.parentNode) {
          const b = born.bornAt(inst, mirror.getId(n), wall);
          if (b !== undefined && b > at) at = b;
        }
        anim.pause();
        anim.currentTime = Math.max(0, wall - at);
      }
      await settle(doc);
    },
  };
}

export const DomReplay: React.FC<{ take: string; tab: string; wall: number; width: number; height: number; only?: string }> = ({ take, tab, wall, width, height, only }) => {
  const root = useRef<HTMLDivElement>(null);
  const [handle, setHandle] = useState<Handle | null>(null);
  const [loading] = useState(() => delayRender(`replay ${take}/${tab}`));

  useEffect(() => {
    let alive = true;
    loadTab(take, tab)
      .then(({ events }) => {
        if (!alive || !root.current) return;
        setHandle(makeHandle(root.current, events, only));
        continueRender(loading);
      })
      .catch((e) => cancelRender(e));
    return () => { alive = false; };
  }, [take, tab, loading, only]);

  useEffect(() => {
    if (!handle) return;
    const frame = delayRender(`replay ${take}/${tab} @${wall}`);
    handle.showAt(wall).then(() => continueRender(frame)).catch((e) => cancelRender(e));
  }, [handle, wall, take, tab]);

  return (
    <div ref={root} className="dom-replay" style={{ width, height, position: "relative", overflow: "hidden", background: only ? "transparent" : "#fff" }}>
      {/* rrweb draws its own pointer and wrapper chrome; the product's own click markers are what we show */}
      <style>{`.dom-replay .replayer-mouse,.dom-replay .replayer-mouse-tail{display:none!important}.dom-replay .replayer-wrapper{position:relative}.dom-replay iframe{border:0;display:block;background:transparent}`}</style>
    </div>
  );
};
```

### src/film/grid.ts: Tempo grid, keyframes, time maps

```ts
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
```

### src/film/ReplayWindow.tsx: Camera window, REAL RUN clock, lens, hold-through-skips

```tsx
/**
 * ReplayWindow — a card on screen showing a real take through a moving camera.
 *
 * time: [[frame, takeSeconds], ...] — which moment of the take each frame shows
 *       (real time while it acts, skips while the agent thinks)
 * cams: page point at the window centre (x, y) and screen px per page px (s)
 * wins: the card's screen rect over time (x, y = centre)
 * The REAL RUN clock shows the take's true elapsed time, so skips stay visible.
 */
import type { CSSProperties } from "react";
import { DomReplay } from "../replay/DomReplay";
import { keyed, remap } from "./grid";

export type TakeTimeline = { id: string; prompt: string; viewport: { w: number; h: number }; tabs: Record<string, { start: number; pages: { href: string; shown: number }[] }> };
export type Cam = { f: number; x: number; y: number; s: number };
export type Win = { f: number; x: number; y: number; w: number; h: number; o: number };

/** is the step from frame f to f+1 a fast-forward (more than 3x real time)? */
const fastStep = (time: [number, number][], f: number) => Math.abs(remap(time, f + 1) - remap(time, f)) * 30 > 3;

/**
 * Take seconds to show at frame f, holding through skips: while the edit
 * fast-forwards, keep the state from just before the skip and change once at
 * its end, the way the pill on a real page simply updates its text.
 */
function heldSeconds(time: [number, number][], f: number) {
  if (!fastStep(time, f)) return remap(time, f);
  let g = f;
  while (g > f - 240 && fastStep(time, g - 1)) g--;
  return remap(time, g);
}

export const ReplayWindow: React.FC<{
  take: TakeTimeline; tab: string; frame: number; time: [number, number][]; cams: Cam[]; wins: Win[];
  clock?: boolean; url?: boolean; radius?: number; style?: CSSProperties; requestAt?: number;
  /** show only these elements, floating (no page, no card): web-mcp's own pill and tooltip */
  only?: string;
  /** hold the last state through fast-forwards instead of racing through quick real changes */
  holdSkips?: boolean;
}> = ({ take, tab, frame, time, cams, wins, clock = true, url = false, radius = 30, style, requestAt, only, holdSkips = false }) => {
  const t0 = take.tabs[tab].start;
  const takeS = holdSkips ? heldSeconds(time, frame) : remap(time, frame);
  const wall = t0 + takeS * 1000;
  const cam = keyed(cams, frame);
  const win = keyed(wins, frame);
  if (win.o <= 0.001) return null;
  if (only) {
    return (
      <div style={{ position: "absolute", left: win.x - win.w / 2, top: win.y - win.h / 2, width: win.w, height: win.h, opacity: win.o, overflow: "hidden", filter: "drop-shadow(0 18px 36px rgba(0,0,0,0.55)) drop-shadow(0 0 28px rgba(0,122,255,0.25))", ...style }}>
        <div style={{ position: "absolute", left: win.w / 2 - cam.x * cam.s, top: win.h / 2 - cam.y * cam.s, transformOrigin: "0 0", transform: `scale(${cam.s})` }}>
          <DomReplay take={take.id} tab={tab} wall={wall} width={take.viewport.w} height={take.viewport.h} only={only} />
        </div>
      </div>
    );
  }
  const page = [...take.tabs[tab].pages].reverse().find((p) => p.shown <= wall);
  const host = page && /^https?:/.test(page.href) ? new URL(page.href).hostname.replace(/^www\./, "") : "";
  // elapsed since the request was sent (agent start), in the real run
  const since = Math.max(0, (wall - (requestAt ?? t0)) / 1000);
  const mm = String(Math.floor(since / 60)).padStart(2, "0");
  const ss = String(Math.floor(since % 60)).padStart(2, "0");
  return (
    <div style={{ position: "absolute", left: win.x - win.w / 2, top: win.y - win.h / 2, width: win.w, height: win.h, opacity: win.o, borderRadius: radius, overflow: "hidden", background: "#fff", boxShadow: "0 0 0 1px rgba(173,198,255,0.12), 0 50px 120px rgba(0,0,0,0.6)", ...style }}>
      <div style={{ position: "absolute", left: win.w / 2 - cam.x * cam.s, top: win.h / 2 - cam.y * cam.s, transformOrigin: "0 0", transform: `scale(${cam.s})` }}>
        <DomReplay take={take.id} tab={tab} wall={wall} width={take.viewport.w} height={take.viewport.h} />
      </div>
      {(clock || url) && (
        <div style={{ position: "absolute", left: 18, top: 16, right: 18, display: "flex", gap: 10, alignItems: "center", fontFamily: "Geist Mono", fontSize: 22, letterSpacing: "0.02em" }}>
          {clock && (
            <span style={{ background: "rgba(19,19,21,0.82)", color: "#adc6ff", padding: "7px 13px", borderRadius: 999, display: "flex", gap: 9, alignItems: "center" }}>
              <span style={{ width: 9, height: 9, borderRadius: 5, background: "#00a2ff", boxShadow: "0 0 10px #00a2ff" }} />
              REAL RUN · {mm}:{ss}
            </span>
          )}
          {url && host && <span style={{ background: "rgba(19,19,21,0.82)", color: "#e6ecff", padding: "7px 13px", borderRadius: 999 }}>{host}</span>}
        </div>
      )}
    </div>
  );
};
```

### src/film/track.ts: Touch to screen mapping

```ts
/**
 * track — where things happen on screen, so the host can look at them.
 * touchTarget maps a take's logged touches (focus/click/typing) through a
 * ReplayWindow's camera to screen coordinates at any frame.
 */
import { keyed, remap } from "./grid";
import type { Cam, TakeTimeline, Win } from "./ReplayWindow";

type Touch = { tab: string; k: string; t: number; r?: number[] | null };

export function toScreen(cams: Cam[], wins: Win[], f: number, px: number, py: number) {
  const c = keyed(cams, f), w = keyed(wins, f);
  return { x: w.x + (px - c.x) * c.s, y: w.y + (py - c.y) * c.s };
}

/** screen point of the most recent touch at frame f (null before the first one) */
export function touchTarget(take: TakeTimeline & { touches: Touch[] }, tab: string, time: [number, number][], cams: Cam[], wins: Win[]) {
  const t0 = take.tabs[tab].start;
  const touches = take.touches.filter((e) => e.tab === tab && e.r && ["focus", "click", "input", "down"].includes(e.k)).sort((a, b) => a.t - b.t);
  return (f: number) => {
    const wall = t0 + remap(time, f) * 1000;
    const last = [...touches].reverse().find((e) => e.t <= wall);
    if (!last || !last.r) return null;
    const [x, y, w, h] = last.r;
    return toScreen(cams, wins, f, x + Math.min(w, 220) / 2, y + h / 2);
  };
}
```

### src/film/Host.tsx: Mascot presenter: gaze, blinks, wake, wink, speaking

```tsx
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
```

### src/mascot/Orb.tsx: Mascot in 3D (shader gloss)

```tsx
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
```

### src/film/Line.tsx: Word-by-word captions and labels

```tsx
/**
 * Line — a caption the orb "says": words rise in one by one (they are also the
 * subtitles when the feed is muted), accent words in #adc6ff, then the line
 * eases out. Timing is in composition frames; a voice added later is fitted to
 * these slots.
 */
import { interpolate, useCurrentFrame } from "remotion";
import { out } from "./grid";

export const Line: React.FC<{
  text: string; from: number; to: number; accent?: string[]; y: number; size?: number; stagger?: number; align?: "center" | "left"; x?: number; width?: number; weight?: number;
}> = ({ text, from, to, accent = [], y, size = 84, stagger = 3, align = "center", x = 70, width = 940, weight = 600 }) => {
  const f = useCurrentFrame();
  if (f < from - 1 || f > to + 12) return null;
  const words = text.split(" ");
  const exit = interpolate(f, [to, to + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: y, left: x, width, textAlign: align, fontFamily: "Geist Sans", fontWeight: weight, fontSize: size, lineHeight: 1.06, letterSpacing: "-0.04em", color: "#fff", opacity: exit }}>
      {words.map((w, i) => {
        const p = interpolate(f, [from + i * stagger, from + i * stagger + 14], [0, 1], { easing: out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const clean = w.replace(/[.,!?]/g, "").toLowerCase();
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", opacity: p, transform: `translateY(${(1 - p) * 0.32 * size}px)`, filter: `blur(${(1 - p) * 8}px)`, color: accent.includes(clean) ? "#adc6ff" : undefined }}>
            {w}{i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
};

/** small label above a beat: "01  Look things up" */
export const Label: React.FC<{ n: string; text: string; from: number; to: number; y: number }> = ({ n, text, from, to, y }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [from, from + 16], [0, 1], { easing: out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const e = interpolate(f, [to, to + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (f < from || f > to + 10) return null;
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: p * e, transform: `translateY(${(1 - p) * 14}px)` }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "12px 24px", borderRadius: 999, background: "rgba(173,198,255,0.08)", border: "1px solid rgba(173,198,255,0.22)", fontFamily: "Geist Sans", fontWeight: 500, fontSize: 34, color: "#e8eeff", letterSpacing: "-0.01em" }}>
        <span style={{ fontFamily: "Geist Mono", fontSize: 26, color: "#00a2ff" }}>{n}</span>
        {text}
      </div>
    </div>
  );
};
```

### src/film/Cards.tsx: Request and answer cards (real text)

```tsx
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
```

### src/film/Panels.tsx: Hero table, terminal, end card

```tsx
/**
 * Panels — the hero table (the agent's real result rows), the terminal (real
 * recorded install output) and the closing card.
 */
import { interpolate, useCurrentFrame } from "remotion";
import { out } from "./grid";

const shell = { background: "rgba(24,24,28,0.94)", border: "1px solid rgba(173,198,255,0.16)", borderRadius: 30, boxShadow: "0 50px 120px rgba(0,0,0,0.6)" } as const;
const rise = (f: number, at: number, d = 16) => interpolate(f, [at, at + d], [0, 1], { easing: out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** rows parsed from the agent's markdown table: "| # | Book | Price |" */
export function tableRows(markdown: string) {
  return markdown.split("\n").filter((l) => /^\|\s*\d+\s*\|/.test(l)).map((l) => l.split("|").map((c) => c.trim()).filter(Boolean)).map(([n, name, price]) => ({ n, name, price }));
}

export const TableCard: React.FC<{ rows: { n: string; name: string; price: string }[]; from: number; to: number; step: number; x: number; y: number; w: number; title: string; note: string }> = ({ rows, from, to, step, x, y, w, title, note }) => {
  const f = useCurrentFrame();
  if (f < from || f > to + 12) return null;
  const p = rise(f, from), e = interpolate(f, [to, to + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, padding: "28px 30px 22px", opacity: p * e, transform: `translateY(${(1 - p) * 40}px)`, ...shell }}>
      <div style={{ fontFamily: "Geist Mono", fontSize: 22, color: "#9ca3af", marginBottom: 14 }}>{title}</div>
      {rows.map((r, i) => {
        const q = rise(f, from + 10 + i * step, 14);
        return (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 20, padding: "14px 0", borderTop: i ? "1px solid rgba(173,198,255,0.10)" : "none", opacity: q, transform: `translateX(${(1 - q) * -28}px)` }}>
            <span style={{ fontFamily: "Geist Mono", fontSize: 26, color: "#00a2ff", width: 30 }}>{r.n}</span>
            <span style={{ flex: 1, fontFamily: "Geist Sans", fontSize: 36, color: "#e8eeff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em" }}>{r.name}</span>
            <span style={{ fontFamily: "Geist Sans", fontWeight: 600, fontSize: 40, color: "#ffffff", fontVariantNumeric: "tabular-nums" }}>{r.price}</span>
          </div>
        );
      })}
      <div style={{ fontFamily: "Geist Sans", fontSize: 22, color: "#9ca3af", marginTop: 10 }}>{note}</div>
    </div>
  );
};

type Chunk = { t: number; cmd: string; stream: string; text: string };
/** a terminal replaying recorded commands: each command typed, then its real output at its real pace (compressed by `speed`) */
export const TermCard: React.FC<{ chunks: Chunk[]; start: number; from: number; to: number; x: number; y: number; w: number; h: number; speed?: number; keep?: (cmd: string, line: string) => boolean }> = ({ chunks, start, from, to, x, y, w, h, speed = 8, keep = () => true }) => {
  const f = useCurrentFrame();
  if (f < from || f > to + 12) return null;
  const p = rise(f, from), e = interpolate(f, [to, to + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // timeline: typing each command takes ~1 s of screen time, output follows at `speed`x real time
  const lines: { text: string; dim?: boolean }[] = [];
  let screen = from + 8; // frame when the current item starts
  let last = start;
  for (const c of chunks) {
    const real = Math.max(0, c.t - last) / 1000;
    last = c.t;
    if (c.stream === "start") {
      screen += Math.min(real * 30 / speed, 12);
      const typed = Math.max(0, Math.min(c.text.length, Math.floor((f - screen) * 1.4)));
      if (f >= screen) lines.push({ text: `$ ${c.text.slice(0, typed)}` });
      screen += c.text.length / 1.4 + 6;
    } else if (c.stream === "out" || c.stream === "err") {
      screen += Math.min(real * 30 / speed, 30);
      if (f >= screen) for (const l of c.text.split(/\r?\n/)) if (l.trim() && keep(c.cmd, l)) lines.push({ text: l, dim: true });
    }
  }
  const visible = lines.slice(-Math.floor((h - 90) / 44));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, padding: "26px 30px", opacity: p * e, transform: `translateY(${(1 - p) * 30}px)`, overflow: "hidden", ...shell }}>
      <div style={{ display: "flex", gap: 9, marginBottom: 18 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 13, height: 13, borderRadius: 7, background: "#3a3a40" }} />)}</div>
      {visible.map((l, i) => (
        <div key={i} style={{ fontFamily: "Geist Mono", fontSize: l.dim ? 26 : 31, lineHeight: "44px", color: l.dim ? "#9ca3af" : "#ffffff", whiteSpace: "pre", overflow: "hidden", textOverflow: "ellipsis" }}>
          {l.dim ? l.text : <><span style={{ color: "#00a2ff" }}>$</span>{l.text.slice(1)}</>}
        </div>
      ))}
    </div>
  );
};

export const EndCard: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  if (f < from) return null;
  const a = rise(f, from), b = rise(f, from + 10), c = rise(f, from + 20);
  return (
    <>
      <div style={{ position: "absolute", top: 800, left: 60, right: 60, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * 24}px)` }}>
        <div style={{ padding: "26px 34px", borderRadius: 24, background: "linear-gradient(135deg, #005bc1 0%, #007aff 100%)", boxShadow: "0 30px 90px rgba(0,122,255,0.35)", fontFamily: "Geist Mono", fontSize: 38, color: "#fff", letterSpacing: "-0.01em" }}>
          npm install -g @amitnarw/web-mcp
        </div>
      </div>
      <div style={{ position: "absolute", top: 930, left: 60, right: 60, textAlign: "center", opacity: b, fontFamily: "Geist Sans", fontSize: 34, color: "#9ca3af" }}>
        then run <span style={{ fontFamily: "Geist Mono", color: "#adc6ff" }}>web-mcp</span> to connect your AI
      </div>
      <div style={{ position: "absolute", top: 1030, left: 80, right: 80, textAlign: "center", opacity: b, fontFamily: "Geist Sans", fontSize: 30, lineHeight: 1.5, color: "#e8eeff" }}>
        Works with Claude Code · Cursor · OpenCode · Windsurf · Zed · Codex · Cline
      </div>
      <div style={{ position: "absolute", top: 1200, left: 60, right: 60, textAlign: "center", opacity: c, fontFamily: "Geist Mono", fontSize: 30, color: "#adc6ff", lineHeight: 1.6 }}>
        github.com/amitnarw/web-mcp<br />amitnarwal.com
      </div>
    </>
  );
};
```

### src/film/Stage.tsx: Animated brand stage

```tsx
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
```

### src/film/Film.tsx: The whole film (worked example: beats, cameras, time maps on the bar grid)

```tsx
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
const WIN = { x: 540, y: 980, w: 960, h: 790 };
const win = (from: number, to: number, w = WIN): Win[] => [
  { f: from - 8, ...w, y: w.y + 40, o: 0 }, { f: from + 6, ...w, o: 1 }, { f: to - 6, ...w, o: 1 }, { f: to + 6, ...w, y: w.y - 30, o: 0 },
];
// the lens floats on the stage just under the window: web-mcp's pill is frosted glass, so it must not sit over another page
const LENS = { x: 400, y: 1478, w: 600, h: 230 };
// web-mcp's own status pill and its tooltip, shown floating in the lenses
const PILL = ".bp-action-bar-root, .bp-chat-bubble";
const lensCam: Cam[] = [{ f: 0, x: 452, y: 1172, s: 1.9 }];
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
const wkLens: Win[] = [{ f: 228, ...LENS, o: 0 }, { f: 240, ...LENS, o: 1 }, { f: 360, ...LENS, o: 1 }, { f: 370, ...LENS, y: 1500, o: 0 }]; // leaves before the article loads (a new page re-injects the pill)
// where the tiny orb sits inside web-mcp's pill ("reading page…" state), as seen through the lens: the dive target
const pillOrb = toScreen(lensCam, wkLens, 244, 376, 1207);

// ---- beat 4: fill forms ----
// ~2.8x through the first fields (lens readable), then skip to Submit
const fmTime: [number, number][] = [[B.form - 8, 20.6], [544, 28.0], [560, 37.4], [572, 57.8], [600, 59.4], [B.hero, 61.0]];
const fmCams: Cam[] = [{ f: B.form - 8, x: 470, y: 250, s: 1.36 }, { f: 560, x: 470, y: 250, s: 1.36 }, { f: 574, x: 420, y: 260, s: 1.8 }, { f: 598, x: 360, y: 90, s: 2.4 }, { f: B.hero, x: 360, y: 90, s: 2.5 }];
const fmWins = win(B.form, B.hero);
const fmLens: Win[] = [{ f: B.form, ...LENS, o: 0 }, { f: B.form + 12, ...LENS, o: 1 }, { f: 578, ...LENS, o: 1 }, { f: 588, ...LENS, y: 1500, o: 0 }]; // leaves before Submit loads the next page

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
        <ReplayWindow take={CO} tab={CO_TAB} frame={f} time={hookTime} cams={lensCam} wins={hookLens} clock={false} only={PILL} holdSkips />
      </>}

      {/* beat 2 */}
      <RequestCard text={WK.prompt} from={B.ask + 8} to={B.search - 26} x={70} y={790} w={940} />

      {/* beat 3 */}
      {near(B.search - 15, B.form) && <>
        <ReplayWindow take={WK} tab={WK_TAB} frame={f} time={wkTime} cams={wkCams} wins={wkWins} requestAt={asked(WK)} url />
        <ReplayWindow take={WK} tab={WK_TAB} frame={f} time={wkTime} cams={lensCam} wins={wkLens} clock={false} only={PILL} holdSkips />
      </>}
      <Label n="01" text="Look things up" from={B.search + 6} to={B.form - 8} y={232} />
      <AnswerCard text={WK.result?.text ?? ""} from={426} to={B.form - 6} x={90} y={1190} w={900} size={34} />

      {/* beat 4 */}
      {near(B.form - 8, B.hero) && <>
        <ReplayWindow take={FM} tab={FM_TAB} frame={f} time={fmTime} cams={fmCams} wins={fmWins} requestAt={asked(FM)} url />
        <ReplayWindow take={FM} tab={FM_TAB} frame={f} time={fmTime} cams={lensCam} wins={fmLens} clock={false} only={PILL} holdSkips />
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
```

### src/compositions/TakeFrame.tsx: Inspection composition

```tsx
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
```

### src/compositions/Cover.tsx: Cover still

```tsx
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
```

### src/Root.tsx: Composition registry

```tsx
import { Composition } from "remotion";
import { FILM_FRAMES, Film } from "./film/Film";
import { Cover } from "./compositions/Cover";
import { ReplayTest } from "./compositions/ReplayTest";
import { StyleHook } from "./compositions/StyleHook";
import { TakeFrame } from "./compositions/TakeFrame";

export const Root: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Cover" component={Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="ReplayTest" component={ReplayTest} durationInFrames={285} fps={30} width={1080} height={1920} />
    <Composition id="StyleHook" component={StyleHook} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="TakeFrame" component={TakeFrame} durationInFrames={1} fps={30} width={960} height={1280}
      defaultProps={{ take: "spike-wiki-06", tab: "page-96CBCD9F", t: 40, start: 1793255338710, w: 960, h: 1280 }} />
  </>
);
```

### scripts/stills.ts: Fast review stills (bundle once, parallel)

```ts
/**
 * scripts/stills.ts — render review stills fast: bundle once, one shared
 * browser, several frames in flight at a time.
 *
 *   npx tsx scripts/stills.ts <out-dir> <frame> [frame ...]   (composition: Film)
 */
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "fs";
import { join } from "path";

const [outDir, ...frames] = process.argv.slice(2);
const id = process.env.COMP ?? "Film";
const PARALLEL = Number(process.env.PARALLEL ?? 4);
mkdirSync(outDir, { recursive: true });

const t0 = Date.now();
const serveUrl = await bundle({ entryPoint: join(process.cwd(), "src/index.ts") });
console.log(`bundled in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
const chromiumOptions = { gl: "angle" as const };
const browser = await openBrowser("chrome", { chromiumOptions });
const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser, chromiumOptions });

const queue = frames.map(Number);
await Promise.all(Array.from({ length: PARALLEL }, async () => {
  for (let f = queue.shift(); f !== undefined; f = queue.shift()) {
    const s = Date.now();
    await renderStill({ composition, serveUrl, frame: f, output: join(outDir, `f${f}.jpg`), imageFormat: "jpeg", jpegQuality: 90, puppeteerInstance: browser, chromiumOptions, timeoutInMilliseconds: 120000, logLevel: "error" });
    console.log(`f${f} in ${((Date.now() - s) / 1000).toFixed(1)}s`);
  }
}));
await browser.close({ silent: true });
console.log(`all ${frames.length} stills in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
```

### scripts/sheet.ts: Contact sheets for temporal QA

```ts
/**
 * scripts/sheet.ts — tile one region of several stills into a contact sheet,
 * to spot frame-to-frame jumps (flicker) without watching the video.
 *   npx tsx scripts/sheet.ts <out.jpg> <x,y,w,h> <cols> <still.jpg ...>
 */
import { readFileSync, writeFileSync } from "fs";
import { basename } from "path";
import puppeteer from "puppeteer-core";
import { homedir } from "os";
import { join } from "path";

const [out, rect, colsArg, ...files] = process.argv.slice(2);
const [x, y, w, h] = rect.split(",").map(Number);
const cols = Number(colsArg);
const scale = Math.min(1, 1800 / (cols * w));
const cells = files.map((f) => `<figure style="margin:0;width:${w * scale}px;height:${h * scale + 22}px;overflow:hidden;position:relative;color:#ccc;font:14px monospace">
  <div style="width:${w * scale}px;height:${h * scale}px;overflow:hidden;position:relative"><img src="data:image/jpeg;base64,${readFileSync(f).toString("base64")}" style="position:absolute;left:${-x * scale}px;top:${-y * scale}px;width:${1080 * scale}px"></div>
  <figcaption>${basename(f)}</figcaption></figure>`);
const browser = await puppeteer.launch({ executablePath: join(homedir(), ".cache/puppeteer/chrome/win64-152.0.7977.75/chrome-win64/chrome.exe"), headless: true });
const page = await browser.newPage();
const width = Math.ceil(cols * (w * scale + 8) + 16);
await page.setViewport({ width, height: 400 });
await page.setContent(`<body style="margin:8px;background:#222;display:grid;grid-template-columns:repeat(${cols},${w * scale}px);gap:8px">${cells.join("")}</body>`);
await new Promise((r) => setTimeout(r, 300));
writeFileSync(out, await page.screenshot({ type: "jpeg", quality: 85, fullPage: true }));
await browser.close();
console.log(`sheet: ${out}`);
```
