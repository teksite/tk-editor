/*!
 * tk-editor.engine.js
 * ------------------------------------------------------------------
 * The editing engine (no execCommand): block detection, Enter / Shift+Enter, smart insertion,
 * safe copy / cut / paste, selection deletion with block merging, keyboard escapes
 * (leaving inline tags and <pre> with the arrow keys), markdown shortcuts and file drops.
 *
 * "Smart paragraphs" (default): a <p> is only created for text. Inserting an <img>, <video>,
 * <audio>, <picture> or a <br> into an EMPTY paragraph replaces that paragraph instead of
 * nesting inside it. In the middle of existing text the element simply goes inline.
 */
(function (global) {
  "use strict";

  const ProEditor = global.ProEditor;
  const U = global.PE_Utils;
  if (!ProEditor) throw new Error("ProEditor: load tk-editor.core.js before this file");
  const { BLOCKISH, CONTAINERS, hasBlockChild, isBlankText, wrapStrays, sanitizeFragment, isObjectLike } = U;

  const LEAF_TAGS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "PRE", "TD", "TH", "DT", "DD", "FIGCAPTION", "CAPTION", "SUMMARY"]);
  const LEAF_IF_NO_BLOCKS = new Set(["DIV", "BLOCKQUOTE", "SECTION", "ARTICLE", "ASIDE", "HEADER", "FOOTER", "MAIN", "NAV", "ADDRESS"]);
  // In these blocks Enter inserts a <br> instead of splitting the block
  const BREAK_TAGS = new Set(["TD", "TH", "PRE", "SUMMARY", "CAPTION", "FIGCAPTION", "DT", "DD"]);
  const INLINE_CLEAN_SEL = "strong,em,u,s,sub,sup,mark,code,q,span,a,small,kbd";
  const MEDIA_SEL = "img,video,audio,picture,table,hr,iframe";
  // Inline elements the caret can be "escaped" from with the arrow keys
  const EXIT_TAGS = ["Q", "CODE", "KBD", "MARK", "A", "SUB", "SUP", "STRONG", "EM", "U", "S", "SMALL", "SPAN"];

  const isInlineNode = (n) => n.nodeType === 3 || (n.nodeType === 1 && !BLOCKISH.has(n.localName));
  const newPlaceholderBr = (doc) => {
    const br = doc.createElement("br");
    br.setAttribute("data-pe-ph", ""); // editor-internal; stripped from the output
    return br;
  };

  Object.assign(ProEditor.prototype, {
    /* ---------- block detection ---------- */
    leafBlock(node) {
      let el = node && (node.nodeType === 3 ? node.parentElement : node);
      while (el && el !== this.body) {
        const t = el.tagName;
        if (LEAF_TAGS.has(t)) return el;
        if (LEAF_IF_NO_BLOCKS.has(t) && !hasBlockChild(el)) return el;
        el = el.parentElement;
      }
      return null;
    },

    _isFlow(el) {
      return !!el && (el === this.body || CONTAINERS.has(el.localName));
    },

    // The leaf block containing the range start. Returns null for "loose" context
    // (caret next to a bare <img>/<br> directly inside the body or a container).
    _blockAtRange(range) {
      const n = range.startContainer;
      if (n.nodeType === 1 && !this.leafBlock(n) && n.childNodes.length) {
        const prev = n.childNodes[range.startOffset - 1];
        const next = n.childNodes[range.startOffset];
        if ((prev && isInlineNode(prev)) || (next && isInlineNode(next))) return null;
        const pick = next || prev;
        return pick ? this.leafBlock(pick) : null;
      }
      return this.leafBlock(n);
    },

    isBlockEmpty(el) {
      if (el.querySelector(MEDIA_SEL)) return false;
      return (el.textContent || "").replace(/[\u200B\s]/g, "") === "";
    },

    // Wraps the loose inline run around the caret in a <p> so block commands (heading, list, align...) work
    _materializeBlock(range) {
      const node = range.startContainer;
      let parent;
      let index;
      if (node.nodeType === 3) {
        parent = node.parentNode;
        index = Array.prototype.indexOf.call(parent.childNodes, node);
      } else {
        parent = node;
        index = range.startOffset;
      }
      if (!this._isFlow(parent)) return null;
      const kids = parent.childNodes;
      const run = [];
      let i = node.nodeType === 3 ? index : index - 1;
      while (i >= 0 && kids[i] && isInlineNode(kids[i])) i--;
      let j = i + 1;
      while (kids[j] && isInlineNode(kids[j])) run.push(kids[j++]);
      const p = this.doc.createElement("p");
      const ref = kids[j] || null;
      this._preserveSel(() => {
        parent.insertBefore(p, ref);
        run.forEach((n) => p.appendChild(n));
        if (!p.firstChild) p.appendChild(this.doc.createElement("br"));
      });
      if (!run.length) this._caretStart(p);
      return p;
    },
    // Block commands call this first: returns the caret's block, creating a <p> for loose content if needed
    _needBlock() {
      const r = this.getRange();
      if (!r) return null;
      return this._blockAtRange(r) || this._materializeBlock(r);
    },

    // All leaf blocks overlapping the range (a block merely touched at its edge is ignored)
    leafBlocksIn(range) {
      const first = this._blockAtRange(range);
      if (range.collapsed) return first ? [first] : [];
      const root = range.commonAncestorContainer.nodeType === 3 ? range.commonAncestorContainer.parentElement : range.commonAncestorContainer;
      const out = [];
      const test = (el) => {
        const leaf = LEAF_TAGS.has(el.tagName) || (LEAF_IF_NO_BLOCKS.has(el.tagName) && !hasBlockChild(el));
        if (!leaf || !range.intersectsNode(el)) return;
        if (el !== first) {
          const endPoint = this.doc.createRange();
          endPoint.setStart(el, 0);
          endPoint.setEnd(range.endContainer, range.endOffset);
          if (endPoint.toString() === "" && !endPoint.cloneContents().firstElementChild) return;
        }
        out.push(el);
      };
      if (root !== this.body) test(root);
      root.querySelectorAll(Array.from(new Set([...LEAF_TAGS, ...LEAF_IF_NO_BLOCKS])).map((s) => s.toLowerCase()).join(",")).forEach(test);
      if (!out.length && first) out.push(first);
      return out;
    },

    // Top-level block (direct child of body or of a container)
    topBlock(el) {
      while (el.parentElement && el.parentElement !== this.body && !CONTAINERS.has(el.parentElement.localName)) el = el.parentElement;
      return el;
    },

    fillIfEmpty(el) {
      this._cleanEmptyInline(el);
      if (this.isBlockEmpty(el) && !el.querySelector("ul,ol")) el.replaceChildren(this.doc.createElement("br"));
    },

    _cleanEmptyInline(el) {
      Array.from(el.querySelectorAll(INLINE_CLEAN_SEL))
        .reverse()
        .forEach((n) => {
          if (n.isConnected && this.isBlockEmpty(n) && !n.hasAttribute("id")) n.remove();
        });
    },

    _caretStart(el) {
      let n = el;
      while (n.firstChild && n.firstChild.nodeType === 1 && !/^(BR|IMG|VIDEO|AUDIO|HR|TABLE|PICTURE)$/.test(n.firstChild.tagName)) n = n.firstChild;
      const r = this.doc.createRange();
      if (n.firstChild && n.firstChild.nodeType === 3) r.setStart(n.firstChild, 0);
      else r.setStart(n, 0);
      r.collapse(true);
      this.setRange(r);
    },
    _caretEnd(el) {
      let n = el;
      while (n.lastChild && n.lastChild.nodeType === 1 && !/^(BR|IMG|VIDEO|AUDIO|HR|PICTURE)$/.test(n.lastChild.tagName)) n = n.lastChild;
      const r = this.doc.createRange();
      if (n.lastChild && n.lastChild.nodeType === 3) r.setStart(n.lastChild, n.lastChild.length);
      else if (n.lastChild && n.lastChild.tagName === "BR") r.setStartBefore(n.lastChild);
      else r.setStart(n, n.childNodes.length);
      r.collapse(true);
      this.setRange(r);
    },
    _caretAfter(node) {
      const r = this.doc.createRange();
      r.setStartAfter(node);
      r.collapse(true);
      this.setRange(r);
    },

    /* ---------- deleting a selection (merges the end block into the start block) ---------- */
    _deleteSelection(range) {
      range = range || this.getRange();
      if (!range || range.collapsed) return range;
      const sb = this.leafBlock(range.startContainer);
      const eb = this.leafBlock(range.endContainer);
      range.deleteContents();
      if (sb && eb && sb !== eb && sb.isConnected && eb.isConnected && !sb.contains(eb) && !eb.contains(sb) && eb.tagName !== "TD" && eb.tagName !== "TH") {
        while (eb.firstChild) sb.appendChild(eb.firstChild);
        const par = eb.parentElement;
        eb.remove();
        if (par && par !== this.body && !par.children.length && !par.textContent.trim()) par.remove();
      }
      if (sb && sb.isConnected) this.fillIfEmpty(sb);
      return this.getRange() || range;
    },

    /* ---------- Enter / Shift+Enter ---------- */
    // Enter / Shift+Enter while a media element is selected: continue AFTER it instead of deleting it
    _collapseAfterSelectedMedia(range) {
      const m = typeof this._selectedMediaRoot === "function" ? this._selectedMediaRoot() : null;
      if (!m || range.collapsed || !this._mediaStillSelected(range)) return false;
      range.setStartAfter(m.closest("a") || m);
      range.collapse(true);
      this.setRange(range);
      this._hideMediaOverlay();
      return true;
    },

    _enter() {
      let range = this.getRange();
      if (!range) return;
      if (!range.collapsed && !this._collapseAfterSelectedMedia(range)) range = this._deleteSelection(range);
      if (this.options.markdown && this._markdownEnter(range)) return;
      let block = this._blockAtRange(range);
      if (!block && !this._smartP) {
        this._ensureBlocksAtCaret();
        range = this.getRange();
        block = range && this._blockAtRange(range);
      }
      if (!block) return this._enterLoose(range);

      if (LEAF_IF_NO_BLOCKS.has(block.tagName) && block.tagName !== "DIV" && block.tagName !== "BLOCKQUOTE") {
        this._preserveSel(() => wrapStrays(block, { loose: this._smartP }));
        block = this._blockAtRange(this.getRange()) || block;
      }
      const tag = block.tagName;
      if (BREAK_TAGS.has(tag)) {
        if (tag === "PRE" && this._preBlankEnd(block, range)) return this._exitPre(block, range);
        return this.insertBreak();
      }

      // list items (the caret may be directly in the <li> or in a <p>/<h1-6> inside it)
      const li = tag === "LI" ? block : block.parentElement && block.parentElement.tagName === "LI" ? block.parentElement : null;
      if (li && typeof this._exitList === "function") {
        if (this.isBlockEmpty(li)) {
          this._exitList(li);
          return this.commit();
        }
        return this._splitListItem(li, block, range);
      }
      if (this._exitContainerIfEmpty(block)) return;

      const doc = this.doc;
      const r = doc.createRange();
      r.setStart(range.startContainer, range.startOffset);
      r.setEnd(block, block.childNodes.length);
      const frag = r.extractContents();
      const probe = doc.createElement("div");
      probe.appendChild(frag.cloneNode(true));
      const atEnd = this.isBlockEmpty(probe);

      let newTag = tag.toLowerCase();
      if (/^H[1-6]$/.test(tag) && atEnd) newTag = "p";
      const nb = doc.createElement(newTag);
      if (block.hasAttribute("dir")) nb.setAttribute("dir", block.getAttribute("dir"));
      if (block.style.textAlign) nb.style.textAlign = block.style.textAlign;
      if (block.className && newTag === tag.toLowerCase()) nb.className = block.className;
      nb.appendChild(frag);
      this.fillIfEmpty(block);
      this.fillIfEmpty(nb);
      block.after(nb);
      this._caretStart(nb);
      this.commit();
    },

    // Enter in loose content (e.g. right after a bare <img>): add an empty paragraph at the caret
    _enterLoose(range) {
      const p = this.doc.createElement("p");
      p.appendChild(this.doc.createElement("br"));
      range.insertNode(p);
      // placeholder <br>s that trailed the loose line are no longer needed
      while (p.nextSibling && p.nextSibling.nodeType === 1 && p.nextSibling.tagName === "BR" && p.nextSibling.hasAttribute("data-pe-ph")) p.nextSibling.remove();
      this._caretStart(p);
      this.commit();
    },

    // Splits a list item at the caret (works for plain <li> and for <li><p>/<h2>…</li>)
    _splitListItem(li, block, range) {
      const doc = this.doc;
      const r = doc.createRange();
      r.setStart(range.startContainer, range.startOffset);
      r.setEnd(li, li.childNodes.length);
      const frag = r.extractContents();
      const nl = doc.createElement("li");
      if (li.style.textAlign) nl.style.textAlign = li.style.textAlign;
      if (li.hasAttribute("dir")) nl.setAttribute("dir", li.getAttribute("dir"));
      nl.appendChild(frag);
      const prune = (el) => Array.from(el.children).forEach((c) => /^(P|H[1-6])$/.test(c.tagName) && this.isBlockEmpty(c) && c.remove());
      prune(li);
      prune(nl);
      const wrapped = block !== li && block.tagName === "P";
      [li, nl].forEach((el) => {
        this._cleanEmptyInline(el);
        if (this.isBlockEmpty(el) && !el.querySelector("ul,ol")) {
          const b = doc.createElement("br");
          if (wrapped) {
            const p = doc.createElement("p");
            p.appendChild(b);
            el.replaceChildren(p);
          } else el.replaceChildren(b);
        }
      });
      li.after(nl);
      this._caretStart(nl);
      this.commit();
    },

    // Enter on the empty last paragraph of a section/blockquote/...: leave the container
    _exitContainerIfEmpty(block) {
      if (block.tagName !== "P" || !this.isBlockEmpty(block)) return false;
      const par = block.parentElement;
      if (!par || par === this.body || !CONTAINERS.has(par.localName) || block.nextElementSibling || par.children.length < 2) return false;
      par.after(block);
      this._caretStart(block);
      this.commit();
      return true;
    },

    _shiftEnter() {
      const range = this.getRange();
      const block = range && range.collapsed ? this._blockAtRange(range) : null;
      if (block && block.tagName === "P" && this._exitContainerIfEmpty(block)) return;
      this.insertBreak();
    },

    // Line break. In an EMPTY top-level paragraph (smart mode) the <p> is replaced by the bare <br>.
    insertBreak() {
      let range = this.getRange();
      if (!range) {
        this._placeCaretAtEnd();
        range = this.getRange();
      }
      if (!range.collapsed && !this._collapseAfterSelectedMedia(range)) range = this._deleteSelection(range);
      const doc = this.doc;
      const block = this._blockAtRange(range);
      const br = doc.createElement("br");
      if (this._smartP && block && block.tagName === "P" && this.isBlockEmpty(block) && this._isFlow(block.parentElement)) {
        const ph = newPlaceholderBr(doc);
        block.replaceWith(br, ph);
        this._caretAfter(br);
        return this.commit();
      }
      const eb = this._enterEmptyBlock(range);
      range.insertNode(br);
      this._dropPlaceholderBr(eb);
      // a trailing <br> needs one more (invisible) <br> for the new line to show
      const after = doc.createRange();
      after.setStartAfter(br);
      const scope = block && block.isConnected ? block : br.parentNode;
      after.setEnd(scope, scope.childNodes.length);
      if (after.toString().replace(/\u200B/g, "") === "" && !after.cloneContents().firstElementChild) br.after(newPlaceholderBr(doc));
      this._caretAfter(br);
      this.commit();
    },

    insertHR() {
      let range = this.getRange();
      if (!range) {
        this._placeCaretAtEnd();
        range = this.getRange();
      }
      if (!range.collapsed) range = this._deleteSelection(range);
      const block = this._blockAtRange(range);
      const top = block ? this.topBlock(block) : null;
      const hr = this.doc.createElement("hr");
      if (!top) range.insertNode(hr);
      else if (block && block.tagName === "P" && this.isBlockEmpty(block)) block.replaceWith(hr);
      else top.after(hr);
      this._ensureTrailingParagraph(hr);
      this._caretStart(hr.nextElementSibling);
      this.commit();
    },

    // Block elements (hr, table, section...) need a following paragraph so the caret can continue after them
    _ensureTrailingParagraph(el) {
      if (el.nextElementSibling || el.nextSibling) return;
      const p = this.doc.createElement("p");
      p.appendChild(this.doc.createElement("br"));
      el.after(p);
    },

    /* ---------- <pre>: leaving it with Enter / arrow keys ---------- */
    // True when the caret is at the very end of <pre> and the line before it is empty (second Enter)
    _preBlankEnd(pre, range) {
      const tail = this.doc.createRange();
      tail.setStart(range.startContainer, range.startOffset);
      tail.setEnd(pre, pre.childNodes.length);
      if (tail.toString().replace(/\u200B/g, "") !== "" || tail.cloneContents().querySelector("img,video,audio,picture")) return false;
      const head = this.doc.createRange();
      head.setStart(pre, 0);
      head.setEnd(range.startContainer, range.startOffset);
      const frag = head.cloneContents();
      let last = frag.lastChild;
      while (last && last.nodeType === 1 && last.tagName !== "BR" && last.lastChild) last = last.lastChild;
      if (!last) return false;
      return (last.nodeType === 1 && last.tagName === "BR") || (last.nodeType === 3 && /\n$/.test(last.nodeValue));
    },
    _exitPre(pre, range) {
      // remove the blank line created by the first Enter, then continue in a new paragraph after the block
      const doc = this.doc;
      let n = range.startContainer.nodeType === 3 && range.startOffset > 0 ? range.startContainer : null;
      if (!n) {
        const c = range.startContainer;
        n = c.nodeType === 3 ? c.previousSibling : c.childNodes[range.startOffset - 1];
        while (n && n.nodeType === 1 && n.tagName !== "BR" && n.lastChild) n = n.lastChild;
      }
      if (n && n.nodeType === 1 && n.tagName === "BR") n.remove();
      else if (n && n.nodeType === 3) n.nodeValue = n.nodeValue.replace(/\n$/, "");
      pre.querySelectorAll(":scope > br[data-pe-ph]").forEach((b) => b.remove());
      const p = doc.createElement("p");
      p.appendChild(doc.createElement("br"));
      pre.after(p);
      this._caretStart(p);
      this.commit();
    },

    /* ---------- keyboard escapes ---------- */
    // Arrow keys: leave a <pre> that has nothing after/before it, or step out of an inline element
    _onArrow(e) {
      const range = this.getRange();
      if (!range || !range.collapsed) return false;
      const k = e.key;
      const block = this._blockAtRange(range);
      if (block && block.tagName === "PRE") {
        const forwardKey = k === "ArrowDown" || k === "ArrowRight";
        const backKey = k === "ArrowUp" || k === "ArrowLeft";
        if (forwardKey && !block.nextSibling) {
          const tail = this.doc.createRange();
          tail.setStart(range.startContainer, range.startOffset);
          tail.setEnd(block, block.childNodes.length);
          if (tail.toString().replace(/\u200B/g, "") === "") return this._newParagraphNear(block, false);
        }
        if (backKey && !block.previousSibling) {
          const head = this.doc.createRange();
          head.setStart(block, 0);
          head.setEnd(range.startContainer, range.startOffset);
          if (head.toString().replace(/\u200B/g, "") === "") return this._newParagraphNear(block, true);
        }
      }
      if (k === "ArrowLeft" || k === "ArrowRight") {
        const node = range.startContainer;
        const el = node.nodeType === 3 ? node.parentElement : node;
        const rtl = this.win.getComputedStyle(el).direction === "rtl";
        return this._exitInline(k === (rtl ? "ArrowLeft" : "ArrowRight"), range);
      }
      return false;
    },
    _newParagraphNear(block, before) {
      const p = this.doc.createElement("p");
      p.appendChild(this.doc.createElement("br"));
      if (before) block.before(p);
      else block.after(p);
      this._caretStart(p);
      this.commit();
      return true;
    },

    // At the logical edge of an inline element (q, code, a, strong...) the caret is moved just OUTSIDE it,
    // so the next typed character is no longer part of that element. A zero-width space is used as the
    // landing spot (removed again from the final HTML).
    _exitInline(forward, range) {
      const E = this._closestTag(range.startContainer, EXIT_TAGS);
      if (!E) return false;
      const doc = this.doc;
      const atEdge = (el) => {
        const t = doc.createRange();
        if (forward) {
          t.setStart(range.startContainer, range.startOffset);
          t.setEnd(el, el.childNodes.length);
        } else {
          t.setStart(el, 0);
          t.setEnd(range.startContainer, range.startOffset);
        }
        return t.toString().replace(/\u200B/g, "") === "" && !t.cloneContents().querySelector("img,video,audio,picture,br:not([data-pe-ph])");
      };
      let top = null;
      let el = E;
      while (el && atEdge(el)) {
        top = el;
        const par = top.parentElement;
        el = par && par !== this.body ? this._closestTag(par, EXIT_TAGS) : null;
      }
      if (!top) return false;
      // Browsers snap a caret placed at the very start/end of a neighbouring text node back INTO the
      // inline element, so a separate zero-width-space text node is always used as the landing spot.
      const r = doc.createRange();
      if (forward) {
        const next = top.nextSibling;
        if (next && next.nodeType === 3 && next.nodeValue.startsWith(U.ZWSP)) r.setStart(next, 1);
        else {
          const zw = doc.createTextNode(U.ZWSP);
          top.after(zw);
          r.setStart(zw, 1);
        }
      } else {
        const prev = top.previousSibling;
        if (prev && prev.nodeType === 3 && prev.nodeValue.endsWith(U.ZWSP)) r.setStart(prev, prev.length);
        else {
          const zw = doc.createTextNode(U.ZWSP);
          top.before(zw);
          r.setStart(zw, 1);
        }
      }
      r.collapse(true);
      this.setRange(r);
      return true;
    },

    /* ---------- markdown shortcuts ---------- */
    // Typing "## ", "- ", "1. " or "> " at the start of a paragraph converts it. Returns true when handled.
    _markdownShortcut() {
      const range = this.getRange();
      if (!range || !range.collapsed) return false;
      const block = this._blockAtRange(range);
      if (!block || block.tagName !== "P" || block.closest("li,td,th,pre")) return false;
      const marker = range.cloneRange();
      marker.setStart(block, 0);
      const text = marker.toString().replace(/\u200B/g, "");
      let action = null;
      let m;
      if ((m = /^(#{1,6})$/.exec(text))) action = () => this.applyBlock("h" + m[1].length);
      else if (/^[-*+]$/.test(text)) action = () => this.toggleList("ul");
      else if (/^\d{1,3}[.)]$/.test(text)) action = () => this.toggleList("ol");
      else if (text === ">") action = () => this.toggleBlockquote();
      if (!action) return false;
      this.flushHistory();
      marker.deleteContents();
      this.fillIfEmpty(block);
      if (!this.getRange() || !block.contains(this.getRange().startContainer)) this._caretStart(block);
      action();
      return true;
    },
    // "```" + Enter -> code block, "---" + Enter -> horizontal rule
    _markdownEnter(range) {
      const block = this._blockAtRange(range);
      if (!block || block.tagName !== "P" || block.closest("li,td,th,pre")) return false;
      const text = (block.textContent || "").replace(/[\u200B\s]/g, "");
      const tail = this.doc.createRange();
      tail.setStart(range.startContainer, range.startOffset);
      tail.setEnd(block, block.childNodes.length);
      if (tail.toString().replace(/\u200B/g, "") !== "") return false;
      if (text === "```") {
        this.flushHistory();
        block.replaceChildren(this.doc.createElement("br"));
        this._caretStart(block);
        this.applyBlock("pre");
        return true;
      }
      if (/^(---|\*\*\*)$/.test(text)) {
        this.flushHistory();
        const hr = this.doc.createElement("hr");
        block.replaceWith(hr);
        this._ensureTrailingParagraph(hr);
        this._caretStart(hr.nextElementSibling);
        this.commit();
        return true;
      }
      return false;
    },

    /* ---------- structure ---------- */
    // Stray text/inline nodes can only appear where the caret is, so only that path is checked
    // (O(depth) instead of O(number of blocks) on every keystroke).
    _ensureBlocksAtCaret() {
      const body = this.body;
      if (!body.firstChild) {
        const p = this._resetEmptyBody();
        this._caretStart(p);
        return;
      }
      const r = this.getRange();
      if (!r) return;
      const isStray = (n) => (n.nodeType === 3 ? !isBlankText(n) : n.nodeType === 1 && !BLOCKISH.has(n.localName));
      const targets = [];
      let child = r.startContainer;
      if (child === body) {
        if (Array.from(body.childNodes).some((n) => isStray(n))) targets.push(body);
      } else {
        while (child.parentNode) {
          const par = child.parentNode;
          if (par === body) {
            if (isStray(child)) targets.push(body);
            break;
          }
          const n = par.localName;
          if (CONTAINERS.has(n) && (n !== "div" || hasBlockChild(par)) && isStray(child)) targets.push(par);
          child = par;
        }
      }
      if (targets.length) this._preserveSel(() => targets.forEach((t) => wrapStrays(t, { loose: this._smartP })));
    },

    /* ---------- inserting content ---------- */
    // Caret inside an EMPTY block (only a placeholder <br>): move the caret before the <br>
    // so inserted content is not pushed onto a second line. Returns the block (or null).
    _enterEmptyBlock(range) {
      const block = this._blockAtRange(range);
      if (!block || !this.isBlockEmpty(block) || block.querySelector("ul,ol")) return null;
      if (!Array.from(block.children).every((c) => c.tagName === "BR")) return null;
      range.setStart(block, 0);
      range.collapse(true);
      return block;
    },
    _dropPlaceholderBr(block) {
      if (block && block.isConnected) block.querySelectorAll(":scope > br").forEach((b) => b.remove());
    },

    // Insert an inline node at the caret (smart): an object-like node (no text: img, picture, <a><img></a>)
    // replaces an empty top-level paragraph; text-like nodes (links with text, formatting) keep the <p>.
    insertInline(node) {
      let range = this.getRange();
      if (!range) {
        this._placeCaretAtEnd();
        range = this.getRange();
      }
      if (!range.collapsed) range = this._deleteSelection(range);
      const block = this._blockAtRange(range);
      if (this._smartP && isObjectLike(node) && block && block.tagName === "P" && this.isBlockEmpty(block) && this._isFlow(block.parentElement)) {
        block.replaceWith(node);
        this._caretAfter(node);
        return;
      }
      const eb = this._enterEmptyBlock(range);
      range.insertNode(node);
      this._dropPlaceholderBr(eb);
      this._caretAfter(node);
      this._ensureBlocksAtCaret();
    },

    // Block-level media (video, audio): never wrapped in a <p>.
    //  - empty top-level paragraph -> replaced; text paragraph -> placed after it;
    //  - inside list items / table cells -> inline.
    insertBlockObject(node) {
      let range = this.getRange();
      if (!range) {
        this._placeCaretAtEnd();
        range = this.getRange();
      }
      if (!range.collapsed) range = this._deleteSelection(range);
      const block = this._blockAtRange(range);
      if (!this._smartP) {
        const p = this.doc.createElement("p");
        p.appendChild(node);
        if (!block) range.insertNode(p);
        else if (block.tagName === "P" && this.isBlockEmpty(block)) block.replaceWith(p);
        else this.topBlock(block).after(p);
        return this._caretAfter(p);
      }
      if (!block) range.insertNode(node);
      else if (/^(LI|TD|TH|PRE|SUMMARY|CAPTION|FIGCAPTION|DT|DD)$/.test(block.tagName) || (block.parentElement && block.parentElement.tagName === "LI")) {
        this.insertInline(node);
        return;
      } else if (block.tagName === "P" && this.isBlockEmpty(block) && this._isFlow(block.parentElement)) block.replaceWith(node);
      else this.topBlock(block).after(node);
      this._caretAfter(node);
    },

    _flatten(frag) {
      const doc = this.doc;
      const lines = [];
      let run = doc.createDocumentFragment();
      const flush = () => {
        if (run.childNodes.length) lines.push(run);
        run = doc.createDocumentFragment();
      };
      Array.from(frag.childNodes).forEach((n) => {
        if (n.nodeType === 1 && BLOCKISH.has(n.localName)) {
          flush();
          if (n.localName === "hr") return;
          if (/^(ul|ol|table|dl)$/.test(n.localName)) {
            n.querySelectorAll("li,tr,dt,dd").forEach((x) => {
              const t =
                x.localName === "tr"
                  ? Array.from(x.cells).map((c) => c.textContent.trim()).join(" | ")
                  : Array.from(x.childNodes).filter((c) => !(c.nodeType === 1 && /^(ul|ol)$/.test(c.localName))).map((c) => c.textContent).join("").trim();
              if (t) {
                const f = doc.createDocumentFragment();
                f.append(t);
                lines.push(f);
              }
            });
          } else {
            const f = doc.createDocumentFragment();
            while (n.firstChild) f.appendChild(n.firstChild);
            lines.push(f);
          }
        } else run.appendChild(n);
      });
      flush();
      const out = doc.createDocumentFragment();
      lines.forEach((l, i) => {
        if (i) out.appendChild(doc.createElement("br"));
        out.appendChild(l);
      });
      return out;
    },

    insertFragment(frag) {
      let range = this.getRange();
      if (!range) {
        this._placeCaretAtEnd();
        range = this.getRange();
      }
      if (!range.collapsed) range = this._deleteSelection(range);
      const doc = this.doc;
      const nodes = Array.from(frag.childNodes);
      if (!nodes.length) return;
      const hasBlocks = nodes.some((n) => n.nodeType === 1 && BLOCKISH.has(n.localName));
      const block = this._blockAtRange(range);

      // only objects (e.g. a pasted <img>) into an empty top-level paragraph: no <p> wrapper
      if (this._smartP && !hasBlocks && nodes.every((n) => n.nodeType === 1 && isObjectLike(n)) && block && block.tagName === "P" && this.isBlockEmpty(block) && this._isFlow(block.parentElement)) {
        const last = nodes[nodes.length - 1];
        block.replaceWith(frag);
        this._caretAfter(last);
        return;
      }

      if (!hasBlocks || (block && BREAK_TAGS.has(block.tagName)) || (block && block.tagName === "LI")) {
        const f = hasBlocks ? this._flatten(frag) : frag;
        const last = f.lastChild;
        if (!last) return;
        const eb = this._enterEmptyBlock(range);
        range.insertNode(f);
        this._dropPlaceholderBr(eb);
        this._caretAfter(last);
        this._ensureBlocksAtCaret();
        return;
      }
      if (!block) {
        const last = nodes[nodes.length - 1];
        range.insertNode(frag);
        this._caretAfter(last);
        return;
      }

      const empty = this.isBlockEmpty(block);
      let tail = null;
      if (!empty) {
        const r = doc.createRange();
        r.setStart(range.startContainer, range.startOffset);
        r.setEnd(block, block.childNodes.length);
        const tf = r.extractContents();
        const probe = doc.createElement("div");
        probe.appendChild(tf.cloneNode(true));
        if (!this.isBlockEmpty(probe)) {
          tail = doc.createElement(block.tagName.toLowerCase());
          if (block.hasAttribute("dir")) tail.setAttribute("dir", block.getAttribute("dir"));
          tail.appendChild(tf);
        }
        this._cleanEmptyInline(block);
      }
      const lastNode = nodes[nodes.length - 1];
      block.after(frag);
      if (tail) lastNode.after(tail);
      if (empty || this.isBlockEmpty(block)) block.remove();
      if (!lastNode.nextSibling && !/^(P|H[1-6])$/.test(lastNode.tagName) && this._isFlow(lastNode.parentElement)) this._ensureTrailingParagraph(lastNode);
      this._caretEnd(lastNode);
    },

    _textToFragment(text) {
      const doc = this.doc;
      const lines = String(text).replace(/\r\n?/g, "\n").split("\n");
      const frag = doc.createDocumentFragment();
      const filled = lines.filter((l) => l.trim() !== "");
      if (filled.length <= 1 && lines.length <= 2) {
        if (filled.length) frag.append(filled[0]);
        return frag;
      }
      filled.forEach((l) => {
        const p = doc.createElement("p");
        p.textContent = l;
        frag.appendChild(p);
      });
      return frag;
    },

    /* ---------- copy / cut / paste ---------- */
    _onCopy(e, cut) {
      const range = this.getRange();
      if (!range || range.collapsed || !e.clipboardData) return;
      const box = this.doc.createElement("div");
      box.appendChild(range.cloneContents());
      e.clipboardData.setData("text/html", box.innerHTML);
      e.clipboardData.setData("text/plain", this.win.getSelection().toString());
      e.clipboardData.setData("application/x-proeditor", "1");
      e.preventDefault();
      if (cut && !this.readOnly) {
        this.flushHistory();
        this._deleteSelection(range);
        this._ensureBlocksAtCaret();
        this.commit();
      }
    },

    _onPaste(e) {
      e.preventDefault();
      if (this.readOnly) return;
      const cd = e.clipboardData;
      if (!cd) return;
      this.flushHistory();
      const html = cd.getData("text/html");
      const text = cd.getData("text/plain");
      if (!html && cd.files && cd.files.length) {
        this._handleFiles(cd.files);
        return;
      }
      // a bare URL: link the selection, or insert a link
      if (!html && this.options.autoLink && /^https?:\/\/[^\s]+$/i.test((text || "").trim()) && typeof this.linkTo === "function") {
        this.linkTo(text.trim());
        return;
      }
      let frag = null;
      if (html && html.trim()) {
        const internal = [...(cd.types || [])].includes("application/x-proeditor");
        frag = sanitizeFragment(html, this._san({ paste: !internal }));
        if (!frag.textContent.trim() && !frag.querySelector(MEDIA_SEL)) frag = null;
      }
      const node = frag ? this.doc.importNode(frag, true) : this._textToFragment(text || "");
      this.insertFragment(node);
      this.commit();
    },

    async _handleFiles(files) {
      const list = Array.from(files).filter((f) => /^(image|video|audio)\//.test(f.type));
      if (!list.length) return;
      if (typeof this.options.upload !== "function" || typeof this._insertUploaded !== "function") {
        this._toast(this.t("dropHint"), "warn");
        return;
      }
      for (const f of list) {
        const kind = f.type.split("/")[0];
        try {
          this._toast(this.t("uploading", { name: f.name }));
          const res = await this.options.upload(f, kind);
          if (res && res.url) this._insertUploaded(kind, res, f);
          this._toast("");
        } catch (err) {
          console.error("ProEditor: upload failed", err);
          this._toast(this.t("uploadError"), "error");
        }
      }
    },

    // Tab / Shift+Tab in lists and tables
    _onTab(e) {
      const range = this.getRange();
      if (!range) return false;
      const block = this._blockAtRange(range);
      if (!block) return false;
      const li = block.tagName === "LI" ? block : block.parentElement && block.parentElement.tagName === "LI" ? block.parentElement : null;
      if (li) {
        this.flushHistory();
        return e.shiftKey ? !!(this._outdentLi && this._outdentLi(li)) : !!(this._indentLi && this._indentLi(li));
      }
      const cell = block.closest("td,th");
      if (cell) return !!(this._tabCell && this._tabCell(cell, e.shiftKey));
      return false;
    },
  });
})(window);
