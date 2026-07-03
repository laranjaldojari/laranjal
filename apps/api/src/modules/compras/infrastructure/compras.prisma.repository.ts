import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  IFornecedorRepository, ISolicitacaoRepository, IProcessoRepository, IContratoRepository, Pagina,
} from '../domain/compras.repositories';

const inicioFim = (ano: number) => ({ gte: new Date(ano, 0, 1), lt: new Date(ano + 1, 0, 1) });

@Injectable()
export class FornecedorPrismaRepository implements IFornecedorRepository {
  constructor(private prisma: PrismaService) {}
  async listar({ skip, take, search }: Pagina) {
    const where = { deletedAt: null, ...(search && { OR: [
      { razaoSocial: { contains: search, mode: 'insensitive' as const } },
      { cnpj: { contains: search } },
    ] }) };
    const [itens, total] = await this.prisma.$transaction([
      this.prisma.fornecedor.findMany({ where, skip, take, orderBy: { razaoSocial: 'asc' } }),
      this.prisma.fornecedor.count({ where }),
    ]);
    return { itens, total };
  }
  buscarPorId(id: string) { return this.prisma.fornecedor.findFirst({ where: { id, deletedAt: null } }); }
  criar(d: any) { return this.prisma.fornecedor.create({ data: d, select: { id: true } }); }
  async atualizar(id: string, d: any) { await this.prisma.fornecedor.update({ where: { id }, data: d }); }
  async removerLogicamente(id: string) { await this.prisma.fornecedor.update({ where: { id }, data: { deletedAt: new Date() } }); }
  async cnpjExiste(cnpj: string, excetoId?: string) {
    return (await this.prisma.fornecedor.count({ where: { cnpj, id: excetoId ? { not: excetoId } : undefined, deletedAt: null } })) > 0;
  }
}

@Injectable()
export class SolicitacaoPrismaRepository implements ISolicitacaoRepository {
  constructor(private prisma: PrismaService) {}
  async listar({ skip, take, search }: Pagina) {
    const where = { deletedAt: null, ...(search && { OR: [
      { objeto: { contains: search, mode: 'insensitive' as const } },
      { numero: { contains: search } },
    ] }) };
    const [itens, total] = await this.prisma.$transaction([
      this.prisma.solicitacaoCompra.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { secretaria: { select: { sigla: true } }, _count: { select: { itens: true } } } }),
      this.prisma.solicitacaoCompra.count({ where }),
    ]);
    return { itens, total };
  }
  buscarPorId(id: string) {
    return this.prisma.solicitacaoCompra.findFirst({ where: { id, deletedAt: null }, include: { itens: true, secretaria: { select: { id: true, nome: true } } } });
  }
  criar(d: any, itens: any[]) {
    return this.prisma.solicitacaoCompra.create({ data: { ...d, itens: { create: itens } }, select: { id: true } });
  }
  async atualizarStatus(id: string, status: string) { await this.prisma.solicitacaoCompra.update({ where: { id }, data: { status } }); }
  async removerLogicamente(id: string) { await this.prisma.solicitacaoCompra.update({ where: { id }, data: { deletedAt: new Date() } }); }
  contarNoAno(ano: number) { return this.prisma.solicitacaoCompra.count({ where: { createdAt: inicioFim(ano) } }); }
}

@Injectable()
export class ProcessoPrismaRepository implements IProcessoRepository {
  constructor(private prisma: PrismaService) {}
  async listar({ skip, take, search }: Pagina) {
    const where = { deletedAt: null, ...(search && { OR: [
      { objeto: { contains: search, mode: 'insensitive' as const } },
      { numero: { contains: search } },
    ] }) };
    const [itens, total] = await this.prisma.$transaction([
      this.prisma.processoContratacao.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { fornecedorVencedor: { select: { razaoSocial: true } } } }),
      this.prisma.processoContratacao.count({ where }),
    ]);
    return { itens, total };
  }
  buscarPorId(id: string) {
    return this.prisma.processoContratacao.findFirst({ where: { id, deletedAt: null }, include: { fornecedorVencedor: true, solicitacao: { select: { numero: true, objeto: true } }, contrato: { select: { id: true, numero: true } } } });
  }
  criar(d: any) { return this.prisma.processoContratacao.create({ data: d, select: { id: true } }); }
  async atualizar(id: string, d: any) { await this.prisma.processoContratacao.update({ where: { id }, data: d }); }
  async homologar(id: string, fornecedorVencedorId: string, valorHomologado: number) {
    await this.prisma.processoContratacao.update({ where: { id }, data: { status: 'HOMOLOGADO', fornecedorVencedorId, valorHomologado, homologadoEm: new Date() } });
  }
  async removerLogicamente(id: string) { await this.prisma.processoContratacao.update({ where: { id }, data: { deletedAt: new Date() } }); }
  contarNoAno(ano: number) { return this.prisma.processoContratacao.count({ where: { createdAt: inicioFim(ano) } }); }
}

@Injectable()
export class ContratoPrismaRepository implements IContratoRepository {
  constructor(private prisma: PrismaService) {}
  async listar({ skip, take, search }: Pagina) {
    const where = { deletedAt: null, ...(search && { OR: [
      { objeto: { contains: search, mode: 'insensitive' as const } },
      { numero: { contains: search } },
    ] }) };
    const [itens, total] = await this.prisma.$transaction([
      this.prisma.contrato.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { fornecedor: { select: { razaoSocial: true } } } }),
      this.prisma.contrato.count({ where }),
    ]);
    return { itens, total };
  }
  buscarPorId(id: string) {
    return this.prisma.contrato.findFirst({ where: { id, deletedAt: null }, include: { fornecedor: true, aditivos: { orderBy: { createdAt: 'asc' } } } });
  }
  criar(d: any) { return this.prisma.contrato.create({ data: d, select: { id: true } }); }
  async atualizar(id: string, d: any) { await this.prisma.contrato.update({ where: { id }, data: d }); }
  async adicionarAditivo(contratoId: string, d: any) {
    await this.prisma.contratoAditivo.create({ data: { ...d, contratoId } });
    if (d.novaDataFim) await this.prisma.contrato.update({ where: { id: contratoId }, data: { dataFim: d.novaDataFim } });
  }
  async removerLogicamente(id: string) { await this.prisma.contrato.update({ where: { id }, data: { deletedAt: new Date() } }); }
  contarNoAno(ano: number) { return this.prisma.contrato.count({ where: { createdAt: inicioFim(ano) } }); }
}
