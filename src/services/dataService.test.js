import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dataService } from './dataService.js';

describe('DataService', () => {
  beforeEach(() => {
    dataService.clear('all');
  });

  afterEach(() => {
    dataService.clear('all');
  });

  describe('get and caching', () => {
    it('should fetch data on first call', async () => {
      const mockData = [
        { id: 1, title: 'Movie 1' },
        { id: 2, title: 'Movie 2' },
      ];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const result = await dataService.get('movies', fetchFn);

      expect(fetchFn).toHaveBeenCalledOnce();
      expect(result).toHaveLength(2);
    });

    it('should cache data and not refetch within TTL', async () => {
      const mockData = [{ id: 1, title: 'Movie 1' }];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      await dataService.get('movies', fetchFn);
      await dataService.get('movies', fetchFn);

      expect(fetchFn).toHaveBeenCalledOnce();
    });

    it('should refetch data when cache expires', async () => {
      const mockData = [{ id: 1, title: 'Movie 1' }];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      // Set TTL to 0ms for immediate expiry
      dataService.setTTL('movies', 0);

      await dataService.get('movies', fetchFn);

      // Small delay to allow cache to expire
      await new Promise((resolve) => setTimeout(resolve, 10));

      await dataService.get('movies', fetchFn);

      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('should return cached data on fetch error', async () => {
      const mockData = [{ id: 1, title: 'Movie 1' }];
      const fetchFn = vi.fn().mockResolvedValueOnce(mockData);

      // First call succeeds
      await dataService.get('movies', fetchFn);

      // Set TTL to 0 to trigger refresh
      dataService.setTTL('movies', 0);
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Second call fails
      fetchFn.mockRejectedValueOnce(new Error('Network error'));
      const result = await dataService.get('movies', fetchFn);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Movie 1');
    });

    it('should return empty array on fetch error with no cache', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await dataService.get('movies', fetchFn);

      expect(result).toEqual([]);
    });

    it('should handle invalid type', async () => {
      const fetchFn = vi.fn();
      const result = await dataService.get('invalid', fetchFn);

      expect(fetchFn).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('normalization', () => {
    it('should normalize movie data', async () => {
      const mockData = [
        { imdbID: 'tt123', Title: 'Movie Title' },
        { imdbID: 'tt456', Title: 'Another Movie' },
      ];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const result = await dataService.get('movies', fetchFn);

      expect(result[0].id).toBe('tt123');
      expect(result[0].title).toBe('Movie Title');
      expect(result[0].type).toBe('movies');
    });

    it('should normalize food data with recipe_id', async () => {
      const mockData = [
        { recipe_id: 1, recipe_name: 'Pasta' },
        { recipe_id: 2, recipe_name: 'Pizza' },
      ];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const result = await dataService.get('food', fetchFn);

      expect(result[0].id).toBe(1);
      expect(result[0].title).toBe('Pasta');
      expect(result[0].type).toBe('food');
    });

    it('should normalize book data with isbn', async () => {
      const mockData = [
        { isbn: 'isbn123', book_title: 'Book Title' },
      ];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const result = await dataService.get('books', fetchFn);

      expect(result[0].id).toBe('isbn123');
      expect(result[0].title).toBe('Book Title');
      expect(result[0].type).toBe('books');
    });

    it('should handle data without id field', async () => {
      const mockData = [
        { name: 'Test Item' }, // No id
      ];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const result = await dataService.get('movies', fetchFn);

      expect(result[0].id).toBeDefined();
      expect(result[0].title).toBe('Test Item');
    });

    it('should normalize name to title', async () => {
      const mockData = [
        { id: 1, name: 'Food Item' },
      ];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const result = await dataService.get('food', fetchFn);

      expect(result[0].title).toBe('Food Item');
    });
  });

  describe('getById', () => {
    it('should return item by id', async () => {
      const mockData = [{ id: 1, title: 'Movie 1' }];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      await dataService.get('movies', fetchFn);
      const item = dataService.getById('movies', 1);

      expect(item).toEqual({ id: 1, title: 'Movie 1', type: 'movies' });
    });

    it('should return null if not found', async () => {
      const mockData = [{ id: 1, title: 'Movie 1' }];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      await dataService.get('movies', fetchFn);
      const item = dataService.getById('movies', 999);

      expect(item).toBeNull();
    });

    it('should handle string id matching', async () => {
      const mockData = [{ id: 'tt123', title: 'Movie' }];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      await dataService.get('movies', fetchFn);
      const item = dataService.getById('movies', 'tt123');

      expect(item).toBeDefined();
    });
  });

  describe('getAll', () => {
    it('should return copy of all items', async () => {
      const mockData = [
        { id: 1, title: 'Movie 1' },
        { id: 2, title: 'Movie 2' },
      ];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      await dataService.get('movies', fetchFn);
      const result = dataService.getAll('movies');

      expect(result).toHaveLength(2);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for invalid type', () => {
      const result = dataService.getAll('invalid');
      expect(result).toEqual([]);
    });
  });

  describe('add', () => {
    it('should add item to cache', () => {
      const item = { id: 1, title: 'New Movie' };
      const result = dataService.add('movies', item);

      expect(result).toBe(true);
      expect(dataService.getById('movies', 1)).toBeDefined();
    });

    it('should not add duplicate items', () => {
      const item = { id: 1, title: 'Movie' };
      dataService.add('movies', item);
      const result = dataService.add('movies', item);

      expect(result).toBe(false);
    });

    it('should require item with id', () => {
      const result = dataService.add('movies', { title: 'No ID' });
      expect(result).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove item from cache', async () => {
      const mockData = [{ id: 1, title: 'Movie 1' }];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      await dataService.get('movies', fetchFn);
      const result = dataService.remove('movies', 1);

      expect(result).toBe(true);
      expect(dataService.getById('movies', 1)).toBeNull();
    });

    it('should return false if not found', () => {
      const result = dataService.remove('movies', 999);
      expect(result).toBe(false);
    });
  });

  describe('deduplicate', () => {
    it('should remove duplicate items', () => {
      // Directly manipulate cache to create duplicates (since add prevents them)
      const allMovies = dataService.getAll('movies');
      const cache = dataService.cache.get('movies');
      cache.data = [
        { id: 1, title: 'Movie', type: 'movies' },
        { id: 2, title: 'Movie 2', type: 'movies' },
        { id: 1, title: 'Movie Duplicate', type: 'movies' },
      ];

      const removed = dataService.deduplicate('movies');

      expect(removed).toBe(1);
      expect(dataService.getAll('movies')).toHaveLength(2);
    });

    it('should return 0 if no duplicates', () => {
      dataService.add('movies', { id: 1, title: 'Movie 1' });
      dataService.add('movies', { id: 2, title: 'Movie 2' });

      const removed = dataService.deduplicate('movies');

      expect(removed).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear cache for specific type', async () => {
      const mockData = [{ id: 1, title: 'Movie 1' }];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      await dataService.get('movies', fetchFn);
      dataService.clear('movies');

      expect(dataService.getAll('movies')).toEqual([]);
    });

    it('should clear all caches', async () => {
      const mockData = [{ id: 1, title: 'Item' }];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      await dataService.get('movies', fetchFn);
      await dataService.get('food', fetchFn);
      await dataService.get('books', fetchFn);

      dataService.clear('all');

      expect(dataService.getAll('movies')).toEqual([]);
      expect(dataService.getAll('food')).toEqual([]);
      expect(dataService.getAll('books')).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const mockData = [{ id: 1, title: 'Item' }];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      await dataService.get('movies', fetchFn);
      
      // Check stats right after fetch when cache should be fresh
      const stats = dataService.getStats();

      expect(stats.movies.items).toBe(1);
      expect(stats.movies.lastFetch).toBeGreaterThan(0);
      expect(stats.food.items).toBe(0);
    });
  });

  describe('subscribe and notify', () => {
    it('should notify listener on add', (done) => {
      const listener = vi.fn((action, type, data) => {
        expect(action).toBe('add');
        expect(type).toBe('movies');
        done();
      });

      dataService.subscribe(listener);
      dataService.add('movies', { id: 1, title: 'Movie' });
    });

    it('should notify listener on remove', async () => {
      const mockData = [{ id: 1, title: 'Movie' }];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      await dataService.get('movies', fetchFn);

      const listener = vi.fn((action, type, id) => {
        expect(action).toBe('remove');
        expect(type).toBe('movies');
      });

      dataService.subscribe(listener);
      dataService.remove('movies', 1);

      expect(listener).toHaveBeenCalled();
    });

    it('should return unsubscribe function', () => {
      const listener = vi.fn();
      const unsubscribe = dataService.subscribe(listener);

      dataService.add('movies', { id: 1, title: 'Movie' });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      dataService.add('movies', { id: 2, title: 'Movie 2' });
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should handle invalid listener', () => {
      const unsubscribe = dataService.subscribe('not a function');
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('setTTL', () => {
    it('should set TTL for specific type', async () => {
      const mockData = [{ id: 1, title: 'Movie' }];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      dataService.setTTL('movies', 50);
      await dataService.get('movies', fetchFn);

      await new Promise((resolve) => setTimeout(resolve, 100));
      await dataService.get('movies', fetchFn);

      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('should set TTL for all types', async () => {
      const mockData = [{ id: 1, title: 'Item' }];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      dataService.setTTL('all', 50);

      await dataService.get('movies', fetchFn);
      await dataService.get('food', fetchFn);

      await new Promise((resolve) => setTimeout(resolve, 100));

      await dataService.get('movies', fetchFn);
      await dataService.get('food', fetchFn);

      expect(fetchFn).toHaveBeenCalledTimes(4);
    });
  });
});
