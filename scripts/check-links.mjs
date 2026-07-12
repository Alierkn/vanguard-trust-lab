import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
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

const markdownRoots = [root, join(root, "docs"), join(root, "research")];
const markdownFiles = markdownRoots.flatMap((directory) =>
  readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => join(directory, entry.name)),
);

for (const file of markdownFiles) {
  const body = readFileSync(file, "utf8");
  for (const match of body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)) {
    if (!match[1].startsWith("https://")) {
      console.error(`Non-HTTPS Markdown link in ${file}: ${match[1]}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`Link policy verified: ${urls.length} registered primary-source URLs.`);
