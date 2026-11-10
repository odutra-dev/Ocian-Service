import type { jsPDF } from 'jspdf';
import type { Ordem } from '#lib/types/ordem';
import { PhoneUtils } from '#lib/utils/phone.utils';

export class CupomService {
  static formatarWhatsapp(numero?: number | string | null): string {
    return PhoneUtils.formatPhoneDisplay(numero);
  }

  static formatarData(dataIso?: string | null): string {
    if (!dataIso) return 'N/A';
    const d = new Date(dataIso);
    if (isNaN(d.getTime())) return dataIso;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private static sanitizarTexto(t?: string | number | null): string {
    if (t == null) return '';
    return String(t)
      .replace(/[\u2010-\u2015]/g, '-')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
      .replace(/[^\x00-\xFF]/g, '');
  }

  static async gerarPdf(ordem: Ordem): Promise<jsPDF> {
    const { jsPDF } = await import('jspdf');

    const larguraPapel = 70;
    const margem = 4;
    const larguraUtil = larguraPapel - margem * 2;
    const centro = larguraPapel / 2;
    const margemTop = 10;
    const margemCorte = 18;

    const docCalc = new jsPDF({ unit: 'mm', format: [larguraPapel, 800] });
    docCalc.setFont('helvetica', 'bold');
    docCalc.setFontSize(9);

    const linhasTexto = docCalc.splitTextToSize(
      this.sanitizarTexto(ordem.descricao || 'Sem descrição'),
      larguraUtil - 4
    );
    const alturaCaixaTexto = Math.max(linhasTexto.length * 4.0 + 3.5, 9);

    let linhasObs: string[] = [];
    let alturaCaixaObs = 0;
    if (ordem.observacao) {
      linhasObs = docCalc.splitTextToSize(
        this.sanitizarTexto(ordem.observacao),
        larguraUtil - 4
      );
      alturaCaixaObs = Math.max(linhasObs.length * 4.0 + 3.5, 8);
    }

    let alturaReal = margemTop;
    alturaReal += 5.5;
    alturaReal += 5.0;
    alturaReal += 3.5;
    alturaReal += 3.5;
    alturaReal += 18 + 3.5;
    alturaReal += 3.5;
    alturaReal += 4.2; // Data Criação
    if (ordem.cliente) {
      alturaReal += 4.2; // Cliente
    }
    alturaReal += 4.2; // WhatsApp
    alturaReal += 3.5;
    alturaReal += 4.2; // Categoria
    alturaReal += 3.5;
    alturaReal += 2.5 + alturaCaixaTexto + 3.5; // Descrição

    if (ordem.observacao) {
      alturaReal += 2.5 + alturaCaixaObs + 3.5; // Observação
    }

    alturaReal += 3.5;
    alturaReal += 4.2; // Pagamento
    alturaReal += 5.5; // Total
    alturaReal += 3.5;
    alturaReal += 3.5;
    alturaReal += 3.5;
    alturaReal += 4 + 3.5;
    alturaReal += margemCorte * 2;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [larguraPapel, alturaReal]
    });

    let y = margemTop;

    const divisor = () => {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.setLineDashPattern([1.2, 0.8], 0);
      doc.line(margem, y, margem + larguraUtil, y);
      y += 3.5;
    };

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([1.2, 0.8], 0);
    doc.line(margem, y, margem + larguraUtil, y);
    y += 5.5;

    // Cabeçalho da loja
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Chaveiro Ocian', centro, y, { align: 'center' });
    y += 5.0;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Rua Remo Estefane, 50 - Ocian', centro, y, { align: 'center' });
    y += 3.5;

    divisor();

    // Box do Número da Ordem
    const boxY = y;
    const boxH = 18;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.roundedRect(margem, boxY, larguraUtil, boxH, 1.5, 1.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('ORDEM DE SERVICO', centro, boxY + 4.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('#' + ordem.id, centro, boxY + 14.5, { align: 'center' });
    y += boxH + 3.5;

    const linhaDupla = (rotulo: string, valor: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(rotulo, margem, y);
      doc.text(this.sanitizarTexto(valor), margem + larguraUtil, y, { align: 'right' });
      y += 4.2;
    };

    divisor();

    // Data de Criação
    linhaDupla('Data Ordem:', this.formatarData(ordem.data_criacao));
    if (ordem.cliente) {
      linhaDupla('Cliente:', ordem.cliente);
    }
    linhaDupla('WhatsApp:', this.formatarWhatsapp(ordem.whatsapp));

    divisor();

    // Categoria
    linhaDupla('Categoria:', ordem.categoria);

    divisor();

    // Descrição
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Descricao do Servico:', margem, y);
    y += 2.5;

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.15);
    doc.setLineDashPattern([], 0);
    doc.rect(margem, y, larguraUtil, alturaCaixaTexto);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(linhasTexto, margem + 2, y + 3.5);
    y += alturaCaixaTexto + 3.5;

    if (ordem.observacao) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('Observacao:', margem, y);
      y += 2.5;

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.15);
      doc.rect(margem, y, larguraUtil, alturaCaixaObs);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(linhasObs, margem + 2, y + 3.5);
      y += alturaCaixaObs + 3.5;
    }

    divisor();

    // Pagamento e Total
    linhaDupla('Pagamento:', ordem.tipo_pagamento || 'N/A');

    const valorFormatado = Number(ordem.valor || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('VALOR TOTAL:', margem, y);
    doc.setFontSize(11.5);
    doc.text('R$ ' + valorFormatado, margem + larguraUtil, y + 0.5, { align: 'right' });
    y += 5.5;

    divisor();

    // Rodapé de retirada
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('CHAVEIRO OCIAN', centro, y, { align: 'center' });
    y += 3.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Rua Remo Estefane, 50 - Ocian', centro, y, { align: 'center' });

    y += 4;
    divisor();

    return doc;
  }

  static async imprimir(ordem: Ordem): Promise<void> {
    const doc = await this.gerarPdf(ordem);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const novaAba = window.open(pdfUrl, '_blank');
    if (!novaAba) {
      doc.save(`cupom-ordem-${ordem.id}.pdf`);
    }
  }

  static async baixarPdf(ordem: Ordem): Promise<void> {
    const doc = await this.gerarPdf(ordem);
    doc.save(`cupom-ordem-${ordem.id}.pdf`);
  }
}
