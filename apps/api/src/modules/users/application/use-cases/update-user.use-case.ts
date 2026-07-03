import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: IUserRepository) {}
  async executar(id: string, dto: UpdateUserDto) {
    const existente = await this.users.buscarPorId(id);
    if (!existente) throw new NotFoundException('Usuário não encontrado');
    if (dto.email && (await this.users.emailExiste(dto.email, id)))
      throw new ConflictException('E-mail já cadastrado');
    return this.users.atualizar(id, dto);
  }
}
