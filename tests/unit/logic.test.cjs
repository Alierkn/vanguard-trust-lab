const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const test = require("node:test");
const { REQUIREMENTS, evaluatePosture, bytesToHex, formatBytes } = require("../../app/logic.js");

const SAMPLE_A = "Vanguard Host Trust educational sample\nVersion: 1\nIntegrity means detecting unauthorized change.\n";
const SAMPLE_B = "Vanguard Host Trust educational sample\nVersion: 2\nIntegrity means detecting unauthorized change.\n";

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
    "98e1521a889fa6ef3e88b60a125bd569f0b6a9c228a4b492e902ef6b2c8e7c9a"
  );
  assert.equal(
    createHash("sha256").update(SAMPLE_B).digest("hex"),
    "677197ccc10c1da9241d73ec32413cc125e0fd89616ca6c4637247b85f7e5588"
  );
});
