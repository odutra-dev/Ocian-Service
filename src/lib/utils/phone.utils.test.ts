import { describe, it, expect } from 'vitest';
import { PhoneUtils } from './phone.utils';

describe('PhoneUtils', () => {
  describe('isBrazilianFormat', () => {
    it('returns true for valid 11-digit mobile phone with valid DDD and digit 9', () => {
      expect(PhoneUtils.isBrazilianFormat('13991234567')).toBe(true);
      expect(PhoneUtils.isBrazilianFormat('11987654321')).toBe(true);
    });
  });
});
