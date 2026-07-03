import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Server, Socket } from 'socket.io';

/**
 * Empurra notificações em tempo real (RFT-3). Cada usuário entra numa "sala"
 * identificada pelo seu id; o serviço emite para essa sala.
 */
@WebSocketGateway({ cors: { origin: true }, namespace: '/notificacoes' })
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  constructor(private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async handleConnection(socket: Socket) {
    // Autentica pelo token no handshake; conexões sem token válido são recusadas.
    const token = socket.handshake.auth?.token ?? socket.handshake.query?.token;
    try {
      const payload: any = await this.jwt.verifyAsync(String(token), { secret: this.config.get('jwt.accessSecret') });
      socket.join(`user:${payload.sub}`);
    } catch {
      socket.disconnect(true);
    }
  }

  emitirPara(userId: string, evento: string, dados: unknown) {
    this.server?.to(`user:${userId}`).emit(evento, dados);
  }
}
