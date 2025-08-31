## Refactor report — Random movie website

Brief plan
- I inspected the codebase (HTML, CSS, `scripts/main.js`, `server.js`, `package.json`, helpers). Below are prioritized findings, concrete recommendations, and a suggested phased refactor plan you can follow or have me implement.

Checklist (your request)
- [x] Review project files and structure
- [x] List issues and security problems (hardcoded keys, unused files)
- [x] Provide prioritized refactor suggestions mapped to files
- [x] Offer next steps and minimal implementation options

Summary of high-level findings
- Large monolithic frontend script: `scripts/main.js` (several responsibilities: books, movies, food, UI, caching). Hard to maintain or test.
- Secrets and API keys are hardcoded in `scripts/main.js` (TMDB and Google Books keys). That is a security risk.
- `server.js` is a small but useful proxy for Google Places/Photos; it is implemented reasonably but lacks a convention for adding other proxy endpoints (e.g., Books, TMDB) and has no tests.
- No test harness or linting (no `test` script in `package.json`). `test-genres.js` was empty and removed.
- `add-genres.js` is a one-off script that mutates `scripts/main.js`—this implies the source data is embedded in JS rather than JSON/data files.
- HTML pages are simple and use the large `main.js` for behavior by id selectors (fragile). Repeated IDs across pages (`genre`, `rating`) are reused but mean the same `main.js` must guard for missing elements.



Code-quality and maintainability suggestions
- Reduce global state: avoid big global objects `bookCache`, `foodCache`, `currentFilter`. Encapsulate caches behind small modules/classes with clear methods: get, set, preload, clear.
- Replace repeated DOM ready blocks with per-page initializers: each page's script runs only the handlers it needs (guarding for missing elements is fine but avoid duplicating checks).
- Use consistent naming and tiny helper utilities in `scripts/utils.js`: `fetchJson`, `safeGetElement`, `createStarRating`, `formatDate`, `escapeHtml`.
- Remove/replace one-off scripts that mutate source files (e.g., `add-genres.js`). Instead store canonical data as JSON and generate user-facing artifacts at runtime or build time.

Security checklist
- Remove hardcoded keys from `scripts/main.js` immediately (TMDB, GOOGLE_BOOKS_API_KEY). Status: keys found in file.
- Add `.env` usage docs (already have `secrets.local.example.js` — convert to `.env.example`) and put server-side proxies behind `server.js`.
- Add HTTP headers to `server.js` for basic protection: Content-Security-Policy, X-Content-Type-Options, etc.

Performance checklist
- Lazy-load large lists of curated content and only fetch external APIs on demand.
- Use smaller image sizes and a fallback strategy (already present) but centralize it.
- Consider building a small cache layer (server and more careful client cache) and avoid large synchronous loops or many sequential network calls.

Accessibility checklist
- Ensure interactive elements are keyboard accessible (buttons, selects). Many are, but `div onclick` in `index.html` should use `<button>`.
- Add alt text (assets mostly have alt, but double-check dynamic images get alt attributes set).

Concrete file-by-file suggestions
- `scripts/main.js` (huge)
  - Split responsibilities: move book-related functions to `scripts/books.js`, movie functions to `scripts/movies.js`, food to `scripts/food.js`, utilities to `scripts/utils.js`.
  - Remove inlined API keys: instead call `/api/tmdb/random` or `/api/books/search` on the server.
  - Move curated arrays into `data/curated-books.json` and `data/curated-foods.json` and load via fetch() or import.

- `server.js`
  - Add routes for book and TMDB proxy endpoints and verify caching TTLs.
  - Add basic security headers (CSP) and stricter CORS in production.
  - Add small health endpoint `/healthz` for monitoring and a `/version` endpoint if desired.

- `package.json`
  - Add scripts: `lint`, `test`, `start`, `build` (if using bundler), `format`.
  - Add devDependencies: eslint, prettier, jest (or vitest), optionally rollup/webpack/vite for bundling.

- `add-genres.js`
  - Deprecate: instead create/maintain `data/curated-books.json` and remove mutation script.

- `styles/main.css`
  - Keep but consider breaking into partials if you adopt a preprocessor (Sass) or adopt a CSS-in-Module approach when switching to a bundler.

Suggested phased refactor plan (safe, incremental)
Phase A — Safety + small modularization (1-2 days)
- Remove API keys from client code. Add server endpoints for books/TMDB minimal proxy.
- Split `scripts/main.js` into per-page bootstrap files: `scripts/books.boot.js`, `scripts/movies.boot.js`, `scripts/food.boot.js` that import shared utils.

Phase B — Data and build tooling (1-3 days)
- Move curated arrays into `data/*.json`.
- Add ESLint/Prettier and a small test harness with one or two unit tests for `utils` functions.
- Add npm scripts and document dev flow in `README.md`.

Phase C — Improve UX, performance, and infra (1-2 days)
- Add lazy-loading, image optimization, and server-side caching.
- Add CI workflow (GitHub Actions) for lint + test + build.

Low-risk examples / short snippets
- Replace client-side key usage (example)

Client (remove key usage):
```js
// BAD: in scripts/main.js
const TMDB_API_KEY = 'e2a3d...';
fetch(`https://api.themoviedb.org/...&api_key=${TMDB_API_KEY}`);
```

Server proxy approach (server.js):
```js
app.get('/api/tmdb/popular', async (req, res) => {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.TMDB_API_KEY}&page=${req.query.page||1}`;
  const r = await fetch(url); const json = await r.json(); res.json(json);
});
```

Then the client calls `/api/tmdb/popular?page=1` without needing the key.

What I can do next (pick one)
- A: Implement the high-priority fixes (remove keys from `scripts/main.js`, add two simple server proxies for TMDB and Google Books, split `scripts/main.js` into two modules) — low risk and reversible.
- B: Scaffold ESLint + Jest and add 3 unit tests for `utils` functions.
- C: Create the data JSON files from the current curated arrays and wire the code to import them.

Notes and assumptions
- I assumed you want a minimal, maintainable refactor without a full framework rewrite (no React/Vue by default). If you prefer a full SPA conversion, that is a larger effort and I can propose a migration plan.
- If you want TypeScript, adopt it early and add types for API responses; I can include a small migration plan.

Verification & quality gates
- After any change I recommend these checks:
  - Lint (ESLint) passes
  - Unit tests (utils) pass
  - Server runs and proxies expected endpoints (smoke test)

Closing summary
- The most urgent item is removing hardcoded API keys from client files and moving external API calls behind the server proxy. Splitting `scripts/main.js` into modules and moving curated data into JSON are the next highest-value changes.

If you tell me which of the "What I can do next" options you want, I will implement it and run the verification steps.
