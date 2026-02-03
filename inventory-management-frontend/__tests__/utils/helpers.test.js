// src/__tests__/utils/helpers.test.js
import {
  formatCurrency,
  formatNumber,
  formatDate,
  truncate,
  isEmpty,
  getInitials,
  calculatePercentage,
} from '../../utils/helpers';

describe('Helper Functions', () => {
  describe('formatCurrency', () => {
    it('should format number as USD currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('should handle null/undefined', () => {
      expect(formatCurrency(null)).toBe('$0.00');
      expect(formatCurrency(undefined)).toBe('$0.00');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-100)).toBe('-$100.00');
    });
  });

  describe('formatNumber', () => {
    it('should format number with commas', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle null/undefined', () => {
      expect(formatNumber(null)).toBe('0');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00');
      expect(formatDate(date)).toMatch(/Jan 15, 2024/);
    });

    it('should handle null', () => {
      expect(formatDate(null)).toBe('-');
    });

    it('should handle ISO string', () => {
      expect(formatDate('2024-01-15T10:30:00')).toMatch(/Jan 15, 2024/);
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      expect(truncate(text, 20)).toBe('This is a very long ...');
    });

    it('should not truncate short text', () => {
      expect(truncate('Short', 20)).toBe('Short');
    });

    it('should handle null/empty', () => {
      expect(truncate(null)).toBe('');
      expect(truncate('')).toBe('');
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty object', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('should return false for non-empty object', () => {
      expect(isEmpty({ key: 'value' })).toBe(false);
    });

    it('should return true for null/undefined', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
    });
  });

  describe('getInitials', () => {
    it('should return initials', () => {
      expect(getInitials('John', 'Doe')).toBe('JD');
    });

    it('should handle single name', () => {
      expect(getInitials('John', '')).toBe('J');
    });

    it('should handle null values', () => {
      expect(getInitials(null, null)).toBe('');
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(25, 100)).toBe(25);
      expect(calculatePercentage(1, 3)).toBe(33);
    });

    it('should handle zero total', () => {
      expect(calculatePercentage(10, 0)).toBe(0);
    });
  });
});