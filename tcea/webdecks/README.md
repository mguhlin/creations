# Web Deck

Build clean, self-contained **HTML slide decks** — no build step, no framework, no dependency beyond Google Fonts. A deck is a single HTML file that presents fullscreen, carries teleprompter **speaker notes**, drives a **two-monitor presenter view**, exports to **PDF**, reflows to read on a phone, and works offline by double-clicking.

## What's in this folder

| File | What it is |
|---|---|
| `sample-deck.html` | A complete example deck (lorem ipsum) showing every component. **Copy this to start.** |
| `deck-framework.css` | The design system, layout, navigation chrome, print, and accessibility. |
| `deck-framework.js` | Slide navigation, notes, presenter window, print, reflow. No dependencies. |
| `webdeck_instructions.md` | The full build guide, plus how to have a Gen AI assemble a deck for you. |
| `README.md` | This file. |

Keep all files together in the same folder — the deck links the two framework files by filename.

## Quick start

1. **See it work:** double-click `sample-deck.html`. It opens in any modern browser, offline.
2. **Move around:** `←` / `→` (or Space) change slides; press **?** for the full shortcut list.
3. **Make your own:** duplicate `sample-deck.html`, rename it, and replace the slide content. Keep the `<link>` to `deck-framework.css` and the `<script>` for `deck-framework.js`.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `→` / `Space` | Next slide |
| `←` | Previous slide |
| `Home` / `End` | First / last slide |
| `S` | Speaker notes on this screen |
| `V` | Presenter view (second monitor) |
| `F` | Fullscreen |
| `P` | Print / export to PDF |
| `?` | Show all shortcuts |

## Build a deck with AI

Open any AI assistant, paste `webdeck_instructions.md` and the contents of `sample-deck.html`, then ask it to build a deck on your topic following the same structure. Save the result as an `.html` file in this folder and open it. Full prompt is in the instructions (§12).

## Sharing

Send the whole folder, or host it on any static web host — no server-side code needed. The deck and the two framework files must stay together.

## Accessibility

The framework targets WCAG 2.1 AA out of the box: it reflows to a readable single column on phones and at high zoom, shows visible keyboard focus, announces slide changes to screen readers, and respects reduced-motion settings. Your part per slide: real text (not pictures of text), accurate image `alt`, sufficient color contrast, and a real heading. See §7 of the instructions.

## Notes

- No build tools, package manager, or internet required except the Google Fonts link (swap it for local fonts to run fully offline).
- To change the look, edit the palette and font variables at the top of `deck-framework.css`.
- Works in any modern browser (Chrome, Firefox, Safari, Edge).
