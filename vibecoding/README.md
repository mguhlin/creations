# vcs

Vibe-Coded Solutions for Educators

# Vibe-Coded Classroom Tools

Free, customizable classroom utilities for K-16 educators who want practical alternatives to subscription-based tools.

These projects use simple static web pages, Google Apps Script, Google Sheets, and Google Drive. They are intended for educators, trainers, instructional coaches, technology directors, and professional learning facilitators who want tools they can inspect, adapt, and host themselves.

Created by **Miguel Guhlin**
Email: [mguhlin@tcea.org](mailto:mguhlin@tcea.org)
Blog: [TCEA TechNotes](https://blog.tcea.org)

For background, examples, and implementation notes, read the related blog entry at [https://blog.tcea.org](https://blog.tcea.org).

---

## What Is Included?

| Tool | Purpose | Best For |
|---|---|---|
| **ShareSpace** | Student or participant file-submission gallery | Showcasing work, PD artifacts, media submissions |
| **WonderWall** | Anonymous classroom or workshop question wall | Q&A, parking-lot questions, staff PD questions |
| **StickyBoard** | Collaborative sticky-note canvas | Brainstorming, sorting ideas, group reflection |
| **ImageBoard** | Self-contained browser whiteboard | Drawing, diagramming, station work, visual lessons |
| **Markdown Cleaner and Converter** | Clean Markdown and convert it to formatted HTML | Blog writing, AI-generated content cleanup, web publishing |

---

## Repository Layout

This repository ships each tool in two forms:

- **Zipped demo packages** at the root level — easiest to download and deploy as-is.
- **Unzipped working folders** for the most current variants — easiest to read, fork, and edit directly on GitHub.

```text
vcs/
├── LICENSE
├── README.md
├── mguhlin_MD_Converter.html              # Markdown Cleaner and Converter (single-file tool)
│
├── imageboard.zip                         # ImageBoard whiteboard + optional Apps Script backend
│
├── sharespace-demo.zip                    # ShareSpace, open submissions
├── sharespace-demo-moderated.zip          # ShareSpace, moderated submissions
├── sharespace-demo-moderated-discussions.zip  # ShareSpace, moderated + discussion board
├── sharespace-book/                       # Unzipped ShareSpace (moderated + discussions) configured for a book study
│
├── stickyboard-demo.zip                   # StickyBoard, notes only
├── stickyboard-with-images.zip            # StickyBoard, notes plus optional images
├── stickyboard/                           # Unzipped StickyBoard
│
├── wonderwall-demo.zip                    # WonderWall, moderated question wall
└── wonderwall/                            # Unzipped WonderWall
```

---

## Solution 1: ShareSpace

**ShareSpace** is a simple submission board where participants can upload work, add a short reflection, and have their submissions appear in a public gallery.

It is designed as a lightweight alternative to tools such as Padlet-style boards when you want files stored in your own Google Drive instead of a third-party vendor platform.

### ShareSpace Features

- Public gallery for submitted work
- File uploads to Google Drive
- Metadata stored in Google Sheets
- Category-based organization (categories editable in `categories.md` in newer builds)
- Image thumbnails
- PDF, video, audio, document, and text-file support depending on the version
- Admin page for managing submissions: approve, hide, restore, edit, delete, toggle moderation
- Optional moderation workflow in moderated versions
- Optional password-gated discussion board with replies (moderated + discussions edition)

### ShareSpace Versions

| Version | Description | Download |
|---|---|---|
| **ShareSpace without moderation** | Submissions appear publicly after upload. Admin can remove or manage content afterward. | [sharespace-demo.zip](https://mglearn.github.io/vcs/sharespace-demo.zip) |
| **ShareSpace with moderation** | Submissions go into a pending queue until approved by an admin. | [sharespace-demo-moderated.zip](https://mglearn.github.io/vcs/sharespace-demo-moderated.zip) |
| **ShareSpace with moderation + discussions** | Adds a password-gated topic discussion board with participant replies, configured through `discussions.md`. | [sharespace-demo-moderated-discussions.zip](https://mglearn.github.io/vcs/sharespace-demo-moderated-discussions.zip) |

A pre-configured book-study variant is also included unzipped under `sharespace-book/`. It contains `index.html`, `Submit.html`, `Admin.html`, `Discussion.html`, `board.html`, `categories.md`, and `discussions.md` set up for a multi-book reading group.

---

## Solution 2: WonderWall

**WonderWall** is an anonymous question wall for classrooms, workshops, staff meetings, conferences, and professional development.

Participants submit questions without needing an account. The facilitator can approve questions before they appear on the public board, depending on the version or configuration used.

Think of it as a simple, self-hosted alternative to Slido or Mentimeter-style Q&A.

### WonderWall Features

- Anonymous question submission
- Public question wall
- Teacher or facilitator admin page
- Password-protected moderation view
- Digital citizenship reminder
- Classroom/workshop friendly interface
- Google Sheets backend through Google Apps Script

### WonderWall Versions

| Version | Description | Download / Demo |
|---|---|---|
| **WonderWall without moderation** | Questions can appear directly on the wall for fast, informal use. | [WonderWall demo](https://mglearn.github.io/vcs/wonderwall) |
| **WonderWall with moderation** | Questions are reviewed and approved before they appear publicly. | [wonderwall-demo.zip](https://mglearn.github.io/vcs/wonderwall-demo.zip) |

The unzipped `wonderwall/` folder contains `index.html`, `Submit.html`, and `Admin.html`.

---

## Solution 3: StickyBoard

**StickyBoard** is a collaborative sticky-note canvas for brainstorming, sorting, reflection, group work, and workshop activities.

It is designed to help fill the gap left by the end of Jamboard without requiring a paid FigJam, Lucidspark, or similar subscription.

### StickyBoard Features

- Multi-colored sticky notes
- Public collaborative canvas
- Submit page for adding notes
- Admin page for managing notes
- Optional moderation mode
- Drag-and-drop note placement
- Google Apps Script and Google Sheets backend
- Digital citizenship reminder

### StickyBoard Versions

| Version | Description | Download |
|---|---|---|
| **StickyBoard without images** | Multi-colored sticky notes for brainstorming and group activities. | [stickyboard-demo.zip](https://mglearn.github.io/vcs/stickyboard-demo.zip) |
| **StickyBoard with images** | Sticky notes can also include optional uploaded pictures. | [stickyboard-with-images.zip](https://mglearn.github.io/vcs/stickyboard-with-images.zip) |

The unzipped `stickyboard/` folder contains `index.html`, `Submit.html`, and `Admin.html`.

---

## Solution 4: ImageBoard

**ImageBoard** is a self-contained browser whiteboard for K-16 educators and students. It runs as a single HTML page, with an optional Google Apps Script backend for saving boards and previews to Google Drive and logging metadata to Google Sheets.

### ImageBoard Features

- Multiple panels/pages for stations, groups, topics, or lessons
- Pen, line, arrow, rectangle, ellipse, diamond, triangle, text, and Post-it tools
- Image upload with drag and resize
- Adjustable stroke color, fill color, opacity, and line thickness
- Background patterns: blank, grid, dots, graph, ruled, and isometric
- Object selection, dragging, resizing, locking, duplicate, front/back ordering, and deletion
- PNG export
- Local `.imageboard.json` save and load
- Optional Google Drive + Google Sheets save through Apps Script
- Browser local-storage autosave

### ImageBoard Contents

Inside `imageboard.zip`:

```text
imageboard/
├── index.html              # the whiteboard app
├── apps-script/Code.gs     # optional Drive + Sheets backend
└── README.md               # ImageBoard-specific setup notes
```

### ImageBoard Download

| Option | Link |
|---|---|
| **Download the ImageBoard package** | [imageboard.zip](https://mglearn.github.io/vcs/imageboard.zip) |

For purely local use, host or open `index.html` directly. For Drive saves, deploy `apps-script/Code.gs` as a web app and paste the URL into ImageBoard's `Script URL` field.

---

## Bonus: Markdown Cleaner and Converter

The **Markdown Cleaner and Converter** is a single-page tool for cleaning Markdown, converting it to formatted HTML, and copying content more easily.

It is useful when working with AI-generated content, blog drafts, documentation, LMS content, or any writing workflow that moves between Markdown and HTML.

### Markdown Cleaner and Converter Features

- Paste Markdown on the left
- View formatted HTML output
- Copy raw Markdown
- Copy formatted HTML
- Copy raw HTML
- Clean common Markdown problems
- Find and replace text
- Mobile-friendly workflow
- Single-file HTML tool

### Markdown Cleaner and Converter Links

| Option | Link |
|---|---|
| **Use the tool online** | [https://go.mgpd.org/md](https://go.mgpd.org/md) |
| **Download or copy the HTML file** | [mguhlin_MD_Converter.html](https://mglearn.github.io/vcs/mguhlin_MD_Converter.html) |

---

## Typical File Structure

Most Google-backed tools follow this general structure:

```text
project-folder/
├── Setup.md
├── index.html
├── Submit.html
├── Admin.html
└── code.gs
```

ShareSpace builds may also include `board.html`, `Discussion.html`, `categories.md`, and `discussions.md`. ImageBoard ships as a single `index.html` plus an optional `apps-script/Code.gs`. The Markdown Cleaner and Converter is a single self-contained HTML file.

---

## General Setup Pattern

The exact setup steps vary by tool, but most Google-backed tools follow this pattern:

1. Open the project folder.
2. Read `Setup.md` first.
3. Create a Google Sheet for the project data.
4. Open Google Apps Script from the Sheet (or from [script.google.com](https://script.google.com)).
5. Paste in `code.gs`.
6. For ShareSpace, run `setupNow` once and set the `ADMIN_PASSCODE` script property.
7. Deploy the Apps Script as a web app (Execute as: Me; Access: Anyone).
8. Copy the web app URL.
9. Paste the web app URL into the `SCRIPT_URL` constant in each HTML file.
10. Host the HTML files on GitHub Pages, an intranet server, or another static web host.
11. Test the submit page, public board, and admin page before using with students or staff.

---

## Digital Citizenship Reminder

These tools are designed for learning environments. Before using them with students or staff, set clear expectations:

- Use school-appropriate language.
- Do not post private, personal, or sensitive information.
- Do not upload images of others without permission.
- Keep comments and submissions connected to the learning task.
- Remember that even anonymous tools should be used responsibly.

Moderation is recommended when using these tools with students, public events, or large groups.

---

## Privacy and Hosting Notes

These projects are intended to give educators more control over their data, but they still require careful setup.

- Google Apps Script permissions are controlled by the Google account that deploys the script.
- Uploaded files may be stored in Google Drive.
- Metadata may be stored in Google Sheets.
- Public boards should not expose private student information.
- Admin pages should not be linked publicly unless needed.
- Password protection in client-facing tools (including ShareSpace discussion topic passwords, which are hashed in `discussions.md`) is helpful for classroom access gating but is not a substitute for secure server-side authentication.

For student-facing use, review local district policies, student data privacy requirements, and acceptable-use guidelines.

---

## Customization Ideas

Because the files are editable, educators and technology teams can customize these tools for local needs.

Examples:

- Rename tools for a campus, cohort, or course.
- Change colors and branding.
- Add categories, modules, or departments (edit `categories.md` for ShareSpace).
- Adjust upload limits.
- Turn moderation on or off where supported.
- Adapt language for elementary, secondary, higher education, or adult learning.
- Host tools internally for district-only access.

---

## License

See [LICENSE](LICENSE) for the full license terms. These tools are shared as practical, editable examples for educators. Review, test, and adapt them before using in a live classroom or professional learning setting.

---

## Creator

Created by **Miguel Guhlin**
Email: [mguhlin@tcea.org](mailto:mguhlin@tcea.org)
Blog: [TCEA TechNotes](https://blog.tcea.org)
