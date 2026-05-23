import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const port = parseInt(process.env.API_PORT || '3001', 10);

  // Global prefix for all API routes
  app.setGlobalPrefix('v1');

  // Serve uploaded files at /v1/files/
  app.useStaticAssets(path.resolve(process.cwd(), 'uploads'), {
    prefix: '/v1/files/',
  });

  // Global validation pipe using class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // CORS — allow student and admin portals
  app.enableCors({
    origin: [
      process.env.STUDENT_PORTAL_URL || 'http://localhost:3000',
      process.env.ADMIN_PORTAL_URL || 'http://localhost:3002',
    ],
    credentials: true,
  });

  await app.listen(port);
  logger.log(`API running on http://localhost:${port}/v1`);
}

bootstrap();
