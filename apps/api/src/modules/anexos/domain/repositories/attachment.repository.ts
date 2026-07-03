export interface Anexo {
  id: string; recurso: string; recursoId: string; nome: string; chave: string;
  mimeType: string; tamanho: number; versao: number; createdAt: Date;
}
export interface IAttachmentRepository {
  registrar(d: { recurso: string; recursoId: string; nome: string; chave: string; mimeType: string; tamanho: number; versao: number; uploadPorId?: string }): Promise<Anexo>;
  listar(recurso: string, recursoId: string): Promise<Anexo[]>;
  buscarPorId(id: string): Promise<Anexo | null>;
  ultimaVersao(recurso: string, recursoId: string, nome: string): Promise<number>;
  removerLogicamente(id: string): Promise<void>;
}
export const ATTACHMENT_REPOSITORY = Symbol('IAttachmentRepository');
