# Favorites page: static localStorage migration plan

Goal
- Move the existing "Favorites" panel from an in-page panel/tab into its own `favorites.html` static page that reads/writes the same `localStorage` key used by the current site.

Checklist
- [ ] Create `favorites.html` scaffold using current site header/footer
- [ ] Create `scripts/favorites.js` (localStorage read/write + render) 
- [ ] Add minimal styles (re-use `styles/main.css` or small additions)
- [ ] Replace `View Favorites` control to open `favorites.html` (link or window.location)
- [ ] Accessibility: keyboard focus, aria-live updates, image alt text

Contract (inputs / outputs / success)
- Inputs: localStorage key `favorites` (JSON array of items), each item shape: { id, title, poster, url, addedAt }
- Outputs: a static page showing all favorites with remove/export/clear actions
- Success criteria: page loads, shows saved items, user can remove items and state persists in localStorage

Data shape
- Example:
  ```json
  [
    {
      "id": "tt1234567",
      "title": "Example Movie",
      "poster": "/assets/poster-tt123.jpg",
      "url": "movies.html?id=tt1234567",
      "addedAt": 1693555200000
    }
  ]
  ```

UX & UI suggestions
- Use the site header and nav so users can navigate back.
- Top of page: title `Your Favorites` and a count (aria-live region for updates).
- Grid or list of cards: thumbnail (loading="lazy", width/height), title, short meta, `Open` link, `Remove` button.
- Controls: `Clear all`, `Export JSON`, `Import JSON`.
- Empty state: friendly message + CTA linking to `movies.html`.

Accessibility
- Announce add/remove with an `aria-live="polite"` element.
- Ensure focus is moved to a meaningful control after remove (next item or the clear button).
- Use semantic HTML (ul/li or role=list/listitem) and label interactive controls.

Edge cases
- localStorage missing or corrupted: detect JSON.parse errors and offer a reset button or import option.
- No favorites: show empty state and prevent errors.
- Large lists: offer pagination or lazy incremental render (optional later).

Implementation steps (static localStorage approach)
1) Create `favorites.html` scaffold
   - Copy header/nav from `movies.html`.
   - Add `<main id="favorites-root"></main>` and include `<script src="scripts/favorites.js"></script>` at the end.

2) Build `scripts/favorites.js` (vanilla JS, small and dependency-free)
   - Helper: `readFavorites()` -> safely parse localStorage["favorites"] with try/catch.
   - Render function: `renderFavorites(list)` that builds DOM nodes and inserts into `#favorites-root`.
   - Actions: remove single item (by id), clear all, export JSON (download), import JSON (file input parse), open movie link.
   - Ensure every action updates localStorage and re-renders.

3) Styling
   - Reuse `.movie-suggestion` card styles where appropriate.
   - Add small CSS in `styles/main.css` under a `.favorites-grid` / `.favorite-card` block (keeps styles minimal).

4) Navigation wiring
   - Replace `View Favorites` button in `movies.html` with `<a href="favorites.html" class="home-btn">View Favorites</a>` or update its click handler to `window.location.href='favorites.html'`.

5) QA & smoke test
   - Manual: add several favorites, open `favorites.html`, ensure list appears, remove works, export and re-import works.
   - Optional: add `smoke-browser.js` test to automate basic flow.

Files to create/edit
- New: `favorites.html` — page scaffold and root element
- New: `scripts/favorites.js` — read/render/update localStorage actions
- Edit: `movies.html` — change `View Favorites` control to link to `favorites.html`
- Edit (optional): `styles/main.css` — add `.favorites-grid` / `.favorite-card` styles
- New (optional): `tests/favorites.test.js` or `smoke-browser.js` steps for manual automation

Small code snippets (to reuse)
- Read favorites safely
  ```js
  function readFavorites(){
    try{
      const raw = localStorage.getItem('favorites') || '[]';
      return JSON.parse(raw);
    }catch(e){
      return [];
    }
  }
  ```

- Remove item and save
  ```js
  function removeFavorite(id){
    const list = readFavorites().filter(i => i.id !== id);
    localStorage.setItem('favorites', JSON.stringify(list));
    renderFavorites(list);
  }
  ```

QA checklist before merge
- [ ] Clicking `View Favorites` opens `favorites.html` in a new tab
- [ ] Page displays existing favorites added from `movies.html`
- [ ] Remove and Clear persist changes
- [ ] Export produces a JSON file and Import restores it
- [ ] Keyboard navigation and ARIA announcements function

Estimated time (local-only)
- Scaffold + basic client logic: ~30–60 minutes
- Styling + QA: ~15–30 minutes

Next
- I can create `favorites.html` + `scripts/favorites.js` and update `movies.html` now. Confirm and I'll implement the files and run a quick smoke check locally.
