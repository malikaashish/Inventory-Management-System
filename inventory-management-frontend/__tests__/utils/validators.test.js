// src/__tests__/utils/validators.test.js
import {
  isValidEmail,
  validatePassword,
  getPasswordStrength,
  isValidPhone,
  isValidUrl,
  isValidSku,
  isPositiveNumber,
  isNonNegativeInteger,
} from '../../utils/validators';

describe('Validator Functions', () => {
  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('Password@123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak password', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should check for required characters', () => {
      const result = validatePassword('password');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });
  });

  describe('getPasswordStrength', () => {
    it('should return weak for simple passwords', () => {
      expect(getPasswordStrength('abc')).toBe('weak');
    });

    it('should return medium for moderate passwords', () => {
      expect(getPasswordStrength('Password1')).toBe('medium');
    });

    it('should return strong for complex passwords', () => {
      expect(getPasswordStrength('Password@123!')).toBe('strong');
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhone('+1-555-123-4567')).toBe(true);
      expect(isValidPhone('(555) 123-4567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://test.org/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://invalid')).toBe(true); // ftp is valid
    });
  });

  describe('isValidSku', () => {
    it('should validate correct SKUs', () => {
      expect(isValidSku('ABC-123')).toBe(true);
      expect(isValidSku('PROD_001')).toBe(true);
    });

    it('should reject invalid SKUs', () => {
      expect(isValidSku('sku with spaces')).toBe(false);
      expect(isValidSku('sku@special')).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(isPositiveNumber(10)).toBe(true);
      expect(isPositiveNumber(0)).toBe(true);
      expect(isPositiveNumber('5.5')).toBe(true);
    });

    it('should return false for negative numbers', () => {
      expect(isPositiveNumber(-1)).toBe(false);
    });
  });

  describe('isNonNegativeInteger', () => {
    it('should return true for non-negative integers', () => {
      expect(isNonNegativeInteger(0)).toBe(true);
      expect(isNonNegativeInteger(100)).toBe(true);
    });

    it('should return false for negative or non-integers', () => {
      expect(isNonNegativeInteger(-1)).toBe(false);
      expect(isNonNegativeInteger(1.5)).toBe(false);
    });
  });
});