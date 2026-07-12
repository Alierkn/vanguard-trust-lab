import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { listPublicFiles } from "./public-files.mjs";

const root = resolve(process.env.PUBLIC_REPOSITORY_ROOT || fileURLToPath(new URL("..", import.meta.url)));
const sourceCsv = readFileSync(join(root, "research/sources.csv"), "utf8");
const urls = [...sourceCsv.matchAll(/https:\/\/[^",\s]+/g)].map((match) => match[0]);
const allowedPrimaryDomains = new Set([
  "csrc.nist.gov",
  "learn.microsoft.com",
  "leagueoflegends.com",
  "www.leagueoflegends.com",
  "riotgames.com",
  "www.riotgames.com",
  "w3.org",
  "www.w3.org",
]);

let failed = false;
for (const value of urls) {
  const url = new URL(value);
  if (url.protocol !== "https:") {
    console.error(`Non-HTTPS source: ${value}`);
    failed = true;
  }
  if (!allowedPrimaryDomains.has(url.hostname)) {
    console.error(`Unapproved source domain: ${url.hostname}`);
    failed = true;
  }
}

if (new Set(urls).size !== urls.length) {
  console.warn("Source register contains a repeated URL; review whether separate records are necessary.");
}

const markdownFiles = listPublicFiles(root).filter((path) => extname(path).toLowerCase() === ".md");
function headingAnchors(body) {
  const counts = new Map();
  const anchors = new Set();
  for (const match of body.matchAll(/^#{1,6}\s+(.+?)\s*#*$/gm)) {
    const base = match[1]
      .replace(/[`*_~]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-");
    const count = counts.get(base) || 0;
    anchors.add(count === 0 ? base : `${base}-${count}`);
    counts.set(base, count + 1);
  }
  return anchors;
}

function withinRoot(path) {
  return path === root || path.startsWith(`${root}${sep}`);
}

for (const file of markdownFiles) {
  const body = readFileSync(file, "utf8");
  for (const match of body.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const destination = match[1].trim().replace(/^<|>$/g, "").split(/\s+["']/)[0];
    if (/^https?:\/\//i.test(destination)) {
      if (!destination.startsWith("https://")) {
        console.error(`Non-HTTPS Markdown link in ${relative(root, file)}: ${destination}`);
        failed = true;
      }
      continue;
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(destination)) continue;

    const [rawPath, rawAnchor = ""] = destination.split("#", 2);
    let decodedPath;
    try {
      decodedPath = decodeURIComponent(rawPath);
    } catch {
      console.error(`Malformed local Markdown link in ${relative(root, file)}: ${destination}`);
      failed = true;
      continue;
    }
    const target = decodedPath
      ? resolve(decodedPath.startsWith("/") ? root : dirname(file), decodedPath.replace(/^\/+/, ""))
      : file;
    if (!withinRoot(target) || !existsSync(target)) {
      console.error(`Missing local Markdown target in ${relative(root, file)}: ${destination}`);
      failed = true;
      continue;
    }
    if (rawAnchor && extname(target).toLowerCase() === ".md") {
      const anchor = decodeURIComponent(rawAnchor).toLowerCase();
      if (!headingAnchors(readFileSync(target, "utf8")).has(anchor)) {
        console.error(`Missing local Markdown anchor in ${relative(root, file)}: ${destination}`);
        failed = true;
      }
    }
  }
}

if (failed) process.exit(1);
console.log(`Link policy verified across ${markdownFiles.length} Markdown files and ${urls.length} registered primary-source URLs.`);
