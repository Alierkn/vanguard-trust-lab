import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { detectForbiddenBinarySignature, forbiddenPublicBinaryExtensions } from "../../scripts/public-boundaries.mjs";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const canonicalTitle = "Vanguard Host Trust: Integrity, Privilege, and Digital Trust";
const read = (path) => readFileSync(resolve(root, path), "utf8");

test("static app has no remote runtime dependency", () => {
  for (const path of ["app/index.html", "app/styles.css", "app/app.js", "app/logic.js"]) {
    const body = read(path);
    assert.doesNotMatch(body, /<script[^>]+src=["']https?:/i);
    assert.doesNotMatch(body, /<link[^>]+href=["']https?:/i);
    assert.doesNotMatch(body, /\b(fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/);
  }
});

test("app uses the project identity and four demonstrator views", () => {
  const html = read("app/index.html");
  assert.match(html, /Vanguard Host Trust/);
  assert.match(html, /Interactive Security Demonstrator/);
  assert.match(html, /href="#system-model"[^>]*>System Model/);
  assert.match(html, /href="#posture-model"[^>]*>Posture Model/);
  assert.match(html, /href="#integrity-demonstrator"[^>]*>Integrity Demonstrator/);
  assert.match(html, /href="#evidence"[^>]*>Evidence/);
  assert.match(html, /Role of the Demonstrator/);
});

test("app states the research and inspection boundaries", () => {
  const html = read("app/index.html");
  assert.match(html, /This page has not inspected a device/);
  assert.match(html, /Not a Vanguard audit or security assessment/);
  assert.match(html, /hashing never proves that a baseline file is safe or authentic/);
  assert.match(html, /not the project itself, a Vanguard audit, Pre-Check, or substitute for live Windows measurement/i);
  assert.match(html, /macOS, Windows, and Linux/);
});

test("app has a restrictive static-host CSP", () => {
  const html = read("app/index.html");
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

test("manifest and root metadata form one v1.1.0 contract", () => {
  const manifest = JSON.parse(read("project/manifest.json"));
  const packageJson = JSON.parse(read("package.json"));
  const packageLock = JSON.parse(read("package-lock.json"));
  const version = read("VERSION").trim();
  const citation = read("CITATION.cff");
  assert.equal(version, "1.1.0");
  assert.equal(packageJson.version, version);
  assert.equal(packageLock.version, version);
  assert.equal(packageLock.packages[""].version, version);
  assert.equal(manifest.version, version);
  assert.equal(manifest.title, canonicalTitle);
  assert.equal(manifest.status, "maintained");
  assert.equal(manifest.canonicalReport, "project/report.md");
  assert.equal(manifest.liveDemonstrator, "https://alierkn.github.io/vanguard-trust-lab/");
  assert.equal(manifest.evidenceSnapshot, "2026-07-12");
  assert.match(citation, new RegExp(`title: "${canonicalTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
});

test("manifest IDs and public deliverable paths are valid", () => {
  const manifest = JSON.parse(read("project/manifest.json"));
  const workPackageIds = manifest.workPackages.map(({ id }) => id);
  const deliverableIds = manifest.deliverables.map(({ id }) => id);
  assert.deepEqual(new Set(workPackageIds), new Set(["WP1", "WP2", "WP3", "WP4", "WP5"]));
  assert.equal(new Set(workPackageIds).size, workPackageIds.length);
  assert.equal(new Set(deliverableIds).size, deliverableIds.length);
  for (const workPackage of manifest.workPackages) {
    assert.equal(workPackage.status, "complete");
    for (const id of workPackage.deliverables) assert.ok(deliverableIds.includes(id));
  }
  for (const deliverable of manifest.deliverables) {
    assert.equal(deliverable.status, "complete");
    assert.doesNotMatch(deliverable.path, /^(?:\/|\.\.\/)|\\/);
    assert.doesNotMatch(deliverable.path, /^\./);
    assert.ok(existsSync(resolve(root, deliverable.path)), deliverable.path);
  }
  assert.equal(manifest.metrics.publicSources, 15);
  assert.equal(manifest.metrics.registeredClaims, 18);
});

test("public tree excludes authoring artifacts and validates a fail-closed file set", () => {
  const docsIndex = read("docs/index.md");
  const verify = read("scripts/verify.mjs");
  const publicFiles = read("scripts/public-files.mjs");
  const linkCheck = read("scripts/check-links.mjs");
  const privateDirectoryMarker = Buffer.from("LnN1cGVycG93ZXJz", "base64").toString("utf8");

  assert.equal(existsSync(resolve(root, "docs/hardening")), false);
  assert.doesNotMatch(docsIndex, /hardening\//i);
  assert.match(publicFiles, /ls-files/);
  assert.match(publicFiles, /allowedTopLevelDirectories/);
  assert.match(publicFiles, /lstatSync/);
  assert.doesNotMatch(`${verify}\n${publicFiles}`, new RegExp(privateDirectoryMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  assert.doesNotMatch(linkCheck, new RegExp(privateDirectoryMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
});

test("canonical report is complete and all traceability IDs are registered", () => {
  const report = read("project/report.md");
  const claimIds = new Set(read("research/claims.csv").split(/\r?\n/).slice(1).filter(Boolean).map((line) => line.match(/^"([^"]+)"/)?.[1]));
  const sourceIds = new Set(read("research/sources.csv").split(/\r?\n/).slice(1).filter(Boolean).map((line) => line.match(/^"([^"]+)"/)?.[1]));
  const reportClaims = new Set([...report.matchAll(/\[(C-\d{3})\]/g)].map((match) => match[1]));
  const reportSources = new Set([...report.matchAll(/\[(S-[A-Z0-9-]+)\]/g)].map((match) => match[1]));
  const words = report.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) ?? [];
  assert.ok(words.length >= 3500 && words.length <= 5000, String(words.length));
  assert.equal(claimIds.size, 18);
  assert.equal(sourceIds.size, 15);
  assert.deepEqual(reportClaims, claimIds);
  assert.deepEqual(reportSources, sourceIds);
  assert.doesNotMatch(report, /\[C-\d{3}\]\s*[–—-]\s*\[C-\d{3}\]/);
  assert.match(report, /not a Vanguard audit/i);
  assert.match(report, /no live Windows or Vanguard measurement/i);
});

test("README presents the project before the demonstrator", () => {
  const readme = read("README.md");
  assert.ok(readme.startsWith(`# ${canonicalTitle}\n`));
  const headings = [
    "## Research question and public contribution",
    "## Work packages and deliverables",
    "## Six evidence-bounded findings",
    "## System model and trust boundaries",
    "## Evidence model and traceability",
    "## Interactive Security Demonstrator",
  ];
  const positions = headings.map((heading) => readme.indexOf(heading));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});

test("presentation guide contains ten slides, speaker-note blocks, and defense answers", () => {
  const guide = read("project/presentation-guide.md");
  assert.equal((guide.match(/^## Slide \d+ —/gm) ?? []).length, 10);
  assert.equal((guide.match(/^\*\*Speaker notes\*\*$/gm) ?? []).length, 10);
  assert.ok((guide.match(/^### “.+”$/gm) ?? []).length >= 10);
});

test("public screenshots are genuine PNGs without ancillary metadata", () => {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const allowedChunks = new Set(["IHDR", "IDAT", "IEND"]);
  const screenshots = readdirSync(resolve(root, "assets/screenshots")).filter((name) => extname(name).toLowerCase() === ".png");
  assert.equal(screenshots.length, 2);
  for (const screenshot of screenshots) {
    const data = readFileSync(resolve(root, "assets/screenshots", screenshot));
    assert.ok(data.subarray(0, signature.length).equals(signature));
    let offset = signature.length;
    const chunks = [];
    while (offset + 12 <= data.length) {
      const length = data.readUInt32BE(offset);
      const type = data.subarray(offset + 4, offset + 8).toString("ascii");
      chunks.push(type);
      offset += 12 + length;
      if (type === "IEND") break;
    }
    assert.equal(chunks[0], "IHDR");
    assert.ok(chunks.includes("IDAT"));
    assert.equal(chunks.at(-1), "IEND");
    assert.equal(chunks.every((chunk) => allowedChunks.has(chunk)), true);
  }
});

test("CI and release workflows enforce full-history and archive revalidation", () => {
  assert.match(read(".github/workflows/ci.yml"), /fetch-depth:\s*0/);
  const release = read(".github/workflows/release.yml");
  assert.match(release, /fetch-depth:\s*0/);
  assert.match(release, /Extract and revalidate release bundle/);
  assert.match(release, /sha256sum -c CHECKSUMS\.sha256/);
  assert.match(release, /npm run ci/);
  assert.match(release, /gh attestation verify/);
});

test("public binary boundary covers office, spreadsheet, PDF, executable, and archive formats", () => {
  const required = [
    ".docx", ".pptx", ".xlsx", ".xlsm", ".pdf", ".zip", ".tar", ".tgz", ".gz", ".7z", ".dmg", ".exe",
  ];
  for (const extension of required) assert.ok(forbiddenPublicBinaryExtensions.has(extension), extension);
  for (const path of ["submission.xlsx", "slides.pptx", "bundle.tar.gz", "binary.exe"]) {
    assert.ok(forbiddenPublicBinaryExtensions.has(extname(path)), path);
  }
  assert.equal(forbiddenPublicBinaryExtensions.has(".png"), false);
  assert.equal(forbiddenPublicBinaryExtensions.has(".csv"), false);
  assert.equal(detectForbiddenBinarySignature(Buffer.from("PK\u0003\u0004renamed office payload", "binary")), "ZIP/Office archive");
  assert.equal(detectForbiddenBinarySignature(Buffer.from("%PDF-1.7\n", "ascii")), "PDF");
  assert.equal(detectForbiddenBinarySignature(Buffer.from([0x89, 0x50, 0x4e, 0x47])), null);
  assert.match(read("scripts/verify-history.mjs"), /ls-tree/);
  assert.match(read("scripts/verify-history.mjs"), /cat-file/);
});

test("public metadata uses an anonymous project identity", () => {
  const packageJson = JSON.parse(read("package.json"));
  const citation = read("CITATION.cff");
  assert.equal(packageJson.author.name, "Vanguard Trust Lab Contributors");
  assert.equal("email" in packageJson.author, false);
  assert.match(citation, /Vanguard Trust Lab Contributors/);
  assert.doesNotMatch(citation, /email:/i);
});
