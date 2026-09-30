# InvoiceCraft — Professional Invoice Generator

Create beautiful invoices in seconds. No sign-up, no server, 100% private.

## Quick start
- **Easiest:** double-click `index.html`. It works in any modern browser.
- **Full offline mode (recommended):** host the folder on any static host (Netlify, Vercel, GitHub Pages, cPanel)
  or run `python3 -m http.server` locally. After the first visit, it works with no internet and can be installed as an app.

## Features
- 3 templates (Minimal, Classic, Modern) + 7 accent colors + a custom color picker
- English / Arabic (full right-to-left layout) with one click
- Live A4 preview · one-click PDF download · print
- Save, load and delete drafts · auto-saves every 30 s
- Automatic numbering (INV-001, INV-002 …) · tax, % or fixed discount · 25 currencies
- Logo upload (drag & drop) · status stamp (Paid / Unpaid / Overdue)
- Shortcuts: Ctrl/⌘+S saves a draft · Ctrl/⌘+P prints · Enter adds a new item row

## Customize
Edit the CONFIG block at the top of `app.js`: `NUMBER_PREFIX`, `ACCENTS`, `CURRENCIES`, `AUTOSAVE_MS`.
All text lives in the `I18N` object. Colors and fonts are CSS variables at the top of `style.css`.
When you change files, bump `CACHE` in `sw.js` so returning users get the update.

## Files
index.html · style.css · app.js · sw.js (offline) · manifest.webmanifest · icon.svg · lib/ (local copies of jsPDF and html2canvas)
