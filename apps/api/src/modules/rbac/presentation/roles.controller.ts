import { Body, Controller, Delete, Get, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AcaoPermissao } from '@prisma/client';
import { RequirePermission } from '@shared/decorators/permissions.decorator';
import { Audit, AuditInterceptor } from '@shared/interceptors/audit.interceptor';
import { RolesService } from '../application/services/roles.service';
import { CreateRoleDto, SetPermissionsDto, UpdateRoleDto } from '../application/dtos/role.dto';

const R = 'admin.perfis';

@ApiTags('Perfis (Papéis)')
@ApiBearerAuth()
@Controller('roles')
@UseInterceptors(AuditInterceptor)
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get() @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  @ApiOperation({ summary: 'Lista papéis' })
  listar() { return this.service.listar(); }

  @Get(':id') @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  detalhar(@Param('id') id: string) { return this.service.detalhar(id); }

  @Post() @Audit('Role') @RequirePermission(R, AcaoPermissao.CADASTRAR)
  criar(@Body() dto: CreateRoleDto) { return this.service.criar(dto); }

  @Put(':id') @Audit('Role') @RequirePermission(R, AcaoPermissao.EDITAR)
  atualizar(@Param('id') id: string, @Body() dto: UpdateRoleDto) { return this.service.atualizar(id, dto); }

  @Put(':id/permissoes') @Audit('Role') @RequirePermission(R, AcaoPermissao.ADMINISTRAR)
  @ApiOperation({ summary: 'Define as permissões do papel' })
  permissoes(@Param('id') id: string, @Body() dto: SetPermissionsDto) { return this.service.definirPermissoes(id, dto.permissionIds); }

  @Delete(':id') @Audit('Role') @RequirePermission(R, AcaoPermissao.EXCLUIR)
  excluir(@Param('id') id: string) { return this.service.remover(id); }
}
