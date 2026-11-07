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
