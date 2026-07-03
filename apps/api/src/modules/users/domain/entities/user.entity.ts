import { BaseEntity } from '@shared/domain/base.entity';

export class UserEntity extends BaseEntity {
  nome!: string;
  email!: string;
  cpf!: string;
  matricula?: string | null;
  ativo!: boolean;
  mfaAtivo!: boolean;
  secretariaId?: string | null;
  departamentoId?: string | null;
}
