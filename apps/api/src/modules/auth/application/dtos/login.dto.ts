import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty() @IsEmail()
  email!: string;

  @ApiProperty() @IsString() @MinLength(8)
  senha!: string;

  @ApiProperty({ required: false, description: 'Código TOTP de 6 dígitos (se MFA ativo)' })
  @IsOptional() @IsString()
  mfaToken?: string;
}
