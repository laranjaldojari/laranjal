import { UserEntity } from '../entities/user.entity';

export interface UserComPapeis extends UserEntity {
  roles: { roleId: string; nome: string }[];
  secretaria?: { id: string; nome: string } | null;
}

export interface IUserRepository {
  criar(dados: { nome: string; email: string; cpf: string; senhaHash: string; secretariaId?: string; departamentoId?: string }): Promise<UserEntity>;
  atualizar(id: string, dados: Partial<{ nome: string; email: string; ativo: boolean; secretariaId: string | null; departamentoId: string | null }>): Promise<UserEntity>;
  removerLogicamente(id: string): Promise<void>;
  buscarPorId(id: string): Promise<UserComPapeis | null>;
  listar(opts: { skip: number; take: number; search?: string }): Promise<{ itens: UserComPapeis[]; total: number }>;
  definirPapeis(userId: string, roleIds: string[]): Promise<void>;
  emailExiste(email: string, excetoId?: string): Promise<boolean>;
  cpfExiste(cpf: string, excetoId?: string): Promise<boolean>;
}
export const USER_REPOSITORY = Symbol('IUserRepository');
