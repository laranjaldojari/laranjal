import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AcaoPermissao } from '@prisma/client';
import { RequirePermission } from '@shared/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '@shared/decorators/current-user.decorator';
import { WorkflowService } from '../application/workflow.service';

class StepInput {
  @ApiProperty() @IsInt() ordem!: number;
  @ApiProperty() @IsString() @MinLength(2) nome!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() roleId?: string;
}
class DefinirDto {
  @ApiProperty() @IsString() chave!: string;
  @ApiProperty() @IsString() nome!: string;
  @ApiProperty({ type: [StepInput] }) @IsArray() @ValidateNested({ each: true }) @Type(() => StepInput) steps!: StepInput[];
}
class IniciarDto {
  @ApiProperty() @IsString() chave!: string;
  @ApiProperty() @IsString() recurso!: string;
  @ApiProperty() @IsString() recursoId!: string;
}
class DecisaoDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() comentario?: string;
}

@ApiTags('Workflow')
@ApiBearerAuth()
@Controller('workflow')
export class WorkflowController {
  constructor(private readonly service: WorkflowService) {}

  @Post('definicoes')
  @RequirePermission('admin.workflow', AcaoPermissao.ADMINISTRAR)
  @ApiOperation({ summary: 'Cria/atualiza a definição de um fluxo e suas etapas' })
  definir(@Body() dto: DefinirDto) { return this.service.definir(dto.chave, dto.nome, dto.steps); }

  @Post('instancias')
  @ApiOperation({ summary: 'Inicia a tramitação de um recurso em um fluxo' })
  iniciar(@Body() dto: IniciarDto) { return this.service.iniciar(dto.chave, dto.recurso, dto.recursoId); }

  @Get('minhas-tarefas')
  @ApiOperation({ summary: 'Tramitações aguardando aprovação do usuário' })
  minhasTarefas(@CurrentUser() u: AuthenticatedUser) { return this.service.minhasTarefas(u.id); }

  @Get('instancias/:id')
  detalhe(@Param('id') id: string) { return this.service.detalhe(id); }

  @Post('instancias/:id/aprovar')
  aprovar(@Param('id') id: string, @Body() dto: DecisaoDto, @CurrentUser() u: AuthenticatedUser) {
    return this.service.aprovar(id, u, dto.comentario);
  }

  @Post('instancias/:id/reprovar')
  reprovar(@Param('id') id: string, @Body() dto: DecisaoDto, @CurrentUser() u: AuthenticatedUser) {
    return this.service.reprovar(id, u, dto.comentario);
  }
}
