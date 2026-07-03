import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString, Matches, Min, MinLength, ValidateNested,
} from 'class-validator';

export const MODALIDADES = ['PREGAO', 'CONCORRENCIA', 'CONCURSO', 'LEILAO', 'DIALOGO_COMPETITIVO', 'DISPENSA', 'INEXIGIBILIDADE'] as const;
export const SITUACOES_CONTRATO = ['VIGENTE', 'ENCERRADO', 'RESCINDIDO', 'SUSPENSO'] as const;

// ---- Fornecedor ----
export class CreateFornecedorDto {
  @ApiProperty() @IsString() @MinLength(2) razaoSocial!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nomeFantasia?: string;
  @ApiProperty() @Matches(/^\d{14}$/, { message: 'CNPJ deve conter 14 dígitos' }) cnpj!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telefone?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() regularFiscal?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsDateString() regularValidade?: string;
}
export class UpdateFornecedorDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) razaoSocial?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nomeFantasia?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() telefone?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() regularFiscal?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsDateString() regularValidade?: string;
}

// ---- Solicitação ----
export class SolicitacaoItemDto {
  @ApiProperty() @IsString() @MinLength(2) descricao!: string;
  @ApiProperty() @IsString() unidade!: string;
  @ApiProperty() @IsNumber() @Min(0) quantidade!: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) valorUnitario?: number;
}
export class CreateSolicitacaoDto {
  @ApiProperty() @IsString() @MinLength(3) objeto!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() justificativa?: string;
  @ApiProperty() @IsString() secretariaId!: string;
  @ApiProperty({ type: [SolicitacaoItemDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => SolicitacaoItemDto) itens!: SolicitacaoItemDto[];
}

// ---- Processo ----
export class CreateProcessoDto {
  @ApiProperty() @IsString() @MinLength(3) objeto!: string;
  @ApiProperty({ enum: MODALIDADES }) @IsIn(MODALIDADES as unknown as string[]) modalidade!: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorEstimado?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() solicitacaoId?: string;
}
export class HomologarDto {
  @ApiProperty() @IsString() fornecedorVencedorId!: string;
  @ApiProperty() @IsNumber() @Min(0) valorHomologado!: number;
}

// ---- Contrato ----
export class CreateContratoDto {
  @ApiProperty() @IsString() @MinLength(3) objeto!: string;
  @ApiProperty() @IsString() fornecedorId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() processoId?: string;
  @ApiProperty() @IsNumber() @Min(0) valor!: number;
  @ApiProperty() @IsDateString() dataInicio!: string;
  @ApiProperty() @IsDateString() dataFim!: string;
}
export class AditivoDto {
  @ApiProperty() @IsIn(['PRAZO', 'VALOR', 'PRAZO_VALOR']) tipo!: string;
  @ApiProperty() @IsString() @MinLength(3) descricao!: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() valorAcrescimo?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() novaDataFim?: string;
}
