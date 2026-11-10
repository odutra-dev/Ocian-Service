import { describe, it, expect } from 'vitest';
import { WhatsAppService } from './whatsapp';
import type { Ordem } from '#lib/types/ordem';

describe('WhatsAppService', () => {
  const mockOrdem: Ordem = {
    id: 42,
    data_criacao: '2026-11-10T12:00:00Z',
    cliente: 'Gabriel Dutra',
    whatsapp: '13991234567',
    categoria: 'Carcaça',
    descricao: 'Cópia de chave automotiva',
    observacao: 'Cliente aguarda na loja',
    tipo_pagamento: 'Pix',
    valor: 150
  };

  it('generates a complete WhatsApp message with order header, category, and total value', () => {
    const msg = WhatsAppService.formatarMensagemOrdem(mockOrdem);
    expect(msg).toContain('*Chaveiro Ocian* 🔑');
    expect(msg).toContain('ORDEM DE SERVIÇO Nº: 42');
    expect(msg).toContain('👤 Cliente: Gabriel Dutra');
    expect(msg).toContain('🏷 Categoria: *Carcaça*');
    expect(msg).toContain('✏ Descrição:\nCópia de chave automotiva');
    expect(msg).toContain('📝 Observação:\nCliente aguarda na loja');
    expect(msg).toContain('💰 Forma de pagamento: Pix');
    expect(msg).toContain('💵 Valor total: *R$ 150,00*');
  });
});
