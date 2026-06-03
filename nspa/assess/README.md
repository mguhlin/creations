# NSPA AI Pulse — Anonymous Self-Assessment

A self-contained website. Five quick questions plot each person on a live map
of how scholarship providers are using Gen AI for marketing and engagement.
The person taking it appears as **YOU** (gold). Everyone else appears as
anonymous green dots. Each response is saved to a Google Sheet under a random
ID. No name or email is ever collected.

## What's in this folder

| File | Purpose |
|------|---------|
| `index.html` | The whole site (intro, quiz, chart, results) |
| `assessment.js` | Questions, scoring, chart, profiles, save/fetch |
| `config.js` | Where you paste your Google Sheet endpoint URL |
| `apps-script/Code.gs` | The free Google backend that writes to your Sheet |
| `README.md` | This file |

The site works immediately in **preview mode** with no setup (it shows a
simulated cloud of peers). To save real responses and plot real people,
do the three steps below.

---

## Step 1 — Create the Google Sheet

1. Go to <https://sheets.google.com> and create a blank spreadsheet.
2. Name it anything (for example, "NSPA AI Pulse Responses").
3. Leave it empty. The script creates the headers automatically.

## Step 2 — Add the Apps Script

1. In that Sheet, open **Extensions → Apps Script**.
2. Delete any starter code, then paste the entire contents of
   `apps-script/Code.gs`.
3. Click **Save**.
4. Click **Deploy → New deployment**.
5. For type, choose **Web app**.
6. Set **Execute as: Me** and **Who has access: Anyone**.
   (This lets the public page POST data. The script only ever
   returns anonymous percentages, never raw answers.)
7. Click **Deploy**, authorize when prompted, and copy the
   **Web app URL** (it ends in `/exec`).

## Step 3 — Connect the site

1. Open `config.js`.
2. Paste your URL between the quotes:
   ```js
   SHEET_ENDPOINT: "https://script.google.com/macros/s/AKfy...../exec",
   ```
3. Save. That's it. The preview banner disappears and responses now save.

## Step 4 — Host on GitHub Pages

1. Create a new GitHub repository (public).
2. Upload `index.html`, `assessment.js`, `config.js`, and (optionally)
   this README and the `apps-script` folder.
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source: Deploy from a branch**,
   pick your `main` branch and the `/ (root)` folder, then **Save**.
5. After a minute your site is live at
   `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

---

## Privacy notes (built in)

- No name or email is collected anywhere.
- Each response gets a random ID like `NSPA-7F3K9`.
- The Sheet stores answer choices and two derived scores only.
- The browser only ever receives anonymous score pairs to plot the dots,
  not other people's raw answers.

## Customizing

- **Questions / scoring:** edit the `QUESTIONS` array at the top of
  `assessment.js`. Each option has a `u` (adoption) and `c`
  (confidence/responsibility) value from 0 to 3.
- **Profiles and growth steps:** edit `archetype()` and the `banks`
  object in `assessment.js`.
- **Look and feel:** all styles live in the `<style>` block of
  `index.html`.

## A note on accuracy

The four profiles and the growth suggestions are a structured starting point,
not a diagnosis. Treat results as a conversation prompt for your team, and
verify any field statistics you cite against official NSPA records before
presenting them.
