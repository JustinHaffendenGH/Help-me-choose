/**
 * FavoritesService
 * Centralized service for managing user favorites with event system
 */

import * as Storage from '../utils/storage.js';
import { logger } from '../utils/logger.js';

const STORAGE_KEYS = {
  movies: 'favorites-movies',
  food: 'favorites-food',
  books: 'favorites-books',
};

class FavoritesService {
  constructor() {
    this.listeners = [];
    this.favoritesCache = {
      movies: [],
      food: [],
      books: [],
    };
    this.logger = logger.child('FavoritesService');
    this.initialize();
  }

  /**
   * Initialize favorites from storage
   */
  initialize() {
    Object.entries(STORAGE_KEYS).forEach(([type, key]) => {
      this.favoritesCache[type] = Storage.get(key, []);
    });
    this.logger.info('Initialized with cached favorites');
  }

  /**
   * Get all favorites of a type
   * @param {string} type - 'movies', 'food', or 'books'
   * @returns {Array} Array of favorite items
   */
  get(type = 'movies') {
    if (!this.isValidType(type)) {
      this.logger.warn(`Invalid type: ${type}`);
      return [];
    }
    return [...this.favoritesCache[type]];
  }

  /**
   * Get a specific favorite by ID
   * @param {string|number} id - Item ID
   * @param {string} type - 'movies', 'food', or 'books'
   * @returns {Object|null} Favorite item or null
   */
  getById(id, type = 'movies') {
    if (!this.isValidType(type)) return null;
    return this.favoritesCache[type].find((item) => item.id === id) || null;
  }

  /**
   * Check if item is favorited
   * @param {string|number} id - Item ID
   * @param {string} type - 'movies', 'food', or 'books'
   * @returns {boolean}
   */
  isFavorited(id, type = 'movies') {
    return this.getById(id, type) !== null;
  }

  /**
   * Add item to favorites
   * @param {string} type - 'movies', 'food', or 'books'
   * @param {Object} item - Item to add (must have id property)
   * @returns {boolean} Success status
   */
  add(type, item) {
    if (!this.isValidType(type)) {
      this.logger.warn(`Invalid type: ${type}`);
      return false;
    }

    if (!item || !item.id) {
      this.logger.warn('Item must have an id property', { item });
      return false;
    }

    // Check if already favorited
    if (this.isFavorited(item.id, type)) {
      this.logger.info(`Item already favorited: ${item.id}`, { type });
      return false;
    }

    this.favoritesCache[type].push(item);
    this.persist(type);
    this.notify('add', type, item);
    this.logger.info(`Added to ${type} favorites: ${item.id}`);
    return true;
  }

  /**
   * Remove item from favorites
   * @param {string|number} id - Item ID
   * @param {string} type - 'movies', 'food', or 'books'
   * @returns {boolean} Success status
   */
  remove(id, type = 'movies') {
    if (!this.isValidType(type)) {
      this.logger.warn(`Invalid type: ${type}`);
      return false;
    }

    const index = this.favoritesCache[type].findIndex((item) => item.id === id);
    if (index === -1) {
      this.logger.info(`Item not found in favorites: ${id}`, { type });
      return false;
    }

    const removed = this.favoritesCache[type].splice(index, 1)[0];
    this.persist(type);
    this.notify('remove', type, removed);
    this.logger.info(`Removed from ${type} favorites: ${id}`);
    return true;
  }

  /**
   * Toggle favorite status
   * @param {string} type - 'movies', 'food', or 'books'
   * @param {Object} item - Item to toggle
   * @returns {boolean} New favorite status (true = added, false = removed)
   */
  toggle(type, item) {
    if (this.isFavorited(item.id, type)) {
      this.remove(item.id, type);
      return false;
    } else {
      this.add(type, item);
      return true;
    }
  }

  /**
   * Clear all favorites of a type
   * @param {string} type - 'movies', 'food', or 'books'
   */
  clear(type = 'movies') {
    if (!this.isValidType(type)) {
      this.logger.warn(`Invalid type: ${type}`);
      return;
    }

    this.favoritesCache[type] = [];
    this.persist(type);
    this.notify('clear', type, null);
    this.logger.info(`Cleared ${type} favorites`);
  }

  /**
   * Clear all favorites across all types
   */
  clearAll() {
    Object.keys(this.favoritesCache).forEach((type) => {
      this.clear(type);
    });
    this.logger.info('Cleared all favorites');
  }

  /**
   * Get count of favorites for a type
   * @param {string} type - 'movies', 'food', or 'books'
   * @returns {number}
   */
  count(type = 'movies') {
    if (!this.isValidType(type)) return 0;
    return this.favoritesCache[type].length;
  }

  /**
   * Get counts for all types
   * @returns {Object} { movies: n, food: n, books: n }
   */
  counts() {
    return {
      movies: this.count('movies'),
      food: this.count('food'),
      books: this.count('books'),
    };
  }

  /**
   * Subscribe to favorites changes
   * @param {Function} listener - Callback function(action, type, item)
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    if (typeof listener !== 'function') {
      this.logger.warn('Listener must be a function');
      return () => {};
    }

    this.listeners.push(listener);
    this.logger.debug('Listener subscribed');

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
      this.logger.debug('Listener unsubscribed');
    };
  }

  /**
   * Notify all listeners of changes
   * @private
   */
  notify(action, type, item) {
    this.listeners.forEach((listener) => {
      try {
        listener(action, type, item);
      } catch (error) {
        this.logger.error('Error in listener', error);
      }
    });
  }

  /**
   * Persist favorites to storage
   * @private
   */
  persist(type) {
    try {
      const key = STORAGE_KEYS[type];
      Storage.set(key, this.favoritesCache[type]);
    } catch (error) {
      this.logger.error(`Failed to persist ${type} favorites`, error);
    }
  }

  /**
   * Validate favorite type
   * @private
   */
  isValidType(type) {
    return Object.keys(STORAGE_KEYS).includes(type);
  }

  /**
   * Export all favorites as JSON
   * @returns {Object} All favorites by type
   */
  export() {
    return {
      movies: [...this.favoritesCache.movies],
      food: [...this.favoritesCache.food],
      books: [...this.favoritesCache.books],
      exportDate: new Date().toISOString(),
      version: '2.0',
    };
  }

  /**
   * Import favorites from JSON
   * @param {Object} data - Data to import
   * @returns {boolean} Success status
   */
  import(data) {
    try {
      if (!data) {
        this.logger.warn('No data to import');
        return false;
      }

      // Handle legacy format (array of movies)
      if (Array.isArray(data)) {
        this.favoritesCache.movies = data;
        this.persist('movies');
        this.notify('import', 'movies', null);
        this.logger.info('Imported legacy movie favorites');
        return true;
      }

      // Handle new format (object with types)
      if (typeof data === 'object') {
        ['movies', 'food', 'books'].forEach((type) => {
          if (Array.isArray(data[type])) {
            this.favoritesCache[type] = data[type];
            this.persist(type);
            this.notify('import', type, null);
          }
        });
        this.logger.info('Imported favorites from file');
        return true;
      }

      this.logger.warn('Invalid data format for import');
      return false;
    } catch (error) {
      this.logger.error('Failed to import favorites', error);
      return false;
    }
  }
}

// Create singleton instance
export const favoritesService = new FavoritesService();

export default favoritesService;
