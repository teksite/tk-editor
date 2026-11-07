// `npm test`: package-level checks (SSR, exports, textarea integration) + all editor behavior suites.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { chromium } from "playwright";
import { startServer, runSuites } from "./run-editor.mjs";
import { check, results, sleep } from "./lib.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

/* ---------- 1) SSR / Node (no window) ---------- */
console.log("\n=== package: SSR / exports");
{
  const cjs = require(join(root, "dist/tk-editor.cjs"));
  check("CJS: require without a window does not crash", typeof cjs === "function" && cjs.default === cjs && typeof cjs.attach === "function");
  let msg = "";
  try { new cjs("#x"); } catch (e) { msg = e.message; }
  check("SSR: constructing an editor throws a helpful error", /only works in a browser/.test(msg), msg);
  check("SSR: attach / get / observe are harmless", Array.isArray(cjs.attach("textarea")) && cjs.get(null) === null && typeof cjs.observe("x").disconnect === "function");
  const esm = await import(pathToFileURL(join(root, "dist/tk-editor.esm.mjs")).href);
  check("ESM: import without a window does not crash + named exports", typeof esm.default === "function" && esm.ProEditor === esm.default && typeof esm.attach === "function" && typeof esm.version === "string");
  require(join(root, "dist/auto.cjs"));
  const a = await import(pathToFileURL(join(root, "dist/auto.esm.mjs")).href);
  check("auto.* is harmless during SSR", typeof a.default === "function");
  check("type definitions exist", existsSync(join(root, "types/index.d.ts")) && existsSync(join(root, "types/auto.d.ts")));
  const pj = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const missing = [];
  (function walk(o) { for (const v of Object.values(o)) typeof v === "string" ? v.startsWith("./") && !v.includes("*") && !existsSync(join(root, v)) && missing.push(v) : walk(v); })(pj.exports);
  check("every path in package.json exports exists", !missing.length, missing);
  check("no runtime dependencies", !pj.dependencies);
}

const { server, base } = await startServer();
const browser = await chromium.launch();
const newPage = async () => {
  const pg = await browser.newPage({ viewport: { width: 1000, height: 900 } });
  pg.errs = [];
  pg.on("pageerror", (e) => pg.errs.push(String(e)));
  pg.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && pg.errs.push(m.text()));
  return pg;
};

/* ---------- 2) textarea integration inside a form (UMD, minified) ---------- */
console.log("\n=== package: textarea / form integration");
{
  const pg = await newPage();
  await pg.goto(base + "/page/form.html");
  const count = await pg.evaluate(async () => {
    window.__inputs = 0;
    document.getElementById("a").addEventListener("input", () => window.__inputs++);
    window.EDS = ProEditor.attach("textarea");
    await Promise.all(EDS.map((e) => e.ready));
    return EDS.length;
  });
  check("attach('textarea') enhanced all 4 textareas", count === 4, count);
  const r = await pg.evaluate(() => {
    const a = document.getElementById("a"), b = document.getElementById("b"), c = document.getElementById("c");
    const ea = ProEditor.get(a), eb = ProEditor.get(b);
    return {
      hosts: document.querySelectorAll(".pe-host").length,
      hidden: getComputedStyle(a).opacity === "0" && a.getAttribute("aria-hidden") === "true" && a.tabIndex === -1,
      hostAfter: a.nextElementSibling.classList.contains("pe-host"),
      plain: ea.getHTML(), bMin: eb.options.minHeight, bTheme: eb.root.dataset.theme,
      bNoAudio: !eb.root.querySelector('[data-cmd="audio"]') && !eb.root.querySelector('[data-cmd="video"]'),
      cRO: ProEditor.get(c).readOnly, ph: ea.options.placeholder, aMin: ea.options.minHeight, aDir: ea.options.dir,
      same: ProEditor.attach("#a")[0] === ea, iframeTitle: ea.iframe.title,
    };
  });
  check("textarea is visually hidden but stays in the form (focusable for validation)", r.hidden && r.hostAfter && r.hosts === 4, r);
  check("plain text value becomes paragraphs (escaped)", r.plain === "<p>Plain text</p><p>Second paragraph &amp; more</p>", r.plain);
  check("data-pe-height / theme / hide are applied", r.bMin === 180 && r.bTheme === "dark" && r.bNoAudio, r);
  check("disabled textarea -> read-only editor", r.cRO === true);
  check("placeholder / rows / dir are read from the textarea and page", r.ph === "Write here" && r.aMin === 208 && r.aDir === "ltr", r);
  check("attach is idempotent", r.same && (await pg.evaluate(() => document.querySelectorAll(".pe-host").length)) === 4);
  check("<label> text becomes the iframe title", r.iframeTitle === "Article body", r.iframeTitle);
  const x = await pg.evaluate(() => ProEditor.get(document.getElementById("x")).getHTML());
  check("XSS inside a textarea is sanitized", !/onerror|script|javascript/i.test(x) && x.includes("<p>ok</p>"), x);

  await pg.evaluate(() => ProEditor.get(document.getElementById("a")).focus());
  await pg.keyboard.press("Control+a"); await pg.keyboard.type("hello <b>"); await sleep(500);
  const t1 = await pg.evaluate(() => ({ v: document.getElementById("a").value, n: window.__inputs }));
  check("typing syncs the textarea value and fires `input`", t1.v === "<p>hello &lt;b&gt;</p>" && t1.n > 0, t1);

  await pg.evaluate(() => { ProEditor.get(document.getElementById("a")).setHTML(""); window.__submitted = 0; document.getElementById("f").addEventListener("submit", () => window.__submitted++); });
  await sleep(400);
  check("empty editor -> empty value (so `required` works)", (await pg.evaluate(() => document.getElementById("a").value)) === "");
  await pg.click("#send"); await sleep(250);
  const inv = await pg.evaluate(() => ({ s: window.__submitted, cls: ProEditor.get(document.getElementById("a")).root.classList.contains("pe-invalid"), focus: ProEditor.get(document.getElementById("a")).root.classList.contains("pe-focused") }));
  check("required: submit blocked, red frame, editor focused", inv.s === 0 && inv.cls && inv.focus, inv);
  await pg.evaluate(() => ProEditor.get(document.getElementById("a")).setHTML("<p>final <strong>v</strong></p>"));
  await pg.click("#send"); await sleep(250);
  const fd = await pg.evaluate(() => { const f = new FormData(document.getElementById("f")); return { body: f.get("body"), x: f.get("x"), c: f.get("c"), s: window.__submitted }; });
  check("submit works; FormData holds the HTML (disabled field excluded, XSS removed)", fd.s === 1 && fd.body === "<p>final <strong>v</strong></p>" && fd.c === null && !/onerror/.test(fd.x), fd);
  check("pe-invalid is cleared after a change", !(await pg.evaluate(() => ProEditor.get(document.getElementById("a")).root.classList.contains("pe-invalid"))));
  await pg.click("label[for=a]"); await sleep(100);
  check("clicking the <label> focuses the editor", await pg.evaluate(() => ProEditor.get(document.getElementById("a")).root.classList.contains("pe-focused")));
  await pg.evaluate(() => document.getElementById("f").reset()); await sleep(200);
  check("form.reset() restores the initial value", (await pg.evaluate(() => ProEditor.get(document.getElementById("a")).getHTML())) === "<p>Plain text</p><p>Second paragraph &amp; more</p>");

  const d = await pg.evaluate(() => { const b = document.getElementById("b"); ProEditor.get(b).setHTML("<p>changed</p>"); ProEditor.detach(b); return { v: b.value, vis: getComputedStyle(b).opacity, has: ProEditor.get(b), tab: b.hasAttribute("tabindex"), hosts: document.querySelectorAll(".pe-host").length }; });
  check("detach: textarea restored with the new value", d.v === "<p>changed</p>" && d.vis === "1" && d.has === null && !d.tab && d.hosts === 3, d);
  const d2 = await pg.evaluate(() => { const x = document.getElementById("x"); ProEditor.get(x).destroy(); return { vis: getComputedStyle(x).opacity, hosts: document.querySelectorAll(".pe-host").length }; });
  check("editor.destroy() also restores the textarea", d2.vis === "1" && d2.hosts === 2, d2);
  const o = await pg.evaluate(async () => {
    const obs = ProEditor.observe("textarea[data-dyn]", { minHeight: 150 });
    const ta = document.createElement("textarea"); ta.dataset.dyn = ""; ta.value = "<p>dyn</p>"; document.body.append(ta);
    await new Promise((r) => setTimeout(r, 200));
    const added = !!ProEditor.get(ta) && obs.editors().length === 1;
    const before = document.querySelectorAll(".pe-host").length;
    ta.remove();
    await new Promise((r) => setTimeout(r, 200));
    const after = document.querySelectorAll(".pe-host").length;
    obs.disconnect();
    return { added, leaked: after !== before - 1, active: obs.editors().length };
  });
  check("observe(): dynamic textarea is enhanced and released when removed (no leak)", o.added && !o.leaked && o.active === 0, o);
  check("no console errors (form page)", pg.errs.length === 0, pg.errs);
  await pg.close();
}

/* ---------- 3) ESM / auto builds in a real browser ---------- */
console.log("\n=== package: ESM and auto builds");
{
  let pg = await newPage(); await pg.goto(base + "/page/esm.html"); await sleep(500);
  const r = await pg.evaluate(() => window.__r);
  check("ESM in the browser: import + attach", r && r.same && r.n === 1 && r.ver === "2.0.0", r);
  check("no errors (ESM)", pg.errs.length === 0, pg.errs); await pg.close();
  pg = await newPage(); await pg.goto(base + "/page/auto-esm.html"); await sleep(700);
  const a = await pg.evaluate(() => ({ hosts: document.querySelectorAll(".pe-host").length, h: ProEditor.get(document.getElementById("t")) && ProEditor.get(document.getElementById("t")).options.minHeight, n: ProEditor.get(document.getElementById("n")) }));
  check("auto.esm: only data-tk-editor textareas are enhanced", a.hosts === 1 && a.h === 222 && a.n === null, a);
  check("no errors (auto ESM)", pg.errs.length === 0, pg.errs); await pg.close();
  pg = await newPage(); await pg.goto(base + "/page/auto-umd.html"); await sleep(700);
  const u = await pg.evaluate(() => ({ hosts: document.querySelectorAll(".pe-host").length, sb: ProEditor.get(document.getElementById("t")).options.statusbar }));
  check("auto.umd.min: textarea after the script + PRO_EDITOR_OPTIONS", u.hosts === 1 && u.sb === false, u);
  check("no errors (auto UMD)", pg.errs.length === 0, pg.errs); await pg.close();
}

/* ---------- 4) editor behavior suites (run against dist/) ---------- */
await runSuites({ browser, base });

await browser.close();
server.close();
console.log(`\nTOTAL PASS=${results.pass} FAIL=${results.fail}`);
process.exit(results.fail ? 1 : 0);
