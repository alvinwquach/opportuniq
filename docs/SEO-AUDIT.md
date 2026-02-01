# SEO audit summary

## Done

### Metadata
- **Root:** `app/layout.tsx` exports full metadata (title, description, openGraph, twitter, robots, metadataBase).
- **Public pages:** Every marketing, legal, and product page has segment-level metadata:
  - Legal: `privacy-policy`, `terms-of-service` (export metadata in page).
  - Support: `help-center` (export metadata in page).
  - Product: `product` layout + per-subroute layouts (`product/features`, `product/opportunity-cost`, etc.) export metadata via `lib/seo.ts` `createPageMetadata()`.
- **Client pages:** Product subpages are `"use client"`; metadata is provided by Server Component layouts in each segment so crawlers get correct title/description.

### Sitemap & robots
- **`app/sitemap.ts`:** Returns all public URLs (home, legal, help-center, product and product subpages). Excludes dashboard, admin, auth, invite, join, onboarding, case-studies (admin-only).
- **`app/robots.ts`:** Allows `/`; disallows `/dashboard`, `/admin`, `/auth`, `/api`, `/invite`, `/join`, `/onboarding`, `/banned`, `/demo`, `/redesign`, `/case-study/`, `/new-landing`, `/marketing-landing-page`, `/logo-concepts`. Sitemap URL set to `https://opportuniq.app/sitemap.xml`.

### Canonical & base
- **metadataBase:** Set in root layout and in `lib/seo.ts` to `https://opportuniq.app`. Per-page canonical URLs use `createPageMetadata({ path: "/..." })`.

### Structured data (JSON-LD)
- **Organization** and **WebSite** schemas are in `lib/seo.ts` and injected in the root layout (`app/layout.tsx`) via a `<script type="application/ld+json">` in the body. Organization has `@id` for WebSite publisher reference; WebSite includes a `SearchAction` (target: dashboard with `?q={search_term_string}`). Add or remove `sameAs` (e.g. Twitter, GitHub) in `structuredDataOrganization` as needed.

### Gaps / follow-ups
- Replace `verification.google: "your-google-verification-code"` in root layout with real Search Console verification when ready.
- Case-studies page redirects to admin; excluded from sitemap. No index needed.

## Conventions

See `docs/CONVENTIONS.md` (SEO section) and `lib/seo.ts` for how to add metadata to new public pages.
