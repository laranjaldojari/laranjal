import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Armazenamento de objetos (S3/MinIO). Usado por anexos e exportações.
 * Centraliza credenciais e o bucket, permitindo trocar o provedor sem tocar
 * nos módulos que consomem arquivos.
 */
@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: ConfigService) {
    this.bucket = config.get<string>('storage.bucket') ?? 'ljari-arquivos';
    this.client = new S3Client({
      endpoint: config.get<string>('storage.endpoint'),
      region: 'us-east-1',
      forcePathStyle: true, // exigido pelo MinIO
      credentials: {
        accessKeyId: config.get<string>('storage.accessKey') ?? '',
        secretAccessKey: config.get<string>('storage.secretKey') ?? '',
      },
    });
  }

  async enviar(chave: string, corpo: Buffer, mimeType: string): Promise<void> {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: chave, Body: corpo, ContentType: mimeType }));
  }

  /** URL temporária de download (expira em segundos). */
  async urlDownload(chave: string, expiraEm = 300): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: chave }), { expiresIn: expiraEm });
  }

  async remover(chave: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: chave }));
  }
}
