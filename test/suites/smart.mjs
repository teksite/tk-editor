import { check, openEditor, sleep } from "../lib.mjs";

export async function run(ctx) {
  const e = await openEditor(ctx);
  const { page } = e;
  const html = () => e.html();

  /* ===== (2) smart paragraphs: no pointless <p> ===== */
  await e.set("<p><br></p>"); await e.insertImg();
  check("image in an empty paragraph replaces it (no <p> wrapper)", (await html()) === '<img src="a.png" alt="x">', await html());
  await e.type("abc"); await sleep(50);
  check("typing next to a bare image wraps image + text in a <p>", (await html()) === '<p><img src="a.png" alt="x">abc</p>', await html());
  await e.set("<p>hello</p>"); await e.caretAt("hello", 2); await e.insertImg();
  check("image in the middle of text stays inline inside the <p>", (await html()) === '<p>he<img src="a.png" alt="x">llo</p>', await html());
  await e.set("<p><br></p>"); await e.insertVideo();
  check("video in an empty paragraph: no <p>", (await html()) === '<video src="v.mp4"></video>', await html());
  await e.set("<p>text</p>"); await e.caretAt("text", 2); await e.insertVideo();
  check("video after a text paragraph is a sibling, not wrapped", (await html()) === '<p>text</p><video src="v.mp4"></video>', await html());
  await e.set("<p><br></p>"); await page.evaluate("E.insertBreak()");
  check("<br> in an empty paragraph replaces the <p> (placeholder is not exported)", (await html()) === "<br>" && (await e.raw()).includes("data-pe-ph"), [await html(), await e.raw()]);
  await e.key("Enter");
  check("Enter after a bare <br> starts a paragraph and drops the placeholder", (await e.raw()) === "<br><p><br></p>", await e.raw());
  await e.set('<img src="a.png" alt="x">');
  check("a bare image survives a setHTML/getHTML round trip", (await html()) === '<img src="a.png" alt="x">', await html());
  await e.set('hello <img src="a.png" alt="x"> world');
  check("text + image run is wrapped in a <p>", (await html()) === '<p>hello <img src="a.png" alt="x"> world</p>', await html());
  await e.set("<p><br></p>"); await e.cmd("bold"); await e.type("B");
  check("text formatting in an empty paragraph keeps the <p>", (await html()) === "<p><strong>B</strong></p>", await html());
  await e.set("<p><br></p>"); await e.insertImg(); await page.evaluate("E._selectMedia(E.body.querySelector('img'))");
  check("<a> around a bare image (object link) needs no <p>", (await page.evaluate(() => (E.linkTo("https://x.com"), E.getHTML()))) === '<a href="https://x.com"><img src="a.png" alt="x"></a>', await html());
  await e.set("<p><br></p>");
  await page.evaluate(() => { const a = E.doc.createElement("a"); a.textContent = "Go"; a.setAttribute("href", "https://x.io"); E.insertInline(a); });
  check("<a> with text keeps the <p>", (await html()) === '<p><a href="https://x.io">Go</a></p>', await html());
  await e.set("<p>one</p>"); await e.insertImg(); await page.evaluate("E._selectMedia(E.body.querySelector('img'))"); await e.key("Enter");
  check("Enter with a selected image does not delete it", (await html()).includes("<img"), await html());
  await e.set('<p>x</p><img src="a.png" alt="x">'); await e.selNode(0); await e.cmd("bold");
  check("commands next to bare media still work", (await html()).includes("<strong>x</strong>"), await html());
  await e.set('<img src="a.png" alt="x">'); await page.evaluate("E._selectMedia(E.body.querySelector('img'))"); await e.cmd("ul");
  check("block commands materialize a <p> for loose content", (await html()).startsWith("<ul><li><img"), await html());

  const always = await openEditor(ctx, "{paragraphs:'always'}");
  await always.set("<p><br></p>"); await always.insertImg();
  check('paragraphs:"always" keeps the classic <p> wrapper', (await always.html()) === '<p><img src="a.png" alt="x"></p>', await always.html());
  await always.close();

  /* ===== (3) leaving inline tags with the arrow keys ===== */
  for (const dir of ["ltr", "rtl"]) {
    await page.evaluate((d) => { E.root.dir = d; E.doc.documentElement.dir = d; }, dir);
    const fwd = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const back = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    await e.set("<p>aa <q>quote</q></p>"); await e.caretAt("quote", 5); await e.key(fwd); await e.type("X");
    check(`[${dir}] arrow leaves <q> at the end of the block`, (await html()) === "<p>aa <q>quote</q>X</p>", await html());
    await e.set("<p>aa <q>quote</q> bb</p>"); await e.caretAt("quote", 5); await e.key(fwd); await e.type("X");
    check(`[${dir}] arrow leaves <q> when text follows`, (await html()).includes("<q>quote</q>X"), await html());
    await e.set("<p><q>quote</q> bb</p>"); await e.caretAt("quote", 0); await e.key(back); await e.type("X");
    check(`[${dir}] backward arrow leaves <q> at its start`, (await html()) === "<p>X<q>quote</q> bb</p>", await html());
  }
  await page.evaluate(() => { E.root.dir = "ltr"; E.doc.documentElement.dir = "ltr"; });
  await e.set("<p>a <strong><em>deep</em></strong>z</p>"); await e.caretAt("deep", 4); await e.key("ArrowRight"); await e.type("X");
  check("one arrow leaves nested inline elements together", (await html()) === "<p>a <strong><em>deep</em></strong>Xz</p>", await html());
  await e.set('<p>go <a href="https://x.io">link</a></p>'); await e.caretAt("link", 4); await e.key("ArrowRight"); await e.type(" more");
  check("links can be left with the arrow key", (await html()) === '<p>go <a href="https://x.io">link</a> more</p>', await html());
  await e.set("<p>a <code>c</code></p>"); await e.caretAt("c", 1); await e.key("ArrowRight"); await e.type("t");
  check("inline code can be left with the arrow key", (await html()) === "<p>a <code>c</code>t</p>", await html());
  await e.set("<p>aa <q>quote</q> bb</p>"); await e.caretAt("quote", 5); await e.key("ArrowRight");
  check("toolbar shows the format as off after leaving", await page.evaluate(() => !E.isFormatActive("q")));

  /* ===== (6) leaving <pre> ===== */
  await e.set("<pre>code</pre>"); await e.caretAt("code", 4); await e.key("Enter");
  check("first Enter in <pre> adds a line (placeholder, not exported)", (await e.raw()).includes("<br>"), await e.raw());
  await e.key("Enter"); await e.type("after");
  check("second Enter at the end leaves <pre>", (await html()) === "<pre>code</pre><p>after</p>", await html());
  await e.set("<pre>a</pre>"); await e.caretAt("a", 1); await e.key("ArrowDown"); await e.type("x");
  check("ArrowDown at the end of the last <pre> creates a paragraph", (await html()) === "<pre>a</pre><p>x</p>", await html());
  await e.set("<pre>a</pre>"); await e.caretAt("a", 0); await e.key("ArrowUp"); await e.type("x");
  check("ArrowUp at the start of the first <pre> creates a paragraph before it", (await html()) === "<p>x</p><pre>a</pre>", await html());
  await e.set("<pre>a</pre>"); await e.caretAt("a", 1); await e.key("Shift+Enter"); await e.type("b");
  check("Shift+Enter stays inside <pre>; newlines are exported as \\n", (await html()) === "<pre>a\nb</pre>", await html());
  await e.set("<p>```</p>"); await e.caretAt("```", 3); await e.key("Enter"); await e.type("code");
  check("```+Enter creates a code block", (await html()) === "<pre>code</pre>", await html());

  /* ===== (7) <p> / <h1-h6> inside <li> (and table cells) ===== */
  await e.set("<ul><li>item</li></ul>"); await e.caretAt("item", 2); await page.evaluate("E.applyBlock('h2')");
  check("heading inside a list item", (await html()) === "<ul><li><h2>item</h2></li></ul>", await html());
  await page.evaluate("E.applyBlock('p')");
  check("paragraph inside a list item", (await html()) === "<ul><li><p>item</p></li></ul>", await html());
  await page.evaluate("E.applyBlock('')");
  check('"Plain" removes the block wrapper again', (await html()) === "<ul><li>item</li></ul>", await html());
  await e.set("<ul><li><h3>Title</h3></li></ul>"); await e.caretAt("Title", 5); await e.key("Enter"); await e.type("next");
  check("Enter at the end of a heading item starts a plain new item", (await html()) === "<ul><li><h3>Title</h3></li><li>next</li></ul>", await html());
  await e.set("<ul><li><p>one two</p></li></ul>"); await e.caretAt("one two", 3); await e.key("Enter");
  check("Enter in the middle of <li><p> keeps paragraph items", (await html()) === "<ul><li><p>one</p></li><li><p> two</p></li></ul>", await html());
  await e.set("<ul><li><p>a</p></li><li><p>b</p></li></ul>"); await e.caretAt("b", 1); await e.cmd("ul");
  check("un-listing an <li><p> unwraps the paragraph", (await html()) === "<ul><li><p>a</p></li></ul><p>b</p>", await html());
  await e.set("<ul><li><h2>H</h2></li></ul>"); await e.caretAt("H", 1); await e.key("Enter"); await e.key("Enter"); await e.type("out");
  check("double Enter leaves a list from a heading item", (await html()) === "<ul><li><h2>H</h2></li></ul><p>out</p>", await html());
  await e.set("<table><tbody><tr><td>cell</td></tr></tbody></table><p><br></p>"); await e.caretAt("cell", 2); await page.evaluate("E.applyBlock('h4')");
  check("heading inside a table cell", (await html()).includes("<td><h4>cell</h4></td>"), await html());
  await e.set("<ul><li>x</li></ul>"); await e.caretAt("x", 1);
  check("block select offers 'Plain' only inside list items / cells", await page.evaluate(() => { E._doRefreshToolbarState(); return !E.blockSelect.querySelector('option[value=""]').hidden; }));

  /* ===== (5) container element switching ===== */
  await e.set("<p>x</p>"); await e.caretAt("x", 1); await e.cmd("section"); await sleep(120);
  check("floating container toolbar shows inside a container", await page.evaluate("E._containerToolbar.classList.contains('pe-visible') && E._containerSelect.value === 'section'"));
  for (const tag of ["nav", "header", "footer", "main", "article", "aside", "div", "section"]) {
    await page.selectOption("#host .pe-container-toolbar select", tag); await sleep(40);
    check(`container <section> -> <${tag}>`, (await html()).includes(`<${tag}><p><br></p></${tag}>`), await html());
  }
  await page.selectOption("#host .pe-container-toolbar select", "nav"); await sleep(40); await e.type("Q");
  check("typing continues inside after switching the type", (await html()).includes("<nav><p>Q</p></nav>"), await html());
  check("setContainerTag() API keeps attributes", await page.evaluate(() => { const el = E.body.querySelector("nav"); el.setAttribute("id", "site-nav"); E.setContainerTag("footer"); return E.getHTML().includes('<footer id="site-nav">'); }));
  await page.locator('.pe-container-toolbar [aria-label="Remove container (keep content)"]').click(); await sleep(80);
  check("container can be removed while keeping its content", !(await html()).includes("footer") && (await html()).includes("<p>Q</p>"), await html());
  await e.set("<p>wrapped</p><p>two</p>"); await e.selAcross(0, 0, 1, 2); await e.cmd("section");
  check("button wraps the selected blocks in a section", (await html()) === "<section><p>wrapped</p><p>two</p></section>", await html());

  /* ===== markdown shortcuts ===== */
  await e.set("<p><br></p>"); await e.type("## Title");
  check("'## ' makes a heading", (await html()) === "<h2>Title</h2>", await html());
  await e.set("<p><br></p>"); await e.type("- item");
  check("'- ' makes a bulleted list", (await html()) === "<ul><li>item</li></ul>", await html());
  await e.set("<p><br></p>"); await e.type("1. first");
  check("'1. ' makes a numbered list", (await html()) === "<ol><li>first</li></ol>", await html());
  await e.set("<p><br></p>"); await e.type("> quote");
  check("'> ' makes a block quote", (await html()) === "<blockquote><p>quote</p></blockquote>", await html());
  await e.set("<p>---</p>"); await e.caretAt("---", 3); await e.key("Enter");
  check("'---' + Enter makes a horizontal rule", (await html()).startsWith("<hr>"), await html());
  await e.key("Control+z"); await sleep(50);
  check("a markdown conversion is a single undo step", (await html()).includes("---"), await html());

  /* ===== API / configuration ===== */
  const m = await openEditor(ctx, "{toolbar:'minimal'}");
  const cmds = await m.page.evaluate("[...E.toolbar.querySelectorAll('[data-cmd]')].map(b=>b.dataset.cmd).join()");
  check('toolbar preset "minimal"', cmds === "bold,italic,link,ul,ol,undo,redo", cmds);
  await m.close();
  const cb = await ctx.browser.newPage(); cb.errs = [];
  await cb.goto(ctx.base + "/page/editor.html");
  const custom = await cb.evaluate(async () => {
    ProEditor.registerButton("hello", { icon: "<svg viewBox='0 0 24 24'><path d='M4 12h16'/></svg>", title: "Say hello", onClick(ed) { ed.setHTML("<p>hello</p>"); }, isActive: () => false });
    const ed = new ProEditor("#host", { toolbar: [["bold", "hello"], ["source"]], messages: { bold: "Strong text" }, minHeight: 100 });
    await ed.ready;
    const btn = ed.toolbar.querySelector('[data-cmd="hello"]');
    btn.click();
    return { has: !!btn, title: btn && btn.title, html: ed.getHTML(), boldTitle: ed.toolbar.querySelector('[data-cmd="bold"]').title, cmds: [...ed.toolbar.querySelectorAll("[data-cmd]")].map((b) => b.dataset.cmd).join() };
  });
  check("custom toolbar button + per-instance message override", custom.has && custom.title === "Say hello" && custom.html === "<p>hello</p>" && custom.boldTitle === "Strong text" && custom.cmds === "bold,hello,source", custom);
  const i18n = await cb.evaluate(async () => {
    ProEditor.registerLocale("xx", { bold: "Gras", words: "{words} mots" });
    document.getElementById("host").innerHTML = "";
    const ed = new ProEditor("#host", { locale: "xx" });
    await ed.ready;
    return { bold: ed.toolbar.querySelector('[data-cmd="bold"]').title, italic: ed.toolbar.querySelector('[data-cmd="italic"]').title, count: ed.countsEl.textContent };
  });
  check("registerLocale: translated + English fallback", i18n.bold === "Gras" && i18n.italic.startsWith("Italic") && /mots/.test(i18n.count), i18n);
  await cb.close();
  check("command() runs toolbar commands from code", await page.evaluate(() => { E.setHTML("<p>abc</p>"); E.focus(); const r = E.doc.createRange(); r.selectNodeContents(E.body.firstChild); E.setRange(r); E.command("bold"); return E.getHTML() === "<p><strong>abc</strong></p>"; }));
  check("ProEditor.sanitize() static helper", await page.evaluate(() => ProEditor.sanitize('<p onclick="x">a</p><script>1</script>') === "<p>a</p>"));
  check("default direction follows the page (ltr page -> ltr editor)", await page.evaluate("E.options.dir === 'ltr'"));
  check("no console errors", e.page.errs.length === 0, e.page.errs);
  await e.close();
}
