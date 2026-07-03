import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IAttachmentRepository, Anexo } from '../domain/repositories/attachment.repository';

@Injectable()
export class AttachmentPrismaRepository implements IAttachmentRepository {
  constructor(private prisma: PrismaService) {}
  registrar(d: Parameters<IAttachmentRepository['registrar']>[0]) {
    return this.prisma.attachment.create({ data: d }) as unknown as Promise<Anexo>;
  }
  listar(recurso: string, recursoId: string) {
    return this.prisma.attachment.findMany({ where: { recurso, recursoId, deletedAt: null }, orderBy: { createdAt: 'desc' } }) as unknown as Promise<Anexo[]>;
  }
  buscarPorId(id: string) {
    return this.prisma.attachment.findFirst({ where: { id, deletedAt: null } }) as unknown as Promise<Anexo | null>;
  }
  async ultimaVersao(recurso: string, recursoId: string, nome: string) {
    const r = await this.prisma.attachment.findFirst({
      where: { recurso, recursoId, nome }, orderBy: { versao: 'desc' }, select: { versao: true },
    });
    return r?.versao ?? 0;
  }
  async removerLogicamente(id: string) {
    await this.prisma.attachment.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
