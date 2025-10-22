import { describe, it, expect, beforeEach } from 'vitest';
import * as Storage from './storage.js';

describe('Storage Utilities', () => {
  beforeEach(() => {
    Storage.clear();
  });

  describe('set and get', () => {
    it('should set and get a string value', () => {
      Storage.set('key1', 'value1');
      expect(Storage.get('key1')).toBe('value1');
    });

    it('should set and get a JSON object', () => {
      const obj = { name: 'Test', age: 25 };
      Storage.set('user', obj);
      expect(Storage.get('user')).toEqual(obj);
    });

    it('should set and get an array', () => {
      const arr = [1, 2, 3];
      Storage.set('numbers', arr);
      expect(Storage.get('numbers')).toEqual(arr);
    });

    it('should return default value if key not found', () => {
      expect(Storage.get('nonexistent', 'default')).toBe('default');
    });

    it('should return null if no default provided', () => {
      expect(Storage.get('nonexistent')).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a key from storage', () => {
      Storage.set('key1', 'value1');
      Storage.remove('key1');
      expect(Storage.get('key1')).toBeNull();
    });
  });

  describe('has', () => {
    it('should return true if key exists', () => {
      Storage.set('key1', 'value1');
      expect(Storage.has('key1')).toBe(true);
    });

    it('should return false if key does not exist', () => {
      expect(Storage.has('nonexistent')).toBe(false);
    });
  });

  describe('keys', () => {
    it('should return all keys in storage', () => {
      Storage.set('key1', 'value1');
      Storage.set('key2', 'value2');
      const keys = Storage.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });

    it('should return empty array for empty storage', () => {
      expect(Storage.keys()).toEqual([]);
    });
  });

  describe('getAll', () => {
    it('should return all items as object', () => {
      Storage.set('key1', 'value1');
      Storage.set('key2', 'value2');
      const all = Storage.getAll();
      expect(all).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });
  });

  describe('setMultiple and removeMultiple', () => {
    it('should set multiple items at once', () => {
      const items = { key1: 'value1', key2: 'value2', key3: 'value3' };
      Storage.setMultiple(items);
      expect(Storage.get('key1')).toBe('value1');
      expect(Storage.get('key2')).toBe('value2');
      expect(Storage.get('key3')).toBe('value3');
    });

    it('should remove multiple items at once', () => {
      Storage.set('key1', 'value1');
      Storage.set('key2', 'value2');
      Storage.set('key3', 'value3');
      Storage.removeMultiple(['key1', 'key2']);
      expect(Storage.has('key1')).toBe(false);
      expect(Storage.has('key2')).toBe(false);
      expect(Storage.has('key3')).toBe(true);
    });
  });

  describe('expiry functionality', () => {
    it('should retrieve value before expiry', () => {
      Storage.setWithExpiry('temp', 'tempValue', 1000);
      expect(Storage.getWithExpiry('temp')).toBe('tempValue');
    });

    it('should return default after expiry', async () => {
      Storage.setWithExpiry('temp', 'tempValue', 100);
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(Storage.getWithExpiry('temp', 'default')).toBe('default');
    });
  });

  describe('clear', () => {
    it('should clear all storage', () => {
      Storage.set('key1', 'value1');
      Storage.set('key2', 'value2');
      Storage.clear();
      expect(Storage.keys()).toEqual([]);
    });
  });
});
