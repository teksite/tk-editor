import { check, openEditor, sleep } from "../lib.mjs";

export async function run(ctx) {
  const e = await openEditor(ctx);
  const { page } = e;

  // ---- inline formats
  await e.set("<p>hello world foo</p>"); await e.selText("world"); await e.cmd("bold");
  check("bold wraps the selection", (await e.html()) === "<p>hello <strong>world</strong> foo</p>", await e.html());
  await e.selText("world"); await e.cmd("bold");
  check("bold toggles off", (await e.html()) === "<p>hello world foo</p>", await e.html());
  await e.set("<p><strong>aaa bbb ccc</strong></p>"); await e.selText("bbb"); await e.cmd("bold");
  check("un-bold the middle splits the strong", (await e.html()) === "<p><strong>aaa </strong>bbb<strong> ccc</strong></p>", await e.html());
  await e.set("<p>a <strong>b</strong> c</p>"); await e.selNode(0); await e.cmd("italic");
  check("italic across mixed content (semantically complete)", (await page.evaluate("[...E.body.querySelectorAll('em')].map(x=>x.textContent).join('')")) === "a b c" && (await e.html()).split("<strong>").length === 2, await e.html());
  await e.set("<p>one</p><p>two</p>"); await e.selAcross(0, 1, 1, 2); await e.cmd("bold");
  check("bold across two blocks", (await e.html()) === "<p>o<strong>ne</strong></p><p><strong>tw</strong>o</p>", await e.html());
  await e.set("<p>x</p>"); await e.selText("x"); await e.cmd("bold"); await sleep(80);
  check("aria-pressed reflects the state", (await page.evaluate("E.toolbar.querySelector('[data-cmd=bold]').getAttribute('aria-pressed')")) === "true");
  await e.set("<p>ab</p>"); await e.caretAt("ab", 2); await e.cmd("bold"); await e.type("XY");
  check("caret mode: bold typing", (await e.html()) === "<p>ab<strong>XY</strong></p>", await e.html());
  await e.cmd("bold"); await e.type("Z");
  check("caret mode: bold off", (await e.html()) === "<p>ab<strong>XY</strong>Z</p>", await e.html());

  // ---- sub / sup (regression: sub used to nest inside sup / not apply at a collapsed caret)
  await e.set("<p>x2</p>"); await e.selText("2"); await e.cmd("sup"); await e.selText("2"); await e.cmd("sub");
  check("selection: sub replaces sup", (await e.html()) === "<p>x<sub>2</sub></p>", await e.html());
  await e.set("<p>x</p>"); await e.caretAt("x", 1); await e.cmd("sup"); await e.type("2"); await e.cmd("sub"); await e.type("3");
  check("caret: sup then sub gives separate <sup>2</sup><sub>3</sub>", (await e.html()) === "<p>x<sup>2</sup><sub>3</sub></p>", await e.html());
  await e.set("<p>H2O</p>"); await e.selText("2");
  await page.locator('[data-cmd="moreMenu"]').click(); await page.locator('.pe-menu-item[data-cmd="sub"]').click(); await sleep(80);
  check("More menu: Subscript applies <sub>", (await e.html()) === "<p>H<sub>2</sub>O</p>", await e.html());
  await page.locator('[data-cmd="moreMenu"]').click(); await page.locator('.pe-menu-item[data-cmd="sup"]').click(); await sleep(80);
  check("More menu: Superscript switches to <sup>", (await e.html()) === "<p>H<sup>2</sup>O</p>", await e.html());
  check("<sub>/<sup> render with real vertical-align", await page.evaluate(() => { E.setHTML("<p>a<sub>1</sub><sup>2</sup></p>"); const cs = (t) => E.win.getComputedStyle(E.body.querySelector(t)).verticalAlign; return cs("sub") === "sub" && cs("sup") === "super"; }));

  await e.set("<p><strong><em>aa</em></strong> bb</p>"); await e.selNode(0); await e.cmd("clearFormat");
  check("clear formatting", (await e.html()) === "<p>aa bb</p>", await e.html());
  await e.set("<p>red text</p>"); await e.selText("red"); await page.evaluate("E.applyColor('#ff0000')");
  check("color via span", (await e.html()).includes('<span style="color: rgb(255, 0, 0);">red</span> text'), await e.html());

  // ---- blocks
  await e.set("<p>title</p><p>body</p>"); await e.caretAt("title", 2); await page.evaluate("E.applyBlock('h2')");
  check("p -> h2", (await e.html()) === "<h2>title</h2><p>body</p>", await e.html());
  await e.set("<p>q1</p><p>q2</p>"); await e.selAcross(0, 0, 1, 2); await e.cmd("blockquote");
  check("blockquote wraps two blocks", (await e.html()) === "<blockquote><p>q1</p><p>q2</p></blockquote>", await e.html());
  await e.caretAt("q1", 1); await e.cmd("blockquote");
  check("blockquote unwraps", (await e.html()) === "<p>q1</p><p>q2</p>", await e.html());
  await e.set("<p>a</p><p>b</p>"); await e.caretAt("a", 0); await page.evaluate("E.setAlign('center')"); await page.evaluate("E.toggleDir()");
  check("align + direction", (await e.html()) === '<p style="text-align: center;" dir="rtl">a</p><p>b</p>', await e.html());

  // ---- Enter behaviours
  await e.set("<p>abcdef</p>"); await e.caretAt("abcdef", 3); await e.key("Enter");
  check("Enter splits a paragraph", (await e.html()) === "<p>abc</p><p>def</p>", await e.html());
  await e.type("X");
  check("caret lands in the new block", (await e.html()) === "<p>abc</p><p>Xdef</p>", await e.html());
  await e.set("<h2>head</h2>"); await e.caretAt("head", 4); await e.key("Enter"); await e.type("n");
  check("Enter at the end of h2 starts a <p>", (await e.html()) === "<h2>head</h2><p>n</p>", await e.html());
  await e.set("<p>a</p>"); await e.caretAt("a", 1); await e.key("Shift+Enter"); await e.type("b");
  check("Shift+Enter inserts <br>", (await e.html()) === "<p>a<br>b</p>", await e.html());
  await e.set("<p>a</p>"); await e.caretAt("a", 1); await e.key("Control+Enter"); await e.type("c");
  check("Ctrl+Enter inserts <br>", (await e.html()) === "<p>a<br>c</p>", await e.html());
  await e.set("<section><p>in</p></section>"); await e.caretAt("in", 2); await e.key("Enter"); await e.key("Enter"); await e.type("out");
  check("double Enter leaves a section", (await e.html()) === "<section><p>in</p></section><p>out</p>", await e.html());

  // ---- lists
  await e.set("<p>a</p><p>b</p>"); await e.selAcross(0, 0, 1, 1); await e.cmd("ul");
  check("two paragraphs -> bulleted list", (await e.html()) === "<ul><li>a</li><li>b</li></ul>", await e.html());
  await e.cmd("ol"); check("ul -> ol", (await e.html()) === "<ol><li>a</li><li>b</li></ol>", await e.html());
  await e.cmd("ol"); check("list removed", (await e.html()) === "<p>a</p><p>b</p>", await e.html());
  await e.set("<ul><li>one</li><li>two</li><li>three</li></ul>"); await e.caretAt("two", 3); await e.key("Enter"); await e.type("x");
  check("Enter inside a list item", (await e.html()) === "<ul><li>one</li><li>two</li><li>x</li><li>three</li></ul>", await e.html());
  await e.key("Enter"); await e.key("Enter"); await e.type("after");
  check("Enter on an empty item leaves the list", (await e.html()) === "<ul><li>one</li><li>two</li><li>x</li></ul><p>after</p><ul><li>three</li></ul>", await e.html());
  await e.set("<ul><li>one</li><li>two</li></ul>"); await e.caretAt("two", 1); await e.key("Tab");
  check("Tab indents", (await e.html()) === "<ul><li>one<ul><li>two</li></ul></li></ul>", await e.html());
  await e.key("Shift+Tab"); check("Shift+Tab outdents", (await e.html()) === "<ul><li>one</li><li>two</li></ul>", await e.html());
  await e.set("<ul><li>one</li></ul>"); await e.caretAt("one", 1); await page.evaluate("E.applyListMarker('square')");
  check("list marker", (await e.html()).includes("list-style-type: square"), await e.html());

  // ---- undo / redo
  await e.set("<p>start</p>"); await e.caretAt("start", 5); await e.type(" typed"); await sleep(500);
  await e.selText("typed"); await e.cmd("bold");
  await e.key("Control+z"); check("undo bold", (await e.html()) === "<p>start typed</p>", await e.html());
  await e.key("Control+z"); check("undo typing", (await e.html()) === "<p>start</p>", await e.html());
  await e.key("Control+Shift+z"); check("redo typing", (await e.html()) === "<p>start typed</p>", await e.html());
  await e.key("Control+y"); check("redo bold", (await e.html()) === "<p>start <strong>typed</strong></p>", await e.html());
  await e.set("<p>kbd</p>"); await e.selText("kbd"); await e.key("Control+b"); await e.key("Control+i"); await e.key("Control+u");
  const k = await e.html();
  check("Ctrl+B / I / U", ["strong", "em", "<u>"].every((t) => k.includes(t)), k);
  await e.set("<p>aa</p><p>bb</p>"); await e.caretAt("bb", 0); await e.key("Backspace");
  check("Backspace merges blocks cleanly", (await e.html()) === "<p>aabb</p>", await e.html());

  // ---- regression: caret AFTER the placeholder <br> of an empty block
  await e.set("<p><br></p>"); await page.evaluate(() => { const p = E.body.firstChild; const r = E.doc.createRange(); r.setStart(p, 1); r.collapse(true); E.setRange(r); });
  await e.cmd("bold"); await e.type("X");
  check("empty paragraph, caret after <br>: bold typing leaves no stray <br>", (await e.html()) === "<p><strong>X</strong></p>", await e.html());

  check("no console errors", e.page.errs.length === 0, e.page.errs);
  await e.close();
}
