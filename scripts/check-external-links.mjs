import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const sourceCsv = readFileSync(join(root, "research/sources.csv"), "utf8");
const urls = [...sourceCsv.matchAll(/https:\/\/[^",\s]+/g)].map((match) => match[0]);
const failures = [];

async function check(url) {
  const headers = { "User-Agent": "Vanguard-Host-Trust-Link-Health/1.1" };
  let response = await fetch(url, { headers, method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(20_000) });
  if (!response.ok) {
    response = await fetch(url, { headers, method: "GET", redirect: "follow", signal: AbortSignal.timeout(20_000) });
    await response.body?.cancel();
  }
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  console.log(`${response.status} ${url}`);
}

for (const url of urls) {
  try {
    await check(url);
  } catch (error) {
    failures.push(`${url}: ${error instanceof Error ? error.message : "request failed"}`);
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`EXTERNAL LINK CHECK FAILED: ${failure}`);
  process.exit(1);
}

console.log(`External source health verified for ${urls.length} registered URLs.`);
