/*!
 * pro-editor.core.js
 * ------------------------------------------------------------------
 * The ProEditor class: DOM, iframe lifecycle, events, history and the public API.
 *
 *   - builds the DOM (toolbar + sandboxed iframe + HTML source view + status bar)
 *   - iframe is isolated from page CSS, sandboxed and runs no scripts
 *   - undo/redo history that restores the caret
 *   - public API: getHTML / setHTML / getText / isEmpty / focus / command / on / destroy ...
 *
 * There is NO document.execCommand anywhere: editing uses Selection/Range and plain DOM
 * (see engine / text / list / table / section / media modules).
 *
 * Extending:
 *   ProEditor.registerButton("myBtn", { icon: "<svg>...</svg>", title: "My button", onClick(editor) {...} });
 *   new ProEditor(el, { toolbar: [["bold", "italic"], ["myBtn"]] });
 *   Object.assign(ProEditor.prototype, { myMethod() {...} });   // add modules like the pro-editor.*.js files do
 */
(function (global) {
  "use strict";

  const ICONS = global.PE_ICONS;
  const U = global.PE_Utils;
  const I18N = global.PE_I18N;
  if (!ICONS || !U || !I18N) throw new Error("ProEditor: load pro-editor.icons.js, pro-editor.i18n.js and pro-editor.utils.js before core");
  const { sanitizeHTML, sanitizeFragment, stripEmptyAttrs, prettyHTML, rgbToHex, debounce, countWords, escapeHtml } = U;

  let uid = 0;

  // Buttons with an on/off state (aria-pressed only makes sense for these)
  const TOGGLES = new Set(["bold", "italic", "underline", "strike", "mark", "sub", "sup", "code", "quote", "blockquote", "link", "ul", "ol", "source", "fullscreen", "section"]);
  // Commands that need no text selection and work in HTML source mode too
  const GLOBAL_CMDS = new Set(["source", "fullscreen"]);
  const CONTAINER_TAGS = ["section", "nav", "header", "footer", "main", "article", "aside", "div"];

  const TOOLBARS = {
    full: [
      ["block"],
      ["bold", "italic", "underline", "strike", "mark", "more"],
      ["blockquote", "link", "unlink"],
      ["ul", "ol", "marker"],
      ["align", "dir"],
      ["color", "attr"],
      ["table", "section", "hr", "br"],
      ["image", "picture", "video", "audio"],
      ["undo", "redo"],
      ["fullscreen", "source"],
    ],
    standard: [
      ["block"],
      ["bold", "italic", "underline", "strike", "more"],
      ["blockquote", "link", "unlink"],
      ["ul", "ol"],
      ["align"],
      ["table", "image", "video"],
      ["undo", "redo"],
      ["fullscreen", "source"],
    ],
    minimal: [["bold", "italic", "link"], ["ul", "ol"], ["undo", "redo"]],
  };

  /* ---------- CSS injected into the editing iframe (adoptedStyleSheets: works under strict CSP) ---------- */
  function iframeCss() {
    const labels = CONTAINER_TAGS.map((t) => `${t}::before{content:"${t}";}`).join("\n");
    const sel = CONTAINER_TAGS.join(",");
    return `
:root{color-scheme:light;--c-bg:#fff;--c-text:#1c1f26;--c-muted:#4b5563;--c-border:#dfe2e8;--c-quote-bg:#f7f8fc;--c-quote-line:#c7cdf5;
  --c-link:#3457ea;--c-sel:#cddaff;--c-code-bg:#f1f3f6;--c-mark:#fff1a8;--c-ph:#9aa0ac;--c-hover:#a9b8f7;--c-section:#b7c0f0;--c-section-bg:rgba(52,87,234,.035)}
:root[data-theme=dark]{color-scheme:dark;--c-bg:#16181d;--c-text:#e6e8ee;--c-muted:#a3a9b7;--c-border:#343944;--c-quote-bg:#1d2027;--c-quote-line:#4a55a8;
  --c-link:#8aa2ff;--c-sel:#2d3f7a;--c-code-bg:#23262e;--c-mark:#5c4f10;--c-ph:#6b7180;--c-hover:#4a5aa8;--c-section:#47508a;--c-section-bg:rgba(138,162,255,.06)}
html,body{margin:0;padding:0;background:var(--c-bg);}
body{position:relative;box-sizing:border-box;padding:18px 20px;outline:none;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,Tahoma,sans-serif;
  font-size:16px;line-height:1.8;color:var(--c-text);overflow-wrap:anywhere;caret-color:var(--c-text);}
body.pe-empty>p:first-child{position:relative;}
body.pe-empty>p:first-child::before{content:attr(data-placeholder);position:absolute;inset-inline-start:0;top:0;color:var(--c-ph);pointer-events:none;}
body[data-readonly]{cursor:default;}
p{margin:0 0 .85em;}
h1,h2,h3,h4,h5,h6{margin:1.1em 0 .5em;line-height:1.35;font-weight:700;}
h1{font-size:1.9em;} h2{font-size:1.55em;} h3{font-size:1.3em;} h4{font-size:1.15em;} h5{font-size:1.05em;} h6{font-size:.95em;color:var(--c-muted);}
li>p,li>h1,li>h2,li>h3,li>h4,li>h5,li>h6{margin:.2em 0;}
td>p:last-child,th>p:last-child{margin-bottom:0;}
blockquote{margin:1em 0;padding:.5em 1.1em;border-inline-start:3px solid var(--c-quote-line);color:var(--c-muted);background:var(--c-quote-bg);border-radius:6px;}
blockquote>:last-child{margin-bottom:0;}
q{font-style:italic;}
ul,ol{margin:.6em 0;padding-inline-start:1.6em;}
li{margin:.25em 0;} li>ul,li>ol{margin:.2em 0;}
a{color:var(--c-link);text-decoration:underline;text-underline-offset:2px;cursor:text;}
hr{border:none;border-top:2px solid var(--c-border);margin:1.4em 0;}
mark{background:var(--c-mark);color:inherit;padding:0 .15em;border-radius:3px;}
code,kbd{font-family:ui-monospace,SFMono-Regular,Consolas,Menlo,monospace;font-size:.9em;background:var(--c-code-bg);padding:.1em .35em;border-radius:4px;direction:ltr;unicode-bidi:isolate;}
pre{margin:1em 0;padding:12px 14px;background:var(--c-code-bg);border-radius:8px;overflow:auto;direction:ltr;text-align:left;font-family:ui-monospace,SFMono-Regular,Consolas,Menlo,monospace;font-size:.9em;line-height:1.7;white-space:pre-wrap;}
pre code{background:none;padding:0;}
sub{vertical-align:sub;font-size:.75em;line-height:0;}
sup{vertical-align:super;font-size:.75em;line-height:0;}
table{border-collapse:collapse;width:100%;margin:1em 0;}
table td,table th{border:1px solid var(--c-border);padding:7px 10px;min-width:32px;vertical-align:top;}
table th{background:var(--c-quote-bg);font-weight:700;}
img,video{max-width:100%;height:auto;vertical-align:middle;border-radius:6px;}
picture{display:inline-block;max-width:100%;vertical-align:middle;}
picture img{display:block;}
video{background:#000;}
audio{width:100%;max-width:100%;vertical-align:middle;}
img:hover,video:hover{outline:2px solid var(--c-hover);outline-offset:1px;}
${sel}{position:relative;display:block;margin:1.3em 0;padding:18px 18px 10px;border:1.5px dashed var(--c-section);border-radius:10px;background:var(--c-section-bg);}
${sel.split(",").map((t) => t + ">*:last-child").join(",")}{margin-bottom:0;}
${sel.split(",").map((t) => t + "::before").join(",")}{position:absolute;top:-11px;inset-inline-start:14px;background:var(--c-bg);padding:0 7px;font:11px/1.6 ui-monospace,Consolas,monospace;color:var(--c-muted);border:1px solid var(--c-border);border-radius:4px;pointer-events:none;}
${labels}
::selection{background:var(--c-sel);}
@media (max-width:420px){body{font-size:15.5px;padding:14px 15px;} h1{font-size:1.7em;} h2{font-size:1.4em;} h3{font-size:1.2em;}}
`;
  }

  class ProEditor {
    constructor(target, options = {}) {
      this.el = typeof target === "string" ? document.querySelector(target) : target;
      if (!this.el) throw new Error("ProEditor: target element not found");
      this.id = "pe-" + ++uid;
      this.options = Object.assign(
        {
          dir: null, // null = follow the page (<html dir>), falling back to ltr
          lang: null,
          locale: "en",
          messages: null, // per-instance string overrides (see pro-editor.i18n.js)
          minHeight: 260,
          maxHeight: 0, // 0 = grow with content; number = scroll inside after this height
          placeholder: null,
          initialHTML: null,
          theme: "auto", // 'auto' | 'light' | 'dark'
          toolbar: "full", // 'full' | 'standard' | 'minimal' | array of groups, e.g. [["bold","italic"],["link"]]
          statusbar: true,
          readOnly: false,
          hide: [], // hide buttons by command name, e.g. ["audio", "section"]
          // "smart": a lone <img>/<video>/<br> never gets a pointless <p> (text always does).
          // "always": every loose line is wrapped in <p> (classic behavior).
          paragraphs: "smart",
          markdown: true, // "## ", "- ", "1. ", "> ", "```" and "---" shortcuts
          autoLink: true, // pasting a URL over selected text makes a link
          syncTo: null, // textarea/input kept in sync with the HTML
          changeDelay: 250,
          allowedTags: [], // extra sanitizer tags
          allowedAttrs: [], // extra sanitizer attributes (e.g. "itemprop")
          allowData: true, // false drops every data-* attribute (some frameworks execute behavior from data-*)
          clobberProtection: true, // drop ids such as "location" / "document" that would shadow page globals
          nonce: null, // CSP nonce for the (rare) <style> fallback
          onChange: null,
          onReady: null,
          // Media manager hook: fileManager(type, ctx) -> Promise<{url, alt?, width?, height?} | null>
          //   type: 'image' | 'video' | 'audio'   ctx.purpose: 'main' | 'source' | 'poster' | 'track'
          fileManager: null,
          // Direct upload (optional): upload(file, type) -> Promise<{url, alt?, width?, height?}>
          upload: null,
        },
        options
      );
      this.options.dir = this.options.dir || document.documentElement.getAttribute("dir") || "ltr";
      this.messages = Object.assign({}, I18N.en, I18N[this.options.locale] || {}, this.options.messages || {});
      if (this.options.placeholder == null) this.options.placeholder = this.t("placeholder");
      this._smartP = this.options.paragraphs !== "always";
      this.history = [];
      this.historyIndex = -1;
      this._historySize = 0;
      this._events = {};
      this.readOnly = !!this.options.readOnly;
      this.ready = new Promise((res) => (this._resolveReady = res));
      this._buildDom();
      if (this.options.onChange) this.on("change", this.options.onChange);
      if (this.options.onReady) this.on("ready", this.options.onReady);
    }

    /* ---------- i18n ---------- */
    t(key, vars) {
      let s = this.messages[key];
      if (s == null) return key;
      if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
      return s;
    }

    /* ---------- events ---------- */
    on(evt, fn) {
      (this._events[evt] ||= []).push(fn);
      return () => this.off(evt, fn);
    }
    off(evt, fn) {
      this._events[evt] = (this._events[evt] || []).filter((f) => f !== fn);
    }
    emit(evt, ...args) {
      (this._events[evt] || []).slice().forEach((fn) => {
        try {
          fn.apply(this, args);
        } catch (err) {
          console.error("ProEditor: error in '" + evt + "' listener", err);
        }
      });
    }
    // shared sanitizer options
    _san(extra) {
      return Object.assign(
        { extraTags: this.options.allowedTags, extraAttrs: this.options.allowedAttrs, loose: this._smartP, clobber: this.options.clobberProtection !== false, noData: this.options.allowData === false },
        extra
      );
    }

    /* ---------- DOM ---------- */
    _buildDom() {
      const root = document.createElement("div");
      root.className = "pe-root";
      root.id = this.id;
      root.dir = this.options.dir;
      root.innerHTML = U.trust(`
        <div class="pe-toolbar" role="toolbar" aria-label="${escapeHtml(this.t("toolbar"))}"></div>
        <div class="pe-body-wrap">
          <iframe class="pe-iframe" title="${escapeHtml(this.t("editor"))}" sandbox="allow-same-origin" referrerpolicy="no-referrer"></iframe>
          <textarea class="pe-source" spellcheck="false" aria-label="${escapeHtml(this.t("sourceArea"))}" dir="ltr"></textarea>
          <div class="pe-table-toolbar" role="toolbar" aria-label="${escapeHtml(this.t("tableToolbar"))}"></div>
        </div>
        <div class="pe-statusbar">
          <span class="pe-status-text" role="status" aria-live="polite"></span>
          <span class="pe-status-spacer"></span>
          <span class="pe-counts"></span>
          <span class="pe-devices" role="group" aria-label="${escapeHtml(this.t("previewLabel"))}"></span>
        </div>
      `);
      this.el.appendChild(root);
      this.root = root;
      this.toolbar = root.querySelector(".pe-toolbar");
      this.iframe = root.querySelector(".pe-iframe");
      this.sourceArea = root.querySelector(".pe-source");
      this.tableToolbar = root.querySelector(".pe-table-toolbar");
      this.statusText = root.querySelector(".pe-status-text");
      this.countsEl = root.querySelector(".pe-counts");
      this.wrap = root.querySelector(".pe-body-wrap");
      if (!this.options.statusbar) root.querySelector(".pe-statusbar").hidden = true;

      this._buildToolbar();
      this._buildDevices();
      this._initTheme();
      this._initIframe();
    }

    _btn(cmd, icon, title, extra = "") {
      const pressed = TOGGLES.has(cmd) ? ' aria-pressed="false"' : "";
      const t = escapeHtml(title);
      return `<button type="button" class="pe-btn" data-cmd="${cmd}" title="${t}" aria-label="${t}"${pressed} ${extra}>${ICONS[icon]}</button>`;
    }
    _menuItem(cmd, icon, label) {
      const pressed = TOGGLES.has(cmd) ? ' aria-pressed="false"' : "";
      return `<button type="button" class="pe-btn pe-menu-item" role="menuitem" data-cmd="${cmd}"${pressed}>${ICONS[icon]}<span>${escapeHtml(label)}</span></button>`;
    }

    // Toolbar item registry: id -> (editor) => HTML string
    static get items() {
      return ITEMS;
    }

    _resolveToolbar() {
      const tb = this.options.toolbar;
      if (typeof tb === "string") return TOOLBARS[tb] || TOOLBARS.full;
      if (Array.isArray(tb) && tb.length) return tb.every((g) => Array.isArray(g)) ? tb : [tb];
      return TOOLBARS.full;
    }

    _buildToolbar() {
      const t = this.toolbar;
      const groups = this._resolveToolbar();
      t.innerHTML = U.trust(
        groups
          .map((group) => {
            const html = group
              .map((id) => {
                const make = ITEMS[id];
                if (!make) {
                  console.warn("ProEditor: unknown toolbar item '" + id + "'");
                  return "";
                }
                return make(this);
              })
              .join("");
            const end = group.includes("source") || group.includes("fullscreen") ? " pe-group-end" : "";
            return `<div class="pe-group${end}">${html}</div>`;
          })
          .join("")
      );

      (this.options.hide || []).forEach((cmd) => t.querySelectorAll(`[data-cmd="${cmd}"]`).forEach((b) => b.remove()));
      t.querySelectorAll(".pe-dropdown").forEach((d) => {
        if (!d.querySelector(".pe-dropdown-menu .pe-btn")) d.remove();
      });
      t.querySelectorAll(".pe-group").forEach((g) => {
        if (!g.querySelector("button,select,input")) g.remove();
      });

      // keep the editor selection when clicking toolbar buttons
      t.addEventListener("mousedown", (e) => {
        if (e.target.closest(".pe-btn")) e.preventDefault();
      });
      t.addEventListener("click", (e) => {
        const trigger = e.target.closest(".pe-dropdown-trigger");
        if (trigger) {
          const dd = trigger.closest(".pe-dropdown");
          const wasOpen = dd.classList.contains("pe-open");
          this._closeMenus();
          if (!wasOpen) this._openMenu(dd);
          return;
        }
        const btn = e.target.closest(".pe-btn");
        if (btn && !btn.disabled) {
          this._closeMenus();
          this._runCommand(btn.dataset.cmd, btn, e.detail > 0);
        }
      });
      t.addEventListener("change", (e) => {
        if (this.readOnly) return;
        const target = e.target;
        const c = target.dataset.cmd;
        this.flushHistory();
        try {
          if (c === "block") this.applyBlock(target.value);
          if (c === "marker") this.applyListMarker(target.value);
          if (c === "color") this.applyColor(target.value);
        } catch (err) {
          console.error("ProEditor:", err);
        }
        this.focusBody();
      });
      t.addEventListener("keydown", (e) => this._toolbarKeys(e));

      this._outsideHandler = (e) => {
        if (!e.target.closest || !e.target.closest(".pe-dropdown")) this._closeMenus();
      };
      document.addEventListener("mousedown", this._outsideHandler);

      this.blockSelect = t.querySelector('[data-cmd="block"]');
      this.markerSelect = t.querySelector('[data-cmd="marker"]');
      this.colorInput = t.querySelector('[data-cmd="color"]');
      this._initRoving();
    }

    /* Dropdowns use position: fixed so a scrolling toolbar (mobile) cannot clip them */
    _openMenu(dd) {
      const trigger = dd.querySelector(".pe-dropdown-trigger");
      const menu = dd.querySelector(".pe-dropdown-menu");
      dd.classList.add("pe-open");
      trigger.setAttribute("aria-expanded", "true");
      const r = trigger.getBoundingClientRect();
      menu.style.top = r.bottom + 6 + "px";
      const mw = menu.offsetWidth;
      let left = this.options.dir === "rtl" ? r.right - mw : r.left;
      left = Math.max(8, Math.min(left, window.innerWidth - mw - 8));
      menu.style.left = left + "px";
      const first = menu.querySelector(".pe-btn");
      if (first) first.focus();
    }
    _closeMenus() {
      this.toolbar.querySelectorAll(".pe-dropdown.pe-open").forEach((d) => {
        d.classList.remove("pe-open");
        d.querySelector(".pe-dropdown-trigger").setAttribute("aria-expanded", "false");
      });
    }

    /* Keyboard navigation inside the toolbar (WAI-ARIA toolbar pattern) */
    _toolbarItems() {
      return [...this.toolbar.querySelectorAll(".pe-btn, .pe-select, .pe-color-input")].filter((el) => !el.closest(".pe-dropdown-menu") && !el.disabled);
    }
    _initRoving() {
      const items = [...this.toolbar.querySelectorAll(".pe-btn, .pe-select, .pe-color-input")].filter((el) => !el.closest(".pe-dropdown-menu"));
      items.forEach((el, i) => el.setAttribute("tabindex", i === 0 ? "0" : "-1"));
      this.toolbar.addEventListener("focusin", (e) => {
        if (e.target.closest(".pe-dropdown-menu")) return;
        items.forEach((el) => el.setAttribute("tabindex", el === e.target ? "0" : "-1"));
      });
    }
    _toolbarKeys(e) {
      const menu = e.target.closest(".pe-dropdown-menu");
      if (e.key === "Escape") {
        const dd = e.target.closest(".pe-dropdown");
        this._closeMenus();
        if (dd) dd.querySelector(".pe-dropdown-trigger").focus();
        return;
      }
      const rtl = this.options.dir === "rtl";
      if (menu) {
        const items = [...menu.querySelectorAll(".pe-btn")];
        const i = items.indexOf(e.target);
        const next = e.key === "ArrowDown" || e.key === (rtl ? "ArrowLeft" : "ArrowRight");
        const prev = e.key === "ArrowUp" || e.key === (rtl ? "ArrowRight" : "ArrowLeft");
        if (next || prev) {
          e.preventDefault();
          items[(i + (next ? 1 : -1) + items.length) % items.length].focus();
        }
        return;
      }
      if (e.target.tagName === "SELECT" && (e.key === "ArrowUp" || e.key === "ArrowDown")) return;
      const keys = rtl ? { ArrowRight: -1, ArrowLeft: 1 } : { ArrowRight: 1, ArrowLeft: -1 };
      const items = this._toolbarItems();
      const i = items.indexOf(e.target.closest(".pe-btn, .pe-select, .pe-color-input"));
      if (i < 0) return;
      let n = null;
      if (keys[e.key]) n = (i + keys[e.key] + items.length) % items.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = items.length - 1;
      if (n !== null) {
        e.preventDefault();
        items[n].focus();
      }
    }

    // Commands run inside try/catch: if an optional module is not loaded, the rest keeps working.
    _commands() {
      return {
        bold: () => this.toggleFormat("bold"),
        italic: () => this.toggleFormat("italic"),
        underline: () => this.toggleFormat("underline"),
        strike: () => this.toggleFormat("strike"),
        mark: () => this.toggleFormat("mark"),
        sub: () => this.toggleFormat("sub"),
        sup: () => this.toggleFormat("sup"),
        code: () => this.toggleFormat("code"),
        quote: () => this.toggleFormat("q"),
        clearFormat: () => this.clearFormat(),
        blockquote: () => this.toggleBlockquote(),
        link: () => this.openLinkModal(),
        unlink: () => this.removeLink(),
        ul: () => this.toggleList("ul"),
        ol: () => this.toggleList("ol"),
        section: () => this.insertSection(),
        image: () => this.openMediaDialog("image"),
        picture: () => this.openMediaDialog("picture"),
        video: () => this.openMediaDialog("video"),
        audio: () => this.openMediaDialog("audio"),
        alignRight: () => this.setAlign("right"),
        alignCenter: () => this.setAlign("center"),
        alignLeft: () => this.setAlign("left"),
        alignJustify: () => this.setAlign("justify"),
        dir: () => this.toggleDir(),
        attr: () => this.openAttributeModal(),
        table: () => this.openTableModal(),
        br: () => this.insertBreak(),
        hr: () => this.insertHR(),
        undo: () => this.undo(),
        redo: () => this.redo(),
        source: () => this.toggleSource(),
        fullscreen: () => this.toggleFullscreen(),
      };
    }

    _runCommand(cmd, btn, viaPointer) {
      const custom = ProEditor._buttons[cmd];
      const fn = custom ? () => custom.onClick(this) : this._commands()[cmd];
      if (!fn) return;
      const inSource = this.root.classList.contains("pe-source-mode");
      if ((this.readOnly || inSource) && !GLOBAL_CMDS.has(cmd)) return;
      if (!GLOBAL_CMDS.has(cmd)) {
        if (!this.getRange()) this._placeCaretAtEnd();
        this.flushHistory();
      }
      const fail = (err) => console.error(`ProEditor: command "${cmd}" failed. Is the matching module loaded?`, err);
      try {
        const r = fn();
        if (r && typeof r.catch === "function") r.catch(fail);
      } catch (err) {
        fail(err);
      }
      if (viaPointer && !this._dialogOpen && !GLOBAL_CMDS.has(cmd)) this.focusBody();
      this._refreshToolbarState();
    }

    // Run any toolbar command from code: editor.command("bold"), editor.command("ul"), ...
    command(name) {
      this._runCommand(name, null, false);
    }

    /* ---------- iframe ---------- */
    _initIframe() {
      this.iframe.addEventListener("load", () => this._onIframeReady(), { once: true });
      this.iframe.srcdoc = U.trust('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
    }

    _applyIframeStyles() {
      const css = iframeCss();
      try {
        const sheet = new this.win.CSSStyleSheet();
        sheet.replaceSync(css);
        this.doc.adoptedStyleSheets = [sheet];
      } catch (e) {
        const st = this.doc.createElement("style");
        if (this.options.nonce) st.setAttribute("nonce", this.options.nonce);
        st.textContent = css;
        this.doc.head.appendChild(st);
      }
    }

    _onIframeReady() {
      const win = this.iframe.contentWindow;
      const doc = this.iframe.contentDocument;
      const o = this.options;
      this.win = win;
      this.doc = doc;
      this.body = doc.body;
      this._composing = false;
      this._applyIframeStyles();
      doc.documentElement.setAttribute("dir", o.dir);
      doc.documentElement.setAttribute("lang", o.lang || document.documentElement.lang || "en");
      this.body.setAttribute("contenteditable", "true");
      this.body.setAttribute("spellcheck", "true");
      this.body.setAttribute("role", "textbox");
      this.body.setAttribute("aria-multiline", "true");
      this.body.setAttribute("aria-label", o.placeholder);
      this.body.setAttribute("data-placeholder", o.placeholder);
      this.body.style.minHeight = (+o.minHeight || 260) + "px";

      const deb = debounce(() => this._flushChange(), o.changeDelay);
      this._emitChange = () => {
        this._dirty = true;
        deb();
      };
      this._emitChange.cancel = deb.cancel;
      this._updateCounts = debounce(() => this._doUpdateCounts(), 300);

      this._syncEl = o.syncTo ? (typeof o.syncTo === "string" ? document.querySelector(o.syncTo) : o.syncTo) : null;
      let initial = o.initialHTML;
      if (initial == null && this._syncEl && this._syncEl.value) initial = this._syncEl.value;
      if (this._syncEl && this._syncEl.form) {
        this._formHandler = () => this._flushChange(true);
        this._syncEl.form.addEventListener("submit", this._formHandler);
      }
      this._loadHTML(initial || "");
      this._applyTheme();
      this.setReadOnly(this.readOnly);

      doc.addEventListener("beforeinput", (e) => this._onBeforeInput(e));
      doc.addEventListener("keydown", (e) => this._onKeydown(e));
      doc.addEventListener("input", () => {
        if (this._composing) return;
        this._afterEdit();
      });
      doc.addEventListener("compositionstart", () => (this._composing = true));
      doc.addEventListener("compositionend", () => {
        this._composing = false;
        this._afterEdit();
      });
      doc.addEventListener("paste", (e) => this._onPaste(e));
      doc.addEventListener("copy", (e) => this._onCopy(e, false));
      doc.addEventListener("cut", (e) => this._onCopy(e, true));
      doc.addEventListener("dragover", (e) => {
        if (e.dataTransfer && [...e.dataTransfer.types].includes("Files")) e.preventDefault();
      });
      doc.addEventListener("drop", (e) => this._onDrop(e));
      doc.addEventListener("selectionchange", () => this._refreshToolbarState());
      doc.addEventListener("mousedown", () => this._closeMenus());
      doc.addEventListener("focusin", () => {
        this.root.classList.add("pe-focused");
        this.emit("focus", this);
      });
      doc.addEventListener("focusout", () => {
        this.root.classList.remove("pe-focused");
        this.emit("blur", this);
      });
      doc.addEventListener("click", (e) => {
        this._refreshToolbarState();
        if (typeof this._onMediaClick === "function") this._onMediaClick(e);
      });
      doc.addEventListener("dblclick", (e) => {
        if (typeof this._onMediaDblClick === "function") this._onMediaDblClick(e);
      });
      win.addEventListener("scroll", () => this._repositionOverlays(), { passive: true });

      // The ResizeObserver is created inside the iframe window so it observes that document correctly.
      // Auto-height stays correct even when an image finishes loading later.
      this._ro = new win.ResizeObserver(() => this._syncHeight());
      this._ro.observe(doc.body);
      this._ro.observe(doc.documentElement);
      this._rootRo = new ResizeObserver(() => this._repositionOverlays());
      this._rootRo.observe(this.iframe);

      this._escHandler = (e) => {
        if (e.key === "Escape" && this.root.classList.contains("pe-fullscreen") && !this._dialogOpen) this.toggleFullscreen(false);
      };
      document.addEventListener("keydown", this._escHandler);
      doc.addEventListener("keydown", this._escHandler);

      if (typeof this._initMediaOverlay === "function") this._initMediaOverlay();
      if (typeof this._initContainerToolbar === "function") this._initContainerToolbar();

      this.pushHistory(true);
      this._syncHeight();
      this._refreshToolbarState();
      this._doUpdateCounts();
      this.emit("ready", this);
      this._resolveReady(this);
    }

    _loadHTML(html) {
      const frag = sanitizeFragment(html, this._san());
      this.body.replaceChildren(this.doc.importNode(frag, true));
      if (!this.body.firstChild) this._resetEmptyBody();
      this._updatePlaceholder();
    }
    _resetEmptyBody() {
      const p = this.doc.createElement("p");
      p.appendChild(this.doc.createElement("br"));
      this.body.replaceChildren(p);
      return p;
    }

    _syncHeight() {
      if (!this.body) return;
      const max = this.options.maxHeight;
      const fs = this.root.classList.contains("pe-fullscreen");
      let hgt = Math.max(+this.options.minHeight || 0, Math.ceil(this.body.getBoundingClientRect().height));
      if (max && !fs) hgt = Math.min(hgt, max);
      this.iframe.style.height = hgt + "px";
      this._repositionOverlays();
    }

    _repositionOverlays() {
      if (this._positionTableToolbar) this._positionTableToolbar();
      if (this._positionContainerToolbar) this._positionContainerToolbar();
      if (this._activeMedia && typeof this._positionMediaOverlay === "function") this._positionMediaOverlay();
    }

    focusBody() {
      if (this.root.classList.contains("pe-source-mode")) this.sourceArea.focus();
      else if (this.win) {
        this.win.focus();
        this.body.focus({ preventScroll: true });
      }
    }
    focus() {
      this.focusBody();
    }

    /* ---------- theme / modes ---------- */
    _initTheme() {
      this._mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
      this._mqHandler = () => this._applyTheme();
      if (this._mq && this._mq.addEventListener) this._mq.addEventListener("change", this._mqHandler);
      this._applyTheme();
    }
    _applyTheme() {
      const pref = this.options.theme;
      const dark = pref === "dark" || (pref === "auto" && this._mq && this._mq.matches);
      this.root.dataset.theme = dark ? "dark" : "light";
      if (this.doc) this.doc.documentElement.dataset.theme = dark ? "dark" : "light";
    }
    setTheme(theme) {
      this.options.theme = theme;
      this._applyTheme();
    }

    setReadOnly(flag) {
      this.readOnly = !!flag;
      this.root.classList.toggle("pe-readonly", this.readOnly);
      if (this.body) {
        this.body.contentEditable = this.readOnly ? "false" : "true";
        this.body.toggleAttribute("data-readonly", this.readOnly);
      }
      this.toolbar.querySelectorAll(".pe-btn,.pe-select,.pe-color-input").forEach((el) => {
        if (!GLOBAL_CMDS.has(el.dataset.cmd)) el.toggleAttribute("data-ro", this.readOnly);
      });
      this.root.toggleAttribute("data-readonly", this.readOnly);
      if (this.readOnly) this._repositionOverlays();
    }

    toggleFullscreen(force) {
      const on = typeof force === "boolean" ? force : !this.root.classList.contains("pe-fullscreen");
      this.root.classList.toggle("pe-fullscreen", on);
      document.documentElement.classList.toggle("pe-lock-scroll", on);
      const b = this.toolbar.querySelector('[data-cmd="fullscreen"]');
      if (b) {
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.innerHTML = U.trust(ICONS[on ? "fullscreenExit" : "fullscreen"]);
        const label = this.t(on ? "fullscreenExit" : "fullscreen");
        b.title = label;
        b.setAttribute("aria-label", label);
      }
      this._syncHeight();
    }

    /* Responsive preview: narrows the iframe so media queries are genuinely re-evaluated */
    _buildDevices() {
      const box = this.root.querySelector(".pe-devices");
      [
        ["desktop", null, "previewDesktop"],
        ["tablet", 768, "previewTablet"],
        ["mobile", 375, "previewMobile"],
      ].forEach(([icon, w, key]) => {
        const title = this.t(key);
        const b = U.h("button", { type: "button", class: "pe-dev", title, "aria-label": title, "aria-pressed": w === null ? "true" : "false", html: ICONS[icon] });
        b.dataset.w = w || "";
        b.addEventListener("click", () => this.setPreviewWidth(w));
        box.appendChild(b);
      });
    }
    setPreviewWidth(w) {
      this.iframe.style.width = w ? w + "px" : "";
      this.root.classList.toggle("pe-previewing", !!w);
      this.root.querySelectorAll(".pe-dev").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.w === (w || 0))));
      this._syncHeight();
    }

    /* ---------- selection ---------- */
    getRange() {
      if (!this.win) return null;
      const sel = this.win.getSelection();
      if (!sel || !sel.rangeCount) return null;
      const r = sel.getRangeAt(0);
      return this.body.contains(r.commonAncestorContainer) ? r : null;
    }
    setRange(r) {
      const sel = this.win.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
    }
    _placeCaretAtEnd() {
      this.focusBody();
      const r = this.doc.createRange();
      r.selectNodeContents(this.body);
      r.collapse(false);
      const last = this.body.lastElementChild;
      if (last) {
        r.selectNodeContents(last);
        r.collapse(false);
      }
      this.setRange(r);
    }
    // Save / restore the selection (dialogs steal focus)
    _saveSel() {
      const r = this.getRange();
      return r ? r.cloneRange() : null;
    }
    _restoreSel(saved) {
      this.focusBody();
      if (saved && saved.startContainer.isConnected && saved.endContainer.isConnected) {
        try {
          this.setRange(saved);
          return true;
        } catch (e) {
          /* ignore */
        }
      }
      if (!this.getRange()) this._placeCaretAtEnd();
      return false;
    }
    // Run a DOM change that moves nodes (and would reset the selection) while keeping the selection
    _preserveSel(fn) {
      const r = this.getRange();
      const s = r && { sc: r.startContainer, so: r.startOffset, ec: r.endContainer, eo: r.endOffset };
      const res = fn();
      if (s && s.sc.isConnected && s.ec.isConnected) {
        const n = this.doc.createRange();
        try {
          n.setStart(s.sc, Math.min(s.so, s.sc.nodeType === 3 ? s.sc.length : s.sc.childNodes.length));
          n.setEnd(s.ec, Math.min(s.eo, s.ec.nodeType === 3 ? s.ec.length : s.ec.childNodes.length));
          this.setRange(n);
        } catch (e) {
          /* ignore */
        }
      }
      return res;
    }

    /* ---------- input events ---------- */
    _onBeforeInput(e) {
      if (this.readOnly) return;
      const t = e.inputType;
      const map = { formatBold: "bold", formatItalic: "italic", formatUnderline: "underline", formatStrikeThrough: "strike", formatSubscript: "sub", formatSuperscript: "sup" };
      if (map[t]) {
        e.preventDefault();
        this.flushHistory();
        this.toggleFormat(map[t]);
      } else if (t === "historyUndo") {
        e.preventDefault();
        this.undo();
      } else if (t === "historyRedo") {
        e.preventDefault();
        this.redo();
      } else if (t === "insertParagraph") {
        e.preventDefault();
        this._enter();
      } else if (t === "insertLineBreak") {
        e.preventDefault();
        this._shiftEnter();
      } else if (t === "insertText" && e.data === " " && this.options.markdown && this._markdownShortcut()) {
        e.preventDefault();
      } else if (t === "formatJustifyLeft" || t === "formatJustifyRight" || t === "formatJustifyCenter" || t === "formatJustifyFull") {
        e.preventDefault();
        this.setAlign({ formatJustifyLeft: "left", formatJustifyRight: "right", formatJustifyCenter: "center", formatJustifyFull: "justify" }[t]);
      }
    }

    _onKeydown(e) {
      if (this.readOnly) return;
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (mod && !e.altKey) {
        if (k === "z") {
          e.preventDefault();
          e.shiftKey ? this.redo() : this.undo();
          return;
        }
        if (k === "y") {
          e.preventDefault();
          this.redo();
          return;
        }
        const fmt = { b: "bold", i: "italic", u: "underline" }[k];
        if (fmt && !e.shiftKey) {
          e.preventDefault();
          this.flushHistory();
          this.toggleFormat(fmt);
          return;
        }
        if (k === "k" && !e.shiftKey) {
          e.preventDefault();
          this.flushHistory();
          this.openLinkModal();
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          this.insertBreak();
          return;
        }
      }
      if (e.key === "Enter" && e.shiftKey && !e.isComposing) {
        e.preventDefault();
        this._shiftEnter();
        return;
      }
      if (e.key === "Tab" && !e.isComposing) {
        if (this._onTab && this._onTab(e)) e.preventDefault();
        return;
      }
      if (/^Arrow/.test(e.key) && !mod && !e.altKey && !e.shiftKey && !e.isComposing && this._onArrow && this._onArrow(e)) {
        e.preventDefault();
        return;
      }
      if (e.key === "Escape" && this._activeMedia && this._hideMediaOverlay) this._hideMediaOverlay();
    }

    _afterEdit() {
      this._ensureBlocksAtCaret();
      this._updatePlaceholder();
      this.scheduleHistory();
      this._emitChange();
      this._updateCounts();
    }

    _updatePlaceholder() {
      if (!this.body) return;
      const b = this.body;
      const empty = b.childNodes.length <= 1 && (!b.firstChild || (b.firstChild.localName === "p" && this.isBlockEmpty(b.firstChild)));
      b.classList.toggle("pe-empty", empty);
    }

    _onDrop(e) {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length) {
        e.preventDefault();
        let r = null;
        if (this.doc.caretRangeFromPoint) r = this.doc.caretRangeFromPoint(e.clientX, e.clientY);
        else if (this.doc.caretPositionFromPoint) {
          const p = this.doc.caretPositionFromPoint(e.clientX, e.clientY);
          if (p) {
            r = this.doc.createRange();
            r.setStart(p.offsetNode, p.offset);
          }
        }
        if (r) {
          r.collapse(true);
          this.setRange(r);
        }
        this._handleFiles(dt.files);
        return;
      }
      // Internal text move or external HTML drop: re-sanitize the whole document afterwards
      setTimeout(() => {
        const before = this.body.innerHTML;
        const clean = sanitizeHTML(before, this._san());
        if (clean !== before) this._loadHTML(clean);
        this._afterEdit();
      }, 0);
    }

    /* ---------- history (undo / redo) ---------- */
    _pathOf(node) {
      const path = [];
      while (node && node !== this.body) {
        const p = node.parentNode;
        path.unshift(Array.prototype.indexOf.call(p.childNodes, node));
        node = p;
      }
      return node === this.body ? path : null;
    }
    _nodeAt(path) {
      let n = this.body;
      for (const i of path) {
        if (!n.childNodes[i]) return n;
        n = n.childNodes[i];
      }
      return n;
    }
    _snapshotSel() {
      const r = this.getRange();
      if (!r) return null;
      const s = this._pathOf(r.startContainer);
      const e = this._pathOf(r.endContainer);
      return s && e ? { s, so: r.startOffset, e, eo: r.endOffset } : null;
    }
    _restoreSnapshotSel(sel) {
      if (!sel) return;
      try {
        const sc = this._nodeAt(sel.s);
        const ec = this._nodeAt(sel.e);
        const len = (n) => (n.nodeType === 3 ? n.length : n.childNodes.length);
        const r = this.doc.createRange();
        r.setStart(sc, Math.min(sel.so, len(sc)));
        r.setEnd(ec, Math.min(sel.eo, len(ec)));
        this.setRange(r);
      } catch (e) {
        /* ignore */
      }
    }

    pushHistory(force = false) {
      if (!this.body || this._composing) return;
      this.body.normalize();
      const html = this.body.innerHTML;
      const cur = this.history[this.historyIndex];
      if (!force && cur && cur.html === html) {
        cur.sel = this._snapshotSel() || cur.sel;
        return;
      }
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push({ html, sel: this._snapshotSel() });
      this._historySize = this.history.reduce((a, x) => a + x.html.length, 0);
      while (this.history.length > 200 || (this._historySize > 8e6 && this.history.length > 2)) {
        this._historySize -= this.history.shift().html.length;
      }
      this.historyIndex = this.history.length - 1;
      this._updateUndoButtons();
    }
    scheduleHistory() {
      clearTimeout(this._historyTimer);
      this._historyTimer = setTimeout(() => this.pushHistory(), 350);
    }
    flushHistory() {
      if (this._historyTimer) {
        clearTimeout(this._historyTimer);
        this._historyTimer = null;
        this.pushHistory();
      }
    }
    // Called after every programmatic edit: records history now and announces the change
    commit() {
      this._updatePlaceholder();
      clearTimeout(this._historyTimer);
      this._historyTimer = null;
      this.pushHistory();
      this._emitChange();
      this._updateCounts();
      this._syncHeight();
      this._refreshToolbarState();
    }

    _restoreEntry(entry) {
      if (typeof this._hideMediaOverlay === "function") this._hideMediaOverlay();
      this.body.innerHTML = U.trust(entry.html);
      this._restoreSnapshotSel(entry.sel);
      this._updatePlaceholder();
      this._emitChange();
      this._updateCounts();
      this._updateUndoButtons();
      this._refreshToolbarState();
    }
    undo() {
      this.flushHistory();
      if (this.historyIndex <= 0) return;
      this.historyIndex--;
      this._restoreEntry(this.history[this.historyIndex]);
    }
    redo() {
      this.flushHistory();
      if (this.historyIndex >= this.history.length - 1) return;
      this.historyIndex++;
      this._restoreEntry(this.history[this.historyIndex]);
    }
    _updateUndoButtons() {
      const u = this.toolbar.querySelector('[data-cmd="undo"]');
      const r = this.toolbar.querySelector('[data-cmd="redo"]');
      if (u) u.disabled = this.historyIndex <= 0;
      if (r) r.disabled = this.historyIndex >= this.history.length - 1;
    }

    /* ---------- HTML source view ---------- */
    toggleSource() {
      const entering = !this.root.classList.contains("pe-source-mode");
      const sourceBtn = this.toolbar.querySelector('[data-cmd="source"]');
      if (typeof this._hideMediaOverlay === "function") this._hideMediaOverlay();
      const setLabel = (key) => {
        if (!sourceBtn) return;
        sourceBtn.title = this.t(key);
        sourceBtn.setAttribute("aria-label", sourceBtn.title);
        sourceBtn.setAttribute("aria-pressed", key === "sourceBack" ? "true" : "false");
      };
      if (entering) {
        this.flushHistory();
        this.sourceArea.value = prettyHTML(this.getHTML());
        this.root.classList.add("pe-source-mode");
        this.tableToolbar.classList.remove("pe-visible");
        if (this._containerToolbar) this._containerToolbar.classList.remove("pe-visible");
        setLabel("sourceBack");
        this.sourceArea.style.height = Math.max(this.options.minHeight, this.iframe.offsetHeight) + "px";
        this.sourceArea.focus();
      } else {
        this._loadHTML(this.sourceArea.value);
        this.root.classList.remove("pe-source-mode");
        setLabel("source");
        this.pushHistory(true);
        this._emitChange();
        this._updateCounts();
        this._syncHeight();
        this.focusBody();
      }
    }

    /* ---------- toolbar state (coalesced with rAF) ---------- */
    _refreshToolbarState() {
      if (this._refreshScheduled) return;
      this._refreshScheduled = true;
      requestAnimationFrame(() => {
        this._refreshScheduled = false;
        this._doRefreshToolbarState();
      });
    }

    _doRefreshToolbarState() {
      if (!this.doc || !this.win) return;
      const range = this.getRange();
      if (this._activeMedia && typeof this._mediaStillSelected === "function" && !this._mediaStillSelected(range)) this._hideMediaOverlay();
      const isAct = (n) => (typeof this.isFormatActive === "function" ? this.isFormatActive(n, range) : false);
      ["bold", "italic", "underline", "strike", "mark", "sub", "sup", "code"].forEach((n) => this._setPressed(n, !!range && isAct(n)));
      this._setPressed("quote", !!range && isAct("q"));

      let el = null;
      if (range) {
        const node = range.startContainer;
        el = node.nodeType === 3 ? node.parentElement : node;
      }
      const media = this._activeMedia && this._activeMedia.isConnected ? this._activeMedia : null;
      this._setPressed("link", !!((el && el.closest("a")) || (media && media.closest("a"))));
      this._setPressed("blockquote", !!(el && el.closest("blockquote")));
      this._setPressed("section", !!(el && el.closest(CONTAINER_TAGS.join(","))));
      const listEl = el && el.closest("ul,ol");
      this._setPressed("ul", !!(listEl && listEl.tagName === "UL"));
      this._setPressed("ol", !!(listEl && listEl.tagName === "OL"));
      if (this.markerSelect && typeof this._populateMarkerOptions === "function") {
        if (listEl) this._populateMarkerOptions(listEl.tagName === "OL" ? "ol" : "ul", listEl.style.listStyleType);
        else this._populateMarkerOptions(null);
      }

      if (this.blockSelect) {
        const block = el && el.closest("p,h1,h2,h3,h4,h5,h6,pre");
        const inCell = !!(el && el.closest("li,td,th"));
        const plain = this.blockSelect.querySelector('option[value=""]');
        if (plain) plain.hidden = !inCell;
        if (block) this.blockSelect.value = block.tagName.toLowerCase();
        else if (inCell) this.blockSelect.value = "";
        else if (!el) this.blockSelect.value = "p";
        else this.blockSelect.selectedIndex = -1;
      }
      if (el && this.colorInput) {
        const hex = rgbToHex(this.win.getComputedStyle(el).color);
        if (hex) this.colorInput.value = hex;
      }
      Object.keys(ProEditor._buttons).forEach((id) => {
        const b = ProEditor._buttons[id];
        if (b.isActive) this._setPressed(id, !!b.isActive(this));
      });
      this._updateAlignTrigger(el);
      this._repositionOverlays();
    }

    _updateAlignTrigger(el) {
      const iconEl = this.toolbar.querySelector(".pe-align-icon");
      if (!iconEl) return;
      let active = this.options.dir === "rtl" ? "alignRight" : "alignLeft";
      const leaf = el && typeof this.leafBlock === "function" ? this.leafBlock(el) : null;
      if (leaf) {
        const cs = this.win.getComputedStyle(leaf);
        let a = cs.textAlign;
        const rtl = cs.direction === "rtl";
        if (a === "start" || a === "match-parent") a = rtl ? "right" : "left";
        else if (a === "end") a = rtl ? "left" : "right";
        active = { right: "alignRight", left: "alignLeft", center: "alignCenter", justify: "alignJustify" }[a] || active;
      }
      if (this._alignShown !== active) {
        iconEl.innerHTML = U.trust(ICONS[active]);
        this._alignShown = active;
      }
    }

    _setPressed(cmd, state) {
      const btn = this.toolbar.querySelector(`[data-cmd="${cmd}"]`);
      if (btn && btn.hasAttribute("aria-pressed")) btn.setAttribute("aria-pressed", state ? "true" : "false");
    }

    /* ---------- status bar ---------- */
    _doUpdateCounts() {
      if (!this.body || !this.options.statusbar) return;
      const text = this.body.textContent || "";
      const loc = this.options.lang || undefined;
      this.countsEl.textContent = this.t("words", { words: countWords(text).toLocaleString(loc), chars: text.replace(/[\u200B]/g, "").length.toLocaleString(loc) });
    }
    // Short non-blocking message (instead of alert)
    _toast(msg, type = "info") {
      this.statusText.textContent = msg;
      this.statusText.dataset.type = type;
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        this.statusText.textContent = "";
        delete this.statusText.dataset.type;
      }, 6000);
    }

    /* ---------- public API ---------- */
    getHTML() {
      const raw = this.root.classList.contains("pe-source-mode") ? this.sourceArea.value : this.body ? this.body.innerHTML : this.options.initialHTML || "";
      return stripEmptyAttrs(sanitizeHTML(raw, this._san({ output: true })));
    }
    setHTML(html) {
      if (this.body) {
        this._loadHTML(html);
        this.pushHistory(true);
        this._emitChange();
        if (this._syncEl) this._flushChange(); // explicit call: update the textarea right now
        this._updateCounts();
        this._syncHeight();
      } else this.options.initialHTML = html;
    }
    getText() {
      return this.body ? (this.body.textContent || "").replace(/\u200B/g, "").trim() : "";
    }
    isEmpty() {
      if (!this.body) return true;
      return this.getText() === "" && !this.body.querySelector("img,video,audio,picture,table,hr");
    }
    // Update the linked textarea now (before form validation/submit). No-op when nothing is pending.
    sync(force) {
      if (this._dirty || force) this._flushChange(true);
    }
    _flushChange(syncOnly) {
      this._dirty = false;
      const html = this.getHTML();
      if (this._syncEl) this._syncEl.value = this.isEmpty() ? "" : html; // empty = "" so `required` validation works
      if (!syncOnly) this.emit("change", html);
    }

    destroy() {
      this.emit("destroy", this);
      document.removeEventListener("mousedown", this._outsideHandler);
      document.removeEventListener("keydown", this._escHandler);
      if (this._mq && this._mq.removeEventListener) this._mq.removeEventListener("change", this._mqHandler);
      if (this._formHandler && this._syncEl && this._syncEl.form) this._syncEl.form.removeEventListener("submit", this._formHandler);
      if (this._ro) this._ro.disconnect();
      if (this._rootRo) this._rootRo.disconnect();
      clearTimeout(this._historyTimer);
      if (this._emitChange && this._emitChange.cancel) this._emitChange.cancel();
      if (this.root.classList.contains("pe-fullscreen")) document.documentElement.classList.remove("pe-lock-scroll");
      this.root.remove();
      this._events = {};
    }
  }

  /* ---------- toolbar item registry ---------- */
  const ITEMS = {
    block: (ed) =>
      `<select class="pe-select" data-cmd="block" title="${escapeHtml(ed.t("block"))}" aria-label="${escapeHtml(ed.t("block"))}">` +
      ["p", "h1", "h2", "h3", "h4", "h5", "h6", "pre"].map((v) => `<option value="${v}">${escapeHtml(ed.t(v))}</option>`).join("") +
      `<option value="" hidden>${escapeHtml(ed.t("plain"))}</option></select>`,
    bold: (ed) => ed._btn("bold", "bold", ed.t("bold")),
    italic: (ed) => ed._btn("italic", "italic", ed.t("italic")),
    underline: (ed) => ed._btn("underline", "underline", ed.t("underline")),
    strike: (ed) => ed._btn("strike", "strike", ed.t("strike")),
    mark: (ed) => ed._btn("mark", "mark", ed.t("mark")),
    sub: (ed) => ed._btn("sub", "sub", ed.t("sub")),
    sup: (ed) => ed._btn("sup", "sup", ed.t("sup")),
    code: (ed) => ed._btn("code", "code", ed.t("code")),
    quote: (ed) => ed._btn("quote", "quote", ed.t("quote")),
    clearFormat: (ed) => ed._btn("clearFormat", "clear", ed.t("clearFormat")),
    more: (ed) =>
      `<div class="pe-dropdown" data-dd="more"><button type="button" class="pe-btn pe-dropdown-trigger" data-cmd="moreMenu" title="${escapeHtml(ed.t("more"))}" aria-label="${escapeHtml(ed.t("more"))}" aria-haspopup="menu" aria-expanded="false">${ICONS.sub}<svg class="pe-caret" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg></button>` +
      `<div class="pe-dropdown-menu pe-vertical" role="menu">` +
      [["sub", "sub"], ["sup", "sup"], ["code", "code"], ["quote", "quote"], ["clearFormat", "clear"]].map(([c, i]) => ed._menuItem(c, i, ed.t(c))).join("") +
      `</div></div>`,
    blockquote: (ed) => ed._btn("blockquote", "blockquote", ed.t("blockquote")),
    link: (ed) => ed._btn("link", "link", ed.t("link")),
    unlink: (ed) => ed._btn("unlink", "unlink", ed.t("unlink")),
    ul: (ed) => ed._btn("ul", "listBullet", ed.t("ul")),
    ol: (ed) => ed._btn("ol", "listOrdered", ed.t("ol")),
    marker: (ed) => `<select class="pe-select" data-cmd="marker" title="${escapeHtml(ed.t("marker"))}" aria-label="${escapeHtml(ed.t("marker"))}" disabled><option value="">${escapeHtml(ed.t("markerPlaceholder"))}</option></select>`,
    align: (ed) =>
      `<div class="pe-dropdown" data-dd="align"><button type="button" class="pe-btn pe-dropdown-trigger" data-cmd="alignMenu" title="${escapeHtml(ed.t("align"))}" aria-label="${escapeHtml(ed.t("align"))}" aria-haspopup="menu" aria-expanded="false"><span class="pe-align-icon">${ICONS.alignLeft}</span><svg class="pe-caret" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5"/></svg></button>` +
      `<div class="pe-dropdown-menu" role="menu">` +
      ["alignRight", "alignCenter", "alignLeft", "alignJustify"].map((c) => ed._btn(c, c, ed.t(c))).join("") +
      `</div></div>`,
    dir: (ed) => ed._btn("dir", "dir", ed.t("dir")),
    color: (ed) => `<label class="pe-color-wrap" title="${escapeHtml(ed.t("color"))}"><input type="color" class="pe-color-input" data-cmd="color" value="#1f2328" aria-label="${escapeHtml(ed.t("color"))}" /></label>`,
    attr: (ed) => ed._btn("attr", "attr", ed.t("attr")),
    table: (ed) => ed._btn("table", "table", ed.t("table")),
    section: (ed) => ed._btn("section", "section", ed.t("section")),
    hr: (ed) => ed._btn("hr", "hr", ed.t("hr")),
    br: (ed) => ed._btn("br", "br", ed.t("br")),
    image: (ed) => ed._btn("image", "image", ed.t("image")),
    picture: (ed) => ed._btn("picture", "picture", ed.t("picture")),
    video: (ed) => ed._btn("video", "video", ed.t("video")),
    audio: (ed) => ed._btn("audio", "audio", ed.t("audio")),
    undo: (ed) => ed._btn("undo", "undo", ed.t("undo")),
    redo: (ed) => ed._btn("redo", "redo", ed.t("redo")),
    fullscreen: (ed) => ed._btn("fullscreen", "fullscreen", ed.t("fullscreen")),
    source: (ed) => ed._btn("source", "code", ed.t("source")),
  };

  /* ---------- statics ---------- */
  ProEditor.version = "2.0.0";
  ProEditor.TOOLBARS = TOOLBARS;
  ProEditor._buttons = {};
  ProEditor.CONTAINER_TAGS = CONTAINER_TAGS;

  // ProEditor.registerLocale("xx", { bold: "...", ... }) then new ProEditor(el, { locale: "xx" })
  ProEditor.registerLocale = function (name, messages) {
    I18N[name] = Object.assign({}, I18N[name] || {}, messages);
  };
  ProEditor.locales = I18N;

  // ProEditor.registerButton("id", { icon: "<svg…>", title, onClick(editor), isActive?(editor) })
  ProEditor.registerButton = function (id, def) {
    ProEditor._buttons[id] = def;
    ICONS["custom:" + id] = def.icon || ICONS.attr;
    if (def.isActive) TOGGLES.add(id);
    ITEMS[id] = (ed) => ed._btn(id, "custom:" + id, def.title || id);
  };

  // Static sanitizer: ProEditor.sanitize(html) -> safe HTML string
  ProEditor.sanitize = function (html, opts) {
    return stripEmptyAttrs(sanitizeHTML(html, Object.assign({ output: true }, opts || {})));
  };

  global.ProEditor = ProEditor;
})(window);
