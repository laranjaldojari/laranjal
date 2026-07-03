import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: IUserRepository) {}
  async executar(id: string, autorId: string) {
    if (id === autorId) throw new BadRequestException('Você não pode excluir o próprio usuário');
    const existente = await this.users.buscarPorId(id);
    if (!existente) throw new NotFoundException('Usuário não encontrado');
    await this.users.removerLogicamente(id);
  }
}
