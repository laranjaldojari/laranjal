import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProcessoRepository, PROCESSO_REPOSITORY } from '../../domain/compras.repositories';
import { CreateProcessoDto, HomologarDto } from '../dtos/compras.dto';
import { formatarNumero } from './numeracao';

@Injectable()
export class ProcessosService {
  constructor(@Inject(PROCESSO_REPOSITORY) private readonly repo: IProcessoRepository) {}

  listar(page: number, perPage: number, search?: string) {
    return this.repo.listar({ skip: (page - 1) * perPage, take: perPage, search }).then((r) => ({
      itens: r.itens, meta: { page, perPage, total: r.total, totalPaginas: Math.ceil(r.total / perPage) },
    }));
  }
  async detalhar(id: string) {
    const p = await this.repo.buscarPorId(id);
    if (!p) throw new NotFoundException('Processo não encontrado');
    return p;
  }
  async criar(dto: CreateProcessoDto) {
    const ano = new Date().getFullYear();
    const numero = formatarNumero(ano, (await this.repo.contarNoAno(ano)) + 1);
    return this.repo.criar({
      numero, objeto: dto.objeto, modalidade: dto.modalidade,
      valorEstimado: dto.valorEstimado, solicitacaoId: dto.solicitacaoId, aberturaEm: new Date(),
    });
  }
  async homologar(id: string, dto: HomologarDto) {
    await this.detalhar(id);
    await this.repo.homologar(id, dto.fornecedorVencedorId, dto.valorHomologado);
    return this.detalhar(id);
  }
  async atualizarStatus(id: string, status: string) {
    await this.detalhar(id);
    await this.repo.atualizar(id, { status });
    return this.detalhar(id);
  }
  async remover(id: string) { await this.detalhar(id); await this.repo.removerLogicamente(id); }
}
