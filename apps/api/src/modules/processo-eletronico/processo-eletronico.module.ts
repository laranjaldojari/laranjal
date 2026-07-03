import { Module } from '@nestjs/common';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { ProcessosEletronicosController } from './presentation/processos-eletronicos.controller';
import { ProcessosEletronicosService } from './application/services/processos-eletronicos.service';
import { ProcessoEletronicoPrismaRepository } from './infrastructure/processo.prisma.repository';
import { PROCESSO_ELETRONICO_REPOSITORY } from './domain/processo.repository';

@Module({
  imports: [NotificationsModule],
  controllers: [ProcessosEletronicosController],
  providers: [
    ProcessosEletronicosService,
    { provide: PROCESSO_ELETRONICO_REPOSITORY, useClass: ProcessoEletronicoPrismaRepository },
  ],
})
export class ProcessoEletronicoModule {}
