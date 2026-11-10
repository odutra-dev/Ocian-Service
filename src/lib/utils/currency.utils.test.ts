import { describe, it, expect } from 'vitest';
import { CurrencyUtils } from './currency.utils';

describe('CurrencyUtils', () => {
  describe('formatDoubleToCurrency', () => {
    it('formats 0 as Brazilian Real currency string', () => {
      const result = CurrencyUtils.formatDoubleToCurrency(0);
      expect(result.replace(/\u00a0/g, ' ')).toBe('R$ 0,00');
    });

    it('formats null or undefined as zero BRL currency string', () => {
      expect(CurrencyUtils.formatDoubleToCurrency(null).replace(/\u00a0/g, ' ')).toBe('R$ 0,00');
      expect(CurrencyUtils.formatDoubleToCurrency(undefined).replace(/\u00a0/g, ' ')).toBe('R$ 0,00');
    });

    it('formats positive decimal values with comma separator and decimals', () => {
      expect(CurrencyUtils.formatDoubleToCurrency(15.5).replace(/\u00a0/g, ' ')).toBe('R$ 15,50');
      expect(CurrencyUtils.formatDoubleToCurrency(99.99).replace(/\u00a0/g, ' ')).toBe('R$ 99,99');
    });

    it('formats thousands with thousand separator in BRL format', () => {
      expect(CurrencyUtils.formatDoubleToCurrency(1250).replace(/\u00a0/g, ' ')).toBe('R$ 1.250,00');
      expect(CurrencyUtils.formatDoubleToCurrency(1000000.5).replace(/\u00a0/g, ' ')).toBe('R$ 1.000.000,50');
    });
  });

  describe('centsToDouble', () => {
    it('converts cents string to double decimal number', () => {
      expect(CurrencyUtils.centsToDouble('100')).toBe(1);
      expect(CurrencyUtils.centsToDouble('1550')).toBe(15.5);
      expect(CurrencyUtils.centsToDouble('5')).toBe(0.05);
    });

    it('strips non-numeric characters and returns 0 for empty or invalid strings', () => {
      expect(CurrencyUtils.centsToDouble('R$ 15,50')).toBe(15.5);
      expect(CurrencyUtils.centsToDouble('')).toBe(0);
      expect(CurrencyUtils.centsToDouble('abc')).toBe(0);
    });
  });

  describe('doubleToCentsDigits', () => {
    it('converts positive double to integer cents string', () => {
      expect(CurrencyUtils.doubleToCentsDigits(15.5)).toBe('1550');
      expect(CurrencyUtils.doubleToCentsDigits(0.05)).toBe('5');
      expect(CurrencyUtils.doubleToCentsDigits(100)).toBe('10000');
    });

    it('returns empty string for zero, negative, null, undefined or NaN', () => {
      expect(CurrencyUtils.doubleToCentsDigits(0)).toBe('');
      expect(CurrencyUtils.doubleToCentsDigits(-10)).toBe('');
      expect(CurrencyUtils.doubleToCentsDigits(null)).toBe('');
      expect(CurrencyUtils.doubleToCentsDigits(undefined)).toBe('');
      expect(CurrencyUtils.doubleToCentsDigits(NaN)).toBe('');
    });
  });

  describe('formatCentsToCurrency', () => {
    it('formats cents string to Brazilian Real currency string', () => {
      expect(CurrencyUtils.formatCentsToCurrency('1550').replace(/\u00a0/g, ' ')).toBe('R$ 15,50');
      expect(CurrencyUtils.formatCentsToCurrency('0').replace(/\u00a0/g, ' ')).toBe('R$ 0,00');
      expect(CurrencyUtils.formatCentsToCurrency('').replace(/\u00a0/g, ' ')).toBe('R$ 0,00');
    });
  });
});
