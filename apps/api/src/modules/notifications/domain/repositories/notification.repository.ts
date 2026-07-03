export interface Notificacao {
  id: string; userId: string; tipo: string; titulo: string; mensagem: string;
  link: string | null; lidaEm: Date | null; createdAt: Date;
}
export interface INotificationRepository {
  criar(d: { userId: string; tipo: string; titulo: string; mensagem: string; link?: string }): Promise<Notificacao>;
  listar(userId: string, apenasNaoLidas: boolean): Promise<Notificacao[]>;
  contarNaoLidas(userId: string): Promise<number>;
  marcarLida(id: string, userId: string): Promise<void>;
  marcarTodasLidas(userId: string): Promise<void>;
}
export const NOTIFICATION_REPOSITORY = Symbol('INotificationRepository');
