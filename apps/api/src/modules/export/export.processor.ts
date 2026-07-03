import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import * as crypto from 'node:crypto';
import { StorageService } from '@shared/infrastructure/storage/storage.service';
import { NotificationsService } from '@modules/notifications/application/notifications.service';
import { ExportService, FormatoExport, DadosExport } from './application/export.service';

export interface JobExport extends DadosExport { formato: FormatoExport; userId: string }

/**
 * Processa exportações fora do ciclo HTTP (RNF-DES-4): gera o arquivo,
 * guarda no MinIO e notifica o solicitante com o link de download.
 */
@Processor('export')
export class ExportProcessor extends WorkerHost {
  constructor(
    private readonly exportService: ExportService,
    private readonly storage: StorageService,
    private readonly notifications: NotificationsService,
  ) { super(); }

  async process(job: Job<JobExport>): Promise<{ chave: string }> {
    const { formato, userId, ...dados } = job.data;
    const arquivo = await this.exportService.gerar(formato, dados);
    const chave = `exportacoes/${userId}/${crypto.randomUUID()}.${arquivo.extensao}`;
    await this.storage.enviar(chave, arquivo.buffer, arquivo.mimeType);
    const url = await this.storage.urlDownload(chave, 3600);
    await this.notifications.notificar(userId, {
      tipo: 'SUCESSO', titulo: 'Exportação concluída',
      mensagem: `Seu arquivo "${dados.titulo}" está pronto para download.`, link: url,
    });
    return { chave };
  }
}
