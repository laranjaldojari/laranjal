import { Inject, Injectable } from '@nestjs/common';
import { IPermissionRepository, PERMISSION_REPOSITORY } from '../../domain/repositories/permission.repository';

@Injectable()
export class PermissionsService {
  constructor(@Inject(PERMISSION_REPOSITORY) private readonly permissions: IPermissionRepository) {}
  async catalogo() {
    const itens = await this.permissions.listar();
    // Agrupa por recurso para facilitar a matriz de permissões no front.
    const porRecurso: Record<string, { id: string; acao: string; descricao: string | null }[]> = {};
    for (const p of itens) (porRecurso[p.recurso] ??= []).push({ id: p.id, acao: p.acao, descricao: p.descricao });
    return { itens, porRecurso };
  }
}
