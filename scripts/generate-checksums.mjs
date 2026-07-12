import { createHash } from "node:crypto";
import { createReadStream, existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";

const target = resolve(process.argv[2] || "release-assets");
if (!existsSync(target) || !statSync(target).isDirectory()) {
  console.error(`Release directory not found: ${target}`);
  console.error("Usage: npm run checksums -- release-assets");
  process.exit(1);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

async function digest(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

const files = walk(target)
  .filter((path) => basename(path) !== "CHECKSUMS.sha256")
  .sort((a, b) => a.localeCompare(b));

if (!files.length) {
  console.error(`No release files found in ${target}`);
  process.exit(1);
}

const lines = [];
for (const file of files) lines.push(`${await digest(file)}  ${relative(target, file)}`);
const output = join(target, "CHECKSUMS.sha256");
writeFileSync(output, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${output} for ${files.length} files.`);
