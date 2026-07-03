import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IPermissionRepository } from '../domain/repositories/permission.repository';

@Injectable()
export class PermissionPrismaRepository implements IPermissionRepository {
  constructor(private prisma: PrismaService) {}
  async listar() {
    return this.prisma.permission.findMany({ orderBy: [{ recurso: 'asc' }, { acao: 'asc' }] });
  }
}
