import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export type FormatoExport = 'csv' | 'xlsx' | 'pdf' | 'ods';
export interface DadosExport { titulo: string; colunas: string[]; linhas: (string | number | null)[][] }
export interface ArquivoGerado { buffer: Buffer; mimeType: string; extensao: string }

/**
 * Geração de arquivos a partir de um conjunto tabular. Reutilizável por
 * qualquer módulo (RFT-15/16). ODS ainda não é suportado nativamente —
 * cai para XLSX com aviso até adotarmos um escritor ODS.
 */
@Injectable()
export class ExportService {
  async gerar(formato: FormatoExport, dados: DadosExport): Promise<ArquivoGerado> {
    switch (formato) {
      case 'csv': return this.csv(dados);
      case 'pdf': return this.pdf(dados);
      case 'ods': // fallback consciente
      case 'xlsx':
      default: return this.xlsx(dados);
    }
  }

  private csv({ colunas, linhas }: DadosExport): ArquivoGerado {
    const esc = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const conteudo = [colunas.map(esc).join(';'), ...linhas.map((l) => l.map(esc).join(';'))].join('\n');
    return { buffer: Buffer.from('\uFEFF' + conteudo, 'utf8'), mimeType: 'text/csv', extensao: 'csv' };
  }

  private async xlsx({ titulo, colunas, linhas }: DadosExport): Promise<ArquivoGerado> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(titulo.slice(0, 31) || 'Dados');
    ws.addRow(colunas);
    ws.getRow(1).font = { bold: true };
    linhas.forEach((l) => ws.addRow(l));
    ws.columns.forEach((c: any) => { c.width = 22; });
    const buffer = Buffer.from(await wb.xlsx.writeBuffer());
    return { buffer, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extensao: 'xlsx' };
  }

  private pdf({ titulo, colunas, linhas }: DadosExport): Promise<ArquivoGerado> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve({ buffer: Buffer.concat(chunks), mimeType: 'application/pdf', extensao: 'pdf' }));
      doc.on('error', reject);

      doc.fontSize(16).text('Prefeitura de Laranjal do Jari', { align: 'left' });
      doc.fontSize(12).fillColor('#555').text(titulo).moveDown(0.5);
      doc.fillColor('#000').fontSize(9);
      doc.text(colunas.join('  |  '));
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      linhas.forEach((l) => doc.text(l.map((c) => (c == null ? '' : String(c))).join('  |  ')));
      doc.end();
    });
  }
}
