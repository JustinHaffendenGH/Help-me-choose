# Project Refactoring Master Plan

> Goal: Evolve this prototype into a modular, testable, scalable, and observable application while preserving current functionality and accelerating future feature delivery.

---
## 1. Current State Snapshot

| Area | Status Summary | Issues / Risks |
|------|----------------|----------------|
| Frontend structure | Flat HTML + large page-level JS modules (`movies.js`, `food.js`, `books.js`, `favorites.js`) | Growth → duplication, global namespace risk, hard to test |
| State management | Implicit via `localStorage` and globals (`window.currentFood`, etc.) | Hard to reason about, no central contract, migration risk |
| Favorites system | Recently expanded to multi-type (movies/food/books) | Needs pagination, search, conflict resolution, data validation |
| Backend | Single file `server.js` mixing static hosting, API proxying, security headers, caching | Hard to unit test in isolation, growing responsibilities |
| Caching | Manual in-memory Map with ad-hoc TTL | No eviction policy, no instrumentation, not modular |
| Security | Basic CSP + headers | CSP could break future inline scripts, missing rate limiting, input validation |
| Observability | Console logs only | No request logging, metrics, structured logs, or diagnostics |
| Testing | Jest installed but almost no test suites | Refactors risky, no regression safety net |
| Build / Tooling | Plain Node + static assets | No bundling, no type system, limited lint coverage |
| Accessibility | Basic semantic elements, but no full audit | Risk of missing ARIA roles, keyboard trap tests missing |
| Performance | Fine for dev scale | Images unoptimized, no HTTP compression, blocking scripts |

---
## 2. Refactor Guiding Principles

1. Ship in safe, incremental slices (no “big bang”).
2. Keep UX working at all times (feature flags where needed).
3. Add tests before modifying critical logic.
4. Separate concerns: data fetching, transformation, UI rendering, persistence.
5. Prefer composition over large procedural scripts.
6. Instrument as we go (logs + metrics early, APM later if needed).
7. Create _interfaces/contracts_ first; implement behind them.

---
## 3. Target Architecture (Incremental)

### 3.1 Frontend Layer
- Introduce a `src/` directory (even without a framework) with ES module boundaries:
  - `src/core/` (utilities: caching, ID generation, favorites API)
  - `src/services/` (API clients: TMDb, Google Places, Google Books, Hardcover)
  - `src/features/` (movies, food, books, favorites — each with `model.js`, `ui.js`, `controller.js`)
  - `src/components/` (reusable DOM builders: card, rating, trailer modal, favorite button)
  - `src/state/` (favorites store, observable pattern or minimal pub/sub)

### 3.2 Backend Layer
Refactor `server.js` into modular structure:
```
backend/
  app.js           ← creates express app
  server.js        ← starts server (PORT, clustering later)
  config/          ← env loading, constants
  middleware/      ← securityHeaders.js, requestLogger.js, errorHandler.js
  routes/
    health.js
    debug.js
    geo.js
    tmdb.js
    places.js
    books.js
    hardcover.js
    photos.js
  services/        ← fetch wrappers + caching policies
  cache/           ← abstract cache interface (memory now, pluggable redis later)
  utils/           ← validation, buildQuery, etc.
```

### 3.3 Abstractions / Contracts
| Concern | Interface (Concept) | Benefit |
|---------|---------------------|---------|
| Favorites store | `FavoritesRepository` | Enables switching from localStorage → IndexedDB or remote sync |
| Caching | `CacheAdapter` with get/set/delete | Swap memory with Redis without touching feature code |
| External APIs | `TmdbClient`, `PlacesClient`, `BooksClient` | Centralizes auth, retries, logging |
| Logging | `Logger` (info/warn/error/debug structured) | Uniform format + later pipe to external service |
| Metrics | `Metrics` (increment, timing) | Enable latency dashboards |

---
## 4. Refactor Roadmap (Ordered Phases)

### Phase 0 – Safety Net (Immediately)
| Task | Rationale |
|------|-----------|
| Add minimal Jest tests for favorites add/remove per type | Prevent regression while reorganizing |
| Add lint rule: no unused vars, no implicit globals | Catch accidental leaks |
| Add script: `npm run test:watch` | Faster feedback |
| Add baseline Lighthouse & WebPageTest snapshots | Measure impact of changes |

### Phase 1 – Backend Modularization
| Step | Action |
|------|--------|
| 1.1 | Extract security headers middleware into `middleware/securityHeaders.js` |
| 1.2 | Extract caching helpers into `cache/memoryCache.js` |
| 1.3 | Move each `/api/*` group into route modules; mount in `app.js` |
| 1.4 | Add centralized error handler + 404 route |
| 1.5 | Add request logging (method, path, duration, status) |
| 1.6 | Add input validation (basic zod or manual schema) for query params |

### Phase 2 – Frontend Favorites Layer
| Step | Action |
|------|--------|
| 2.1 | Create `src/state/favoritesStore.js` with observable subscribe mechanism |
| 2.2 | Migrate `favorites.js` logic to use store (keep old file as shim exporting same functions) |
| 2.3 | Abstract ID generation + normalization helpers |
| 2.4 | Add unit tests for store operations (limits, dedupe) |

### Phase 3 – Componentization
| Step | Action |
|------|--------|
| 3.1 | Implement `createFavoriteCard(type, data)` returning DOM node |
| 3.2 | Replace inline DOM construction in page scripts with component calls |
| 3.3 | Introduce `renderGrid({type, targetEl})` reusable renderer |
| 3.4 | Add skeleton/loading component patterns |

### Phase 4 – API Service Layer
| Step | Action |
|------|--------|
| 4.1 | Create `services/tmdbClient.js` with fetch + retry + caching wrapper |
| 4.2 | Repeat for Places, Books, Hardcover; unify error shapes |
| 4.3 | Centralize key management + per-service base URL |
| 4.4 | Add tests using mocked `fetch` |

### Phase 5 – Performance Enhancements
| Step | Action |
|------|--------|
| 5.1 | Add gzip/brotli compression middleware |
| 5.2 | Implement client-side code splitting (defer feature scripts) |
| 5.3 | Lazy load non-critical images (already partly done — audit + refine) |
| 5.4 | Add image CDN strategy placeholder (document) |
| 5.5 | Introduce build step (esbuild or Vite) for bundling + minification |

### Phase 6 – Observability Layer
| Step | Action |
|------|--------|
| 6.1 | Introduce structured logger (JSON lines) |
| 6.2 | Add request timing + error counters |
| 6.3 | Expose `/metrics` (Prometheus format) — optional |
| 6.4 | Add frontend error capture (window.onerror + beacon to server) |

### Phase 7 – Data & Sync Future Prep
| Step | Action |
|------|--------|
| 7.1 | Define data schema for potential remote favorites sync |
| 7.2 | Add export/import version negotiation | 
| 7.3 | Add migration utilities with semantic versioning |

---
## 5. Testing Strategy

| Layer | Initial Tests | Later Expansion |
|-------|---------------|-----------------|
| Favorites store | add/remove/dedupe/limit | cross-tab sync (storage events) |
| API clients | happy path + network error + retry | rate limit backoff |
| Components | snapshot basic structure | a11y tree assertions |
| Routes | 200/400/500 responses | contract tests vs mock external APIs |
| Performance | Lighthouse budget assertions | automated regression guard in CI |

Add `tests/` structure:
```
tests/
  backend/
  frontend/
  fixtures/
```

---
## 6. Performance & Web Vitals Plan
| Metric | Current Risk | Mitigation |
|--------|--------------|------------|
| FCP/LCP | Blocking scripts, no bundling | Defer feature scripts, preload critical CSS |
| CLS | Dynamic favorites injection | Reserve space via aspect-ratio + skeletons |
| TTI | Large monolithic JS | Code split by page/feature |
| Bandwidth | No compression/minify | Add gzip + bundler + cache headers |

Add a `perf/` folder storing baseline JSON from Lighthouse.

---
## 7. Accessibility Improvements
| Area | Action |
|------|--------|
| Focus management | Ensure modals (trailer) trap / restore focus |
| ARIA live regions | Improve announcements when adding/removing favorites |
| Buttons vs links | Audit semantic correctness |
| Color contrast | Run automated axe + manual spot-check |
| Keyboard-only flows | Add test checklist |

Add script: `npm run a11y` using `axe-playwright` or `pa11y-ci` (optional initial stub).

---
## 8. Security & Hardening
| Aspect | Action |
|--------|--------|
| Rate limiting | Basic IP-based limit on API proxy routes |
| Input validation | Sanitise search terms / allowed enums |
| CSP refinement | Move inline scripts → external hashed bundles |
| Dependency auditing | Add `npm audit --omit=dev` in CI |
| Secrets handling | Use dotenv-safe or schema validation of env |

---
## 9. Tooling & Developer Experience
| Enhancement | Rationale |
|-------------|-----------|
| Add `eslint --max-warnings=0` in build | Enforce hygiene |
| Prettier on staged files via husky | Consistency |
| Add `npm run analyze` (bundle size) | Track growth |
| Introduce TypeScript gradually (start with `// @ts-check`) | Type safety without full migration |

---
## 10. Incremental Type Safety Path
1. Enable JSDoc typedefs in utilities.
2. Add a `types/` folder with shared entity definitions (MovieFavorite, FoodFavorite, BookFavorite).
3. Convert service clients to `.ts` if TypeScript introduced.
4. Strict mode after < 30% migration.

---
## 11. Risk Mitigation & Rollback
| Risk | Mitigation | Rollback Plan |
|------|-----------|---------------|
| Functionality drift during modularization | Add smoke tests per route & feature | Keep branch size small; revert last slice |
| Performance regression | Baseline perf budget JSON committed | Re-run previous bundle, cherry-pick revert |
| Data loss in favorites | Export auto-backup to file on version bump | Provide re-import UI |

---
## 12. Suggested Branching Model
| Branch | Purpose |
|--------|---------|
| `main` | Stable, deployable |
| `refactor/phase-1-backend` | First modularization slice |
| `refactor/favorites-store` | State refactor |
| `feature/*` | New vertical features |

Use small PRs (< 400 LOC diff) to retain review velocity.

---
## 13. Success Criteria
| Dimension | KPI |
|-----------|-----|
| Maintainability | Cyclomatic complexity down per major module (< 10) |
| Test Coverage | 40% → 70% (incremental) |
| Bundle Size | Initial measurement → -20% after code splitting |
| Performance | LCP < 2.5s on throttled Fast 3G test |
| Accessibility | Axe: zero serious violations |
| Stability | No production 5xx spikes post-refactor |

---
## 14. Immediate Next Actions (Actionable TODO)
1. Create `backend/` scaffolding; move security headers + cache.
2. Add favorites store with tests (movies only first, then extend).
3. Add basic request logger middleware.
4. Capture Lighthouse baseline and commit into `perf/`.
5. Add `tests/favoritesStore.test.js`.

---
## 15. Appendix: Entity Draft Types (JSDoc)
```js
/** @typedef {Object} MovieFavorite
 *  @property {string} id
 *  @property {string} title
 *  @property {string=} poster
 *  @property {string=} imdb_id
 *  @property {'movie'} type
 */

/** @typedef {Object} FoodFavorite
 *  @property {string} id
 *  @property {string} name
 *  @property {string=} cuisine
 *  @property {number=} rating
 *  @property {string=} image
 *  @property {'food'} type
 */

/** @typedef {Object} BookFavorite
 *  @property {string} id
 *  @property {string} title
 *  @property {{name:string}[]=} authors
 *  @property {number=} rating
 *  @property {string=} cover
 *  @property {'book'} type
 */
```

---
## 16. Open Questions
| Question | Notes |
|----------|-------|
| Move to framework (React/Vue/Svelte) or stay vanilla? | Delay until complexity truly demands |
| Introduce SSR/edge rendering? | Probably premature now |
| Authentication needed for multi-user sync? | Only if cloud sync becomes priority |

---
## 17. Versioning & Plan Evolution
This document should version itself. Start with:

```
Refactor Plan Version: 0.1.0
Last Updated: 2025-09-28
Maintainer: (add name/contact)
```

Update version when:
- Scope increases materially
- Architecture decisions pivot
- New phase completed

---
### Final Note
Refactoring is a _productivity investment_. Stop once:
- Change velocity improves
- Defects per feature decrease
- Cognitive load to add a feature is low

Then reassess before deeper rewrites.
