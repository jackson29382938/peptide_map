# Body Map Peptides

Interactive 3D body map for exploring peptide injection points, a peptides database, a reconstitution
calculator, a recommendation quiz, vendor directory and live PubMed / Semantic Scholar search.
**Educational only. Not medical advice.**

Live site: https://peptide-map.vercel.app/

## Run locally

```bash
npm install
cp .env.example .env     # optional: SMTP settings for the contact form
npm start                # http://localhost:3000
```

`server.js` is an Express app that serves the static site and a few JSON APIs (analytics, study votes and
comments, research cache). `api/contact.js` is the Vercel serverless function behind the contact form;
`server.js` mounts the same handler locally.

## Project layout

| Path | What it is |
| --- | --- |
| `index.html` | The whole single-page app (panels, calculators, static reference content) |
| `js/` | App modules, loaded with plain `<script>` tags in dependency order (see the bottom of `index.html`) |
| `js/vendor/` | Self-hosted three.js r128, OrbitControls, OBJLoader (pinned; do not edit) |
| `css/styles.css`, `css/onboarding.css` | Hand-written styles with light/dark theme variables |
| `css/tailwind.css` | **Generated** Tailwind utilities. Run `npm run build:css` after adding Tailwind classes |
| `api/contact.js` | Contact form handler (SMTP via nodemailer) |
| `php/` | Legacy PHP/MySQL backend for vendor ratings (not used on Vercel; see below) |
| `test.py` | Data-science script that generates `BPC-157_interactive_dashboard.html` |

## End-to-end tests

`tests/e2e/` drives the real UI in headless Chromium (every panel, calculator, search path, the 79 body
regions, touch/mobile behaviour, the contact form, vendors, quiz, journal, onboarding, drag-resize...).

```bash
npm install
npx playwright install chromium      # or set CHROMIUM_PATH to an existing Chromium
npm start &                          # serves http://localhost:3000 (set BASE to test another URL)
npm run test:e2e
```

The research-search checks call the live PubMed API; everything else is self-contained.

## Deploying to Vercel

Set these environment variables for the contact form: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
(and optionally `SMTP_FROM`, `CONTACT_TO`). See `.env.example`.

The vendor panel falls back to a read-only directory when the PHP ratings API (`php/api/companies.php`) is
unreachable, which is always the case on Vercel. Ratings and comments need that backend to be hosted somewhere
that runs PHP/MySQL and `API_BASE` in `js/companies.js` pointed at it.

## Security notes

- `js/config.js` contains PubMed / Semantic Scholar API keys that are shipped to every browser. Treat them as
  public: rotate them, and prefer proxying through a server route.
- `php/config.php` still contains the original database credentials as fallbacks. Rotate that password, then
  move the new values into `php/config.local.php` (git-ignored) or environment variables and delete the fallbacks.
- Adding or editing vendors through the PHP API requires an admin token (`ADMIN_TOKEN` env var or `define('ADMIN_TOKEN', ...)` in `php/config.local.php`). With no token configured, vendor writes are disabled. Ratings and comments remain open to everyone and are not rate limited.
