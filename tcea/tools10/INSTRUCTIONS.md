# TCEA Tools Project Instructions

Use these conventions when adding or updating tools in this folder.

## File Structure

- Put each tool in its own folder at the project root.
- Each tool folder must have its main page named `index.html`.
- If a tool needs separate teacher/student views, use:
  - `index.html` for the teacher/setup page
  - `student.html` for the student/share page
- Keep tool assets inside that tool's folder, for example `coinflipping/assets/`.
- Do not leave shared or floating asset folders at the root unless multiple tools truly use them.

## Main Menu

- The root [index.html](index.html) is the main Tool Menu.
- Add every new tool as a `.tool-card` link.
- Keep tool cards sorted alphabetically by the visible tool title.
- Keep the running count updated in both places:
  - Main heading: `Tool Menu: N Tools`
  - Badge: `N tools`
- Do not include placeholder cards in the count.
- Avoid redundant words like `Classroom` in the menu card title. Page titles may still use it when appropriate.

## Visual Style

Keep all tools visually consistent with the root menu.

Use the TCEA color palette:

```css
--navy: #1E398D;
--gold: #FAA634;
--black: #000000;
--white: #FFFFFF;
--red: #D1282F;
--blue: #0070B9;
--yellow: #FDDC3F;
--orange: #f58231;
--green: #3cb44b;
--gray-90: #404041;
--gray-50: #939597;
--gray-30: #BBBDC0;
--gray-10: #E6E7E8;
```

Use the same top strip as the main menu:

```css
.top-bar {
  height: 12px;
  background: linear-gradient(
    90deg,
    var(--navy) 0 32%,
    var(--gold) 32% 52%,
    var(--orange) 52% 64%,
    var(--red) 64% 76%,
    var(--blue) 76% 88%,
    var(--green) 88% 96%,
    var(--yellow) 96% 100%
  );
}
```

General style rules:

- Use `Arial, Helvetica, sans-serif`.
- Use white page backgrounds unless a tool has a functional reason not to.
- Use `8px` as the standard border radius for panels, buttons, and cards.
- Use the root menu header pattern: eyebrow `TCEA Tools`, navy page title, short subtitle, and a `Tool Menu` link back to `../index.html`.
- Avoid one-off color palettes unless the user specifically requests them.

## Share Links

- For teacher/student tools, encode the student setup in the URL hash.
- Follow the Dicebreaker pattern:
  - Teacher page builds a `student.html#...` link.
  - Student page reads the hash and runs without a server.
- Keep the student page free of teacher setup controls.

## Verification

After changes:

- Run a JavaScript syntax check for edited/new HTML files with scripts:
  - `sed -n '/<script>/,/<\/script>/p' path/index.html | sed '1d;$d' | node --check`
- Scan for stale paths:
  - `file:///`
  - old standalone filenames
  - old folder names after renames
  - incorrect `../assets` references
- Confirm every menu link points to an existing file.
