import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));

function get(path, port) {
  return new Promise((resolveRequest, reject) => {
    const outgoing = request({ host: "127.0.0.1", method: "GET", path, port }, (response) => {
      response.resume();
      response.on("end", () => resolveRequest(response.statusCode));
    });
    outgoing.on("error", reject);
    outgoing.end();
  });
}

function startServer(publicRoot, port) {
  const child = spawn(process.execPath, ["scripts/serve.mjs"], {
    cwd: root,
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), PUBLIC_ROOT: publicRoot },
    stdio: ["ignore", "pipe", "pipe"],
  });
  return new Promise((resolveServer, reject) => {
    const timeout = setTimeout(() => reject(new Error("server did not start")), 5_000);
    child.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`server exited before startup with code ${code}`));
    });
    child.stdout.on("data", (chunk) => {
      if (!chunk.toString().includes("demonstrator:")) return;
      clearTimeout(timeout);
      resolveServer(child);
    });
  });
}

test("link policy rejects missing local Markdown targets", () => {
  const fixture = mkdtempSync(join(tmpdir(), "vht-links-"));
  try {
    mkdirSync(join(fixture, "research"));
    writeFileSync(join(fixture, "research", "sources.csv"), "source_id,url\n", "utf8");
    writeFileSync(join(fixture, "README.md"), "[missing](docs/missing.md)\n", "utf8");
    const result = spawnSync(process.execPath, [join(root, "scripts/check-links.mjs")], {
      cwd: root,
      env: { ...process.env, PUBLIC_REPOSITORY_ROOT: fixture },
      encoding: "utf8",
    });
    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /missing local Markdown target/i);
  } finally {
    rmSync(fixture, { force: true, recursive: true });
  }
});

test("static server returns 400 for malformed encoding and blocks symlink escape", async () => {
  const fixture = mkdtempSync(join(tmpdir(), "vht-server-"));
  const outside = join(fixture, "..", `vht-outside-${process.pid}.txt`);
  const port = 41000 + (process.pid % 1000);
  writeFileSync(join(fixture, "index.html"), "ok", "utf8");
  writeFileSync(outside, "outside", "utf8");
  symlinkSync(outside, join(fixture, "escape.txt"));
  let server;
  try {
    server = await startServer(fixture, port);
    assert.equal(await get("/%E0%A4%A", port), 400);
    assert.equal(await get("/escape.txt", port), 403);
  } finally {
    server?.kill("SIGTERM");
    rmSync(fixture, { force: true, recursive: true });
    rmSync(outside, { force: true });
  }
});

test("history verification rejects special Git modes", () => {
  const historyVerifier = readFileSync(join(root, "scripts/verify-history.mjs"), "utf8");
  assert.match(historyVerifier, /120000/);
  assert.match(historyVerifier, /160000/);
  assert.match(historyVerifier, /unexpected Git mode/);
});
