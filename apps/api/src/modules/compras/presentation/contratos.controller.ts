import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AcaoPermissao } from '@prisma/client';
import { RequirePermission } from '@shared/decorators/permissions.decorator';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { Audit, AuditInterceptor } from '@shared/interceptors/audit.interceptor';
import { ContratosService } from '../application/services/contratos.service';
import { CreateContratoDto, AditivoDto } from '../application/dtos/compras.dto';

const R = 'compras.contratos';

@ApiTags('Compras · Contratos')
@ApiBearerAuth()
@Controller('contratos')
@UseInterceptors(AuditInterceptor)
export class ContratosController {
  constructor(private readonly service: ContratosService) {}

  @Get() @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  listar(@Query() q: PaginationDto) { return this.service.listar(q.page, q.perPage, q.search); }

  @Get(':id') @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  detalhar(@Param('id') id: string) { return this.service.detalhar(id); }

  @Post() @Audit('Contrato') @RequirePermission(R, AcaoPermissao.CADASTRAR)
  criar(@Body() dto: CreateContratoDto) { return this.service.criar(dto); }

  @Patch(':id/situacao') @Audit('Contrato') @RequirePermission(R, AcaoPermissao.EDITAR)
  situacao(@Param('id') id: string, @Body('situacao') situacao: string) { return this.service.atualizarSituacao(id, situacao); }

  @Post(':id/aditivos') @Audit('Contrato') @RequirePermission(R, AcaoPermissao.EDITAR)
  @ApiOperation({ summary: 'Registra um aditivo de prazo e/ou valor' })
  aditivo(@Param('id') id: string, @Body() dto: AditivoDto) { return this.service.adicionarAditivo(id, dto); }

  @Delete(':id') @Audit('Contrato') @RequirePermission(R, AcaoPermissao.EXCLUIR)
  excluir(@Param('id') id: string) { return this.service.remover(id); }
}
