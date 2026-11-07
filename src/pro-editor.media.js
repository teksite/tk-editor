/*!
 * pro-editor.media.js
 * ------------------------------------------------------------------
 * Media: image (img), responsive image (picture + source + media queries), video and audio.
 *
 * 1) Without a media manager: every button opens a dialog where you type a URL (fully standalone).
 * 2) With your media manager: pass `fileManager` and a "choose from media manager" button appears
 *    next to every URL field:
 *
 *   new ProEditor("#editor", {
 *     fileManager(type, ctx) {   // type: 'image'|'video'|'audio'   ctx.purpose: 'main'|'source'|'poster'|'track'
 *       return new Promise((resolve) => {
 *         MyFileManager.open({ accept: type }, (f) => resolve(f ? { url: f.url, alt: f.title, width: f.w, height: f.h } : null));
 *       });
 *     },
 *     upload(file, type) { return fetch(...).then((r) => r.json()).then((j) => ({ url: j.url })); }, // optional
 *   });
 *
 * 3) Click any inserted media: a floating toolbar (edit, link, attributes, remove) and a resize handle
 *    (mouse / touch / keyboard) appear. Double-click = edit. Delete / Backspace removes the selected media.
 *
 * "Smart paragraphs": inserting media into an EMPTY paragraph replaces it (no wrapper <p>);
 * inside existing text an image goes inline. Video / audio are never wrapped in a <p>.
 *
 * Output is responsive and clean: max-width:100% + height:auto, width/height (prevents layout shift),
 * loading=lazy + decoding=async for images, preload=metadata + playsinline for video.
 */
(function (global) {
  "use strict";

  const ProEditor = global.ProEditor;
  const U = global.PE_Utils;
  const ICONS = global.PE_ICONS;
  if (!ProEditor) throw new Error("ProEditor: load pro-editor.core.js before this file");

  const MQ_PRESETS = [
    "(min-width: 1024px)",
    "(min-width: 768px)",
    "(max-width: 767px)",
    "(max-width: 480px)",
    "(orientation: landscape)",
    "(orientation: portrait)",
    "(prefers-color-scheme: dark)",
    "(prefers-reduced-motion: reduce)",
    "(min-resolution: 2dppx)",
  ];
  const IMG_TYPES = [["image/avif", "AVIF"], ["image/webp", "WebP"], ["image/jpeg", "JPEG"], ["image/png", "PNG"], ["image/gif", "GIF"], ["image/svg+xml", "SVG"]];
  const VIDEO_TYPES = [["video/mp4", "MP4"], ["video/webm", "WebM"], ["video/ogg", "Ogg"], ["video/quicktime", "MOV"]];
  const AUDIO_TYPES = [["audio/mpeg", "MP3"], ["audio/ogg", "Ogg"], ["audio/wav", "WAV"], ["audio/mp4", "M4A"], ["audio/aac", "AAC"], ["audio/webm", "WebM"], ["audio/flac", "FLAC"]];

  const intOrNull = (v) => {
    const n = parseInt(v, 10);
    return n > 0 ? n : null;
  };
  const setAttr = (el, name, val) => {
    if (val != null && String(val).trim() !== "") el.setAttribute(name, String(val).trim());
    else el.removeAttribute(name);
  };
  const setBool = (el, name, on) => (on ? el.setAttribute(name, "") : el.removeAttribute(name));

  Object.assign(ProEditor.prototype, {
    // [{value,label}] with an "auto-detect" first entry; unknown existing types are appended
    _typeOptions(list, extra) {
      const opts = [{ value: "auto", label: this.t("typeAuto") }, ...list.map(([value, label]) => ({ value, label }))];
      (extra || []).forEach((v) => v && v !== "auto" && !opts.some((o) => o.value === v) && opts.push({ value: v, label: v }));
      return opts;
    },

    /* =================== shared fields =================== */
    _imageFields(opts) {
      opts = opts || {};
      let timer = null;
      const probe = (api, url) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const u = String(url || "").trim();
          if (!u || U.safeUrl(u, "media", "img") === null) return;
          const im = new Image();
          im.onload = () => {
            if (!im.naturalWidth) return;
            if (!api.isDirty("width")) api.set("width", im.naturalWidth);
            if (!api.isDirty("height")) api.set("height", im.naturalHeight);
          };
          im.src = u;
        }, 450);
      };
      return [
        {
          key: "src", label: opts.srcLabel || this.t("imgSrc"), type: "url", required: true, placeholder: "https://example.com/image.jpg",
          browse: { type: "image", purpose: "main" }, upload: "image", onInput: probe,
          onPick: (api, res) => {
            if (res.alt && !api.get("alt")) api.set("alt", res.alt);
            if (res.width && !api.isDirty("width")) api.set("width", res.width);
            if (res.height && !api.isDirty("height")) api.set("height", res.height);
          },
        },
        { key: "alt", label: this.t("imgAlt"), type: "text", hint: this.t("imgAltHint") },
        { key: "decorative", label: this.t("imgDecorative"), type: "checkbox", onInput: (api, v) => {
          api.disable("alt", v);
          if (v) api.set("alt", "");
        } },
        { row: [
          { key: "width", label: this.t("imgWidth"), type: "number", min: 1, placeholder: this.t("auto") },
          { key: "height", label: this.t("imgHeight"), type: "number", min: 1, placeholder: this.t("auto") },
        ], hint: this.t("imgDimsHint") },
        { row: [
          { key: "loading", label: this.t("imgLoading"), type: "select", options: [{ value: "lazy", label: this.t("imgLazy") }, { value: "eager", label: this.t("imgEager") }] },
          { key: "decoding", label: this.t("imgDecoding"), type: "select", options: [{ value: "async", label: this.t("imgAsync") }, { value: "auto", label: "auto" }, { value: "sync", label: "sync" }] },
        ] },
        { details: this.t("advanced"), fields: [
          { key: "title", label: this.t("title"), type: "text" },
          { key: "srcset", label: "srcset", type: "text", dir: "ltr", placeholder: "a-800.jpg 800w, a-1600.jpg 1600w" },
          { key: "sizes", label: "sizes", type: "text", dir: "ltr", placeholder: "(min-width: 800px) 800px, 100vw" },
          { key: "fetchpriority", label: this.t("imgFetchPriority"), type: "select", options: [{ value: "auto", label: "auto" }, { value: "high", label: this.t("imgPrioHigh") }, { value: "low", label: "low" }] },
        ] },
      ];
    },

    _readImage(img) {
      const has = img && img.hasAttribute("alt");
      return {
        src: img ? img.getAttribute("src") || "" : "",
        alt: img ? img.getAttribute("alt") || "" : "",
        decorative: !!img && has && img.getAttribute("alt") === "",
        width: img ? img.getAttribute("width") || "" : "",
        height: img ? img.getAttribute("height") || "" : "",
        loading: (img && img.getAttribute("loading")) || "lazy",
        decoding: (img && img.getAttribute("decoding")) || "async",
        title: img ? img.getAttribute("title") || "" : "",
        srcset: img ? img.getAttribute("srcset") || "" : "",
        sizes: img ? img.getAttribute("sizes") || "" : "",
        fetchpriority: (img && img.getAttribute("fetchpriority")) || "auto",
      };
    },
    _withValues(fields, vals) {
      const walk = (f) => {
        if (!f) return f;
        if (f.row) return Object.assign({}, f, { row: f.row.map(walk) });
        if (f.details) return Object.assign({}, f, { fields: f.fields.map(walk) });
        return f.key in vals ? Object.assign({}, f, { value: vals[f.key] }) : f;
      };
      return fields.map(walk);
    },
    _validateImage(v) {
      const u = String(v.src).trim();
      if (U.safeUrl(u, "media", "img") === null) return { message: this.t("errImgUrl"), key: "src" };
      if (!v.decorative && !String(v.alt).trim()) return { message: this.t("errAlt"), key: "alt" };
      if (v.srcset && U.safeSrcset(v.srcset, "img") === null) return { message: this.t("errSrcset"), key: "srcset" };
      return null;
    },
    _applyImage(img, v) {
      img.setAttribute("src", U.safeUrl(String(v.src).trim(), "media", "img"));
      img.setAttribute("alt", v.decorative ? "" : String(v.alt).trim());
      setAttr(img, "width", intOrNull(v.width));
      setAttr(img, "height", intOrNull(v.height));
      setAttr(img, "loading", v.loading);
      setAttr(img, "decoding", v.decoding);
      setAttr(img, "title", v.title);
      setAttr(img, "srcset", v.srcset);
      setAttr(img, "sizes", v.sizes);
      if (v.fetchpriority && v.fetchpriority !== "auto") img.setAttribute("fetchpriority", v.fetchpriority);
      else img.removeAttribute("fetchpriority");
      if (v.fetchpriority === "high") img.setAttribute("loading", "eager");
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      U.cleanAttributes(img, this._san());
    },

    /* =================== dialog definitions =================== */
    _mediaSpec(type, existing) {
      if (type === "image") {
        const img = existing && existing.tagName === "IMG" ? existing : null;
        return {
          title: this.t(img ? "mImageEdit" : "mImageInsert"),
          fields: this._withValues(this._imageFields(), this._readImage(img)),
          validate: (v) => this._validateImage(v),
        };
      }

      if (type === "picture") {
        const pic = existing || null;
        const img = pic ? pic.querySelector("img") : null;
        const sources = pic
          ? Array.from(pic.querySelectorAll(":scope > source")).map((s) => ({
              srcset: s.getAttribute("srcset") || s.getAttribute("src") || "",
              media: s.getAttribute("media") || "",
              type: s.getAttribute("type") || "auto",
              sizes: s.getAttribute("sizes") || "",
            }))
          : [{ srcset: "", media: "(min-width: 768px)", type: "auto", sizes: "" }];
        return {
          title: this.t(pic ? "mPictureEdit" : "mPictureInsert"),
          fields: [
            { type: "note", text: this.t("picNote") },
            {
              type: "rows", key: "sources", label: this.t("picSources"), min: 1, rows: sources, addLabel: this.t("addSource"),
              columns: [
                { key: "srcset", label: this.t("srcsetCol"), type: "url", required: true, placeholder: "a-800.webp 1x, a-1600.webp 2x", browse: { type: "image", purpose: "source" }, upload: "image" },
                { key: "media", label: this.t("mediaCol"), type: "text", dir: "ltr", required: true, placeholder: "(min-width: 768px)", suggestions: MQ_PRESETS },
                { key: "type", label: this.t("typeCol"), type: "select", options: this._typeOptions(IMG_TYPES, sources.map((s) => s.type)) },
                { key: "sizes", label: this.t("sizesCol"), type: "text", dir: "ltr", placeholder: "100vw" },
              ],
            },
            { type: "note", text: this.t("picFallbackNote") },
            ...this._withValues(this._imageFields({ srcLabel: this.t("imgSrcFallback") }), this._readImage(img)),
          ],
          validate: (v) => {
            for (let i = 0; i < v.sources.length; i++) {
              const s = v.sources[i];
              const n = i + 1;
              if (U.safeSrcset(s.srcset.trim(), "source") === null) return this.t("errSourceUnsafe", { n });
              if (!U.validMediaQuery(s.media)) return this.t("errMediaQuery", { n });
              if (s.sizes && !/^[^<>{}"`\\]{1,300}$/.test(s.sizes)) return this.t("errSizes", { n });
            }
            return this._validateImage(v);
          },
        };
      }

      const isVideo = type === "video";
      const el = existing && existing.tagName === (isVideo ? "VIDEO" : "AUDIO") ? existing : null;
      const srcs = [];
      if (el) {
        if (el.getAttribute("src")) srcs.push({ src: el.getAttribute("src"), type: "auto" });
        el.querySelectorAll(":scope > source").forEach((s) => srcs.push({ src: s.getAttribute("src") || "", type: s.getAttribute("type") || "auto" }));
      }
      const tracks = el ? Array.from(el.querySelectorAll(":scope > track")).map((t) => ({ src: t.getAttribute("src") || "", kind: t.getAttribute("kind") || "subtitles", srclang: t.getAttribute("srclang") || "", label: t.getAttribute("label") || "" })) : [];
      const b = (n, d) => (el ? el.hasAttribute(n) : d);
      const fields = [
        {
          type: "rows", key: "sources", label: this.t(isVideo ? "videoFiles" : "audioFiles"), min: 1, rows: srcs, addLabel: this.t("addFormat"), hint: this.t("multiFormatHint"),
          columns: [
            { key: "src", label: this.t("fileUrl"), type: "url", required: true, placeholder: isVideo ? "https://example.com/video.mp4" : "https://example.com/audio.mp3", browse: { type, purpose: "source" }, upload: type },
            { key: "type", label: this.t("typeCol"), type: "select", options: this._typeOptions(isVideo ? VIDEO_TYPES : AUDIO_TYPES, srcs.map((s) => s.type)) },
          ],
        },
        isVideo ? { key: "poster", label: this.t("poster"), type: "url", value: el ? el.getAttribute("poster") || "" : "", placeholder: this.t("posterHint"), browse: { type: "image", purpose: "poster" }, upload: "image" } : null,
        { row: [
          { key: "controls", label: this.t("controls"), type: "checkbox", value: b("controls", true) },
          { key: "loop", label: this.t("loop"), type: "checkbox", value: b("loop", false) },
          { key: "muted", label: this.t("muted"), type: "checkbox", value: b("muted", false) },
        ] },
        { row: [
          { key: "autoplay", label: this.t("autoplay"), type: "checkbox", value: b("autoplay", false), onInput: (api, v) => v && api.set("muted", true) },
          isVideo ? { key: "playsinline", label: this.t("playsinline"), type: "checkbox", value: b("playsinline", true) } : null,
        ].filter(Boolean), hint: this.t("autoplayHint") },
        { row: [
          { key: "preload", label: this.t("preload"), type: "select", value: (el && el.getAttribute("preload")) || "metadata", options: [{ value: "metadata", label: this.t("preloadMeta") }, { value: "none", label: this.t("preloadNone") }, { value: "auto", label: this.t("preloadAuto") }] },
          { key: "title", label: this.t("title"), type: "text", value: el ? el.getAttribute("title") || "" : "" },
        ] },
      ];
      if (isVideo) {
        fields.push({ details: this.t("tracks"), open: tracks.length > 0, fields: [
          {
            type: "rows", key: "tracks", rows: tracks, min: 0, addLabel: this.t("addTrack"),
            columns: [
              { key: "src", label: this.t("trackFile"), type: "url", dir: "ltr", placeholder: "subtitles.en.vtt", browse: { type: "audio", purpose: "track" } },
              { key: "kind", label: this.t("trackKind"), type: "select", options: [{ value: "subtitles", label: this.t("kindSubtitles") }, { value: "captions", label: this.t("kindCaptions") }, { value: "descriptions", label: this.t("kindDescriptions") }, { value: "chapters", label: this.t("kindChapters") }] },
              { key: "srclang", label: this.t("trackLang"), type: "text", dir: "ltr", placeholder: "en" },
              { key: "label", label: this.t("trackLabel"), type: "text", placeholder: "English" },
            ],
          },
        ] });
      }
      return {
        title: this.t(el ? (isVideo ? "mVideoEdit" : "mAudioEdit") : isVideo ? "mVideoInsert" : "mAudioInsert"),
        fields: fields.filter(Boolean),
        validate: (v) => {
          for (const s of v.sources) if (U.safeUrl(s.src.trim(), "media", "source") === null) return this.t("errMediaUrl");
          if (isVideo && v.poster && U.safeUrl(v.poster.trim(), "media", "img") === null) return { message: this.t("errPoster"), key: "poster" };
          for (const t of v.tracks || []) {
            if (!t.src.trim()) return this.t("errTrackSrc");
            if (U.safeUrl(t.src.trim(), "media", "track") === null) return this.t("errTrackUrl");
            if ((t.kind === "subtitles" || t.kind === "captions") && !/^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(t.srclang.trim())) return this.t("errTrackLang");
          }
          return null;
        },
      };
    },

    /* =================== build / update elements =================== */
    _applyPictureSources(pic, v) {
      pic.querySelectorAll(":scope > source").forEach((s) => s.remove());
      const img = pic.querySelector("img");
      v.sources.forEach((s) => {
        const so = this.doc.createElement("source");
        const first = s.srcset.trim().split(/\s+/)[0];
        so.setAttribute("srcset", s.srcset.trim());
        so.setAttribute("media", s.media.trim());
        const t = s.type === "auto" ? U.guessMime(first) : s.type;
        if (t) so.setAttribute("type", t);
        setAttr(so, "sizes", s.sizes);
        pic.insertBefore(so, img);
      });
    },

    _applyAV(el, type, v) {
      const doc = this.doc;
      el.removeAttribute("src");
      el.querySelectorAll(":scope > source, :scope > track").forEach((n) => n.remove());
      v.sources.forEach((s) => {
        const so = doc.createElement("source");
        so.setAttribute("src", U.safeUrl(s.src.trim(), "media", "source"));
        const t = s.type === "auto" ? U.guessMime(s.src) : s.type;
        if (t) so.setAttribute("type", t);
        el.appendChild(so);
      });
      (v.tracks || []).forEach((t) => {
        const tr = doc.createElement("track");
        tr.setAttribute("src", t.src.trim());
        tr.setAttribute("kind", t.kind);
        setAttr(tr, "srclang", t.srclang);
        setAttr(tr, "label", t.label);
        el.appendChild(tr);
      });
      const muted = v.muted || v.autoplay;
      setBool(el, "controls", v.controls);
      setBool(el, "loop", v.loop);
      setBool(el, "muted", muted);
      setBool(el, "autoplay", v.autoplay);
      if (type === "video") {
        setBool(el, "playsinline", v.playsinline);
        const p = v.poster && U.safeUrl(v.poster.trim(), "media", "img");
        setAttr(el, "poster", p || null);
        el.style.maxWidth = "100%";
        el.style.height = "auto";
      }
      setAttr(el, "preload", v.preload);
      setAttr(el, "title", v.title);
      if (v.autoplay && !v.muted) this._toast(this.t("autoplayMuted"));
      U.cleanAttributes(el, this._san());
    },

    _buildMedia(type, v) {
      const doc = this.doc;
      let el;
      if (type === "image") {
        el = doc.createElement("img");
        this._applyImage(el, v);
      } else if (type === "picture") {
        el = doc.createElement("picture");
        const img = doc.createElement("img");
        el.appendChild(img);
        this._applyImage(img, v);
        this._applyPictureSources(el, v);
      } else {
        el = doc.createElement(type);
        this._applyAV(el, type, v);
      }
      return el;
    },

    _applyMedia(type, el, v) {
      if (type === "image") this._applyImage(el, v);
      else if (type === "picture") {
        this._applyImage(el.querySelector("img"), v);
        this._applyPictureSources(el, v);
      } else this._applyAV(el, type, v);
    },

    // Smart placement: images go inline (or replace an empty paragraph); video/audio are block-level and never get a <p>
    _placeMedia(el, type) {
      if (type === "image" || type === "picture") this.insertInline(el);
      else this.insertBlockObject(el);
    },

    async openMediaDialog(type, existing) {
      const saved = existing ? null : this._saveSel();
      const res = await this._dialog(this._mediaSpec(type, existing));
      if (!existing) this._restoreSel(saved);
      if (!res) return;
      let el = existing;
      if (existing) this._applyMedia(type, existing, res);
      else {
        el = this._buildMedia(type, res);
        this._placeMedia(el, type);
      }
      this.commit();
      requestAnimationFrame(() => this._selectMedia(this._visual(el)));
    },

    // Drag & drop / paste of files through options.upload. alt defaults to the file name without extension.
    _insertUploaded(kind, res, file) {
      const name = (res.alt || (file && file.name) || "").replace(/\.[^.]+$/, "");
      const v = kind === "image"
        ? Object.assign(this._readImage(null), { src: res.url, alt: name, decorative: !name, width: res.width || "", height: res.height || "" })
        : { sources: [{ src: res.url, type: "auto" }], controls: true, loop: false, muted: false, autoplay: false, playsinline: true, preload: "metadata", title: name, poster: "", tracks: [] };
      const el = this._buildMedia(kind, v);
      this._placeMedia(el, kind);
      this.commit();
      requestAnimationFrame(() => this._selectMedia(this._visual(el)));
    },

    /* =================== selection and overlay =================== */
    _visual(el) {
      return el.tagName === "PICTURE" ? el.querySelector("img") || el : el;
    },
    _mediaRoot(el) {
      return el.closest("picture") || el;
    },
    // Selects the media like an "object": the editor selection covers it (Delete removes it, Enter does not)
    _selectMedia(el) {
      if (!el || !el.isConnected) return;
      this._activeMedia = el;
      const anchor = this._mediaRoot(el);
      const r = this.doc.createRange();
      r.selectNode(anchor.closest("a") || anchor);
      this.setRange(r);
      this._positionMediaOverlay();
      this._refreshToolbarState();
    },
    // True while the editor selection still points at the active media (used to hide the overlay otherwise)
    _mediaStillSelected(range) {
      const m = this._activeMedia;
      if (!m || !m.isConnected || !range) return false;
      const root = this._mediaRoot(m);
      const anchor = root.closest("a") || root;
      if (!range.collapsed) return range.intersectsNode(anchor);
      const c = range.startContainer;
      return c.nodeType === 1 && (c.childNodes[range.startOffset] === anchor || c.childNodes[range.startOffset - 1] === anchor);
    },

    _initMediaOverlay() {
      const wrap = this.wrap;
      const h = U.h;
      const mk = (action, icon, title) => h("button", { type: "button", class: "pe-btn", title, "aria-label": title, "data-action": action, html: ICONS[icon] });
      const actions = h("div", { class: "pe-media-actions", role: "toolbar", "aria-label": this.t("mediaTools") }, mk("edit", "pencil", this.t("mEdit")), mk("link", "link", this.t("mLink")), mk("attrs", "attr", this.t("mAttrs")), mk("remove", "trash", this.t("mRemove")));
      const frame = h("div", { class: "pe-media-frame", "aria-hidden": "true" });
      const handle = h("span", { class: "pe-media-resize-handle", role: "slider", tabindex: "0", "aria-label": this.t("resizeLabel"), title: this.t("resizeTitle") });
      wrap.append(frame, actions, handle);
      this.mediaActions = actions;
      this.mediaFrame = frame;
      this.mediaHandle = handle;

      actions.addEventListener("mousedown", (e) => e.preventDefault());
      actions.addEventListener("click", (e) => {
        const a = e.target.closest("[data-action]");
        if (!a || !this._activeMedia) return;
        const el = this._activeMedia;
        const root = this._mediaRoot(el);
        const act = a.dataset.action;
        if (act === "remove") this._removeActiveMedia();
        else if (act === "attrs") this.openMediaAttributeModal();
        else if (act === "link") this.openLinkModal();
        else this._editMedia(root);
      });

      // Resize with Pointer Events (mouse, touch and pen behave the same)
      const doResize = (el, w) => {
        const max = Math.max(80, this.iframe.clientWidth - 40);
        w = Math.round(Math.max(60, Math.min(max, w)));
        el.style.width = w + "px";
        el.style.maxWidth = "100%";
        el.style.height = "auto";
        this._positionMediaOverlay();
      };
      handle.addEventListener("pointerdown", (e) => {
        const el = this._activeMedia;
        if (!el) return;
        e.preventDefault();
        this.flushHistory();
        handle.setPointerCapture(e.pointerId);
        const rtl = this.win.getComputedStyle(el).direction === "rtl";
        const st = { x: e.clientX, w: el.getBoundingClientRect().width };
        const move = (ev) => doResize(el, st.w + (rtl ? -1 : 1) * (ev.clientX - st.x));
        const up = () => {
          handle.removeEventListener("pointermove", move);
          handle.removeEventListener("pointerup", up);
          handle.removeEventListener("pointercancel", up);
          this.commit();
        };
        handle.addEventListener("pointermove", move);
        handle.addEventListener("pointerup", up);
        handle.addEventListener("pointercancel", up);
      });
      handle.addEventListener("keydown", (e) => {
        const el = this._activeMedia;
        if (!el) return;
        const step = e.shiftKey ? 40 : 10;
        const w = el.getBoundingClientRect().width;
        if (e.key === "ArrowRight" || e.key === "ArrowUp") doResize(el, w + step);
        else if (e.key === "ArrowLeft" || e.key === "ArrowDown") doResize(el, w - step);
        else return;
        e.preventDefault();
        this.scheduleHistory();
      });
      handle.addEventListener("dblclick", () => {
        const el = this._activeMedia;
        if (!el) return;
        el.style.removeProperty("width");
        if (!el.getAttribute("style")) el.removeAttribute("style");
        el.style.maxWidth = "100%";
        el.style.height = "auto";
        this._positionMediaOverlay();
        this.commit();
      });
    },

    _removeActiveMedia() {
      const el = this._activeMedia;
      if (!el) return;
      this.flushHistory();
      const root = this._mediaRoot(el);
      const target = root.closest("a") && root.closest("a").textContent.trim() === "" ? root.closest("a") : root;
      const parent = target.parentElement;
      const next = target.nextSibling;
      target.remove();
      this._hideMediaOverlay();
      if (parent && parent !== this.body && !parent.firstChild) parent.appendChild(this.doc.createElement("br"));
      if (!this.body.firstChild) {
        this._caretStart(this._resetEmptyBody());
      } else if (parent) {
        const r = this.doc.createRange();
        if (next && next.parentNode === parent) r.setStartBefore(next);
        else r.setStart(parent, parent.childNodes.length);
        r.collapse(true);
        this.setRange(r);
      }
      this._ensureBlocksAtCaret();
      this.commit();
    },

    _editMedia(root) {
      const type = { PICTURE: "picture", IMG: "image", VIDEO: "video", AUDIO: "audio" }[root.tagName];
      if (type) this.openMediaDialog(type, root);
    },

    async openMediaAttributeModal() {
      const el = this._activeMedia;
      if (!el) return;
      const res = await this._dialog({
        title: this.t("attrsTitle", { tag: el.localName }),
        fields: [this._attrsField(el)],
        validate: (v) => this._validateAttrs(v),
      });
      if (!res || !el.isConnected) return;
      this._applyCustomAttrs(el, res.attrs, []);
      if (!el.hasAttribute("src") && el.tagName === "IMG") this._toast(this.t("srcRemoved"), "warn");
      this.commit();
      this._positionMediaOverlay();
    },

    _onMediaClick(e) {
      const t = e.target.closest && e.target.closest("img,video,audio");
      if (t) this._selectMedia(t);
      else this._hideMediaOverlay();
    },
    _onMediaDblClick(e) {
      const t = e.target.closest && e.target.closest("img,video,audio");
      if (t && !this.readOnly) this._editMedia(this._mediaRoot(t));
    },

    _positionMediaOverlay() {
      const el = this._activeMedia;
      if (!el || !el.isConnected || !this.mediaActions || this.readOnly) return this._hideMediaOverlay();
      const wr = this.wrap.getBoundingClientRect();
      const ir = this.iframe.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const top = ir.top - wr.top + er.top + this.wrap.scrollTop;
      const left = ir.left - wr.left + er.left + this.wrap.scrollLeft;
      const f = this.mediaFrame.style;
      f.top = top + "px";
      f.left = left + "px";
      f.width = er.width + "px";
      f.height = er.height + "px";
      this.mediaFrame.classList.add("pe-visible");
      const a = this.mediaActions;
      a.classList.add("pe-visible");
      const aw = a.offsetWidth;
      a.style.top = Math.max(2, top - 38) + "px";
      a.style.left = Math.max(2, Math.min(left, this.wrap.clientWidth - aw - 2)) + "px";
      if (el.tagName !== "AUDIO") {
        // the handle sits on the inline-end bottom corner: that is the edge that moves when the width changes
        const rtl = this.win.getComputedStyle(el).direction === "rtl";
        this.mediaHandle.style.top = top + er.height - 8 + "px";
        this.mediaHandle.style.left = (rtl ? left - 8 : left + er.width - 8) + "px";
        this.mediaHandle.classList.add("pe-visible");
      } else this.mediaHandle.classList.remove("pe-visible");
    },

    _hideMediaOverlay() {
      this._activeMedia = null;
      if (this.mediaActions) this.mediaActions.classList.remove("pe-visible");
      if (this.mediaFrame) this.mediaFrame.classList.remove("pe-visible");
      if (this.mediaHandle) this.mediaHandle.classList.remove("pe-visible");
    },
  });
})(window);
