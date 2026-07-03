import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IRoleRepository, ROLE_REPOSITORY } from '../../domain/repositories/role.repository';
import { CreateRoleDto, UpdateRoleDto } from '../dtos/role.dto';

@Injectable()
export class RolesService {
  constructor(@Inject(ROLE_REPOSITORY) private readonly roles: IRoleRepository) {}

  listar() { return this.roles.listar(); }

  async detalhar(id: string) {
    const r = await this.roles.buscarPorId(id);
    if (!r) throw new NotFoundException('Papel não encontrado');
    return r;
  }

  async criar(dto: CreateRoleDto) {
    if (await this.roles.nomeExiste(dto.nome)) throw new ConflictException('Já existe um papel com esse nome');
    return this.roles.criar(dto);
  }

  async atualizar(id: string, dto: UpdateRoleDto) {
    await this.detalhar(id);
    if (dto.nome && (await this.roles.nomeExiste(dto.nome, id))) throw new ConflictException('Já existe um papel com esse nome');
    await this.roles.atualizar(id, dto);
    return this.detalhar(id);
  }

  async remover(id: string) {
    if (await this.roles.ehSistema(id)) throw new BadRequestException('Papéis de sistema não podem ser excluídos');
    await this.detalhar(id);
    await this.roles.removerLogicamente(id);
  }

  async definirPermissoes(id: string, permissionIds: string[]) {
    await this.detalhar(id);
    await this.roles.definirPermissoes(id, permissionIds);
    return this.detalhar(id);
  }
}
