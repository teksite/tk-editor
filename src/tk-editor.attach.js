/*!
 * tk-editor.attach.js
 * ------------------------------------------------------------------
 * Turn <textarea> elements into WYSIWYG editors without changing your form or backend:
 * the same textarea (same name) stays in the form and always holds sanitized HTML.
 *
 *   ProEditor.attach('textarea.wysiwyg', { minHeight: 300 })   // -> ProEditor[]
 *   ProEditor.attach(document.querySelector('#body'))
 *   ProEditor.get(textarea)                                     // -> ProEditor | null
 *   ProEditor.detach(textarea)                                  // restore the textarea (value = HTML)
 *   ProEditor.observe('textarea[data-tk-editor]', opts)        // also catches textareas added later
 *   ProEditor.autoInit()                                        // observe() with the default selector
 *
 * Configure through data attributes on the textarea:
 *   data-tk-editor   data-pe-height="320"   data-pe-max-height="700"   data-pe-theme="dark|light|auto"
 *   data-pe-hide="audio,video"   data-pe-dir="rtl|ltr"   data-pe-readonly   data-pe-statusbar="false"
 *   data-pe-toolbar="minimal|standard|full"   data-pe-locale="xx"
 *
 * Form behavior:
 *  - submit / FormData(form) / fetch always see the current HTML (the "formdata" event is covered too).
 *  - Empty content = empty string, so `required` and form validation work (the editor gets focus
 *    and a red frame on error).
 *  - form.reset() restores the initial value. <label for> focuses the editor.
 *  - Every change dispatches an `input` event on the textarea (for Alpine / Vue / validators).
 *  - No style="" attributes are written (strict CSP friendly).
 */
(function (global) {
  "use strict";
  const ProEditor = global.ProEditor;
  if (!ProEditor) throw new Error("ProEditor: core is not loaded");

  const registry = new WeakMap();
  const active = new Set();

  // applied through the CSSOM (style.setProperty), never through a style="" attribute
  const HIDE_STYLE = [
    ["position", "absolute"], ["width", "1px"], ["height", "1px"], ["margin", "0"], ["padding", "0"],
    ["border", "0"], ["overflow", "hidden"], ["opacity", "0"], ["pointer-events", "none"],
  ];

  function toList(target, root) {
    if (!target) return [];
    if (typeof target === "string") return Array.from((root || document).querySelectorAll(target));
    if (target instanceof Element) return [target];
    if (typeof target.length === "number") return Array.from(target);
    return [];
  }

  function dataOptions(ta) {
    const d = ta.dataset;
    const o = {};
    if (d.peHeight) o.minHeight = parseInt(d.peHeight, 10);
    if (d.peMaxHeight) o.maxHeight = parseInt(d.peMaxHeight, 10);
    if (d.peTheme) o.theme = d.peTheme;
    if (d.peHide) o.hide = d.peHide.split(",").map((s) => s.trim()).filter(Boolean);
    if (d.peDir) o.dir = d.peDir;
    if (d.peToolbar) o.toolbar = d.peToolbar;
    if (d.peLocale) o.locale = d.peLocale;
    if ("peReadonly" in d) o.readOnly = d.peReadonly !== "false";
    if (d.peStatusbar === "false") o.statusbar = false;
    return o;
  }

  const looksLikeHtml = (s) => /<\/?[a-z][\s\S]*?>/i.test(s);
  function plainToHtml(text) {
    const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    return text
      .replace(/\r\n?/g, "\n")
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>")
      .join("");
  }

  function mount(ta, options) {
    const host = document.createElement("div");
    host.className = "pe-host";
    ta.after(host);

    const opts = {};
    const put = (k, v) => {
      if (v !== undefined && v !== null && v !== "") opts[k] = v;
    };
    const dirEl = ta.closest("[dir]");
    put("dir", ta.getAttribute("dir") || (dirEl && dirEl.getAttribute("dir")) || document.documentElement.getAttribute("dir"));
    put("lang", ta.lang || document.documentElement.lang);
    put("placeholder", ta.placeholder);
    const rows = ta.getAttribute("rows") ? parseInt(ta.getAttribute("rows"), 10) : 0;
    if (rows > 4) opts.minHeight = rows * 26;
    if (ta.readOnly || ta.disabled) opts.readOnly = true;
    Object.assign(opts, dataOptions(ta), options || {});

    const raw = ta.value || "";
    opts.initialHTML = raw && !looksLikeHtml(raw) ? plainToHtml(raw) : raw;
    opts.syncTo = ta;

    const prevStyle = ta.style.cssText;
    const prevTabindex = ta.getAttribute("tabindex");
    const editor = new ProEditor(host, opts);
    HIDE_STYLE.forEach(([k, v]) => ta.style.setProperty(k, v, "important"));
    ta.setAttribute("tabindex", "-1");
    ta.setAttribute("aria-hidden", "true");

    const cleanups = [];
    const on = (el, ev, fn, o) => {
      el.addEventListener(ev, fn, o);
      cleanups.push(() => el.removeEventListener(ev, fn, o));
    };

    // tell the outside world about changes (libraries that listen to `input`)
    cleanups.push(
      editor.on("change", () => {
        editor.root.classList.remove("pe-invalid");
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      })
    );

    // native form validation (required)
    on(ta, "invalid", (e) => {
      e.preventDefault(); // stops the browser from focusing the hidden textarea
      editor.root.classList.add("pe-invalid");
      editor.focus();
      editor._toast(ta.validity.valueMissing ? editor.t("formRequired") : ta.validationMessage || editor.t("invalidValue"), "error");
    });

    // label
    let label = ta.id && document.querySelector('label[for="' + (window.CSS && CSS.escape ? CSS.escape(ta.id) : ta.id) + '"]');
    if (!label) label = ta.closest("label");
    if (label) {
      const text = (label.textContent || "").trim();
      if (text) editor.iframe.title = text;
      editor.ready.then(() => text && editor.body.setAttribute("aria-label", text));
      on(label, "click", (e) => {
        e.preventDefault();
        editor.focus();
      });
    }

    // form
    const form = ta.form;
    if (form) {
      // native validation runs BEFORE the submit event, so sync before any submit interaction
      const flush = () => editor.sync();
      ["pointerdown", "click", "keydown", "submit"].forEach((ev) => on(form, ev, flush, true));
      on(form, "formdata", (e) => {
        if (ta.name && !ta.disabled) e.formData.set(ta.name, editor.isEmpty() ? "" : editor.getHTML());
      });
      on(form, "reset", () =>
        setTimeout(() => {
          const v = ta.defaultValue || "";
          editor.setHTML(v && !looksLikeHtml(v) ? plainToHtml(v) : v);
          ta.value = editor.isEmpty() ? "" : editor.getHTML();
          editor.root.classList.remove("pe-invalid");
        }, 0)
      );
    }

    const entry = { editor, host, cleanups, restore: null };
    entry.restore = (writeBack) => {
      if (!registry.has(ta)) return;
      registry.delete(ta);
      active.delete(ta);
      if (writeBack && editor.body) ta.value = editor.isEmpty() ? "" : editor.getHTML();
      cleanups.splice(0).forEach((fn) => fn());
      ta.style.cssText = prevStyle;
      if (prevTabindex === null) ta.removeAttribute("tabindex");
      else ta.setAttribute("tabindex", prevTabindex);
      ta.removeAttribute("aria-hidden");
      host.remove();
    };
    // editor.destroy() called directly also restores the textarea
    editor.on("destroy", () => entry.restore(true));
    registry.set(ta, entry);
    active.add(ta);
    return editor;
  }

  ProEditor.attach = function attach(target, options) {
    const out = [];
    toList(target).forEach((ta) => {
      if (!(ta instanceof HTMLTextAreaElement)) {
        console.warn("ProEditor.attach: only <textarea> elements are supported:", ta);
        return;
      }
      if (registry.has(ta)) {
        out.push(registry.get(ta).editor);
        return;
      }
      const o = typeof options === "function" ? options(ta) : options;
      out.push(mount(ta, o));
    });
    return out;
  };

  ProEditor.get = function get(ta) {
    const e = ta && registry.get(ta);
    return e ? e.editor : null;
  };

  ProEditor.detach = function detach(target) {
    toList(target).forEach((ta) => {
      const e = registry.get(ta);
      if (e) {
        e.restore(true);
        e.editor.destroy();
      }
    });
  };

  // Watches the DOM: enhances current and future textareas and releases editors of removed ones
  ProEditor.observe = function observe(selector, options) {
    const mine = new Set();
    const run = (root) => {
      const found = [];
      if (root.nodeType === 1) {
        if (root.matches && root.matches(selector)) found.push(root);
        if (root.querySelectorAll) found.push(...root.querySelectorAll(selector));
      }
      if (!found.length) return;
      const before = new Set(active);
      ProEditor.attach(found, options);
      active.forEach((ta) => !before.has(ta) && mine.add(ta));
    };
    const sweep = () => {
      active.forEach((ta) => {
        if (!ta.isConnected) {
          const e = registry.get(ta);
          if (e) {
            e.restore(false);
            e.editor.destroy();
          }
        }
      });
    };
    run(document.documentElement);
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => run(n));
      sweep();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    return {
      disconnect: () => mo.disconnect(),
      editors: () => Array.from(mine).filter((ta) => active.has(ta)).map((ta) => registry.get(ta).editor),
    };
  };

  ProEditor.autoInit = function autoInit(options) {
    const cfg = Object.assign({}, global.PRO_EDITOR_OPTIONS || {}, options || {});
    const start = () => (ProEditor._auto = ProEditor.observe("textarea[data-tk-editor]", cfg));
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
    else start();
  };
})(window);
