export interface Papel { roleId: string; nome: string }
export interface Usuario {
  id: string; nome: string; email: string; cpf: string; ativo: boolean;
  roles: Papel[]; secretaria?: { id: string; nome: string } | null; createdAt: string;
}
export interface PaginacaoMeta { page: number; perPage: number; total: number; totalPaginas: number }
export interface ListaUsuarios { itens: Usuario[]; meta: PaginacaoMeta }

export interface Role {
  id: string; nome: string; descricao: string | null; sistema: boolean;
  permissoes: string[]; qtdUsuarios: number;
}
export interface Permissao { id: string; recurso: string; acao: string; descricao: string | null }
export interface Catalogo { itens: Permissao[]; porRecurso: Record<string, { id: string; acao: string; descricao: string | null }[]> }

export interface Secretaria { id: string; nome: string; sigla: string; responsavel: string | null; qtdDepartamentos: number; qtdUsuarios: number }
export interface DepartamentoNo { id: string; nome: string; secretariaId: string; paiId: string | null; filhos: DepartamentoNo[] }
