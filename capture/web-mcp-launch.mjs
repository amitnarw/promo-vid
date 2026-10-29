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
