import { Inject, Injectable } from '@nestjs/common';
import { INotificationRepository, NOTIFICATION_REPOSITORY } from '../domain/repositories/notification.repository';
import { NotificationsGateway } from '../presentation/notifications.gateway';

export type TipoNotificacao = 'INFO' | 'SUCESSO' | 'ALERTA' | 'ERRO' | 'TAREFA';

/**
 * Ponto único para notificar usuários. Outros módulos injetam este serviço e
 * chamam `notificar(...)`; persiste e empurra via WebSocket no mesmo passo.
 */
@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly repo: INotificationRepository,
    private readonly gateway: NotificationsGateway,
  ) {}

  async notificar(userId: string, dados: { titulo: string; mensagem: string; tipo?: TipoNotificacao; link?: string }) {
    const n = await this.repo.criar({ userId, tipo: dados.tipo ?? 'INFO', titulo: dados.titulo, mensagem: dados.mensagem, link: dados.link });
    this.gateway.emitirPara(userId, 'notificacao', n);
    return n;
  }

  listar(userId: string, apenasNaoLidas = false) { return this.repo.listar(userId, apenasNaoLidas); }
  contarNaoLidas(userId: string) { return this.repo.contarNaoLidas(userId); }
  marcarLida(id: string, userId: string) { return this.repo.marcarLida(id, userId); }
  marcarTodasLidas(userId: string) { return this.repo.marcarTodasLidas(userId); }
}
