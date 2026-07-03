import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IFornecedorRepository, FORNECEDOR_REPOSITORY } from '../../domain/compras.repositories';
import { CreateFornecedorDto, UpdateFornecedorDto } from '../dtos/compras.dto';

@Injectable()
export class FornecedoresService {
  constructor(@Inject(FORNECEDOR_REPOSITORY) private readonly repo: IFornecedorRepository) {}
  listar(page: number, perPage: number, search?: string) {
    return this.repo.listar({ skip: (page - 1) * perPage, take: perPage, search }).then((r) => ({
      itens: r.itens, meta: { page, perPage, total: r.total, totalPaginas: Math.ceil(r.total / perPage) },
    }));
  }
  async detalhar(id: string) {
    const f = await this.repo.buscarPorId(id);
    if (!f) throw new NotFoundException('Fornecedor não encontrado');
    return f;
  }
  async criar(dto: CreateFornecedorDto) {
    if (await this.repo.cnpjExiste(dto.cnpj)) throw new ConflictException('CNPJ já cadastrado');
    return this.repo.criar(dto);
  }
  async atualizar(id: string, dto: UpdateFornecedorDto) {
    await this.detalhar(id);
    await this.repo.atualizar(id, dto);
    return this.detalhar(id);
  }
  async remover(id: string) { await this.detalhar(id); await this.repo.removerLogicamente(id); }
}
