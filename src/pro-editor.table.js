/*!
 * pro-editor.table.js
 * ------------------------------------------------------------------
 * Tables: insert dialog (optional header row), floating toolbar (rows / columns / header / delete)
 * and Tab navigation (Tab in the last cell appends a row).
 */
(function (global) {
  "use strict";

  const ProEditor = global.ProEditor;
  if (!ProEditor) throw new Error("ProEditor: load pro-editor.core.js before this file");

  Object.assign(ProEditor.prototype, {
    async openTableModal() {
      const saved = this._saveSel();
      const res = await this._dialog({
        title: this.t("tableInsert"),
        fields: [
          { row: [
            { key: "rows", label: this.t("tableRows"), type: "number", value: 3, min: 1, max: 50, required: true },
            { key: "cols", label: this.t("tableCols"), type: "number", value: 3, min: 1, max: 15, required: true },
          ] },
          { key: "header", label: this.t("tableHeader"), type: "checkbox", value: true },
        ],
        validate: (v) => (+v.rows < 1 || +v.rows > 50 || +v.cols < 1 || +v.cols > 15 ? this.t("tableLimits") : null),
      });
      this._restoreSel(saved);
      if (!res) return;
      const rows = Math.min(50, Math.max(1, parseInt(res.rows, 10) || 1));
      const cols = Math.min(15, Math.max(1, parseInt(res.cols, 10) || 1));
      const doc = this.doc;
      const table = doc.createElement("table");
      const mk = (tag) => {
        const c = doc.createElement(tag);
        c.appendChild(doc.createElement("br"));
        return c;
      };
      if (res.header) {
        const tr = table.createTHead().insertRow();
        for (let c = 0; c < cols; c++) {
          const th = mk("th");
          th.setAttribute("scope", "col");
          tr.appendChild(th);
        }
      }
      const tb = table.createTBody();
      for (let r = res.header ? 1 : 0; r < rows; r++) {
        const tr = tb.insertRow();
        for (let c = 0; c < cols; c++) tr.appendChild(mk("td"));
      }
      let range = this.getRange();
      if (range && !range.collapsed) range = this._deleteSelection(range);
      const block = range && this._blockAtRange(range);
      const top = block ? this.topBlock(block) : null;
      if (block && /^(TD|TH|LI)$/.test(block.tagName)) this._toast(this.t("tableNested"), "warn");
      else {
        if (!top) (range ? range.insertNode(table) : this.body.appendChild(table));
        else if (top.tagName === "P" && this.isBlockEmpty(top)) top.replaceWith(table);
        else top.after(table);
        this._ensureTrailingParagraph(table);
        this._caretStart(table.querySelector("th,td"));
      }
      this.commit();
    },

    _cellAtCaret() {
      const r = this.getRange();
      if (!r) return null;
      const n = this._edgeNode(r.startContainer, r.startOffset, true);
      const el = n.nodeType === 3 ? n.parentElement : n;
      const cell = el && el.closest("td,th");
      return cell && this.body.contains(cell) ? cell : null;
    },

    _positionTableToolbar() {
      const tb = this.tableToolbar;
      if (!tb || !this.body) return;
      if (this.root.classList.contains("pe-source-mode") || this.readOnly || this._dialogOpen) return tb.classList.remove("pe-visible");
      const cell = this._cellAtCaret();
      const table = cell && cell.closest("table");
      if (!cell || !table) return tb.classList.remove("pe-visible");
      this._activeCell = cell;
      this._activeTable = table;

      if (!tb.dataset.built) {
        const b = (cmd, icon, key) => this._btn(cmd, icon, this.t(key));
        tb.innerHTML = global.PE_Utils.trust(
          [
            b("rowAbove", "rowAbove", "tRowAbove"),
            b("addRowBelow", "plusRow", "tRowBelow"),
            b("delRow", "minusRow", "tDelRow"),
            b("colBefore", "colLeft", "tColBefore"),
            b("addColRight", "plusCol", "tColAfter"),
            b("delCol", "minusCol", "tDelCol"),
            b("toggleHeader", "tableHeader", "tToggleHeader"),
            b("delTable", "tableDelete", "tDelTable"),
          ].join("")
        );
        tb.dataset.built = "1";
        tb.addEventListener("mousedown", (e) => e.preventDefault());
        tb.addEventListener("click", (e) => {
          const btn = e.target.closest(".pe-btn");
          if (btn) this._tableCommand(btn.dataset.cmd);
        });
      }
      const wr = this.wrap.getBoundingClientRect();
      const ir = this.iframe.getBoundingClientRect();
      const tr = table.getBoundingClientRect();
      const top = ir.top - wr.top + tr.top + this.wrap.scrollTop - 38;
      let left = ir.left - wr.left + tr.left + this.wrap.scrollLeft;
      left = Math.max(4, Math.min(left, this.wrap.clientWidth - tb.offsetWidth - 4));
      tb.style.top = Math.max(2, top) + "px";
      tb.style.left = left + "px";
      tb.classList.add("pe-visible");
    },

    _tableCommand(cmd) {
      const table = this._activeTable;
      const cell = this._activeCell;
      if (!table || !cell || !table.isConnected) return;
      this.flushHistory();
      const row = cell.closest("tr");
      const ri = row.rowIndex;
      const ci = cell.cellIndex;
      const cols = row.cells.length;
      const mkCell = (tag) => {
        const c = this.doc.createElement(tag);
        c.appendChild(this.doc.createElement("br"));
        return c;
      };
      const rowTag = (r) => (r && r.cells[0] && r.cells[0].tagName === "TH" && r.parentElement.tagName !== "TBODY" ? "th" : "td");
      let focus = cell;

      if (cmd === "addRowBelow" || cmd === "rowAbove") {
        const inHead = row.parentElement.tagName === "THEAD" && cmd === "addRowBelow";
        const section = inHead ? table.tBodies[0] || table.createTBody() : row.parentElement;
        const nr = section.insertRow(section === row.parentElement ? (cmd === "addRowBelow" ? row.sectionRowIndex + 1 : row.sectionRowIndex) : 0);
        for (let i = 0; i < cols; i++) nr.appendChild(mkCell(section.tagName === "THEAD" ? "th" : "td"));
        focus = nr.cells[Math.min(ci, nr.cells.length - 1)];
      } else if (cmd === "delRow") {
        if (table.rows.length > 1) {
          const next = table.rows[ri + 1] || table.rows[ri - 1];
          table.deleteRow(ri);
          focus = next.cells[Math.min(ci, next.cells.length - 1)];
        }
      } else if (cmd === "addColRight" || cmd === "colBefore") {
        const at = cmd === "addColRight" ? ci + 1 : ci;
        Array.from(table.rows).forEach((r) => {
          const c = mkCell(rowTag(r) === "th" || r.parentElement.tagName === "THEAD" ? "th" : "td");
          r.insertBefore(c, r.cells[at] || null);
        });
        focus = row.cells[at];
      } else if (cmd === "delCol") {
        if (table.rows[0].cells.length > 1) {
          Array.from(table.rows).forEach((r) => r.deleteCell(Math.min(ci, r.cells.length - 1)));
          focus = row.cells[Math.min(ci, row.cells.length - 1)];
        }
      } else if (cmd === "toggleHeader") {
        const first = table.rows[0];
        const isHead = first.cells[0].tagName === "TH";
        Array.from(first.cells).forEach((c) => {
          const n = this.doc.createElement(isHead ? "td" : "th");
          Array.from(c.attributes).forEach((a) => n.setAttribute(a.name, a.value));
          if (isHead) n.removeAttribute("scope");
          else n.setAttribute("scope", "col");
          while (c.firstChild) n.appendChild(c.firstChild);
          c.replaceWith(n);
          if (c === cell) focus = n;
        });
      } else if (cmd === "delTable") {
        const p = this.doc.createElement("p");
        p.appendChild(this.doc.createElement("br"));
        table.replaceWith(p);
        this._caretStart(p);
        this.tableToolbar.classList.remove("pe-visible");
        return this.commit();
      }
      if (focus && focus.isConnected) this._caretStart(focus);
      this.commit();
    },

    // Tab / Shift+Tab between cells
    _tabCell(cell, back) {
      const table = cell.closest("table");
      const cells = Array.from(table.querySelectorAll("th,td"));
      const i = cells.indexOf(cell);
      if (back) {
        if (i <= 0) return false;
        this._caretStart(cells[i - 1]);
        return true;
      }
      if (i < cells.length - 1) this._caretStart(cells[i + 1]);
      else {
        this._activeTable = table;
        this._activeCell = cell;
        this._tableCommand("addRowBelow");
        const rows = table.rows;
        this._caretStart(rows[rows.length - 1].cells[0]);
      }
      return true;
    },
  });
})(window);
