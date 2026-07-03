import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IWorkflowRepository, WORKFLOW_REPOSITORY, StepDef, InstanciaDetalhe } from '../domain/repositories/workflow.repository';
import { NotificationsService } from '@modules/notifications/application/notifications.service';
import { AuthenticatedUser } from '@shared/decorators/current-user.decorator';

@Injectable()
export class WorkflowService {
  constructor(
    @Inject(WORKFLOW_REPOSITORY) private readonly repo: IWorkflowRepository,
    private readonly notifications: NotificationsService,
  ) {}

  definir(chave: string, nome: string, steps: StepDef[]) {
    if (!steps?.length) throw new BadRequestException('Defina ao menos uma etapa');
    return this.repo.upsertDefinicao(chave, nome, steps);
  }

  async iniciar(chave: string, recurso: string, recursoId: string) {
    const def = await this.repo.definicaoPorChave(chave);
    if (!def) throw new NotFoundException(`Fluxo "${chave}" não encontrado`);
    const inst = await this.repo.criarInstancia(def.id, recurso, recursoId);
    await this.notificarAprovadores(def.id, 1, recurso);
    return inst;
  }

  async minhasTarefas(userId: string) {
    const roleIds = await this.repo.papeisDoUsuario(userId);
    if (!roleIds.length) return [];
    return this.repo.pendentesParaPapeis(roleIds);
  }

  detalhe(id: string) { return this.exigirInstancia(id); }

  async aprovar(id: string, usuario: AuthenticatedUser, comentario?: string) {
    const inst = await this.exigirInstancia(id, true);
    await this.autorizar(inst, usuario);
    const proximo = inst.steps.filter((s) => s.ordem > inst.stepAtualOrdem).sort((a, b) => a.ordem - b.ordem)[0];
    await this.repo.registrarTransicao({ instanceId: id, deOrdem: inst.stepAtualOrdem, paraOrdem: proximo?.ordem ?? null, acao: 'APROVAR', porId: usuario.id, comentario });
    if (proximo) {
      await this.repo.atualizarInstancia(id, { stepAtualOrdem: proximo.ordem });
      await this.notificarAprovadores(inst.id, proximo.ordem, inst.recurso);
    } else {
      await this.repo.atualizarInstancia(id, { status: 'APROVADO' });
    }
    return this.exigirInstancia(id);
  }

  async reprovar(id: string, usuario: AuthenticatedUser, comentario?: string) {
    const inst = await this.exigirInstancia(id, true);
    await this.autorizar(inst, usuario);
    await this.repo.registrarTransicao({ instanceId: id, deOrdem: inst.stepAtualOrdem, paraOrdem: null, acao: 'REPROVAR', porId: usuario.id, comentario });
    await this.repo.atualizarInstancia(id, { status: 'REPROVADO' });
    return this.exigirInstancia(id);
  }

  // ---- apoio ----
  private async exigirInstancia(id: string, emAndamento = false) {
    const inst = await this.repo.instancia(id);
    if (!inst) throw new NotFoundException('Tramitação não encontrada');
    if (emAndamento && inst.status !== 'EM_ANDAMENTO') throw new BadRequestException('Tramitação já encerrada');
    return inst;
  }

  private async autorizar(inst: InstanciaDetalhe, usuario: AuthenticatedUser) {
    if (usuario.permissoes?.includes('*:ADMINISTRAR')) return;
    const stepAtual = inst.steps.find((s) => s.ordem === inst.stepAtualOrdem);
    const roleIds = await this.repo.papeisDoUsuario(usuario.id);
    if (!stepAtual?.roleId || !roleIds.includes(stepAtual.roleId)) {
      throw new ForbiddenException('Você não é o responsável por aprovar esta etapa');
    }
  }

  private async notificarAprovadores(definitionId: string, ordem: number, recurso: string) {
    const ids = await this.repo.aprovadoresDoStep(definitionId, ordem);
    await Promise.all(ids.map((userId) =>
      this.notifications.notificar(userId, { tipo: 'TAREFA', titulo: 'Nova aprovação pendente', mensagem: `Há um item de "${recurso}" aguardando sua análise.` }),
    ));
  }
}
