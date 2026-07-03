import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IWorkflowRepository, StepDef, DefinicaoResumo, InstanciaDetalhe, InstanciaResumo } from '../domain/repositories/workflow.repository';

@Injectable()
export class WorkflowPrismaRepository implements IWorkflowRepository {
  constructor(private prisma: PrismaService) {}

  async upsertDefinicao(chave: string, nome: string, steps: StepDef[]) {
    const def = await this.prisma.workflowDefinition.upsert({
      where: { chave }, update: { nome }, create: { chave, nome }, select: { id: true },
    });
    // Redefine as etapas do fluxo de forma idempotente.
    await this.prisma.workflowStep.deleteMany({ where: { definitionId: def.id } });
    await this.prisma.workflowStep.createMany({
      data: steps.map((s) => ({ definitionId: def.id, ordem: s.ordem, nome: s.nome, roleId: s.roleId ?? null })),
    });
    return def;
  }

  async definicaoPorChave(chave: string): Promise<DefinicaoResumo | null> {
    const d = await this.prisma.workflowDefinition.findUnique({ where: { chave }, include: { steps: { orderBy: { ordem: 'asc' } } } });
    if (!d) return null;
    return { id: d.id, chave: d.chave, nome: d.nome, steps: d.steps.map((s: any) => ({ ordem: s.ordem, nome: s.nome, roleId: s.roleId })) };
  }

  criarInstancia(definitionId: string, recurso: string, recursoId: string) {
    return this.prisma.workflowInstance.create({ data: { definitionId, recurso, recursoId }, select: { id: true } });
  }

  async instancia(id: string): Promise<InstanciaDetalhe | null> {
    const i = await this.prisma.workflowInstance.findUnique({
      where: { id },
      include: { definition: { include: { steps: { orderBy: { ordem: 'asc' } } } }, transicoes: { orderBy: { createdAt: 'asc' } } },
    });
    if (!i) return null;
    return {
      id: i.definition.id, chave: i.definition.chave, nome: i.definition.nome,
      steps: i.definition.steps.map((s: any) => ({ ordem: s.ordem, nome: s.nome, roleId: s.roleId })),
      instanceId: i.id, recurso: i.recurso, recursoId: i.recursoId, status: i.status, stepAtualOrdem: i.stepAtualOrdem,
      historico: i.transicoes.map((t: any) => ({ deOrdem: t.deOrdem, paraOrdem: t.paraOrdem, acao: t.acao, comentario: t.comentario, createdAt: t.createdAt })),
    };
  }

  async atualizarInstancia(id: string, dados: { stepAtualOrdem?: number; status?: string }) {
    await this.prisma.workflowInstance.update({ where: { id }, data: dados });
  }

  async registrarTransicao(d: Parameters<IWorkflowRepository['registrarTransicao']>[0]) {
    await this.prisma.workflowTransition.create({ data: d });
  }

  async pendentesParaPapeis(roleIds: string[]): Promise<InstanciaResumo[]> {
    const instancias = await this.prisma.workflowInstance.findMany({
      where: { status: 'EM_ANDAMENTO' },
      include: { definition: { include: { steps: true } } },
    });
    const resultado: InstanciaResumo[] = [];
    for (const i of instancias) {
      const step = i.definition.steps.find((s: any) => s.ordem === i.stepAtualOrdem);
      if (step?.roleId && roleIds.includes(step.roleId)) {
        resultado.push({ id: i.id, recurso: i.recurso, recursoId: i.recursoId, status: i.status, stepAtualOrdem: i.stepAtualOrdem, definitionId: i.definitionId, nomeFluxo: i.definition.nome, nomeStepAtual: step.nome });
      }
    }
    return resultado;
  }

  async aprovadoresDoStep(definitionId: string, ordem: number): Promise<string[]> {
    const step = await this.prisma.workflowStep.findFirst({ where: { definitionId, ordem }, select: { roleId: true } });
    if (!step?.roleId) return [];
    const vinculos = await this.prisma.userRole.findMany({ where: { roleId: step.roleId }, select: { userId: true } });
    return vinculos.map((v: any) => v.userId);
  }

  async papeisDoUsuario(userId: string): Promise<string[]> {
    const vinculos = await this.prisma.userRole.findMany({ where: { userId }, select: { roleId: true } });
    return vinculos.map((v: any) => v.roleId);
  }
}
