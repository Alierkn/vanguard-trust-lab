import { createReadStream, realpathSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicRoot = resolve(process.env.PUBLIC_ROOT || join(repositoryRoot, "app"));
const canonicalPublicRoot = realpathSync(publicRoot);
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 8000);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".md", "text/markdown; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
]);

function safePath(requestUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, `http://${host}:${port}`).pathname);
  } catch {
    return { status: 400 };
  }
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const candidate = resolve(publicRoot, normalize(relative));
  if (!(candidate === publicRoot || candidate.startsWith(`${publicRoot}${sep}`))) return { status: 403 };
  try {
    let filePath = candidate;
    if (statSync(filePath).isDirectory()) filePath = join(filePath, "index.html");
    const canonicalPath = realpathSync(filePath);
    if (!(canonicalPath === canonicalPublicRoot || canonicalPath.startsWith(`${canonicalPublicRoot}${sep}`))) return { status: 403 };
    if (!statSync(canonicalPath).isFile()) return { status: 404 };
    return { path: canonicalPath, status: 200 };
  } catch {
    return { status: 404 };
  }
}

const server = createServer((request, response) => {
  if (!request.url || !["GET", "HEAD"].includes(request.method || "")) {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end("Method not allowed\n");
    return;
  }

  const result = safePath(request.url);
  if (result.status !== 200) {
    const messages = new Map([[400, "Bad request\n"], [403, "Forbidden\n"], [404, "Not found\n"]]);
    response.writeHead(result.status, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(messages.get(result.status));
    return;
  }
  const filePath = result.path;

  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'; worker-src 'none'; manifest-src 'none'; frame-ancestors 'none'",
    "Content-Type": contentTypes.get(extname(filePath).toLowerCase()) || "application/octet-stream",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });

  if (request.method === "HEAD") {
    response.end();
  } else {
    createReadStream(filePath).pipe(response);
  }
});

server.listen(port, host, () => {
  const address = server.address();
  const listeningPort = typeof address === "object" && address ? address.port : port;
  console.log(`Vanguard Host Trust demonstrator: http://${host}:${listeningPort}`);
  console.log("Press Ctrl+C to stop.");
});
