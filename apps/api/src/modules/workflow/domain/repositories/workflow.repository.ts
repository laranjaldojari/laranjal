export interface StepDef { ordem: number; nome: string; roleId?: string | null }
export interface DefinicaoResumo { id: string; chave: string; nome: string; steps: StepDef[] }
export interface InstanciaResumo { id: string; recurso: string; recursoId: string; status: string; stepAtualOrdem: number; definitionId: string; nomeFluxo: string; nomeStepAtual: string }
export interface InstanciaDetalhe extends DefinicaoResumo {
  instanceId: string; recurso: string; recursoId: string; status: string; stepAtualOrdem: number;
  historico: { deOrdem: number; paraOrdem: number | null; acao: string; comentario: string | null; createdAt: Date }[];
}

export interface IWorkflowRepository {
  upsertDefinicao(chave: string, nome: string, steps: StepDef[]): Promise<{ id: string }>;
  definicaoPorChave(chave: string): Promise<DefinicaoResumo | null>;
  criarInstancia(definitionId: string, recurso: string, recursoId: string): Promise<{ id: string }>;
  instancia(id: string): Promise<InstanciaDetalhe | null>;
  atualizarInstancia(id: string, dados: { stepAtualOrdem?: number; status?: string }): Promise<void>;
  registrarTransicao(d: { instanceId: string; deOrdem: number; paraOrdem: number | null; acao: string; porId?: string; comentario?: string }): Promise<void>;
  pendentesParaPapeis(roleIds: string[]): Promise<InstanciaResumo[]>;
  aprovadoresDoStep(definitionId: string, ordem: number): Promise<string[]>;
  papeisDoUsuario(userId: string): Promise<string[]>;
}
export const WORKFLOW_REPOSITORY = Symbol('IWorkflowRepository');
