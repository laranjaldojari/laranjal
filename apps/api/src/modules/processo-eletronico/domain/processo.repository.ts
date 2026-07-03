export interface Pagina { skip: number; take: number; search?: string }
export interface Lista<T = any> { itens: T[]; total: number }

export interface IProcessoEletronicoRepository {
  abrir(d: any): Promise<{ id: string }>;
  listar(p: Pagina): Promise<Lista>;
  detalhar(id: string): Promise<any | null>;
  atualizarStatus(id: string, status: string, setorAtualId?: string): Promise<void>;
  registrarTramitacao(d: { processoId: string; deSetorId?: string | null; paraSetorId: string; despacho?: string; porId?: string }): Promise<void>;
  adicionarAto(d: { processoId: string; tipo: string; conteudo: string; autorId?: string }): Promise<{ id: string }>;
  buscarAto(atoId: string): Promise<any | null>;
  assinarAto(atoId: string, hash: string): Promise<void>;
  contarNoAno(ano: number): Promise<number>;
  usuariosDoSetor(setorId: string): Promise<string[]>;
}
export const PROCESSO_ELETRONICO_REPOSITORY = Symbol('IProcessoEletronicoRepository');
