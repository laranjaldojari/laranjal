import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AcaoPermissao } from '@prisma/client';
import { RequirePermission } from '@shared/decorators/permissions.decorator';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { Audit, AuditInterceptor } from '@shared/interceptors/audit.interceptor';
import { FornecedoresService } from '../application/services/fornecedores.service';
import { CreateFornecedorDto, UpdateFornecedorDto } from '../application/dtos/compras.dto';

const R = 'compras.fornecedores';

@ApiTags('Compras · Fornecedores')
@ApiBearerAuth()
@Controller('fornecedores')
@UseInterceptors(AuditInterceptor)
export class FornecedoresController {
  constructor(private readonly service: FornecedoresService) {}

  @Get() @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  listar(@Query() q: PaginationDto) { return this.service.listar(q.page, q.perPage, q.search); }

  @Get(':id') @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  detalhar(@Param('id') id: string) { return this.service.detalhar(id); }

  @Post() @Audit('Fornecedor') @RequirePermission(R, AcaoPermissao.CADASTRAR)
  criar(@Body() dto: CreateFornecedorDto) { return this.service.criar(dto); }

  @Put(':id') @Audit('Fornecedor') @RequirePermission(R, AcaoPermissao.EDITAR)
  atualizar(@Param('id') id: string, @Body() dto: UpdateFornecedorDto) { return this.service.atualizar(id, dto); }

  @Delete(':id') @Audit('Fornecedor') @RequirePermission(R, AcaoPermissao.EXCLUIR)
  excluir(@Param('id') id: string) { return this.service.remover(id); }
}
