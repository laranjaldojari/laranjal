import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import configuration from './config/configuration';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { StorageModule } from './shared/infrastructure/storage/storage.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { PermissionsGuard } from './shared/guards/permissions.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { AnexosModule } from './modules/anexos/anexos.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ExportModule } from './modules/export/export.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { ComprasModule } from './modules/compras/compras.module';
import { ProcessoEletronicoModule } from './modules/processo-eletronico/processo-eletronico.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]), // padrão global

    // Fila (BullMQ) — conexão Redis compartilhada por todas as filas.
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = new URL(config.get<string>('redis.url') ?? 'redis://localhost:6379');
        return { connection: { host: url.hostname, port: Number(url.port || 6379), password: url.password || undefined } };
      },
    }),

    // Infraestrutura transversal
    PrismaModule,
    StorageModule,

    // Núcleo de identidade e administração
    AuthModule,
    UsersModule,
    RbacModule,
    OrganizationModule,

    // Núcleo transversal (Etapa 4)
    AnexosModule,
    NotificationsModule,
    ExportModule,
    WorkflowModule,

    // Módulos de negócio
    ComprasModule,
    ProcessoEletronicoModule,
    // >>> Próximos módulos de negócio entram aqui: RhModule, FinancasModule, ...
  ],
  providers: [
    // Guards globais — toda rota é autenticada e checada por permissão,
    // salvo as marcadas com @Public(). Defesa em profundidade.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
