import { check, openEditor } from "../lib.mjs";

export async function run(ctx) {
  const e = await openEditor(ctx);
  const { page } = e;
  const big = Array.from({ length: 3000 }, (_, i) => `<p>Paragraph ${i} with <strong>bold text</strong> and <em>italic</em> and a long text for the performance test of the editor.</p>`).join("");
  const t = await page.evaluate((b) => { const t = performance.now(); E.setHTML(b); return performance.now() - t; }, big);
  console.log(`   setHTML (3000 paragraphs): ${t.toFixed(0)} ms`);
  const g = await page.evaluate(() => { const t = performance.now(); const x = E.getHTML(); return [performance.now() - t, x.length]; });
  console.log(`   getHTML: ${g[0].toFixed(0)} ms (${g[1]} chars)`);
  check("getHTML on a big document < 800 ms", g[0] < 800, g);
  const f = await page.evaluate(() => { E.focus(); const r = E.doc.createRange(); r.selectNodeContents(E.body); E.setRange(r); const t = performance.now(); E.toggleFormat("underline"); return performance.now() - t; });
  console.log(`   underline on select-all: ${f.toFixed(0)} ms`);
  check("select-all formatting < 2500 ms", f < 2500, f);
  const u = await page.evaluate(() => { const t = performance.now(); E.undo(); return performance.now() - t; });
  check("undo on a big document < 400 ms", u < 400, u);
  // per-keystroke cost of the editor's own handlers (not Playwright overhead)
  await page.evaluate(() => { E.focus(); const p = E.body.children[1500]; const r = E.doc.createRange(); r.setStart(p.firstChild, 3); r.collapse(true); E.setRange(r); });
  const per = await page.evaluate(() => {
    const t = performance.now();
    for (let i = 0; i < 40; i++) { E.body.children[1500].firstChild.insertData(3, "x"); E._afterEdit(); }
    return (performance.now() - t) / 40;
  });
  console.log(`   editor work per keystroke (3000 blocks): ${per.toFixed(2)} ms`);
  check("per-keystroke handler cost < 5 ms on a 3000-block document", per < 5, per);
  const h = await page.evaluate(() => { for (let i = 0; i < 30; i++) { E.body.children[i].append("z"); E.pushHistory(true); } return [E.history.length, E._historySize]; });
  check("history memory is bounded", h[1] < 9e6 || h[0] <= 3, h);
  const many = await page.evaluate(async () => {
    const eds = [];
    for (let i = 0; i < 5; i++) { const d = document.createElement("div"); document.body.append(d); const ed = new ProEditor(d, {}); await ed.ready; eds.push(ed); }
    const out = eds.map((ed, i) => (ed.setHTML("<p>" + i + "</p>"), ed.getHTML()));
    eds.forEach((ed) => ed.destroy());
    return out;
  });
  check("5 independent editors + destroy", JSON.stringify(many) === JSON.stringify(["<p>0</p>", "<p>1</p>", "<p>2</p>", "<p>3</p>", "<p>4</p>"]), many);
  check("no console errors", e.page.errs.length === 0, e.page.errs);
  await e.close();
}
