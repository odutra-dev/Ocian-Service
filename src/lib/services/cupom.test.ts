import { describe, it, expect } from 'vitest';
import { CupomService } from './cupom';

describe('CupomService', () => {
  describe('formatarData', () => {
    it('formats ISO timestamp to Brazilian locale date string', () => {
      const iso = '2026-11-10T14:30:00.000Z';
      const formatted = CupomService.formatarData(iso);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it('returns N/A when date string is null, undefined or empty', () => {
      expect(CupomService.formatarData(null)).toBe('N/A');
      expect(CupomService.formatarData(undefined)).toBe('N/A');
      expect(CupomService.formatarData('')).toBe('N/A');
    });
  });
});
