# tk-editor

A zero-dependency WYSIWYG editor that turns any `<textarea>` into a rich editor with one line of code.
Plain HTML / CSS / JS, no `document.execCommand`, RTL and LTR, responsive `<picture>` authoring,
and a sanitizer that works under a strict CSP with Trusted Types.

- **~46 KB gzipped** JS + **~4 KB** CSS (`dist/tk-editor.umd.min.js`, `dist/tk-editor.min.css`), no runtime dependencies.
- Your form and backend stay unchanged: the textarea keeps its `name` and always holds sanitized HTML.
- ESM, CommonJS and UMD builds, TypeScript types, SSR-safe import.

## Install

```bash
npm  i tk-editor
pnpm add tk-editor
yarn add tk-editor
```

> Change the package `name` in `package.json` before publishing (for example `@your-scope/tk-editor`).

## Three ways to use it

### 1. With JavaScript (Vite, webpack, Next, ...)

```js
import ProEditor from "tk-editor";
import "tk-editor/css";

ProEditor.attach("textarea.wysiwyg", { minHeight: 300 });                 // every matching textarea
ProEditor.attach(document.querySelector("#body"));                        // one element
ProEditor.attach(".wysiwyg", (ta) => ({ minHeight: ta.rows * 24 }));      // options per textarea
```

### 2. Automatic, with data attributes

```js
import "tk-editor/auto";   // or the tk-editor.auto.umd.min.js script
import "tk-editor/css";
```
```html
<textarea name="body" data-tk-editor data-pe-height="320" data-pe-hide="audio,video"></textarea>
```
Textareas added later (AJAX, modals, frameworks) are enhanced automatically, and the editor is released when the
textarea is removed from the page (no memory leaks).

### 3. No bundler (CDN)

```html
<link rel="stylesheet" href="https://unpkg.com/tk-editor/dist/tk-editor.min.css">
<script src="https://unpkg.com/tk-editor/dist/tk-editor.auto.umd.min.js"></script>
<textarea name="body" data-tk-editor></textarea>
```
Without auto-init use `tk-editor.umd.min.js` and call `ProEditor.attach("textarea")`.

## How textareas behave

- The textarea stays in the form (visually hidden, still focusable for validation) and holds **sanitized HTML**.
- `submit`, `new FormData(form)` and `fetch(form)` all see the current HTML.
- Empty content is an empty string, so `required` works. On error the editor is focused and gets a red frame.
- The initial value can be HTML or plain text (plain text becomes paragraphs).
- `form.reset()` restores the initial value; `<label for>` focuses the editor.
- Every change fires an `input` event on the textarea (Alpine, Vue, validators).
- `disabled` / `readonly` textareas become read-only editors. `placeholder`, `rows` (above 4) and `dir` / `lang` are read from the textarea and the page.
- Changed the value from code? Call `ProEditor.get(textarea).setHTML(value)`.

### Data attributes

| Attribute | Meaning |
|---|---|
| `data-tk-editor` | enable (auto build) |
| `data-pe-height="320"` / `data-pe-max-height="700"` | min / max height |
| `data-pe-theme="auto｜light｜dark"` | theme |
| `data-pe-toolbar="full｜standard｜minimal"` | toolbar preset |
| `data-pe-hide="audio,video,table"` | hide buttons |
| `data-pe-dir="rtl｜ltr"` / `data-pe-locale="xx"` | direction / UI language |
| `data-pe-readonly` / `data-pe-statusbar="false"` | read-only / no status bar |

Global options for the auto build: `window.PRO_EDITOR_OPTIONS = { fileManager, upload, ... }` (set it before the script).

## API

```ts
// textarea integration
ProEditor.attach(target, options | (ta) => options): ProEditor[]
ProEditor.get(textarea): ProEditor | null
ProEditor.detach(target): void                    // textarea restored, value = HTML
ProEditor.observe(selector, options): { disconnect(), editors() }
ProEditor.autoInit(options?)

// extension points
ProEditor.registerLocale(name, messages)
ProEditor.registerButton(id, { icon, title, onClick(editor), isActive?(editor) })
ProEditor.sanitize(html): string                  // the allow-list sanitizer as a utility

// instance
editor.getHTML() · setHTML(html) · getText() · isEmpty() · focus() · sync()
editor.command("bold")                            // any toolbar command from code
editor.setReadOnly(bool) · setTheme("auto"|"light"|"dark") · setPreviewWidth(px|null)
editor.toggleFullscreen() · setContainerTag("nav") · undo() · redo() · destroy()
editor.on("change" | "ready" | "destroy" | "focus" | "blur", fn)   // returns an unsubscribe function
```

Every option is documented in `types/index.d.ts`:
`dir lang locale messages minHeight maxHeight placeholder theme toolbar statusbar readOnly hide paragraphs markdown autoLink
changeDelay allowedTags allowedAttrs allowData clobberProtection nonce fileManager upload onChange onReady`.

## Toolbar

```js
new ProEditor(el, { toolbar: "minimal" });                                   // "full" (default) | "standard" | "minimal"
new ProEditor(el, { toolbar: [["block"], ["bold", "italic", "link"], ["image", "picture"], ["source"]] });
new ProEditor(el, { hide: ["audio", "section"] });                           // keep a preset, drop a few buttons

ProEditor.registerButton("stamp", {
  icon: "<svg viewBox='0 0 24 24' class='pe-icon'><path d='M12 3v18M3 12h18'/></svg>",
  title: "Insert stamp",
  onClick: (ed) => ed.command("hr"),
});
new ProEditor(el, { toolbar: [["bold"], ["stamp"]] });
```

Item ids: `block bold italic underline strike mark more sub sup code quote clearFormat blockquote link unlink ul ol marker align dir color attr table section hr br image picture video audio undo redo fullscreen source`.

## Languages

English is built in. Add another UI language without touching the source:

```js
ProEditor.registerLocale("xx", { bold: "...", italic: "...", placeholder: "..." });
new ProEditor(el, { locale: "xx" });
new ProEditor(el, { messages: { placeholder: "Write something..." } });     // one-off overrides
console.log(ProEditor.locales.en);                                          // every message key
```
Missing keys fall back to English. Messages may contain `{placeholders}`.

## Paragraph behavior ("smart paragraphs")

A `<p>` is created for **text**. Media never gets a pointless wrapper:

| Action | Result |
|---|---|
| Insert an image / picture into an **empty** paragraph | the paragraph is replaced: `<img ...>` |
| Insert an image in the **middle of text** | stays inline: `<p>he<img ...>llo</p>` |
| Insert video / audio | a sibling block, never wrapped: `<p>text</p><video ...>` |
| Shift+Enter in an empty paragraph | a bare `<br>` (an invisible placeholder keeps the caret line; it is never exported) |
| Start typing next to a bare image | image + text become one `<p>` |
| Bold / italic / link **with text** in an empty paragraph | the `<p>` stays |
| Link around an image (`<a><img></a>`) | no `<p>` |
| Enter after a bare element | a new paragraph |

Use `paragraphs: "always"` for the classic behavior (every loose line wrapped in a `<p>`).

## Keyboard and editing details

- **Leave inline tags:** at the edge of `<q>`, `<code>`, `<a>`, `<strong>`, ... the arrow key steps out, so the next character is typed outside. Works in RTL and LTR.
- **Leave `<pre>`:** press Enter twice at the end, or ArrowDown / ArrowUp at the edge when nothing follows / precedes it. Line breaks are exported as `\n`.
- **Lists:** Tab / Shift+Tab nest and un-nest. List items may contain `<p>` and `<h1>`–`<h6>` (use the text-style select; "Plain" removes the block again).
- **Containers:** `section`, `nav`, `header`, `footer`, `main`, `article`, `aside`, `div`. While the caret is inside one, a floating toolbar lets you switch the element type, edit attributes or remove the container. Enter twice on the last empty paragraph leaves it.
- **Markdown shortcuts** (`markdown: true`): `## ` heading, `- ` list, `1. ` numbered list, `> ` quote, `` ``` `` + Enter code block, `---` + Enter rule. Each conversion is one undo step.
- Pasting a bare URL over selected text links it (`autoLink`). Word / Google Docs paste is cleaned (styles become real tags).
- `sub` and `sup` exclude each other, also at a collapsed caret.

## Media

```js
new ProEditor(el, {
  fileManager(type, ctx) {          // type: image | video | audio     ctx.purpose: main | source | poster | track
    return MyMedia.open(type).then((f) => f && { url: f.url, alt: f.title, width: f.w, height: f.h });
  },
  upload(file, type) {              // optional: upload button, drag & drop and paste of files
    return fetch("/upload", { method: "POST", body: file }).then((r) => r.json());   // -> { url }
  },
});
```

Without `fileManager` every button opens a dialog with direct URL entry. With it, a folder button appears next to each URL field.

- **Image:** required `alt` (or "decorative" for `alt=""`), automatic intrinsic `width` / `height` (prevents layout shift), `loading=lazy`, `decoding=async`, `srcset`, `sizes`, `fetchpriority`.
- **Responsive `<picture>`:** one `<source>` per row with a **validated media query** (the browser's `matchMedia` accepts almost anything, so a structural validator is used), `srcset`, `type`, `sizes`, reordering, and a fallback `<img>`. The desktop / tablet / mobile buttons under the editor narrow the editing frame so the queries really re-evaluate.
- **Video / audio:** several sources, poster, subtitles (`<track>`), `muted` forced for autoplay, `playsinline`, `preload=metadata`.
- Click media: floating toolbar (edit, link, attributes, remove) and a resize handle (mouse, touch, keyboard). Double-click edits. Delete removes the selected media.

## Security

- **Allow-list sanitizer** for tags, attributes, URL protocols (`javascript:` and friends are rejected, including tab / newline / entity tricks), `style` properties and values, `srcset`, media queries and `target=_blank` (`rel=noopener noreferrer` is enforced).
- **DOM clobbering protection:** ids such as `location` or `document` are dropped (`clobberProtection: false` to allow them).
- `allowData: false` drops every `data-*` attribute (some frameworks run behavior from them).
- Content is re-sanitized on paste, drop, `setHTML`, source-view edits and on every `getHTML()`.
- The editing iframe is sandboxed without `allow-scripts`.
- **Strict CSP / Trusted Types:** the editor writes no `style=""` attributes, injects its iframe CSS through constructable stylesheets, and wraps every `innerHTML` assignment in a `tk-editor` Trusted Types policy. Allow it with `trusted-types tk-editor`. Tested with `script-src 'self'; style-src 'self'; require-trusted-types-for 'script'`. (`nonce` covers the rare browsers without constructable stylesheets.)

> This is a client-side defense layer. **Always sanitize the HTML again on the server** before storing or rendering it.

## Frameworks and SSR

Importing the package on the server is safe (constructing an editor there throws a clear error). Create editors in the browser only:

```jsx
// React
import { useEffect, useRef } from "react";
import ProEditor from "tk-editor";
import "tk-editor/css";

export function RichTextarea(props) {
  const ref = useRef(null);
  useEffect(() => {
    const [editor] = ProEditor.attach(ref.current, { minHeight: 280 });
    return () => editor.destroy();
  }, []);
  return <textarea ref={ref} {...props} />;
}
```
```vue
<!-- Vue 3 -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import ProEditor from "tk-editor";
import "tk-editor/css";
const ta = ref(null);
let editor;
onMounted(() => ([editor] = ProEditor.attach(ta.value)));
onBeforeUnmount(() => editor && editor.destroy());
</script>
<template><textarea ref="ta" name="body" /></template>
```
In Next.js add `"use client"` and use the same `useEffect` pattern. (These are standard patterns; the automated tests run against the built files in Chromium, not inside React or Vue.)

## How it compares

I looked at how other editors are built to decide what to include and what to leave out. Check each project's own documentation for their current details.

| Project | Approach | Where `tk-editor` differs |
|---|---|---|
| TinyMCE, CKEditor 5 | Full-featured platforms with large plugin ecosystems and (optional, often commercial) collaboration | Far smaller, a drop-in textarea enhancer with no plugin ecosystem and no collaboration |
| TipTap / ProseMirror | A schema-based document model; very flexible, you assemble the editor from extensions | Edits the real DOM and exports HTML directly, so there is no schema to learn; far fewer extension points |
| Quill, Lexical, Trix | Their own document models (deltas, node trees, attachments) converted to HTML | The HTML *is* the model, which keeps `<picture>`, `<pre>`, containers and custom attributes exact |
| Summernote, Pell | Older / minimal editors; Pell and many older ones rely on the deprecated `execCommand` | No `execCommand`; own range-based engine with undo that restores the caret |

What `tk-editor` focuses on: a dependency-free drop-in for textareas, authoring of `<picture>` with validated media queries,
RTL-first behavior, strict CSP / Trusted Types compatibility, and an allow-list sanitizer built in.

What it does **not** have: real-time collaboration, comments / track changes, mentions, a slash menu, image captions
(`<figure>`), table cell merging, Markdown import / export, a plugin marketplace. Mobile browsers other than Chromium-based ones
and Firefox / Safari are untested (see below).

## Browser support and testing

The automated tests (263 checks) run in **Chromium** against the built `dist/` files: sanitizer attacks, typing and keyboard behavior,
selection edge cases, paste, forms and validation, media dialogs, SSR / ESM / CJS, strict CSP with Trusted Types (including a negative control), and performance.
**Firefox and Safari have not been tested.** The editor relies on `<dialog>`, `adoptedStyleSheets`, `ResizeObserver` and the Selection / Range APIs.

## Development

```bash
npm install
npm run build      # dist/: ESM (.mjs), CJS, UMD, minified UMD, CSS
npm test           # builds, then runs everything in a real browser (needs Playwright's Chromium)
npm pack           # create the tarball
npm publish        # check the package name first; use --access public for a scope
```

Source files live in `src/`: `core` (class, DOM, history, API), `engine` (selection, Enter, paste, smart insertion, keyboard escapes),
`dialog`, `text`, `list`, `table`, `section` (containers), `media`, `attach` (textarea integration), `i18n`, `utils` (sanitizer), `icons`.
Each module extends `ProEditor.prototype`, so you can drop one out of the build and only its own buttons stop working.

## License

MIT
