import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { StorageService } from '@shared/infrastructure/storage/storage.service';
import { IAttachmentRepository, ATTACHMENT_REPOSITORY } from '../domain/repositories/attachment.repository';

@Injectable()
export class AnexosService {
  constructor(
    @Inject(ATTACHMENT_REPOSITORY) private readonly repo: IAttachmentRepository,
    private readonly storage: StorageService,
  ) {}

  async enviar(recurso: string, recursoId: string, arquivo: { originalname: string; buffer: Buffer; mimetype: string; size: number }, userId?: string) {
    // Versiona: se já existe anexo com o mesmo nome, incrementa a versão.
    const versao = (await this.repo.ultimaVersao(recurso, recursoId, arquivo.originalname)) + 1;
    const chave = `${recurso}/${recursoId}/${crypto.randomUUID()}-${arquivo.originalname}`;
    await this.storage.enviar(chave, arquivo.buffer, arquivo.mimetype);
    return this.repo.registrar({
      recurso, recursoId, nome: arquivo.originalname, chave,
      mimeType: arquivo.mimetype, tamanho: arquivo.size, versao, uploadPorId: userId,
    });
  }

  listar(recurso: string, recursoId: string) { return this.repo.listar(recurso, recursoId); }

  async urlDownload(id: string) {
    const anexo = await this.repo.buscarPorId(id);
    if (!anexo) throw new NotFoundException('Anexo não encontrado');
    return { url: await this.storage.urlDownload(anexo.chave), nome: anexo.nome };
  }

  async remover(id: string) {
    const anexo = await this.repo.buscarPorId(id);
    if (!anexo) throw new NotFoundException('Anexo não encontrado');
    await this.repo.removerLogicamente(id);
    await this.storage.remover(anexo.chave).catch(() => undefined); // objeto órfão é tolerável
  }
}
