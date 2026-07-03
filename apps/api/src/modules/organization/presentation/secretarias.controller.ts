import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AcaoPermissao } from '@prisma/client';
import { RequirePermission } from '@shared/decorators/permissions.decorator';
import { Audit, AuditInterceptor } from '@shared/interceptors/audit.interceptor';
import { SecretariasService } from '../application/services/secretarias.service';
import { DepartamentosService } from '../application/services/departamentos.service';
import {
  CreateSecretariaDto, UpdateSecretariaDto, CreateDepartamentoDto, UpdateDepartamentoDto,
} from '../application/dtos/organization.dto';

const R = 'admin.secretarias';

@ApiTags('Organização')
@ApiBearerAuth()
@Controller()
@UseInterceptors(AuditInterceptor)
export class OrganizationController {
  constructor(
    private readonly secretarias: SecretariasService,
    private readonly departamentos: DepartamentosService,
  ) {}

  // ---- Secretarias ----
  @Get('secretarias') @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  @ApiOperation({ summary: 'Lista secretarias' })
  listarSecretarias() { return this.secretarias.listar(); }

  @Post('secretarias') @Audit('Secretaria') @RequirePermission(R, AcaoPermissao.CADASTRAR)
  criarSecretaria(@Body() dto: CreateSecretariaDto) { return this.secretarias.criar(dto); }

  @Put('secretarias/:id') @Audit('Secretaria') @RequirePermission(R, AcaoPermissao.EDITAR)
  atualizarSecretaria(@Param('id') id: string, @Body() dto: UpdateSecretariaDto) { return this.secretarias.atualizar(id, dto); }

  @Delete('secretarias/:id') @Audit('Secretaria') @RequirePermission(R, AcaoPermissao.EXCLUIR)
  excluirSecretaria(@Param('id') id: string) { return this.secretarias.remover(id); }

  // ---- Departamentos (organograma) ----
  @Get('departamentos/todos') @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  @ApiOperation({ summary: 'Lista plana de todos os departamentos (para seleção)' })
  todosDepartamentos() { return this.departamentos.todos(); }

  @Get('departamentos') @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  @ApiOperation({ summary: 'Árvore de departamentos de uma secretaria' })
  arvore(@Query('secretariaId') secretariaId: string) { return this.departamentos.arvore(secretariaId); }

  @Post('departamentos') @Audit('Departamento') @RequirePermission(R, AcaoPermissao.CADASTRAR)
  criarDepartamento(@Body() dto: CreateDepartamentoDto) { return this.departamentos.criar(dto); }

  @Put('departamentos/:id') @Audit('Departamento') @RequirePermission(R, AcaoPermissao.EDITAR)
  atualizarDepartamento(@Param('id') id: string, @Body() dto: UpdateDepartamentoDto) { return this.departamentos.atualizar(id, dto); }

  @Delete('departamentos/:id') @Audit('Departamento') @RequirePermission(R, AcaoPermissao.EXCLUIR)
  excluirDepartamento(@Param('id') id: string) { return this.departamentos.remover(id); }
}
