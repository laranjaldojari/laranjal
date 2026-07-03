import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@shared/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from '@shared/decorators/current-user.decorator';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { LoginDto } from '../application/dtos/login.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } }) // anti força-bruta: 5 tentativas/min
  @Post('login')
  @ApiOperation({ summary: 'Autentica o usuário (SSO) e retorna tokens' })
  login(@Body() dto: LoginDto, @Req() req: any) {
    return this.loginUseCase.executar(dto, { ip: req.ip, userAgent: req.headers['user-agent'] });
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna o usuário autenticado e suas permissões efetivas' })
  me(@CurrentUser() usuario: AuthenticatedUser) {
    return usuario;
  }
}
