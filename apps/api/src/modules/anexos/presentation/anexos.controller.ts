import { Controller, Delete, Get, Param, Post, Query, Req, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnexosService } from '../application/anexos.service';

const LIMITE_BYTES = 25 * 1024 * 1024; // 25 MB

@ApiTags('Anexos')
@ApiBearerAuth()
@Controller('anexos')
export class AnexosController {
  constructor(private readonly service: AnexosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista anexos de um recurso (recurso + recursoId)' })
  listar(@Query('recurso') recurso: string, @Query('recursoId') recursoId: string) {
    return this.service.listar(recurso, recursoId);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Envia um anexo vinculado a um recurso' })
  @UseInterceptors(FileInterceptor('arquivo', { limits: { fileSize: LIMITE_BYTES } }))
  enviar(
    @UploadedFile() arquivo: any,
    @Query('recurso') recurso: string,
    @Query('recursoId') recursoId: string,
    @Req() req: any,
  ) {
    if (!arquivo) throw new BadRequestException('Arquivo obrigatório no campo "arquivo"');
    return this.service.enviar(recurso, recursoId, arquivo, req.user?.id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Gera URL temporária de download do anexo' })
  download(@Param('id') id: string) { return this.service.urlDownload(id); }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove (logicamente) um anexo' })
  remover(@Param('id') id: string) { return this.service.remover(id); }
}
