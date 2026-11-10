export type CategoriaOrdem = 'Carcaça' | 'Bateria' | 'Serviço';

export type TipoPagamento = 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro' | 'A pagar';

export interface Ordem {
  id: number;
  data_criacao: string;
  cliente?: string | null;
  whatsapp: number | string;
  categoria: CategoriaOrdem;
  descricao: string;
  imagens?: string[] | string | null;
  observacao?: string | null;
  tipo_pagamento: TipoPagamento;
  valor: number;
}

export const CATEGORIAS_ORDEM: CategoriaOrdem[] = ['Carcaça', 'Bateria', 'Serviço'];

export const FORMAS_PAGAMENTO: TipoPagamento[] = [
  'Pix',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Dinheiro',
  'A pagar'
];

export function parseImagens(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter((url) => url.startsWith('http'));
  }
  if (typeof raw === 'string') {
    // 1. Tenta extrair todas as URLs http(s)
    const matches = raw.match(/https?:\/\/[^\s"',\]\}]+/g);
    if (matches && matches.length > 0) {
      return matches.map((url) => url.trim());
    }
    // 2. Fallback para JSON parse
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter((url) => url.startsWith('http'));
      }
    } catch {}
  }
  return [];
}
