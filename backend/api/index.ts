import '../src/instrument'
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import type { Request, Response } from 'express';
import express from 'express';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../Filters/all-exceptions.filter';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const server = express();
let bootstrapped: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  //app.useGlobalFilters(new AllExceptionsFilter()); de-comment when in dev

  const corsOptions: CorsOptions = {
    origin: ['http://localhost:3001', 'https://erduio-frontend.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
  };
  app.enableCors(corsOptions);


  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    enableDebugMessages: true,
    skipNullProperties: true,
    skipUndefinedProperties: false,
    forbidNonWhitelisted: false,
    transform: true,
    disableErrorMessages: true,
    validationError: { target: false, value: false },
    stopAtFirstError: true,
  }));


  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "connect-src": ["'self'", "https://*.supabase.co"],
      },
    },
  }));


  await app.init();
}


export default async function handler(req: Request, res: Response) {
  if (!bootstrapped) {
    bootstrapped = bootstrap();
  }
  await bootstrapped;
  if (!req.socket) {
    (req as any).socket = (req as any).connection ?? {};
  }
  server(req, res);
}
