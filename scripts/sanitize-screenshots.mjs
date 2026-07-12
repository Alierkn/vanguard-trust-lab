import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const screenshots = [
  "assets/screenshots/trust-lab-overview.png",
  "assets/screenshots/integrity-mismatch.png",
];
const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const retainedChunks = new Set(["IHDR", "IDAT", "IEND"]);

for (const relativePath of screenshots) {
  const path = join(root, relativePath);
  const input = readFileSync(path);
  if (!input.subarray(0, signature.length).equals(signature)) throw new Error(`${relativePath} is not a PNG`);

  const output = [signature];
  let offset = signature.length;
  let sawIend = false;
  while (offset + 12 <= input.length) {
    const length = input.readUInt32BE(offset);
    const type = input.subarray(offset + 4, offset + 8).toString("ascii");
    const next = offset + 12 + length;
    if (next > input.length) throw new Error(`${relativePath} contains a truncated PNG chunk`);
    if (retainedChunks.has(type)) output.push(input.subarray(offset, next));
    offset = next;
    if (type === "IEND") {
      sawIend = true;
      break;
    }
  }
  if (!sawIend) throw new Error(`${relativePath} does not contain IEND`);
  writeFileSync(path, Buffer.concat(output));
  console.log(`Sanitized PNG metadata: ${relativePath}`);
}
