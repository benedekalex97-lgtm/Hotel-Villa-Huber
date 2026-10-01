// GitHub Pages-szerű helyi kiszolgáló a statikus exporthoz (out/), basePath alatt.
// Használat: node scripts/serve-static.mjs [port=3200] [basePath=/Hotel-Villa-Huber] [dir=out]
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const [, , port = "3200", base = "/Hotel-Villa-Huber", dir = "out"] = process.argv;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".json": "application/json" };

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (!url.pathname.startsWith(base)) return send(res, 404, join(dir, "404.html"));
  const rel = decodeURIComponent(url.pathname.slice(base.length)) || "/";
  const file = normalize(join(dir, rel));
  if (!file.startsWith(normalize(dir))) return send(res, 404, join(dir, "404.html"));
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!url.pathname.endsWith("/")) {
      res.writeHead(301, { Location: `${url.pathname}/${url.search}` });
      return res.end();
    }
    const index = join(file, "index.html");
    return existsSync(index) ? send(res, 200, index) : send(res, 404, join(dir, "404.html"));
  }
  if (existsSync(file)) return send(res, 200, file);
  if (existsSync(`${file}.html`)) return send(res, 200, `${file}.html`);
  return send(res, 404, join(dir, "404.html"));
}).listen(Number(port), () => console.log(`http://localhost:${port}${base}/`));

function send(res, status, file) {
  res.writeHead(status, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
}
