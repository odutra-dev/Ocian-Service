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
  });
});
