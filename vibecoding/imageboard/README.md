# ImageBoard

ImageBoard is a self-contained browser whiteboard for K-16 educators and students. It is inspired by a lot of the programs I've used as an educator over the years.These ideas are vibe-coded into a standalone HTML/CSS/JavaScript site.

## What is included

- `index.html` — the complete ImageBoard app; host it anywhere static HTML works.
- `apps-script/Code.gs` — optional Google Apps Script backend for saving board JSON and PNG previews to Google Drive and logging metadata to Google Sheets.

## Features

- Multiple panels/pages for stations, groups, topics, or lessons
- Pen, line, arrow, connector, rectangle, ellipse, diamond, triangle, callout, speech bubble, text, and Post-it tools
- Image upload with drag and resize
- Adjustable stroke color, fill color, opacity, and line thickness
- Rich text editing with bold, italic, and bullet lists
- Type inside shapes with wrapped text, horizontal/vertical alignment, and text rotation
- Automatic text scaling when text-enabled objects are resized
- Background patterns: blank, grid, dots, graph, ruled, and isometric
- Multi-select with Shift+click plus marquee drag-select on the canvas
- Undo and redo
- Connector lines that stay attached to connected shapes
- Copy/paste keyboard shortcuts (Ctrl/Cmd+C and Ctrl/Cmd+V)
- Group and ungroup selected items
- Teacher mode and student mode interface options
- Local real-time collaboration across open tabs/windows using BroadcastChannel room sync
- Cloud collaboration across different devices using the included Google Apps Script backend and room polling
- Built-in classroom template library: Frayer Model, KWL chart, T-chart, storyboard, Venn diagram, brainstorm board, and timeline
- Object selection, dragging, resizing, locking, duplicate, front/back ordering, and deletion
- PNG export
- Local `.imageboard.json` save/load
- Optional Google Drive + Sheets save/load through Apps Script

## Local use

Open `index.html` in a browser. The app autosaves to the browser’s local storage.

## Hosting

Upload `index.html` to GitHub Pages, Google Sites embed, a district web server, or any static hosting service.

## Google Drive + Sheets setup

1. Create a Google Sheet named `ImageBoard Saves`.
2. Open `Extensions > Apps Script`.
3. Paste the code from `apps-script/Code.gs`.
4. Deploy as a Web App.
5. Set “Execute as” to yourself.
6. Set access according to your classroom or district needs.
7. Copy the Web App URL.
8. Paste it into ImageBoard’s `Script URL` field.
9. Select `Save to Google`.

The script creates a Drive folder named `ImageBoard Saves`, stores each board in a subfolder, saves `board.imageboard.json`, saves `board-preview.png`, and logs metadata in the Sheet. It also creates an `ImageBoard Rooms` area for cloud collaboration room states.

## Notes for districts

- For student use, review sharing permissions and Apps Script deployment policies.
- Very large embedded images can make board JSON large. Resize images before uploading when possible.
- The Google save endpoint should be deployed only to trusted users if student work is involved.

## Collaboration note

ImageBoard now supports two collaboration modes:

1. **Local sync** — Uses the browser's `BroadcastChannel` API, so it works across open tabs/windows of the same hosted ImageBoard site when they join the same room name. This does not require a separate collaboration server.
2. **Cloud sync** — Uses the included Google Apps Script backend so different devices can share a board state by room name. The current implementation uses lightweight polling and last-write-wins syncing, which keeps setup simple for school environments.

## Helpful shortcuts

- `Shift + click` — multi-select
- `Drag on blank canvas` — marquee select
- `Ctrl/Cmd + C` — copy selection
- `Ctrl/Cmd + V` — paste selection
- `Ctrl/Cmd + G` — group selection
- `Ctrl/Cmd + Shift + G` — ungroup selection
- `Ctrl/Cmd + D` — duplicate
- `Ctrl/Cmd + Z` — undo
- `Ctrl/Cmd + Shift + Z` — redo
