import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSecretariaDto {
  @ApiProperty() @IsString() @MinLength(3) nome!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(12) sigla!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() responsavel?: string;
}
export class UpdateSecretariaDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(3) nome?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(12) sigla?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() responsavel?: string;
}
export class CreateDepartamentoDto {
  @ApiProperty() @IsString() @MinLength(3) nome!: string;
  @ApiProperty() @IsString() secretariaId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() paiId?: string;
}
export class UpdateDepartamentoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(3) nome?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() paiId?: string | null;
}
