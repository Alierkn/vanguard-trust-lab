import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
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

const skippedDirectories = new Set([".git", ".superpowers", "dist", "node_modules", "release-assets", "tmp"]);
function findMarkdown(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && !skippedDirectories.has(entry.name)) return findMarkdown(path);
    return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
  });
}

const markdownFiles = findMarkdown(root);
for (const file of markdownFiles) {
  const body = readFileSync(file, "utf8");
  for (const match of body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)) {
    if (!match[1].startsWith("https://")) {
      console.error(`Non-HTTPS Markdown link in ${relative(root, file)}: ${match[1]}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`Link policy verified across ${markdownFiles.length} Markdown files and ${urls.length} registered primary-source URLs.`);
