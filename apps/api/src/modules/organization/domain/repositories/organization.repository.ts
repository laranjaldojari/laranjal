export interface SecretariaResumo { id: string; nome: string; sigla: string; responsavel: string | null; qtdDepartamentos: number; qtdUsuarios: number }
export interface DepartamentoNo { id: string; nome: string; secretariaId: string; paiId: string | null; filhos: DepartamentoNo[] }

export interface ISecretariaRepository {
  listar(): Promise<SecretariaResumo[]>;
  criar(d: { nome: string; sigla: string; responsavel?: string }): Promise<{ id: string }>;
  atualizar(id: string, d: { nome?: string; sigla?: string; responsavel?: string }): Promise<void>;
  removerLogicamente(id: string): Promise<void>;
  existe(id: string): Promise<boolean>;
  siglaExiste(sigla: string, excetoId?: string): Promise<boolean>;
}
export interface IDepartamentoRepository {
  arvorePorSecretaria(secretariaId: string): Promise<DepartamentoNo[]>;
  listarPlano(): Promise<{ id: string; nome: string; secretariaSigla: string }[]>;
  criar(d: { nome: string; secretariaId: string; paiId?: string }): Promise<{ id: string }>;
  atualizar(id: string, d: { nome?: string; paiId?: string | null }): Promise<void>;
  removerLogicamente(id: string): Promise<void>;
}
export const SECRETARIA_REPOSITORY = Symbol('ISecretariaRepository');
export const DEPARTAMENTO_REPOSITORY = Symbol('IDepartamentoRepository');
