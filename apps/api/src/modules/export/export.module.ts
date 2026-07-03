import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ExportController } from './presentation/export.controller';
import { ExportService } from './application/export.service';
import { ExportProcessor } from './export.processor';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [BullModule.registerQueue({ name: 'export' }), NotificationsModule],
  controllers: [ExportController],
  providers: [ExportService, ExportProcessor],
  exports: [ExportService],
})
export class ExportModule {}
