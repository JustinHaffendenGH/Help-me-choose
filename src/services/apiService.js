import { logger } from '../utils/index.js';

/**
 * APIService - Centralized API interaction layer
 * Handles all HTTP requests with consistent error handling, retry logic, and rate limiting
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Request rate limiting and throttling
 * - Consistent error handling and logging
 * - Request timeout management
 * - Response validation and caching headers
 *
 * @class
 * @singleton
 */
class APIService {
  constructor() {
    this.timeout = 10000; // 10 seconds
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.requestQueue = [];
    this.activeRequests = 0;
    this.maxConcurrent = 5;
    this.rateLimitDelay = 100; // ms between requests
    this.lastRequestTime = 0;
  }

  /**
   * Fetch data from URL with error handling and retries
   * @param {string} url - URL to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} Parsed response data
   */
  async fetch(url, options = {}) {
    const request = { url, options };

    // Queue request if at capacity
    if (this.activeRequests >= this.maxConcurrent) {
      await this.enqueueRequest(request);
    } else {
      return this.executeRequest(request);
    }
  }

  /**
   * Fetch with automatic retry logic
   * @private
   */
  async executeRequest({ url, options }, attempt = 1) {
    try {
      // Rate limiting: ensure delay between requests
      await this.enforceRateLimit();

      logger.debug('APIService', `Fetching ${url} (attempt ${attempt})`);

      this.activeRequests++;

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await this.parseResponse(response);
        logger.debug('APIService', `Successfully fetched ${url}`);

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      // Determine if retry should happen
      const isRetryable = this.isRetryableError(error);
      const canRetry = attempt < this.maxRetries;

      if (isRetryable && canRetry) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        logger.warn(
          'APIService',
          `Retrying ${url} in ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeRequest({ url, options }, attempt + 1);
      }

      logger.error('APIService', `Failed to fetch ${url}: ${error.message}`);
      throw error;
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  /**
   * Queue request for later execution
   * @private
   */
  async enqueueRequest(request) {
    return new Promise((resolve) => {
      this.requestQueue.push({ ...request, resolve });
    });
  }

  /**
   * Process queued requests
   * @private
   */
  async processQueue() {
    while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const { url, options, resolve } = this.requestQueue.shift();
      const result = await this.executeRequest({ url, options });
      resolve(result);
    }
  }

  /**
   * Enforce rate limiting between requests
   * @private
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise((resolve) => {
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest);
      });
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Parse response based on content type
   * @private
   */
  async parseResponse(response) {
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    if (contentType && contentType.includes('text/')) {
      return response.text();
    }

    return response.blob();
  }

  /**
   * Determine if error is retryable
   * @private
   */
  isRetryableError(error) {
    // Network errors, timeouts are retryable
    if (error instanceof TypeError) {
      return true;
    }

    // 5xx errors are retryable
    if (error.message.includes('HTTP 5')) {
      return true;
    }

    // Timeout errors are retryable
    if (error.name === 'AbortError') {
      return true;
    }

    return false;
  }

  /**
   * Fetch with JSON request body
   * @param {string} url - URL to fetch
   * @param {Object} data - Data to send as JSON
   * @param {Object} options - Additional options
   * @returns {Promise<any>} Response data
   */
  async post(url, data, options = {}) {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request helper
   */
  async put(url, data, options = {}) {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request helper
   */
  async delete(url, options = {}) {
    return this.fetch(url, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Fetch with query parameters
   * @param {string} baseUrl - Base URL
   * @param {Object} params - Query parameters
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} Response data
   */
  async get(baseUrl, params = {}, options = {}) {
    const url = this.buildUrl(baseUrl, params);
    return this.fetch(url, { ...options, method: 'GET' });
  }

  /**
   * Build URL with query parameters
   * @private
   */
  buildUrl(baseUrl, params) {
    const url = new URL(baseUrl);

    Object.entries(params).forEach(([key, value]) => {
      if (value != null) {
        url.searchParams.append(key, value);
      }
    });

    return url.toString();
  }

  /**
   * Set request timeout
   * @param {number} ms - Timeout in milliseconds
   */
  setTimeout(ms) {
    this.timeout = ms;
  }

  /**
   * Set max retries
   * @param {number} count - Number of retries
   */
  setMaxRetries(count) {
    this.maxRetries = count;
  }

  /**
   * Set retry delay
   * @param {number} ms - Delay in milliseconds
   */
  setRetryDelay(ms) {
    this.retryDelay = ms;
  }

  /**
   * Set rate limit delay
   * @param {number} ms - Delay between requests
   */
  setRateLimitDelay(ms) {
    this.rateLimitDelay = ms;
  }

  /**
   * Set max concurrent requests
   * @param {number} count - Max concurrent requests
   */
  setMaxConcurrent(count) {
    this.maxConcurrent = count;
  }

  /**
   * Get current queue size
   * @returns {number} Number of queued requests
   */
  getQueueSize() {
    return this.requestQueue.length;
  }

  /**
   * Get active request count
   * @returns {number} Number of active requests
   */
  getActiveRequests() {
    return this.activeRequests;
  }

  /**
   * Check if service is idle
   * @returns {boolean} True if no active or queued requests
   */
  isIdle() {
    return this.activeRequests === 0 && this.requestQueue.length === 0;
  }
}

// Singleton instance
export const apiService = new APIService();
