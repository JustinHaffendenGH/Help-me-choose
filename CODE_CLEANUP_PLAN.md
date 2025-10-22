# Code Cleanup & Refactoring Plan

**Document Date:** 22 October 2025  
**Project:** Random Movie Website (Help-me-choose)  
**Status:** Planning Phase

---

## Overview

This document outlines a comprehensive cleanup and refactoring strategy to improve code quality, maintainability, performance, and developer experience across the entire codebase. The goal is to modernize the architecture while maintaining all existing functionality.

---

## Table of Contents

1. [Current State Assessment](#current-state-assessment)
2. [Architecture Improvements](#architecture-improvements)
3. [Module Organization](#module-organization)
4. [Code Quality & Standards](#code-quality--standards)
5. [Performance Optimizations](#performance-optimizations)
6. [Testing & Validation](#testing--validation)
7. [Documentation](#documentation)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Current State Assessment

### Strengths
- ✅ Three functional content sections (movies, food, books)
- ✅ Favorites system with localStorage persistence
- ✅ Multi-page architecture with consistent styling
- ✅ Search/filter functionality on favorites page
- ✅ Responsive design with gradient styling
- ✅ Git version control in place

### Areas for Improvement
- ❌ Scripts are scattered and lack clear module boundaries
- ❌ Repetitive code across `movies.js`, `food.js`, `books.js`
- ❌ Global scope pollution (many functions in IIFE but inconsistent patterns)
- ❌ No centralized configuration management
- ❌ Limited error handling and validation
- ❌ No unit tests or integration tests
- ❌ CSS could be better organized (utility classes, variables)
- ❌ No build process or bundling
- ❌ Missing JSDoc comments for many functions
- ❌ Inconsistent naming conventions

---

## Architecture Improvements

### 1. Transition to ES Modules

**Goal:** Replace IIFEs with proper ES module pattern for better code organization.

**Current:**
```javascript
(function() {
  // All code in IIFE
})();
```

**Target:**
```javascript
// src/modules/movies.js
export function renderMovies(container, data) { }
export function addToFavorites(movie) { }

// src/pages/movies.js
import { renderMovies, addToFavorites } from '../modules/movies.js';
```

**Benefits:**
- Clearer dependencies
- Easier testing
- Better IDE support
- Potential for tree-shaking unused code

**Files Affected:**
- `scripts/movies.js`
- `scripts/food.js`
- `scripts/books.js`
- `scripts/favorites.js`
- `scripts/main.js`

---

### 2. Extract Shared Logic into Utilities

**Goal:** Remove duplication by creating shared utility modules.

**Planned Modules:**

#### `src/utils/storage.js`
```javascript
export const Storage = {
  get(key, defaultValue = null) { },
  set(key, value) { },
  remove(key) { },
  clear() { },
};
```

#### `src/utils/dom.js`
```javascript
export function createElement(tag, attrs, children) { }
export function querySelector(selector) { }
export function querySelectorAll(selector) { }
export function on(element, event, handler) { }
export function off(element, event, handler) { }
export function addClass(element, className) { }
export function removeClass(element, className) { }
export function setAttributes(element, attrs) { }
```

#### `src/utils/api.js`
```javascript
export async function fetchJSON(url, options = {}) { }
export async function fetchWithTimeout(url, timeout = 5000) { }
export function handleError(error, context) { }
```

#### `src/utils/validation.js`
```javascript
export function validateEmail(email) { }
export function validateObject(data, schema) { }
export function isValidJSON(str) { }
```

#### `src/utils/formatters.js`
```javascript
export function formatDate(date) { }
export function formatCurrency(amount) { }
export function truncateText(text, maxLength) { }
export function sanitizeHTML(html) { }
```

**Files Affected:**
- All existing scripts

---

### 3. Create Centralized Data Services

**Goal:** Centralize data fetching and caching logic.

#### `src/services/favoritesService.js`
```javascript
export class FavoritesService {
  constructor() {
    this.listeners = [];
  }
  
  get(type) { }
  add(type, item) { }
  remove(type, itemId) { }
  clear(type) { }
  subscribe(listener) { }
  notify() { }
}

export const favoritesService = new FavoritesService();
```

#### `src/services/dataService.js`
```javascript
export class DataService {
  constructor(cacheTime = 3600000) { }
  
  async getMovies() { }
  async getFood() { }
  async getBooks() { }
  getCache(key) { }
  setCache(key, value) { }
  clearCache(key) { }
}

export const dataService = new DataService();
```

---

### 4. Component-Based UI System

**Goal:** Create reusable, composable UI components.

#### `src/components/Card.js`
```javascript
export class Card {
  constructor(data, options = {}) { }
  render() { }
  update(data) { }
  destroy() { }
}
```

#### `src/components/Grid.js`
```javascript
export class Grid {
  constructor(container, options = {}) { }
  addItem(card) { }
  removeItem(id) { }
  clear() { }
  render() { }
}
```

#### `src/components/SearchBar.js`
```javascript
export class SearchBar {
  constructor(container, options = {}) { }
  getValue() { }
  setValue(value) { }
  onSearch(callback) { }
  render() { }
}
```

---

## Module Organization

### Proposed Directory Structure

```
Random movie website/
├── src/
│   ├── components/
│   │   ├── Card.js
│   │   ├── Grid.js
│   │   ├── SearchBar.js
│   │   ├── Modal.js
│   │   └── Button.js
│   ├── services/
│   │   ├── favoritesService.js
│   │   ├── dataService.js
│   │   ├── storageService.js
│   │   └── apiService.js
│   ├── utils/
│   │   ├── dom.js
│   │   ├── storage.js
│   │   ├── api.js
│   │   ├── validation.js
│   │   ├── formatters.js
│   │   └── logger.js
│   ├── config/
│   │   ├── constants.js
│   │   ├── environment.js
│   │   └── features.js
│   ├── pages/
│   │   ├── movies.js
│   │   ├── food.js
│   │   ├── books.js
│   │   └── favorites.js
│   ├── styles/
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── pages.css
│   │   ├── utilities.css
│   │   └── variables.css
│   └── index.js (entry point)
├── dist/ (build output)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/ (legacy, to be migrated)
├── styles/ (legacy, to be migrated)
├── package.json
├── vite.config.js (or webpack.config.js)
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
└── README.md
```

---

## Code Quality & Standards

### 1. Linting & Formatting

**Goal:** Enforce consistent code style.

**Status:** ESLint already configured, needs updates

**Actions:**
- [ ] Review and update `.eslintrc.js` rules
- [ ] Install Prettier for code formatting
- [ ] Create `.prettierrc` configuration
- [ ] Add pre-commit hooks (husky) to auto-format
- [ ] Run linter across all files and fix issues

**Files:**
```json
{
  "eslint": {
    "extends": ["eslint:recommended"],
    "rules": {
      "no-console": "warn",
      "no-unused-vars": "error",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "semi": ["error", "always"],
      "quotes": ["error", "single", { "avoidEscape": true }]
    }
  }
}
```

### 2. JSDoc Documentation

**Goal:** Add comprehensive code documentation.

**Example:**
```javascript
/**
 * Adds an item to the user's favorites
 * @param {string} type - Type of item ('movies', 'food', 'books')
 * @param {Object} item - Item object with id, title, etc.
 * @param {string} item.id - Unique identifier
 * @param {string} item.title - Display title
 * @returns {boolean} Success status
 * @throws {Error} If type is invalid
 */
export function addToFavorites(type, item) { }
```

**Actions:**
- [ ] Add JSDoc to all public functions
- [ ] Document parameters and return types
- [ ] Include usage examples in comments
- [ ] Generate documentation from JSDoc

### 3. Naming Conventions

**Goal:** Establish and enforce consistent naming.

**Rules:**
- Variables/functions: `camelCase`
- Classes/Constructors: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private members: prefix with `_`
- Booleans: prefix with `is`, `has`, `can`

**Example:**
```javascript
const MAX_ITEMS = 100;  // ✅ constant
class MovieCard { }      // ✅ class
function renderCard() {} // ✅ function
const isVisible = true;  // ✅ boolean
const _privateVar = 42;  // ✅ private
```

### 4. Error Handling

**Goal:** Implement consistent error handling.

**Actions:**
- [ ] Create custom error classes
- [ ] Add try-catch blocks in async functions
- [ ] Implement error logging
- [ ] Show user-friendly error messages
- [ ] Validate input data

**Example:**
```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export async function fetchAndRender(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    logger.error('Fetch failed', { url, error });
    showErrorToUser('Failed to load data. Please try again.');
  }
}
```

---

## Performance Optimizations

### 1. Code Splitting

**Goal:** Reduce initial bundle size by splitting code by page.

**Before:** Single large `main.js` loaded for all pages  
**After:** Each page loads only what it needs

```javascript
// movies.html
<script type="module" src="/src/pages/movies.js"></script>

// src/pages/movies.js
import { renderMovies } from '../components/Grid.js';
import { dataService } from '../services/dataService.js';
```

### 2. Lazy Loading

**Goal:** Load data only when needed.

**Actions:**
- [ ] Implement pagination for large lists
- [ ] Load images with `loading="lazy"`
- [ ] Defer non-critical scripts
- [ ] Use Intersection Observer for visibility tracking

### 3. Caching Strategy

**Goal:** Reduce repeated data fetches.

**Actions:**
- [ ] Implement in-memory cache with TTL
- [ ] Use localStorage for persistent cache
- [ ] Add cache invalidation logic
- [ ] Consider IndexedDB for large datasets

### 4. CSS Optimization

**Goal:** Reduce CSS bundle size.

**Actions:**
- [ ] Remove unused CSS (PurgeCSS)
- [ ] Extract common patterns into utilities
- [ ] Use CSS custom properties for theming
- [ ] Consider critical CSS inlining

---

## Testing & Validation

### 1. Unit Tests

**Goal:** Test individual functions in isolation.

**Framework:** Jest or Vitest

**Example Test:**
```javascript
import { addToFavorites, removeFavorite } from '../services/favoritesService.js';

describe('FavoritesService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('adds item to favorites', () => {
    const item = { id: 1, title: 'Movie' };
    addToFavorites('movies', item);
    expect(removeFavorite('movies')).toContain(item);
  });

  test('removes item from favorites', () => {
    const item = { id: 1, title: 'Movie' };
    addToFavorites('movies', item);
    removeFavorite('movies', 1);
    expect(removeFavorite('movies')).not.toContain(item);
  });
});
```

**Coverage Goals:**
- Utilities: 100%
- Services: 95%+
- Components: 80%+
- Pages: 60%+

### 2. Integration Tests

**Goal:** Test how modules work together.

**Example:**
```javascript
describe('Movies Page Integration', () => {
  test('renders movies and allows favoriting', async () => {
    // Setup
    const container = document.createElement('div');
    
    // Act
    await renderMoviesPage(container);
    const firstCard = container.querySelector('[data-card-id="1"]');
    firstCard.querySelector('.favorite-btn').click();
    
    // Assert
    expect(favoritesService.get('movies')).toHaveLength(1);
  });
});
```

### 3. E2E Tests

**Goal:** Test complete user workflows.

**Framework:** Playwright or Cypress

**Example:**
```javascript
describe('User Favorites Workflow', () => {
  test('user can add movie to favorites and see it on favorites page', async () => {
    // Navigate to movies
    await page.goto('http://localhost:3000/movies.html');
    
    // Add first movie to favorites
    await page.click('[data-movie-id="1"] .favorite-btn');
    
    // Navigate to favorites
    await page.goto('http://localhost:3000/favorites.html');
    
    // Verify it appears
    expect(await page.textContent('🎬 Movies (1)')).toBeTruthy();
  });
});
```

---

## Documentation

### 1. Code Documentation

- [ ] Add JSDoc to all functions
- [ ] Create architecture documentation
- [ ] Document API contracts
- [ ] Add code examples

### 2. Developer Guide

**File:** `DEVELOPER.md`

**Contents:**
- Setup instructions
- Project structure overview
- Coding standards
- Common tasks (adding new page, adding feature)
- Testing instructions
- Deployment process

### 3. API Documentation

**File:** `API.md`

**Contents:**
- Data structures
- Service interfaces
- Component APIs
- Event system documentation

### 4. User Guide

**File:** `USER_GUIDE.md`

**Contents:**
- How to use each section
- Search functionality
- Favorites management
- Troubleshooting

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Set up tooling and core infrastructure.

- [ ] Setup build tool (Vite or esbuild)
- [ ] Configure linting and formatting
- [ ] Create new folder structure
- [ ] Setup testing framework
- [ ] Create core utilities modules

**Commits:**
```
refactor: init build setup with vite
refactor: setup linting and formatting
refactor: extract dom utilities
refactor: extract storage utilities
refactor: extract validation utilities
```

### Phase 2: Services & Core (Weeks 3-4)

**Goal:** Extract shared business logic into services.

- [ ] Create FavoritesService
- [ ] Create DataService
- [ ] Create StorageService
- [ ] Migrate localStorage logic
- [ ] Add error handling

**Commits:**
```
refactor: create FavoritesService
refactor: create DataService
refactor: migrate to services layer
refactor: add error handling
```

### Phase 3: Components (Weeks 5-6)

**Goal:** Build reusable UI components.

- [ ] Create Card component
- [ ] Create Grid component
- [ ] Create SearchBar component
- [ ] Create Modal component
- [ ] Create Button component

**Commits:**
```
refactor: create Card component
refactor: create Grid component
refactor: create SearchBar component
refactor: implement components throughout
```

### Phase 4: Module Migration (Weeks 7-9)

**Goal:** Migrate pages from IIFE to ES modules.

- [ ] Migrate movies.js
- [ ] Migrate food.js
- [ ] Migrate books.js
- [ ] Migrate favorites.js
- [ ] Remove IIFE patterns

**Commits:**
```
refactor: migrate movies to modules
refactor: migrate food to modules
refactor: migrate books to modules
refactor: migrate favorites to modules
```

### Phase 5: Testing (Weeks 10-11)

**Goal:** Add comprehensive test coverage.

- [ ] Write unit tests for utilities
- [ ] Write unit tests for services
- [ ] Write integration tests for pages
- [ ] Write E2E tests for workflows
- [ ] Achieve 80%+ coverage

**Commits:**
```
test: add utility tests
test: add service tests
test: add integration tests
test: add E2E tests
```

### Phase 6: CSS & Style Refactoring (Week 12)

**Goal:** Reorganize and optimize CSS.

- [ ] Split main.css into modules
- [ ] Create CSS variables file
- [ ] Extract utility classes
- [ ] Remove unused CSS
- [ ] Improve specificity

**Commits:**
```
style: split CSS into modules
style: create CSS variables
style: extract utility classes
style: remove unused CSS
```

### Phase 7: Documentation & Polish (Week 13)

**Goal:** Complete documentation and final polish.

- [ ] Write developer guide
- [ ] Write API documentation
- [ ] Add code examples
- [ ] Create architecture diagram
- [ ] Final testing and fixes

**Commits:**
```
docs: add developer guide
docs: add API documentation
docs: add architecture documentation
chore: final cleanup and polish
```

---

## Success Criteria

### Code Quality
- ✅ 0 ESLint errors
- ✅ All functions documented with JSDoc
- ✅ Consistent naming conventions throughout
- ✅ No code duplication (DRY principle)
- ✅ Clear module boundaries

### Performance
- ✅ Initial bundle size < 100KB
- ✅ Page load time < 2 seconds
- ✅ Lighthouse score > 90
- ✅ No console errors or warnings

### Testing
- ✅ 80%+ code coverage
- ✅ All critical paths tested
- ✅ All workflows tested E2E
- ✅ Zero failing tests

### Maintainability
- ✅ New developer can understand code in < 1 hour
- ✅ Adding new feature takes < 30 minutes
- ✅ Bug fixes can be made in < 15 minutes
- ✅ Code review time < 20 minutes per PR

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Breaking existing functionality | Medium | High | Comprehensive testing before each phase |
| Migration complexity | Medium | Medium | Incremental approach, parallel running |
| Performance regression | Low | High | Benchmark before/after each phase |
| Team learning curve | Medium | Low | Documentation and pair programming |

---

## Tools & Dependencies

### Build & Bundling
- [ ] **Vite** - Fast build tool
- [ ] **esbuild** - JavaScript bundler

### Testing
- [ ] **Vitest** - Unit testing
- [ ] **Playwright** - E2E testing
- [ ] **@testing-library/dom** - DOM testing utilities

### Code Quality
- [ ] **ESLint** - Linting (already have)
- [ ] **Prettier** - Code formatting
- [ ] **husky** - Git hooks
- [ ] **lint-staged** - Pre-commit linting

### Development
- [ ] **TypeScript** - Optional type safety
- [ ] **JSDoc** - Type hints without TS
- [ ] **DevTools** - Browser debugging

---

## Conclusion

This refactoring plan will significantly improve code maintainability, performance, and developer experience. The phased approach allows for incremental improvements while maintaining stability.

**Next Steps:**
1. Review and approve this plan
2. Prioritize phases based on business needs
3. Begin Phase 1 implementation
4. Schedule weekly review meetings

---

**Document Version:** 1.0  
**Last Updated:** 22 October 2025  
**Author:** Code Cleanup Initiative
