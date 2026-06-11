import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors();
  const uploadDir = process.env.UPLOAD_DIR ?? './uploads';
  app.useStaticAssets(join(process.cwd(), uploadDir), { prefix: '/uploads/' });
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Background Noise API: http://localhost:${port}/api/v1`);
}
bootstrap();
