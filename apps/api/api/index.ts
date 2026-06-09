/**
 * Vercel Serverless Entry Point
 * All requests → NestJS Express adapter
 * Cached across warm invocations in the same container.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import type { IncomingMessage, ServerResponse } from 'http';

type ExpressHandler = (req: IncomingMessage, res: ServerResponse) => void;

let expressApp: ExpressHandler | null = null;

async function bootstrap(): Promise<ExpressHandler> {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL ?? 'http://localhost:3001',
      /\.vercel\.app$/,
      /humanmanual\.app$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();

  return app.getHttpAdapter().getInstance() as ExpressHandler;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!expressApp) {
    expressApp = await bootstrap();
  }
  expressApp(req, res);
}
