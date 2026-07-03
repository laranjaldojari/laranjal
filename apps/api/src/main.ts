import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // ---- Segurança HTTP ----
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );
  app.enableCors({ origin: process.env.APP_URL?.split(','), credentials: true });

  // ---- Versionamento de API (/v1/...) ----
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // ---- Validação global (DTOs) ----
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // remove campos não declarados
      forbidNonWhitelisted: true, // rejeita payloads com campos extras
      transform: true,
    }),
  );

  // ---- Tratamento de erros padronizado ----
  app.useGlobalFilters(new HttpExceptionFilter());

  // ---- Swagger / OpenAPI ----
  const config = new DocumentBuilder()
    .setTitle('Plataforma Municipal — Laranjal do Jari')
    .setDescription('API REST do ERP municipal integrado')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.API_PORT ?? 3000);
}
bootstrap();
