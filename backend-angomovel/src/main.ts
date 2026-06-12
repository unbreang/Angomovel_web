import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';  // 👈

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());  // 👈 primeiro, antes de tudo

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 AngoMovel Backend a correr em: http://localhost:${port}/api/v1`);
}

bootstrap();