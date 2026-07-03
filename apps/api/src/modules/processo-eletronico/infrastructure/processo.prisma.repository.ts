import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IProcessoEletronicoRepository, Pagina } from '../domain/processo.repository';

const setorSel = { select: { id: true, nome: true } };

@Injectable()
export class ProcessoEletronicoPrismaRepository implements IProcessoEletronicoRepository {
  constructor(private prisma: PrismaService) {}

  abrir(d: any) { return this.prisma.processoEletronico.create({ data: d, select: { id: true } }); }

  async listar({ skip, take, search }: Pagina) {
    const where = { deletedAt: null, ...(search && { OR: [
      { assunto: { contains: search, mode: 'insensitive' as const } },
      { numero: { contains: search } },
      { interessado: { contains: search, mode: 'insensitive' as const } },
    ] }) };
    const [itens, total] = await this.prisma.$transaction([
      this.prisma.processoEletronico.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { setorAtual: setorSel } }),
      this.prisma.processoEletronico.count({ where }),
    ]);
    return { itens, total };
  }

  detalhar(id: string) {
    return this.prisma.processoEletronico.findFirst({
      where: { id, deletedAt: null },
      include: {
        setorAtual: setorSel,
        tramitacoes: { orderBy: { createdAt: 'asc' }, include: { deSetor: setorSel, paraSetor: setorSel } },
        atos: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async atualizarStatus(id: string, status: string, setorAtualId?: string) {
    await this.prisma.processoEletronico.update({ where: { id }, data: { status, ...(setorAtualId && { setorAtualId }) } });
  }

  async registrarTramitacao(d: Parameters<IProcessoEletronicoRepository['registrarTramitacao']>[0]) {
    await this.prisma.tramitacaoProcesso.create({ data: d });
  }

  adicionarAto(d: Parameters<IProcessoEletronicoRepository['adicionarAto']>[0]) {
    return this.prisma.atoProcesso.create({ data: d, select: { id: true } });
  }

  buscarAto(atoId: string) { return this.prisma.atoProcesso.findUnique({ where: { id: atoId } }); }

  async assinarAto(atoId: string, hash: string) {
    await this.prisma.atoProcesso.update({ where: { id: atoId }, data: { assinadoEm: new Date(), assinaturaHash: hash } });
  }

  contarNoAno(ano: number) {
    return this.prisma.processoEletronico.count({ where: { createdAt: { gte: new Date(ano, 0, 1), lt: new Date(ano + 1, 0, 1) } } });
  }

  async usuariosDoSetor(setorId: string) {
    const us = await this.prisma.user.findMany({ where: { departamentoId: setorId, deletedAt: null }, select: { id: true } });
    return us.map((u: any) => u.id);
  }
}
