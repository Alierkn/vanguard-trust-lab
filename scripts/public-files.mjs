import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const genericOutputDirectories = new Set(["dist", "node_modules", "release-assets", "tmp"]);

export const allowedTopLevelDirectories = new Set([
  ".github",
  "LICENSES",
  "app",
  "assets",
  "docs",
  "project",
  "research",
  "scripts",
  "tests",
]);

export const allowedTopLevelFiles = new Set([
  ".editorconfig",
  ".gitattributes",
  ".gitignore",
  ".node-version",
  "CHANGELOG.md",
  "CITATION.cff",
  "CODE_OF_CONDUCT.md",
  "CONTENT-LICENSE.md",
  "CONTRIBUTING.md",
  "DISCLAIMER.md",
  "GOVERNANCE.md",
  "LICENSE",
  "LICENSE.md",
  "NOTICE.md",
  "README.md",
  "ROADMAP.md",
  "SECURITY.md",
  "SUPPORT.md",
  "VERSION",
  "package-lock.json",
  "package.json",
]);

function walkArchive(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && genericOutputDirectories.has(entry.name)) return [];
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walkArchive(path);
    return [path];
  });
}

function gitFileList(root) {
  const output = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 },
  );
  return [...new Set(output.split("\0").filter(Boolean))]
    .map((path) => resolve(root, path))
    .filter(existsSync);
}

export function listPublicFiles(root) {
  const normalizedRoot = resolve(root);
  const paths = existsSync(join(normalizedRoot, ".git")) ? gitFileList(normalizedRoot) : walkArchive(normalizedRoot);
  return paths.sort((left, right) => left.localeCompare(right));
}

export function validatePublicTree(root, paths) {
  const normalizedRoot = resolve(root);
  const errors = [];

  for (const path of paths) {
    const rel = relative(normalizedRoot, path);
    if (!rel || rel.startsWith(`..${sep}`) || rel === "..") {
      errors.push(`path escapes the public tree: ${rel || path}`);
      continue;
    }

    const segments = rel.split(sep);
    const first = segments[0];
    if (segments.length === 1) {
      if (!allowedTopLevelFiles.has(first)) errors.push(`unexpected top-level file: ${rel}`);
    } else if (!allowedTopLevelDirectories.has(first)) {
      errors.push(`unexpected top-level directory: ${first}`);
    }

    const stats = lstatSync(path);
    if (stats.isSymbolicLink()) errors.push(`symbolic links are not allowed: ${rel}`);
    else if (!stats.isFile()) errors.push(`special file is not allowed: ${rel}`);
  }

  return errors;
}
