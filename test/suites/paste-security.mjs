import { check, openEditor, sleep } from "../lib.mjs";

const PASTE = ([html, text, internal]) => {
  const dt = new DataTransfer();
  if (html) dt.setData("text/html", html);
  if (text) dt.setData("text/plain", text);
  if (internal) dt.setData("application/x-proeditor", "1");
  const ev = new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true });
  E.doc.dispatchEvent(ev);
  return ev.defaultPrevented;
};

export async function run(ctx) {
  const e = await openEditor(ctx);
  const { page } = e;
  const paste = (html, text, internal = false) => page.evaluate(PASTE, [html, text, internal]);

  /* ----- sanitizer ----- */
  const san = (h) => page.evaluate((h) => ProEditor.sanitize(h), h);
  check("javascript: href with a newline is removed", (await san('<a href="java\nscript:alert(1)">l</a>')) === "<p>l</p>");
  check("javascript: href with a tab is removed", (await san('<a href="java\tscript:alert(1)">l</a>')) === "<p>l</p>");
  check("entity-encoded javascript: is removed", (await san('<a href="&#106;avascript:alert(1)">l</a>')) === "<p>l</p>");
  check("data:text/html image src rejected, data:image/png kept", (await san('<img src="data:text/html;base64,AAA" alt=""><img src="data:image/png;base64,AAA" alt="">')) === '<p><img src="data:image/png;base64,AAA" alt=""></p>');
  check("on* handlers removed", (await san('<img src=x onerror=alert(1) alt="a">')) === '<p><img src="x" alt="a"></p>');
  check("svg / script / style / form / iframe / meta dropped", (await san('<svg onload=alert(1)></svg><script>1</script><style>p{}</style><form><input></form><iframe src=x></iframe><meta http-equiv=refresh content=0><p>ok</p>')) === "<p>ok</p>");
  check("unsafe style properties removed, safe kept", (await san('<p style="color:red;position:fixed;background:url(javascript:1);width:expression(1)">x</p>')) === '<p style="color: red;">x</p>');
  check("target=_blank gets rel=noopener noreferrer", (await san('<a href="https://x.com" target="_blank">x</a>')) === '<p><a href="https://x.com" target="_blank" rel="noopener noreferrer">x</a></p>');
  check("unknown tags are unwrapped, content kept", (await san("<custom-el>hello <b>w</b></custom-el>")) === "<p>hello <strong>w</strong></p>");
  check("ids that would clobber page globals are dropped, normal ids kept", (await san('<h2 id="location">a</h2><h2 id="intro">b</h2>')) === '<h2>a</h2><h2 id="intro">b</h2>', await san('<h2 id="location">a</h2><h2 id="intro">b</h2>'));
  check("allowData:false drops data-* (aria-* kept)", await page.evaluate(() => ProEditor.sanitize('<p data-x="1" aria-label="a">t</p>', { noData: true }) === '<p aria-label="a">t</p>'));
  check("comments are stripped", (await san("<!-- c --><p>x<!--y--></p>")) === "<p>x</p>");
  check("text containing b=\"\" is not corrupted", (await san('<p>a b="" c</p>')) === '<p>a b="" c</p>');
  check("unsafe srcset rejects the whole picture source", !(await san('<picture><source srcset="javascript:1 1x" media="all"><img src="c.jpg" alt=""></picture>')).includes("javascript"));
  check("smart paragraphs are the default for the editor", (await page.evaluate(() => E.options.paragraphs)) === "smart");

  /* ----- initial HTML / setHTML are sanitized ----- */
  await page.evaluate(async () => {
    window.E2 = new ProEditor(document.body.appendChild(document.createElement("div")), { initialHTML: '<p>x</p><a href="java\nscript:alert(1)">l</a><img src=x onerror=alert(1)><svg onload=alert(1)></svg><script>alert(1)</script>' });
    await E2.ready;
  });
  const r = await page.evaluate("E2.getHTML() + '|' + E2.body.innerHTML");
  check("initialHTML is sanitized", !/onerror|javascript|<script|svg/.test(r), r);

  /* ----- paste ----- */
  await e.set("<p><br></p>"); await paste(null, "line1\nline2\n\nline3");
  check("plain multi-line paste -> paragraphs", (await e.html()) === "<p>line1</p><p>line2</p><p>line3</p>", await e.html());
  await e.set("<p>abcd</p>"); await e.caretAt("abcd", 2); await paste(null, "XX");
  check("inline paste mid paragraph", (await e.html()) === "<p>abXXcd</p>", await e.html());
  const dirty = '<meta charset="utf-8"><p class="MsoNormal" style="color:red;mso-x:1"><span style="font-weight:700">B</span> <span style="font-style:italic">I</span><o:p></o:p></p><script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">bad</a>';
  await e.set("<p>start</p>"); await e.caretAt("start", 5); await paste(dirty, "");
  const out = await e.html();
  check("paste: styles become tags, junk and scripts removed", out.includes("<strong>B</strong>") && out.includes("<em>I</em>") && !/onerror|javascript|class=|script/.test(out), out);
  await e.set("<p>abcd</p>"); await e.caretAt("abcd", 2); await paste("<h3>H</h3><p>P</p>", "");
  check("pasting blocks splits the paragraph", (await e.html()) === "<p>ab</p><h3>H</h3><p>P</p><p>cd</p>", await e.html());
  await e.set("<ul><li>one</li></ul>"); await e.caretAt("one", 3); await paste("<p>a</p><p>b</p>", "");
  check("pasting blocks into a list item is flattened", (await e.html()) === "<ul><li>onea<br>b</li></ul>", await e.html());
  await e.set('<p><span class="k" style="color:red">x</span></p><p>t</p>'); await e.caretAt("t", 1);
  await paste('<span class="k" style="color:red">y</span>', "y", true);
  const internal = await e.html();
  check("internal paste keeps class and style", internal.includes('class="k"') && internal.replace(/\s/g, "").includes("color:red"), internal);
  await e.set("<p><br></p>"); await paste('<img src="a.png" alt="x">', "");
  check("pasting only an image into an empty paragraph: no <p>", (await e.html()) === '<img src="a.png" alt="x">', await e.html());
  await e.set("<p>link me</p>"); await e.selText("link"); await paste(null, "https://example.com/x");
  check("pasting a URL over selected text links it", (await e.html()) === '<p><a href="https://example.com/x">link</a> me</p>', await e.html());
  await e.set("<p>x</p>"); await e.caretAt("x", 1); await paste(null, "https://example.com");
  check("pasting a URL at a caret inserts a link", (await e.html()).includes('<a href="https://example.com">https://example.com</a>'), await e.html());
  await e.set("<p>keep</p>"); await e.caretAt("keep", 4); await paste(null, "javascript:alert(1)");
  check("pasting a javascript: URL is plain text", !(await e.html()).includes("<a"), await e.html());

  /* ----- copy / cut / drop ----- */
  await e.set("<p>copyme here</p>"); await e.selText("copyme");
  const cp = await page.evaluate(() => { const dt = new DataTransfer(); const ev = new ClipboardEvent("cut", { clipboardData: dt, bubbles: true, cancelable: true }); E.doc.dispatchEvent(ev); return [dt.getData("text/plain"), dt.getData("application/x-proeditor"), E.getHTML()]; });
  check("cut fills the clipboard and removes the text", cp[0] === "copyme" && cp[1] === "1" && cp[2] === "<p> here</p>", cp);
  await e.set("<p>x</p>"); await page.evaluate("E.body.insertAdjacentHTML('beforeend','<p onclick=1>d</p>')");
  await page.evaluate("E.doc.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true}))"); await sleep(100);
  check("a drop re-sanitizes the live DOM", !(await e.raw()).includes("onclick"), await e.raw());

  /* ----- source mode ----- */
  await e.set('<h2>t</h2><p>a <strong>b</strong><em>c</em> d</p><ul><li>x</li></ul><table><tbody><tr><td>1</td></tr></tbody></table>');
  const before = await e.html(); await e.cmd("source"); const src = await page.evaluate("E.sourceArea.value"); await e.cmd("source"); const after = await e.html();
  check("source mode round trip is lossless", before === after, [before, after]);
  check("source view does not add whitespace between inline tags", src.includes("<strong>b</strong><em>c</em>"), src);
  await e.cmd("source"); await page.evaluate("E.sourceArea.value='<p onclick=x>hi</p><script>1</script><p>z</p>'"); await e.cmd("source");
  check("HTML typed in source mode is sanitized", (await e.html()) === "<p>hi</p><p>z</p>", await e.html());

  /* ----- output cleanliness ----- */
  await e.set("<p>a<strong>\u200b</strong>b\u200b</p>");
  check("zero-width spaces and empty formatting are not exported", (await e.html()) === "<p>ab</p>", await e.html());
  await e.set("<p>keep</p>"); await page.evaluate("const b = E.doc.createElement('br'); b.setAttribute('data-pe-ph',''); E.body.firstChild.append(b)");
  check("editor placeholder <br> is not exported", (await e.html()) === "<p>keep</p>", await e.html());
  await e.set("<pre>a<br>b</pre>");
  check("<br> inside <pre> is exported as a newline", (await e.html()) === "<pre>a\nb</pre>", await e.html());

  /* ----- read only / API ----- */
  await page.evaluate("E.setReadOnly(true)"); await e.set("<p>ro</p>"); await e.caretAt("ro", 1); await e.cmd("bold"); await e.selText("ro"); await e.cmd("bold");
  check("readOnly blocks commands", (await e.html()) === "<p>ro</p>" && (await page.evaluate("E.body.contentEditable")) === "false", await e.html());
  await page.evaluate("E.setReadOnly(false)");
  check("isEmpty / getText", (await page.evaluate("(E.setHTML(''), E.isEmpty())")) && (await page.evaluate("(E.setHTML('<p>q</p>'), E.getText())")) === "q");
  const ch = await page.evaluate(() => new Promise((res) => { E.on("change", (h) => res(h)); E.setHTML("<p>evt</p>"); }));
  check("change event fires", ch === "<p>evt</p>", ch);
  check("no console errors (sandbox blocking the deliberately injected onclick is expected)", e.page.errs.filter((x) => !/Blocked script/.test(x)).length === 0, e.page.errs);
  await e.close();
}
