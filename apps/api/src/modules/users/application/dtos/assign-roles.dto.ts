import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({ type: [String], description: 'IDs dos papéis a atribuir ao usuário' })
  @IsArray() @IsString({ each: true })
  roleIds!: string[];
}
