# DrawSplat

DrawSplat is a self-contained interactive whiteboard for K-16 educators and students. It runs as a static website, works in the browser, and can optionally save boards, templates, collaboration rooms, and turn-ins to Google Drive and Google Sheets.

## Included files

- `index.html` — English entry page
- `index-sp.html` — Spanish entry page
- `index-vn.html` — Vietnamese entry page
- `index-ab.html` — Arabic entry page (RTL)
- `index-cn.html` — Chinese entry page
- `index.uh.html` — Urdu / Hindi entry page
- `app.css` — shared stylesheet (extracted in v2.5)
- `app.js` — shared application code (extracted in v2.5)
- `i18n.js` — runtime translation applicator (new in v2.5)
- `locales.js` — single source of truth for every UI translation (new in v2.5)
- `sw.js` — service worker for offline shell (new in v2.5)
- `apps-script/Code.gs` — optional Google Apps Script backend for Drive + Sheets saving, cloud sync, templates, and student turn-ins

## Core features

- Fast icon-tool switching
  - Icon clicks now use direct event delegation so clicking on the icon or label switches tools immediately.
- Simple / Advanced interface modes
  - **Simple** focuses on core classroom tools: select, pen, line, arrow, rectangle, ellipse, text, sticky notes, image upload, duplicate, basic styling, panels, and save/load.
  - **Advanced** reveals the full toolkit: connectors, additional shapes, comments, audio notes, stickers, templates, fill patterns, restore points, collaboration, assignment mode, answer keys, moderation, and advanced arrangement tools.
- Direct shape text editing
  - Click a text-capable shape and start typing, or double-click rectangles, circles/ellipses, diamonds, triangles, callouts, speech bubbles, text boxes, notes, comments, or audio-note labels to edit text directly on the canvas.
  - The inline editor appears directly over the selected shape. Type on the canvas, choose **Done** when finished, use **Ctrl/Cmd + Enter** to close, or **Escape** to cancel.
- Multiple panels/pages for stations, lesson steps, group work, and collaborative activities
- Pen, line, arrow, connector, rectangle, ellipse, diamond, triangle, callout, speech bubble, text, sticky note, comment pin, and audio note tools
- Type inside shapes with wrapped text, alignment controls, rotation, auto-scaling, and double-click inline editing
- Load images, drag them, resize them, and include them on any panel
- sticky notes with optional image attachments
- Adjustable line color, fill color, fill patterns, opacity, and line thickness
- Background choices: blank, grid, dots, graph, ruled, and isometric
- Locked per-panel background images (Jamboard-style) — teacher loads a reference image, students see and work on top of it without being able to alter or remove it
- Multi-select, marquee select, copy/paste, duplicate, group, ungroup, and bring-front/send-back tools
- Custom sticker / stamp tools, including teacher-uploaded image stickers
- Built-in classroom templates: Frayer Model, KWL, T-chart, storyboard, Venn diagram, brainstorm board, and timeline
- Template insertion with grouped objects for easier moving and resizing
- Teacher mode and student mode
- Assignment mode with protected teacher layer and editable student layer
- Answer key tagging and show/hide toggle
- Audio notes with upload, record, and playback
- Local collaboration across browser tabs/windows using `BroadcastChannel`
- Live local collaborator cursors
- Cloud collaboration through the optional Google Apps Script backend
- Comment moderation dashboard
- Student turn-ins saved through Google Drive + Sheets
- Restore points / checkpoints
- PNG export and PDF export
- Local `.drawsplat.json` save/load
- Playful TNT reset effect to clear the current panel and start over

## Local use

Open any of the `index*.html` files in a modern browser. The app autosaves to local browser storage.

## Hosting

You can host DrawSplat on:

- GitHub Pages
- a district or campus web server
- a static website host
- any simple file server that serves HTML, CSS, and JavaScript

## Google Drive + Sheets setup

1. Create a Google Sheet named **DrawSplat Saves**.
2. Open **Extensions → Apps Script**.
3. Paste in the code from `apps-script/Code.gs`.
4. Deploy it as a **Web app**.
5. Set **Execute as** to yourself.
6. Set access according to your classroom or district needs.
7. Copy the Web App URL.
8. Paste the URL into the **Script URL** field inside DrawSplat.

The Apps Script backend can store:

- saved boards
- board preview images
- collaboration room states
- shared templates
- student turn-ins

It also logs metadata in Google Sheets tabs for boards, rooms, templates, and turn-ins.

## Collaboration modes

### 1. Local sync
Uses the browser `BroadcastChannel` API. This works across open tabs or windows on the same host when they join the same room.

### 2. Cloud sync
Uses the optional Apps Script backend so different devices can share the same room state through Google Drive + Sheets.

## Student turn-ins

Students can enter their name and submit a board. Teachers can review turn-ins from within the app when the Apps Script backend is configured.

## Helpful shortcuts

- `Shift + click` — multi-select
- `Drag on blank canvas` — marquee select
- `Ctrl/Cmd + C` — copy selection
- `Ctrl/Cmd + V` — paste selection
- `Ctrl/Cmd + D` — duplicate selection
- `Ctrl/Cmd + G` — group selection
- `Ctrl/Cmd + Shift + G` — ungroup selection
- `Ctrl/Cmd + Z` — undo
- `Ctrl/Cmd + Shift + Z` — redo
- `Double-click a shape` — edit text directly inside the object
- `Ctrl/Cmd + Enter` — apply inline text edits
- `Escape` — cancel inline text edits

## Notes for schools and districts

- Review Apps Script deployment permissions before enabling student saving or turn-ins.
- Large embedded images create larger board files. Resize images when possible.
- Cloud sync uses a lightweight polling approach with last-write-wins behavior.
- Assignment mode is designed for teacher-created prompts with student work completed on a separate layer.
- The TNT reset asks for confirmation before clearing the current panel.

## Language entry pages

DrawSplat includes multiple entry pages so schools can share the interface in different languages:

- `index.html` — English
- `index-sp.html` — Spanish
- `index-vn.html` — Vietnamese
- `index-ab.html` — Arabic
- `index-cn.html` — Chinese
- `index.uh.html` — Urdu / Hindi

## Version notes for this build

This build includes:

- text-inside-shape support
- grouped template insertion
- zoom display fix
- audio notes
- answer key support
- fill patterns
- live local cursors
- custom image stickers
- multilingual entry pages
- Simple / Advanced interface toggle
- double-click inline shape text editing
- icon-first toolbars with hover/focus tooltips
- accessible icon buttons with `aria-label`, `title`, and keyboard-focus tooltip support

## Icon-first interface

This build reduces word-heavy controls by converting the most common toolbar buttons into self-explanatory icons. Hovering over an icon, focusing it with the keyboard, or using a screen reader still exposes the full action name.

The icon pass is applied to:

- drawing tools
- shape tools
- undo / redo
- image load
- duplicate
- arrange tools
- panel tools
- export tools
- common selected-object actions
- zoom controls

Less obvious teacher/admin actions can still show icon + text where clarity matters.

## Panel switching fix

This build updates panel navigation so tabs switch by each panel's stable panel ID rather than by array position. This prevents the issue where adding a new panel and switching to it could make it difficult or impossible to return to Panel 1.

Related behavior:

- panel tab clicks use `data-panel-id`
- `switchPanel(panelId)` finds the correct panel by ID
- inline text edits are committed before switching panels
- selection, connector state, marquee selection, drawing state, and drag state are cleared on panel switch
- deleting a panel safely reassigns the active panel

## Version

Current build: **DrawSplat v2.9 — Mermaid Diagrams**

## License

DrawSplat is licensed under **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**. See the `LICENSE` file for the full text.

You are free to **use, adapt, and share** the application — for classroom use, professional development, district deployment, or building a derivative project — under two conditions:

1. **Attribution** — credit the original author (Miguel Guhlin) and link to the license.
2. **ShareAlike** — if you remix or build on DrawSplat, your version must be released under the same CC BY-SA 4.0 license.

Suggested attribution line:

> *"DrawSplat by Miguel Guhlin (https://mguhlin.org), licensed under CC BY-SA 4.0. Modifications: \<describe your changes\>."*

Boards, drawings, and student work created by users belong to their respective authors and are not covered by this license.

## Version 2.9 changes

v2.9 adds [Mermaid](https://mermaid.js.org/) diagram support — flowcharts, sequence diagrams, ER, gantt, mind maps, and the rest of the Mermaid syntax — rendered locally inside DrawSplat.

How it works
- A new **Mermaid Diagram** button appears in the **Insert / Arrange** sidebar section in **Advanced view** (`data-ui="advanced"`, hidden in Simple). Click it to open a side-by-side editor: textarea on the left for Mermaid source, live SVG preview on the right.
- Edits are debounced and re-rendered every ~300 ms so you can iterate quickly. Bad syntax shows the Mermaid error inline in red instead of crashing the dialog.
- **Insert** rasterizes the rendered SVG to a `data:image/svg+xml;base64,...` URL and adds it to the canvas as a regular `image` object — so it's resizable, draggable, group-able, croppable, deletable, and exportable like any other image.
- The **original Mermaid source is stored** on the object as `mermaidSource`. Double-click any inserted diagram to reopen the editor with that source pre-filled, edit, and Insert again — the existing object is updated in place (no duplicate).
- Re-edits respect the existing object position/size and clear any prior crop so the new render fills the box.
- Each render gets the natural width/height of the SVG probed and stored, so the existing v2.8 crop tool also works on Mermaid diagrams.

Setup (one-time)
- DrawSplat does not bundle Mermaid because the library is sizeable (~2.5 MB). Download `mermaid.min.js` (the standalone build) from npm or a release archive, place it at the project root next to `app.js`, and reload.
- The HTML files load it via `<script src="mermaid.min.js" defer onerror="window.__mermaidMissing=true">`. If it's missing, the dialog still opens but the preview shows: *"Mermaid library not loaded. Drop mermaid.min.js into the project root and reload — see README."*
- The service worker `SHELL` list includes a commented-out reference to `./mermaid.min.js`. Once you've added the file, uncomment that line so it pre-caches for offline use.
- Mermaid is initialized lazily with `securityLevel: 'strict'` (no inline JavaScript in diagrams) and `startOnLoad: false` (DrawSplat controls when rendering happens).

Compatibility
- Existing image objects without `mermaidSource` are unaffected — they double-click to nothing, just like before.
- Boards from v2.8 open identically; no data migration.
- The CSP is unchanged: `script-src 'self'` covers a locally-hosted `mermaid.min.js`. Mermaid uses inline styles which are already permitted via `style-src 'self' 'unsafe-inline'`.
- Service-worker cache key bumped to `drawsplat-v2.9.0` for the initial release.

### v2.9.1 follow-ups

- **Copy PNG button** added to the Mermaid dialog footer. One click rasterizes the rendered SVG to PNG via canvas and writes it to the system clipboard via `ClipboardItem`. Paste the result into Slides, Word, email, chat — anywhere that accepts a PNG. No need to insert the diagram first.
- **Auto-rasterize on copy** — when you Ctrl/Cmd+C with a single image object selected and its `src` is an SVG data URL (Mermaid output, or any other SVG), DrawSplat now automatically converts it to PNG before writing to the clipboard. Most consumer apps reject SVG paste; this makes paste "just work" while leaving the original SVG intact on the canvas (no quality loss for the displayed/saved version). Non-SVG images (JPEG/PNG/WebP) still copy as their original blob — no re-encoding.
- Service-worker cache bumped to `drawsplat-v2.9.1`.

Note on diagrams.net / drawio import-export
- Considered but not added: the drawio editor and mxGraph engine are far too large to ship inside DrawSplat, and writing a partial XML converter would be lossy. The clipboard paste flow already lets users design diagrams externally and paste a PNG/SVG export onto the board, which is the intended workflow for that use case.

## Version 2.8 changes

v2.8 is an image-editing release. Boards from v2.6 / v2.7 open identically; nothing on disk changes.

Image cropping (lossless)
- New **Crop Image** button (✂️) appears in the floating selection toolbar whenever a single image object is selected.
- Opens a styled dialog with four sliders (Top / Right / Bottom / Left) and a live canvas preview of the result.
- The crop is **lossless**: the original image data stays untouched in the object's `src`. The crop is stored as four fractional bounds (`crop.x / .y / .w / .h`) and applied at render time via SVG `<svg viewBox=...>` with `preserveAspectRatio="xMidYMid meet"`. You can re-open the dialog any time to widen the crop, or reset back to the full image.
- Each image has its natural width/height probed and cached on first display so crop math doesn't depend on guessing aspect ratio.
- Goes through `saveState()` so Ctrl/Cmd+Z reverts.

Clipboard interop
- **Paste image from system clipboard** — Ctrl/Cmd+V (or right-click → Paste) pastes whatever image is on the device clipboard onto the canvas: copy from a webpage, screenshot, file manager, Photos / Visual Look Up "Copy Subject", etc. Validates the blob (size + magic bytes) before adding. Falls back to the internal clipboard when no system image is available.
- **Copy image to system clipboard** — Ctrl/Cmd+C with a single image object selected writes its blob to the device clipboard via `ClipboardItem`, so you can paste straight into Slides, Word, email, etc. Internal copy still happens too for in-app paste.
- All paste flows skip when focus is in a text input / textarea / contenteditable so normal text paste isn't disrupted.

Image color removal upgrades
- **Remove BG Color** is now context-aware: if a single image object is selected, it processes that image; otherwise it processes the panel background.
- The dialog title and helper text adapt ("Remove Color from Image" vs "Remove Background Color").
- Replaced the previous hidden `<input type="color">` + click-trigger pattern (which silently failed when the user accepted the pre-sampled corner color, because the `change` event only fires on actual change) with an explicit dialog (color preview + tolerance slider + Apply / Cancel).
- Tolerance slider (0–100, default 40) lets you dial in how aggressive the matching is.

Eraser polish
- Cursor switches to a **crosshair** the moment any drawing tool (Eraser, Laser, Pen, shapes) becomes active so it's clear you're "in" that mode.
- Status hint appears on tool selection: *"Eraser: click any object to delete it. Drag over pen strokes to wipe them."*
- Click on object → erased, status confirms. Click on locked object → "That item is locked." Click on empty canvas → "Click an object to erase it." (No more silent misses.)
- **Drag over pen strokes to wipe them** Jamboard-style. Drag-erase is limited to free-hand path strokes so you don't accidentally lose stickies/shapes/text mid-drag.

Migration notes
- No board-data migration. v2.7 boards open verbatim; image objects without `crop` stay uncropped, and the natural-dimension probe runs on first render.
- Service-worker cache key bumped to `drawsplat-v2.8.0`.

## Version 2.7 changes

v2.7 is a polish-and-brand release built on top of v2.6.

Brand & visual identity
- **New logo** (purple slime splat) appears in the top-left of the header, in the Welcome dialog, in About, and in Options.
- **Color scheme refreshed** to match the logo: deep purple (`#7c3aed`) replaces navy as the primary brand color; the header now uses a purple gradient. Gold accents are kept where they provide best contrast (Save to Google primary button).
- Service-worker pre-caches the logo so it's served instantly offline.

Polish & UX
- **Save state indicator chip** in the header (`Saved` / `Saving…` / `Saved 30s ago`) — continuous reassurance instead of disappearing toasts.
- **Floating selection toolbar** appears at the top of the canvas when an object is selected (Edit / Duplicate / Delete) on phones, tablets, and Simple mode — solves the "hard to delete on responsive" pain.
- **Contextual color chip** in the Simple-mode bottom toolbar — change pen / sticky / shape color without leaving Simple.
- **First-run welcome dialog** with four orientation tips and a one-time-dismiss flag.
- **Styled `confirmDialog`** replaces native `confirm()` calls (Clear Frame, Clear Panel, Restore Point, TNT) and the lone `alert()` for design consistency.

Header & layout
- Save to Google, Export PNG, Export PDF, and TNT moved out of the header and into the **⋮ More Options** menu — header is dramatically less cluttered.
- The **⋮ More Options** menu is now visible in both Simple and Advanced views.
- Frame counter shows the **panel name** along with the position (e.g., `Bell Ringer · 1/3`).
- Status messages now appear as a **toast at the top of the canvas** with `aria-live="polite"`.

Mobile & responsive fixes
- Phone breakpoint (≤760 px): header stays on a single row with horizontal scroll instead of wrapping; sidebar in Simple mode becomes a horizontal bottom toolbar; canvas takes the bulk of the viewport.
- The K-16 badge hides on phones to save space.
- The `[hidden]` HTML attribute now wins over `display: inline-flex` from the icon-button class so genuinely-hidden buttons stay hidden.

Attribution
- About dialog credit changed from "Created by" to **"Vibe-coded by Miguel Guhlin"**.
- New **License** paragraph in the About dialog with a link to CC BY-SA 4.0.

Migration notes
- No board-data migration required — v2.6 boards open identically.
- Service-worker cache key bumped to `drawsplat-v2.7.0` for the initial release; subsequent point releases (2.7.1, 2.7.2, …) increment the cache key the same way.

### v2.7.1 follow-ups

- **Remove BG Color** — new tool (🪄) lets a teacher knock out a solid background color from a loaded panel background image. The app samples the top-left pixel as a starting point and opens a color picker so the teacher can fine-tune which color to drop. Pixels within tolerance become transparent and the result is re-encoded as PNG (preserving alpha). Useful for turning a JPG-style classroom poster into a transparent overlay on top of the board's grid/dots/lines pattern. Available in the Simple-mode toolbar and in Advanced's Patterns section. The action goes through `saveState()` so it's undoable.
- **Bottom toolbar stacking fix** — the Simple-mode bottom block (color chip, Add Image, Set Background, Clear Background, Remove BG Color, Delete Selected, TNT) was rendering side-by-side because `.simple-only` had `display: inline-flex` overriding `.grid`. Added a more specific rule so the block now stacks vertically, matching the rest of the toolbar.

## Version 2.6 changes

v2.6 is a classroom-UX pass. Existing v2.5 boards open without conversion; the migration shim updates `board.version` to `2.6` automatically.

Layout & navigation
- Header version badge — `DrawSplat v2.6` is shown in the title bar so teachers can see at a glance which build is running.
- Panels controls (current panel, add, rename, delete, clear) moved from the sidebar into the top header.
- Workspace and View selectors moved into a new **Options** dialog opened from the header.
- New **About** dialog with creator info and links.
- Inspector becomes a slide-in drawer below 1180 px; a header **Inspector** button opens it. Backdrop click and `Esc` close it.
- Patterns / Templates / Restore Points sidebar sections are now collapsible to reclaim vertical space.

Inspector
- Per-object actions are grouped into collapsible **Audio actions / Sticky actions / Comment actions** blocks that auto-expand when the matching tool is active or that object type is selected, and collapse otherwise.
- Universal actions (Lock, Unlock, Delete, Select Group, Toggle Answer Key) stay visible.

Locked panel backgrounds
- Teachers can load an image as a per-panel background from the Patterns section.
- The image is downscaled client-side (≤1600 px, JPEG 0.85) so it doesn't blow up storage or sync payloads.
- Students see the background through the existing local/cloud sync but have no UI to change it; the background is a panel attribute, not an object on any layer, so it can't be selected, moved, or deleted.

Bug fixes
- Title and other text inputs no longer reset the cursor to the start of the line when a render fires during typing.
- Newly created sticky / comment / audio / text objects start with truly empty content; the visible "Add note…", "Voice note", and similar hints are now CSS placeholders, not real data baked into the object.
- Existing boards are migrated: legacy placeholder strings stored as content are cleared on load.

Internationalization
- The DOM walker in `i18n.js` now also translates `aria-label`, `title`, and `data-tooltip` attributes, so iconized buttons (Options, About, Inspector, etc.) and their tooltips localize correctly.
- Long instruction paragraphs (Tools, Collaboration, Workspace, Simple/Advanced, Setup, Inline editor, Classroom Uses, Student/Assignment/Answer Key/Moderation/Turn-In hints) are now translated across all five non-English locales.
- Locales for Vietnamese, Arabic, Chinese, and Hindi/Urdu were back-filled with the previously English-only inspector strings (alignment, audio actions, layer names, sync controls, save/load, etc.).
- New `Options`, `About`, `Inspector`, `Audio actions`, `Sticky actions`, `Comment actions`, `Google integration`, `Load Background`, and `Clear Background` keys translated for all five locales.

Migration notes
- `panel.bgImage` is added during board load; existing panels get an empty default.
- Service worker cache key bumped to `drawsplat-v2.6.0`. Returning users get fresh assets automatically.

## Version 2.5 changes

v2.5 is a consolidation and hardening release. The six per-language HTML files no longer each carry their own copy of the application — they share `app.css`, `app.js`, `locales.js`, and `i18n.js`. This cuts the on-disk footprint from ~700 KB across the six entry pages to ~155 KB total.

Architecture
- **Single source for code.** All application behaviour lives in `app.js`. All styling lives in `app.css`. Every entry page is a thin shell (~17 KB) that loads them.
- **Single source for translations.** `locales.js` holds every UI string for every language. To add a language, add an entry there and a corresponding entry HTML.
- **Service worker.** `sw.js` is registered automatically when served over HTTP/HTTPS. The app shell is cached so the whiteboard works offline after the first load.
- **IndexedDB autosave fallback.** If `localStorage` runs out of room, autosave transparently falls back to IndexedDB so image-heavy boards don't lose work.

Performance
- Object lookup is now O(1) via a per-render `Map<id, object>`. Earlier versions did a linear scan of every object on every pointer event.
- `render()` is coalesced through `requestAnimationFrame`. Pointermove during a drag, marquee, or pen stroke no longer triggers a synchronous redraw per event.
- Undo history is capped at 50 snapshots and only grows on commit boundaries (drag end, edit commit) instead of per micro-change.
- Live cursor broadcasts are throttled to ~20 Hz.

Security
- Strict `Content-Security-Policy` meta tag in every entry page (`script-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, etc.). No inline scripts remain.
- Image uploads are sniffed by magic bytes after the MIME header check, so a renamed file cannot bypass the whitelist.
- Rich-text editor output is now passed through a tag-allowlist scrubber that strips `on*` attributes, `style`, `href`, `src`, `<script>`, and `<style>`.
- The Apps Script backend uses `LockService` on every write path, hard-caps incoming payload size, validates board JSON and PNG sizes, and applies a soft per-instance rate limit via `CacheService`.

Accessibility & UX
- Visible `:focus-visible` ring on every focusable element.
- Touch targets are now at least 44×44 px on toolbar/icon buttons.
- All form controls have an `aria-label` (auto-derived from their visible label when not set explicitly).
- New keyboard shortcut: press `?` to open the shortcuts help dialog. The header has a dedicated keyboard-shortcuts button as well.
- `prefers-reduced-motion` users get a static TNT effect and minimal transitions.

Migration notes
- Existing v2.4 autosaves load cleanly; the migration shim updates `board.version` to `2.5` automatically.
- The Apps Script web app must be re-deployed if you want the v2.5 backend hardening (lock, payload caps, rate limit). The wire format is unchanged.

## Version 2.2 panel hotfix

This hotfix strengthens panel behavior for both new boards and boards restored from older browser autosaves.

Updated panel behavior:

- Every panel is guaranteed to have a stable internal panel ID during migration.
- Older autosaved boards with missing panel IDs are automatically repaired on load.
- The top `+` tab for adding a panel uses delegated tab-click handling instead of a fragile direct handler.
- Panel tabs support both `data-panel-id` and a fallback `data-panel-index`.
- Clicking Panel 1 after creating or switching to another panel should now work reliably.

Current build: **DrawSplat v2.9 — Mermaid Diagrams**

## Version 2.3 productivity workspace update

This build adds a **Workspace** selector so DrawSplat can be used as a general-purpose visual productivity board without showing classroom-specific tools by default.

Workspace options:

- **Productivity** — default mode. Hides education-only controls and keeps DrawSplat focused on visual work, planning, brainstorming, diagrams, notes, panels, export, and save/load.
- **Education Tools** — reveals classroom features such as class/student fields, teacher/student mode, assignment mode, answer keys, moderation, student turn-ins, and classroom-use guidance.

The Workspace setting is separate from the existing **Simple / Advanced** interface setting. This gives four practical combinations:

- Productivity + Simple
- Productivity + Advanced
- Education Tools + Simple
- Education Tools + Advanced

Current build: **DrawSplat v2.9 — Mermaid Diagrams**


## Security and Internet-Facing Deployment Warning

DrawSplat can be hosted as a static web app, but a public internet-facing deployment should be treated as a user-generated-content application, not just a simple HTML page.

Before using DrawSplat on a public server, review these risks:

- **Do not store secrets in the front-end.** Public HTML, JavaScript, Apps Script URLs, and client-side settings can be viewed by users.
- **Rich text and imported board files can carry unsafe content.** DrawSplat includes basic cleanup, but public deployments should add stronger server-side validation and a strict Content Security Policy.
- **Uploads can be abused.** This build blocks SVG uploads, limits common image/audio types, and adds file-size checks, but public deployments should also enforce server-side limits.
- **Google Apps Script endpoints can be misused if deployed to “anyone.”** Use the narrowest permissions possible, keep Drive data in a dedicated folder, and do not expose administrative actions without additional protection.
- **Front-end hiding is not security.** Productivity/Education mode, Teacher/Student mode, and hidden buttons are convenience controls only. Anything sensitive must be enforced by the backend.
- **Avoid confidential student records.** Do not use public DrawSplat boards for protected student data unless your hosting, authentication, retention, and access controls have been reviewed.

Recommended public-hosting protections:

- Serve only over HTTPS.
- Add security headers, especially `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, and `frame-ancestors 'none'`.
- Keep uploads small and limited to safe file types.
- Use long, unguessable room or board IDs if cloud sharing is enabled.
- Review Apps Script permissions and logs regularly.
- Provide a way to clear local browser data on shared devices.
