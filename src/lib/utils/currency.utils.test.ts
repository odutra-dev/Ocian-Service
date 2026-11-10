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
});
