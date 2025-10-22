# Phase 4: Module Migration - Analysis & Plan

## Current Legacy Code Structure

### movies.js (945 lines)
**Pattern:** IIFE (Immediately Invoked Function Expression)
**Key Functions:**
- `getRandomTMDbMovie()` - Fetch random movie from TMDB API via server proxy
- `getMovieExternalIDs()` - Get IMDb ID for external links
- `updateImdbLink()` - Update IMDb link in DOM
- Provider detection and deep linking logic
- Streaming provider normalization
- Movie card rendering
- Favorites management
- DOM event listeners

**Dependencies:**
- Global `createStarRating()` from utils.js
- Global `formatDateToUK()` from utils.js
- localStorage for favorites
- Inline DOM manipulation

### food.js
**Pattern:** IIFE with similar structure
**Key Functions:**
- Recipe fetching from Spoonacular API
- Card rendering
- Favorites management
- Search/filter functionality

### books.js
**Pattern:** IIFE with similar structure
**Key Functions:**
- Book data fetching
- Card rendering
- Favorites management
- Genre and search filtering

### favorites.js (761 lines)
**Pattern:** IIFE with more complex structure
**Key Functions:**
- Favorites migration from legacy format
- Read/save favorites from localStorage
- Card creation for different types
- Rendering sections (movies, food, books)
- Clearing sections
- Export/import functionality
- Search filtering with debouncing

**Current Features:**
- Search bar with real-time filtering
- Separate sections for movies/food/books
- Favorite count display
- Clear and export buttons (removed per user request)

---

## Migration Strategy

### Phase 4 Objectives
1. **Convert IIFE to ES6 Modules** - Use import/export instead of global functions
2. **Integrate Services** - Use FavoritesService, DataService, APIService from Phase 2
3. **Component-Based UI** - Replace inline DOM with Card, Grid, SearchBar, Button components
4. **Data Layer** - Move API calls to DataService for caching and normalization
5. **Event Handling** - Use component callbacks instead of inline listeners

### Step-by-Step Plan

#### Step 1: Create Page Modules
Move code from `scripts/` to `src/pages/` for better organization:
```
src/pages/
├── MoviesPage.js   (convert movies.js)
├── FoodPage.js     (convert food.js)
├── BooksPage.js    (convert books.js)
├── FavoritesPage.js (convert favorites.js)
└── index.js        (export all pages)
```

#### Step 2: Refactor Data Fetching
- Use **DataService** for caching and TTL
- Use **APIService** for HTTP requests with retry/rate limiting
- Move provider logic to utility functions

#### Step 3: Refactor Rendering
- Replace inline `document.createElement()` with **Card component**
- Use **Grid component** for layouts
- Use **SearchBar component** for filtering
- Use **Modal component** for dialogs
- Use **Button component** for actions

#### Step 4: Refactor Favorites
- Use **FavoritesService** for all favorites operations
- Subscribe to FavoritesService changes for reactive updates
- Remove localStorage access from page modules

#### Step 5: Update HTML Pages
- Replace `<script src="scripts/movies.js"></script>` with `<script type="module" src="src/pages/MoviesPage.js"></script>`
- Update all 4 HTML files (movies.html, food.html, books.html, favorites.html)

#### Step 6: Integration Testing
- Test all pages in browser
- Verify search/filter functionality
- Test favorites add/remove
- Test page navigation

---

## Code Examples: Before vs After

### Before (IIFE Pattern)
```javascript
// scripts/movies.js
(function() {
  'use strict';
  
  let currentMovie = null;
  
  async function getRandomMovie() {
    const response = await fetch('/api/tmdb/popular?page=1');
    const data = await response.json();
    currentMovie = data.results[0];
    renderMovie();
  }
  
  function renderMovie() {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img src="${currentMovie.poster_path}">
      <h3>${currentMovie.title}</h3>
      <button onclick="addToFavorites()">Add to Favorites</button>
    `;
    document.getElementById('movie-container').appendChild(card);
  }
  
  window.addToFavorites = function() {
    const favs = JSON.parse(localStorage.getItem('favorites-movies') || '[]');
    favs.push(currentMovie);
    localStorage.setItem('favorites-movies', JSON.stringify(favs));
  };
  
  getRandomMovie();
})();
```

### After (ES6 Module Pattern)
```javascript
// src/pages/MoviesPage.js
import { Card, Grid, Button } from '../components/index.js';
import { favoritesService, dataService, apiService } from '../services/index.js';

class MoviesPage {
  constructor() {
    this.currentMovie = null;
    this.container = document.getElementById('movie-container');
    this.setupEventListeners();
  }
  
  async init() {
    await this.loadRandomMovie();
  }
  
  async loadRandomMovie() {
    this.currentMovie = await dataService.get('movies', async () => {
      return await apiService.get('/api/tmdb/popular', { page: 1 });
    });
    this.render();
  }
  
  render() {
    const card = new Card({
      variant: 'movie',
      title: this.currentMovie.title,
      image: this.currentMovie.poster_path,
      rating: this.currentMovie.vote_average,
      data: this.currentMovie,
      isFavorited: favoritesService.isFavorited(this.currentMovie.id, 'movies'),
      onFavorite: (item) => this.handleFavorite(item)
    });
    
    this.container.innerHTML = '';
    this.container.appendChild(card.render());
  }
  
  handleFavorite(item) {
    favoritesService.toggle('movies', item);
  }
  
  setupEventListeners() {
    favoritesService.subscribe((action, type) => {
      if (type === 'movies') this.render(); // Re-render on favorites change
    });
  }
}

// Initialize page when DOM is ready
const page = new MoviesPage();
page.init();
```

---

## Key Improvements

### 1. Separation of Concerns
- **Data Layer:** Services handle all data fetching/caching
- **UI Layer:** Components handle all rendering
- **Logic Layer:** Page modules handle orchestration

### 2. Reusability
- Card component reused across all pages
- SearchBar component standardized
- Services available to all modules

### 3. Maintainability
- ES6 modules are easier to test and debug
- Clear data flow through services
- Component-based UI is easier to modify

### 4. Performance
- DataService caches data with TTL
- APIService handles rate limiting and retries
- Lazy loading support for images

### 5. Scalability
- Easy to add new pages using same patterns
- New components automatically available to all pages
- Services can be extended without breaking existing code

---

## Testing Plan

### Unit Tests (Phase 5)
- Test each page module's methods
- Test component integration with pages
- Test service integration

### Integration Tests (Phase 5)
- Test full page workflows
- Test favorites sync across pages
- Test search/filter functionality
- Test error handling

### Manual Testing
- Click through each page
- Test favorites add/remove
- Test search filtering
- Test pagination
- Test modal dialogs
- Test on mobile devices

---

## Timeline Estimate

| Task | Estimated Time |
|------|-----------------|
| MoviesPage refactor | 1-2 hours |
| FoodPage refactor | 30-60 minutes |
| BooksPage refactor | 30-60 minutes |
| FavoritesPage refactor | 1-2 hours |
| Update HTML files | 15-30 minutes |
| Integration testing | 30-60 minutes |
| **Total** | **4-6 hours** |

---

## Risk Analysis

### High Risk Areas
- Provider logic in movies (complex string matching)
  - **Mitigation:** Extract to utility functions with comprehensive tests
- Legacy data compatibility
  - **Mitigation:** Keep migration logic in FavoritesService

### Potential Issues
- Breaking changes to localStorage format
  - **Solution:** FavoritesService handles migration automatically
- Event timing with async operations
  - **Solution:** Use service subscriptions instead of callbacks

---

## Success Criteria

✅ All 4 pages successfully converted to ES6 modules  
✅ All components render correctly with real data  
✅ Favorites add/remove works across all pages  
✅ Search and filter functionality preserved  
✅ No console errors in browser  
✅ Page loading time remains acceptable  
✅ Mobile responsiveness maintained  

---

**Next Action:** Start with MoviesPage refactor
