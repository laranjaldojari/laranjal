import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class AbrirProcessoDto {
  @ApiProperty() @IsString() @MinLength(3) assunto!: string;
  @ApiProperty() @IsString() @MinLength(2) tipo!: string;
  @ApiProperty() @IsString() @MinLength(2) interessado!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descricao?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() setorAtualId?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() sigiloso?: boolean;
}
export class TramitarDto {
  @ApiProperty() @IsString() paraSetorId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() despacho?: string;
}
export class AtoDto {
  @ApiProperty({ enum: ['DESPACHO', 'PARECER'] }) @IsIn(['DESPACHO', 'PARECER']) tipo!: string;
  @ApiProperty() @IsString() @MinLength(3) conteudo!: string;
}
