import { extname } from "node:path";

export const publicTextExtensions = new Set([
  "",
  ".cjs",
  ".cff",
  ".css",
  ".csv",
  ".html",
  ".js",
  ".json",
  ".lock",
  ".md",
  ".mjs",
  ".txt",
  ".yaml",
  ".yml",
]);

const decodedRegex = (encoded) => new RegExp(Buffer.from(encoded, "base64").toString("utf8"), "i");

export const restrictedMetadataPatterns = [
  { label: "restricted identifier label", regex: decodedRegex("bWF0cmljb2xh") },
  { label: "restricted institutional domain", regex: decodedRegex("KHN0dWRlbnRpXC4pP3VuaW1lXC5pdA==") },
  { label: "local macOS home path", regex: decodedRegex("L1VzZXJzLw==") },
  { label: "local Windows home path", regex: /[A-Za-z]:\\Users\\/i },
  { label: "private learning portal", regex: decodedRegex("bW9vZGxl") },
  { label: "private document portal", regex: decodedRegex("c2hhcmVwb2ludFwuY29t") },
  { label: "institutional project code", regex: decodedRegex("U0VDLVBSSi0=") },
  { label: "email address", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
];

export const restrictedAuthoringPatterns = [
  "Y29kZXgtc2VjdXJpdHk=",
  "LnN1cGVycG93ZXJz",
  "LmNvZGV4",
  "LmFnZW50cw==",
  "dGFzay1icmllZg==",
  "c3ViYWdlbnQ=",
  "aW1wbGVtZW50YXRpb24gaGFuZG9mZg==",
].map((encoded, index) => ({ label: `restricted authoring marker ${index + 1}`, regex: decodedRegex(encoded) }));

export function isPublicTextPath(path) {
  return publicTextExtensions.has(extname(path).toLowerCase());
}

export function findRestrictedContent(text, patterns) {
  return patterns.filter(({ regex }) => regex.test(text)).map(({ label }) => label);
}
