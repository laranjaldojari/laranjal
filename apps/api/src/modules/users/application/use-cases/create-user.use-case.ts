import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { IUserRepository, USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: IUserRepository) {}

  async executar(dto: CreateUserDto) {
    if (await this.users.emailExiste(dto.email))
      throw new ConflictException('E-mail já cadastrado');

    const senhaHash = await argon2.hash(dto.senha, { type: argon2.argon2id });
    return this.users.criar({
      nome: dto.nome, email: dto.email, cpf: dto.cpf, senhaHash, secretariaId: dto.secretariaId,
    });
  }
}
