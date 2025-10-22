import { logger } from '../utils/index.js';

/**
 * DataService - Centralized data fetching and caching layer
 * Handles movies, food, and books data with TTL (time-to-live) expiry
 *
 * Features:
 * - Unified cache management across content types
 * - TTL-based cache expiry (default: 24 hours)
 * - Data normalization and deduplication
 * - Event listeners for cache updates
 * - Fallback to cached data on errors
 *
 * @class
 * @singleton
 */
class DataService {
  constructor() {
    this.cache = new Map();
    this.listeners = new Set();
    this.cache.set('movies', { data: [], lastFetch: 0, ttl: 24 * 60 * 60 * 1000 });
    this.cache.set('food', { data: [], lastFetch: 0, ttl: 24 * 60 * 60 * 1000 });
    this.cache.set('books', { data: [], lastFetch: 0, ttl: 24 * 60 * 60 * 1000 });
  }

  /**
   * Get data from cache or fetch if expired
   * @param {string} type - Content type: 'movies', 'food', or 'books'
   * @param {Function} fetchFn - Async function to fetch data if cache expired
   * @returns {Promise<Array>} Array of items
   */
  async get(type, fetchFn) {
    if (!this.isValidType(type)) {
      logger.warn(`DataService:${type}`, `Invalid type: ${type}`);
      return [];
    }

    const cached = this.cache.get(type);

    // Check if cache is still valid
    if (this.isCacheValid(cached)) {
      logger.debug(`DataService:${type}`, 'Returning cached data');
      return cached.data;
    }

    // Fetch fresh data
    try {
      logger.debug(`DataService:${type}`, 'Fetching fresh data');
      const data = await fetchFn();
      const normalized = this.normalize(data, type);

      // Update cache
      cached.data = normalized;
      cached.lastFetch = Date.now();

      logger.debug(`DataService:${type}`, `Fetched ${normalized.length} items`);
      this.notify('update', type, normalized);

      return normalized;
    } catch (error) {
      logger.error(`DataService:${type}`, `Fetch failed: ${error.message}`);
      // Return cached data even if stale
      return cached.data;
    }
  }

  /**
   * Get single item by id
   * @param {string} type - Content type
   * @param {number|string} id - Item id
   * @returns {Object|null} Item or null if not found
   */
  getById(type, id) {
    if (!this.isValidType(type)) {
      return null;
    }

    const cached = this.cache.get(type);
    return cached.data.find((item) => item.id === id || item.id == id) || null;
  }

  /**
   * Get all items of a type from cache
   * @param {string} type - Content type
   * @returns {Array} Array of items
   */
  getAll(type) {
    if (!this.isValidType(type)) {
      return [];
    }

    const cached = this.cache.get(type);
    return [...cached.data];
  }

  /**
   * Add item to cache (for UI additions)
   * @param {string} type - Content type
   * @param {Object} item - Item to add
   * @returns {boolean} Success status
   */
  add(type, item) {
    if (!this.isValidType(type) || !item || !item.id) {
      return false;
    }

    const cached = this.cache.get(type);
    const exists = cached.data.some((i) => i.id === item.id);

    if (!exists) {
      cached.data.push(item);
      this.notify('add', type, item);
      return true;
    }

    return false;
  }

  /**
   * Remove item from cache
   * @param {string} type - Content type
   * @param {number|string} id - Item id
   * @returns {boolean} Success status
   */
  remove(type, id) {
    if (!this.isValidType(type)) {
      return false;
    }

    const cached = this.cache.get(type);
    const index = cached.data.findIndex((item) => item.id === id || item.id == id);

    if (index !== -1) {
      cached.data.splice(index, 1);
      this.notify('remove', type, id);
      return true;
    }

    return false;
  }

  /**
   * Deduplicate items by id
   * @param {string} type - Content type
   * @returns {number} Number of duplicates removed
   */
  deduplicate(type) {
    if (!this.isValidType(type)) {
      return 0;
    }

    const cached = this.cache.get(type);
    const seen = new Set();
    let removed = 0;

    for (let i = cached.data.length - 1; i >= 0; i--) {
      const id = cached.data[i].id;
      if (seen.has(id)) {
        cached.data.splice(i, 1);
        removed++;
      } else {
        seen.add(id);
      }
    }

    if (removed > 0) {
      logger.info(`DataService:${type}`, `Removed ${removed} duplicates`);
      this.notify('deduplicate', type, { removed });
    }

    return removed;
  }

  /**
   * Clear cache for a type
   * @param {string} type - Content type or 'all'
   */
  clear(type) {
    if (type === 'all') {
      this.cache.forEach((cached) => {
        cached.data = [];
        cached.lastFetch = 0;
      });
      logger.info('DataService', 'Cleared all cache');
    } else if (this.isValidType(type)) {
      const cached = this.cache.get(type);
      cached.data = [];
      cached.lastFetch = 0;
      logger.info(`DataService:${type}`, 'Cleared cache');
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Stats for each type
   */
  getStats() {
    const stats = {};
    this.cache.forEach((cached, type) => {
      stats[type] = {
        items: cached.data.length,
        lastFetch: cached.lastFetch,
        isFresh: this.isCacheValid(cached),
      };
    });
    return stats;
  }

  /**
   * Subscribe to cache updates
   * @param {Function} listener - Callback(action, type, data)
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    if (typeof listener !== 'function') {
      return () => {};
    }

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of cache changes
   * @private
   */
  notify(action, type, data) {
    this.listeners.forEach((listener) => {
      try {
        listener(action, type, data);
      } catch (error) {
        logger.error('DataService', `Error in listener: ${error.message}`);
      }
    });
  }

  /**
   * Check if cache is still valid
   * @private
   */
  isCacheValid(cached) {
    return Date.now() - cached.lastFetch < cached.ttl;
  }

  /**
   * Validate content type
   * @private
   */
  isValidType(type) {
    return ['movies', 'food', 'books'].includes(type);
  }

  /**
   * Normalize data structure (ensure consistency)
   * @private
   */
  normalize(data, type) {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => {
      // Ensure id exists
      if (!item.id) {
        item.id = item.imdbID || item.recipe_id || item.isbn || Math.random();
      }

      // Ensure title/name exists
      if (!item.title && !item.name) {
        item.title = item.Title || item.recipe_name || item.book_title || 'Unknown';
      }

      // Normalize title/name to title
      if (item.name && !item.title) {
        item.title = item.name;
      }

      // Ensure type field
      item.type = type;

      return item;
    });
  }

  /**
   * Set custom TTL for cache
   * @param {string} type - Content type or 'all'
   * @param {number} ms - Time in milliseconds
   */
  setTTL(type, ms) {
    if (type === 'all') {
      this.cache.forEach((cached) => {
        cached.ttl = ms;
      });
    } else if (this.isValidType(type)) {
      this.cache.get(type).ttl = ms;
    }
  }
}

// Singleton instance
export const dataService = new DataService();
