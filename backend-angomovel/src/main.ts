import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefixo global para todas as rotas
  app.setGlobalPrefix('api/v1');

  // Validação global dos DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS — permite o frontend aceder ao backend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 AngoMovel Backend a correr em: http://localhost:${port}/api/v1`);
}

bootstrap();