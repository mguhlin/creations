# DrawSplat

DrawSplat is a self-contained interactive whiteboard for K-16 educators and students. It runs as a static website, works in the browser, and can optionally save boards, templates, collaboration rooms, and turn-ins to Google Drive and Google Sheets.

## Included files

- `index.html` — English version
- `index-sp.html` — Spanish version
- `index-vn.html` — Vietnamese version
- `index-ab.html` — Arabic version
- `index-cn.html` — Chinese version
- `index.uh.html` — Urdu / Hindi version
- `apps-script/Code.gs` — optional Google Apps Script backend for Drive + Sheets saving, cloud sync, templates, and student turn-ins

## Core features

- Fast icon-tool switching
  - Icon clicks now use direct event delegation so clicking on the icon or label switches tools immediately.
- Simple / Advanced interface modes
  - **Simple** focuses on core classroom tools: select, pen, line, arrow, rectangle, ellipse, text, Post-it notes, image upload, duplicate, basic styling, panels, and save/load.
  - **Advanced** reveals the full toolkit: connectors, additional shapes, comments, audio notes, stickers, templates, fill patterns, restore points, collaboration, assignment mode, answer keys, moderation, and advanced arrangement tools.
- Direct shape text editing
  - Click a text-capable shape and start typing, or double-click rectangles, circles/ellipses, diamonds, triangles, callouts, speech bubbles, text boxes, notes, comments, or audio-note labels to edit text directly on the canvas.
  - The inline editor appears directly over the selected shape. Type on the canvas, choose **Done** when finished, use **Ctrl/Cmd + Enter** to close, or **Escape** to cancel.
- Multiple panels/pages for stations, lesson steps, group work, and collaborative activities
- Pen, line, arrow, connector, rectangle, ellipse, diamond, triangle, callout, speech bubble, text, Post-it, comment pin, and audio note tools
- Type inside shapes with wrapped text, alignment controls, rotation, auto-scaling, and double-click inline editing
- Load images, drag them, resize them, and include them on any panel
- Post-its with optional image attachments
- Adjustable line color, fill color, fill patterns, opacity, and line thickness
- Background choices: blank, grid, dots, graph, ruled, and isometric
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

Current build: **DrawSplat v2.4 — Productivity Workspace Build**

## Version 2.2 panel hotfix

This hotfix strengthens panel behavior for both new boards and boards restored from older browser autosaves.

Updated panel behavior:

- Every panel is guaranteed to have a stable internal panel ID during migration.
- Older autosaved boards with missing panel IDs are automatically repaired on load.
- The top `+` tab for adding a panel uses delegated tab-click handling instead of a fragile direct handler.
- Panel tabs support both `data-panel-id` and a fallback `data-panel-index`.
- Clicking Panel 1 after creating or switching to another panel should now work reliably.

Current build: **DrawSplat v2.4 — Productivity Workspace Build**

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

Current build: **DrawSplat v2.4 — Productivity Workspace Build**


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
