// The rest of this codebase imports its own top-level folders as bare
// specifiers (e.g. 'rate-limit/general.limiter') relying on tsconfig's
// baseUrl, which only affects TypeScript's type-checker, not the emitted
// require() calls. Vercel transpiles this file's import tree at runtime
// without running our build script, so Node's own resolver needs to be
// told about the project root before AppModule (and everything it pulls
// in transitively) gets required below.
process.env.NODE_PATH = require('path').join(__dirname, '..');
require('module').Module._initPaths();

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

  app.useGlobalFilters(new AllExceptionsFilter());

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
  server(req, res);
}
