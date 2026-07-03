export interface IRefreshTokenRepository {
  salvar(dados: {
    userId: string;
    tokenHash: string;
    expiraEm: Date;
    ip?: string;
    userAgent?: string;
    dispositivo?: string;
  }): Promise<void>;
  buscarPorHash(tokenHash: string): Promise<{ id: string; userId: string; revogadoEm: Date | null; expiraEm: Date } | null>;
  revogar(id: string): Promise<void>;
  revogarTodosDoUsuario(userId: string): Promise<void>;
}
export const REFRESH_TOKEN_REPOSITORY = Symbol('IRefreshTokenRepository');
