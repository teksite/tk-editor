/*!
 * tk-editor.section.js
 * ------------------------------------------------------------------
 * Containers: section, nav, header, footer, main, article, aside, div.
 *
 *  - The toolbar button wraps the selected blocks in a <section> (or inserts an empty one);
 *    pressing it inside a container removes that container (content stays).
 *  - A floating toolbar appears while the caret is inside a container: change the element type
 *    (section <-> nav / header / footer / main / article / aside / div), remove it, or edit its attributes.
 *  - The dashed frame and the tag label exist only inside the editing iframe; they are never saved.
 *  - Leave a container: press Enter (or Shift+Enter) on its empty last paragraph.
 */
(function (global) {
  "use strict";
  const ProEditor = global.ProEditor;
  const U = global.PE_Utils;
  const ICONS = global.PE_ICONS;
  if (!ProEditor) throw new Error("ProEditor: load tk-editor.core.js before this file");

  const SEL = ProEditor.CONTAINER_TAGS.join(",");

  Object.assign(ProEditor.prototype, {
    // Innermost editable container around the caret (null inside tables: the table toolbar wins there)
    _containerAtCaret() {
      const r = this.getRange();
      if (!r) return null;
      const n = r.startContainer;
      const el = n.nodeType === 3 ? n.parentElement : n;
      if (!el || el.closest("td,th")) return null;
      const c = el.closest(SEL);
      return c && this.body.contains(c) ? c : null;
    },

    insertSection() {
      const range = this.getRange();
      if (!range) return;
      const existing = this._containerAtCaret();
      if (existing) return this.unwrapContainer(existing);
      const doc = this.doc;
      const section = doc.createElement("section");
      if (!range.collapsed) {
        this._needBlock();
        const tops = [...new Set(this.leafBlocksIn(this.getRange()).map((b) => this.topBlock(b)))];
        const same = tops.filter((t) => t.parentNode === tops[0].parentNode);
        this._preserveSel(() => {
          same[0].before(section);
          same.forEach((t) => section.appendChild(t));
        });
        return this.commit();
      }
      const p = doc.createElement("p");
      p.appendChild(doc.createElement("br"));
      section.appendChild(p);
      const block = this._blockAtRange(range);
      if (!block) range.insertNode(section);
      else if (block.tagName === "P" && this.isBlockEmpty(block) && this._isFlow(block.parentElement)) block.replaceWith(section);
      else this.topBlock(block).after(section);
      this._ensureTrailingParagraph(section);
      this._caretStart(p);
      this.commit();
    },

    unwrapContainer(el) {
      el = el || this._containerAtCaret();
      if (!el) return;
      this._preserveSel(() => {
        while (el.firstChild) el.before(el.firstChild);
        el.remove();
      });
      this._ensureBlocksAtCaret();
      this.commit();
    },

    // Change the container element type, keeping attributes, content and the caret
    setContainerTag(tag) {
      const el = this._containerAtCaret();
      if (!el || el.localName === tag || !ProEditor.CONTAINER_TAGS.includes(tag)) return;
      const sel = this._snapshotSel();
      const n = this.doc.createElement(tag);
      Array.from(el.attributes).forEach((a) => n.setAttribute(a.name, a.value));
      while (el.firstChild) n.appendChild(el.firstChild);
      el.replaceWith(n);
      this._restoreSnapshotSel(sel);
      this.commit();
    },

    async openContainerAttributes() {
      const el = this._containerAtCaret();
      if (!el) return;
      const saved = this._saveSel();
      const res = await this._dialog({
        title: this.t("attrsTitle", { tag: el.localName }),
        fields: [this._attrsField(el)],
        validate: (v) => this._validateAttrs(v),
      });
      this._restoreSel(saved);
      if (!res || !el.isConnected) return;
      this._applyCustomAttrs(el, res.attrs, []);
      this.commit();
    },

    /* ---------- floating container toolbar ---------- */
    _initContainerToolbar() {
      const h = U.h;
      const select = h("select", { class: "pe-select", "aria-label": this.t("containerTag"), title: this.t("containerTag") }, ProEditor.CONTAINER_TAGS.map((t) => h("option", { value: t, text: "<" + t + ">" })));
      const btn = (icon, title, fn) => h("button", { type: "button", class: "pe-btn", title, "aria-label": title, html: ICONS[icon], onclick: fn });
      const tb = h(
        "div",
        { class: "pe-container-toolbar", role: "toolbar", "aria-label": this.t("containerTools") },
        select,
        btn("attr", this.t("containerAttrs"), () => this.openContainerAttributes()),
        btn("trash", this.t("containerUnwrap"), () => this.unwrapContainer())
      );
      tb.addEventListener("mousedown", (e) => {
        // let the <select> open normally, but keep the editor selection for the buttons
        if (e.target.closest(".pe-btn")) e.preventDefault();
      });
      select.addEventListener("change", () => {
        this.setContainerTag(select.value);
        this.focusBody();
      });
      this.wrap.appendChild(tb);
      this._containerToolbar = tb;
      this._containerSelect = select;
    },

    _positionContainerToolbar() {
      const tb = this._containerToolbar;
      if (!tb || !this.body) return;
      if (this.root.classList.contains("pe-source-mode") || this.readOnly || this._dialogOpen) return tb.classList.remove("pe-visible");
      const el = this._containerAtCaret();
      if (!el) return tb.classList.remove("pe-visible");
      if (this._containerSelect.value !== el.localName) this._containerSelect.value = el.localName;
      const wr = this.wrap.getBoundingClientRect();
      const ir = this.iframe.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const top = ir.top - wr.top + er.top + this.wrap.scrollTop - 40;
      const right = ir.left - wr.left + er.right + this.wrap.scrollLeft;
      const left = Math.max(4, Math.min(right - tb.offsetWidth, this.wrap.clientWidth - tb.offsetWidth - 4));
      tb.style.top = Math.max(2, top) + "px";
      tb.style.left = left + "px";
      tb.classList.add("pe-visible");
    },
  });
})(window);
