import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

/**
 * Consolida as permissões efetivas de um usuário:
 *   permissões de todos os papéis  ∪  GRANTs individuais  −  DENYs individuais.
 * Retorna strings no formato "recurso:ACAO" para uso no PermissionsGuard.
 */
@Injectable()
export class PermissionsResolver {
  constructor(private prisma: PrismaService) {}

  async resolverPara(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: { include: { permissoes: { include: { permission: true } } } } } },
        permissoes: { include: { permission: true } },
      },
    });
    if (!user) return [];

    const efetivas = new Set<string>();
    for (const ur of user.roles)
      for (const rp of ur.role.permissoes)
        efetivas.add(`${rp.permission.recurso}:${rp.permission.acao}`);

    // Permissões individuais sobrescrevem o herdado dos papéis
    for (const up of user.permissoes) {
      const chave = `${up.permission.recurso}:${up.permission.acao}`;
      if (up.efeito === 'DENY') efetivas.delete(chave);
      else efetivas.add(chave);
    }
    return [...efetivas];
  }
}
