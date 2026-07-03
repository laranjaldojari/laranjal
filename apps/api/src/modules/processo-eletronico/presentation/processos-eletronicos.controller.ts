import { Body, Controller, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AcaoPermissao } from '@prisma/client';
import { RequirePermission } from '@shared/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '@shared/decorators/current-user.decorator';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { Audit, AuditInterceptor } from '@shared/interceptors/audit.interceptor';
import { ProcessosEletronicosService } from '../application/services/processos-eletronicos.service';
import { AbrirProcessoDto, TramitarDto, AtoDto } from '../application/dtos/processo.dto';

const R = 'processos.protocolos';

@ApiTags('Processo Eletrônico')
@ApiBearerAuth()
@Controller('processos')
@UseInterceptors(AuditInterceptor)
export class ProcessosEletronicosController {
  constructor(private readonly service: ProcessosEletronicosService) {}

  @Get() @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  listar(@Query() q: PaginationDto) { return this.service.listar(q.page, q.perPage, q.search); }

  @Get(':id') @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  detalhar(@Param('id') id: string) { return this.service.detalhar(id); }

  @Post() @Audit('ProcessoEletronico') @RequirePermission(R, AcaoPermissao.CADASTRAR)
  @ApiOperation({ summary: 'Abre um novo processo (gera protocolo)' })
  abrir(@Body() dto: AbrirProcessoDto, @CurrentUser() u: AuthenticatedUser) { return this.service.abrir(dto, u.id); }

  @Post(':id/tramitar') @Audit('ProcessoEletronico') @RequirePermission(R, AcaoPermissao.EDITAR)
  @ApiOperation({ summary: 'Encaminha o processo a outro setor' })
  tramitar(@Param('id') id: string, @Body() dto: TramitarDto, @CurrentUser() u: AuthenticatedUser) { return this.service.tramitar(id, dto, u.id); }

  @Post(':id/atos') @Audit('ProcessoEletronico') @RequirePermission(R, AcaoPermissao.EDITAR)
  @ApiOperation({ summary: 'Adiciona um despacho ou parecer' })
  ato(@Param('id') id: string, @Body() dto: AtoDto, @CurrentUser() u: AuthenticatedUser) { return this.service.adicionarAto(id, dto, u.id); }

  @Post('atos/:atoId/assinar') @Audit('AtoProcesso') @RequirePermission(R, AcaoPermissao.ASSINAR)
  @ApiOperation({ summary: 'Assina eletronicamente um ato' })
  assinar(@Param('atoId') atoId: string, @CurrentUser() u: AuthenticatedUser) { return this.service.assinarAto(atoId, u); }

  @Patch(':id/status') @Audit('ProcessoEletronico') @RequirePermission(R, AcaoPermissao.EDITAR)
  @ApiOperation({ summary: 'Sobresta, arquiva ou conclui o processo' })
  status(@Param('id') id: string, @Body('status') status: string) { return this.service.atualizarStatus(id, status); }
}
