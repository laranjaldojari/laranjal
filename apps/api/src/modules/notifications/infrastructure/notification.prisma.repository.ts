import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { INotificationRepository, Notificacao } from '../domain/repositories/notification.repository';

@Injectable()
export class NotificationPrismaRepository implements INotificationRepository {
  constructor(private prisma: PrismaService) {}
  criar(d: Parameters<INotificationRepository['criar']>[0]) {
    return this.prisma.notification.create({ data: d }) as unknown as Promise<Notificacao>;
  }
  listar(userId: string, apenasNaoLidas: boolean) {
    return this.prisma.notification.findMany({
      where: { userId, ...(apenasNaoLidas && { lidaEm: null }) },
      orderBy: { createdAt: 'desc' }, take: 50,
    }) as unknown as Promise<Notificacao[]>;
  }
  contarNaoLidas(userId: string) {
    return this.prisma.notification.count({ where: { userId, lidaEm: null } });
  }
  async marcarLida(id: string, userId: string) {
    await this.prisma.notification.updateMany({ where: { id, userId }, data: { lidaEm: new Date() } });
  }
  async marcarTodasLidas(userId: string) {
    await this.prisma.notification.updateMany({ where: { userId, lidaEm: null }, data: { lidaEm: new Date() } });
  }
}
