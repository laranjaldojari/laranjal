import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  ISecretariaRepository, IDepartamentoRepository, DepartamentoNo,
} from '../domain/repositories/organization.repository';

@Injectable()
export class SecretariaPrismaRepository implements ISecretariaRepository {
  constructor(private prisma: PrismaService) {}
  async listar() {
    const rows = await this.prisma.secretaria.findMany({
      where: { deletedAt: null }, orderBy: { nome: 'asc' },
      include: { _count: { select: { departamentos: true, usuarios: true } } },
    });
    return rows.map((s) => ({
      id: s.id, nome: s.nome, sigla: s.sigla, responsavel: s.responsavel,
      qtdDepartamentos: s._count.departamentos, qtdUsuarios: s._count.usuarios,
    }));
  }
  async criar(d: { nome: string; sigla: string; responsavel?: string }) {
    return this.prisma.secretaria.create({ data: d, select: { id: true } });
  }
  async atualizar(id: string, d: { nome?: string; sigla?: string; responsavel?: string }) {
    await this.prisma.secretaria.update({ where: { id }, data: d });
  }
  async removerLogicamente(id: string) {
    await this.prisma.secretaria.update({ where: { id }, data: { deletedAt: new Date() } });
  }
  async existe(id: string) {
    return (await this.prisma.secretaria.count({ where: { id, deletedAt: null } })) > 0;
  }
  async siglaExiste(sigla: string, excetoId?: string) {
    return (await this.prisma.secretaria.count({ where: { sigla, id: excetoId ? { not: excetoId } : undefined, deletedAt: null } })) > 0;
  }
}

@Injectable()
export class DepartamentoPrismaRepository implements IDepartamentoRepository {
  constructor(private prisma: PrismaService) {}
  async arvorePorSecretaria(secretariaId: string) {
    const todos = await this.prisma.departamento.findMany({
      where: { secretariaId, deletedAt: null }, orderBy: { nome: 'asc' },
      select: { id: true, nome: true, secretariaId: true, paiId: true },
    });
    // Monta a árvore em memória a partir da lista plana.
    const mapa = new Map<string, DepartamentoNo>();
    todos.forEach((d) => mapa.set(d.id, { ...d, filhos: [] }));
    const raizes: DepartamentoNo[] = [];
    mapa.forEach((no) => {
      if (no.paiId && mapa.has(no.paiId)) mapa.get(no.paiId)!.filhos.push(no);
      else raizes.push(no);
    });
    return raizes;
  }
  async listarPlano() {
    const rows = await this.prisma.departamento.findMany({
      where: { deletedAt: null }, orderBy: { nome: 'asc' },
      select: { id: true, nome: true, secretaria: { select: { sigla: true } } },
    });
    return rows.map((d: any) => ({ id: d.id, nome: d.nome, secretariaSigla: d.secretaria?.sigla ?? '' }));
  }
  async criar(d: { nome: string; secretariaId: string; paiId?: string }) {
    return this.prisma.departamento.create({ data: d, select: { id: true } });
  }
  async atualizar(id: string, d: { nome?: string; paiId?: string | null }) {
    await this.prisma.departamento.update({ where: { id }, data: d });
  }
  async removerLogicamente(id: string) {
    await this.prisma.departamento.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
