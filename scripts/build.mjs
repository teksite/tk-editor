// Package build: no bundler, just ordered concatenation (+ terser for the .min files, a devDependency only)
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const ORDER = ["icons", "i18n", "utils", "core", "engine", "dialog", "text", "list", "table", "section", "media", "attach"];
const read = (f) => readFileSync(join(root, "src", f), "utf8");
const out = (f, s) => writeFileSync(join(root, "dist", f), s);

rmSync(join(root, "dist"), { recursive: true, force: true });
mkdirSync(join(root, "dist"));

let body = ORDER.map((n) => read(`pro-editor.${n}.js`)).join("\n");
if (!body.includes('ProEditor.version = "2.0.0"')) throw new Error("version string not found in core");
body = body.replace('ProEditor.version = "2.0.0"', `ProEditor.version = ${JSON.stringify(pkg.version)}`);

const banner = `/*! ProEditor v${pkg.version} | MIT | zero-dependency WYSIWYG */\n`;
const stub = `function serverStub() {
    function ProEditor() { throw new Error("ProEditor only works in a browser. During SSR call it inside useEffect / onMounted / a dynamic import (ssr:false)."); }
    ProEditor.version = ${JSON.stringify(pkg.version)};
    ProEditor.attach = function () { return []; };
    ProEditor.get = function () { return null; };
    ProEditor.detach = function () {};
    ProEditor.autoInit = function () {};
    ProEditor.observe = function () { return { disconnect: function () {}, editors: function () { return []; } }; };
    return ProEditor;
  }`;
const factory = `function (window) {
  ${stub}
  if (!window || !window.document) return serverStub();
  if (window.ProEditor && window.ProEditor.version === ${JSON.stringify(pkg.version)}) return window.ProEditor; // do not initialize twice
${body}
  return window.ProEditor;
}`;

// UMD / CommonJS
const umd = `${banner}(function (root, factory) {
  var PE = factory(typeof window !== "undefined" ? window : null);
  if (typeof module === "object" && module.exports) {
    module.exports = PE;
    module.exports.default = PE;
    module.exports.ProEditor = PE;
    ["attach", "detach", "get", "observe", "autoInit"].forEach(function (k) { module.exports[k] = PE[k]; });
  } else if (root) root.ProEditor = PE;
})(typeof self !== "undefined" ? self : this, ${factory});
`;
out("pro-editor.umd.js", umd);
out("pro-editor.cjs", umd);
out("pro-editor.auto.umd.js", umd + `;(function () { if (typeof window !== "undefined" && window.ProEditor) window.ProEditor.autoInit(); })();\n`);

// ESM
out("pro-editor.esm.mjs", `${banner}const factory = ${factory};
const ProEditor = factory(typeof window !== "undefined" ? window : null);
const { attach, detach, get, observe, autoInit, version } = ProEditor;
export default ProEditor;
export { ProEditor, attach, detach, get, observe, autoInit, version };
`);
out("auto.esm.mjs", `${banner}import ProEditor from "./pro-editor.esm.mjs";
if (typeof document !== "undefined") ProEditor.autoInit();
export default ProEditor;
export { ProEditor };
`);
out("auto.cjs", `${banner}"use strict";
const P = require("./pro-editor.cjs");
if (typeof document !== "undefined") P.autoInit();
module.exports = P;
`);

// CSS (conservative minification; spaces inside calc() and selectors are preserved)
const css = read("pro-editor.css");
out("pro-editor.css", css);
out("pro-editor.min.css", css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{};,])\s*/g, "$1").replace(/;}/g, "}").trim() + "\n");

// min
let terser = null;
try { terser = await import("terser"); } catch { console.warn("terser is not installed; .min files were not built (run npm install)"); }
if (terser) {
  for (const f of ["pro-editor.umd", "pro-editor.auto.umd"]) {
    const r = await terser.minify(readFileSync(join(root, "dist", f + ".js"), "utf8"), { compress: { passes: 2 }, mangle: true, format: { ascii_only: false, comments: /^!/ } });
    out(f + ".min.js", r.code + "\n");
  }
}
console.log("✓ dist built (v" + pkg.version + ")");
