/*!
 * pro-editor.dialog.js
 * ------------------------------------------------------------------
 * Generic dialog system on top of the native <dialog> element (focus trap, Esc and inert
 * background come from the browser). All DOM is built with createElement (never innerHTML with
 * user strings) and styles are set through the CSSOM only, so a strict CSP works.
 *
 * spec = {
 *   title, submitLabel?,
 *   fields: [
 *     { key, label, type: 'text'|'url'|'number'|'select'|'checkbox'|'textarea', value, placeholder,
 *       options:[{value,label}], hint, min, max, required, dir:'ltr', suggestions:[...],
 *       browse: { type:'image'|'video'|'audio', purpose }, upload: 'image'|..., onInput(api, value), onPick(api, res) },
 *     { row: [field, field, ...], hint? },
 *     { details: 'Title', open?: bool, fields: [...] },
 *     { type: 'rows', key, label, columns:[field...], rows:[{...}], min, addLabel, hint, reorder },
 *     { type: 'note', text }
 *   ],
 *   validate(values, api) -> null | 'message' | { message, key }
 * }
 * Returns: Promise<values | null>
 */
(function (global) {
  "use strict";
  const ProEditor = global.ProEditor;
  const U = global.PE_Utils;
  const ICONS = global.PE_ICONS;
  if (!ProEditor) throw new Error("ProEditor: load pro-editor.core.js before this file");
  const h = U.h;
  let dlgUid = 0;

  Object.assign(ProEditor.prototype, {
    _dialog(spec) {
      return new Promise((resolve) => {
        const uid = "pe-dlg" + ++dlgUid;
        const widgets = {};
        const dirty = new Set();
        const editor = this;
        const api = {
          root: null,
          get: (k) => (widgets[k] ? widgets[k].get() : undefined),
          set: (k, v) => widgets[k] && widgets[k].set(v),
          disable: (k, d) => widgets[k] && widgets[k].disable && widgets[k].disable(d),
          isDirty: (k) => dirty.has(k),
          values: () => collect(widgets),
        };

        const body = h("div", { class: "pe-dialog-body" });
        const errorEl = h("div", { class: "pe-dialog-error", role: "alert", hidden: true });
        const dlg = h(
          "dialog",
          { class: "pe-dialog", "aria-labelledby": uid + "-t" },
          h(
            "div",
            { class: "pe-dialog-box" },
            h("div", { class: "pe-modal-head" }, h("span", { id: uid + "-t", text: spec.title }), h("button", { type: "button", class: "pe-modal-close", "aria-label": this.t("close"), html: ICONS.close, "data-close": "" })),
            body,
            errorEl,
            h("div", { class: "pe-modal-foot" }, h("button", { type: "button", class: "pe-btn-secondary", "data-close": "", text: this.t("cancel") }), h("button", { type: "button", class: "pe-btn-primary", "data-submit": "", text: spec.submitLabel || this.t("ok") }))
          )
        );
        api.root = dlg;

        /* ----- fields ----- */
        const pickFromManager = async (f, input) => {
          try {
            const res = await editor.options.fileManager(f.browse.type, { purpose: f.browse.purpose || "main" });
            if (res && res.url) {
              input.value = res.url;
              input.dispatchEvent(new Event("input", { bubbles: true }));
              if (f.onPick) f.onPick(api, res);
            }
          } catch (err) {
            console.error("ProEditor: fileManager error", err);
            editor._toast(editor.t("managerError"), "error");
          }
        };
        const uploadFile = async (f, file, input, btn) => {
          btn.disabled = true;
          try {
            const res = await editor.options.upload(file, f.upload);
            if (res && res.url) {
              input.value = res.url;
              input.dispatchEvent(new Event("input", { bubbles: true }));
              if (f.onPick) f.onPick(api, res);
            }
          } catch (err) {
            console.error("ProEditor: upload error", err);
            editor._toast(editor.t("uploadError"), "error");
          } finally {
            btn.disabled = false;
          }
        };

        const buildField = (f, store, scopeKey) => {
          if (f.type === "note") return h("p", { class: "pe-note", text: f.text });
          if (f.type === "rows") return buildRows(f, store);
          const id = uid + "-" + (scopeKey || "") + f.key;
          let input;
          if (f.type === "select") {
            input = h("select", { id }, (f.options || []).map((o) => h("option", { value: o.value, text: o.label })));
            input.value = f.value != null ? f.value : f.options[0].value;
          } else if (f.type === "checkbox") {
            input = h("input", { type: "checkbox", id });
            input.checked = !!f.value;
          } else if (f.type === "textarea") {
            input = h("textarea", { id, rows: f.rows || 3 });
            input.value = f.value || "";
          } else {
            input = h("input", { type: f.type === "number" ? "number" : "text", id, placeholder: f.placeholder, min: f.min, max: f.max, autocomplete: "off", spellcheck: "false" });
            input.value = f.value != null ? String(f.value) : "";
            if (f.type === "url" || f.dir) input.setAttribute("dir", f.dir || "ltr");
            if (f.suggestions) {
              const dl = h("datalist", { id: id + "-dl" }, f.suggestions.map((s) => h("option", { value: s })));
              input.setAttribute("list", id + "-dl");
              input._dl = dl;
            }
          }
          if (f.required) input.setAttribute("aria-required", "true");
          if (f.hint) input.setAttribute("aria-describedby", id + "-h");
          const widget = {
            input,
            get: () => (f.type === "checkbox" ? input.checked : input.value),
            set: (v) => {
              if (f.type === "checkbox") input.checked = !!v;
              else input.value = v == null ? "" : String(v);
              input.dispatchEvent(new Event("input", { bubbles: false }));
            },
            disable: (d) => (input.disabled = !!d),
            spec: f,
          };
          store[f.key] = widget;
          const onEv = () => {
            input.removeAttribute("aria-invalid");
            if (f.onInput) f.onInput(api, widget.get());
          };
          input.addEventListener("input", (e) => {
            if (e.isTrusted) dirty.add(f.key);
            onEv();
          });
          input.addEventListener("change", onEv);

          if (f.type === "checkbox") {
            return h("div", { class: "pe-field pe-check" }, h("label", { for: id }, input, h("span", { text: f.label })), f.hint && h("div", { class: "pe-hint", id: id + "-h", text: f.hint }));
          }
          let control = input;
          if (f.browse || f.upload) {
            const group = h("div", { class: "pe-input-group" }, input);
            if (f.browse && typeof editor.options.fileManager === "function") {
              group.appendChild(h("button", { type: "button", class: "pe-addon", title: editor.t("browseBtn"), "aria-label": editor.t("browseBtn"), html: ICONS.folder, onclick: () => pickFromManager(f, input) }));
            }
            if (f.upload && typeof editor.options.upload === "function") {
              const file = h("input", { type: "file", hidden: true, accept: f.upload + "/*" });
              const btn = h("button", { type: "button", class: "pe-addon", title: editor.t("uploadBtn"), "aria-label": editor.t("uploadBtn"), html: ICONS.upload, onclick: () => file.click() });
              file.addEventListener("change", () => file.files[0] && uploadFile(f, file.files[0], input, btn));
              group.append(file, btn);
            }
            control = group;
          }
          return h("div", { class: "pe-field" }, f.label && h("label", { for: id, text: f.label + (f.required ? " *" : "") }), control, input._dl, f.hint && h("div", { class: "pe-hint", id: id + "-h", text: f.hint }));
        };

        const buildRows = (f, store) => {
          const list = h("div", { class: "pe-rows" });
          const rowStores = [];
          const min = f.min || 0;
          const refresh = () => {
            rowStores.forEach((rs, i) => {
              const up = rs.el.querySelector("[data-up]");
              const down = rs.el.querySelector("[data-down]");
              const del = rs.el.querySelector("[data-del]");
              if (up) up.disabled = i === 0;
              if (down) down.disabled = i === rowStores.length - 1;
              if (del) del.disabled = rowStores.length <= min;
            });
          };
          const iconBtn = (attr, icon, title, extra) => h("button", Object.assign({ type: "button", [attr]: "", title, "aria-label": title, html: ICONS[icon] }, extra || {}));
          const addRow = (vals = {}) => {
            const rs = { w: {}, el: null };
            const cols = h("div", { class: "pe-row-cols" });
            cols.style.setProperty("--cols", String(f.columns.length)); // CSSOM, not a style="" attribute (CSP-safe)
            f.columns.forEach((c) => {
              const col = Object.assign({}, c, { value: vals[c.key] != null ? vals[c.key] : c.value });
              const el = buildField(col, rs.w, "r" + rowStores.length + "-");
              el.classList.add("pe-col");
              cols.appendChild(el);
            });
            const ctl = h("div", { class: "pe-row-ctl" });
            if (f.reorder !== false) ctl.append(iconBtn("data-up", "arrowUp", editor.t("moveUp")), iconBtn("data-down", "arrowDown", editor.t("moveDown")));
            ctl.append(iconBtn("data-del", "close", editor.t("removeRow"), { class: "pe-danger" }));
            const el = h("div", { class: "pe-row-item" }, cols, ctl);
            rs.el = el;
            el.addEventListener("click", (e) => {
              const b = e.target.closest("button");
              if (!b) return;
              const i = rowStores.indexOf(rs);
              if (b.hasAttribute("data-del") && rowStores.length > min) {
                rowStores.splice(i, 1);
                el.remove();
              } else if (b.hasAttribute("data-up") && i > 0) {
                rowStores.splice(i - 1, 0, rowStores.splice(i, 1)[0]);
                list.insertBefore(el, rowStores[i].el);
              } else if (b.hasAttribute("data-down") && i < rowStores.length - 1) {
                rowStores.splice(i + 1, 0, rowStores.splice(i, 1)[0]);
                list.insertBefore(rowStores[i].el, el);
              }
              refresh();
            });
            rowStores.push(rs);
            list.appendChild(el);
            refresh();
            return rs;
          };
          const initial = (f.rows && f.rows.length ? f.rows : []).slice();
          while (initial.length < min) initial.push({});
          initial.forEach((r) => addRow(r));
          store[f.key] = { get: () => rowStores.map((rs) => collect(rs.w)), rows: rowStores, set: () => {} };
          return h(
            "div",
            { class: "pe-field pe-rows-field" },
            f.label && h("div", { class: "pe-label", text: f.label }),
            f.hint && h("div", { class: "pe-hint", text: f.hint }),
            list,
            h("button", { type: "button", class: "pe-link-btn", text: f.addLabel || "+", onclick: () => {
              const rs = addRow({});
              const first = rs.el.querySelector("input,select");
              if (first) first.focus();
            } })
          );
        };

        const mount = (fields, parent, store) => {
          fields.forEach((f) => {
            if (!f) return;
            if (f.row) {
              const r = h("div", { class: "pe-row2" });
              mount(f.row, r, store);
              parent.appendChild(r);
              if (f.hint) parent.appendChild(h("div", { class: "pe-hint", text: f.hint }));
            } else if (f.details) {
              const d = h("details", { class: "pe-details", open: f.open }, h("summary", { text: f.details }));
              const inner = h("div", { class: "pe-details-body" });
              mount(f.fields, inner, store);
              d.appendChild(inner);
              parent.appendChild(d);
            } else parent.appendChild(buildField(f, store));
          });
        };
        mount(spec.fields || [], body, widgets);
        // initial state of dependent fields (e.g. disabled alt)
        Object.values(widgets).forEach((w) => w.spec && w.spec.onInput && w.spec.onInput(api, w.get()));

        function collect(store) {
          const out = {};
          for (const [k, w] of Object.entries(store)) out[k] = w.get();
          return out;
        }

        /* ----- close / submit ----- */
        const close = (result) => {
          if (dlg.open && dlg.close) dlg.close();
          dlg.remove();
          editor._dialogOpen = false;
          resolve(result);
        };
        const fail = (msg, key) => {
          errorEl.textContent = msg;
          errorEl.hidden = false;
          const w = key && widgets[key];
          const t = w && w.input;
          if (t) {
            t.setAttribute("aria-invalid", "true");
            t.focus();
          }
        };
        const submit = () => {
          errorEl.hidden = true;
          dlg.querySelectorAll("[aria-invalid]").forEach((n) => n.removeAttribute("aria-invalid"));
          const walk = (store) => {
            for (const w of Object.values(store)) {
              if (w.rows) {
                for (const rs of w.rows) {
                  const r = walk(rs.w);
                  if (r) return r;
                }
              } else if (w.spec && w.spec.required && !w.input.disabled && String(w.get()).trim() === "") {
                return { message: editor.t("required", { label: w.spec.label || w.spec.key }), input: w.input };
              }
            }
            return null;
          };
          const miss = walk(widgets);
          if (miss) {
            errorEl.textContent = miss.message;
            errorEl.hidden = false;
            miss.input.setAttribute("aria-invalid", "true");
            miss.input.focus();
            return;
          }
          const values = collect(widgets);
          const v = spec.validate ? spec.validate(values, api) : null;
          if (v) {
            if (typeof v === "string") fail(v);
            else fail(v.message, v.key);
            return;
          }
          close(values);
        };

        dlg.addEventListener("click", (e) => {
          if (e.target.closest("[data-close]")) close(null);
          else if (e.target.closest("[data-submit]")) submit();
        });
        dlg.addEventListener("cancel", (e) => {
          e.preventDefault();
          close(null);
        });
        dlg.addEventListener("mousedown", (e) => {
          if (e.target === dlg) close(null);
        });
        dlg.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.shiftKey && e.target.tagName !== "TEXTAREA" && e.target.tagName !== "BUTTON" && e.target.tagName !== "SUMMARY" && !e.isComposing) {
            e.preventDefault();
            submit();
          }
        });

        this._dialogOpen = true;
        this.root.appendChild(dlg);
        if (typeof dlg.showModal === "function") dlg.showModal();
        else dlg.setAttribute("open", "");
        const first = dlg.querySelector("input:not([type=hidden]):not([disabled]),select,textarea");
        if (first) first.focus();
      });
    },

    /* ---------- shared "custom attributes" field ---------- */
    _attrsField(el, label) {
      const rows = el ? Array.from(el.attributes).map((a) => ({ k: a.name, v: a.value })) : [];
      return {
        type: "rows",
        key: "attrs",
        label: label || this.t("customAttrs"),
        hint: this.t("customAttrsHint"),
        columns: [
          { key: "k", type: "text", dir: "ltr", placeholder: this.t("attrName") },
          { key: "v", type: "text", placeholder: this.t("attrValue") },
        ],
        rows,
        reorder: false,
        addLabel: this.t("addAttr"),
      };
    },
    _validateAttrs(values) {
      const bad = (values.attrs || []).find((r) => r.k.trim() && !/^[a-zA-Z_:][-a-zA-Z0-9_:.]*$/.test(r.k.trim()));
      return bad ? this.t("invalidAttrName", { name: bad.k }) : null;
    },
    // Applies attributes to an element, then cleans them with the main sanitizer rules
    _applyCustomAttrs(el, attrs, keep) {
      keep = keep || [];
      Array.from(el.attributes).forEach((a) => {
        if (!keep.includes(a.name)) el.removeAttribute(a.name);
      });
      const blocked = [];
      (attrs || []).forEach(({ k, v }) => {
        k = (k || "").trim();
        if (!k) return;
        if (/^on/i.test(k) || /^(srcdoc|formaction|xlink:href)$/i.test(k)) {
          blocked.push(k); // never reaches the live DOM
          return;
        }
        try {
          el.setAttribute(k, v);
        } catch (e) {
          blocked.push(k);
        }
      });
      const removed = U.cleanAttributes(el, this._san());
      const all = blocked.concat(removed);
      if (all.length) this._toast(this.t("unsafeAttrs", { names: [...new Set(all)].join(", ") }), "warn");
    },
  });
})(window);
