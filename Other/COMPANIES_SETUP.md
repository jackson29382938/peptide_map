# Peptide Companies Ranking & Reviews - Setup Guide

This feature adds a vote-and-comment system for peptide companies, using your existing PHP/MySQL stack (InfinityFree config) and a new panel in index.html.

## What was added
- UI: Companies panel with filter, vote (👍/😐/👎), comments, add/edit company fields.
- Backend APIs (PHP):
  - `php/api/companies.php` — list companies, add new, update existing, fetch single
  - `php/api/votes.php` — submit a vote and optional comment
- DB setup script: `php/setup-companies.php` — creates tables and seeds your initial list.
- Frontend JS: `js/companies.js` — panel logic and API calls.

## Database schema
The setup script creates:

- `companies`
  - `id` INT PK AUTO_INCREMENT
  - `name` VARCHAR(255) UNIQUE NOT NULL
  - `url` VARCHAR(512) NOT NULL
  - `created_at` DATETIME NOT NULL
  - `updated_at` DATETIME NOT NULL

- `company_votes`
  - `id` INT PK AUTO_INCREMENT
  - `company_id` INT NOT NULL (FK → companies.id ON DELETE CASCADE)
  - `rating` TINYINT NOT NULL  // -1, 0, or 1
  - `comment` TEXT NULL
  - `ip_address` VARCHAR(64) NULL
  - `user_agent` VARCHAR(512) NULL
  - `created_at` DATETIME NOT NULL
  - `updated_at` DATETIME NOT NULL

## Setup steps (InfinityFree)
1. Update DB credentials if needed in `php/config.php` (already present for analytics). Ensure they match your InfinityFree MySQL.
2. Deploy/upload the new files if not already present:
   - `js/companies.js`
   - `php/api/companies.php`
   - `php/api/votes.php`
   - `php/setup-companies.php`
   - `index.html` (contains the new panel + toggle + script include)
3. Initialize the tables and seed the provided list:
   - Visit: `https://<your-domain>/php/setup-companies.php`
   - You should see a message like: "Created tables and seeded companies." or an existing count.
4. Open the site and click the 🏢 button to open the panel. Use filter, add, vote, and edit to verify functionality.

## API quick reference
- GET `php/api/companies.php`
  - Returns array of companies with aggregate counts: `positive_count`, `neutral_count`, `negative_count`, `score`, `total_votes`.
- GET `php/api/companies.php?id=<ID>`
  - Returns a single company with the same aggregates.
- POST `php/api/companies.php` (JSON)
  - Add: `{ action: "add", name: string, url: string }`
  - Update: `{ action: "update", id: number, name: string, url: string }`
- POST `php/api/votes.php` (JSON)
  - Vote/comment: `{ company_id: number, rating: -1|0|1, comment?: string }`

## Editing & moderation
- Anyone can add/edit and vote via the UI by default. If you want to restrict editing:
  - Add a simple admin token check in `companies.php` for `action=update` and `action=add`.
  - Add rate-limiting or CAPTCHA to `votes.php` to reduce spam.

## Styling
- The panel reuses existing Studies panel classes (`studies-header`, `studies-list`, etc.) to match your theme.
- Buttons and inputs are basic HTML; customize in `css/styles.css` if desired.

## Troubleshooting
- CORS or mixed content: Keep all calls relative (already done) and host PHP + HTML on the same domain.
- DB connection issues: Check `php/config.php` values and that the DB exists; try a small test query in a throwaway endpoint.
- Panel doesn’t open: Ensure `#companies-toggle` and `#companies-panel` exist in the DOM (they are in index.html) and that `js/companies.js` is loading (check browser console).
