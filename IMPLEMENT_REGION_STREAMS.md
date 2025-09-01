IMPLEMENTATION PLAN: Show streaming providers only for the user's region

Overview

Goal: show streaming providers on `movies.html` only for the region where theyre available (TMDb returns watch/providers per-region). Use progressive client-side detection with a user override. We'll use the sequential thinking notes below to justify choices.

Sequential thinking summary (short)
- Prefer client-side locale detection (navigator.language) for simplicity and privacy.
- Provide an explicit region selector so users can override detection.
- Client fetches TMDb watch providers once, then selects the matching region in the returned `results` map.
- Fallback order: detected region -> user override -> 'US' -> first available region.

Checklist (requirements)
- [ ] Add `getUserRegion()` util to detect country code.
- [ ] Add region parameter to `getMovieStreamingData(movieId, region)` and pick `data.results[region]`.
- [ ] Add region selector UI to `movies.html` and persist to localStorage.
- [ ] Update `showRandomTMDbMovie()` to call `getUserRegion()` and pass region to streaming fetch.
- [ ] Add tests and manual verification steps.

Design decisions and tradeoffs
- Detection: navigator.language is simple and requires no server changes; accuracy varies but it's fine for most users. We provide an override to handle edge cases.
- Server-side IP geolocation would be more accurate but needs a geo-IP service and extra server code; left as an optional follow-up.
- We'll normalize region strings to uppercase 2-letter ISO codes (TMDb uses this pattern: 'US', 'GB', etc.).

Files to change (high level)
- `scripts/movies.js` (primary): add `getUserRegion()`, update `getMovieStreamingData()` and call-sites.
- `movies.html`: add small region selector UI (select element) and an optional info tooltip.
- `scripts/utils.js` (optional): if you prefer, place `getUserRegion()` there for reuse.
- Tests: add a small test file `tests/test_region_pick.js` (node-based unit test that runs a pure helper function). This is optional but recommended.

Code snippets

1) getUserRegion() (client-side)
```javascript
// Return ISO 3166-1 alpha-2 country code guessed from navigator.language or localStorage override
function getUserRegion() {
  // 1) user override in localStorage
  const override = localStorage.getItem('regionOverride');
  if (override && typeof override === 'string') return override.toUpperCase();

  // 2) navigator.language e.g. "en-GB" or "en" or "es-419"
  const locale = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (locale && locale.includes('-')) {
    const parts = locale.split('-');
    const maybeCountry = parts[parts.length - 1];
    if (maybeCountry.length === 2) return maybeCountry.toUpperCase();
  }

  // 3) try Intl API fallback (some browsers)
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // e.g. 'Europe/London'
    if (tz && tz.includes('/')) {
      // crude map: optionally maintain a small timezone->country map
    }
  } catch (e) {}

  // 4) final default
  return 'US';
}
```

2) getMovieStreamingData(movieId, region)
```javascript
async function getMovieStreamingData(movieId, region) {
  try {
    const response = await fetch(`/api/tmdb/movie/${movieId}/watch/providers`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.results) return null;

    // Normalize region
    const r = (region || '').toUpperCase();

    // Pick best: exact region, else 'US', else first available
    if (r && data.results[r]) return data.results[r];
    if (data.results['US']) return data.results['US'];

    const first = Object.values(data.results).find(Boolean);
    return first || null;
  } catch (e) {
    console.error('Error fetching streaming data:', e);
    return null;
  }
}
```

3) UI: add selector to `movies.html` near filters or above results
```html
<label for="region-select">Region</label>
<select id="region-select">
  <option value="">Auto</option>
  <option value="US">United States</option>
  <option value="GB">United Kingdom</option>
  <option value="CA">Canada</option>
  <option value="AU">Australia</option>
  <option value="DE">Germany</option>
  <!-- add more as you like -->
</select>
```

JS to wire selector (hook into getUserRegion override)
```javascript
const regionSelect = document.getElementById('region-select');
if (regionSelect) {
  // initialize
  const saved = localStorage.getItem('regionOverride') || '';
  regionSelect.value = saved;
  regionSelect.addEventListener('change', () => {
    const v = regionSelect.value || '';
    if (v) localStorage.setItem('regionOverride', v);
    else localStorage.removeItem('regionOverride');
    // refresh current movie streaming display if visible
    const movieId = window.currentMovieId; // set this when showing a movie
    if (movieId) showRandomTMDbMovie(); // or call a dedicated refresh function
  });
}
```

4) showRandomTMDbMovie integration
```javascript
async function showRandomTMDbMovie() {
  const movie = await getRandomTMDbMovie();
  // ... existing code ...
  // compute region
  const region = getUserRegion();
  const streamingData = await getMovieStreamingData(movie.id, region);
  displayStreamingAvailability(streamingData);
}
```

Edge cases & notes
- TMDb returns a `link` per-region in the watch/providers response. If you prefer to link to TMDb's watch page for that movie in that region, you can use `streamingData.link` and/or `data.results[region].link` when building provider anchors.
- If logos are missing, hide the <img> and show the text only.
- Browser locales are not guaranteed to represent physical location; include the override UI to handle that.

Testing
- Unit: write tests for `pickRegionResult(results, region)` given a mocked `results` object.
- Manual: load the page, check default region is picked from locale, switch the selector, and confirm provider list updates.

Rollout / follow-ups
- Optionally implement server-side geolocation if you want to guarantee region detection. That requires a geo-IP database/service and small server changes (detect region per request and return it, or provide an endpoint `/api/region` that returns the server's guess for the client's IP).
- Consider adding a small tooltip explaining "Why your region might be wrong" and how to change it.

---

If you'd like, I can implement these changes now (I already have the codebase open). Tell me whether to:
- Implement client-only region detection + UI (recommended, quick) — I can apply now.
- Also add server-side geo-IP detection (requires adding a lightweight geoip package or external service) — I'll outline steps and estimate time.

