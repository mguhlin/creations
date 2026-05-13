# Miguel's Writings Search

A standalone static search page for public entries from:

- `mguhlin.org`
- `mguhlin.blogspot.com`
- TCEA TechNotes posts authored by Miguel Guhlin

The app runs entirely in the browser and uses public WordPress APIs. No build step, package manager, backend, or API keys are required.

## Features

- Search public posts and pages from `mguhlin.org`
- Search public Blogger posts from `mguhlin.blogspot.com`
- Search TCEA TechNotes entries authored by Miguel Guhlin
- Filter by source and content type
- Sort by relevance, date, modified date, or title
- Quick-search chips for common topics
- Special `NSPA` search that only returns entries containing `NSPA:`, `NSPA1`, `NSPA2`, `NSPA3`, or `NSPA4`
- Source-specific result styling
- Per-entry sharing for Mastodon, LinkedIn, X, Lemmy, native device sharing, and link copying
- Downloadable RSS XML for the currently displayed result set

## Use the Site

Open the deployed GitHub Pages URL in a browser. No installation, Python, package manager, or build step is required for normal use.

## Preview Locally

If you want to test the files before publishing, you can run a temporary local web server from this folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Push `index.html`, `styles.css`, `app.js`, `README.md`, `.gitignore`, and `.nojekyll`.
3. In the repository settings, enable GitHub Pages from the main branch root.

## Notes

This only searches public content exposed by WordPress APIs. Password-protected or private WordPress content is not available to this static site.

Instagram does not provide a standard web share URL for arbitrary links, so the Instagram share control copies the entry title and URL for manual posting.

The RSS option generates a downloadable XML file from the results currently shown in the browser. It is not a permanent hosted RSS endpoint.
