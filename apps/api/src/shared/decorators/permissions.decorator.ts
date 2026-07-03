import { SetMetadata } from '@nestjs/common';
import { AcaoPermissao } from '@prisma/client';

export const PERMISSIONS_KEY = 'permissions';

export interface RequiredPermission {
  recurso: string;
  acao: AcaoPermissao;
}

/**
 * Exige uma permissão (recurso + ação) para acessar a rota.
 * Ex.: @RequirePermission('rh.servidores', AcaoPermissao.EDITAR)
 */
export const RequirePermission = (recurso: string, acao: AcaoPermissao) =>
  SetMetadata(PERMISSIONS_KEY, { recurso, acao } as RequiredPermission);
