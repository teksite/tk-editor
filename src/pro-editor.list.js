/*!
 * pro-editor.list.js
 * ------------------------------------------------------------------
 * Lists without execCommand: ul/ol, switching between the two, leaving a list with Enter on an
 * empty item, nesting with Tab / Shift+Tab, marker selection, and list items that contain
 * <p> / <h1-h6> blocks.
 */
(function (global) {
  "use strict";

  const ProEditor = global.ProEditor;
  if (!ProEditor) throw new Error("ProEditor: load pro-editor.core.js before this file");

  // [css value, message key]
  ProEditor.MARKERS_UL = [["disc", "markerDisc"], ["circle", "markerCircle"], ["square", "markerSquare"], ["none", "markerNone"]];
  ProEditor.MARKERS_OL = [
    ["decimal", "markerDecimal"],
    ["decimal-leading-zero", "markerDecimalZero"],
    ["lower-alpha", "markerLowerAlpha"],
    ["upper-alpha", "markerUpperAlpha"],
    ["lower-roman", "markerLowerRoman"],
    ["upper-roman", "markerUpperRoman"],
    ["none", "markerNone"],
  ];

  const isList = (n) => n && n.nodeType === 1 && (n.tagName === "UL" || n.tagName === "OL");
  const BLOCK_CHILD = /^(P|H[1-6]|PRE|BLOCKQUOTE|DIV)$/;

  Object.assign(ProEditor.prototype, {
    toggleList(type) {
      if (!this._needBlock()) return;
      const range = this.getRange();
      const tag = type === "ol" ? "OL" : "UL";
      let blocks = this.leafBlocksIn(range).filter((b) => !/^(TD|TH|PRE|CAPTION|SUMMARY)$/.test(b.tagName));
      // a <p>/<h2> inside a list item stands for the item itself
      blocks = [...new Set(blocks.map((b) => (b.parentElement && b.parentElement.tagName === "LI" ? b.parentElement : b)))];
      if (!blocks.length) return;

      this._preserveSel(() => {
        const allLi = blocks.every((b) => b.tagName === "LI");
        if (allLi && blocks.every((b) => b.parentElement.tagName === tag)) {
          // same list type -> remove the list
          blocks.slice().reverse().forEach((li) => (li.parentElement.parentElement && li.parentElement.parentElement.tagName === "LI" ? this._outdentLi(li) : this._liToParagraph(li)));
        } else if (allLi) {
          // other list type -> switch the list tag
          [...new Set(blocks.map((b) => b.parentElement))].forEach((list) => {
            const n = this.doc.createElement(tag.toLowerCase());
            Array.from(list.attributes).forEach((a) => a.name !== "style" && n.setAttribute(a.name, a.value));
            while (list.firstChild) n.appendChild(list.firstChild);
            list.replaceWith(n);
          });
        } else {
          // ordinary blocks -> items of one list
          const items = blocks.filter((b) => b.tagName !== "LI");
          const list = this.doc.createElement(tag.toLowerCase());
          const top = items[0];
          const dir = top.getAttribute("dir");
          if (dir) list.setAttribute("dir", dir);
          top.before(list);
          items.forEach((b) => {
            const li = this.doc.createElement("li");
            while (b.firstChild) li.appendChild(b.firstChild);
            if (li.lastChild && li.lastChild.nodeName === "BR" && li.childNodes.length > 1) li.lastChild.remove();
            if (b.style.textAlign) li.style.textAlign = b.style.textAlign;
            this.fillIfEmpty(li);
            list.appendChild(li);
            if (b.parentElement && b !== list) b.remove();
          });
          const p = list.previousElementSibling;
          if (p && p.tagName === tag && !p.getAttribute("style") && !list.getAttribute("style")) {
            while (list.firstChild) p.appendChild(list.firstChild);
            list.remove();
          }
          const cur = p && p.tagName === tag && !list.isConnected ? p : list;
          const nx = cur.nextElementSibling;
          if (nx && nx.tagName === tag && !nx.getAttribute("style")) {
            while (nx.firstChild) cur.appendChild(nx.firstChild);
            nx.remove();
          }
        }
      });
      this.commit();
    },

    applyListMarker(style) {
      const range = this.getRange();
      if (!range) return;
      const node = range.startContainer;
      const listEl = (node.nodeType === 3 ? node.parentElement : node).closest("ul,ol");
      if (!listEl) return;
      listEl.style.listStyleType = style;
      this.commit();
    },

    // Rebuilds the marker <select> for the active list type
    _populateMarkerOptions(tag, currentValue) {
      const select = this.markerSelect;
      if (!select) return;
      if (this._markerTag !== tag) {
        this._markerTag = tag;
        select.replaceChildren();
        if (!tag) {
          select.appendChild(new Option(this.t("markerPlaceholder"), ""));
          select.disabled = true;
        } else {
          (tag === "ol" ? ProEditor.MARKERS_OL : ProEditor.MARKERS_UL).forEach(([v, k]) => select.appendChild(new Option(this.t(k), v)));
          select.disabled = false;
        }
      }
      if (tag) {
        const opts = Array.from(select.options).map((o) => o.value);
        select.value = currentValue && opts.includes(currentValue) ? currentValue : opts[0];
      }
    },

    /* ---------- list item operations ---------- */
    // Turns a list item into top-level paragraph(s). A <p>/<h2> inside the item is kept as it is.
    _liToParagraph(li) {
      const doc = this.doc;
      const list = li.parentElement;
      const out = [];
      const nestedItems = [];
      let run = [];
      const flush = () => {
        const meaningful = run.some((n) => (n.nodeType === 3 ? /\S/.test(n.nodeValue) : true));
        if (meaningful) {
          const p = doc.createElement("p");
          run.forEach((n) => p.appendChild(n));
          if (list.hasAttribute("dir")) p.setAttribute("dir", list.getAttribute("dir"));
          if (li.style.textAlign) p.style.textAlign = li.style.textAlign;
          out.push(p);
        }
        run = [];
      };
      while (li.firstChild) {
        const c = li.firstChild;
        li.removeChild(c);
        if (isList(c)) Array.from(c.children).forEach((x) => nestedItems.push(x));
        else if (c.nodeType === 1 && BLOCK_CHILD.test(c.tagName)) {
          flush();
          out.push(c);
        } else run.push(c);
      }
      flush();
      if (!out.length) {
        const p = doc.createElement("p");
        p.appendChild(doc.createElement("br"));
        out.push(p);
      }
      const after = [];
      for (let n = li.nextSibling; n; n = n.nextSibling) after.push(n);
      let tail = null;
      if (after.some((n) => n.nodeType === 1) || nestedItems.length) {
        tail = list.cloneNode(false);
        tail.removeAttribute("id");
        nestedItems.forEach((x) => tail.appendChild(x));
        after.forEach((n) => tail.appendChild(n));
      }
      li.remove();
      list.after(...out);
      if (tail && tail.children.length) out[out.length - 1].after(tail);
      if (!list.children.length) list.remove();
      return out[0];
    },

    _exitList(li) {
      const outer = li.parentElement.parentElement;
      if (outer && outer.tagName === "LI") {
        this._outdentLi(li);
        return;
      }
      const p = this._liToParagraph(li);
      this._caretStart(p);
    },

    _outdentLi(li) {
      const list = li.parentElement;
      const outerLi = list && list.parentElement;
      if (!outerLi || outerLi.tagName !== "LI") return false;
      if (li.nextElementSibling) {
        const sub = list.cloneNode(false);
        sub.removeAttribute("id");
        while (li.nextSibling) sub.appendChild(li.nextSibling);
        li.appendChild(sub);
      }
      this._preserveSel(() => {
        outerLi.after(li);
        if (!list.children.length) list.remove();
      });
      this.commit();
      return true;
    },

    _indentLi(li) {
      const prev = li.previousElementSibling;
      if (!prev || prev.tagName !== "LI") return true; // nothing to do, but keep focus inside the editor
      this._preserveSel(() => {
        let sub = prev.lastElementChild;
        if (!isList(sub)) {
          sub = this.doc.createElement(li.parentElement.tagName.toLowerCase());
          prev.appendChild(sub);
        }
        sub.appendChild(li);
      });
      this.commit();
      return true;
    },
  });
})(window);
