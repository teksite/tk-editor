import { check, openEditor, sleep } from "../lib.mjs";
import { deflateSync } from "node:zlib";

// Tiny solid-color PNG as a data: URL (natural size probing needs a real image)
function png(w, h, [r, g, b] = [60, 100, 200]) {
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (buf) => { let c = 0xffffffff; for (const x of buf) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const t = Buffer.from(type); const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const c = Buffer.alloc(4); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, c]); };
  const raw = Buffer.concat(Array.from({ length: h }, () => Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: w }, () => [r, g, b]).flat())])));
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return "data:image/png;base64," + Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]).toString("base64");
}

export async function run(ctx) {
  const IMG = png(800, 400);
  const IMG2 = png(400, 400, [200, 80, 80]);
  const e = await openEditor(ctx);
  const { page } = e;
  const dlg = () => page.locator("dialog.pe-dialog[open]");
  const fld = (key, n = 0) => dlg().locator(`[id$="-${key}"]`).nth(n);
  const ok = async () => { await dlg().locator("[data-submit]").click(); await sleep(150); };
  const btn = async (c) => { await page.locator(`#host .pe-toolbar [data-cmd="${c}"]`).click(); await sleep(120); };
  const err = () => dlg().locator(".pe-dialog-error").innerText();

  /* ===== image ===== */
  await e.set("<p>text</p>"); await e.caretAt("text", 4);
  await btn("image");
  check("image dialog is a native <dialog>", (await dlg().count()) === 1);
  await ok(); check("required URL is validated", (await dlg().count()) === 1 && /required/.test(await err()), await err());
  await fld("src").fill(IMG); await sleep(700);
  check("natural size is detected", (await fld("width").inputValue()) === "800" && (await fld("height").inputValue()) === "400");
  await ok(); check("alt is required", (await dlg().count()) === 1 && /alt/.test(await err()), await err());
  await fld("alt").fill("A sample"); await ok();
  let out = await e.html();
  check("image inserted with a11y + performance attributes", ['alt="A sample"', 'width="800"', 'height="400"', 'loading="lazy"', 'decoding="async"', "max-width: 100%"].every((s) => out.includes(s)), out.slice(0, 200));
  check("image is inline inside the existing text paragraph", out.startsWith("<p>text<img") && out.endsWith("</p>"), out.slice(0, 80));
  await sleep(200);
  check("overlay + resize handle are visible", await page.evaluate("E.mediaActions.classList.contains('pe-visible') && E.mediaHandle.classList.contains('pe-visible')"));
  await e.set(`<p><img src="${IMG}" alt="a" width="800" height="400" style="max-width:100%;height:auto"></p>`);
  await page.evaluate("E._selectMedia(E.body.querySelector('img'))"); await sleep(120);
  const w0 = await page.evaluate("E._activeMedia.getBoundingClientRect().width");
  const hb = await page.locator(".pe-media-resize-handle").boundingBox();
  await page.mouse.move(hb.x + 8, hb.y + 8); await page.mouse.down(); await page.mouse.move(hb.x - 200, hb.y + 8, { steps: 6 }); await page.mouse.up(); await sleep(100);
  const w1 = await page.evaluate("E._activeMedia.getBoundingClientRect().width");
  check("LTR: dragging the handle inward (left) shrinks the image", w1 < w0, [w0, w1]);
  check("resize writes a px width and keeps the aspect ratio", /width:\s*\d+px/.test(await e.raw()) && /height:\s*auto/.test(await e.raw()), (await e.raw()).slice(0, 200));
  await page.locator(".pe-media-resize-handle").focus(); await page.keyboard.press("ArrowRight"); await sleep(60);
  const w2 = await page.evaluate("E._activeMedia.getBoundingClientRect().width");
  check("keyboard resize with arrow keys", w2 > w1, [w1, w2]);
  await page.evaluate("E._editMedia(E.body.querySelector('img'))"); await sleep(100);
  check("edit dialog is prefilled", (await fld("alt").inputValue()) === "a" && (await fld("width").inputValue()) === "800");
  await fld("alt").fill("Edited"); await ok();
  check("edit applies in place (keeps the width style)", (await e.html()).includes('alt="Edited"') && /width:\s*\d+px/.test(await e.raw()));
  await page.evaluate("E._editMedia(E.body.querySelector('img'))"); await sleep(100);
  await dlg().locator('input[type=checkbox][id$="-decorative"]').check();
  check("decorative disables the alt field", await fld("alt").isDisabled()); await ok();
  check('decorative image gets alt=""', (await e.html()).includes('alt=""'), (await e.html()).slice(0, 150));
  await page.evaluate("E._selectMedia(E.body.querySelector('img'))"); await sleep(80);
  await page.locator(".pe-media-actions [data-action=link]").click(); await sleep(150);
  await fld("href").fill("example.com"); await ok();
  check("link dialog on a selected image wraps it in <a> (https added)", (await e.html()).includes('<a href="https://example.com"'), await e.html());
  await page.evaluate("E._selectMedia(E.body.querySelector('img'))"); await sleep(80);
  await page.locator(".pe-media-actions [data-action=remove]").click(); await sleep(100);
  check("remove button deletes the media (and its empty link)", !(await e.html()).includes("img") && !(await e.html()).includes("<a"), await e.html());
  await e.set("<p>x</p>"); await e.insertImg(); await page.evaluate("E._selectMedia(E.body.querySelector('img'))"); await e.key("Delete"); await sleep(120);
  check("Delete key removes the selected image and the overlay hides", !(await e.html()).includes("img") && (await page.evaluate("!E.mediaActions.classList.contains('pe-visible')")), await e.html());

  /* ===== picture ===== */
  await e.set("<p>pic: </p>"); await e.caretAt("pic", 5);
  await btn("picture");
  check("picture dialog starts with one source row", (await dlg().locator(".pe-row-item").count()) === 1);
  check("note about source order is shown", /order matters/.test(await dlg().innerText()));
  await fld("srcset", 0).fill(IMG + " 1x"); await fld("media", 0).fill("(min-width: )");
  await dlg().locator(".pe-link-btn").filter({ hasText: "Add source" }).click();
  check("a second source row was added", (await dlg().locator(".pe-row-item").count()) === 2);
  await fld("srcset", 1).fill("b-400.webp 400w, b-800.webp 800w"); await fld("media", 1).fill("(max-width: 767px)"); await fld("sizes", 1).fill("100vw");
  await fld("src").fill(IMG2); await sleep(600); await fld("alt").fill("Responsive"); await ok();
  check("invalid media query is rejected with the source number", (await dlg().count()) === 1 && /source #1/.test(await err()), await err());
  await fld("media", 0).fill("(min-width: 768px)");
  await dlg().locator(".pe-row-item").nth(1).locator("[data-up]").click();
  await ok();
  out = await e.html();
  const srcs = out.match(/<source[^>]*>/g) || [];
  check("picture structure", out.includes("<picture>") && srcs.length === 2 && out.includes("<img"), out.replace(/data:image[^"]{20,}/g, "DATA").slice(0, 300));
  check("source order after reordering", srcs[0].includes("max-width: 767px") && srcs[1].includes("min-width: 768px"), srcs.map((s) => s.slice(0, 80)));
  check("source attributes: srcset / media / type / sizes", srcs[0].includes('srcset="b-400.webp 400w, b-800.webp 800w"') && srcs[0].includes('type="image/webp"') && srcs[0].includes('sizes="100vw"') && srcs[1].includes('type="image/png"'), srcs.map((s) => s.slice(0, 90)));
  check("fallback <img> has alt / lazy / intrinsic size", /<img[^>]*alt="Responsive"/.test(out) && out.includes('loading="lazy"') && out.includes('width="400"'));
  check("picture is inline in the text paragraph", out.startsWith("<p>pic: <picture>"), out.slice(0, 60));
  await page.evaluate("E._editMedia(E.body.querySelector('picture'))"); await sleep(100);
  check("edit picture is prefilled with both sources", (await dlg().locator(".pe-row-item").count()) === 2 && (await fld("media", 0).inputValue()) === "(max-width: 767px)");
  await dlg().locator(".pe-row-item").nth(0).locator("[data-del]").click(); await ok();
  check("a source row can be deleted", (await e.html()).split("<source").length === 2, await e.html());
  await e.set(`<p><picture><source media="(max-width: 500px)" srcset="${IMG2}"><img src="${IMG}" alt="x"></picture></p>`);
  await page.evaluate("E.setPreviewWidth(375)"); await sleep(400);
  const mobile = await page.evaluate((a) => E.body.querySelector("img").currentSrc.slice(0, 60) === a.slice(0, 60), IMG2);
  await page.evaluate("E.setPreviewWidth(null)"); await sleep(400);
  const desktop = await page.evaluate((a) => E.body.querySelector("img").currentSrc.slice(0, 60) === a.slice(0, 60), IMG);
  check("media queries re-evaluate in the responsive preview (mobile -> source, desktop -> fallback)", mobile && desktop, [mobile, desktop]);

  /* ===== video ===== */
  await e.set("<p>v</p>"); await e.caretAt("v", 1); await btn("video");
  await fld("src", 0).fill("media/v.mp4");
  await dlg().locator(".pe-link-btn").filter({ hasText: "another format" }).click(); await fld("src", 1).fill("media/v.webm");
  await fld("poster").fill(IMG2);
  await dlg().locator("input[type=checkbox][id$='-autoplay']").check();
  check("autoplay turns muted on", await dlg().locator("input[type=checkbox][id$='-muted']").isChecked());
  await dlg().locator("summary").click(); await dlg().locator(".pe-link-btn").filter({ hasText: "subtitle track" }).click();
  await fld("src", 2).fill("subs/en.vtt"); await fld("srclang").fill("en"); await fld("label").fill("English"); await ok();
  out = await e.html();
  check("video markup", ["<video", "controls", "playsinline", 'preload="metadata"', "muted", "autoplay", "poster=", '<source src="media/v.mp4" type="video/mp4">', '<source src="media/v.webm" type="video/webm">', '<track src="subs/en.vtt" kind="subtitles" srclang="en" label="English">'].every((s) => out.includes(s)), out.replace(/data:image[^"]{20,}/g, "DATA"));
  check("video is a sibling after the text paragraph (not wrapped in <p>)", out.startsWith("<p>v</p><video"), out.slice(0, 40));
  await e.set("<p>v</p>"); await e.caretAt("v", 1); await btn("video"); await fld("src", 0).fill("javascript:alert(1)"); await ok();
  check("video with an unsafe src is rejected", (await dlg().count()) === 1); await dlg().locator("[data-close]").first().click(); await sleep(100);

  /* ===== audio ===== */
  await e.set("<p><br></p>"); await page.evaluate("E.focus()"); await btn("audio"); await fld("src", 0).fill("x/a.mp3"); await ok();
  out = await e.html();
  check("audio markup, bare in an empty paragraph", out.startsWith("<audio controls") && out.includes('type="audio/mpeg"') && out.includes('preload="metadata"'), out);
  await btn("audio"); await page.keyboard.press("Escape"); await sleep(100); check("Esc closes the dialog", (await dlg().count()) === 0);

  /* ===== media manager hook ===== */
  await page.evaluate(async () => {
    const host = document.body.appendChild(document.createElement("div")); host.id = "host2";
    window.E3 = new ProEditor(host, { fileManager: (t, c) => Promise.resolve({ url: "https://cdn.x/" + t + "-" + c.purpose + ".jpg", alt: "from manager", width: 640, height: 480 }) });
    await E3.ready; E3.focus(); E3.command("picture");
  });
  await sleep(200);
  const d3 = page.locator("#host2 dialog.pe-dialog[open]");
  await d3.locator(".pe-addon").first().click(); await sleep(200);
  check("media manager button fills the source srcset", (await d3.locator('[id$="-srcset"]').first().inputValue()).includes("image-source.jpg"));
  await d3.locator('[id$="-src"]').last().locator("xpath=..").locator(".pe-addon").click(); await sleep(200);
  check("media manager fills fallback, alt and dimensions", (await d3.locator('[id$="-alt"]').inputValue()) === "from manager" && (await d3.locator('[id$="-width"]').inputValue()) === "640");
  await d3.locator("[data-close]").first().click();

  /* ===== table ===== */
  await e.set("<p>t</p>"); await e.caretAt("t", 1); await btn("table"); await ok();
  out = await e.html();
  check("table with thead / th scope", out.includes('<thead><tr><th scope="col"><br></th>') && out.split("<td>").length === 7 && out.split("<th ").length === 4, out);
  await page.keyboard.type("A"); await page.keyboard.press("Tab"); await page.keyboard.type("B");
  check("typing + Tab moves between cells", (await e.html()).includes('<th scope="col">A</th><th scope="col">B</th>'), (await e.html()).slice(0, 200));
  check("table toolbar is visible", await page.evaluate("E.tableToolbar.classList.contains('pe-visible')"));
  for (const c of ["addRowBelow", "rowAbove", "addColRight", "colBefore"]) { await page.locator(`.pe-table-toolbar [data-cmd=${c}]`).click(); await sleep(60); }
  const dims = () => page.evaluate("[E.body.querySelector('table').rows.length, E.body.querySelector('table').rows[0].cells.length]");
  check("add row / column buttons", JSON.stringify(await dims()) === "[5,5]", await dims());
  for (const c of ["delRow", "delCol"]) { await page.locator(`.pe-table-toolbar [data-cmd=${c}]`).click(); await sleep(60); }
  check("delete row / column buttons", JSON.stringify(await dims()) === "[4,4]", await dims());
  await page.locator(".pe-table-toolbar [data-cmd=toggleHeader]").click();
  check("toggle header row off", (await page.evaluate("E.body.querySelector('table').rows[0].cells[0].tagName")) === "TD");
  await page.locator(".pe-table-toolbar [data-cmd=delTable]").click();
  check("delete table", !(await e.html()).includes("table"), await e.html());
  await e.set("<table><tbody><tr><td>1</td><td>2</td></tr></tbody></table><p><br></p>"); await e.caretAt("2", 1); await page.keyboard.press("Tab");
  check("Tab in the last cell adds a row", (await page.evaluate("E.body.querySelector('table').rows.length")) === 2);
  await e.caretAt("1", 1); await e.key("Enter");
  check("Enter inside a cell inserts <br>", (await e.html()).includes("<td>1<br>"), await e.html());
  await e.set("<p><br></p>"); await btn("table"); await ok();
  check("table in an empty paragraph replaces it", (await e.html()).startsWith("<table>"), (await e.html()).slice(0, 30));

  /* ===== hr ===== */
  await e.set("<p>x</p>"); await e.caretAt("x", 1); await e.cmd("hr");
  check("hr + trailing paragraph", (await e.html()) === "<p>x</p><hr><p><br></p>", await e.html());
  check("no console errors", e.page.errs.length === 0, e.page.errs);
  await e.close();
}
