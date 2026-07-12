import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { detectForbiddenBinarySignature, forbiddenPublicBinaryExtensions } from "./public-boundaries.mjs";
import {
  findRestrictedContent,
  isPublicTextPath,
  restrictedAuthoringPatterns,
  restrictedMetadataPatterns,
} from "./public-content-policy.mjs";

const root = resolve(process.env.PUBLIC_REPOSITORY_ROOT || fileURLToPath(new URL("..", import.meta.url)));

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
const unexpectedModes = [];
const blobPaths = new Map();
const postCutoverBlobPaths = new Map();
const allowedBlobModes = new Set(["100644", "100755"]);
let postCutoverCommits = new Set();
try {
  postCutoverCommits = new Set(git(["rev-list", "HEAD", "--not", "v1.1.0"]).trim().split(/\r?\n/).filter(Boolean));
} catch {
  postCutoverCommits = new Set(commits);
}
try {
  for (const commit of commits) {
    const tree = git(["ls-tree", "-r", "-z", commit]);
    for (const record of tree.split("\0")) {
      if (!record) continue;
      const tab = record.indexOf("\t");
      if (tab < 0) continue;
      const metadata = record.slice(0, tab).split(" ");
      const mode = metadata[0];
      const type = metadata[1];
      const blob = metadata[2];
      const path = record.slice(tab + 1);
      if (!allowedBlobModes.has(mode)) unexpectedModes.push({ commit, mode, path });
      if (forbiddenPublicBinaryExtensions.has(extname(path).toLowerCase())) forbiddenPaths.push({ commit, path });
      if (type === "blob" && blob && !blobPaths.has(blob)) blobPaths.set(blob, path);
      if (type === "blob" && blob && postCutoverCommits.has(commit) && !postCutoverBlobPaths.has(blob)) postCutoverBlobPaths.set(blob, path);
    }
  }
} catch (error) {
  console.error(`HISTORY VERIFY FAILED: ${error instanceof Error ? error.message : "unable to inspect commit trees"}`);
  process.exit(1);
}

const forbiddenBlobs = [];
const restrictedHistoricalContent = [];
try {
  for (const [blob, path] of blobPaths) {
    const content = git(["cat-file", "blob", blob], null);
    const signatureType = detectForbiddenBinarySignature(content);
    if (signatureType) forbiddenBlobs.push({ blob, path, signatureType });
    if (isPublicTextPath(path)) {
      for (const label of findRestrictedContent(content.toString("utf8"), restrictedMetadataPatterns)) {
        restrictedHistoricalContent.push({ blob, path, label });
      }
    }
  }
  for (const [blob, path] of postCutoverBlobPaths) {
    if (!isPublicTextPath(path)) continue;
    const content = git(["cat-file", "blob", blob], null).toString("utf8");
    for (const label of findRestrictedContent(content, restrictedAuthoringPatterns)) {
      restrictedHistoricalContent.push({ blob, path, label });
    }
  }
} catch (error) {
  console.error(`HISTORY VERIFY FAILED: ${error instanceof Error ? error.message : "unable to inspect historical blobs"}`);
  process.exit(1);
}

if (forbiddenPaths.length || forbiddenBlobs.length || unexpectedModes.length || restrictedHistoricalContent.length) {
  for (const { commit, path } of forbiddenPaths) {
    console.error(`HISTORY VERIFY FAILED: prohibited binary path in ${commit.slice(0, 12)}: ${path}`);
  }
  for (const { blob, path, signatureType } of forbiddenBlobs) {
    console.error(`HISTORY VERIFY FAILED: prohibited ${signatureType} blob ${blob.slice(0, 12)} (observed as ${path})`);
  }
  for (const { commit, mode, path } of unexpectedModes) {
    const kind = mode === "120000" ? "symbolic link" : mode === "160000" ? "submodule" : "unexpected Git mode";
    console.error(`HISTORY VERIFY FAILED: ${kind} ${mode} in ${commit.slice(0, 12)}: ${path}`);
  }
  for (const { blob, path, label } of restrictedHistoricalContent) {
    console.error(`HISTORY VERIFY FAILED: ${label} in blob ${blob.slice(0, 12)} (observed as ${path})`);
  }
  process.exit(1);
}

console.log(`Reachable Git history verified across ${commits.length} commits and ${blobPaths.size} unique blobs: public content, file modes, paths, and signatures are within policy.`);
