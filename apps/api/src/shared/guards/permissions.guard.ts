import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

/**
 * Verifica se o usuário autenticado possui a permissão exigida.
 * As permissões já chegam resolvidas no token/sessão no formato "recurso:ACAO",
 * com DENY individual tendo precedência sobre qualquer GRANT (resolvido no login).
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true; // rota não exige permissão específica

    const user: AuthenticatedUser = context.switchToHttp().getRequest().user;
    const chave = `${required.recurso}:${required.acao}`;
    const adminGeral = user?.permissoes?.includes('*:ADMINISTRAR');

    if (adminGeral || user?.permissoes?.includes(chave)) return true;

    throw new ForbiddenException(
      `Acesso negado. Permissão necessária: ${chave}`,
    );
  }
}
