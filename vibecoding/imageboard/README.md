# ImageBoard

ImageBoard is a self-contained browser whiteboard for K-16 educators and students. It is inspired by the attached Drawy project’s core ideas—canvas objects, shapes, image items, serialization, and export—but implemented as a standalone HTML/CSS/JavaScript site.

## What is included

- `index.html` — the complete ImageBoard app; host it anywhere static HTML works.
- `apps-script/Code.gs` — optional Google Apps Script backend for saving board JSON and PNG previews to Google Drive and logging metadata to Google Sheets.

## Features

- Multiple panels/pages for stations, groups, topics, or lessons
- Pen, line, arrow, rectangle, ellipse, diamond, triangle, text, and Post-it tools
- Image upload with drag and resize
- Adjustable stroke color, fill color, opacity, and line thickness
- Background patterns: blank, grid, dots, graph, ruled, and isometric
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

The script creates a Drive folder named `ImageBoard Saves`, stores each board in a subfolder, saves `board.imageboard.json`, saves `board-preview.png`, and logs metadata in the Sheet.

## Notes for districts

- For student use, review sharing permissions and Apps Script deployment policies.
- Very large embedded images can make board JSON large. Resize images before uploading when possible.
- The Google save endpoint should be deployed only to trusted users if student work is involved.

## Drawy analysis summary

The attached Drawy project is a KDE/Qt C++ whiteboard. Useful architectural ideas visible in the codebase include:

- Separate item types for arrows, diamonds, ellipses, freeform paths, groups, images, lines, polygons, rectangles, and text.
- Factory classes for constructing items.
- Serializer/deserializer classes for each item type.
- SVG export utilities.
- Command-history concepts for canvas actions.
- A plugin pattern for additional shapes.

ImageBoard mirrors the practical educational feature set in a web-friendly way rather than porting the Qt application.
