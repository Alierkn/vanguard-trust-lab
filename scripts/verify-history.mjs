import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { detectForbiddenBinarySignature, forbiddenPublicBinaryExtensions } from "./public-boundaries.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));

if (!existsSync(resolve(root, ".git"))) {
  console.log("Git history unavailable in source archive; current-tree release boundaries remain verified.");
  process.exit(0);
}

function git(args, encoding = "utf8") {
  return execFileSync("git", args, {
    cwd: root,
    encoding,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

let commits;
try {
  commits = git(["rev-list", "--all"]).trim().split(/\r?\n/).filter(Boolean);
} catch (error) {
  console.error(`HISTORY VERIFY FAILED: ${error instanceof Error ? error.message : "unable to enumerate Git history"}`);
  process.exit(1);
}

const forbiddenPaths = [];
const blobPaths = new Map();
try {
  for (const commit of commits) {
    const tree = git(["ls-tree", "-r", "-z", commit]);
    for (const record of tree.split("\0")) {
      if (!record) continue;
      const tab = record.indexOf("\t");
      if (tab < 0) continue;
      const metadata = record.slice(0, tab).split(" ");
      const blob = metadata[2];
      const path = record.slice(tab + 1);
      if (forbiddenPublicBinaryExtensions.has(extname(path).toLowerCase())) forbiddenPaths.push({ commit, path });
      if (blob && !blobPaths.has(blob)) blobPaths.set(blob, path);
    }
  }
} catch (error) {
  console.error(`HISTORY VERIFY FAILED: ${error instanceof Error ? error.message : "unable to inspect commit trees"}`);
  process.exit(1);
}

const forbiddenBlobs = [];
try {
  for (const [blob, path] of blobPaths) {
    const content = git(["cat-file", "blob", blob], null);
    const signatureType = detectForbiddenBinarySignature(content);
    if (signatureType) forbiddenBlobs.push({ blob, path, signatureType });
  }
} catch (error) {
  console.error(`HISTORY VERIFY FAILED: ${error instanceof Error ? error.message : "unable to inspect historical blobs"}`);
  process.exit(1);
}

if (forbiddenPaths.length || forbiddenBlobs.length) {
  for (const { commit, path } of forbiddenPaths) {
    console.error(`HISTORY VERIFY FAILED: prohibited binary path in ${commit.slice(0, 12)}: ${path}`);
  }
  for (const { blob, path, signatureType } of forbiddenBlobs) {
    console.error(`HISTORY VERIFY FAILED: prohibited ${signatureType} blob ${blob.slice(0, 12)} (observed as ${path})`);
  }
  process.exit(1);
}

console.log(`Reachable Git history verified across ${commits.length} commits and ${blobPaths.size} unique blobs: no prohibited binary paths or signatures.`);
