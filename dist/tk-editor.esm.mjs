/*! ProEditor v1.0.1 | MIT | zero-dependency WYSIWYG */
const factory = function (window) {
  function serverStub() {
    function ProEditor() { throw new Error("ProEditor only works in a browser. During SSR call it inside useEffect / onMounted / a dynamic import (ssr:false)."); }
    ProEditor.version = "1.0.1";
    ProEditor.attach = function () { return []; };
    ProEditor.get = function () { return null; };
    ProEditor.detach = function () {};
    ProEditor.autoInit = function () {};
    ProEditor.observe = function () { return { disconnect: function () {}, editors: function () { return []; } }; };
    return ProEditor;
  }
  if (!window || !window.document) return serverStub();
  if (window.ProEditor && window.ProEditor.version === "1.0.1") return window.ProEditor; // do not initialize twice
/*!
 * tk-editor.icons.js
 * ------------------------------------------------------------------
 * All editor icons as raw inline SVG in a single file (no icon font, no external package).
 *
 * To add an icon:
 *   PE_ICONS.myIcon = PE_ICONS.svg('<path d="..."/>');
 * or register a toolbar button with a custom icon via ProEditor.registerButton().
 */
(function (global) {
  "use strict";

  const svg = (inner) => `<svg viewBox="0 0 24 24" class="pe-icon" aria-hidden="true">${inner}</svg>`;

  const PE_ICONS = {
    svg, // exposed for plugins

    bold: svg('<path d="M6 4h6a3.2 3.2 0 0 1 0 6.4H6zM6 10.4h7a3.3 3.3 0 0 1 0 6.6H6z"/>'),
    italic: svg('<path d="M14 4h6M4 20h6M15 4 9 20"/>'),
    underline: svg('<path d="M6 4v6.5a6 6 0 0 0 12 0V4"/><path d="M4 20h16"/>'),
    quote: svg('<path d="M7 8c-2 0-3 1.5-3 3.5S5 15 7 15c-1 2.5-2 3.5-3.5 4.2"/><path d="M16 8c-2 0-3 1.5-3 3.5s1 3.5 3 3.5c-1 2.5-2 3.5-3.5 4.2"/>'),
    blockquote: svg('<rect x="4" y="5" width="2.4" height="14" rx="1"/><path d="M10 7h10M10 12h10M10 17h6"/>'),
    link: svg('<path d="M9 15 15 9"/><path d="M11 7l1.2-1.2a3.5 3.5 0 0 1 5 5L16 12"/><path d="M13 17l-1.2 1.2a3.5 3.5 0 0 1-5-5L8 12"/>'),
    unlink: svg('<path d="M9 15 15 9"/><path d="M11 7l1.2-1.2a3.5 3.5 0 0 1 5 5L16 12"/><path d="M13 17l-1.2 1.2a3.5 3.5 0 0 1-5-5L8 12"/><path d="M4 4l16 16" stroke-width="2"/>'),
    listBullet: svg('<circle cx="5" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="5" cy="18" r="1.2" fill="currentColor" stroke="none"/><path d="M9 6h11M9 12h11M9 18h11"/>'),
    listOrdered: svg('<text x="2.3" y="8" font-size="6.4">1</text><text x="2.3" y="14.2" font-size="6.4">2</text><text x="2.3" y="20.4" font-size="6.4">3</text><path d="M9 6h11M9 12h11M9 18h11"/>'),
    table: svg('<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 10h16M4 15h16M10 4v16M15 4v16"/>'),
    section: svg('<rect x="4" y="5" width="16" height="14" rx="1.5" stroke-dasharray="2.6 2.4"/><path d="M8 10h8M8 14h5"/>'),
    alignRight: svg('<path d="M20 5H4M20 10H10M20 15H4M20 19H10"/>'),
    alignLeft: svg('<path d="M20 5H4M14 10H4M20 15H4M14 19H4"/>'),
    alignCenter: svg('<path d="M20 5H4M17 10H7M20 15H4M17 19H7"/>'),
    alignJustify: svg('<path d="M20 5H4M20 10H4M20 15H4M20 19H4"/>'),
    dir: svg('<path d="M4 7h11M11 4l4 3-4 3"/><path d="M20 17H9M13 14l-4 3 4 3"/>'),
    color: svg('<text x="6.2" y="17">A</text><path d="M4 20h16" stroke-width="2.6"/>'),
    attr: svg('<path d="M8 4 4 12l4 8M16 4l4 8-4 8"/><path d="M10.5 9h3M10.5 15h3"/>'),
    undo: svg('<path d="M7 10H15a5 5 0 0 1 0 10h-2"/><path d="M11 6 6.5 10 11 14"/>'),
    redo: svg('<path d="M17 10H9a5 5 0 0 0 0 10h2"/><path d="M13 6l4.5 4L13 14"/>'),
    code: svg('<path d="m9 8-4 4 4 4M15 8l4 4-4 4"/>'),
    br: svg('<path d="M4 8h13a3 3 0 0 1 0 6H9"/><path d="M12 11 9 14l3 3"/>'),
    hr: svg('<path d="M4 12h16" stroke-width="2.4"/><circle cx="5" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="18" r="1" fill="currentColor" stroke="none"/>'),
    plusRow: svg('<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 14h16"/><path d="M12 17.5v3.5M10.2 19.3h3.6"/>'),
    minusRow: svg('<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 14h16"/><path d="M10.2 19.3h3.6"/>'),
    plusCol: svg('<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M14 4v16"/><path d="M17.5 12h3.5M19.3 10.2v3.6"/>'),
    minusCol: svg('<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M14 4v16"/><path d="M19.3 10.2v3.6"/>'),
    close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),

    /* --- media (image/video/audio) --- */
    image: svg('<rect x="3.5" y="4.5" width="17" height="15" rx="1.8"/><circle cx="9" cy="10" r="1.6" fill="currentColor" stroke="none"/><path d="m5 17 4.5-5 3.5 4 2.5-3 3.5 4"/>'),
    video: svg('<rect x="3.5" y="6" width="13" height="12" rx="1.6"/><path d="M16.5 10.5 21 8v8l-4.5-2.5z"/>'),
    audio: svg('<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2.2"/><circle cx="17" cy="16" r="2.2"/>'),
    picture: svg('<rect x="3.5" y="8" width="13" height="11.5" rx="1.6"/><path d="M7.5 4.5h11A2 2 0 0 1 20.5 6.5v9"/><circle cx="8" cy="12" r="1.2" fill="currentColor" stroke="none"/><path d="m4 18.5 4-4 3 3 2-2 3.5 3"/>'),
    pencil: svg('<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m14.5 7.5 3 3"/>'),
    upload: svg('<path d="M12 16V5M7.5 9.5 12 5l4.5 4.5"/><path d="M5 19h14"/>'),
    folder: svg('<path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4l2 2.5h8a1.5 1.5 0 0 1 1.5 1.5v7.5A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z"/>'),
    arrowUp: svg('<path d="m6 14 6-6 6 6"/>'),
    arrowDown: svg('<path d="m6 10 6 6 6-6"/>'),
    strike: svg('<path d="M4 12h16"/><path d="M16.5 7.2C16 5.6 14.4 5 12.2 5 9.7 5 8.2 6.1 8.2 7.8c0 1.1.7 1.9 2.2 2.4M8 16.6c.6 1.5 2.1 2.4 4.2 2.4 2.5 0 4.1-1.1 4.1-2.9 0-.5-.1-.9-.4-1.2"/>'),
    sub: svg('<path d="m4 6 8 9M12 6l-8 9"/><path d="M15.5 18.2c0-1 .9-1.7 2-1.7s2 .6 2 1.6c0 1.6-3.8 1.8-4 3.4h4.2"/>'),
    sup: svg('<path d="m4 8 8 9M12 8l-8 9"/><path d="M15.5 5.2c0-1 .9-1.7 2-1.7s2 .6 2 1.6c0 1.6-3.8 1.8-4 3.4h4.2"/>'),
    mark: svg('<path d="m9 15 7.5-7.5 3 3L12 18H9z"/><path d="m14 9.5 3 3"/><path d="M4 21h9"/>'),
    clear: svg('<path d="M5 5h11M10.5 5 8 15"/><path d="m13 15 6 6M19 15l-6 6"/>'),
    fullscreen: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    fullscreenExit: svg('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'),
    desktop: svg('<rect x="3.5" y="4.5" width="17" height="11.5" rx="1.5"/><path d="M9 20h6M12 16v4"/>'),
    tablet: svg('<rect x="5.5" y="3.5" width="13" height="17" rx="2"/><path d="M11 17.5h2"/>'),
    mobile: svg('<rect x="8" y="3.5" width="8" height="17" rx="2"/><path d="M11 17.5h2"/>'),
    rowAbove: svg('<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 10h16"/><path d="M12 5.4v3.2M10.4 7h3.2"/>'),
    colLeft: svg('<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M10 4v16"/><path d="M5.4 12h3.2M7 10.4v3.2"/>'),
    tableHeader: svg('<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 10h16M10 10v10"/><path d="M5 5h14v4H5z" fill="currentColor" fill-opacity=".3" stroke="none"/>'),
    tableDelete: svg('<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 10h16M10 4v16"/><path d="m13.5 13.5 5 5M18.5 13.5l-5 5" stroke-width="2.2"/>'),
    trash: svg('<path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 13h8l1-13"/>'),
  };

  global.PE_ICONS = PE_ICONS;
})(window);

/*!
 * tk-editor.i18n.js
 * ------------------------------------------------------------------
 * Every user-facing string lives here. English is built in.
 *
 * Use another language without touching the source:
 *   ProEditor.registerLocale("xx", { bold: "...", ... });   // register once
 *   new ProEditor(el, { locale: "xx" });
 * or override a few strings for one instance:
 *   new ProEditor(el, { messages: { placeholder: "Write something..." } });
 *
 * Messages may contain {placeholders} that are filled by the editor.
 */
(function (global) {
  "use strict";

  const en = {
    // general
    toolbar: "Editing toolbar",
    editor: "Rich text editor",
    sourceArea: "HTML source",
    placeholder: "Start writing...",
    words: "{words} words · {chars} characters",
    cancel: "Cancel",
    ok: "OK",
    close: "Close",
    moveUp: "Move up",
    moveDown: "Move down",
    removeRow: "Remove row",
    required: "“{label}” is required.",
    selectTextFirst: "Select some text first.",
    colorNeedsSelection: "Select some text to apply a color.",
    unsafeAttrs: "These attributes were not applied (unsafe or invalid): {names}",
    invalidAttrName: "Attribute name “{name}” is not valid (letters, digits and - _ : . only).",
    invalidValue: "Invalid value.",

    // toolbar buttons
    block: "Text style",
    p: "Paragraph",
    h1: "Heading 1",
    h2: "Heading 2",
    h3: "Heading 3",
    h4: "Heading 4",
    h5: "Heading 5",
    h6: "Heading 6",
    pre: "Code block",
    plain: "Plain (no block)",
    bold: "Bold (Ctrl+B)",
    italic: "Italic (Ctrl+I)",
    underline: "Underline (Ctrl+U)",
    strike: "Strikethrough",
    mark: "Highlight",
    more: "More formatting",
    sub: "Subscript",
    sup: "Superscript",
    code: "Inline code",
    quote: "Inline quote (q)",
    clearFormat: "Clear formatting",
    blockquote: "Block quote",
    link: "Insert / edit link (Ctrl+K)",
    unlink: "Remove link",
    ul: "Bulleted list",
    ol: "Numbered list",
    marker: "List marker",
    markerPlaceholder: "Marker",
    align: "Text alignment",
    alignRight: "Align right",
    alignCenter: "Align center",
    alignLeft: "Align left",
    alignJustify: "Justify",
    dir: "Toggle text direction (RTL / LTR)",
    color: "Text color",
    attr: "Custom attributes",
    table: "Insert table",
    section: "Wrap in container (section)",
    hr: "Horizontal rule",
    br: "Line break (Shift+Enter)",
    image: "Insert image",
    picture: "Insert responsive image (picture + media queries)",
    video: "Insert video",
    audio: "Insert audio",
    undo: "Undo (Ctrl+Z)",
    redo: "Redo (Ctrl+Shift+Z)",
    fullscreen: "Fullscreen",
    fullscreenExit: "Exit fullscreen (Esc)",
    source: "Edit HTML source",
    sourceBack: "Back to visual editor",
    previewLabel: "Responsive preview",
    previewDesktop: "Desktop (full width)",
    previewTablet: "Tablet preview — 768px",
    previewMobile: "Mobile preview — 375px",

    // list markers
    markerDisc: "Disc",
    markerCircle: "Circle",
    markerSquare: "Square",
    markerNone: "None",
    markerDecimal: "1, 2, 3",
    markerDecimalZero: "01, 02, 03",
    markerLowerAlpha: "a, b, c",
    markerUpperAlpha: "A, B, C",
    markerLowerRoman: "i, ii, iii",
    markerUpperRoman: "I, II, III",

    // custom attributes dialog
    customAttrs: "Custom attributes",
    customAttrsHint: "For example class, id, data-*, aria-*. Unsafe attributes (on*, javascript: URLs, ...) are removed automatically.",
    attrName: "Attribute name (e.g. data-id)",
    attrValue: "Value",
    addAttr: "+ Add attribute",
    attrsTitle: "Attributes of “{tag}”",
    attrsTitleNew: "Add custom attribute (wraps the selection in a span)",

    // link dialog
    linkInsert: "Insert link",
    linkEdit: "Edit link",
    linkText: "Link text",
    linkHref: "URL (href)",
    linkTitle: "Title",
    linkTitleHint: "Short tooltip text",
    linkTarget: "Open in",
    linkSame: "Same tab",
    linkNew: "New tab (noopener noreferrer is added automatically)",
    linkBadUrl: "Invalid or unsafe URL. Only http, https, mailto, tel and relative URLs are allowed.",
    linkAdvanced: "Custom attributes",

    // table
    tableInsert: "Insert table",
    tableRows: "Rows",
    tableCols: "Columns",
    tableHeader: "Use the first row as header (th)",
    tableLimits: "Rows: 1–50, columns: 1–15.",
    tableNested: "Tables cannot be inserted inside lists or other tables.",
    tableToolbar: "Table tools",
    tRowAbove: "Insert row above",
    tRowBelow: "Insert row below",
    tDelRow: "Delete row",
    tColBefore: "Insert column before",
    tColAfter: "Insert column after",
    tDelCol: "Delete column",
    tToggleHeader: "Toggle header row",
    tDelTable: "Delete table",

    // containers (section, nav, header, ...)
    containerTools: "Container tools",
    containerTag: "Container element",
    containerUnwrap: "Remove container (keep content)",
    containerAttrs: "Container attributes",
    blockquoteNested: "Block quotes inside lists or tables are not supported.",

    // media: common
    mediaTools: "Media tools",
    mEdit: "Edit (double-click)",
    mAttrs: "Custom attributes",
    mLink: "Link",
    mRemove: "Remove",
    resizeLabel: "Resize width (drag, or use the arrow keys)",
    resizeTitle: "Drag to resize — double-click to reset",
    srcRemoved: "The src attribute was removed; the media will not display.",
    uploadBtn: "Upload a file",
    browseBtn: "Choose from the media manager",
    managerError: "Media manager error.",
    uploadError: "Upload failed.",
    uploading: "Uploading “{name}”…",
    dropHint: "Use the media buttons to insert files (or configure the upload option).",
    advanced: "Advanced",
    title: "Title",

    // media: image
    mImageInsert: "Insert image",
    mImageEdit: "Edit image",
    imgSrc: "Image URL",
    imgSrcFallback: "Fallback image URL",
    imgAlt: "Alternative text (alt)",
    imgAltHint: "Short description for screen readers and search engines",
    imgDecorative: "Decorative image (empty alt)",
    imgWidth: "Intrinsic width (px)",
    imgHeight: "Intrinsic height (px)",
    auto: "Auto",
    imgDimsHint: "The real size of the file. The browser reserves the space up-front (prevents layout shift, CLS). Filled automatically when you enter a URL.",
    imgLoading: "Loading",
    imgLazy: "Lazy (recommended)",
    imgEager: "Eager",
    imgDecoding: "Decoding",
    imgAsync: "async (recommended)",
    imgFetchPriority: "Fetch priority",
    imgPrioHigh: "high (main image above the fold)",
    errImgUrl: "Invalid or unsafe image URL (http, https, blob and data:image are allowed).",
    errAlt: "Enter alternative text (alt), or tick “Decorative image”.",
    errSrcset: "The srcset value is invalid or unsafe.",

    // media: picture
    mPictureInsert: "Insert responsive image (picture)",
    mPictureEdit: "Edit responsive image (picture)",
    picNote: "The browser uses the first <source> whose media query (and type) matches, so order matters (usually largest min-width first). If none match, the fallback image is shown. Use the desktop / tablet / mobile buttons under the editor to test.",
    picSources: "Sources — one media query each",
    srcsetCol: "srcset",
    mediaCol: "Media query",
    typeCol: "Format (type)",
    sizesCol: "sizes (optional)",
    addSource: "+ Add source",
    picFallbackNote: "Fallback image (<img>) — shown when no source matches or the browser does not support picture:",
    typeAuto: "Auto-detect",
    errSourceUnsafe: "The srcset of source #{n} is not safe.",
    errMediaQuery: "The media query of source #{n} is not valid. Example: (min-width: 768px) or (prefers-color-scheme: dark)",
    errSizes: "The sizes value of source #{n} is not valid.",

    // media: video / audio
    mVideoInsert: "Insert video",
    mVideoEdit: "Edit video",
    mAudioInsert: "Insert audio",
    mAudioEdit: "Edit audio",
    videoFiles: "Video files",
    audioFiles: "Audio files",
    fileUrl: "File URL",
    multiFormatHint: "For better compatibility you can add several formats; the browser uses the first one it can play.",
    addFormat: "+ Add another format",
    poster: "Poster image",
    posterHint: "Image shown before playback",
    controls: "Show controls",
    loop: "Loop",
    muted: "Muted",
    autoplay: "Autoplay",
    playsinline: "Play inline on mobile",
    autoplayHint: "Browsers only allow autoplay for muted media; enabling it turns muted on as well.",
    autoplayMuted: "Autoplay requires muted media, so the media was muted.",
    preload: "Preload",
    preloadMeta: "Metadata only (recommended)",
    preloadNone: "Nothing",
    preloadAuto: "Everything",
    tracks: "Subtitles (track) — accessibility",
    trackFile: "VTT file",
    trackKind: "Kind",
    kindSubtitles: "Subtitles",
    kindCaptions: "Captions",
    kindDescriptions: "Descriptions",
    kindChapters: "Chapters",
    trackLang: "Language",
    trackLabel: "Label",
    addTrack: "+ Add subtitle track",
    errMediaUrl: "One of the file URLs is invalid or unsafe.",
    errPoster: "The poster URL is invalid.",
    errTrackSrc: "Enter the subtitle file URL (or remove the row).",
    errTrackUrl: "The subtitle URL is invalid.",
    errTrackLang: "Subtitles and captions need a valid language code (for example en).",

    // forms (textarea integration)
    formRequired: "This field is required.",
  };

  global.PE_I18N = { en };
})(window);

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

/*!
 * tk-editor.core.js
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
 *   Object.assign(ProEditor.prototype, { myMethod() {...} });   // add modules like the tk-editor.*.js files do
 */
(function (global) {
  "use strict";

  const ICONS = global.PE_ICONS;
  const U = global.PE_Utils;
  const I18N = global.PE_I18N;
  if (!ICONS || !U || !I18N) throw new Error("ProEditor: load tk-editor.icons.js, tk-editor.i18n.js and tk-editor.utils.js before core");
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
          messages: null, // per-instance string overrides (see tk-editor.i18n.js)
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
  ProEditor.version = "1.0.1";
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

/*!
 * tk-editor.dialog.js
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
  if (!ProEditor) throw new Error("ProEditor: load tk-editor.core.js before this file");
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

/*!
 * tk-editor.text.js
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
  if (!ProEditor) throw new Error("ProEditor: load tk-editor.core.js before this file");
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

/*!
 * tk-editor.list.js
 * ------------------------------------------------------------------
 * Lists without execCommand: ul/ol, switching between the two, leaving a list with Enter on an
 * empty item, nesting with Tab / Shift+Tab, marker selection, and list items that contain
 * <p> / <h1-h6> blocks.
 */
(function (global) {
  "use strict";

  const ProEditor = global.ProEditor;
  if (!ProEditor) throw new Error("ProEditor: load tk-editor.core.js before this file");

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

/*!
 * tk-editor.table.js
 * ------------------------------------------------------------------
 * Tables: insert dialog (optional header row), floating toolbar (rows / columns / header / delete)
 * and Tab navigation (Tab in the last cell appends a row).
 */
(function (global) {
  "use strict";

  const ProEditor = global.ProEditor;
  if (!ProEditor) throw new Error("ProEditor: load tk-editor.core.js before this file");

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

/*!
 * tk-editor.media.js
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
  if (!ProEditor) throw new Error("ProEditor: load tk-editor.core.js before this file");

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

  return window.ProEditor;
};
const ProEditor = factory(typeof window !== "undefined" ? window : null);
const { attach, detach, get, observe, autoInit, version } = ProEditor;
export default ProEditor;
export { ProEditor, attach, detach, get, observe, autoInit, version };
