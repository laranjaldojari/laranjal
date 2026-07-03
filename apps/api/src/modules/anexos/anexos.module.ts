import { Module } from '@nestjs/common';
import { AnexosController } from './presentation/anexos.controller';
import { AnexosService } from './application/anexos.service';
import { AttachmentPrismaRepository } from './infrastructure/attachment.prisma.repository';
import { ATTACHMENT_REPOSITORY } from './domain/repositories/attachment.repository';

@Module({
  controllers: [AnexosController],
  providers: [AnexosService, { provide: ATTACHMENT_REPOSITORY, useClass: AttachmentPrismaRepository }],
  exports: [AnexosService],
})
export class AnexosModule {}
