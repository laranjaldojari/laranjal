export interface PermissaoCatalogo { id: string; recurso: string; acao: string; descricao: string | null }
export interface IPermissionRepository {
  listar(): Promise<PermissaoCatalogo[]>;
}
export const PERMISSION_REPOSITORY = Symbol('IPermissionRepository');
