const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const test = require("node:test");
const { REQUIREMENTS, evaluatePosture, bytesToHex, formatBytes } = require("../../app/logic.js");

const SAMPLE_A = "Vanguard Trust Lab educational sample\nVersion: 1\nIntegrity means detecting unauthorized change.\n";
const SAMPLE_B = "Vanguard Trust Lab educational sample\nVersion: 2\nIntegrity means detecting unauthorized change.\n";

const emptyState = Object.fromEntries(REQUIREMENTS.map(({ key }) => [key, false]));
const fullState = Object.fromEntries(REQUIREMENTS.map(({ key }) => [key, true]));

test("posture logic handles empty, partial, and complete states", () => {
  const empty = evaluatePosture(emptyState);
  assert.equal(empty.complete, false);
  assert.equal(empty.confirmedCount, 0);
  assert.equal(empty.missing.length, 5);

  const full = evaluatePosture(fullState);
  assert.equal(full.complete, true);
  assert.equal(full.confirmedCount, 5);
  assert.equal(full.missing.length, 0);

  const partial = evaluatePosture({ ...emptyState, windows: true, tpm: true, iommu: true });
  assert.equal(partial.complete, false);
  assert.equal(partial.confirmedCount, 3);
  assert.deepEqual(partial.missing.map(({ key }) => key), ["secureBoot", "hvci"]);
});

test("byte helpers produce stable display values", () => {
  assert.equal(bytesToHex(Uint8Array.from([0, 1, 15, 16, 255]).buffer), "00010f10ff");
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(1024), "1.0 KiB");
  assert.equal(formatBytes(50 * 1024 * 1024), "50 MiB");
});

test("fixed samples retain their registered SHA-256 digests", () => {
  assert.equal(
    createHash("sha256").update(SAMPLE_A).digest("hex"),
    "6af1022470965f08d997eb048309a6b95b898289e19f224df7a3e91604ff004b"
  );
  assert.equal(
    createHash("sha256").update(SAMPLE_B).digest("hex"),
    "7240f01f4de745ed075feea3edd5d02c8632979050f31126faf3c5cfd44c10a6"
  );
});
