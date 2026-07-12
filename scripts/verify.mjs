import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, posix, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { detectForbiddenBinarySignature, forbiddenPublicBinaryExtensions } from "./public-boundaries.mjs";
import {
  findRestrictedContent,
  isPublicTextPath,
  restrictedAuthoringPatterns,
  restrictedMetadataPatterns,
} from "./public-content-policy.mjs";
import { allowedTopLevelDirectories, listPublicFiles, validatePublicTree } from "./public-files.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const canonicalTitle = "Vanguard Host Trust: Integrity, Privilege, and Digital Trust";
const requiredProjectFiles = [
  "project/README.md",
  "project/report.md",
  "project/presentation-guide.md",
  "project/summary-tr.md",
  "project/manifest.json",
];
const requiredFiles = [
  "README.md",
  "CITATION.cff",
  "DISCLAIMER.md",
  "LICENSE.md",
  "SECURITY.md",
  "VERSION",
  "app/.nojekyll",
  "app/.well-known/security.txt",
  "app/index.html",
  "app/app.js",
  "app/logic.js",
  "research/claims.csv",
  "research/sources.csv",
  "research/evidence-freeze.md",
  "docs/security-architecture.md",
  ...requiredProjectFiles,
];

function fail(message) {
  console.error(`VERIFY FAILED: ${message}`);
  process.exitCode = 1;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  if (value.length || row.length) {
    row.push(value);
    rows.push(row);
  }
  const [headers, ...data] = rows;
  return data.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

function markdownWordCount(text) {
  return (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) ?? []).length;
}

for (const path of requiredFiles) {
  if (!existsSync(join(root, path))) fail(`missing required file: ${path}`);
}

const version = readFileSync(join(root, "VERSION"), "utf8").trim();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const packageLock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
const citation = readFileSync(join(root, "CITATION.cff"), "utf8");
const manifest = JSON.parse(readFileSync(join(root, "project/manifest.json"), "utf8"));

if (version !== packageJson.version) fail(`VERSION (${version}) differs from package.json (${packageJson.version})`);
if (version !== packageLock.version || version !== packageLock.packages?.[""]?.version) {
  fail("package-lock.json version differs from VERSION");
}
if (!citation.includes(`version: ${version}`)) fail("CITATION.cff version differs from VERSION");
if (!citation.includes(`title: "${canonicalTitle}"`)) fail("CITATION.cff does not use the canonical project title");
if (!citation.includes('name: "Vanguard Host Trust Contributors"')) fail("CITATION.cff does not use the anonymous contributor identity");
if (!/license:\s*\n\s*- MIT\s*\n\s*- CC-BY-4\.0/.test(citation)) fail("CITATION.cff does not describe the scoped project licenses");
if (manifest.schemaVersion !== "1.0") fail("project manifest schemaVersion must be 1.0");
if (manifest.projectId !== "vanguard-host-trust") fail("project manifest has an unexpected projectId");
if (manifest.title !== canonicalTitle) fail("project manifest does not use the canonical title");
if (manifest.version !== version) fail(`project manifest version (${manifest.version}) differs from VERSION (${version})`);
if (manifest.status !== "maintained") fail("project manifest status must identify the dossier as maintained");
if (manifest.evidenceSnapshot !== "2026-07-12") fail("project manifest evidence snapshot is unexpected");
if (manifest.canonicalReport !== "project/report.md") fail("project manifest canonicalReport is unexpected");
if (manifest.liveDemonstrator !== "https://alierkn.github.io/vanguard-trust-lab/") fail("project manifest liveDemonstrator is unexpected");
if (typeof manifest.researchQuestion !== "string" || manifest.researchQuestion.length < 40) fail("project manifest researchQuestion is missing");

const sources = parseCsv(readFileSync(join(root, "research/sources.csv"), "utf8"));
const claims = parseCsv(readFileSync(join(root, "research/claims.csv"), "utf8"));
const sourceIds = new Set(sources.map(({ source_id: id }) => id));
const claimIds = new Set(claims.map(({ claim_id: id }) => id));
if (sourceIds.size !== sources.length) fail("duplicate source_id in research/sources.csv");
if (claimIds.size !== claims.length) fail("duplicate claim_id in research/claims.csv");
if (sources.length !== 15) fail(`expected exactly 15 public sources; found ${sources.length}`);
if (claims.length !== 18) fail(`expected exactly 18 registered claims; found ${claims.length}`);
if (manifest.metrics?.publicSources !== sources.length) fail("manifest publicSources metric differs from source register");
if (manifest.metrics?.registeredClaims !== claims.length) fail("manifest registeredClaims metric differs from claim register");

for (const source of sources) {
  if (!source.url.startsWith("https://")) fail(`${source.source_id} is not a public HTTPS source`);
}

for (const claim of claims) {
  const ids = claim.source_ids ? claim.source_ids.split(";").filter(Boolean) : [];
  for (const id of ids) {
    if (!sourceIds.has(id)) fail(`${claim.claim_id} refers to unknown source ${id}`);
  }
  if (!claim.allowed_wording || !claim.prohibited_overclaim) fail(`${claim.claim_id} lacks wording controls`);
}

const expectedWorkPackages = new Set(["WP1", "WP2", "WP3", "WP4", "WP5"]);
const workPackages = Array.isArray(manifest.workPackages) ? manifest.workPackages : [];
const deliverables = Array.isArray(manifest.deliverables) ? manifest.deliverables : [];
const workPackageIds = new Set(workPackages.map(({ id }) => id));
const deliverableIds = new Set(deliverables.map(({ id }) => id));
if (workPackageIds.size !== workPackages.length) fail("project manifest has duplicate work-package IDs");
if (deliverableIds.size !== deliverables.length) fail("project manifest has duplicate deliverable IDs");
if (workPackageIds.size !== expectedWorkPackages.size || [...expectedWorkPackages].some((id) => !workPackageIds.has(id))) {
  fail("project manifest must define WP1 through WP5 exactly once");
}
if (deliverables.length < 8) fail("project manifest does not inventory all public deliverables");

for (const item of workPackages) {
  if (!item.title || !item.status || !Array.isArray(item.deliverables)) fail(`${item.id} is missing required fields`);
  if (item.status !== "complete") fail(`${item.id} is not complete`);
  for (const id of item.deliverables) {
    if (!deliverableIds.has(id)) fail(`${item.id} refers to unknown deliverable ${id}`);
  }
}

for (const item of deliverables) {
  if (!item.id || !item.title || !item.type || !item.path || !item.status) fail("manifest deliverable is missing a required field");
  const normalized = posix.normalize(item.path);
  const firstSegment = normalized.split("/")[0];
  if (item.path.includes("\\") || item.path.startsWith("/") || normalized !== item.path || normalized.startsWith("../")) {
    fail(`${item.id} uses an unsafe deliverable path: ${item.path}`);
  }
  if (firstSegment.startsWith(".") || !allowedTopLevelDirectories.has(firstSegment)) {
    fail(`${item.id} points outside the public deliverable tree`);
  }
  if (!existsSync(join(root, item.path)) || !lstatSync(join(root, item.path)).isFile()) fail(`${item.id} path does not exist: ${item.path}`);
  if (item.status !== "complete") fail(`${item.id} is not complete`);
}
if (!Array.isArray(manifest.scopeExclusions) || manifest.scopeExclusions.length < 6) fail("manifest scopeExclusions are incomplete");
for (const requiredExclusion of ["live Windows or Vanguard measurement", "reverse engineering", "personal data", "synthetic attestation"] ) {
  if (!manifest.scopeExclusions.some((value) => value.toLowerCase().includes(requiredExclusion.toLowerCase()))) {
    fail(`manifest scopeExclusions are missing: ${requiredExclusion}`);
  }
}

const report = readFileSync(join(root, manifest.canonicalReport), "utf8");
const requiredReportSections = [
  "Abstract and Problem Definition",
  "Research Question, Scope, and Contribution",
  "Integrity, Authenticity, Privilege, and Availability",
  "Evidence Taxonomy and Method",
  "Public Vanguard Architecture and Trust Boundaries",
  "Threat and Control Analysis",
  "System-Start and On-Demand Comparison",
  "Security, Privacy, Compatibility, and Availability Findings",
  "Interactive Demonstrator Design and Reproducible Results",
  "Validity, Ethical Boundary, and Non-Goals",
  "Conclusion",
  "Public References",
];
for (const section of requiredReportSections) {
  if (!report.includes(section)) fail(`canonical report is missing section: ${section}`);
}
const reportWords = markdownWordCount(report);
if (reportWords < 3500 || reportWords > 5000) fail(`canonical report word count ${reportWords} is outside 3,500–5,000`);
if (!/not a Vanguard audit/i.test(report)) fail("canonical report lacks the explicit non-audit boundary");
if (!/no live Windows or Vanguard measurement/i.test(report)) fail("canonical report lacks the explicit no-live-measurement boundary");
if (/\[C-\d{3}\]\s*[–—-]\s*\[C-\d{3}\]/.test(report)) fail("canonical report uses an unexpanded claim-ID range");

const reportClaimIds = new Set([...report.matchAll(/\[(C-\d{3})\]/g)].map((match) => match[1]));
const reportSourceIds = new Set([...report.matchAll(/\[(S-[A-Z0-9-]+)\]/g)].map((match) => match[1]));
for (const id of reportClaimIds) if (!claimIds.has(id)) fail(`canonical report refers to unknown claim ${id}`);
for (const id of reportSourceIds) if (!sourceIds.has(id)) fail(`canonical report refers to unknown source ${id}`);
for (const id of claimIds) if (!reportClaimIds.has(id)) fail(`canonical report does not trace registered claim ${id}`);
for (const id of sourceIds) if (!reportSourceIds.has(id)) fail(`canonical report does not trace registered source ${id}`);

const rootReadme = readFileSync(join(root, "README.md"), "utf8");
if (!rootReadme.startsWith(`# ${canonicalTitle}\n`)) fail("README does not lead with the canonical project title");
const readmeOrder = [
  "## Research question and public contribution",
  "## Work packages and deliverables",
  "## Six evidence-bounded findings",
  "## System model and trust boundaries",
  "## Evidence model and traceability",
  "## Interactive Security Demonstrator",
];
let previousIndex = -1;
for (const heading of readmeOrder) {
  const index = rootReadme.indexOf(heading);
  if (index < 0) fail(`README is missing project-first heading: ${heading}`);
  if (index <= previousIndex) fail(`README project-first heading is out of order: ${heading}`);
  previousIndex = index;
}

const indexHtml = readFileSync(join(root, "app/index.html"), "utf8");
for (const requiredText of [
  "Vanguard Host Trust",
  "Interactive Security Demonstrator",
  "System Model",
  "Posture Model",
  "Integrity Demonstrator",
  "Evidence",
  "This page has not inspected a device",
  "Not a Vanguard audit or security assessment",
  "hashing never proves that a baseline file is safe or authentic",
  "Role of the Demonstrator",
]) {
  if (!indexHtml.includes(requiredText)) fail(`app statement missing: ${requiredText}`);
}
for (const directive of ["default-src 'self'", "connect-src 'none'", "object-src 'none'", "base-uri 'none'", "form-action 'none'"]) {
  if (!indexHtml.includes(directive)) fail(`Content Security Policy missing: ${directive}`);
}
if (!indexHtml.includes('name="referrer" content="no-referrer"')) fail("referrer policy meta tag is missing");

for (const file of ["index.html", "styles.css", "app.js", "logic.js"]) {
  const body = readFileSync(join(root, "app", file), "utf8");
  if (/<script[^>]+src=["']https?:/i.test(body)) fail(`${file} loads a remote script`);
  if (/<link[^>]+rel=["'](?:stylesheet|preload|modulepreload)["'][^>]+href=["']https?:/i.test(body)) fail(`${file} loads a remote stylesheet or font`);
  if (/\b(fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/.test(body)) fail(`${file} introduces a runtime network API`);
}

const allFiles = listPublicFiles(root);
for (const error of validatePublicTree(root, allFiles)) fail(error);
for (const path of allFiles) {
  const rel = relative(root, path);
  if (!isPublicTextPath(path)) continue;
  const body = readFileSync(path, "utf8");
  for (const label of findRestrictedContent(body, [...restrictedMetadataPatterns, ...restrictedAuthoringPatterns])) {
    fail(`${rel} contains prohibited public content: ${label}`);
  }
}

for (const path of allFiles) {
  if (forbiddenPublicBinaryExtensions.has(extname(path).toLowerCase())) {
    fail(`private/generated binary committed to source tree: ${relative(root, path)}`);
  }
  const signatureType = detectForbiddenBinarySignature(readFileSync(path));
  if (signatureType) fail(`prohibited ${signatureType} content in source tree: ${relative(root, path)}`);
}

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const allowedPngChunks = new Set(["IHDR", "IDAT", "IEND"]);
for (const path of allFiles.filter((value) => extname(value).toLowerCase() === ".png")) {
  const file = readFileSync(path);
  if (!file.subarray(0, pngSignature.length).equals(pngSignature)) {
    fail(`${relative(root, path)} uses .png without PNG file content`);
    continue;
  }
  let offset = pngSignature.length;
  let sawIhdr = false;
  let sawIdat = false;
  let sawIend = false;
  while (offset + 12 <= file.length) {
    const length = file.readUInt32BE(offset);
    const type = file.subarray(offset + 4, offset + 8).toString("ascii");
    const next = offset + 12 + length;
    if (next > file.length) {
      fail(`${relative(root, path)} has a truncated PNG chunk`);
      break;
    }
    if (type === "IHDR") sawIhdr = true;
    if (type === "IDAT") sawIdat = true;
    if (type === "IEND") {
      sawIend = true;
      if (next !== file.length) fail(`${relative(root, path)} has trailing data after IEND`);
      break;
    }
    if (!allowedPngChunks.has(type)) fail(`${relative(root, path)} contains nonessential PNG chunk ${type}`);
    offset = next;
  }
  if (!sawIhdr || !sawIdat || !sawIend) fail(`${relative(root, path)} is missing required PNG chunks`);
}

const allowedActions = new Set([
  "actions/attest",
  "actions/checkout",
  "actions/configure-pages",
  "actions/deploy-pages",
  "actions/setup-node",
  "actions/upload-artifact",
  "actions/upload-pages-artifact",
  "github/codeql-action/analyze",
  "github/codeql-action/init",
]);
const workflowDirectory = join(root, ".github/workflows");
for (const file of readdirSync(workflowDirectory).filter((name) => name.endsWith(".yml"))) {
  const body = readFileSync(join(workflowDirectory, file), "utf8");
  if (/pull_request_target:/.test(body)) fail(`${file} uses pull_request_target`);
  const uses = [...body.matchAll(/^\s*uses:\s*([^\s#]+)/gm)].map((match) => match[1]);
  for (const reference of uses) {
    const [action, revision] = reference.split("@");
    if (!allowedActions.has(action)) fail(`${file} uses unapproved action: ${action}`);
    if (!revision || !/^[0-9a-f]{40}$/i.test(revision)) fail(`${file} has a non-immutable action reference: ${reference}`);
  }
}

for (const workflow of ["ci.yml", "release.yml"]) {
  const body = readFileSync(join(workflowDirectory, workflow), "utf8");
  if (!/fetch-depth:\s*0/.test(body)) fail(`${workflow} must fetch complete history for public-history validation`);
}
const pagesWorkflow = readFileSync(join(workflowDirectory, "pages.yml"), "utf8");
if (!/include-hidden-files:\s*true/.test(pagesWorkflow)) {
  fail("Pages workflow would omit .well-known/security.txt and .nojekyll");
}

if (!process.exitCode) {
  console.log(`Repository verified: ${sources.length} public sources, ${claims.length} claims, ${reportWords} report words, version ${version}.`);
}
