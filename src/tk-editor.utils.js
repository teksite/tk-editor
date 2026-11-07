/*!
 * tk-editor.utils.js
 * ------------------------------------------------------------------
 * Security and helper utilities, independent from the editor class.
 *
 * SECURITY NOTE: sanitizeHTML is a client-side defense layer. It does NOT replace
 * server-side sanitization of the HTML you finally store/render.
 *
 * The sanitizer is ALLOW-LIST based: only known tags and attributes survive, URLs are
 * validated against allowed protocols, `style` keeps only safe properties/values, and ids that
 * would clobber page globals (DOM clobbering) are dropped.
 */
(function (global) {
  "use strict";

  const ZWSP = "\u200B";
  const set = (s) => new Set(s.split(/\s+/).filter(Boolean));

  /* ---------- tag groups ---------- */
  const INLINE_TAGS = set("a abbr bdi bdo br cite code data del dfn em img ins kbd mark picture q s samp small span strong sub sup time u var wbr video audio");
  const BLOCKISH = set("p h1 h2 h3 h4 h5 h6 ul ol li blockquote section div table pre hr figure figcaption details summary dl dt dd article aside header footer main nav address");
  const STRUCTURAL = set("ul ol table thead tbody tfoot tr colgroup dl");
  const CONTAINERS = set("section blockquote div article aside header footer main nav");
  const FORMAT_INLINE = set("strong em u s sub sup mark code q span small kbd");

  const ALLOWED_TAGS = set(
    `${[...INLINE_TAGS].join(" ")} ${[...BLOCKISH].join(" ")} caption colgroup col thead tbody tfoot tr td th source track`
  );
  // Removed together with their content (unknown tags are only unwrapped; their content is kept)
  const DROP_TAGS = set(
    "script style iframe frame frameset object embed applet link meta base form template noscript svg math head title textarea select option input button canvas dialog slot portal"
  );
  const RENAME = { b: "strong", i: "em", strike: "s" };

  /* ---------- allowed attributes ---------- */
  const GLOBAL_ATTRS = set("class id title lang dir role style");
  const TAG_ATTRS = {
    a: set("href target rel download hreflang type"),
    img: set("src srcset sizes alt width height loading decoding fetchpriority crossorigin referrerpolicy"),
    source: set("src srcset sizes media type width height"),
    video: set("src poster controls autoplay loop muted playsinline preload width height crossorigin controlslist disablepictureinpicture disableremoteplayback"),
    audio: set("src controls autoplay loop muted preload crossorigin controlslist"),
    track: set("src kind srclang label default"),
    td: set("colspan rowspan headers scope abbr"),
    th: set("colspan rowspan headers scope abbr"),
    col: set("span"),
    colgroup: set("span"),
    ol: set("start reversed type"),
    li: set("value"),
    blockquote: set("cite"),
    q: set("cite"),
    time: set("datetime"),
    details: set("open"),
    del: set("cite datetime"),
    ins: set("cite datetime"),
    data: set("value"),
  };
  const MIME_RE = /^[\w.+-]+\/[\w.+-]+(\s*;\s*[\w-]+\s*=\s*("[^"]*"|[^\s;]*))*$/;
  const LANG_RE = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/;
  const SIZE_RE = /^\d{1,5}(\.\d+)?%?$/;
  const INT_RE = /^-?\d{1,5}$/;
  const VALIDATORS = {
    dir: /^(ltr|rtl|auto)$/i,
    loading: /^(lazy|eager)$/i,
    decoding: /^(async|sync|auto)$/i,
    fetchpriority: /^(high|low|auto)$/i,
    preload: /^(none|metadata|auto)$/i,
    crossorigin: /^(anonymous|use-credentials)?$/i,
    referrerpolicy: /^(no-referrer|no-referrer-when-downgrade|origin|origin-when-cross-origin|same-origin|strict-origin|strict-origin-when-cross-origin|unsafe-url)$/i,
    kind: /^(subtitles|captions|descriptions|chapters|metadata)$/i,
    target: /^(_self|_blank)$/i,
    scope: /^(row|col|rowgroup|colgroup)$/i,
    width: SIZE_RE,
    height: SIZE_RE,
    colspan: INT_RE,
    rowspan: INT_RE,
    span: INT_RE,
    start: INT_RE,
    value: /^.{0,500}$/,
    srclang: LANG_RE,
    lang: LANG_RE,
    role: /^[a-z][a-z-]{0,40}$/,
    id: /^[A-Za-z_][\w:.\-]{0,100}$/,
    media: /^[^<>{}"`\\]{1,300}$/,
    sizes: /^[^<>{}"`\\]{1,300}$/,
    controlslist: /^[a-z\s-]{0,80}$/,
  };

  /* ---------- Trusted Types (strict CSP support) ---------- */
  let ttPolicy = null;
  // Wraps an HTML string in a TrustedHTML when the browser enforces Trusted Types.
  function trust(html) {
    if (ttPolicy === null) {
      ttPolicy = false;
      try {
        if (global.trustedTypes && global.trustedTypes.createPolicy) ttPolicy = global.trustedTypes.createPolicy("tk-editor", { createHTML: (s) => s });
      } catch (e) {
        /* policy name not allowed by the page CSP: fall back to plain strings */
      }
    }
    return ttPolicy ? ttPolicy.createHTML(html) : html;
  }

  /* ---------- URLs ---------- */
  const normalizeUrl = (v) => String(v).replace(/[\u0000-\u001f\u007f-\u009f]/g, "").trim();
  const LINK_SCHEMES = new Set(["http", "https", "mailto", "tel", "sms"]);
  const MEDIA_SCHEMES = new Set(["http", "https", "blob"]);
  const DATA_IMG_RE = /^data:image\/(png|jpe?g|gif|webp|avif|bmp|x-icon);/i;

  // Returns the normalized URL when safe, "" for empty, or null when unsafe.
  function safeUrl(value, kind, tag) {
    const v = normalizeUrl(value);
    if (!v) return "";
    const m = /^([a-zA-Z][a-zA-Z0-9+.\-]*):/.exec(v);
    if (!m) return v; // relative URL, #hash or //host
    const scheme = m[1].toLowerCase();
    if (kind === "link") return LINK_SCHEMES.has(scheme) ? v : null;
    if (MEDIA_SCHEMES.has(scheme)) return v;
    if (scheme === "data" && (tag === "img" || tag === "source") && DATA_IMG_RE.test(v)) return v;
    return null;
  }

  function safeSrcset(value, tag) {
    const parts = String(value).split(/,\s+/).map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return null;
    for (const p of parts) {
      const url = p.split(/\s+/)[0];
      if (!url || safeUrl(url, "media", tag) === null) return null;
    }
    return parts.join(", ");
  }

  // "example.com" -> https://example.com ; "a@b.com" -> mailto:a@b.com
  function normalizeHref(raw) {
    const v = normalizeUrl(raw);
    if (!v || /^([a-zA-Z][a-zA-Z0-9+.\-]*:|[#/?.])/.test(v)) return v;
    if (/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(v)) return "mailto:" + v;
    if (/^(www\.)|^[\w-]+(\.[\w-]+)+([/:?#]|$)/i.test(v)) return "https://" + v;
    return v;
  }

  /* ---------- style ---------- */
  const STYLE_ALLOWED = set(`
    color background-color text-align direction width height max-width min-width aspect-ratio object-fit object-position
    list-style-type font-weight font-style font-size line-height vertical-align
    text-decoration-line text-decoration-style text-decoration-color text-decoration-thickness text-decoration-skip-ink
    margin-top margin-right margin-bottom margin-left margin-inline-start margin-inline-end margin-block-start margin-block-end
    display float clear`);
  const STYLE_VALUE_BAD = /url\s*\(|expression|javascript|@import|\\|<|>|\/\*|attr\s*\(|image-set|var\s*\(|behavior|binding/i;
  const CSS_WIDE = /^\s*(initial|inherit|unset|revert|revert-layer)\s*$/i;
  const DISPLAY_OK = /^(block|inline|inline-block|none)$/i;

  function cleanStyle(el) {
    const st = el.style;
    if (!st) return;
    for (let i = st.length - 1; i >= 0; i--) {
      const prop = st[i];
      const val = st.getPropertyValue(prop);
      const bad =
        !STYLE_ALLOWED.has(prop) || val.length > 200 || STYLE_VALUE_BAD.test(val) || CSS_WIDE.test(val) ||
        (prop === "display" && !DISPLAY_OK.test(val.trim()));
      if (bad) st.removeProperty(prop);
    }
    if (!st.length) el.removeAttribute("style");
  }

  /* ---------- attribute cleaning (single source of truth for sanitizer + attribute dialogs) ---------- */
  function cleanAttributes(el, opts) {
    opts = opts || {};
    const tag = el.localName;
    const tagAttrs = TAG_ATTRS[tag];
    const extra = opts.extraAttrs ? new Set(opts.extraAttrs.map((s) => s.toLowerCase())) : null;
    const removed = [];

    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      let ok;
      if (opts.paste) {
        ok = (tagAttrs && tagAttrs.has(name)) || name === "dir";
      } else {
        ok =
          GLOBAL_ATTRS.has(name) ||
          (tagAttrs && tagAttrs.has(name)) ||
          (/^(data|aria)-[a-z0-9_.:\-]+$/.test(name) && !(opts.noData && name.startsWith("data-"))) ||
          (extra && extra.has(name));
      }
      if (!ok || name.startsWith("on")) {
        el.removeAttribute(attr.name);
        removed.push(attr.name);
        continue;
      }

      let bad = false;
      if (name === "href" || name === "cite") {
        const u = safeUrl(value, "link", tag);
        if (u === null) bad = true;
        else if (u !== value) el.setAttribute(attr.name, u);
      } else if (name === "src" || name === "poster") {
        const u = safeUrl(value, "media", name === "poster" ? "img" : tag);
        if (u === null) bad = true;
        else if (u !== value) el.setAttribute(attr.name, u);
      } else if (name === "srcset") {
        const s = safeSrcset(value, tag);
        if (s === null) bad = true;
        else if (s !== value) el.setAttribute(attr.name, s);
      } else if (name === "style") {
        cleanStyle(el);
        continue;
      } else if (name === "type") {
        bad = tag === "ol" ? !/^[1aAiI]$/.test(value) : !MIME_RE.test(value);
      } else if (name === "rel") {
        bad = !/^[a-zA-Z\- ]{0,80}$/.test(value);
      } else if (name === "class") {
        if (value.length > 500) bad = true;
      } else if (VALIDATORS[name]) {
        bad = !VALIDATORS[name].test(value);
        // DOM clobbering: an id such as "location" or "document" would shadow page globals where the HTML is rendered
        if (!bad && name === "id" && opts.clobber !== false && (value in document || value in window)) bad = true;
      } else if (value.length > 2000) {
        bad = true;
      }
      if (bad) {
        el.removeAttribute(attr.name);
        removed.push(attr.name);
      }
    }

    if (tag === "a" && el.getAttribute("target") === "_blank") {
      const rel = new Set((el.getAttribute("rel") || "").toLowerCase().split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      el.setAttribute("rel", [...rel].join(" "));
    }
    return removed;
  }

  /* ---------- document structure ---------- */
  const isBlankText = (n) => n.nodeType === 3 && /^[ \t\n\r\f]*$/.test(n.nodeValue);
  const hasBlockChild = (el) => {
    for (const c of el.children) if (BLOCKISH.has(c.localName)) return true;
    return false;
  };
  // A node "has text" when it contains visible text (ZWSP counts: it anchors a caret for typing)
  const hasText = (n) => (n.nodeType === 3 ? /[^ \t\n\r\f]/.test(n.nodeValue) : n.nodeType === 1 && /[^ \t\n\r\f]/.test(n.textContent));
  // Object-like: no text at all (img, picture, video, audio, br, <a><img></a>, ...)
  const isObjectLike = (n) => n.nodeType === 1 && !hasText(n);

  /**
   * Wraps runs of loose inline nodes inside `container` in <p>.
   * loose=true ("smart paragraphs"): a run WITHOUT text (e.g. a lone <img> or <br>) stays bare,
   * so inserting media never creates a pointless <p>. A run with text always becomes a <p>.
   */
  function wrapStrays(container, opts) {
    const loose = !!(opts && opts.loose);
    const doc = container.ownerDocument;
    let run = [];
    const flush = () => {
      if (!run.length) return;
      if (run.every(isBlankText)) run.forEach((n) => n.remove());
      else if (loose && !run.some(hasText)) {
        // keep bare, but drop whitespace-only text between objects
        run.forEach((n) => n.nodeType === 3 && isBlankText(n) && n.remove());
      } else {
        const p = doc.createElement("p");
        run[0].before(p);
        run.forEach((n) => p.appendChild(n));
      }
      run = [];
    };
    for (const n of Array.from(container.childNodes)) {
      const inline = n.nodeType === 3 || (n.nodeType === 1 && !BLOCKISH.has(n.localName));
      if (inline) run.push(n);
      else flush();
    }
    flush();
  }

  // Stabilizes structure: stray text goes into <p>, whitespace between blocks is removed
  function normalizeStructure(root, opts) {
    wrapStrays(root, opts);
    const q = (s) => root.querySelectorAll([...s].join(","));
    q(STRUCTURAL).forEach((el) => Array.from(el.childNodes).forEach((n) => isBlankText(n) && n.remove()));
    q(CONTAINERS).forEach((el) => {
      if (!el.firstChild) el.appendChild(el.ownerDocument.createElement("p"));
      if (hasBlockChild(el) || el.localName !== "div") wrapStrays(el, opts);
    });
    root.querySelectorAll("p,h1,h2,h3,h4,h5,h6").forEach((el) => {
      if (!el.firstChild) el.appendChild(el.ownerDocument.createElement("br"));
    });
  }

  /* ---------- sanitizer ---------- */
  function unwrapNode(el) {
    const parent = el.parentNode;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  }
  function replaceTag(el, tag) {
    const n = el.ownerDocument.createElement(tag);
    for (const a of Array.from(el.attributes)) n.setAttribute(a.name, a.value);
    while (el.firstChild) n.appendChild(el.firstChild);
    el.replaceWith(n);
    return n;
  }
  const hasMedia = (el) => !!el.querySelector("img,video,audio,picture,table,hr,br");
  const isEmptyContent = (el) => !hasMedia(el) && el.textContent.replace(/[\u200B\s]/g, "") === "";

  // paste mode: semantic styles (bold/italic/...) become real tags before styles are dropped
  function semanticWrap(el, ctx, depth) {
    const st = el.style;
    const td = st.textDecorationLine || st.textDecoration || "";
    const tags = [];
    if (/^(bold|[6-9]00)$/.test(st.fontWeight)) tags.push("strong");
    if (st.fontStyle === "italic") tags.push("em");
    if (/underline/.test(td)) tags.push("u");
    if (/line-through/.test(td)) tags.push("s");
    if (st.verticalAlign === "super") tags.push("sup");
    if (st.verticalAlign === "sub") tags.push("sub");
    const frag = el.ownerDocument.createDocumentFragment();
    let holder = frag;
    tags.forEach((t) => {
      const n = el.ownerDocument.createElement(t);
      holder.appendChild(n);
      holder = n;
    });
    while (el.firstChild) holder.appendChild(el.firstChild);
    el.replaceWith(frag);
    cleanChildren(holder, ctx, depth + 1);
  }

  // <pre>: <br> -> "\n" in the final output (proper code text); a trailing newline is dropped
  function preBreaksToNewlines(pre) {
    pre.querySelectorAll("br").forEach((br) => br.replaceWith(pre.ownerDocument.createTextNode("\n")));
    pre.normalize();
    const last = pre.lastChild;
    if (last && last.nodeType === 3 && last.nodeValue.endsWith("\n") && !/\n\n$/.test(last.nodeValue)) last.nodeValue = last.nodeValue.slice(0, -1);
  }

  function cleanChildren(parent, ctx, depth) {
    for (const node of Array.from(parent.childNodes)) {
      if (node.nodeType === 3) {
        if (ctx.output && node.nodeValue.includes(ZWSP)) node.nodeValue = node.nodeValue.split(ZWSP).join("");
        continue;
      }
      if (node.nodeType !== 1) {
        node.remove(); // comments, processing instructions, ...
        continue;
      }
      let el = node;
      let tag = el.localName;
      if (depth > 120 || DROP_TAGS.has(tag)) {
        el.remove();
        continue;
      }
      if (tag === "br" && el.hasAttribute("data-pe-ph")) {
        // editor-internal placeholder <br>: never part of the content
        if (ctx.output) {
          el.remove();
          continue;
        }
        el.removeAttribute("data-pe-ph");
      }
      if (RENAME[tag]) {
        el = replaceTag(el, RENAME[tag]);
        tag = el.localName;
      }

      if (ctx.paste) {
        if (tag === "span" || tag === "font") {
          semanticWrap(el, ctx, depth);
          continue;
        }
        if (tag === "strong" && /^(normal|[1-4]00)$/.test(el.style.fontWeight)) {
          cleanChildren(el, ctx, depth + 1);
          unwrapNode(el);
          continue;
        }
      }

      if (!ALLOWED_TAGS.has(tag) && !ctx.extraTags.has(tag)) {
        cleanChildren(el, ctx, depth + 1); // unknown tag: unwrap, keep content
        unwrapNode(el);
        continue;
      }

      cleanAttributes(el, ctx);
      cleanChildren(el, ctx, depth + 1);

      if (ctx.paste && tag === "div") {
        if (hasBlockChild(el)) unwrapNode(el);
        else replaceTag(el, "p");
        continue;
      }
      if (tag === "span" && !el.attributes.length) {
        unwrapNode(el);
        continue;
      }
      if (tag === "a" && !el.hasAttribute("href") && !el.hasAttribute("id")) {
        unwrapNode(el);
        continue;
      }
      if (tag === "img" && !el.hasAttribute("src")) {
        el.remove();
        continue;
      }
      if (tag === "source") {
        const pt = el.parentNode && el.parentNode.localName;
        const okParent = pt === "picture" || pt === "video" || pt === "audio";
        if (!okParent || (!el.hasAttribute("src") && !el.hasAttribute("srcset"))) el.remove();
        continue;
      }
      if (tag === "track") {
        const pt = el.parentNode && el.parentNode.localName;
        if ((pt !== "video" && pt !== "audio") || !el.hasAttribute("src")) el.remove();
        continue;
      }
      if (tag === "picture" && !el.querySelector("img")) {
        el.remove();
        continue;
      }
      if ((tag === "video" || tag === "audio") && !el.hasAttribute("src") && !el.querySelector("source")) {
        el.remove();
        continue;
      }
      if (tag === "pre" && ctx.output) {
        preBreaksToNewlines(el);
        continue;
      }
      if (FORMAT_INLINE.has(tag) || tag === "a") {
        if (isEmptyContent(el) && !el.hasAttribute("id")) el.remove();
        continue;
      }
      if (ctx.paste && tag === "p" && isEmptyContent(el)) el.remove();
    }
  }

  function parseFragment(html) {
    const t = document.createElement("template");
    t.innerHTML = trust(html == null ? "" : String(html));
    return t.content;
  }

  /**
   * sanitizeFragment(html, { paste, output, loose, noData, clobber, extraTags, extraAttrs, blocks })
   *  paste  - clipboard HTML: drops class/id/style, converts bold/italic spans to tags
   *  output - final serialization: strips ZWSP, editor placeholders, pre <br> -> "\n"
   *  loose  - "smart paragraphs": text-less runs (a lone <img>) stay bare instead of getting a <p>
   *  noData - drop every data-* attribute        clobber:false - allow ids like "location"
   * Returns an inert DocumentFragment.
   */
  function sanitizeFragment(html, opts) {
    opts = opts || {};
    const ctx = {
      paste: !!opts.paste,
      output: !!(opts.output || opts.zwsp),
      extraAttrs: opts.extraAttrs || null,
      extraTags: new Set((opts.extraTags || []).map((s) => s.toLowerCase())),
      clobber: opts.clobber,
      noData: !!opts.noData,
    };
    const frag = parseFragment(html);
    cleanChildren(frag, ctx, 0);
    if (opts.blocks !== false) normalizeStructure(frag, { loose: !!opts.loose });
    return frag;
  }

  function sanitizeHTML(html, opts) {
    const out = document.createElement("template");
    out.content.appendChild(sanitizeFragment(html, opts));
    return out.innerHTML;
  }

  /* ---------- serialization ---------- */
  // name="" -> name (only inside tags; user text is left untouched). alt="" stays explicit:
  // it is the accessibility marker for decorative images.
  const TAG_RE = /<[a-zA-Z][^\s\/>]*(?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*\s*\/?>/g;
  function stripEmptyAttrs(html) {
    return html.replace(TAG_RE, (tag) => tag.replace(/(\s)([^\s"'>\/=]+)=""/g, (m, sp, name) => (name.toLowerCase() === "alt" ? m : sp + name)));
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Readable HTML formatting at block level only; no whitespace is added between inline tags
  function prettyHTML(html) {
    const root = parseFragment(html);
    const lines = [];
    const TABLEISH = /^(tr|tbody|thead|tfoot|td|th|caption|colgroup|col)$/;
    const openTag = (el) => {
      const s = el.cloneNode(false).outerHTML;
      return s.slice(0, s.length - el.localName.length - 3);
    };
    const walk = (parent, depth) => {
      const ind = "  ".repeat(depth);
      let run = [];
      const flush = () => {
        if (!run.length) return;
        const tmp = document.createElement("div");
        run.forEach((n) => tmp.appendChild(n.cloneNode(true)));
        const s = tmp.innerHTML.trim();
        if (s) lines.push(ind + s);
        run = [];
      };
      for (const n of Array.from(parent.childNodes)) {
        const isBlock = n.nodeType === 1 && (BLOCKISH.has(n.localName) || TABLEISH.test(n.localName));
        if (!isBlock) {
          run.push(n);
          continue;
        }
        flush();
        const container = n.localName !== "pre" && [...n.children].some((c) => BLOCKISH.has(c.localName) || TABLEISH.test(c.localName));
        if (container) {
          lines.push(ind + openTag(n));
          walk(n, depth + 1);
          lines.push(ind + "</" + n.localName + ">");
        } else lines.push(ind + n.outerHTML);
      }
      flush();
    };
    walk(root, 0);
    return lines.join("\n");
  }

  /* ---------- misc ---------- */
  function rgbToHex(rgbStr) {
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgbStr || "");
    if (!m) return null;
    const toHex = (n) => Number(n).toString(16).padStart(2, "0");
    return "#" + toHex(m[1]) + toHex(m[2]) + toHex(m[3]);
  }

  // Tiny element builder. NOTE: sets styles via the CSSOM only (no style="" attributes) so strict CSP works.
  function h(tag, props, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "html") el.innerHTML = trust(v); // internal SVG icons only
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, "");
      else el.setAttribute(k, v);
    }
    for (const c of children.flat()) if (c != null && c !== false) el.append(c);
    return el;
  }

  function debounce(fn, ms) {
    let t;
    const d = (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms);
    };
    d.cancel = () => clearTimeout(t);
    return d;
  }

  const MIME_BY_EXT = {
    avif: "image/avif", webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", jfif: "image/jpeg", png: "image/png",
    gif: "image/gif", svg: "image/svg+xml", apng: "image/apng", bmp: "image/bmp",
    mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", ogv: "video/ogg", mov: "video/quicktime",
    mp3: "audio/mpeg", ogg: "audio/ogg", oga: "audio/ogg", opus: "audio/ogg", wav: "audio/wav", m4a: "audio/mp4", aac: "audio/aac", flac: "audio/flac", weba: "audio/webm",
  };
  function guessMime(url) {
    const dm = /^data:(image\/[\w.+-]+);/i.exec(String(url || ""));
    if (dm) return dm[1].toLowerCase();
    const m = /\.([a-z0-9]{2,5})(?:$|[?#])/i.exec(String(url || "").split(/[?#]/)[0] + (/[?#]/.test(url) ? "?" : ""));
    return m ? MIME_BY_EXT[m[1].toLowerCase()] || "" : "";
  }

  /* ---------- strict media query validation ----------
   * matchMedia is very lenient (even "banana" is accepted), so this is a small structural parser:
   * media type + known features + valid values. Nested conditions like ((a) and (b)) are not supported. */
  const MQ_TYPES = set("all screen print speech tty tv projection handheld braille embossed aural");
  const LEN = "(?:-?(?:\\d+\\.?\\d*|\\.\\d+)(?:px|em|rem|ex|ch|vw|vh|vmin|vmax|dvw|dvh|svw|svh|lvw|lvh|cm|mm|in|pt|pc|q)|0|calc\\([^()]+\\))";
  const NUM = "-?(?:\\d+\\.?\\d*|\\.\\d+)";
  const RATIO = `${NUM}(?:\\s*/\\s*${NUM})?`;
  const RES = `${NUM}(?:dppx|dpi|dpcm|x)`;
  const ENUMS = {
    orientation: "portrait|landscape", hover: "none|hover", "any-hover": "none|hover", pointer: "none|coarse|fine", "any-pointer": "none|coarse|fine",
    "prefers-color-scheme": "light|dark", "prefers-reduced-motion": "no-preference|reduce", "prefers-contrast": "no-preference|more|less|custom",
    "prefers-reduced-transparency": "no-preference|reduce", "prefers-reduced-data": "no-preference|reduce", "forced-colors": "none|active",
    "inverted-colors": "none|inverted", "display-mode": "fullscreen|standalone|minimal-ui|browser|picture-in-picture", scripting: "none|initial-only|enabled",
    update: "none|slow|fast", "overflow-block": "none|scroll|paged", "overflow-inline": "none|scroll", "dynamic-range": "standard|high",
    "video-dynamic-range": "standard|high", grid: "0|1",
  };
  const RANGE_KIND = { width: LEN, height: LEN, "device-width": LEN, "device-height": LEN, "aspect-ratio": RATIO, "device-aspect-ratio": RATIO, resolution: RES, color: "\\d+", "color-index": "\\d+", monochrome: "\\d+" };
  const WEBKIT = { "-webkit-device-pixel-ratio": NUM, "-webkit-min-device-pixel-ratio": NUM, "-webkit-max-device-pixel-ratio": NUM };

  function validFeature(inner) {
    inner = inner.trim().toLowerCase();
    const m = /^([a-z-]+)\s*(?::\s*(.+))?$/.exec(inner);
    if (m) {
      let name = m[1];
      const val = m[2] ? m[2].trim() : null;
      if (WEBKIT[name]) return val !== null && new RegExp("^" + WEBKIT[name] + "$").test(val);
      const pref = /^(min|max)-/.exec(name);
      if (pref) {
        name = name.slice(4);
        if (!RANGE_KIND[name]) return false;
      }
      if (RANGE_KIND[name]) return val === null ? !pref : new RegExp("^" + RANGE_KIND[name] + "$").test(val);
      if (ENUMS[name]) return val === null || new RegExp("^(" + ENUMS[name] + ")$").test(val);
      return false;
    }
    // range syntax: (width >= 600px) or (400px <= width <= 700px)
    const feats = Object.keys(RANGE_KIND).filter((k) => !/^device-/.test(k)).join("|");
    const anyVal = `(?:${LEN}|${RATIO}|${RES}|\\d+)`;
    const r = new RegExp(`^(?:${anyVal}\\s*(?:<=|>=|<|>|=)\\s*)?(?:${feats})(?:\\s*(?:<=|>=|<|>|=)\\s*${anyVal})?$`).exec(inner);
    return !!r && /(<=|>=|<|>|=)/.test(inner);
  }

  function validSingleMQ(s) {
    s = s.trim().toLowerCase();
    if (!s) return false;
    let bad = false;
    const skeleton = s.replace(/\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g, (all, inner) => {
      if (!validFeature(inner)) bad = true;
      return "#";
    });
    if (bad || /[()]/.test(skeleton)) return false;
    const types = [...MQ_TYPES].join("|");
    return new RegExp(`^(?:(?:(?:not|only)\\s+)?(?:${types})(?:\\s+and\\s+#)*|#(?:\\s+(?:and|or)\\s+#)*|not\\s+#)$`).test(skeleton);
  }

  function validMediaQuery(q) {
    q = String(q || "").trim();
    if (!q || q.length > 300 || /[<>{}\\"`]/.test(q.replace(/(<=|>=|<|>)/g, ""))) return false;
    let depth = 0;
    let cur = "";
    const parts = [];
    for (const ch of q) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (depth < 0) return false;
      if (ch === "," && depth === 0) {
        parts.push(cur);
        cur = "";
      } else cur += ch;
    }
    if (depth !== 0) return false;
    parts.push(cur);
    return parts.every(validSingleMQ);
  }

  function countWords(text) {
    const t = text.replace(/[\u200B\u200C\u200D]/g, "").trim();
    return t ? t.split(/\s+/).length : 0;
  }

  global.PE_Utils = {
    ZWSP, INLINE_TAGS, BLOCKISH, STRUCTURAL, CONTAINERS, FORMAT_INLINE, ALLOWED_TAGS,
    sanitizeHTML, sanitizeFragment, cleanAttributes, cleanStyle, safeUrl, safeSrcset, normalizeHref, trust,
    normalizeStructure, wrapStrays, hasBlockChild, isBlankText, hasText, isObjectLike,
    stripEmptyAttrs, escapeHtml, prettyHTML, rgbToHex, h, debounce, guessMime, validMediaQuery, countWords,
  };
})(window);
