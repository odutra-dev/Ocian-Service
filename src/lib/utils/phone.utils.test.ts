import { describe, it, expect } from 'vitest';
import { PhoneUtils } from './phone.utils';

describe('PhoneUtils', () => {
  describe('isBrazilianFormat', () => {
    it('returns true for valid 11-digit mobile phone with valid DDD and digit 9', () => {
      expect(PhoneUtils.isBrazilianFormat('13991234567')).toBe(true);
      expect(PhoneUtils.isBrazilianFormat('11987654321')).toBe(true);
    });

    it('returns true for valid 10-digit landline with valid DDD and prefix 2 to 5', () => {
      expect(PhoneUtils.isBrazilianFormat('1334567890')).toBe(true);
      expect(PhoneUtils.isBrazilianFormat('1122334455')).toBe(true);
    });

    it('returns false for invalid DDD or invalid digit length', () => {
      expect(PhoneUtils.isBrazilianFormat('00991234567')).toBe(false); // DDD 00 doesn't exist
      expect(PhoneUtils.isBrazilianFormat('1399123')).toBe(false); // too short
      expect(PhoneUtils.isBrazilianFormat('1399123456789')).toBe(false); // too long
    });
  });
});
