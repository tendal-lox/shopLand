import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformationInterceptor } from './interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformationInterceptor());
  app.enableCors(); // <- enable CORS
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }),
  );
  app.use(cookieParser())
  await app.listen(3000);
}
bootstrap();
