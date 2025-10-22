/**
 * Logger Utility Module
 * Provides consistent logging throughout the application
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor(namespace = 'App', level = LOG_LEVELS.INFO) {
    this.namespace = namespace;
    this.level = level;
    this.isDev = process.env.NODE_ENV !== 'production';
  }

  /**
   * Format log message with namespace
   * @param {string} message - Log message
   * @param {*} data - Additional data
   * @returns {string} Formatted message
   */
  format(message, data) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.namespace}]`;
    return data ? `${prefix} ${message}` : prefix + ' ' + message;
  }

  /**
   * Log debug message
   * @param {string} message - Log message
   * @param {*} [data] - Additional data
   */
  debug(message, data) {
    if (this.level <= LOG_LEVELS.DEBUG && this.isDev) {
      console.log(`%c${this.format(message, data)}`, 'color: #888', data);
    }
  }

  /**
   * Log info message
   * @param {string} message - Log message
   * @param {*} [data] - Additional data
   */
  info(message, data) {
    if (this.level <= LOG_LEVELS.INFO) {
      console.info(`%c${this.format(message, data)}`, 'color: #0066cc', data);
    }
  }

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {*} [data] - Additional data
   */
  warn(message, data) {
    if (this.level <= LOG_LEVELS.WARN) {
      console.warn(`%c${this.format(message, data)}`, 'color: #ff9900', data);
    }
  }

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {*} [error] - Error object or data
   */
  error(message, error) {
    if (this.level <= LOG_LEVELS.ERROR) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`%c${this.format(message, error)}`, 'color: #ff0000', error);
    }
  }

  /**
   * Log and return value (for debugging chains)
   * @param {*} value - Value to log
   * @param {string} [label] - Optional label
   * @returns {*} The same value
   */
  trace(value, label = 'Value') {
    this.debug(`${label}:`, value);
    return value;
  }

  /**
   * Measure performance of a function
   * @param {string} name - Performance mark name
   * @param {Function} fn - Function to measure
   * @returns {*} Function result
   */
  measure(name, fn) {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.debug(`${name} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`${name} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  /**
   * Async version of measure
   * @param {string} name - Performance mark name
   * @param {Function} fn - Async function to measure
   * @returns {Promise<*>} Function result
   */
  async measureAsync(name, fn) {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.debug(`${name} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`${name} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  /**
   * Create a child logger with extended namespace
   * @param {string} childNamespace - Child namespace
   * @returns {Logger} New logger instance
   */
  child(childNamespace) {
    return new Logger(`${this.namespace}:${childNamespace}`, this.level);
  }
}

// Global logger instance
export const logger = new Logger('App');

/**
 * Create a new logger instance
 * @param {string} namespace - Logger namespace
 * @param {number} [level] - Log level
 * @returns {Logger}
 */
export function createLogger(namespace, level = LOG_LEVELS.INFO) {
  return new Logger(namespace, level);
}

export { Logger, LOG_LEVELS };

export default logger;
