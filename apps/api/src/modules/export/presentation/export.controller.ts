import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import type { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '@shared/decorators/current-user.decorator';
import { ExportService, FormatoExport, DadosExport } from '../application/export.service';

interface CorpoExport extends DadosExport { formato: FormatoExport }

@ApiTags('Exportação')
@ApiBearerAuth()
@Controller('export')
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    @InjectQueue('export') private readonly fila: Queue,
  ) {}

  @Post('async')
  @ApiOperation({ summary: 'Enfileira uma exportação; notifica quando pronta' })
  async assincrona(@Body() corpo: CorpoExport, @CurrentUser() u: AuthenticatedUser) {
    const job = await this.fila.add('gerar', { ...corpo, userId: u.id });
    return { jobId: job.id, status: 'enfileirado' };
  }

  @Post()
  @ApiOperation({ summary: 'Gera e baixa imediatamente (conjuntos pequenos)' })
  async sincrona(@Body() corpo: CorpoExport, @Res() res: Response) {
    const { buffer, mimeType, extensao } = await this.exportService.gerar(corpo.formato, corpo);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="export.${extensao}"`);
    res.send(buffer);
  }
}
