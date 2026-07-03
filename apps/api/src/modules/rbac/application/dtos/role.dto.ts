import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty() @IsString() @MinLength(3) nome!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descricao?: string;
}
export class UpdateRoleDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(3) nome?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() descricao?: string;
}
export class SetPermissionsDto {
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) permissionIds!: string[];
}
