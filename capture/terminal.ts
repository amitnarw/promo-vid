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
