import { check, openEditor, sleep } from "../lib.mjs";

export async function run(ctx) {
  const e = await openEditor(ctx);
  const { page } = e;

  // ----- dropdowns
  await e.set("<p>al</p>"); await e.caretAt("al", 1);
  await page.locator("#host [data-cmd=alignMenu]").click(); await sleep(200);
  const vis = await page.evaluate(() => { const m = document.querySelector("#host [data-dd=align] .pe-dropdown-menu"); const r = m.getBoundingClientRect(); return [getComputedStyle(m).visibility, r.left >= 0 && r.right <= innerWidth]; });
  check("align menu is visible and inside the viewport", vis[0] === "visible" && vis[1] === true, vis);
  await page.locator("#host [data-cmd=alignCenter]").click(); await sleep(100);
  check("align via menu applies and closes the menu", (await e.html()).includes("text-align: center") && (await page.evaluate("!document.querySelector('#host .pe-dropdown.pe-open')")), await e.html());
  await page.locator("#host [data-cmd=alignMenu]").click(); await sleep(100);
  await page.frameLocator("#host iframe").locator("body").click(); await sleep(100);
  check("a dropdown closes when you click inside the editor", await page.evaluate("!document.querySelector('#host .pe-dropdown.pe-open')"));
  await e.set("<p>sub2</p>"); await e.selText("2");
  await page.locator("#host [data-cmd=moreMenu]").click(); await sleep(100);
  await page.locator("#host .pe-menu-item[data-cmd=sub]").click(); await sleep(100);
  check("More menu applies subscript", (await e.html()) === "<p>sub<sub>2</sub></p>", await e.html());

  // ----- keyboard navigation in the toolbar (LTR page: ArrowRight = next)
  await page.locator("#host [data-cmd=bold]").focus(); await page.keyboard.press("ArrowRight");
  check("arrow keys move through the toolbar", (await page.evaluate("document.activeElement.dataset.cmd")) === "italic", await page.evaluate("document.activeElement.dataset.cmd"));
  await page.keyboard.press("Home");
  check("Home focuses the first control", (await page.evaluate("document.activeElement.dataset.cmd")) === "block");
  check("roving tabindex: exactly one tab stop", (await page.evaluate("document.querySelectorAll('#host .pe-toolbar [tabindex=\"0\"]').length")) === 1);
  await page.locator("#host [data-cmd=strike]").focus(); await e.selText("sub"); await page.keyboard.press("Enter"); await sleep(100);
  check("a keyboard-activated button keeps focus", (await page.evaluate("document.activeElement.dataset.cmd")) === "strike" && (await e.html()).includes("<s>sub</s>"), await e.html());

  // ----- fullscreen
  await page.locator("#host [data-cmd=fullscreen]").click(); await sleep(200);
  const fs = await page.evaluate(() => { const r = document.querySelector("#host .pe-root"); const b = r.getBoundingClientRect(); return [r.classList.contains("pe-fullscreen"), b.width === innerWidth && b.height === innerHeight, document.documentElement.classList.contains("pe-lock-scroll")]; });
  check("fullscreen fills the viewport and locks page scroll", JSON.stringify(fs) === "[true,true,true]", fs);
  await page.keyboard.press("Escape"); await sleep(100);
  check("Esc leaves fullscreen", await page.evaluate("!document.querySelector('#host .pe-root').classList.contains('pe-fullscreen') && !document.documentElement.classList.contains('pe-lock-scroll')"));

  // ----- sticky toolbar + a11y
  await e.set(Array.from({ length: 80 }, (_, i) => `<p>line ${i}</p>`).join("")); await page.evaluate("window.scrollTo(0, 500)"); await sleep(200);
  const top = await page.evaluate("document.querySelector('#host .pe-toolbar').getBoundingClientRect().top");
  check("toolbar stays sticky while scrolling", Math.abs(top) < 2, top);
  await page.evaluate("window.scrollTo(0,0)");
  const a = await page.evaluate(() => ({ title: E.iframe.title, role: E.toolbar.getAttribute("role"), bold: E.toolbar.querySelector("[data-cmd=bold]").hasAttribute("aria-pressed"), link: E.toolbar.querySelector("[data-cmd=unlink]").hasAttribute("aria-pressed"), live: E.statusText.getAttribute("aria-live") }));
  check("accessibility attributes", a.title && a.role === "toolbar" && a.bold && !a.link && a.live === "polite", a);

  // ----- link dialog end to end
  await e.set("<p>go to site</p>"); await e.selText("site"); await page.locator("#host [data-cmd=link]").click(); await sleep(150);
  await page.locator('dialog[open] [id$="-href"]').fill("javascript:alert(1)"); await page.locator("dialog[open] [data-submit]").click(); await sleep(100);
  check("link: javascript: URL is rejected", (await page.locator("dialog[open]").count()) === 1);
  await page.locator('dialog[open] [id$="-href"]').fill("example.com/x"); await page.locator('dialog[open] [id$="-target"]').selectOption("_blank");
  await page.locator('dialog[open] input[type=checkbox][id$="-nofollow"]').check(); await page.locator("dialog[open] [data-submit]").click(); await sleep(150);
  check("link: https prefix, target and rel", (await e.html()) === '<p>go to <a href="https://example.com/x" target="_blank" rel="nofollow noopener noreferrer">site</a></p>', await e.html());
  await e.caretAt("site", 1); await page.locator("#host [data-cmd=link]").click(); await sleep(150);
  check("editing an existing link is prefilled", (await page.locator('dialog[open] [id$="-href"]').inputValue()) === "https://example.com/x"); await page.keyboard.press("Escape"); await sleep(100);
  await e.caretAt("site", 1); await page.locator("#host [data-cmd=unlink]").click();
  check("unlink", (await e.html()) === "<p>go to site</p>", await e.html());
  await e.set("<p>x</p>"); await e.caretAt("x", 1); await page.locator("#host [data-cmd=link]").click(); await sleep(150);
  await page.locator('dialog[open] [id$="-text"]').fill("Click"); await page.locator('dialog[open] [id$="-href"]').fill("https://a.b"); await page.locator("dialog[open] [data-submit]").click(); await sleep(120);
  check("link at a caret inserts the link text", (await e.html()).includes('<a href="https://a.b" target="_self">Click</a>'), await e.html());

  // ----- custom attributes
  await e.set("<p>attr</p>"); await e.selText("attr"); await page.locator("#host [data-cmd=attr]").click(); await sleep(150);
  await page.locator("dialog[open] .pe-link-btn").click(); await page.locator('dialog[open] [id$="-k"]').nth(0).fill("data-id"); await page.locator('dialog[open] [id$="-v"]').nth(0).fill("7");
  await page.locator("dialog[open] .pe-link-btn").click(); await page.locator('dialog[open] [id$="-k"]').nth(1).fill("onclick"); await page.locator('dialog[open] [id$="-v"]').nth(1).fill("alert(1)");
  await page.locator("dialog[open] [data-submit]").click(); await sleep(150);
  check("attribute dialog: data-id kept, onclick blocked + notice", (await e.html()).includes('data-id="7"') && !(await e.html()).includes("onclick") && /onclick/.test(await page.evaluate("E.statusText.textContent")), [await e.html(), await page.evaluate("E.statusText.textContent")]);
  await e.set("<p>para</p>"); await e.caretAt("para", 1); await page.locator("#host [data-cmd=attr]").click(); await sleep(150);
  await page.locator("dialog[open] .pe-link-btn").click(); await page.locator('dialog[open] [id$="-k"]').nth(0).fill("class"); await page.locator('dialog[open] [id$="-v"]').nth(0).fill("lead"); await page.locator("dialog[open] [data-submit]").click(); await sleep(120);
  check("attribute on the paragraph at the caret", (await e.html()) === '<p class="lead">para</p>', await e.html());

  // ----- syncTo + form
  await page.evaluate(async () => {
    document.body.insertAdjacentHTML("beforeend", '<form id=f onsubmit="return false"><textarea id=ta>&lt;p&gt;from textarea&lt;/p&gt;</textarea><div id=sx></div></form>');
    window.ES = new ProEditor("#sx", { syncTo: "#ta" });
    await ES.ready;
  });
  check("syncTo loads the initial value", (await page.evaluate("ES.getHTML()")) === "<p>from textarea</p>");
  await page.evaluate("ES.setHTML('<p>changed</p>'); document.getElementById('f').dispatchEvent(new Event('submit',{cancelable:true}))");
  check("syncTo updates on submit", (await page.evaluate("document.getElementById('ta').value")) === "<p>changed</p>");

  // ----- theme
  const dark = await ctx.browser.newContext({ colorScheme: "dark" });
  const pd = await dark.newPage(); await pd.goto(ctx.base + "/page/editor.html");
  const themed = await pd.evaluate(async () => { const ed = new ProEditor("#host"); await ed.ready; return [ed.root.dataset.theme, ed.doc.documentElement.dataset.theme]; });
  check("auto theme follows prefers-color-scheme", themed[0] === "dark" && themed[1] === "dark", themed);
  await dark.close();
  check("no console errors", e.page.errs.length === 0, e.page.errs);
  await e.close();
}
