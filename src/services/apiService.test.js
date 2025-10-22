import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiService } from './apiService.js';

describe('APIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetch', () => {
    it('should fetch JSON data successfully', async () => {
      const mockData = { id: 1, title: 'Test' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      const result = await apiService.fetch('https://api.example.com/data');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledOnce();
    });

    it('should throw on HTTP error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(apiService.fetch('https://api.example.com/missing')).rejects.toThrow(
        'HTTP 404'
      );
    });

    it('should retry on network error', async () => {
      const mockData = { success: true };
      global.fetch
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve(mockData),
        });

      apiService.setRetryDelay(10); // Speed up test
      const result = await apiService.fetch('https://api.example.com/data');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on 5xx error', async () => {
      const mockData = { success: true };
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        })
        .mockResolvedValueOnce({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve(mockData),
        });

      apiService.setRetryDelay(10);
      const result = await apiService.fetch('https://api.example.com/data');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should give up after max retries', async () => {
      global.fetch.mockRejectedValue(new TypeError('Network error'));

      apiService.setMaxRetries(2);
      apiService.setRetryDelay(10);

      await expect(apiService.fetch('https://api.example.com/data')).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle fetch timeout', async () => {
      global.fetch.mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 100);
          })
      );

      apiService.setTimeout(50);
      apiService.setMaxRetries(1);
      apiService.setRetryDelay(10);

      await expect(apiService.fetch('https://api.example.com/data')).rejects.toThrow();
    });

    it('should parse text responses', async () => {
      const mockText = 'Hello World';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: () => Promise.resolve(mockText),
      });

      const result = await apiService.fetch('https://api.example.com/text');

      expect(result).toBe(mockText);
    });

    it('should parse blob responses', async () => {
      const mockBlob = new Blob(['test']);
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        blob: () => Promise.resolve(mockBlob),
      });

      const result = await apiService.fetch('https://api.example.com/image');

      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('get', () => {
    it('should fetch with GET method', async () => {
      const mockData = { id: 1 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      const result = await apiService.get('https://api.example.com/data', {
        filter: 'active',
      });

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('filter=active'),
        expect.any(Object)
      );
    });

    it('should handle null/undefined query params', async () => {
      const mockData = {};
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      await apiService.get('https://api.example.com/data', {
        filter: 'active',
        sort: null,
        page: undefined,
      });

      const callUrl = global.fetch.mock.calls[0][0];
      expect(callUrl).toContain('filter=active');
      expect(callUrl).not.toContain('sort');
      expect(callUrl).not.toContain('page');
    });
  });

  describe('post', () => {
    it('should send POST request with JSON body', async () => {
      const mockResponse = { id: 1, created: true };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.post('https://api.example.com/items', {
        title: 'New Item',
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/items',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ title: 'New Item' }),
        })
      );
    });
  });

  describe('put', () => {
    it('should send PUT request with JSON body', async () => {
      const mockResponse = { id: 1, updated: true };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiService.put('https://api.example.com/items/1', {
        title: 'Updated Item',
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/items/1',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });

  describe('delete', () => {
    it('should send DELETE request', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ success: true }),
      });

      await apiService.delete('https://api.example.com/items/1');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/items/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('rate limiting', () => {
    it('should enforce rate limit delay between requests', async () => {
      const mockData = { id: 1 };
      global.fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      apiService.setRateLimitDelay(50);

      const start = Date.now();
      await apiService.fetch('https://api.example.com/1');
      await apiService.fetch('https://api.example.com/2');
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(50);
    });
  });

  describe('concurrency', () => {
    it('should queue requests when exceeding max concurrent', async () => {
      const mockData = { id: 1 };
      global.fetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      apiService.setMaxConcurrent(1);
      apiService.setRateLimitDelay(0);

      const promises = [
        apiService.fetch('https://api.example.com/1'),
        apiService.fetch('https://api.example.com/2'),
      ];

      const results = await Promise.all(promises);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(2);
    });
  });

  describe('statistics', () => {
    it('should report queue size', async () => {
      global.fetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: () => Promise.resolve({}),
              });
            }, 100);
          })
      );

      apiService.setMaxConcurrent(1);

      const promise = apiService.fetch('https://api.example.com/1');
      // May be queued depending on timing
      const queueSize = apiService.getQueueSize();
      expect(typeof queueSize).toBe('number');

      await promise;
    });

    it('should report active requests', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({}),
      });

      const active = apiService.getActiveRequests();
      expect(typeof active).toBe('number');
    });
  });

  describe('configuration', () => {
    it('should allow setting timeout', () => {
      apiService.setTimeout(5000);
      expect(apiService.timeout).toBe(5000);
    });

    it('should allow setting max retries', () => {
      apiService.setMaxRetries(5);
      expect(apiService.maxRetries).toBe(5);
    });

    it('should allow setting retry delay', () => {
      apiService.setRetryDelay(2000);
      expect(apiService.retryDelay).toBe(2000);
    });

    it('should allow setting rate limit', () => {
      apiService.setRateLimitDelay(200);
      expect(apiService.rateLimitDelay).toBe(200);
    });

    it('should allow setting max concurrent', () => {
      apiService.setMaxConcurrent(10);
      expect(apiService.maxConcurrent).toBe(10);
    });
  });
});
