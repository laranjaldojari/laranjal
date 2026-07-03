import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IUserRepository, UserComPapeis } from '../domain/repositories/user.repository';
import { UserEntity } from '../domain/entities/user.entity';

const INCLUDE = {
  roles: { include: { role: { select: { id: true, nome: true } } } },
  secretaria: { select: { id: true, nome: true } },
};

function mapear(u: any): UserComPapeis {
  return { ...u, roles: (u.roles ?? []).map((r: any) => ({ roleId: r.role.id, nome: r.role.nome })) };
}

@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  criar(d: Parameters<IUserRepository['criar']>[0]) {
    return this.prisma.user.create({ data: d }) as unknown as Promise<UserEntity>;
  }

  atualizar(id: string, d: Parameters<IUserRepository['atualizar']>[1]) {
    return this.prisma.user.update({ where: { id }, data: d }) as unknown as Promise<UserEntity>;
  }

  async removerLogicamente(id: string) {
    // Soft delete universal (RNF-AUD-2): marca deletedAt e inativa.
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), ativo: false } });
  }

  async buscarPorId(id: string) {
    const u = await this.prisma.user.findFirst({ where: { id, deletedAt: null }, include: INCLUDE });
    return u ? mapear(u) : null;
  }

  async listar({ skip, take, search }: { skip: number; take: number; search?: string }) {
    const where = {
      deletedAt: null,
      ...(search && { OR: [
        { nome: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ] }),
    };
    const [itens, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: INCLUDE }),
      this.prisma.user.count({ where }),
    ]);
    return { itens: itens.map(mapear), total };
  }

  async definirPapeis(userId: string, roleIds: string[]) {
    // Substitui o conjunto de papéis do usuário de forma atômica.
    await this.prisma.$transaction([
      this.prisma.userRole.deleteMany({ where: { userId } }),
      this.prisma.userRole.createMany({ data: roleIds.map((roleId) => ({ userId, roleId })) }),
    ]);
  }

  async emailExiste(email: string, excetoId?: string) {
    return (await this.prisma.user.count({ where: { email, id: excetoId ? { not: excetoId } : undefined } })) > 0;
  }
  async cpfExiste(cpf: string, excetoId?: string) {
    return (await this.prisma.user.count({ where: { cpf, id: excetoId ? { not: excetoId } : undefined } })) > 0;
  }
}
