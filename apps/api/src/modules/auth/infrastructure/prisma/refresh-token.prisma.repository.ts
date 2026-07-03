import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';

@Injectable()
export class RefreshTokenPrismaRepository implements IRefreshTokenRepository {
  constructor(private prisma: PrismaService) {}

  async salvar(d: Parameters<IRefreshTokenRepository['salvar']>[0]) {
    await this.prisma.refreshToken.create({ data: d });
  }
  async buscarPorHash(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, revogadoEm: true, expiraEm: true },
    });
  }
  async revogar(id: string) {
    await this.prisma.refreshToken.update({ where: { id }, data: { revogadoEm: new Date() } });
  }
  async revogarTodosDoUsuario(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revogadoEm: null },
      data: { revogadoEm: new Date() },
    });
  }
}
