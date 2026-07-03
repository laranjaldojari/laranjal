// Contratos de repositório do contexto de Compras. As entidades trafegam como
// objetos simples (a modelagem detalhada vive no schema Prisma); o que importa
// aqui é a fronteira: os serviços dependem destas interfaces, nunca do Prisma.

export interface Pagina { skip: number; take: number; search?: string }
export interface Lista<T = any> { itens: T[]; total: number }

export interface IFornecedorRepository {
  listar(p: Pagina): Promise<Lista>;
  buscarPorId(id: string): Promise<any | null>;
  criar(d: any): Promise<{ id: string }>;
  atualizar(id: string, d: any): Promise<void>;
  removerLogicamente(id: string): Promise<void>;
  cnpjExiste(cnpj: string, excetoId?: string): Promise<boolean>;
}

export interface ISolicitacaoRepository {
  listar(p: Pagina): Promise<Lista>;
  buscarPorId(id: string): Promise<any | null>;
  criar(d: any, itens: any[]): Promise<{ id: string }>;
  atualizarStatus(id: string, status: string): Promise<void>;
  removerLogicamente(id: string): Promise<void>;
  contarNoAno(ano: number): Promise<number>;
}

export interface IProcessoRepository {
  listar(p: Pagina): Promise<Lista>;
  buscarPorId(id: string): Promise<any | null>;
  criar(d: any): Promise<{ id: string }>;
  atualizar(id: string, d: any): Promise<void>;
  homologar(id: string, fornecedorVencedorId: string, valorHomologado: number): Promise<void>;
  removerLogicamente(id: string): Promise<void>;
  contarNoAno(ano: number): Promise<number>;
}

export interface IContratoRepository {
  listar(p: Pagina): Promise<Lista>;
  buscarPorId(id: string): Promise<any | null>;
  criar(d: any): Promise<{ id: string }>;
  atualizar(id: string, d: any): Promise<void>;
  adicionarAditivo(contratoId: string, d: any): Promise<void>;
  removerLogicamente(id: string): Promise<void>;
  contarNoAno(ano: number): Promise<number>;
}

export const FORNECEDOR_REPOSITORY = Symbol('IFornecedorRepository');
export const SOLICITACAO_REPOSITORY = Symbol('ISolicitacaoRepository');
export const PROCESSO_REPOSITORY = Symbol('IProcessoRepository');
export const CONTRATO_REPOSITORY = Symbol('IContratoRepository');
