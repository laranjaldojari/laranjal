import { Body, Controller, Delete, Get, Param, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AcaoPermissao } from '@prisma/client';
import { RequirePermission } from '@shared/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '@shared/decorators/current-user.decorator';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { Audit, AuditInterceptor } from '@shared/interceptors/audit.interceptor';
import { SolicitacoesService } from '../application/services/solicitacoes.service';
import { CreateSolicitacaoDto } from '../application/dtos/compras.dto';

const R = 'compras.solicitacoes';

@ApiTags('Compras · Solicitações')
@ApiBearerAuth()
@Controller('solicitacoes-compra')
@UseInterceptors(AuditInterceptor)
export class SolicitacoesController {
  constructor(private readonly service: SolicitacoesService) {}

  @Get() @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  listar(@Query() q: PaginationDto) { return this.service.listar(q.page, q.perPage, q.search); }

  @Get(':id') @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  detalhar(@Param('id') id: string) { return this.service.detalhar(id); }

  @Post() @Audit('SolicitacaoCompra') @RequirePermission(R, AcaoPermissao.CADASTRAR)
  criar(@Body() dto: CreateSolicitacaoDto, @CurrentUser() u: AuthenticatedUser) { return this.service.criar(dto, u.id); }

  @Post(':id/enviar') @Audit('SolicitacaoCompra') @RequirePermission(R, AcaoPermissao.EDITAR)
  @ApiOperation({ summary: 'Envia a solicitação para aprovação' })
  enviar(@Param('id') id: string) { return this.service.enviarParaAprovacao(id); }

  @Post(':id/aprovar') @Audit('SolicitacaoCompra') @RequirePermission(R, AcaoPermissao.APROVAR)
  aprovar(@Param('id') id: string) { return this.service.aprovar(id); }

  @Post(':id/reprovar') @Audit('SolicitacaoCompra') @RequirePermission(R, AcaoPermissao.APROVAR)
  reprovar(@Param('id') id: string) { return this.service.reprovar(id); }

  @Delete(':id') @Audit('SolicitacaoCompra') @RequirePermission(R, AcaoPermissao.EXCLUIR)
  excluir(@Param('id') id: string) { return this.service.remover(id); }
}
