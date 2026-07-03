import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './presentation/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { PermissionsResolver } from './application/permissions-resolver.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { RefreshTokenPrismaRepository } from './infrastructure/prisma/refresh-token.prisma.repository';
import { REFRESH_TOKEN_REPOSITORY } from './domain/repositories/refresh-token.repository';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    PermissionsResolver,
    JwtStrategy,
    // Inversão de dependência: o domínio depende da interface, não do Prisma.
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: RefreshTokenPrismaRepository },
  ],
  exports: [PermissionsResolver],
})
export class AuthModule {}
