# Critical Thinking Breakouts

Three self-contained digital breakouts that teach real-world reasoning — logic, media literacy, and scientific skepticism — to grades 3–12. No logins, no server, no data collection. Each page is a single HTML file; the only external request is Google Fonts.

By Miguel Guhlin (TCEA / MGuhlin.org). Contact: mguhlin@tcea.org

## The breakouts
- **grade35/** — 🍎 The Mixed-Up Lunchroom (logic & observation)
- **grade68/** — 📡 Signal Check: The Viral Claim (media literacy) — includes the bonus evidence-sort lock
- **grade912/** — 🔬 Lab Report Lockdown (scientific reasoning)

Each folder has `index.html` (teacher launch, no answer key) and `student.html` (the breakout).

## Other files
- `index.html` — the hub (pick a breakout by grade)
- `recording-sheet.html` — printable student reasoning log (works with any breakout)
- `answer-key.html` — TEACHER ONLY — do not link publicly
- `policy.html` — privacy & compliance (GDPR, Texas SCOPE/FERPA/COPPA/TEC 32.151/CIPA, accessibility)
- `assets/` — splash tiles (SVG + PNG) for each breakout and the hub

## Lock types
Each breakout uses four locks; grades 6–8 adds a fifth:
1. **Digit** — numeric code from the clues
2. **Multiple choice** — pick the supported answer
3. **Word** — type the answer (accepts variants)
4. **Sequence** — tap items in the correct order
5. **Evidence sort (multi-select)** — select every strong-evidence item, leave the noise (grades 6–8)

## Hosting
Drop the whole folder on any static host (GitHub Pages, district server) or embed `student.html` via iframe in Google Sites. Keep `answer-key.html` out of student-facing links.

## License
Dual: **CC BY 4.0** for content, **MIT** for code. See `LICENSE`.
Attribution: "Critical Thinking Breakouts by Miguel Guhlin (TCEA), CC BY 4.0."
