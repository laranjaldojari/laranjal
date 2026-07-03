import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'node:crypto';
import { authenticator } from 'otplib';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { PermissionsResolver } from '../permissions-resolver.service';
import { IRefreshTokenRepository, REFRESH_TOKEN_REPOSITORY } from '../../domain/repositories/refresh-token.repository';
import { LoginDto } from '../dtos/login.dto';

interface ContextoRequisicao { ip?: string; userAgent?: string }

@Injectable()
export class LoginUseCase {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private permissions: PermissionsResolver,
    @Inject(REFRESH_TOKEN_REPOSITORY) private refreshTokens: IRefreshTokenRepository,
  ) {}

  async executar(dto: LoginDto, ctx: ContextoRequisicao) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Mensagem genérica: nunca revelar se o e-mail existe (anti-enumeração)
    if (!user || !user.ativo || user.deletedAt) throw new UnauthorizedException('Credenciais inválidas');

    const senhaOk = await argon2.verify(user.senhaHash, dto.senha);
    if (!senhaOk) throw new UnauthorizedException('Credenciais inválidas');

    // MFA / 2FA (TOTP)
    if (user.mfaAtivo) {
      if (!dto.mfaToken) throw new UnauthorizedException('Código MFA obrigatório');
      const valido = authenticator.verify({ token: dto.mfaToken, secret: user.mfaSecret! });
      if (!valido) throw new UnauthorizedException('Código MFA inválido');
    }

    const permissoes = await this.permissions.resolverPara(user.id);
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, nome: user.nome, email: user.email, permissoes },
      { secret: this.config.get('jwt.accessSecret'), expiresIn: this.config.get('jwt.accessTtl') },
    );

    // Refresh token: gera valor aleatório, persiste apenas o hash
    const refreshRaw = crypto.randomBytes(48).toString('hex');
    const refreshHash = crypto.createHash('sha256').update(refreshRaw).digest('hex');
    const ttl = this.config.get<number>('jwt.refreshTtl')!;
    await this.refreshTokens.salvar({
      userId: user.id,
      tokenHash: refreshHash,
      expiraEm: new Date(Date.now() + ttl * 1000),
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });

    await this.prisma.user.update({ where: { id: user.id }, data: { ultimoLogin: new Date() } });
    await this.prisma.auditLog.create({
      data: { userId: user.id, acao: 'LOGIN', recurso: 'User', recursoId: user.id, ip: ctx.ip, userAgent: ctx.userAgent },
    });

    return { accessToken, refreshToken: refreshRaw, usuario: { id: user.id, nome: user.nome, email: user.email } };
  }
}
