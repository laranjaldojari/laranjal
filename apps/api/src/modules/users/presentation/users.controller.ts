import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AcaoPermissao } from '@prisma/client';
import { RequirePermission } from '@shared/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '@shared/decorators/current-user.decorator';
import { PaginationDto } from '@shared/dtos/pagination.dto';
import { Audit, AuditInterceptor } from '@shared/interceptors/audit.interceptor';
import { IUserRepository, USER_REPOSITORY } from '../domain/repositories/user.repository';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../application/use-cases/delete-user.use-case';
import { AssignRolesUseCase } from '../application/use-cases/assign-roles.use-case';
import { CreateUserDto } from '../application/dtos/create-user.dto';
import { UpdateUserDto } from '../application/dtos/update-user.dto';
import { AssignRolesDto } from '../application/dtos/assign-roles.dto';

const R = 'admin.usuarios';

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('users')
@UseInterceptors(AuditInterceptor)
export class UsersController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
    private readonly assignRoles: AssignRolesUseCase,
    @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
  ) {}

  @Get()
  @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  @ApiOperation({ summary: 'Lista usuários (paginado, com busca)' })
  async listar(@Query() q: PaginationDto) {
    const { itens, total } = await this.users.listar({ skip: (q.page - 1) * q.perPage, take: q.perPage, search: q.search });
    return { itens, meta: { page: q.page, perPage: q.perPage, total, totalPaginas: Math.ceil(total / q.perPage) } };
  }

  @Get(':id')
  @RequirePermission(R, AcaoPermissao.VISUALIZAR)
  @ApiOperation({ summary: 'Detalha um usuário' })
  detalhar(@Param('id') id: string) {
    return this.users.buscarPorId(id);
  }

  @Post()
  @Audit('User')
  @RequirePermission(R, AcaoPermissao.CADASTRAR)
  @ApiOperation({ summary: 'Cadastra novo usuário' })
  criar(@Body() dto: CreateUserDto) {
    return this.createUser.executar(dto);
  }

  @Put(':id')
  @Audit('User')
  @RequirePermission(R, AcaoPermissao.EDITAR)
  @ApiOperation({ summary: 'Atualiza um usuário' })
  atualizar(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.updateUser.executar(id, dto);
  }

  @Patch(':id/papeis')
  @Audit('User')
  @RequirePermission(R, AcaoPermissao.ADMINISTRAR)
  @ApiOperation({ summary: 'Define os papéis do usuário' })
  papeis(@Param('id') id: string, @Body() dto: AssignRolesDto) {
    return this.assignRoles.executar(id, dto.roleIds);
  }

  @Delete(':id')
  @Audit('User')
  @RequirePermission(R, AcaoPermissao.EXCLUIR)
  @ApiOperation({ summary: 'Exclui (logicamente) um usuário' })
  excluir(@Param('id') id: string, @CurrentUser() autor: AuthenticatedUser) {
    return this.deleteUser.executar(id, autor.id);
  }
}
