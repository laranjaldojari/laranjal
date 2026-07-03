import { Module } from '@nestjs/common';
import { RolesController } from './presentation/roles.controller';
import { PermissionsController } from './presentation/permissions.controller';
import { RolesService } from './application/services/roles.service';
import { PermissionsService } from './application/services/permissions.service';
import { RolePrismaRepository } from './infrastructure/role.prisma.repository';
import { PermissionPrismaRepository } from './infrastructure/permission.prisma.repository';
import { ROLE_REPOSITORY } from './domain/repositories/role.repository';
import { PERMISSION_REPOSITORY } from './domain/repositories/permission.repository';

@Module({
  controllers: [RolesController, PermissionsController],
  providers: [
    RolesService, PermissionsService,
    { provide: ROLE_REPOSITORY, useClass: RolePrismaRepository },
    { provide: PERMISSION_REPOSITORY, useClass: PermissionPrismaRepository },
  ],
})
export class RbacModule {}
