import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AcaoPermissao } from '@prisma/client';
import { RequirePermission } from '@shared/decorators/permissions.decorator';
import { PermissionsService } from '../application/services/permissions.service';

@ApiTags('Permissões')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Get() @RequirePermission('admin.permissoes', AcaoPermissao.VISUALIZAR)
  @ApiOperation({ summary: 'Catálogo de permissões (recurso × ação), agrupado por recurso' })
  catalogo() { return this.service.catalogo(); }
}
