import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { favoritesService } from './favoritesService.js';
import * as Storage from '../utils/storage.js';

describe('FavoritesService', () => {
  beforeEach(() => {
    Storage.clear();
    favoritesService.clearAll();
  });

  afterEach(() => {
    Storage.clear();
    favoritesService.clearAll();
  });

  describe('initialization', () => {
    it('should initialize with empty cache', () => {
      expect(favoritesService.count('movies')).toBe(0);
      expect(favoritesService.count('food')).toBe(0);
      expect(favoritesService.count('books')).toBe(0);
    });

    it('should load favorites from storage on init', () => {
      const testItem = { id: 1, title: 'Test Movie' };
      Storage.set('favorites-movies', [testItem]);
      
      // Create new service instance to trigger initialization
      const newService = new (favoritesService.constructor)();
      expect(newService.get('movies')).toContainEqual(testItem);
    });
  });

  describe('add', () => {
    it('should add item to favorites', () => {
      const item = { id: 1, title: 'Test Movie' };
      const result = favoritesService.add('movies', item);
      expect(result).toBe(true);
      expect(favoritesService.get('movies')).toContainEqual(item);
    });

    it('should not add duplicate items', () => {
      const item = { id: 1, title: 'Test Movie' };
      favoritesService.add('movies', item);
      const result = favoritesService.add('movies', item);
      expect(result).toBe(false);
      expect(favoritesService.count('movies')).toBe(1);
    });

    it('should require item with id', () => {
      const result = favoritesService.add('movies', { title: 'No ID' });
      expect(result).toBe(false);
    });

    it('should handle invalid types', () => {
      const item = { id: 1, title: 'Test' };
      const result = favoritesService.add('invalid', item);
      expect(result).toBe(false);
    });

    it('should persist to storage', () => {
      const item = { id: 1, title: 'Test Movie' };
      favoritesService.add('movies', item);
      const stored = Storage.get('favorites-movies', []);
      expect(stored).toContainEqual(item);
    });
  });

  describe('remove', () => {
    it('should remove item from favorites', () => {
      const item = { id: 1, title: 'Test Movie' };
      favoritesService.add('movies', item);
      const result = favoritesService.remove(1, 'movies');
      expect(result).toBe(true);
      expect(favoritesService.count('movies')).toBe(0);
    });

    it('should return false if item not found', () => {
      const result = favoritesService.remove(999, 'movies');
      expect(result).toBe(false);
    });

    it('should persist to storage', () => {
      const item = { id: 1, title: 'Test Movie' };
      favoritesService.add('movies', item);
      favoritesService.remove(1, 'movies');
      const stored = Storage.get('favorites-movies', []);
      expect(stored).toEqual([]);
    });
  });

  describe('toggle', () => {
    it('should add item when not favorited', () => {
      const item = { id: 1, title: 'Test Movie' };
      const result = favoritesService.toggle('movies', item);
      expect(result).toBe(true);
      expect(favoritesService.isFavorited(1, 'movies')).toBe(true);
    });

    it('should remove item when favorited', () => {
      const item = { id: 1, title: 'Test Movie' };
      favoritesService.add('movies', item);
      const result = favoritesService.toggle('movies', item);
      expect(result).toBe(false);
      expect(favoritesService.isFavorited(1, 'movies')).toBe(false);
    });
  });

  describe('getById', () => {
    it('should return item by id', () => {
      const item = { id: 1, title: 'Test Movie' };
      favoritesService.add('movies', item);
      const found = favoritesService.getById(1, 'movies');
      expect(found).toEqual(item);
    });

    it('should return null if not found', () => {
      const found = favoritesService.getById(999, 'movies');
      expect(found).toBeNull();
    });
  });

  describe('isFavorited', () => {
    it('should return true if favorited', () => {
      const item = { id: 1, title: 'Test Movie' };
      favoritesService.add('movies', item);
      expect(favoritesService.isFavorited(1, 'movies')).toBe(true);
    });

    it('should return false if not favorited', () => {
      expect(favoritesService.isFavorited(1, 'movies')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear favorites for a type', () => {
      favoritesService.add('movies', { id: 1, title: 'Test 1' });
      favoritesService.add('movies', { id: 2, title: 'Test 2' });
      favoritesService.add('food', { id: 1, title: 'Test Food' });

      favoritesService.clear('movies');

      expect(favoritesService.count('movies')).toBe(0);
      expect(favoritesService.count('food')).toBe(1);
    });

    it('should persist clear to storage', () => {
      favoritesService.add('movies', { id: 1, title: 'Test' });
      favoritesService.clear('movies');
      const stored = Storage.get('favorites-movies', []);
      expect(stored).toEqual([]);
    });
  });

  describe('clearAll', () => {
    it('should clear all favorites', () => {
      favoritesService.add('movies', { id: 1, title: 'Test' });
      favoritesService.add('food', { id: 1, title: 'Test' });
      favoritesService.add('books', { id: 1, title: 'Test' });

      favoritesService.clearAll();

      expect(favoritesService.count('movies')).toBe(0);
      expect(favoritesService.count('food')).toBe(0);
      expect(favoritesService.count('books')).toBe(0);
    });
  });

  describe('count and counts', () => {
    it('should return count for single type', () => {
      favoritesService.add('movies', { id: 1, title: 'Test 1' });
      favoritesService.add('movies', { id: 2, title: 'Test 2' });
      expect(favoritesService.count('movies')).toBe(2);
    });

    it('should return counts for all types', () => {
      favoritesService.add('movies', { id: 1, title: 'Test' });
      favoritesService.add('food', { id: 1, title: 'Test' });
      const counts = favoritesService.counts();
      expect(counts).toEqual({ movies: 1, food: 1, books: 0 });
    });
  });

  describe('subscribe and notify', () => {
    it('should call listener on add', (done) => {
      const listener = (action, type, item) => {
        expect(action).toBe('add');
        expect(type).toBe('movies');
        expect(item.id).toBe(1);
        done();
      };

      favoritesService.subscribe(listener);
      favoritesService.add('movies', { id: 1, title: 'Test' });
    });

    it('should call listener on remove', (done) => {
      const item = { id: 1, title: 'Test' };
      favoritesService.add('movies', item);

      const listener = (action, type) => {
        expect(action).toBe('remove');
        expect(type).toBe('movies');
        done();
      };

      favoritesService.subscribe(listener);
      favoritesService.remove(1, 'movies');
    });

    it('should return unsubscribe function', () => {
      let callCount = 0;
      const listener = () => {
        callCount++;
      };

      const unsubscribe = favoritesService.subscribe(listener);
      favoritesService.add('movies', { id: 1, title: 'Test' });
      expect(callCount).toBe(1);

      unsubscribe();
      favoritesService.add('movies', { id: 2, title: 'Test 2' });
      expect(callCount).toBe(1); // Should not increase after unsubscribe
    });
  });

  describe('export and import', () => {
    it('should export all favorites', () => {
      favoritesService.add('movies', { id: 1, title: 'Movie' });
      favoritesService.add('food', { id: 1, title: 'Food' });

      const exported = favoritesService.export();

      expect(exported.movies).toHaveLength(1);
      expect(exported.food).toHaveLength(1);
      expect(exported.books).toHaveLength(0);
      expect(exported.version).toBe('2.0');
    });

    it('should import new format', () => {
      const data = {
        movies: [{ id: 1, title: 'Movie' }],
        food: [{ id: 1, title: 'Food' }],
        books: [],
      };

      const result = favoritesService.import(data);

      expect(result).toBe(true);
      expect(favoritesService.count('movies')).toBe(1);
      expect(favoritesService.count('food')).toBe(1);
    });

    it('should import legacy format', () => {
      const data = [{ id: 1, title: 'Movie' }];
      const result = favoritesService.import(data);

      expect(result).toBe(true);
      expect(favoritesService.count('movies')).toBe(1);
    });
  });
});
