// Runs the editor behavior suites against the built dist/ files (what actually ships).
import { createServer } from "node:http";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, extname } from "node:path";
import { chromium } from "playwright";
import { results } from "./lib.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css" };
const CSP_PAGE = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; frame-src 'self'; require-trusted-types-for 'script'; trusted-types tk-editor";

export async function startServer() {
  const server = createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const file = url.startsWith("/page/") ? join(root, "test/pages", url.slice(6)) : join(root, url);
    if (!file.startsWith(root) || !existsSync(file)) { res.writeHead(404); return res.end(); }
    const headers = { "content-type": MIME[extname(file)] || "application/octet-stream" };
    if (url === "/page/csp.html") headers["content-security-policy"] = CSP_PAGE;
    res.writeHead(200, headers);
    res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, r));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}

export async function runSuites(ctx, only) {
  const files = readdirSync(join(root, "test/suites")).filter((f) => f.endsWith(".mjs") && (!only || f.includes(only))).sort();
  for (const f of files) {
    console.log("\n=== suite: " + f);
    await (await import(pathToFileURL(join(root, "test/suites", f)).href)).run(ctx);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { server, base } = await startServer();
  const browser = await chromium.launch();
  await runSuites({ browser, base }, process.argv[2]);
  await browser.close();
  server.close();
  console.log(`\nEDITOR TOTAL PASS=${results.pass} FAIL=${results.fail}`);
  process.exit(results.fail ? 1 : 0);
}
