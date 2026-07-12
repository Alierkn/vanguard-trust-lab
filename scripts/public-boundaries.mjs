export const forbiddenPublicBinaryExtensions = new Set([
  ".7z",
  ".bz2",
  ".deb",
  ".dmg",
  ".doc",
  ".docx",
  ".exe",
  ".gz",
  ".jar",
  ".key",
  ".msi",
  ".numbers",
  ".odp",
  ".ods",
  ".odt",
  ".pages",
  ".pdf",
  ".pkg",
  ".ppt",
  ".pptx",
  ".rar",
  ".rpm",
  ".tar",
  ".tgz",
  ".war",
  ".xls",
  ".xlsb",
  ".xlsm",
  ".xlsx",
  ".xz",
  ".zip",
]);

const startsWith = (buffer, bytes) => buffer.length >= bytes.length && bytes.every((value, index) => buffer[index] === value);

export function detectForbiddenBinarySignature(buffer) {
  if (startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]) || startsWith(buffer, [0x50, 0x4b, 0x05, 0x06]) || startsWith(buffer, [0x50, 0x4b, 0x07, 0x08])) return "ZIP/Office archive";
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "PDF";
  if (startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return "legacy Office compound document";
  if (startsWith(buffer, [0x1f, 0x8b])) return "gzip archive";
  if (startsWith(buffer, [0x42, 0x5a, 0x68])) return "bzip2 archive";
  if (startsWith(buffer, [0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00])) return "xz archive";
  if (startsWith(buffer, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c])) return "7z archive";
  if (startsWith(buffer, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07])) return "RAR archive";
  if (startsWith(buffer, [0x4d, 0x5a])) return "Windows executable";
  if (buffer.length >= 262 && buffer.subarray(257, 262).toString("ascii") === "ustar") return "tar archive";
  return null;
}
