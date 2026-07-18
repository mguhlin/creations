# Web Deck

Build clean, **self-contained HTML slide decks** — no build step, no framework, no dependency beyond Google Fonts. A deck is a single HTML file that presents fullscreen, carries teleprompter **speaker notes**, drives a **two-monitor presenter view**, exports to **PDF**, reflows to read on a phone, and works offline by double-clicking.

Live copy: <https://mguhlin.github.io/creations/tcea/webdecks/webdeck_package>

## What's in this folder

| File | What it is |
|---|---|
| `sample-deck.html` | A complete, **self-contained** example deck (lorem ipsum) showing every component. Open it to see the system run; **copy it to start** your own. |
| `webdeck_instructions.md` | The full build guide — plus the entire framework CSS and JS embedded in its appendices, so it's everything-in-one-file. Includes how to have a Gen AI assemble a deck for you. |
| `README.md` | This file. |

Every deck is one HTML file with the CSS and JavaScript inlined — nothing else has to sit beside it.

## Quick start

1. **See it work:** open `sample-deck.html` in any modern browser (double-click, offline).
2. **Move around:** `←` / `→` (or Space) change slides; press **?** for the full shortcut list.
3. **Make your own:** duplicate `sample-deck.html`, rename it, and replace the slide content. The CSS and JS are already inlined, so your new file stands alone.

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

Open any AI assistant, paste **just `webdeck_instructions.md`** (it already contains the framework CSS and JS in its appendices), and ask it to build a deck on your topic. The assistant inlines the appendices and returns one complete `.html` file you can save and open anywhere. The exact prompt is in the instructions (§12).

## Sharing

A finished deck is a single file — email it, drop it in a folder, or host it on any static web host. No server-side code, no build tools. Google Fonts load from a CDN when online and fall back to system fonts offline.

## Accessibility

The framework targets WCAG 2.1 AA out of the box: it reflows to a readable single column on phones and at high zoom, shows visible keyboard focus, announces slide changes to screen readers, and respects reduced-motion settings. Your part per slide: real text (not pictures of text), accurate image `alt`, sufficient color contrast, and a real heading. See §7 of the instructions.

## Notes

- No build tools, package manager, or internet required except the Google Fonts link (swap it for local fonts to run fully offline).
- To change the look, edit the palette and font variables under `:root` at the top of the deck's `<style>` block (Appendix A in the instructions).
- Prefer separate framework files? Save Appendix A as `deck-framework.css` and Appendix B as `deck-framework.js`, link them from your HTML, and keep the folder together. Both approaches work.
- Works in any modern browser (Chrome, Firefox, Safari, Edge).
