# Web MCP launch film: storyboard v1

Vertical 1080×1920, about 52 s, 30 fps. Calm and confident. One camera move per shot, eased, never whipped.

**Rule for every product shot:** the footage is a real run. Claude Code got a plain-English request and drove web-mcp's real Chromium on its own. The page and web-mcp's overlays are replayed from a DOM recording of that run, so they're sharp at any zoom. Waiting time may be skipped; nothing on screen is changed. Captions never claim more than the agent's own final answer.

## Signature ideas

- **The host is in the product.** The big glossy orb that hosts the film is the same orb that lives inside web-mcp's real action pill ("typing…", "clicking…"). In beat 2 the host orb dives down into the page and *becomes* the tiny orb in the real pill, and the page comes alive. At the end it pops back out to wink.
- **Its eyes follow the action.** The host's eyes track the real click and typing points from the take logs, so the mascot is always visibly paying attention.
- **Hero moment (beat 5, on the music's lift):** the orb's gaze sweeps down a real price column while the agent reads it, and the agent's actual extracted values lift off the page into a clean card.

## Beats

| # | Time | Picture | Orb says (voice + word-synced captions) |
|---|---|---|---|
| 1 | 0–3.5 | Black. Two glowing dots open: the orb's eyes in extreme close-up. Blink. It looks down; pull back to a real browser already typing on its own, with web-mcp's "typing…" pill. | "Your AI can use a real browser now." |
| 2 | 3.5–8 | A plain-English request types into Claude Code's real terminal. The orb dives into the page and becomes the pill's orb; the browser opens the site. | "Hi, I'm Web MCP. Just ask, and watch it happen." |
| 3 | 8–15 | **Look things up.** A real search on a real site. The camera rides the search box, then the result; the agent's real answer appears as a card. | "It searches and reads, like you would." |
| 4 | 15–23 | **Fill forms.** A real Google Form timesheet fills field by field, then Submit, ending on Google's real "Your response has been recorded." | "Fills in forms. Clicks the buttons." |
| 5 | 23–32 | **Grab the info.** HERO: a real product listing; the gaze sweeps the prices; the real extracted values stack into a table. | "Pulls the details you need, straight off the page." |
| 6 | 32–37 | **The boring stuff.** A calm triptych: web-mcp's npm page (weekly downloads), its GitHub page, one more dashboard, with the side-panel log ticking. | "Even the boring, every-day stuff." |
| 7 | 37–42 | **Test your site.** Demo store (labelled): log in → cart → checkout → "Thank you for your order!" | "And test your site like a real customer." |
| 8 | 42–47 | **Private.** Everything else fades; the real side panel ("AI is controlling the browser"); the orb close and still. Type: *Runs on your computer. Nothing leaves it.* | "Everything stays on your computer." |
| 9 | 47–52 | **Install.** The real terminal runs `npm install -g @amitnarw/web-mcp`, then `web-mcp` (the real setup wizard, with its own terminal orb). End card: the command, "Works with Claude Code · Cursor · OpenCode · Windsurf · Zed · Codex · Cline", github.com/amitnarw/web-mcp · amitnarwal.com. The orb winks. | "One line to install. Give your AI a browser." |

About 75 words of voice in roughly 52 s, leaving room for the music to breathe.

## Look

- **Stage:** the brand surface #131315 with a soft, slow light field in the accent blues (#005bc1 → #007aff, highlights #00a2ff). No empty void: the browser card and the orb fill the frame, and the light reacts to what happens.
- **Type:** Geist Sans. One statement per beat, 96–140 px, tight tracking, kept clear of the platforms' UI zones (top ~220 px, bottom ~420 px, right ~140 px). Labels in #adc6ff, body #ffffff, secondary #9ca3af.
- **Orb:** glossy 3D sphere matching the real CSS orb (dark core, #007aff / #adc6ff gradient sheen), with #adc6ff dot eyes that blink, dart, track and wink, exactly as the extension's do.
- **Sound:** one licensed track cut on bar lines to end on a real ending, plus quiet UI ticks on the real logged clicks and keystrokes, and the voice ducking the music.

## Takes to shoot (all with Claude Code + web-mcp)

1. Search: real site, short question with a checkable answer.
2. Google Form timesheet: needs the form (see questions).
3. Price list scrape: a real store listing that tolerates automated browsing.
4. web-mcp's npm and GitHub pages: real numbers.
5. Demo store checkout (saucedemo.com), completed for real.
6. Terminal: real `npm install -g` and `web-mcp` wizard, recorded as a terminal stream and re-typeset sharp.
