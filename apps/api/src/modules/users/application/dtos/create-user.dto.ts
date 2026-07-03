import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty() @IsString() @MinLength(3)
  nome!: string;

  @ApiProperty() @IsEmail()
  email!: string;

  @ApiProperty() @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 dígitos' })
  cpf!: string;

  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8)
  senha!: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString()
  secretariaId?: string;
}
