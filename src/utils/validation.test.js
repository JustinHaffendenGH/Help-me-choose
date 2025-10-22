import { describe, it, expect } from 'vitest';
import * as Validator from './validation.js';

describe('Validation Utilities', () => {
  describe('isEmpty', () => {
    it('should return true for null and undefined', () => {
      expect(Validator.isEmpty(null)).toBe(true);
      expect(Validator.isEmpty(undefined)).toBe(true);
    });

    it('should return true for empty strings', () => {
      expect(Validator.isEmpty('')).toBe(true);
      expect(Validator.isEmpty('   ')).toBe(true);
    });

    it('should return true for empty arrays', () => {
      expect(Validator.isEmpty([])).toBe(true);
    });

    it('should return true for empty objects', () => {
      expect(Validator.isEmpty({})).toBe(true);
    });

    it('should return false for non-empty values', () => {
      expect(Validator.isEmpty('text')).toBe(false);
      expect(Validator.isEmpty([1, 2, 3])).toBe(false);
      expect(Validator.isEmpty({ key: 'value' })).toBe(false);
    });
  });

  describe('isString', () => {
    it('should validate strings', () => {
      expect(Validator.isString('hello')).toBe(true);
      expect(Validator.isString('')).toBe(true);
    });

    it('should reject non-strings', () => {
      expect(Validator.isString(123)).toBe(false);
      expect(Validator.isString(null)).toBe(false);
    });

    it('should validate length constraints', () => {
      expect(Validator.isString('hello', 3, 10)).toBe(true);
      expect(Validator.isString('hi', 3, 10)).toBe(false);
      expect(Validator.isString('verylongstring', 3, 10)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('should validate numbers', () => {
      expect(Validator.isNumber(42)).toBe(true);
      expect(Validator.isNumber(3.14)).toBe(true);
      expect(Validator.isNumber(0)).toBe(true);
    });

    it('should reject non-numbers', () => {
      expect(Validator.isNumber('42')).toBe(false);
      expect(Validator.isNumber(NaN)).toBe(false);
    });

    it('should validate range constraints', () => {
      expect(Validator.isNumber(5, 0, 10)).toBe(true);
      expect(Validator.isNumber(-1, 0, 10)).toBe(false);
      expect(Validator.isNumber(15, 0, 10)).toBe(false);
    });
  });

  describe('isEmail', () => {
    it('should validate email addresses', () => {
      expect(Validator.isEmail('test@example.com')).toBe(true);
      expect(Validator.isEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(Validator.isEmail('invalid')).toBe(false);
      expect(Validator.isEmail('test@')).toBe(false);
      expect(Validator.isEmail('@example.com')).toBe(false);
    });
  });

  describe('isURL', () => {
    it('should validate URLs', () => {
      expect(Validator.isURL('https://example.com')).toBe(true);
      expect(Validator.isURL('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(Validator.isURL('not a url')).toBe(false);
      expect(Validator.isURL('example.com')).toBe(false);
    });
  });

  describe('isJSON', () => {
    it('should validate JSON strings', () => {
      expect(Validator.isJSON('{"key":"value"}')).toBe(true);
      expect(Validator.isJSON('[]')).toBe(true);
      expect(Validator.isJSON('"string"')).toBe(true);
    });

    it('should reject invalid JSON', () => {
      expect(Validator.isJSON('{invalid}')).toBe(false);
      expect(Validator.isJSON('undefined')).toBe(false);
    });
  });

  describe('validateSchema', () => {
    it('should validate object against schema', () => {
      const schema = {
        name: { type: 'string', required: true, minLength: 2 },
        age: { type: 'number', min: 0, max: 150 },
      };

      const valid = { name: 'John', age: 30 };
      const result = Validator.validateSchema(valid, schema);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should report required field errors', () => {
      const schema = {
        name: { required: true },
      };

      const invalid = {};
      const result = Validator.validateSchema(invalid, schema);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    it('should report type errors', () => {
      const schema = {
        age: { type: 'number' },
      };

      const invalid = { age: 'not a number' };
      const result = Validator.validateSchema(invalid, schema);
      expect(result.valid).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      expect(Validator.sanitizeString('<script>alert("xss")</script>')).toBe(
        'scriptalert("xss")/script'
      );
      expect(Validator.sanitizeString('javascript:void(0)')).toBe('void(0)');
    });

    it('should handle normal strings', () => {
      expect(Validator.sanitizeString('Hello World')).toBe('Hello World');
    });
  });
});
