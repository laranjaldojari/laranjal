import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IContratoRepository, CONTRATO_REPOSITORY, IFornecedorRepository, FORNECEDOR_REPOSITORY } from '../../domain/compras.repositories';
import { CreateContratoDto, AditivoDto } from '../dtos/compras.dto';
import { formatarNumero } from './numeracao';

@Injectable()
export class ContratosService {
  constructor(
    @Inject(CONTRATO_REPOSITORY) private readonly repo: IContratoRepository,
    @Inject(FORNECEDOR_REPOSITORY) private readonly fornecedores: IFornecedorRepository,
  ) {}

  listar(page: number, perPage: number, search?: string) {
    return this.repo.listar({ skip: (page - 1) * perPage, take: perPage, search }).then((r) => ({
      itens: r.itens, meta: { page, perPage, total: r.total, totalPaginas: Math.ceil(r.total / perPage) },
    }));
  }
  async detalhar(id: string) {
    const c = await this.repo.buscarPorId(id);
    if (!c) throw new NotFoundException('Contrato não encontrado');
    return c;
  }
  async criar(dto: CreateContratoDto) {
    if (!(await this.fornecedores.buscarPorId(dto.fornecedorId))) throw new NotFoundException('Fornecedor não encontrado');
    if (new Date(dto.dataFim) <= new Date(dto.dataInicio)) throw new BadRequestException('A data de término deve ser posterior ao início');
    const ano = new Date().getFullYear();
    const numero = formatarNumero(ano, (await this.repo.contarNoAno(ano)) + 1);
    return this.repo.criar({
      numero, objeto: dto.objeto, fornecedorId: dto.fornecedorId, processoId: dto.processoId,
      valor: dto.valor, dataInicio: new Date(dto.dataInicio), dataFim: new Date(dto.dataFim),
    });
  }
  async atualizarSituacao(id: string, situacao: string) {
    await this.detalhar(id);
    await this.repo.atualizar(id, { situacao });
    return this.detalhar(id);
  }
  async adicionarAditivo(id: string, dto: AditivoDto) {
    await this.detalhar(id);
    await this.repo.adicionarAditivo(id, {
      tipo: dto.tipo, descricao: dto.descricao, valorAcrescimo: dto.valorAcrescimo,
      novaDataFim: dto.novaDataFim ? new Date(dto.novaDataFim) : undefined,
    });
    return this.detalhar(id);
  }
  async remover(id: string) { await this.detalhar(id); await this.repo.removerLogicamente(id); }
}
