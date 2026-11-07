export type MediaType = "image" | "video" | "audio";
export interface FileManagerContext {
  /** main = the file itself, source = a picture/video/audio source, poster = video poster, track = subtitles */
  purpose: "main" | "source" | "poster" | "track";
}
export interface FileManagerResult {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export type ToolbarPreset = "full" | "standard" | "minimal";
/** Toolbar item ids (plus any id registered with ProEditor.registerButton) */
export type ToolbarItem =
  | "block" | "bold" | "italic" | "underline" | "strike" | "mark" | "more" | "sub" | "sup" | "code" | "quote" | "clearFormat"
  | "blockquote" | "link" | "unlink" | "ul" | "ol" | "marker" | "align" | "dir" | "color" | "attr"
  | "table" | "section" | "hr" | "br" | "image" | "picture" | "video" | "audio" | "undo" | "redo" | "fullscreen" | "source"
  | (string & {});

export interface ProEditorOptions {
  /** Editor direction. Default: follows the page (<html dir>), falling back to "ltr". */
  dir?: "rtl" | "ltr" | null;
  lang?: string | null;
  /** Language of the UI. "en" is built in; add others with ProEditor.registerLocale(). */
  locale?: string;
  /** Per-instance UI string overrides (see the keys in the README). */
  messages?: Record<string, string> | null;
  minHeight?: number;
  /** 0 = grow with content; a number = scroll inside after this height */
  maxHeight?: number;
  placeholder?: string | null;
  initialHTML?: string | null;
  theme?: "auto" | "light" | "dark";
  /** A preset name, or groups of item ids: [["bold","italic"],["link"]] */
  toolbar?: ToolbarPreset | ToolbarItem[][] | ToolbarItem[];
  statusbar?: boolean;
  readOnly?: boolean;
  /** Hide buttons by command name, e.g. ["audio", "section"] */
  hide?: string[];
  /**
   * "smart" (default): a lone <img>/<video>/<br> never gets a pointless <p>; text always does.
   * "always": every loose line is wrapped in <p>.
   */
  paragraphs?: "smart" | "always";
  /** "## " "- " "1. " "> " "```" "---" shortcuts. Default true. */
  markdown?: boolean;
  /** Pasting a URL over selected text links it. Default true. */
  autoLink?: boolean;
  /** A textarea/input kept in sync with the HTML */
  syncTo?: string | HTMLTextAreaElement | HTMLInputElement | null;
  changeDelay?: number;
  /** Extra sanitizer tags / attributes */
  allowedTags?: string[];
  allowedAttrs?: string[];
  /** false drops every data-* attribute. Default true. */
  allowData?: boolean;
  /** Drop ids such as "location" / "document" that would shadow page globals. Default true. */
  clobberProtection?: boolean;
  /** CSP nonce for the (rare) <style> fallback */
  nonce?: string | null;
  onChange?: ((html: string) => void) | null;
  onReady?: ((editor: ProEditor) => void) | null;
  /** Media manager hook */
  fileManager?: ((type: MediaType, ctx: FileManagerContext) => Promise<FileManagerResult | null>) | null;
  /** Direct upload (upload button, drag & drop and paste of files) */
  upload?: ((file: File, type: MediaType) => Promise<{ url: string; alt?: string; width?: number; height?: number }>) | null;
}

export type AttachOptions = ProEditorOptions | ((textarea: HTMLTextAreaElement) => ProEditorOptions);
export type AttachTarget = string | Element | ArrayLike<Element>;

export interface Observation {
  disconnect(): void;
  editors(): ProEditor[];
}

export interface ButtonDefinition {
  /** Inline SVG markup (trusted) */
  icon?: string;
  title?: string;
  onClick(editor: ProEditor): void;
  /** Return true to show the button as pressed */
  isActive?(editor: ProEditor): boolean;
}

export default class ProEditor {
  constructor(target: string | Element, options?: ProEditorOptions);
  static readonly version: string;
  static readonly TOOLBARS: Record<ToolbarPreset, string[][]>;
  static readonly CONTAINER_TAGS: string[];

  /** Turn textarea(s) into editors. The textarea keeps its name and always holds sanitized HTML. */
  static attach(target: AttachTarget, options?: AttachOptions): ProEditor[];
  static get(textarea: Element | null): ProEditor | null;
  /** Restore the textarea (its value becomes the current HTML) */
  static detach(target: AttachTarget): void;
  /** Like attach, but also enhances textareas added later and releases editors of removed ones */
  static observe(selector: string, options?: AttachOptions): Observation;
  /** observe('textarea[data-pro-editor]') once the DOM is ready. Global options: window.PRO_EDITOR_OPTIONS */
  static autoInit(options?: ProEditorOptions): void;
  /** Register a UI language: ProEditor.registerLocale("xx", { bold: "..." }) */
  static registerLocale(name: string, messages: Record<string, string>): void;
  /** Register a custom toolbar button, then use its id in the `toolbar` option */
  static registerButton(id: string, def: ButtonDefinition): void;
  /** Allow-list sanitizer (client-side defense layer; sanitize on the server too) */
  static sanitize(html: string, options?: { paste?: boolean; noData?: boolean; clobber?: boolean; extraTags?: string[]; extraAttrs?: string[] }): string;

  readonly ready: Promise<ProEditor>;
  readonly root: HTMLElement;
  readonly iframe: HTMLIFrameElement;
  readonly body: HTMLElement | undefined;
  readonly doc: Document | undefined;
  readonly options: ProEditorOptions;
  readOnly: boolean;

  getHTML(): string;
  setHTML(html: string): void;
  getText(): string;
  isEmpty(): boolean;
  focus(): void;
  /** Update the linked textarea right now (no-op when nothing changed) */
  sync(force?: boolean): void;
  /** Run any toolbar command from code, e.g. editor.command("bold") */
  command(name: string): void;
  setReadOnly(flag: boolean): void;
  setTheme(theme: "auto" | "light" | "dark"): void;
  setPreviewWidth(px: number | null): void;
  toggleFullscreen(force?: boolean): void;
  /** Change the container element around the caret: section | nav | header | footer | main | article | aside | div */
  setContainerTag(tag: string): void;
  undo(): void;
  redo(): void;
  destroy(): void;
  /** Translate a UI message */
  t(key: string, vars?: Record<string, string | number>): string;

  on(event: "change", fn: (html: string) => void): () => void;
  on(event: "ready" | "destroy" | "focus" | "blur", fn: (editor: ProEditor) => void): () => void;
  off(event: string, fn: (...args: any[]) => void): void;
}
export { ProEditor };
export declare const attach: typeof ProEditor.attach;
export declare const detach: typeof ProEditor.detach;
export declare const get: typeof ProEditor.get;
export declare const observe: typeof ProEditor.observe;
export declare const autoInit: typeof ProEditor.autoInit;
export declare const version: string;
