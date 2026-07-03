import { Module } from '@nestjs/common';
import { OrganizationController } from './presentation/secretarias.controller';
import { SecretariasService } from './application/services/secretarias.service';
import { DepartamentosService } from './application/services/departamentos.service';
import { SecretariaPrismaRepository, DepartamentoPrismaRepository } from './infrastructure/organization.prisma.repository';
import { SECRETARIA_REPOSITORY, DEPARTAMENTO_REPOSITORY } from './domain/repositories/organization.repository';

@Module({
  controllers: [OrganizationController],
  providers: [
    SecretariasService, DepartamentosService,
    { provide: SECRETARIA_REPOSITORY, useClass: SecretariaPrismaRepository },
    { provide: DEPARTAMENTO_REPOSITORY, useClass: DepartamentoPrismaRepository },
  ],
})
export class OrganizationModule {}
