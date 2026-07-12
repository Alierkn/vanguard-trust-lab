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

function contrastRatio(first, second) {
  const luminance = (hex) => {
    const channels = hex.match(/[0-9a-f]{2}/gi).map((value) => Number.parseInt(value, 16) / 255);
    const [red, green, blue] = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const light = Math.max(luminance(first), luminance(second));
  const dark = Math.min(luminance(first), luminance(second));
  return (light + 0.05) / (dark + 0.05);
}

test("static app has no remote runtime dependency", () => {
  for (const path of ["app/index.html", "app/styles.css", "app/app.js", "app/logic.js"]) {
    const body = read(path);
    assert.doesNotMatch(body, /<script[^>]+src=["']https?:/i);
    assert.doesNotMatch(body, /<link[^>]+rel=["'](?:stylesheet|preload|modulepreload)["'][^>]+href=["']https?:/i);
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

test("app metadata and local sharing assets identify the canonical public project", () => {
  const html = read("app/index.html");
  assert.match(html, /rel="canonical" href="https:\/\/alierkn\.github\.io\/vanguard-trust-lab\/"/);
  assert.match(html, /property="og:title" content="Vanguard Host Trust/);
  assert.match(html, /property="og:image" content="https:\/\/alierkn\.github\.io\/vanguard-trust-lab\/social-preview\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /rel="icon" href="favicon\.svg"/);
  assert.match(html, /class="nav-overflow-cue"/);
  assert.ok(existsSync(resolve(root, "app/favicon.svg")));
  assert.ok(existsSync(resolve(root, "app/social-preview.png")));
});

test("demonstrator visual tokens meet contrast and avoid generic decorative treatments", () => {
  const css = read("app/styles.css");
  const token = (name) => css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
  const greenText = token("green-text");
  const focusRing = token("focus-ring");
  assert.ok(greenText);
  assert.ok(focusRing);
  assert.ok(contrastRatio(greenText, token("white")) >= 4.5);
  assert.ok(contrastRatio(focusRing, token("white")) >= 3);
  assert.doesNotMatch(css, /font-family:\s*Inter/i);
  assert.doesNotMatch(css, /backdrop-filter/i);
  assert.doesNotMatch(css, /border-left:\s*3px/i);
  assert.doesNotMatch(css, /box-shadow:\s*var\(--shadow\)/i);
});

test("registered fixed samples retain their expected digest", () => {
  const sampleA = "Vanguard Host Trust educational sample\nVersion: 1\nIntegrity means detecting unauthorized change.\n";
  const sampleB = "Vanguard Host Trust educational sample\nVersion: 2\nIntegrity means detecting unauthorized change.\n";
  assert.equal(createHash("sha256").update(sampleA).digest("hex"), "98e1521a889fa6ef3e88b60a125bd569f0b6a9c228a4b492e902ef6b2c8e7c9a");
  assert.equal(createHash("sha256").update(sampleB).digest("hex"), "677197ccc10c1da9241d73ec32413cc125e0fd89616ca6c4637247b85f7e5588");
  const app = read("app/app.js");
  assert.ok(app.includes(JSON.stringify(sampleA).slice(1, -1)));
  assert.ok(app.includes(JSON.stringify(sampleB).slice(1, -1)));
});

test("manifest and root metadata form one v1.1.1 contract", () => {
  const manifest = JSON.parse(read("project/manifest.json"));
  const packageJson = JSON.parse(read("package.json"));
  const packageLock = JSON.parse(read("package-lock.json"));
  const version = read("VERSION").trim();
  const citation = read("CITATION.cff");
  assert.equal(version, "1.1.1");
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
  assert.match(readme, /\*\*Start here:\*\*.*Report.*Demonstrator.*Evidence.*Reproduce.*Release/i);
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
  for (const path of ["CONTRIBUTING.md", "SECURITY.md", "SUPPORT.md", "CODE_OF_CONDUCT.md"]) {
    assert.match(readme, new RegExp(`\\]\\(${path.replace(".", "\\.")}\\)`));
  }
});

test("human-readable references mirror all registered public sources", () => {
  assert.equal(existsSync(resolve(root, "research/references.md")), true);
  const references = read("research/references.md");
  const sourceRows = read("research/sources.csv").split(/\r?\n/).slice(1).filter(Boolean);
  assert.equal(sourceRows.length, 15);
  for (const row of sourceRows) {
    const sourceId = row.match(/^"([^"]+)"/)?.[1];
    const url = row.match(/"(https:\/\/[^\"]+)"/)?.[1];
    assert.match(references, new RegExp(`\\[${sourceId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]`));
    assert.ok(references.includes(`](${url})`), url);
  }
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
  assert.match(release, /merge-base --is-ancestor/);
  const pages = read(".github/workflows/pages.yml");
  assert.match(pages, /pull_request:/);
  assert.match(pages, /github\.event_name != 'pull_request'/);
  const releaseRecord = read("docs/releases/v1.1.1.md");
  for (const heading of ["Research", "Demonstrator", "Evidence Snapshot", "Known Limits"]) {
    assert.match(releaseRecord, new RegExp(`^## ${heading}$`, "m"));
  }
  assert.ok(existsSync(resolve(root, ".github/workflows/link-health.yml")));
  const linkHealth = read(".github/workflows/link-health.yml");
  assert.match(linkHealth, /schedule:/);
  assert.match(linkHealth, /npm run check:external-links/);
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
  assert.equal(packageJson.author.name, "Vanguard Host Trust Contributors");
  assert.equal("email" in packageJson.author, false);
  assert.match(citation, /Vanguard Host Trust Contributors/);
  assert.doesNotMatch(citation, /email:/i);
  assert.match(citation, /license:\n  - MIT\n  - CC-BY-4\.0/);
  assert.match(read("LICENSE.md"), /Software code, tests, workflows, and build scripts.*MIT/s);
  assert.match(read("LICENSE.md"), /research prose, diagrams, and documentation.*Creative Commons Attribution 4\.0/s);
});
