import { spawn } from "node:child_process";

const child = spawn(
  "C:\\Program Files\\nodejs\\node.exe",
  ["dist/server.js"],
  { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, PORT: "4900" } },
);

child.stdout.on("data", (d) => process.stdout.write(`[out] ${d}`));
child.stderr.on("data", (d) => process.stderr.write(`[err] ${d}`));

const started = Date.now();

async function probe() {
  try {
    const r = await fetch("http://localhost:4900/api/settings");
    console.log(`[probe] /api/settings -> ${r.status} ${JSON.stringify(await r.text())}`);
  } catch (e: any) {
    console.log(`[probe] /api/settings -> FAIL ${e?.cause?.code ?? e?.message}`);
  }
}

setTimeout(probe, 3000);
setTimeout(probe, 10000);

const timer = setInterval(() => {
  const t = ((Date.now() - started) / 1000).toFixed(1);
  if (child.exitCode !== null) {
    clearInterval(timer);
    console.log(`[RESULT] exited after ${t}s code=${child.exitCode} signal=${child.signalCode}`);
  }
}, 1000);

setTimeout(() => {
  if (child.exitCode === null) {
    console.log("[RESULT] STILL ALIVE after 15s — killing");
    child.kill("SIGTERM");
    setTimeout(() => child.kill("SIGKILL"), 2000);
  }
}, 15000);
