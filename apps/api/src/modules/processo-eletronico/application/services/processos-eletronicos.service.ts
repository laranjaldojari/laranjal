import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { IProcessoEletronicoRepository, PROCESSO_ELETRONICO_REPOSITORY } from '../../domain/processo.repository';
import { AbrirProcessoDto, TramitarDto, AtoDto } from '../dtos/processo.dto';
import { NotificationsService } from '@modules/notifications/application/notifications.service';
import { AuthenticatedUser } from '@shared/decorators/current-user.decorator';

@Injectable()
export class ProcessosEletronicosService {
  constructor(
    @Inject(PROCESSO_ELETRONICO_REPOSITORY) private readonly repo: IProcessoEletronicoRepository,
    private readonly notifications: NotificationsService,
  ) {}

  listar(page: number, perPage: number, search?: string) {
    return this.repo.listar({ skip: (page - 1) * perPage, take: perPage, search }).then((r) => ({
      itens: r.itens, meta: { page, perPage, total: r.total, totalPaginas: Math.ceil(r.total / perPage) },
    }));
  }

  async detalhar(id: string) {
    const p = await this.repo.detalhar(id);
    if (!p) throw new NotFoundException('Processo não encontrado');
    return p;
  }

  async abrir(dto: AbrirProcessoDto, userId?: string) {
    const ano = new Date().getFullYear();
    const seq = (await this.repo.contarNoAno(ano)) + 1;
    const numero = `PROC-${ano}/${String(seq).padStart(6, '0')}`;
    return this.repo.abrir({
      numero, assunto: dto.assunto, tipo: dto.tipo, interessado: dto.interessado,
      descricao: dto.descricao, sigiloso: dto.sigiloso ?? false, setorAtualId: dto.setorAtualId, aberturaPorId: userId,
    });
  }

  async tramitar(id: string, dto: TramitarDto, userId?: string) {
    const p = await this.detalhar(id);
    if (p.status === 'ARQUIVADO' || p.status === 'CONCLUIDO') throw new BadRequestException('Processo encerrado não pode tramitar');
    if (p.setorAtualId === dto.paraSetorId) throw new BadRequestException('O processo já está neste setor');
    await this.repo.registrarTramitacao({ processoId: id, deSetorId: p.setorAtualId, paraSetorId: dto.paraSetorId, despacho: dto.despacho, porId: userId });
    await this.repo.atualizarStatus(id, 'EM_TRAMITACAO', dto.paraSetorId);
    // Notifica os servidores do setor de destino.
    const destinatarios = await this.repo.usuariosDoSetor(dto.paraSetorId);
    await Promise.all(destinatarios.map((uid) =>
      this.notifications.notificar(uid, { tipo: 'TAREFA', titulo: 'Processo recebido', mensagem: `O processo ${p.numero} chegou ao seu setor.` }),
    ));
    return this.detalhar(id);
  }

  async adicionarAto(id: string, dto: AtoDto, userId?: string) {
    await this.detalhar(id);
    await this.repo.adicionarAto({ processoId: id, tipo: dto.tipo, conteudo: dto.conteudo, autorId: userId });
    return this.detalhar(id);
  }

  async assinarAto(atoId: string, usuario: AuthenticatedUser) {
    const ato = await this.repo.buscarAto(atoId);
    if (!ato) throw new NotFoundException('Ato não encontrado');
    if (ato.assinadoEm) throw new BadRequestException('Ato já assinado');
    // Assinatura de base: hash do conteúdo + signatário + carimbo de tempo.
    // (Produção: substituir por assinatura ICP-Brasil/gov.br sobre o documento.)
    const carimbo = new Date().toISOString();
    const hash = crypto.createHash('sha256').update(`${ato.conteudo}|${usuario.id}|${carimbo}`).digest('hex');
    await this.repo.assinarAto(atoId, hash);
    return { atoId, assinadoEm: carimbo, assinaturaHash: hash };
  }

  async atualizarStatus(id: string, status: string) {
    await this.detalhar(id);
    await this.repo.atualizarStatus(id, status);
    return this.detalhar(id);
  }
}
