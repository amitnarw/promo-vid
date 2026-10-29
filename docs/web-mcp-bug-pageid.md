# web-mcp 0.1.6: every page tool fails on a fresh install

## What happens

Any page-level tool (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_fill`, `browser_screenshot`, ...) returns:

```
Input validation error: Invalid arguments for tool navigate_page: Required at pageId
```

(With chrome-devtools-mcp 1.12.0 the message reads `pageId: Invalid input: expected number, received undefined`.)

The AI can start the browser and list tabs, but it can't open, read or touch any page. Reproduced on 2026-10-29 with web-mcp 0.1.6 (the latest on npm) driven by Claude Code 2.1.312 on Windows 10.

## Cause

`dist/mcp/wrapper` starts the browser driver like this:

```js
new StdioClientTransport({ command: "npx", args: ["chrome-devtools-mcp", `--browserUrl=http://127.0.0.1:${port}`] })
```

- `npx chrome-devtools-mcp` has no version, so it runs whatever npm resolves. That's the latest release, or the copy in node_modules, which `^1.0.0` resolves to 1.8.0 or newer.
- **chrome-devtools-mcp 1.8.0 (released 2026-08-25) turned `pageIdRouting` on by default.** Page-scoped tools now *require* a `pageId` argument (option help text: "Require pageId on page-scoped tools ... Use --no-page-id-routing to disable"). In 1.4–1.7 this was the opt-in `experimentalPageIdRouting`.
- The wrapper never sends `pageId`, so every page tool fails validation.

So in practice any install since late August 2026 is affected, including the copy bundled under `node_modules` (1.8.0).

## Fix (either works; the first is the smallest)

1. **Turn routing off** (supported from 1.8.0 on):
   ```js
   args: ["chrome-devtools-mcp@1.12.0", `--browserUrl=http://127.0.0.1:${port}`, "--no-page-id-routing"]
   ```
   Pin the exact version too, so a future default change can't break installs again.
2. **Pin to the last compatible version** without the flag: `chrome-devtools-mcp@1.7.0`, and `"chrome-devtools-mcp": "1.7.0"` in package.json.

Better still, spawn the bundled dependency (`require.resolve("chrome-devtools-mcp/package.json")`, then its `bin`) instead of `npx`. That needs no network at startup, makes first runs faster, and always uses the version you tested.

## Verified

With chrome-devtools-mcp 1.7.0 supplied to the unmodified wrapper, the same Claude Code prompt ("Go to wikipedia.org, search for the Eiffel Tower and tell me how tall it is") navigates, types, clicks and answers correctly: "330 metres (1,083 ft)".

## Why it matters for the launch film

The film shows real runs, and everyone who installs after watching gets 0.1.6 from npm. **Please publish a fixed version (0.1.7) before the film is posted.** I'll re-run one take against the published fix to confirm a fresh install works.
