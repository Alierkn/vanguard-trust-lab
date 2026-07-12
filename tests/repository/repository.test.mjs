import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));

test("static app has no remote runtime dependency", () => {
  for (const path of ["app/index.html", "app/styles.css", "app/app.js", "app/logic.js"]) {
    const body = readFileSync(resolve(root, path), "utf8");
    assert.doesNotMatch(body, /<script[^>]+src=["']https?:/i);
    assert.doesNotMatch(body, /<link[^>]+href=["']https?:/i);
    assert.doesNotMatch(body, /\b(fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/);
  }
});

test("app states the research and inspection boundaries", () => {
  const html = readFileSync(resolve(root, "app/index.html"), "utf8");
  assert.match(html, /This page has not inspected a device/);
  assert.match(html, /Not a Vanguard audit or security assessment/);
  assert.match(html, /hashing never proves that a baseline file is safe or authentic/);
  assert.match(html, /Why this Lab exists/);
  assert.match(html, /macOS, Windows, and Linux/);
});

test("app has a restrictive static-host CSP", () => {
  const html = readFileSync(resolve(root, "app/index.html"), "utf8");
  for (const directive of ["default-src 'self'", "connect-src 'none'", "object-src 'none'", "base-uri 'none'", "form-action 'none'"]) {
    assert.match(html, new RegExp(directive.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(html, /name="referrer" content="no-referrer"/);
});

test("registered fixed samples retain their expected digest", () => {
  const sampleA = "Vanguard Trust Lab educational sample\nVersion: 1\nIntegrity means detecting unauthorized change.\n";
  const sampleB = "Vanguard Trust Lab educational sample\nVersion: 2\nIntegrity means detecting unauthorized change.\n";
  assert.equal(createHash("sha256").update(sampleA).digest("hex"), "6af1022470965f08d997eb048309a6b95b898289e19f224df7a3e91604ff004b");
  assert.equal(createHash("sha256").update(sampleB).digest("hex"), "7240f01f4de745ed075feea3edd5d02c8632979050f31126faf3c5cfd44c10a6");
});

test("public metadata uses a project identity", () => {
  const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  const citation = readFileSync(resolve(root, "CITATION.cff"), "utf8");
  assert.equal(packageJson.author.name, "Vanguard Trust Lab Contributors");
  assert.equal("email" in packageJson.author, false);
  assert.match(citation, /Vanguard Trust Lab Contributors/);
  assert.doesNotMatch(citation, /email:/i);
});
