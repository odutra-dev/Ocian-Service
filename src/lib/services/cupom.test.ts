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

  describe('gerarPdf', () => {
    it('generates a jsPDF instance configured for 70mm thermal paper', async () => {
      const doc = await CupomService.gerarPdf({
        id: 10,
        data_criacao: '2026-11-10T15:00:00Z',
        cliente: 'Cliente Teste',
        whatsapp: '13991234567',
        categoria: 'Serviço',
        descricao: 'Abertura de porta residencial',
        tipo_pagamento: 'Dinheiro',
        valor: 80
      });

      expect(doc).toBeDefined();
      expect(doc.internal.pageSize.getWidth()).toBe(70);
    });
  });
});
