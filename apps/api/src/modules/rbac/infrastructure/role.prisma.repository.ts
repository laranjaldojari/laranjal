import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IRoleRepository, RoleResumo } from '../domain/repositories/role.repository';

@Injectable()
export class RolePrismaRepository implements IRoleRepository {
  constructor(private prisma: PrismaService) {}

  private map = (r: any): RoleResumo => ({
    id: r.id, nome: r.nome, descricao: r.descricao, sistema: r.sistema,
    permissoes: r.permissoes.map((p: any) => `${p.permission.recurso}:${p.permission.acao}`),
    qtdUsuarios: r._count?.usuarios ?? 0,
  });

  async listar() {
    const rows = await this.prisma.role.findMany({
      where: { deletedAt: null },
      orderBy: { nome: 'asc' },
      include: { permissoes: { include: { permission: true } }, _count: { select: { usuarios: true } } },
    });
    return rows.map(this.map);
  }
  async buscarPorId(id: string) {
    const r = await this.prisma.role.findFirst({
      where: { id, deletedAt: null },
      include: { permissoes: { include: { permission: true } }, _count: { select: { usuarios: true } } },
    });
    return r ? this.map(r) : null;
  }
  async criar(d: { nome: string; descricao?: string }) {
    return this.prisma.role.create({ data: d, select: { id: true } });
  }
  async atualizar(id: string, d: { nome?: string; descricao?: string }) {
    await this.prisma.role.update({ where: { id }, data: d });
  }
  async removerLogicamente(id: string) {
    await this.prisma.role.update({ where: { id }, data: { deletedAt: new Date() } });
  }
  async ehSistema(id: string) {
    const r = await this.prisma.role.findUnique({ where: { id }, select: { sistema: true } });
    return r?.sistema ?? false;
  }
  async definirPermissoes(roleId: string, permissionIds: string[]) {
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({ data: permissionIds.map((permissionId) => ({ roleId, permissionId })) }),
    ]);
  }
  async nomeExiste(nome: string, excetoId?: string) {
    return (await this.prisma.role.count({ where: { nome, id: excetoId ? { not: excetoId } : undefined, deletedAt: null } })) > 0;
  }
}
