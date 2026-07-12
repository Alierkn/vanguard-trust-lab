(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.TrustLabLogic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const REQUIREMENTS = [
    { key: "windows", label: "Windows 11 25H2 or later" },
    { key: "secureBoot", label: "Secure Boot (UEFI mode)" },
    { key: "tpm", label: "TPM 2.0" },
    { key: "hvci", label: "VBS / HVCI (Memory Integrity)" },
    { key: "iommu", label: "IOMMU (DMA Protection)" },
  ];

  function evaluatePosture(state) {
    const confirmed = REQUIREMENTS.filter((item) => Boolean(state[item.key]));
    const missing = REQUIREMENTS.filter((item) => !state[item.key]);
    return {
      complete: missing.length === 0,
      confirmedCount: confirmed.length,
      totalCount: REQUIREMENTS.length,
      missing,
    };
  }

  function bytesToHex(buffer) {
    return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) return "Unknown size";
    if (bytes === 0) return "0 B";
    const units = ["B", "KiB", "MiB", "GiB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** index;
    return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
  }

  return { REQUIREMENTS, evaluatePosture, bytesToHex, formatBytes };
});
