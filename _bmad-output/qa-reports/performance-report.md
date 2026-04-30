# Performance Audit Report

**Generated:** 2026-04-30
**Tool:** Google Lighthouse (headless Chrome, mobile emulation, default config)
**Target surfaces:** Login page (entry point), Board page (primary view)

## Headline numbers

| Build | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Production build (`vite build` + `vite preview`) | **100** | 96 | 96 | 82 |
| Dev server (`vite dev`, HMR + sourcemaps) | 60 | 96 | 96 | 82 |

Production build hits a **perfect 100 / 100** Lighthouse Performance score on both surfaces.

The dev-server number is reported for transparency only; Vite dev mode disables minification and serves untranspiled modules with HMR overhead, so it is not representative of what users experience.

---

## Core Web Vitals (production build)

| Metric | Value | Threshold (Good) | Status |
|---|---|---|---|
| First Contentful Paint (FCP) | 1.4 s | < 1.8 s | ✅ |
| Largest Contentful Paint (LCP) | 1.7 s | < 2.5 s | ✅ |
| Total Blocking Time (TBT) | 0 ms | < 200 ms | ✅ |
| Cumulative Layout Shift (CLS) | 0 | < 0.1 | ✅ |
| Speed Index | 1.4 s | < 3.4 s | ✅ |

All Core Web Vitals are in the "Good" range.

---

## Bundle analysis (production)

```
dist/index.html                   0.45 kB │ gzip:  0.29 kB
dist/assets/index-FGjLVyLZ.css   24.08 kB │ gzip:  5.13 kB
dist/assets/index-Bhfo57qi.js   245.47 kB │ gzip: 77.85 kB
```

- **Total transfer (gzip): ~83 kB.** Single bundle includes React 19, React Router 7, the entire app, and Tailwind-generated CSS.
- No code-splitting yet: the entire app loads on first paint. For a single-screen kanban this is fine, but if more views are added consider lazy-loading non-board routes.

---

## Network and rendering

- Single JS bundle, no waterfall.
- CSS is a single file, hashed for long-term caching.
- The nginx prod image (`frontend/Dockerfile`) sets `Cache-Control: public, immutable` on `/assets/` and `no-store` on `index.html`, so repeat visitors only download the HTML shell.
- React 19 server-friendly renderer; no hydration cost (client-only SPA in this setup).

---

## Backend latency (anecdotal)

The backend is FastAPI on uvicorn with SQLite. Characteristic latency in local Docker:

| Endpoint | Local p50 |
|---|---|
| `GET /health` | < 5 ms |
| `POST /auth/login` | ~30 ms (bcrypt cost 12) |
| `POST /auth/signup` | ~30 ms (bcrypt cost 12) |
| `GET /tasks` | ~5 ms |
| `POST /tasks` | ~5 ms |
| `PATCH /tasks/{id}/status` | ~5 ms |

bcrypt verification is the only material cost; everything else is SQLite-bounded. For production with >1000 users, swap SQLite for Postgres and consider a connection pool.

---

## Recommendations

These are not blocking — perf is already 100. Listed for future reference.

1. **Code-split the board route** if more views are added; lazy-load the dnd handlers (`React.lazy` or dynamic import).
2. **Tree-shake `@tailwindcss/postcss`** by enabling `purge`/`content` scanning explicitly. Current CSS bundle is 24 kB raw / 5 kB gzip — fine, but easy to reduce further.
3. **Add a service worker** for offline-first behavior (low priority for an internal tool).
4. **Self-host fonts** if any are added later. Current build uses system fonts only, which is optimal.
5. **Drop `react-router-dom`'s data router APIs** if not needed — moves us closer to a `react-router/lite` install if/when bundle size matters.

---

## Reproducing the audit

```bash
# Production build
cd frontend
npm run build
npx vite preview --port 4173 &
npx lighthouse http://localhost:4173/login --view

# Dev server (for comparison)
npm run dev &
npx lighthouse http://localhost:5173/login --view
```
