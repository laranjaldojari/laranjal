import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AcaoPermissao } from '@prisma/client';
import { RequirePermission } from '@shared/decorators/permissions.decorator';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { Audit, AuditInterceptor } from '@shared/interceptors/audit.interceptor';
import { ProcessosService } from '../application/services/processos.service';
import { CreateProcessoDto, HomologarDto } from '../application/dtos/compras.dto';

const R = 'compras.processos';

@ApiTags('Compras · Processos de Contratação')
@ApiBearerAuth()
@Controller('processos-contratacao')
@UseInterceptors(AuditInterceptor)
export class ProcessosController {
  constructor(private readonly service: ProcessosService) {}

  @Get() @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  listar(@Query() q: PaginationDto) { return this.service.listar(q.page, q.perPage, q.search); }

  @Get(':id') @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  detalhar(@Param('id') id: string) { return this.service.detalhar(id); }

  @Post() @Audit('ProcessoContratacao') @RequirePermission(R, AcaoPermissao.CADASTRAR)
  criar(@Body() dto: CreateProcessoDto) { return this.service.criar(dto); }

  @Patch(':id/status') @Audit('ProcessoContratacao') @RequirePermission(R, AcaoPermissao.EDITAR)
  status(@Param('id') id: string, @Body('status') status: string) { return this.service.atualizarStatus(id, status); }

  @Post(':id/homologar') @Audit('ProcessoContratacao') @RequirePermission(R, AcaoPermissao.APROVAR)
  @ApiOperation({ summary: 'Homologa o processo, definindo vencedor e valor' })
  homologar(@Param('id') id: string, @Body() dto: HomologarDto) { return this.service.homologar(id, dto); }

  @Delete(':id') @Audit('ProcessoContratacao') @RequirePermission(R, AcaoPermissao.EXCLUIR)
  excluir(@Param('id') id: string) { return this.service.remover(id); }
}
