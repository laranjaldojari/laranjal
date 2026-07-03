import { Module } from '@nestjs/common';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { FornecedoresController } from './presentation/fornecedores.controller';
import { SolicitacoesController } from './presentation/solicitacoes.controller';
import { ProcessosController } from './presentation/processos.controller';
import { ContratosController } from './presentation/contratos.controller';
import { FornecedoresService } from './application/services/fornecedores.service';
import { SolicitacoesService } from './application/services/solicitacoes.service';
import { ProcessosService } from './application/services/processos.service';
import { ContratosService } from './application/services/contratos.service';
import {
  FornecedorPrismaRepository, SolicitacaoPrismaRepository, ProcessoPrismaRepository, ContratoPrismaRepository,
} from './infrastructure/compras.prisma.repository';
import {
  FORNECEDOR_REPOSITORY, SOLICITACAO_REPOSITORY, PROCESSO_REPOSITORY, CONTRATO_REPOSITORY,
} from './domain/compras.repositories';

@Module({
  imports: [NotificationsModule],
  controllers: [FornecedoresController, SolicitacoesController, ProcessosController, ContratosController],
  providers: [
    FornecedoresService, SolicitacoesService, ProcessosService, ContratosService,
    { provide: FORNECEDOR_REPOSITORY, useClass: FornecedorPrismaRepository },
    { provide: SOLICITACAO_REPOSITORY, useClass: SolicitacaoPrismaRepository },
    { provide: PROCESSO_REPOSITORY, useClass: ProcessoPrismaRepository },
    { provide: CONTRATO_REPOSITORY, useClass: ContratoPrismaRepository },
  ],
})
export class ComprasModule {}
