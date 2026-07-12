import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

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
  "docs/hardening/hardening.json",
  "docs/hardening/hardening.md",
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

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() && entry.name !== ".git" ? walk(path) : [path];
  });
}

for (const path of requiredFiles) {
  if (!existsSync(join(root, path))) fail(`missing required file: ${path}`);
}

const version = readFileSync(join(root, "VERSION"), "utf8").trim();
const packageVersion = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
const citation = readFileSync(join(root, "CITATION.cff"), "utf8");
if (version !== packageVersion) fail(`VERSION (${version}) differs from package.json (${packageVersion})`);
if (!citation.includes(`version: ${version}`)) fail("CITATION.cff version differs from VERSION");

const sources = parseCsv(readFileSync(join(root, "research/sources.csv"), "utf8"));
const claims = parseCsv(readFileSync(join(root, "research/claims.csv"), "utf8"));
const sourceIds = new Set(sources.map(({ source_id: id }) => id));
const claimIds = new Set(claims.map(({ claim_id: id }) => id));
if (sourceIds.size !== sources.length) fail("duplicate source_id in research/sources.csv");
if (claimIds.size !== claims.length) fail("duplicate claim_id in research/claims.csv");
if (sources.length !== 15) fail(`expected exactly 15 public sources; found ${sources.length}`);
if (claims.length < 18) fail(`expected at least 18 registered claims; found ${claims.length}`);

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

const indexHtml = readFileSync(join(root, "app/index.html"), "utf8");
for (const requiredText of [
  "This page has not inspected a device",
  "Not a Vanguard audit or security assessment",
  "hashing never proves that a baseline file is safe or authentic",
  "Why this Lab exists",
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
  if (/<link[^>]+href=["']https?:/i.test(body)) fail(`${file} loads a remote stylesheet or font`);
  if (/\b(fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/.test(body)) fail(`${file} introduces a runtime network API`);
}

const textExtensions = new Set([".cjs", ".cff", ".css", ".csv", ".html", ".js", ".json", ".md", ".mjs", ".txt", ".yaml", ".yml"]);
const decodedRegex = (encoded) => new RegExp(Buffer.from(encoded, "base64").toString("utf8"), "i");
const blockedPatterns = [
  { label: "restricted identifier label", regex: decodedRegex("bWF0cmljb2xh") },
  { label: "restricted institutional mailbox", regex: decodedRegex("c3R1ZGVudGlcLnVuaW1lXC5pdA==") },
  { label: "local macOS home path", regex: decodedRegex("L1VzZXJzLw==") },
  { label: "local Windows home path", regex: /[A-Za-z]:\\Users\\/i },
  { label: "private learning portal", regex: decodedRegex("bW9vZGxl") },
  { label: "private document portal", regex: decodedRegex("c2hhcmVwb2ludFwuY29t") },
  { label: "email address", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
];

const allFiles = walk(root).filter((path) => statSync(path).isFile());
for (const path of allFiles) {
  const rel = relative(root, path);
  if (!textExtensions.has(extname(path).toLowerCase()) && !path.endsWith("CITATION.cff")) continue;
  const body = readFileSync(path, "utf8");
  for (const { label, regex } of blockedPatterns) {
    if (regex.test(body)) fail(`${rel} contains prohibited public metadata: ${label}`);
  }
}

const forbiddenBinaryExtensions = new Set([".docx", ".pdf", ".pptx", ".zip"]);
for (const path of allFiles) {
  if (forbiddenBinaryExtensions.has(extname(path).toLowerCase())) {
    fail(`private/generated binary committed to source tree: ${relative(root, path)}`);
  }
}

const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
for (const path of allFiles.filter((value) => extname(value).toLowerCase() === ".png")) {
  const signature = readFileSync(path).subarray(0, pngSignature.length);
  if (!signature.equals(pngSignature)) fail(`${relative(root, path)} uses .png without PNG file content`);
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

JSON.parse(readFileSync(join(root, "docs/hardening/hardening.json"), "utf8"));

if (!process.exitCode) {
  console.log(`Repository verified: ${sources.length} public sources, ${claims.length} claims, version ${version}.`);
}
