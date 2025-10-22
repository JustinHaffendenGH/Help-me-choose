/**
 * Validation Utilities Module
 * Provides common data validation functions
 */

/**
 * Check if value is empty
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if value is a valid string
 * @param {*} value - Value to check
 * @param {number} [minLength=0] - Minimum length
 * @param {number} [maxLength=Infinity] - Maximum length
 * @returns {boolean}
 */
export function isString(value, minLength = 0, maxLength = Infinity) {
  if (typeof value !== 'string') return false;
  const len = value.length;
  return len >= minLength && len <= maxLength;
}

/**
 * Check if value is a valid number
 * @param {*} value - Value to check
 * @param {number} [min] - Minimum value
 * @param {number} [max] - Maximum value
 * @returns {boolean}
 */
export function isNumber(value, min = -Infinity, max = Infinity) {
  if (typeof value !== 'number' || isNaN(value)) return false;
  return value >= min && value <= max;
}

/**
 * Check if value is a valid integer
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isInteger(value) {
  return Number.isInteger(value);
}

/**
 * Check if value is a valid boolean
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isBoolean(value) {
  return typeof value === 'boolean';
}

/**
 * Check if value is a valid array
 * @param {*} value - Value to check
 * @param {number} [minLength] - Minimum length
 * @param {number} [maxLength] - Maximum length
 * @returns {boolean}
 */
export function isArray(value, minLength = 0, maxLength = Infinity) {
  if (!Array.isArray(value)) return false;
  const len = value.length;
  return len >= minLength && len <= maxLength;
}

/**
 * Check if value is a valid object
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Check if value is a valid email
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isEmail(value) {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Check if value is a valid URL
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isURL(value) {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if value is a valid date
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isDate(value) {
  if (!(value instanceof Date)) return false;
  return !isNaN(value.getTime());
}

/**
 * Check if value is a valid hex color
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isHexColor(value) {
  if (!isString(value)) return false;
  return /^#[0-9A-F]{6}$/i.test(value);
}

/**
 * Check if value is a valid JSON string
 * @param {*} value - Value to check
 * @returns {boolean}
 */
export function isJSON(value) {
  if (!isString(value)) return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate object against schema
 * @param {Object} data - Object to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateSchema(data, schema) {
  const errors = [];
  
  Object.entries(schema).forEach(([key, rules]) => {
    const value = data[key];
    
    // Check required
    if (rules.required && isEmpty(value)) {
      errors.push(`${key} is required`);
      return;
    }
    
    // Skip further validation if empty and not required
    if (isEmpty(value)) return;
    
    // Type checking
    if (rules.type) {
      const isValid = {
        string: () => isString(value),
        number: () => isNumber(value),
        integer: () => isInteger(value),
        boolean: () => isBoolean(value),
        array: () => isArray(value),
        object: () => isObject(value),
        email: () => isEmail(value),
        url: () => isURL(value),
        date: () => isDate(value),
        hexColor: () => isHexColor(value),
      }[rules.type];
      
      if (isValid && !isValid()) {
        errors.push(`${key} must be a valid ${rules.type}`);
      }
    }
    
    // Length validation (for strings and arrays)
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      errors.push(`${key} must be at least ${rules.minLength} characters`);
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      errors.push(`${key} must be at most ${rules.maxLength} characters`);
    }
    
    // Value range (for numbers)
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`${key} must be at least ${rules.min}`);
    }
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`${key} must be at most ${rules.max}`);
    }
    
    // Custom validator
    if (rules.validate && !rules.validate(value)) {
      errors.push(rules.message || `${key} is invalid`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string by removing potentially dangerous characters
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(str) {
  if (!isString(str)) return '';
  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

/**
 * Sanitize HTML string
 * @param {string} html - HTML to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  if (!isString(html)) return '';
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

export const Validator = {
  isEmpty,
  isString,
  isNumber,
  isInteger,
  isBoolean,
  isArray,
  isObject,
  isEmail,
  isURL,
  isDate,
  isHexColor,
  isJSON,
  validateSchema,
  sanitizeString,
  sanitizeHTML,
};

export default Validator;
