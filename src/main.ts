import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

import { configuration } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: ['freelancer.net.vn']
  });

  app.set('hostname','freelancer.net.vn');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { exposeDefaultValues: true },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(configuration().port || 4200, '0.0.0.0');
}
bootstrap();
