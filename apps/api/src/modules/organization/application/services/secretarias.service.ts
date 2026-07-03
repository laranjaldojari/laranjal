import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISecretariaRepository, SECRETARIA_REPOSITORY } from '../../domain/repositories/organization.repository';
import { CreateSecretariaDto, UpdateSecretariaDto } from '../dtos/organization.dto';

@Injectable()
export class SecretariasService {
  constructor(@Inject(SECRETARIA_REPOSITORY) private readonly repo: ISecretariaRepository) {}
  listar() { return this.repo.listar(); }
  async criar(dto: CreateSecretariaDto) {
    if (await this.repo.siglaExiste(dto.sigla)) throw new ConflictException('Sigla já utilizada');
    return this.repo.criar({ ...dto, sigla: dto.sigla.toUpperCase() });
  }
  async atualizar(id: string, dto: UpdateSecretariaDto) {
    if (!(await this.repo.existe(id))) throw new NotFoundException('Secretaria não encontrada');
    if (dto.sigla && (await this.repo.siglaExiste(dto.sigla, id))) throw new ConflictException('Sigla já utilizada');
    await this.repo.atualizar(id, dto.sigla ? { ...dto, sigla: dto.sigla.toUpperCase() } : dto);
  }
  async remover(id: string) {
    if (!(await this.repo.existe(id))) throw new NotFoundException('Secretaria não encontrada');
    await this.repo.removerLogicamente(id);
  }
}
