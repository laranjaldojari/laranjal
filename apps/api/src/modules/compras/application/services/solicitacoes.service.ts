import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISolicitacaoRepository, SOLICITACAO_REPOSITORY } from '../../domain/compras.repositories';
import { CreateSolicitacaoDto } from '../dtos/compras.dto';
import { NotificationsService } from '@modules/notifications/application/notifications.service';
import { formatarNumero } from './numeracao';

@Injectable()
export class SolicitacoesService {
  constructor(
    @Inject(SOLICITACAO_REPOSITORY) private readonly repo: ISolicitacaoRepository,
    private readonly notifications: NotificationsService,
  ) {}

  listar(page: number, perPage: number, search?: string) {
    return this.repo.listar({ skip: (page - 1) * perPage, take: perPage, search }).then((r) => ({
      itens: r.itens, meta: { page, perPage, total: r.total, totalPaginas: Math.ceil(r.total / perPage) },
    }));
  }
  async detalhar(id: string) {
    const s = await this.repo.buscarPorId(id);
    if (!s) throw new NotFoundException('Solicitação não encontrada');
    return s;
  }
  async criar(dto: CreateSolicitacaoDto, solicitanteId?: string) {
    const ano = new Date().getFullYear();
    const numero = formatarNumero(ano, (await this.repo.contarNoAno(ano)) + 1);
    const valorEstimado = dto.itens.reduce((s, i) => s + i.quantidade * (i.valorUnitario ?? 0), 0);
    return this.repo.criar(
      { numero, objeto: dto.objeto, justificativa: dto.justificativa, secretariaId: dto.secretariaId, solicitanteId, valorEstimado },
      dto.itens,
    );
  }

  async enviarParaAprovacao(id: string) {
    const s = await this.detalhar(id);
    if (s.status !== 'RASCUNHO') throw new BadRequestException('Só é possível enviar solicitações em rascunho');
    await this.repo.atualizarStatus(id, 'EM_APROVACAO');
    return this.detalhar(id);
  }

  async aprovar(id: string) {
    const s = await this.exigirEmAprovacao(id);
    await this.repo.atualizarStatus(id, 'APROVADA');
    if (s.solicitanteId) await this.notifications.notificar(s.solicitanteId, { tipo: 'SUCESSO', titulo: 'Solicitação aprovada', mensagem: `Sua solicitação ${s.numero} foi aprovada.` });
    return this.detalhar(id);
  }

  async reprovar(id: string) {
    const s = await this.exigirEmAprovacao(id);
    await this.repo.atualizarStatus(id, 'REPROVADA');
    if (s.solicitanteId) await this.notifications.notificar(s.solicitanteId, { tipo: 'ALERTA', titulo: 'Solicitação reprovada', mensagem: `Sua solicitação ${s.numero} foi reprovada.` });
    return this.detalhar(id);
  }

  async remover(id: string) { await this.detalhar(id); await this.repo.removerLogicamente(id); }

  private async exigirEmAprovacao(id: string) {
    const s = await this.detalhar(id);
    if (s.status !== 'EM_APROVACAO') throw new BadRequestException('Solicitação não está em aprovação');
    return s;
  }
}
