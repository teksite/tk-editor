/*!
 * pro-editor.text.js
 * ------------------------------------------------------------------
 * Text formatting with Selection/Range (no execCommand):
 *   inline: bold / italic / underline / strike / sub / sup / mark / code / q (true toggles, across blocks),
 *   clear formatting, color, block type (also inside list items and table cells), block quote,
 *   alignment, direction, links (on text AND on media) and custom attributes.
 */
(function (global) {
  "use strict";

  const ProEditor = global.ProEditor;
  const U = global.PE_Utils;
  if (!ProEditor) throw new Error("ProEditor: load pro-editor.core.js before this file");
  const { ZWSP } = U;

  const FORMAT_TAGS = {
    bold: ["STRONG", "B"],
    italic: ["EM", "I"],
    underline: ["U"],
    strike: ["S", "DEL", "STRIKE"],
    sub: ["SUB"],
    sup: ["SUP"],
    mark: ["MARK"],
    code: ["CODE"],
    q: ["Q"],
  };
  const CREATE = { bold: "strong", italic: "em", underline: "u", strike: "s", sub: "sub", sup: "sup", mark: "mark", code: "code", q: "q" };
  const CLEAR_TAGS = ["STRONG", "B", "EM", "I", "U", "S", "STRIKE", "DEL", "SUB", "SUP", "MARK", "CODE", "Q", "SMALL", "KBD", "FONT", "SPAN"];
  const MERGEABLE = "strong,em,u,s,sub,sup,mark,code,q,span,small,kbd";
  const MERGE_SET = new Set(MERGEABLE.toUpperCase().split(","));
  const STRUCT = new Set(["table", "thead", "tbody", "tfoot", "tr", "ul", "ol", "dl", "colgroup"]);
  const CELL = /^(LI|TD|TH)$/;

  Object.assign(ProEditor.prototype, {
    /* ---------- Range helpers ---------- */
    _splitBoundaries(range) {
      let { startContainer: sc, startOffset: so, endContainer: ec, endOffset: eo } = range;
      if (ec.nodeType === 3 && eo > 0 && eo < ec.length) ec.splitText(eo);
      if (sc.nodeType === 3 && so > 0 && so < sc.length) {
        const nn = sc.splitText(so);
        if (ec === sc) {
          ec = nn;
          eo -= so;
        }
        sc = nn;
        so = 0;
      }
      range.setStart(sc, so);
      range.setEnd(ec, eo);
      return range;
    },

    _textNodes(range) {
      const root = range.commonAncestorContainer;
      if (root.nodeType === 3) return range.startOffset < range.endOffset ? [root] : [];
      const out = [];
      const w = this.doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        if (!n.length || !range.intersectsNode(n)) continue;
        if (n === range.startContainer && range.startOffset >= n.length) continue;
        if (n === range.endContainer && range.endOffset <= 0) continue;
        const p = n.parentElement;
        if (/^[ \t\n\r\f]*$/.test(n.nodeValue) && p && (p === this.body || STRUCT.has(p.localName) || U.CONTAINERS.has(p.localName))) continue;
        out.push(n);
      }
      return out;
    },

    // Deepest node at the start/end edge of a range boundary
    _edgeNode(c, o, start) {
      while (c.nodeType === 1) {
        const k = c.childNodes;
        if (!k.length) return c;
        c = k[start ? Math.min(o, k.length - 1) : Math.max(o - 1, 0)];
        o = start ? 0 : c.nodeType === 3 ? c.length : c.childNodes.length;
      }
      return c;
    },

    _closestTag(node, tags) {
      let el = node.nodeType === 3 ? node.parentElement : node;
      while (el && el !== this.body) {
        if (tags.includes(el.tagName)) return el;
        el = el.parentElement;
      }
      return null;
    },

    _unwrap(el) {
      const p = el.parentNode;
      while (el.firstChild) p.insertBefore(el.firstChild, el);
      p.removeChild(el);
    },

    // Splits `ancestor` so that `node` sits alone in a copy of it (before / node / after)
    _isolate(node, ancestor) {
      while (node !== ancestor) {
        const parent = node.parentNode;
        if (node.previousSibling) {
          const c = parent.cloneNode(false);
          if (c.removeAttribute) c.removeAttribute("id");
          while (parent.firstChild !== node) c.appendChild(parent.firstChild);
          parent.parentNode.insertBefore(c, parent);
        }
        if (node.nextSibling) {
          const c = parent.cloneNode(false);
          if (c.removeAttribute) c.removeAttribute("id");
          while (node.nextSibling) c.appendChild(node.nextSibling);
          parent.parentNode.insertBefore(c, parent.nextSibling);
        }
        node = parent;
      }
    },

    _unformat(t, tags) {
      let e;
      let guard = 0;
      while ((e = this._closestTag(t, tags)) && guard++ < 30) {
        this._isolate(t, e);
        this._unwrap(e);
      }
    },

    _wrap(t, tag) {
      const el = this.doc.createElement(tag);
      t.parentNode.insertBefore(el, t);
      el.appendChild(t);
      return el;
    },

    // Merges adjacent identical inline elements and removes empty ones
    _mergeInline(container) {
      const sig = (el) => el.tagName + "|" + Array.from(el.attributes).map((a) => a.name + "=" + a.value).sort().join(";");
      let changed = true;
      let guard = 0;
      while (changed && guard++ < 50) {
        changed = false;
        container.querySelectorAll(MERGEABLE).forEach((el) => {
          if (!el.isConnected) return;
          if (!el.firstChild) {
            el.remove();
            changed = true;
            return;
          }
          const prev = el.previousSibling;
          if (prev && prev.nodeType === 1 && MERGE_SET.has(prev.tagName) && sig(prev) === sig(el)) {
            while (el.firstChild) prev.appendChild(el.firstChild);
            el.remove();
            changed = true;
          }
        });
      }
    },

    // End of every inline operation: merge pieces, restore the selection, record history
    _finishInline(nodes) {
      const live = nodes.filter((n) => n.isConnected);
      if (!live.length) return this.commit();
      const blocks = [...new Set(live.map((n) => this.leafBlock(n) || n.parentElement))].filter(Boolean);
      blocks.forEach((b) => this._mergeInline(b));
      const f = live[0];
      const l = live[live.length - 1];
      const r = this.doc.createRange();
      r.setStart(f, 0);
      r.setEnd(l, l.length);
      this.setRange(r);
      blocks.forEach((b) => b.normalize());
      this.commit();
    },

    // Selection -> text nodes (after splitting at the boundaries)
    _selectedTexts() {
      const range = this.getRange();
      if (!range || range.collapsed) return null;
      this._splitBoundaries(range);
      return this._textNodes(range);
    },

    // Wraps the selection in a new element (one element per block). Returns { nodes, els }.
    _wrapRange(tag) {
      const nodes = this._selectedTexts();
      if (!nodes || !nodes.length) return { nodes: [], els: [] };
      const groups = new Map();
      nodes.forEach((n) => {
        const b = this.leafBlock(n) || this.body;
        if (!groups.has(b)) groups.set(b, []);
        groups.get(b).push(n);
      });
      const els = [];
      groups.forEach((ns) => {
        const el = this.doc.createElement(tag);
        const rr = this.doc.createRange();
        rr.setStartBefore(ns[0]);
        rr.setEndAfter(ns[ns.length - 1]);
        try {
          rr.surroundContents(el);
          els.push(el);
        } catch (err) {
          ns.forEach((n) => els.push(this._wrap(n, tag)));
        }
      });
      return { nodes, els };
    },

    /* ---------- inline formats ---------- */
    isFormatActive(name, range) {
      range = range || this.getRange();
      const tags = FORMAT_TAGS[name];
      if (!range || !tags) return false;
      if (range.collapsed) return !!this._closestTag(range.startContainer, tags);
      const a = this._edgeNode(range.startContainer, range.startOffset, true);
      const b = this._edgeNode(range.endContainer, range.endOffset, false);
      return !!(this._closestTag(a, tags) && this._closestTag(b, tags));
    },

    toggleFormat(name) {
      const range = this.getRange();
      const tags = FORMAT_TAGS[name];
      if (!range || !tags) return;
      if (range.collapsed) return this._toggleCaretFormat(name, tags, range);
      const nodes = this._selectedTexts();
      if (!nodes || !nodes.length) return;
      const active = nodes.every((n) => this._closestTag(n, tags));
      const opposite = name === "sub" ? ["SUP"] : name === "sup" ? ["SUB"] : null; // sub and sup exclude each other
      if (opposite) nodes.forEach((n) => this._unformat(n, opposite));
      if (active) nodes.forEach((n) => this._unformat(n, tags));
      else
        nodes.forEach((n) => {
          if (!this._closestTag(n, tags)) this._wrap(n, CREATE[name]);
        });
      this._finishInline(nodes);
    },

    // Collapsed caret: an invisible zero-width space is inserted so the next typed text gets the format.
    // The ZWSP and empty elements are removed from getHTML().
    _toggleCaretFormat(name, tags, range) {
      const doc = this.doc;
      const E = this._closestTag(range.startContainer, tags);
      const zw = doc.createTextNode(ZWSP);
      const opposite = name === "sub" ? ["SUP"] : name === "sup" ? ["SUB"] : null;
      if (E) {
        // turn the format off at the caret: split E and continue after it
        const r = doc.createRange();
        r.setStart(range.startContainer, range.startOffset);
        r.setEnd(E, E.childNodes.length);
        const tail = E.cloneNode(false);
        tail.removeAttribute("id");
        tail.appendChild(r.extractContents());
        E.after(zw);
        if (!this.isBlockEmpty(tail)) zw.after(tail);
        if (this.isBlockEmpty(E)) E.remove();
      } else {
        const el = doc.createElement(CREATE[name]);
        el.appendChild(zw);
        // sub and sup exclude each other: when the caret is inside the opposite element, split it and
        // put the new element between the two halves (instead of nesting <sub> inside <sup>)
        const O = opposite && this._closestTag(range.startContainer, opposite);
        if (O) {
          const r = doc.createRange();
          r.setStart(range.startContainer, range.startOffset);
          r.setEnd(O, O.childNodes.length);
          const tail = O.cloneNode(false);
          tail.removeAttribute("id");
          tail.appendChild(r.extractContents());
          O.after(el);
          if (!this.isBlockEmpty(tail)) el.after(tail);
          if (this.isBlockEmpty(O)) O.remove();
        } else {
          const eb = this._enterEmptyBlock(range);
          range.insertNode(el);
          this._dropPlaceholderBr(eb);
        }
      }
      const c = doc.createRange();
      c.setStart(zw, 1);
      c.collapse(true);
      this.setRange(c);
      this._refreshToolbarState();
    },

    clearFormat() {
      const nodes = this._selectedTexts();
      if (!nodes) return this._toast(this.t("selectTextFirst"));
      nodes.forEach((n) => this._unformat(n, CLEAR_TAGS));
      this._finishInline(nodes);
    },

    // Text color with <span style="color"> (no <font>)
    applyColor(hex) {
      const nodes = this._selectedTexts();
      if (!nodes) return this._toast(this.t("colorNeedsSelection"));
      nodes.forEach((n) => {
        const p = n.parentElement;
        if (p && p.tagName === "SPAN" && p.childNodes.length === 1 && Array.from(p.attributes).every((a) => a.name === "style")) p.style.color = hex;
        else {
          const s = this.doc.createElement("span");
          s.style.color = hex;
          n.before(s);
          s.appendChild(n);
        }
      });
      this._finishInline(nodes);
    },

    /* ---------- block type (p, h1-h6, pre; also inside <li>, <td>, <th>) ---------- */
    // tag: "p" | "h1".."h6" | "pre" | "" (plain: remove the block wrapper inside a list item / table cell)
    applyBlock(tag) {
      const first = this.getRange();
      if (!first) return;
      this._needBlock();
      const range = this.getRange() || first;
      const blocks = this.leafBlocksIn(range);
      if (!blocks.length) return;
      const map = new Map();
      const s = { sc: range.startContainer, so: range.startOffset, ec: range.endContainer, eo: range.endOffset };
      this._preserveSel(() => {
        blocks.forEach((b) => {
          const t = b.tagName;
          if (/^(P|H[1-6]|PRE|DIV)$/.test(t)) {
            const cell = b.parentElement && CELL.test(b.parentElement.tagName) ? b.parentElement : null;
            if (!tag) {
              if (cell && Array.from(cell.children).filter((c) => !/^(UL|OL|TABLE)$/.test(c.tagName)).length === 1) {
                while (b.firstChild) cell.insertBefore(b.firstChild, b);
                map.set(b, cell);
                b.remove();
              }
              return;
            }
            if (b.localName === tag) return;
            const n = this.doc.createElement(tag);
            Array.from(b.attributes).forEach((a) => n.setAttribute(a.name, a.value));
            while (b.firstChild) n.appendChild(b.firstChild);
            b.replaceWith(n);
            map.set(b, n);
          } else if (CELL.test(t) && tag) {
            // plain content of a list item / table cell: wrap it in the chosen block
            const nodes = Array.from(b.childNodes).filter((n) => !(n.nodeType === 1 && /^(UL|OL|TABLE)$/.test(n.tagName)));
            const n = this.doc.createElement(tag);
            b.insertBefore(n, nodes[0] || b.firstChild);
            nodes.forEach((x) => n.appendChild(x));
            if (!n.firstChild) n.appendChild(this.doc.createElement("br"));
            map.set(b, n);
          }
        });
      });
      const m = (x) => map.get(x) || x;
      try {
        const r = this.doc.createRange();
        const clamp = (n, o) => Math.min(o, n.nodeType === 3 ? n.length : n.childNodes.length);
        r.setStart(m(s.sc), clamp(m(s.sc), s.so));
        r.setEnd(m(s.ec), clamp(m(s.ec), s.eo));
        this.setRange(r);
      } catch (e) {
        /* ignore */
      }
      this.commit();
    },

    toggleBlockquote() {
      if (!this._needBlock()) return;
      const range = this.getRange();
      const first = this._blockAtRange(range);
      if (!first) return;
      const bq = first.closest("blockquote");
      if (bq) {
        this._preserveSel(() => {
          while (bq.firstChild) bq.before(bq.firstChild);
          bq.remove();
        });
        this._ensureBlocksAtCaret();
      } else {
        const blocks = this.leafBlocksIn(range).filter((b) => !b.closest("li,td,th"));
        if (!blocks.length) return this._toast(this.t("blockquoteNested"));
        const tops = [...new Set(blocks.map((b) => this.topBlock(b)))];
        const parent = tops[0].parentNode;
        const same = tops.filter((t) => t.parentNode === parent);
        this._preserveSel(() => {
          const q = this.doc.createElement("blockquote");
          same[0].before(q);
          same.forEach((t) => q.appendChild(t));
        });
      }
      this.commit();
    },

    setAlign(value) {
      if (!this._needBlock()) return;
      this.leafBlocksIn(this.getRange()).forEach((b) => {
        b.style.textAlign = value;
      });
      this.commit();
    },

    toggleDir() {
      if (!this._needBlock()) return;
      const targets = new Set();
      this.leafBlocksIn(this.getRange()).forEach((b) => targets.add(b.tagName === "LI" ? b.closest("ul,ol") || b : b));
      targets.forEach((t) => {
        const cur = this.win.getComputedStyle(t).direction;
        t.setAttribute("dir", cur === "rtl" ? "ltr" : "rtl");
      });
      this.commit();
    },

    /* ---------- links (on text AND on media) ---------- */
    // The media element currently selected through the media overlay (picture/img/video/audio root)
    _selectedMediaRoot() {
      const m = this._activeMedia;
      return m && m.isConnected && typeof this._mediaRoot === "function" ? this._mediaRoot(m) : null;
    },

    async openLinkModal() {
      const media = this._selectedMediaRoot();
      const range = this.getRange();
      if (!range && !media) return;
      let existing = null;
      let collapsed = false;
      if (media) existing = media.closest("a");
      else {
        existing = this._closestTag(this._edgeNode(range.startContainer, range.startOffset, true), ["A"]);
        collapsed = range.collapsed && !existing;
      }
      const saved = this._saveSel();
      const rel = existing ? (existing.getAttribute("rel") || "").toLowerCase().split(/\s+/) : [];
      const MANAGED = ["href", "title", "target", "rel"];

      const res = await this._dialog({
        title: this.t(existing ? "linkEdit" : "linkInsert"),
        fields: [
          collapsed ? { key: "text", label: this.t("linkText"), type: "text", required: true } : null,
          { key: "href", label: this.t("linkHref"), type: "url", required: true, value: existing ? existing.getAttribute("href") || "" : "", placeholder: "https://example.com" },
          { key: "title", label: this.t("linkTitle"), type: "text", value: existing ? existing.getAttribute("title") || "" : "", placeholder: this.t("linkTitleHint") },
          {
            key: "target",
            label: this.t("linkTarget"),
            type: "select",
            value: existing && existing.getAttribute("target") === "_blank" ? "_blank" : "_self",
            options: [
              { value: "_self", label: this.t("linkSame") },
              { value: "_blank", label: this.t("linkNew") },
            ],
          },
          { row: [
            { key: "nofollow", label: "nofollow", type: "checkbox", value: rel.includes("nofollow") },
            { key: "sponsored", label: "sponsored", type: "checkbox", value: rel.includes("sponsored") },
            { key: "ugc", label: "ugc", type: "checkbox", value: rel.includes("ugc") },
          ] },
          { details: this.t("linkAdvanced"), fields: [this._attrsField(existing ? { attributes: Array.from(existing.attributes).filter((a) => !MANAGED.includes(a.name)) } : null)] },
        ],
        validate: (v) => {
          const href = U.normalizeHref(v.href);
          if (U.safeUrl(href, "link") === null) return { message: this.t("linkBadUrl"), key: "href" };
          return this._validateAttrs(v);
        },
      });
      this._restoreSel(saved);
      if (!res) return;

      let anchors = [];
      let nodes = [];
      if (existing && existing.isConnected) anchors = [existing];
      else if (media) {
        const a = this.doc.createElement("a");
        media.before(a);
        a.appendChild(media);
        anchors = [a];
      } else if (collapsed) {
        const a = this.doc.createElement("a");
        a.textContent = res.text;
        this.insertInline(a);
        anchors = [a];
      } else {
        const sel = this._selectedTexts() || [];
        sel.forEach((n) => this._unformat(n, ["A"]));
        const w = this._wrapRange("a");
        anchors = w.els;
        nodes = w.nodes;
      }
      anchors.forEach((a) => {
        const relSet = [res.nofollow && "nofollow", res.sponsored && "sponsored", res.ugc && "ugc"].filter(Boolean);
        this._applyCustomAttrs(a, res.attrs, []);
        a.setAttribute("href", U.normalizeHref(res.href));
        if (res.title) a.setAttribute("title", res.title);
        a.setAttribute("target", res.target);
        if (relSet.length) a.setAttribute("rel", relSet.join(" "));
        U.cleanAttributes(a, this._san());
      });
      if (nodes.length) this._finishInline(nodes);
      else this.commit();
      if (media && typeof this._positionMediaOverlay === "function") this._positionMediaOverlay();
    },

    // Link without a dialog (used when a bare URL is pasted): links the selection or inserts the URL as a link
    linkTo(url) {
      const href = U.normalizeHref(url);
      if (U.safeUrl(href, "link") === null || !href) return false;
      const media = this._selectedMediaRoot();
      const range = this.getRange();
      let nodes = [];
      let anchors = [];
      if (media && !media.closest("a")) {
        const a = this.doc.createElement("a");
        media.before(a);
        a.appendChild(media);
        anchors = [a];
      } else if (range && !range.collapsed) {
        const w = this._wrapRange("a");
        anchors = w.els;
        nodes = w.nodes;
      } else {
        const a = this.doc.createElement("a");
        a.textContent = url;
        this.insertInline(a);
        anchors = [a];
      }
      anchors.forEach((a) => {
        a.setAttribute("href", href);
        U.cleanAttributes(a, this._san());
      });
      if (nodes.length) this._finishInline(nodes);
      else this.commit();
      return true;
    },

    removeLink() {
      const media = this._selectedMediaRoot();
      if (media && media.closest("a")) {
        this._unwrap(media.closest("a"));
        this.commit();
        if (typeof this._positionMediaOverlay === "function") this._positionMediaOverlay();
        return;
      }
      const range = this.getRange();
      if (!range) return;
      if (range.collapsed) {
        const a = this._closestTag(range.startContainer, ["A"]);
        if (!a) return;
        this._preserveSel(() => this._unwrap(a));
        return this.commit();
      }
      const nodes = this._selectedTexts() || [];
      nodes.forEach((n) => this._unformat(n, ["A"]));
      this._finishInline(nodes);
    },

    /* ---------- custom attributes ---------- */
    async openAttributeModal() {
      const range = this.getRange();
      if (!range) return;
      let target = null;
      if (range.collapsed) target = this._blockAtRange(range);
      else {
        const text = this.win.getSelection().toString();
        let cur = range.commonAncestorContainer;
        cur = cur.nodeType === 3 ? cur.parentElement : cur;
        while (cur && cur !== this.body) {
          if (cur.textContent === text) {
            target = cur;
            break;
          }
          cur = cur.parentElement;
        }
      }
      const saved = this._saveSel();
      const res = await this._dialog({
        title: target ? this.t("attrsTitle", { tag: target.localName }) : this.t("attrsTitleNew"),
        fields: [this._attrsField(target)],
        validate: (v) => this._validateAttrs(v),
      });
      this._restoreSel(saved);
      if (!res) return;
      if (target && target.isConnected) {
        this._applyCustomAttrs(target, res.attrs, []);
        return this.commit();
      }
      const w = this._wrapRange("span");
      w.els.forEach((el) => this._applyCustomAttrs(el, res.attrs, []));
      if (w.nodes.length) this._finishInline(w.nodes);
    },
  });
})(window);
