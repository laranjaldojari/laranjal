import { Inject, Injectable } from '@nestjs/common';
import { IDepartamentoRepository, DEPARTAMENTO_REPOSITORY } from '../../domain/repositories/organization.repository';
import { CreateDepartamentoDto, UpdateDepartamentoDto } from '../dtos/organization.dto';

@Injectable()
export class DepartamentosService {
  constructor(@Inject(DEPARTAMENTO_REPOSITORY) private readonly repo: IDepartamentoRepository) {}
  arvore(secretariaId: string) { return this.repo.arvorePorSecretaria(secretariaId); }
  todos() { return this.repo.listarPlano(); }
  criar(dto: CreateDepartamentoDto) { return this.repo.criar(dto); }
  atualizar(id: string, dto: UpdateDepartamentoDto) { return this.repo.atualizar(id, dto); }
  remover(id: string) { return this.repo.removerLogicamente(id); }
}
