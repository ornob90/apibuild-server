/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { SuccessResponseInterceptor } from './interceptors/success-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new SuccessResponseInterceptor());
  app.setGlobalPrefix('v1');
  await app.listen(process.env.PORT ?? 8080);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
