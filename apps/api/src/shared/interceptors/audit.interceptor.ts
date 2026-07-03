import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

export const AUDIT_KEY = 'audit';
/** Anota o recurso que está sendo auditado. Ex.: @Audit('User') */
import { SetMetadata } from '@nestjs/common';
export const Audit = (recurso: string) => SetMetadata(AUDIT_KEY, recurso);

/**
 * Registra automaticamente em AuditLog toda operação de escrita
 * (POST/PUT/PATCH/DELETE) em rotas anotadas com @Audit. Captura usuário,
 * IP e user-agent — atendendo à exigência de auditoria completa da spec.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const recurso = this.reflector.get<string>(AUDIT_KEY, context.getHandler());
    const req = context.switchToHttp().getRequest();
    const metodoEscrita = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

    return next.handle().pipe(
      tap(async (resposta: any) => {
        if (!recurso || !metodoEscrita) return;
        await this.prisma.auditLog.create({
          data: {
            userId: req.user?.id ?? null,
            acao: req.method,
            recurso,
            recursoId: resposta?.id ?? req.params?.id ?? null,
            depois: metodoEscrita ? req.body : undefined,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
          },
        });
      }),
    );
  }
}
