import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';

@Injectable()
export class AssignRolesUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: IUserRepository) {}
  async executar(userId: string, roleIds: string[]) {
    const existente = await this.users.buscarPorId(userId);
    if (!existente) throw new NotFoundException('Usuário não encontrado');
    await this.users.definirPapeis(userId, roleIds);
    return this.users.buscarPorId(userId);
  }
}
