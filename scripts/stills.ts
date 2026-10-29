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
