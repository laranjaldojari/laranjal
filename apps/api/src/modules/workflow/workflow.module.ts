import { Module } from '@nestjs/common';
import { WorkflowController } from './presentation/workflow.controller';
import { WorkflowService } from './application/workflow.service';
import { WorkflowPrismaRepository } from './infrastructure/workflow.prisma.repository';
import { WORKFLOW_REPOSITORY } from './domain/repositories/workflow.repository';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [WorkflowController],
  providers: [WorkflowService, { provide: WORKFLOW_REPOSITORY, useClass: WorkflowPrismaRepository }],
  exports: [WorkflowService],
})
export class WorkflowModule {}
