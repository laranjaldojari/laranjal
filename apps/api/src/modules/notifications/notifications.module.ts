import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsController } from './presentation/notifications.controller';
import { NotificationsGateway } from './presentation/notifications.gateway';
import { NotificationsService } from './application/notifications.service';
import { NotificationPrismaRepository } from './infrastructure/notification.prisma.repository';
import { NOTIFICATION_REPOSITORY } from './domain/repositories/notification.repository';

@Module({
  imports: [JwtModule.register({})],
  controllers: [NotificationsController],
  providers: [
    NotificationsService, NotificationsGateway,
    { provide: NOTIFICATION_REPOSITORY, useClass: NotificationPrismaRepository },
  ],
  exports: [NotificationsService], // consumido por workflow, export, etc.
})
export class NotificationsModule {}
