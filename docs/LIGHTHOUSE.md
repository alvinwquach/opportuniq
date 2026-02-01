# Lighthouse audits

Run Lighthouse to target **Performance**, **Accessibility**, **Best Practices**, and **SEO** (and optionally **PWA**) across marketing and app routes.

## Prerequisites

- **Chrome** or **Chromium** (Lighthouse uses it for audits).
- For **local** audits: dev server or production build running (e.g. `npm run build && npm run start`).

## Commands

### Single URL

- **Interactive (default: http://localhost:3000; report opens in browser):**
  ```bash
  npm run lighthouse
  ```
  To audit a different URL:
  ```bash
  npm run lighthouse -- https://opportuniq.app
  ```

- **CI / headless (no GUI; pass URL as first extra arg):**
  ```bash
  npm run lighthouse:ci -- https://opportuniq.app
  ```
  Reports are written to `./lighthouse-report.html` and `./lighthouse-report.report.json`.

### All public URLs (run and check every marketing page)

Runs Lighthouse once per URL and writes one HTML + JSON report per page under `./lighthouse-reports/`.

- **Local (default base: http://localhost:3000):**
  ```bash
  npm run build && npm run start
  ```
  In another terminal:
  ```bash
  npm run lighthouse:all
  ```

- **Production (opportuniq.app):**
  ```bash
  npm run lighthouse:all:prod
  ```

- **Custom base URL:**
  ```bash
  node scripts/lighthouse-all.js https://staging.opportuniq.app
  ```
  Or:
  ```bash
  LIGHTHOUSE_BASE_URL=https://staging.opportuniq.app npm run lighthouse:all
  ```

**URLs audited:** `/`, `/product`, `/product/features`, `/product/opportunity-cost`, `/product/photo-analysis`, `/product/safety-risk`, `/product/smart-diagnostics`, `/product/decision-ledger`, `/product/collaboration`, `/product/budget`, `/product/calendar`, `/product/guides`, `/product/parts-finder`, `/product/pro-finder`, `/privacy-policy`, `/terms-of-service`, `/help-center`.

**Output:** `lighthouse-reports/home.html`, `lighthouse-reports/product.html`, `lighthouse-reports/product-features.html`, etc. Open any `.html` file in a browser to view scores and fix issues. The script exits with code 1 if any run fails.

## Pages to audit (reference)

- **Marketing (in lighthouse:all):** All of the URLs above.
- **App (auth required):** `/dashboard`, `/issues`, `/dashboard/calendar`, `/dashboard/guides`, etc. Not included in `lighthouse:all`; run manually with a logged-in profile or staging URL.

## Target: all 100s

1. **Performance:** Reduce LCP (server render + loading skeletons), avoid layout shift (skeleton dimensions match content), defer non-critical JS.
2. **Accessibility:** Semantic HTML, labels, focus states, contrast. Use `aria-*` where needed (e.g. loading states: `aria-busy`, `aria-label`).
3. **Best Practices:** HTTPS, no deprecated APIs, correct image aspect ratios, secure cookies.
4. **SEO:** Every public page has `metadata` (title, description, canonical); sitemap and robots.txt are in place (`app/sitemap.ts`, `app/robots.ts`).

See `docs/CONVENTIONS.md` for data fetching, caching, and loading boundaries that support these scores.
