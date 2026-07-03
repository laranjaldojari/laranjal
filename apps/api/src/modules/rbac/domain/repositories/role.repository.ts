export interface RoleResumo {
  id: string; nome: string; descricao: string | null; sistema: boolean;
  permissoes: string[]; // "recurso:ACAO"
  qtdUsuarios: number;
}
export interface IRoleRepository {
  listar(): Promise<RoleResumo[]>;
  buscarPorId(id: string): Promise<RoleResumo | null>;
  criar(dados: { nome: string; descricao?: string }): Promise<{ id: string }>;
  atualizar(id: string, dados: { nome?: string; descricao?: string }): Promise<void>;
  removerLogicamente(id: string): Promise<void>;
  ehSistema(id: string): Promise<boolean>;
  definirPermissoes(roleId: string, permissionIds: string[]): Promise<void>;
  nomeExiste(nome: string, excetoId?: string): Promise<boolean>;
}
export const ROLE_REPOSITORY = Symbol('IRoleRepository');
