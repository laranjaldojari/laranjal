import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, AuthenticatedUser } from '@shared/decorators/current-user.decorator';
import { NotificationsService } from '../application/notifications.service';

@ApiTags('Notificações')
@ApiBearerAuth()
@Controller('notificacoes')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista as notificações do usuário autenticado' })
  listar(@CurrentUser() u: AuthenticatedUser, @Query('naoLidas') naoLidas?: string) {
    return this.service.listar(u.id, naoLidas === 'true');
  }

  @Get('contador')
  @ApiOperation({ summary: 'Quantidade de notificações não lidas' })
  async contador(@CurrentUser() u: AuthenticatedUser) {
    return { naoLidas: await this.service.contarNaoLidas(u.id) };
  }

  @Patch(':id/lida')
  marcarLida(@Param('id') id: string, @CurrentUser() u: AuthenticatedUser) {
    return this.service.marcarLida(id, u.id);
  }

  @Patch('todas/lidas')
  marcarTodas(@CurrentUser() u: AuthenticatedUser) {
    return this.service.marcarTodasLidas(u.id);
  }
}
