import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { INestApplication } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AllExceptionsFilter } from 'Filters/all-exceptions.filter';


async function bootstrap() {

  const app: INestApplication = await NestFactory.create(AppModule);

    //app.useGlobalFilters(new AllExceptionsFilter()) de-comment when in dev

    const corsOptions: CorsOptions = {
      origin: ['http://localhost:3001', 'https://erduio-frontend.vercel.app'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      allowedHeaders: 'Content-Type,Authorization'
    }
    app.enableCors(corsOptions)


    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, 
      enableDebugMessages: true,
      skipNullProperties: true,
      skipUndefinedProperties: false,
      forbidNonWhitelisted: false, 
      transform: true, 
      disableErrorMessages: true,
      validationError: {target: false, value: false},
      stopAtFirstError: true
    }))
    

    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "connect-src": ["'self'", "https://*.supabase.co"],
        }
      }
    }))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
