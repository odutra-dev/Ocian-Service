import type { Ordem } from '#lib/types/ordem';
import { PhoneUtils } from '#lib/utils/phone.utils';

export class WhatsAppService {
  static formatarMensagemOrdem(ordem: Ordem): string {
    const valorFormatado = (Number(ordem.valor) || 0).toFixed(2).replace('.', ',');
    const clienteParte = ordem.cliente?.trim() ? `👤 Cliente: ${ordem.cliente.trim()}\n` : '';
    const obsParte = ordem.observacao?.trim() ? `\n\n📝 Observação:\n${ordem.observacao.trim()}` : '';

    return `*Chaveiro Ocian* 🔑
Segue o resumo da sua ordem de serviço:

━━━━━━━━━━━━━━━━━
📋 *ORDEM DE SERVIÇO Nº: ${ordem.id}*
━━━━━━━━━━━━━━━━━

${clienteParte}🏷 Categoria: *${ordem.categoria}*

✏ Descrição:
${ordem.descricao}${obsParte}

💰 Forma de pagamento: ${ordem.tipo_pagamento}
💵 Valor total: *R$ ${valorFormatado}*

Agradecemos pela confiança!`;
  }

  static enviarWhatsApp(ordem: Ordem): void {
    const mensagem = this.formatarMensagemOrdem(ordem);
    const url = PhoneUtils.buildWhatsAppUrl(ordem.whatsapp, mensagem);
    if (url) {
      window.open(url, '_blank');
    }
  }
}
