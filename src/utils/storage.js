/**
 * Storage Utilities Module
 * Provides a unified interface for localStorage operations with error handling
 */

class StorageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
function isAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get value from localStorage
 * @param {string} key - Storage key
 * @param {*} [defaultValue=null] - Default value if key not found
 * @returns {*} Stored value or default
 * @throws {StorageError} If parse fails
 */
export function get(key, defaultValue = null) {
  if (!isAvailable()) {
    console.warn('localStorage is not available');
    return defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    
    try {
      return JSON.parse(item);
    } catch (e) {
      // If JSON parse fails, return the raw string
      return item;
    }
  } catch (error) {
    console.error(`Failed to get item from storage: ${key}`, error);
    throw new StorageError(`Failed to retrieve key: ${key}`);
  }
}

/**
 * Set value in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @throws {StorageError} If operation fails
 */
export function set(key, value) {
  if (!isAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }
  
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new StorageError(`Storage quota exceeded for key: ${key}`);
    }
    console.error(`Failed to set item in storage: ${key}`, error);
    throw new StorageError(`Failed to store key: ${key}`);
  }
}

/**
 * Remove value from localStorage
 * @param {string} key - Storage key
 */
export function remove(key) {
  if (!isAvailable()) {
    console.warn('localStorage is not available');
    return;
  }
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove item from storage: ${key}`, error);
  }
}

/**
 * Clear all localStorage
 */
export function clear() {
  if (!isAvailable()) {
    console.warn('localStorage is not available');
    return;
  }
  
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear storage', error);
  }
}

/**
 * Check if key exists in storage
 * @param {string} key - Storage key
 * @returns {boolean}
 */
export function has(key) {
  if (!isAvailable()) {
    return false;
  }
  
  return localStorage.getItem(key) !== null;
}

/**
 * Get all keys in storage
 * @returns {string[]} Array of keys
 */
export function keys() {
  if (!isAvailable()) {
    return [];
  }
  
  return Object.keys(localStorage);
}

/**
 * Get all items in storage
 * @returns {Object} Object with all stored items
 */
export function getAll() {
  if (!isAvailable()) {
    return {};
  }
  
  const result = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    result[key] = get(key);
  }
  return result;
}

/**
 * Set multiple items at once
 * @param {Object} items - Key-value pairs to store
 */
export function setMultiple(items) {
  Object.entries(items).forEach(([key, value]) => {
    set(key, value);
  });
}

/**
 * Remove multiple items at once
 * @param {string[]} keys - Keys to remove
 */
export function removeMultiple(keys) {
  keys.forEach(key => remove(key));
}

/**
 * Get item with automatic expiration
 * @param {string} key - Storage key
 * @param {*} [defaultValue=null] - Default value
 * @returns {*} Value or null if expired
 */
export function getWithExpiry(key, defaultValue = null) {
  const item = get(key);
  
  if (!item || !item.expiry) {
    return defaultValue;
  }
  
  if (Date.now() > item.expiry) {
    remove(key);
    return defaultValue;
  }
  
  return item.value;
}

/**
 * Set item with expiration
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @param {number} expiryMs - Expiry time in milliseconds
 */
export function setWithExpiry(key, value, expiryMs) {
  const item = {
    value,
    expiry: Date.now() + expiryMs,
  };
  set(key, item);
}

export const Storage = {
  get,
  set,
  remove,
  clear,
  has,
  keys,
  getAll,
  setMultiple,
  removeMultiple,
  getWithExpiry,
  setWithExpiry,
  isAvailable,
};

export default Storage;
