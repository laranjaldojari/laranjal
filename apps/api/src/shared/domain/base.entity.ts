/**
 * Contrato base de toda entidade de domínio da plataforma.
 * Reflete as convenções obrigatórias do schema (CUID + auditoria + soft delete).
 */
export abstract class BaseEntity {
  readonly id!: string;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;
  readonly deletedAt?: Date | null;
}
