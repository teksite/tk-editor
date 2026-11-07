// Shared helpers for the browser test suites.
export const results = { pass: 0, fail: 0 };
export function check(name, cond, info = "") {
  cond ? results.pass++ : results.fail++;
  console.log((cond ? "PASS " : "FAIL ") + name + (cond ? "" : "  -> " + JSON.stringify(info).slice(0, 400)));
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Opens /page/editor.html and creates `window.E` (a ProEditor with the given options source string)
export async function openEditor(ctx, opts = "{}", pageName = "editor.html") {
  const page = await ctx.browser.newPage({ viewport: { width: 1100, height: 900 } });
  page.errs = [];
  page.on("pageerror", (e) => page.errs.push("PAGEERR " + e + " :: " + (e.stack || "")));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource/.test(m.text())) page.errs.push("CONSOLE " + m.text());
  });
  await page.goto(ctx.base + "/page/" + pageName);
  await page.evaluate(async (o) => {
    window.E = new ProEditor("#host", Object.assign({ minHeight: 200 }, eval("(" + o + ")")));
    await E.ready;
  }, opts);
  const ed = {
    page,
    html: () => page.evaluate("E.getHTML()"),
    raw: () => page.evaluate("E.body.innerHTML"),
    set: (h) => page.evaluate((h) => { E.setHTML(h); E.focus(); }, h),
    // select inside the idx-th text node containing `text`
    selText: (text, start = 0, end = null, idx = 0) =>
      page.evaluate(([t, s, e, i]) => {
        const w = E.doc.createTreeWalker(E.body, NodeFilter.SHOW_TEXT);
        let n, c = 0;
        while ((n = w.nextNode())) if (n.nodeValue.includes(t) && c++ === i) break;
        const r = E.doc.createRange();
        const b = n.nodeValue.indexOf(t);
        r.setStart(n, b + s);
        r.setEnd(n, b + (e == null ? t.length : e));
        E.setRange(r);
      }, [text, start, end, idx]),
    caretAt: (text, off) =>
      page.evaluate(([t, o]) => {
        const w = E.doc.createTreeWalker(E.body, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = w.nextNode())) if (n.nodeValue.includes(t)) break;
        const r = E.doc.createRange();
        r.setStart(n, n.nodeValue.indexOf(t) + o);
        r.collapse(true);
        E.setRange(r);
      }, [text, off]),
    // select all content of the n-th top-level child
    selNode: (n) => page.evaluate((n) => { const r = E.doc.createRange(); r.selectNodeContents(E.body.children[n]); E.setRange(r); }, n),
    selAcross: (a, ao, b, bo) =>
      page.evaluate(([a, ao, b, bo]) => {
        const r = E.doc.createRange();
        r.setStart(E.body.children[a].firstChild, ao);
        r.setEnd(E.body.children[b].firstChild, bo);
        E.setRange(r);
      }, [a, ao, b, bo]),
    cmd: (c) => page.evaluate((c) => E.command(c), c),
    key: (k) => page.keyboard.press(k),
    type: (t) => page.keyboard.type(t),
    insertImg: () => page.evaluate(() => { const i = E.doc.createElement("img"); i.setAttribute("src", "a.png"); i.setAttribute("alt", "x"); E.insertInline(i); }),
    insertVideo: () => page.evaluate(() => { const v = E.doc.createElement("video"); v.setAttribute("src", "v.mp4"); E.insertBlockObject(v); }),
    dlg: () => page.locator("dialog.pe-dialog[open]"),
    close: () => page.close(),
  };
  return ed;
}
