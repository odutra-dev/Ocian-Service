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

  describe('formatPhoneDisplay', () => {
    it('formats 11-digit Brazilian mobile phone with DDD and hyphen', () => {
      expect(PhoneUtils.formatPhoneDisplay('13991234567')).toBe('(13) 99123-4567');
      expect(PhoneUtils.formatPhoneDisplay(13991234567)).toBe('(13) 99123-4567');
    });

    it('formats Brazilian phone containing DDI 55 prefix', () => {
      expect(PhoneUtils.formatPhoneDisplay('5513991234567')).toBe('+55 (13) 99123-4567');
      expect(PhoneUtils.formatPhoneDisplay('551334567890')).toBe('+55 (13) 3456-7890');
    });

    it('returns empty string for null, undefined, 0 or empty inputs', () => {
      expect(PhoneUtils.formatPhoneDisplay(null)).toBe('');
      expect(PhoneUtils.formatPhoneDisplay(undefined)).toBe('');
      expect(PhoneUtils.formatPhoneDisplay('')).toBe('');
      expect(PhoneUtils.formatPhoneDisplay(0)).toBe('');
    });
  });

  describe('parseStoredPhone', () => {
    it('parses phone starting with DDI 55 into ddi and national number', () => {
      const parsed = PhoneUtils.parseStoredPhone('5513991234567');
      expect(parsed).toEqual({ ddi: '55', phone: '13991234567' });
    });

    it('defaults to DDI 55 when phone is a raw Brazilian national number', () => {
      const parsed = PhoneUtils.parseStoredPhone('13991234567');
      expect(parsed).toEqual({ ddi: '55', phone: '13991234567' });
    });
  });

  describe('formatInputForDdi', () => {
    it('formats Brazilian phone progressively with parentheses and hyphen while typing', () => {
      expect(PhoneUtils.formatInputForDdi('55', '13')).toBe('(13');
      expect(PhoneUtils.formatInputForDdi('55', '13991')).toBe('(13) 991');
      expect(PhoneUtils.formatInputForDdi('55', '1334567890')).toBe('(13) 3456-7890');
      expect(PhoneUtils.formatInputForDdi('55', '13991234567')).toBe('(13) 99123-4567');
    });
  });

  describe('getValidationError', () => {
    it('returns error message for empty, invalid DDD or incomplete Brazilian phone', () => {
      expect(PhoneUtils.getValidationError('55', '')).toBe('WhatsApp é obrigatório');
      expect(PhoneUtils.getValidationError('55', '1')).toBe('Informe o DDD (2 dígitos)');
      expect(PhoneUtils.getValidationError('55', '00991234567')).toContain('não é válido no Brasil');
      expect(PhoneUtils.getValidationError('55', '13991')).toBe('Número incompleto (DDD + 8 ou 9 dígitos)');
    });

    it('returns null for valid Brazilian phone numbers', () => {
      expect(PhoneUtils.getValidationError('55', '13991234567')).toBeNull();
      expect(PhoneUtils.getValidationError('55', '1334567890')).toBeNull();
    });
  });

  describe('combineDdiAndNumber', () => {
    it('returns national digits for Brazil (DDI 55) and prepends DDI for foreign countries', () => {
      expect(PhoneUtils.combineDdiAndNumber('55', '13991234567')).toBe(13991234567);
      expect(PhoneUtils.combineDdiAndNumber('1', '2025550123')).toBe(12025550123);
      expect(PhoneUtils.combineDdiAndNumber('55', '')).toBe(0);
    });
  });

  describe('helpers', () => {
    it('returns expected placeholder and maximum length per country DDI', () => {
      expect(PhoneUtils.getPlaceholderForDdi('55')).toBe('(13) 99999-9999');
      expect(PhoneUtils.getMaxLengthForDdi('55')).toBe(11);
      expect(PhoneUtils.getPlaceholderForDdi('1')).toBe('(202) 555-0123');
      expect(PhoneUtils.getMaxLengthForDdi('1')).toBe(10);
    });
  });
});
