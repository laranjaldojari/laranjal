import { Module } from '@nestjs/common';
import { UsersController } from './presentation/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { AssignRolesUseCase } from './application/use-cases/assign-roles.use-case';
import { UserPrismaRepository } from './infrastructure/user.prisma.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository';

@Module({
  controllers: [UsersController],
  providers: [
    CreateUserUseCase, UpdateUserUseCase, DeleteUserUseCase, AssignRolesUseCase,
    { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
  ],
})
export class UsersModule {}
