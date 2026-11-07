import { check } from "../lib.mjs";

// The page is served with a strict CSP header: no inline scripts/styles and Trusted Types enforced
// (only the "pro-editor" policy is allowed). The editor must work without a single violation.
export async function run(ctx) {
  const page = await ctx.browser.newPage({ viewport: { width: 1000, height: 800 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push("PAGEERR " + e));
  page.on("console", (m) => m.type() === "error" && errs.push("CONSOLE " + m.text()));
  await page.addInitScript(() => {
    window.__violations = [];
    document.addEventListener("securitypolicyviolation", (e) => window.__violations.push(e.violatedDirective + " :: " + (e.sample || e.blockedURI)));
  });
  await page.goto(ctx.base + "/page/csp.html");
  const r = await page.evaluate(async () => {
    const [ed] = ProEditor.attach("#t");
    await ed.ready;
    ed.focus();
    ed.command("link");
    await new Promise((r) => setTimeout(r, 200));
    const dialogOpen = !!document.querySelector("dialog[open]");
    document.querySelector("dialog[open] [data-close]").click();
    ed.setHTML("<p>one</p><table><tbody><tr><td>x</td></tr></tbody></table><section><p>s</p></section>");
    ed.command("source"); ed.command("source");
    const r = ed.doc.createRange(); r.selectNodeContents(ed.body.firstChild); ed.setRange(r); ed.command("bold");
    await new Promise((r) => setTimeout(r, 400));
    return { dialogOpen, html: ed.getHTML(), styled: ed.doc.adoptedStyleSheets.length === 1 || !!ed.doc.querySelector("style"), tt: !!window.trustedTypes, v: window.__violations };
  });
  check("strict CSP + Trusted Types: editor, dialog, source view and commands work", r.dialogOpen && r.html.startsWith("<p><strong>one</strong></p>") && r.styled, r);
  check("no CSP / Trusted Types violations were reported", r.v.length === 0, r.v);
  check("no console errors under strict CSP", errs.length === 0, errs);
  // negative control: prove the page really enforces the policy (so the checks above are meaningful)
  const control = await page.evaluate(async () => {
    let tt = false;
    try { document.body.innerHTML = "<b>x</b>"; } catch (e) { tt = true; }
    const d = document.createElement("div"); d.setAttribute("style", "color:red"); document.body.append(d);
    await new Promise((r) => setTimeout(r, 100));
    return { tt, styleViolation: window.__violations.some((v) => /style-src-attr/.test(v)) };
  });
  check("control: the page really enforces Trusted Types and style-src", control.tt && control.styleViolation, control);
  await page.close();
}
