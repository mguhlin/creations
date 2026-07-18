# Web Deck — build instructions

A tiny system for building **self-contained HTML slide decks**: no build step, no framework, no dependency beyond Google Fonts. A deck presents fullscreen, carries teleprompter **speaker notes**, drives a **two-monitor presenter view**, exports to **PDF**, reflows to read on a phone, and works offline by double-clicking the file.

This folder has everything you need:

| File | What it is |
|---|---|
| `deck-framework.css` | The design system, slide layout, navigation chrome, print, and accessibility. Never edit unless you want to change the whole look. |
| `deck-framework.js` | Slide navigation, notes panel, presenter window, print, reflow. No dependencies. |
| `sample-deck.html` | A complete example deck (lorem ipsum) showing every component. **Copy this to start.** |
| `webdeck_instructions.md` | This file. |

**Quick start:** duplicate `sample-deck.html`, rename it, and replace the slide content with yours. Double-click it to open in any browser. Arrow keys to move; press **?** for the shortcut list.

> Want an AI to build it for you? Jump to the last section, **"Using a Gen AI to assemble a deck."**

---

## 1. Look and feel

Editorial and restrained — typography is the hero, generous whitespace, blue-and-silver accents. To change the palette, edit the CSS variables at the top of `deck-framework.css` (`--navy`, `--gold` = a steel accent, `--gold-lt` = silver, etc.). To change fonts, edit the one Google Fonts `<link>` in each deck's `<head>` and the `--font-*` variables.

Default fonts: **Fraunces** (display), **Libre Franklin** (body), **IBM Plex Mono** (code). Keep on-slide text large (≥ ~18 px at the design size) so it reads on a projector.

---

## 2. The slide canvas

Every slide is a fixed **1280 × 720** (16:9) canvas. The script scales it to fit any screen, so you author at a constant size. On phones or at high zoom it automatically switches to a **reflow mode** — the slide becomes a normal, scrollable single column so the text stays readable (see §7).

A deck is one HTML file:

```html
<div class="deck">
  <section class="slide cover current"> … </section>   <!-- the FIRST slide gets `current` -->
  <section class="slide"> … </section>
  …
</div>
<script src="deck-framework.js"></script>
```

Each `<section class="slide">` has three parts:

```html
<section class="slide">
  <div class="slide-body"> …visible content… </div>
  <div class="slide-footer">
    <span class="brand"><span class="star">✦</span> Your Deck</span>
    <span class="fac">Presenter: Firstname Lastname</span>
    <span class="url">yoursite.example</span>
  </div>
  <div class="notes"><p>…teleprompter text…</p></div>   <!-- never shown on the slide -->
</section>
```

The URL hash opens a specific slide: `sample-deck.html#4` starts on slide 4.

---

## 3. Slide types

- **Cover** — `class="slide cover"`: dark gradient title slide.
  ```html
  <div class="slide-body">
    <div class="cover-eyebrow">Event or series name</div>
    <h1>Big Title</h1>
    <div class="subtitle">Italic silver subtitle</div>
    <div class="meta"><strong>Presenter:</strong> Name<br>url</div>
  </div>
  ```
- **Divider** — `class="slide divider"`: section break with an oversized ghost numeral.
  ```html
  <div class="slide-body">
    <div class="seg-num">1</div>
    <div class="divider-eyebrow">Section One · about 10 minutes</div>
    <h1>Section Title</h1>
    <div class="subtitle">One-line summary</div>
  </div>
  ```
- **Content** — the standard slide: a kicker, a title, then blocks.
  ```html
  <div class="slide-body">
    <div class="slide-kicker">Small tracked label</div>
    <h2 class="slide-title">The headline</h2>
    <p class="lead">Optional lead sentence.</p>
    <!-- blocks below -->
  </div>
  ```

---

## 4. Content blocks (drop into `.slide-body`)

- **Bullets** — `<ul class="bullets"><li>…</li></ul>` — 3–5 short phrases; `<strong>` for emphasis.
- **Cards** — `<div class="grid cols-3">` (or `cols-2`) of `<div class="card">` (add `gold` for a steel top-tab): `<h3><span class="ico">◆</span>Title</h3><p>…</p>`.
- **Steps** — `<div class="steps">` of `<div class="step"><div class="n">1</div><h4>…</h4><p>…</p></div>` — numbered sequence.
- **Do / do-not** — `<div class="guardrail">` with `<div class="guardrail-col will"><h4>Do</h4><ul>…</ul></div>` and `<div class="guardrail-col willnot"><h4>Do not</h4><ul>…</ul></div>`. Keep ~3 items per column so it fits.
- **Compare** — `<div class="compare">` with two `<div class="compare-col">` (second takes `alt` for the accent).
- **Callout** — `<div class="callout"><span class="label">LABEL</span><p>Big statement</p></div>` (add `light` for a pale version).
- **Reflect** — `<div class="reflect"><span>◆</span><p><strong>Lead.</strong> Italic prompt</p></div>`.
- **Prompt / code** — `<div class="prompt">…</div>` — dark monospace block.

`sample-deck.html` shows all of these. For a one-off custom layout, add a small `<style>` block in that deck's `<head>` and reuse the palette variables.

---

## 5. Images

Author images at the 1280×720 scale and place them with absolute positioning so text and image don't collide. Optimize to keep files small (WebP or compressed JP/PNG, longest edge ~1100–1200 px).

```html
<img style="position:absolute;top:50%;right:54px;transform:translateY(-50%);width:600px;height:auto;
     border-radius:14px;box-shadow:0 16px 44px rgba(0,0,0,.38);" src="my-photo.webp"
     alt="Describe what the image shows">
```

Every content image needs accurate `alt` text; decorative images get `alt=""`. If you give a class name ending in `-photo` or `-visual` (e.g. `class="corner-photo"`), the reflow mode will automatically un-position it on phones so it can't overlap text.

---

## 6. Navigation chrome (automatic)

Injected once by the script, fixed to the corner of the viewport:

- **Progress bar** — thin bar across the top.
- **Controls** — top-right cluster (fades in on hover/focus): `‹` prev · counter · `›` next · 🗒 notes · 🖥 presenter · ⛶ fullscreen · **?** help.

**Keyboard:** → / Space / PgDn next · ← / PgUp previous · Home / End first / last · **S** notes · **V** presenter view · **F** fullscreen · **P** print/PDF · **?** help. Clicking the left third of a slide goes back, the rest advances (links and buttons are ignored).

---

## 7. Accessibility (built in)

The framework aims at WCAG 2.1 AA. Handled for you:

- **Reflow** — on narrow screens or high zoom, `fit()` drops the fixed-scale transform and lays slides out as a scrollable single column with relative type, so nothing is clipped and text stays readable.
- **Visible keyboard focus**, a **slide-change live region** (announces "Slide X of Y: title"), **reduced-motion** support, and adequate control contrast.

Your job, per slide:

- Use **real text**, never a picture of text.
- Accurate `alt` on informative images; `alt=""` on decorative ones.
- Keep text contrast ≥ 4.5:1 on its background (the default palette passes; check custom colors).
- Don't rely on color alone to convey meaning.
- Give every slide a real heading (`<h1>` or `.slide-title`) so the live region and heading navigation work.

Still needs a person: a real screen-reader pass, if you're distributing widely.

---

## 8. Speaker notes and presenter view

Every slide carries `<div class="notes"><p>…</p></div>` — hidden on the slide, shown two ways:

- Press **S** to slide up a notes panel on the current screen.
- Press **V** to open a **presenter window**: current slide, next slide, big notes, an elapsed timer (click to pause), and a clock. Put the main window on the projector, press **F** for fullscreen. The two windows stay in sync.

Write notes as teleprompter text: first person, what you'd actually say, ~90–130 words, no stage directions.

---

## 9. Print / PDF

Press **P** in any deck. The print stylesheet stacks every slide one-per-page at 1280 × 720 and hides the chrome. Choose "Save as PDF" for a clean handout.

---

## 10. Build a deck — checklist

1. Copy `sample-deck.html` to a new file; keep the two `<link>`/`<script>` references to `deck-framework.css` and `deck-framework.js`.
2. Start with a `cover`, use `divider` slides between sections, `content` slides between.
3. Give the **first** slide `class="slide cover current"` (the `current` marks the starting slide).
4. On every slide include the `.slide-footer` and a `.notes` block.
5. Keep each slide to 3–5 short bullets or one main block; push full sentences into the notes.
6. Write teleprompter notes for every slide.
7. Open the file in a browser; arrow through it, and shrink the window / zoom to confirm it reflows and reads on a phone.

**On-slide writing style:** short phrases, spell out small numbers, avoid colons in titles, and skip hype words (unlock, elevate, journey, master, delve). Say the full thoughts out loud from the notes.

---

## 11. Viewing and sharing

- **View:** double-click the `.html` file — it runs in any modern browser, offline. Keep the deck and the two framework files together in the same folder (they're linked by filename).
- **Share:** send the whole folder, or host it on any static web host (drag the folder onto a static-hosting service, or put it behind any web server). No server-side code is needed.

---

## 12. Using a Gen AI to assemble a deck

You can hand this folder to any AI assistant and have it build a deck on your topic. Do this:

1. Open a new chat with your AI.
2. Paste **this file** (`webdeck_instructions.md`) and the contents of **`sample-deck.html`**.
3. Give it a prompt like:

> Using the web-deck system described in the instructions I just pasted, build a new self-contained deck on **[YOUR TOPIC]** for **[YOUR AUDIENCE]**. Produce one complete HTML file that links `deck-framework.css` and `deck-framework.js` (same folder). Follow the exact structure and class names from the sample deck. Include a cover, a divider before each section, and content slides using the bullets, cards, steps, do/do-not, callout, reflect, and compare blocks where they fit. Keep on-slide text to short phrases; write real teleprompter speaker notes (~100 words, first person) in the `.notes` block of every slide. Aim for about [N] slides.

4. Save the AI's output as `my-deck.html` **in this folder** (next to the two framework files) and open it in a browser.
5. Ask the AI to revise specific slides as needed ("slide 5 is too dense — split it," "add a compare slide for X vs Y").

That's it — the two framework files do the presenting, navigation, notes, PDF, and reflow; the AI just writes the slide content between the tags.
